const express = require('express');
const Nomination = require('../models/Nomination');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, async (req, res, next) => {
  try {
    const { electionId, statement, photo } = req.body;

    if (!electionId) {
      return res.status(400).json({
        success: false,
        message: 'Election ID is required',
      });
    }

    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    if (election.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Nominations are no longer being accepted for this election',
      });
    }

    if (
      election.nominationDeadline &&
      new Date() > new Date(election.nominationDeadline)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Nomination deadline has passed',
      });
    }

    const existingNomination = await Nomination.findOne({
      user: req.user._id,
      election: electionId,
    });

    if (existingNomination) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a nomination for this election',
      });
    }

    const nomination = await Nomination.create({
      user: req.user._id,
      election: electionId,
      statement,
      photo,
    });

    await AuditLog.create({
      action: 'NOMINATION_SUBMITTED',
      actor: req.user._id,
      election: electionId,
      description: `User ${req.user.name} submitted nomination for election "${election.title}"`,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: nomination,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/my', protect, async (req, res, next) => {
  try {
    const nominations = await Nomination.find({ user: req.user._id })
      .populate('election', 'title instanceType status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: nominations,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/election/:electionId', protect, authorize('admin'), async (req, res, next) => {
  try {
    const nominations = await Nomination.find({ election: req.params.electionId })
      .populate('user', 'name email photo')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: nominations,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/approve', protect, authorize('admin'), async (req, res, next) => {
  try {
    const nomination = await Nomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({
        success: false,
        message: 'Nomination not found',
      });
    }

    if (nomination.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Nomination has already been reviewed',
      });
    }

    nomination.status = 'approved';
    nomination.reviewedBy = req.user._id;
    nomination.reviewedAt = new Date();
    await nomination.save();

    await Election.findByIdAndUpdate(nomination.election, {
      $addToSet: { candidates: nomination.user },
    });

    const election = await Election.findById(nomination.election);

    await AuditLog.create({
      action: 'NOMINATION_APPROVED',
      actor: req.user._id,
      election: nomination.election,
      description: `Nomination approved for election "${election ? election.title : ''}"`,
      metadata: { userId: nomination.user.toString() },
      ip: req.ip,
    });

    res.json({
      success: true,
      data: nomination,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/reject', protect, authorize('admin'), async (req, res, next) => {
  try {
    const nomination = await Nomination.findById(req.params.id);

    if (!nomination) {
      return res.status(404).json({
        success: false,
        message: 'Nomination not found',
      });
    }

    if (nomination.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Nomination has already been reviewed',
      });
    }

    nomination.status = 'rejected';
    nomination.reviewedBy = req.user._id;
    nomination.reviewedAt = new Date();
    await nomination.save();

    const election = await Election.findById(nomination.election);

    await AuditLog.create({
      action: 'NOMINATION_REJECTED',
      actor: req.user._id,
      election: nomination.election,
      description: `Nomination rejected for election "${election ? election.title : ''}"`,
      metadata: { userId: nomination.user.toString() },
      ip: req.ip,
    });

    res.json({
      success: true,
      data: nomination,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
