function requireAuth(req, res, next) {
  if (!req.session.companyId) {
    return res.redirect('/login');
  }
  next();
}

// Makes the logged-in company id/name available in every view without
// passing it manually on every render call
function attachCompany(req, res, next) {
  res.locals.currentCompanyId = req.session.companyId || null;
  res.locals.currentCompanyName = req.session.companyName || null;
  next();
}

module.exports = { requireAuth, attachCompany };
