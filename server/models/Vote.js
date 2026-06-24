const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  election: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true,
  },
  userHash: {
    type: String,
    required: true,
  },
  candidateId: {
    type: String,
    required: true,
  },
  receiptToken: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  questionId: {
    type: String,
  },
});

voteSchema.index({ election: 1, userHash: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
