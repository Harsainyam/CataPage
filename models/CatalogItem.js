const mongoose = require('mongoose');

const catalogItemSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 1000 },
    category: { type: String, required: true, trim: true, index: true },
    tags: { type: [String], default: [], index: true },
    mediaUrl: { type: String, required: true },
    price: { type: String, default: '' }, // free text: "On request", "$4,200", "$120/unit" etc.
    specs: [
      {
        label: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text index so search covers title, description, category and tags together
catalogItemSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });

module.exports = mongoose.model('CatalogItem', catalogItemSchema);
