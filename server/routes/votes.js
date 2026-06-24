const express = require('express');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const { protect } = require('../middleware/auth');
const { encrypt } = require('../utils/encryption');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { electionId, candidateId, questionId } = req.body;

    if (!electionId || !candidateId) {
      return res.status(400).json({
        success: false,
        message: 'electionId and candidateId are required',
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    if (election.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This election is not currently active',
      });
    }

    const salt = Buffer.from(electionId).toString('base64');
    const userHash = crypto
      .createHash('sha256')
      .update(req.user._id.toString() + electionId + salt)
      .digest('hex');

    const existingVote = await Vote.findOne({
      election: electionId,
      userHash,
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted in this election',
      });
    }

    const encryptedCandidate = encrypt(candidateId);
    const encryptedData = JSON.stringify(encryptedCandidate);

    const receiptToken = uuidv4();

    const vote = await Vote.create({
      election: electionId,
      userHash,
      candidateId: encryptedData,
      receiptToken,
      questionId: questionId || null,
    });

    election.totalVotes += 1;
    await election.save();

    await AuditLog.create({
      action: 'VOTE_CAST',
      actor: req.user._id,
      election: electionId,
      description: `Vote cast in election "${election.title}"`,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: {
        message: 'Vote cast successfully',
        receiptToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/receipt/:token', protect, async (req, res, next) => {
  try {
    const vote = await Vote.findOne({ receiptToken: req.params.token });

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found',
      });
    }

    const election = await Election.findById(vote.election);

    const salt = Buffer.from(vote.election.toString()).toString('base64');
    const userHash = crypto
      .createHash('sha256')
      .update(req.user._id.toString() + vote.election.toString() + salt)
      .digest('hex');

    if (vote.userHash !== userHash) {
      return res.status(403).json({
        success: false,
        message: 'This receipt does not belong to you',
      });
    }

    res.json({
      success: true,
      data: {
        election: {
          _id: election._id,
          title: election.title,
        },
        timestamp: vote.timestamp,
        receiptToken: vote.receiptToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/turnout/:electionId', protect, async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.electionId);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    const totalVotes = await Vote.countDocuments({
      election: req.params.electionId,
    });

    const eligibleVoterCount = election.eligibleVoters
      ? election.eligibleVoters.length
      : 0;

    res.json({
      success: true,
      data: {
        electionId: election._id,
        title: election.title,
        totalVotes,
        eligibleVoters: eligibleVoterCount,
        turnoutPercentage:
          eligibleVoterCount > 0
            ? ((totalVotes / eligibleVoterCount) * 100).toFixed(2)
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/results/:electionId', protect, async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.electionId).populate(
      'candidates',
      'name email photo'
    );

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    if (election.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Results are only available after the election is completed',
      });
    }

    const votes = await Vote.find({ election: req.params.electionId });

    const candidateVoteCounts = {};
    for (const vote of votes) {
      try {
        const encryptedObj = JSON.parse(vote.candidateId);
        const { decrypt } = require('../utils/encryption');
        const decryptedCandidateId = decrypt(encryptedObj);
        candidateVoteCounts[decryptedCandidateId] =
          (candidateVoteCounts[decryptedCandidateId] || 0) + 1;
      } catch (parseError) {
        console.error('Failed to decrypt vote:', parseError.message);
      }
    }

    const results = election.candidates.map((candidate) => ({
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        photo: candidate.photo,
      },
      votes: candidateVoteCounts[candidate._id.toString()] || 0,
    }));

    results.sort((a, b) => b.votes - a.votes);

    res.json({
      success: true,
      data: {
        election: {
          _id: election._id,
          title: election.title,
          instanceType: election.instanceType,
          totalVotes: election.totalVotes,
        },
        results,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/leaderboard', protect, async (req, res, next) => {
  try {
    const elections = await Election.find({ status: { $in: ['active', 'completed'] } })
      .populate('candidates', 'name email photo')
      .select('title status totalVotes eligibleVoters candidates')
      .sort({ createdAt: -1 })
      .limit(20)

    const data = await Promise.all(elections.map(async (e) => {
      const totalVotes = await Vote.countDocuments({ election: e._id })
      const eligibleCount = e.eligibleVoters ? e.eligibleVoters.length : 0
      return {
        _id: e._id,
        title: e.title,
        status: e.status,
        totalVotes,
        eligibleVoters: eligibleCount,
        turnoutPercent: eligibleCount > 0 ? ((totalVotes / eligibleCount) * 100).toFixed(1) : 0,
        candidates: e.candidates || [],
      }
    }))

    res.json({ success: true, data })
  } catch (error) {
    next(error)
  }
})

module.exports = router;
