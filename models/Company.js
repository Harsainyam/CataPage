const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    logoUrl: { type: String, default: '' },
    description: { type: String, default: '', maxlength: 500 },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
