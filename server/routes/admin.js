const express = require('express');
const User = require('../models/User');
const Election = require('../models/Election');
const Nomination = require('../models/Nomination');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/users', protect, authorize('admin'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/users/:id/role', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['voter', 'admin', 'auditor'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (voter, admin, auditor)',
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await AuditLog.create({
      action: 'USER_ROLE_CHANGED',
      actor: req.user._id,
      description: `User ${user.email} role changed from ${previousRole} to ${role} by ${req.user.name}`,
      metadata: { userId: user._id, previousRole, newRole: role },
      ip: req.ip,
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/audit-logs', protect, authorize('admin'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.electionId) {
      filter.election = req.query.electionId;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(filter)
      .populate('actor', 'name email')
      .populate('election', 'title')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', protect, authorize('admin'), async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalElections = await Election.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });
    const totalVotesResult = await Election.aggregate([
      { $group: { _id: null, total: { $sum: '$totalVotes' } } },
    ]);
    const totalVotes = totalVotesResult.length > 0 ? totalVotesResult[0].total : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalElections,
        activeElections,
        totalVotes,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/export/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id).populate('candidates', 'name email photo')
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' })
    }

    const votes = await Vote.find({ election: req.params.id })
    const { decrypt } = require('../utils/encryption')
    const candidateVoteCounts = {}
    for (const vote of votes) {
      try {
        const encryptedObj = JSON.parse(vote.candidateId)
        const decryptedId = decrypt(encryptedObj)
        candidateVoteCounts[decryptedId] = (candidateVoteCounts[decryptedId] || 0) + 1
      } catch (e) {}
    }

    const results = election.candidates.map(c => ({
      name: c.name,
      email: c.email,
      votes: candidateVoteCounts[c._id.toString()] || 0,
    }))
    results.sort((a, b) => b.votes - a.votes)

    const format = req.query.format || 'csv'

    if (format === 'csv') {
      let csv = 'Rank,Name,Email,Votes\n'
      results.forEach((r, i) => { csv += `${i + 1},"${r.name}","${r.email}",${r.votes}\n` })
      csv += `\nTotal Votes,,,${results.reduce((s, r) => s + r.votes, 0)}\n`
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${election.title.replace(/[^a-z0-9]/gi, '_')}_results.csv"`)
      return res.send(csv)
    }

    res.json({ success: true, data: { election: { title: election.title }, results } })
  } catch (error) {
    next(error)
  }
})

router.get('/nominations', protect, authorize('admin'), async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const nominations = await Nomination.find(filter)
      .populate('user', 'name email photo')
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

router.get('/recent-activity', protect, authorize('admin'), async (req, res, next) => {
  try {
    const excludedActions = ['OTP_SENT', 'OTP_RESENT', 'OTP_VERIFIED'];
    const logs = await AuditLog.find({ action: { $nin: excludedActions } })
      .populate('actor', 'name email')
      .populate('election', 'title')
      .sort({ timestamp: -1 })
      .limit(20);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const newUsersToday = await User.countDocuments({ createdAt: { $gte: today } });
    const newUsersWeek = await User.countDocuments({ createdAt: { $gte: weekAgo } });

    const electionsCreated = logs.filter(l => l.action === 'ELECTION_CREATED').length;

    res.json({
      success: true,
      data: {
        logs,
        summary: {
          newUsersToday,
          newUsersWeek,
          electionsCreated,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
