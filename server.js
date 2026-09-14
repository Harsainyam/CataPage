require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');

const connectDB = require('./config/db');
const { attachCompany } = require('./middleware/auth');

const authRoutes = require('./routes/auth');
const catalogRoutes = require('./routes/catalog');
const companyRoutes = require('./routes/company');

const app = express();

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 14 }, // 2 weeks
  })
);

app.use(attachCompany);

app.use('/', authRoutes);
app.use('/', catalogRoutes);
app.use('/', companyRoutes);

app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Catalog Reels running on port ${PORT}`));
