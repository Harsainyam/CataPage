const express = require('express');
const CatalogItem = require('../models/CatalogItem');
const Review = require('../models/Review');

const router = express.Router();
const PAGE_SIZE = 6;

// Builds a Mongo filter from ?q= (free text), ?tag= (tag chip) and ?category=
function buildFilter(query) {
  const filter = {};
  if (query.q && query.q.trim()) {
    filter.$text = { $search: query.q.trim() };
  }
  if (query.tag && query.tag.trim()) {
    filter.tags = query.tag.trim().toLowerCase();
  }
  if (query.category && query.category.trim()) {
    filter.category = query.category.trim();
  }
  return filter;
}

// Home feed - renders the first page server-side, JS takes over for infinite scroll
router.get('/', async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const items = await CatalogItem.find(filter)
      .sort({ createdAt: -1 })
      .limit(PAGE_SIZE)
      .populate('company', 'name verified logoUrl')
      .lean();

    const topTags = await CatalogItem.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const categories = await CatalogItem.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.render('feed', {
      items,
      query: req.query.q || '',
      activeTag: req.query.tag || '',
      activeCategory: req.query.category || '',
      topTags: topTags.map((t) => t._id),
      categories: categories.map((c) => c._id),
      hasMore: items.length === PAGE_SIZE,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong loading the feed.');
  }
});

// JSON endpoint the client calls to load the next batch as the user scrolls
router.get('/api/items', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const filter = buildFilter(req.query);

    const items = await CatalogItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(PAGE_SIZE)
      .populate('company', 'name verified logoUrl')
      .lean();

    res.json({ items, hasMore: items.length === PAGE_SIZE });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load items' });
  }
});

// Item detail page with reviews
router.get('/item/:id', async (req, res) => {
  try {
    const item = await CatalogItem.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('company');

    if (!item) return res.status(404).render('404');

    const reviews = await Review.find({ catalogItem: item._id }).sort({ createdAt: -1 }).lean();
    const avgRating = reviews.length
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.render('item', { item, reviews, avgRating });
  } catch (err) {
    console.error(err);
    res.status(404).render('404');
  }
});

router.post('/item/:id/reviews', async (req, res) => {
  try {
    const { authorName, rating, comment } = req.body;
    if (!authorName || !rating || !comment) {
      return res.redirect(`/item/${req.params.id}`);
    }
    await Review.create({
      catalogItem: req.params.id,
      authorName,
      rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
      comment,
    });
    res.redirect(`/item/${req.params.id}#reviews`);
  } catch (err) {
    console.error(err);
    res.redirect(`/item/${req.params.id}`);
  }
});

module.exports = router;
