const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { requireAuth } = require('../middleware/auth');
const CatalogItem = require('../models/CatalogItem');
const Company = require('../models/Company');

const router = express.Router();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Turns a specs textarea (one "Label: Value" pair per line) into the specs array
function parseSpecs(raw) {
  if (!raw) return [];
  return raw
    .split('\n')
    .map((line) => line.split(':'))
    .filter((parts) => parts.length >= 2 && parts[0].trim())
    .map(([label, ...rest]) => ({ label: label.trim(), value: rest.join(':').trim() }));
}

function parseTags(raw) {
  if (!raw) return [];
  return [...new Set(raw.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))];
}

router.get('/dashboard', requireAuth, async (req, res) => {
  const items = await CatalogItem.find({ company: req.session.companyId })
    .sort({ createdAt: -1 })
    .lean();
  res.render('dashboard', { items });
});

router.get('/dashboard/new', requireAuth, (req, res) => {
  res.render('item-form', { item: null, error: null });
});

router.post('/dashboard/new', requireAuth, upload.single('media'), async (req, res) => {
  try {
    const { title, description, category, tags, price, specs } = req.body;

    if (!title || !description || !category || !req.file) {
      return res.render('item-form', {
        item: null,
        error: 'Title, description, category and a media file are all required.',
      });
    }

    await CatalogItem.create({
      company: req.session.companyId,
      title,
      description,
      category,
      tags: parseTags(tags),
      price,
      specs: parseSpecs(specs),
      mediaUrl: req.file.path,
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('item-form', { item: null, error: 'Something went wrong. Please try again.' });
  }
});

router.get('/dashboard/edit/:id', requireAuth, async (req, res) => {
  const item = await CatalogItem.findOne({ _id: req.params.id, company: req.session.companyId }).lean();
  if (!item) return res.status(404).render('404');
  res.render('item-form', { item, error: null });
});

router.post('/dashboard/edit/:id', requireAuth, upload.single('media'), async (req, res) => {
  try {
    const { title, description, category, tags, price, specs } = req.body;
    const update = {
      title,
      description,
      category,
      tags: parseTags(tags),
      price,
      specs: parseSpecs(specs),
    };
    if (req.file) {
      update.mediaUrl = req.file.path;
    }

    await CatalogItem.findOneAndUpdate({ _id: req.params.id, company: req.session.companyId }, update);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.redirect(`/dashboard/edit/${req.params.id}`);
  }
});

router.post('/dashboard/delete/:id', requireAuth, async (req, res) => {
  await CatalogItem.findOneAndDelete({ _id: req.params.id, company: req.session.companyId });
  res.redirect('/dashboard');
});

router.get('/dashboard/profile', requireAuth, async (req, res) => {
  const company = await Company.findById(req.session.companyId).lean();
  res.render('profile', { company, error: null, success: null });
});

router.post('/dashboard/profile', requireAuth, async (req, res) => {
  try {
    const { name, description, location, website } = req.body;
    await Company.findByIdAndUpdate(req.session.companyId, { name, description, location, website });
    req.session.companyName = name;
    const company = await Company.findById(req.session.companyId).lean();
    res.render('profile', { company, error: null, success: 'Profile updated.' });
  } catch (err) {
    console.error(err);
    const company = await Company.findById(req.session.companyId).lean();
    res.render('profile', { company, error: 'Something went wrong.', success: null });
  }
});

module.exports = router;
