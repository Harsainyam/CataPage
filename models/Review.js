const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    catalogItem: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem', required: true, index: true },
    authorName: { type: String, required: true, trim: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 600 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
