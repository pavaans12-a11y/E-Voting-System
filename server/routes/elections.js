const express = require('express');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const {
      title,
      description,
      instanceType,
      startTime,
      endTime,
      nominationDeadline,
      eligibleVoters,
      questions,
    } = req.body;

    const election = await Election.create({
      title,
      description,
      instanceType,
      startTime,
      endTime,
      nominationDeadline,
      eligibleVoters,
      questions,
      createdBy: req.user._id,
    });

    await AuditLog.create({
      action: 'ELECTION_CREATED',
      actor: req.user._id,
      election: election._id,
      description: `Election "${title}" created by ${req.user.name}`,
      metadata: { instanceType },
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      data: election,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};

    if (req.query.instanceType) {
      query.instanceType = req.query.instanceType;
    }

    const elections = await Election.find(query)
      .populate('candidates', 'name email photo')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: elections,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('candidates', 'name email photo')
      .populate('eligibleVoters', 'name email')
      .populate('createdBy', 'name email');

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    res.json({
      success: true,
      data: election,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    if (election.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify election after it has started',
      });
    }

    const {
      title,
      description,
      instanceType,
      startTime,
      endTime,
      nominationDeadline,
      eligibleVoters,
      questions,
    } = req.body;

    if (title) election.title = title;
    if (description) election.description = description;
    if (instanceType) election.instanceType = instanceType;
    if (startTime) election.startTime = startTime;
    if (endTime) election.endTime = endTime;
    if (nominationDeadline) election.nominationDeadline = nominationDeadline;
    if (eligibleVoters) election.eligibleVoters = eligibleVoters;
    if (questions) election.questions = questions;

    await election.save();

    await AuditLog.create({
      action: 'ELECTION_UPDATED',
      actor: req.user._id,
      election: election._id,
      description: `Election "${election.title}" updated by ${req.user.name}`,
      ip: req.ip,
    });

    res.json({
      success: true,
      data: election,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/start', protect, authorize('admin'), async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    if (election.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Election can only be started from pending status',
      });
    }

    election.status = 'active';
    await election.save();

    await AuditLog.create({
      action: 'ELECTION_STARTED',
      actor: req.user._id,
      election: election._id,
      description: `Election "${election.title}" started by ${req.user.name}`,
      ip: req.ip,
    });

    res.json({
      success: true,
      data: election,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/end', protect, authorize('admin'), async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    if (election.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active elections can be ended',
      });
    }

    election.status = 'completed';
    await election.save();

    await AuditLog.create({
      action: 'ELECTION_ENDED',
      actor: req.user._id,
      election: election._id,
      description: `Election "${election.title}" ended by ${req.user.name}`,
      ip: req.ip,
    });

    res.json({
      success: true,
      data: election,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/candidates', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { userId } = req.body
    const election = await Election.findById(req.params.id)
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' })
    }
    if (election.candidates.includes(userId)) {
      return res.status(400).json({ success: false, message: 'User is already a candidate' })
    }
    election.candidates.push(userId)
    await election.save()
    await AuditLog.create({
      action: 'CANDIDATE_ADDED',
      actor: req.user._id,
      election: election._id,
      description: `Candidate added to "${election.title}"`,
      ip: req.ip,
    })
    res.json({ success: true, data: election })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id/candidates/:userId', protect, authorize('admin'), async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id)
    if (!election) {
      return res.status(404).json({ success: false, message: 'Election not found' })
    }
    election.candidates.pull(req.params.userId)
    await election.save()
    await AuditLog.create({
      action: 'CANDIDATE_REMOVED',
      actor: req.user._id,
      election: election._id,
      description: `Candidate removed from "${election.title}"`,
      ip: req.ip,
    })
    res.json({ success: true, data: election })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({
        success: false,
        message: 'Election not found',
      });
    }

    election.status = 'cancelled';
    await election.save();

    await AuditLog.create({
      action: 'ELECTION_CANCELLED',
      actor: req.user._id,
      election: election._id,
      description: `Election "${election.title}" cancelled by ${req.user.name}`,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Election cancelled successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
