const express = require('express');
const bcrypt = require('bcryptjs');
const Company = require('../models/Company');

const router = express.Router();

router.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, location, website, description } = req.body;

    if (!name || !email || !password) {
      return res.render('signup', { error: 'Name, email and password are required.' });
    }

    const existing = await Company.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.render('signup', { error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const company = await Company.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      location,
      website,
      description,
    });

    req.session.companyId = company._id.toString();
    req.session.companyName = company.name;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('signup', { error: 'Something went wrong. Please try again.' });
  }
});

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email: (email || '').toLowerCase() });

    if (!company) {
      return res.render('login', { error: 'No account found with that email.' });
    }

    const match = await bcrypt.compare(password, company.passwordHash);
    if (!match) {
      return res.render('login', { error: 'Incorrect password.' });
    }

    req.session.companyId = company._id.toString();
    req.session.companyName = company.name;
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Something went wrong. Please try again.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;
