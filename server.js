//Dot ENV
require('dotenv').config();
//Cross Origin Resource Sharing
var cors = require('cors');
//Express
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
//Routes
const auth = require('./routes/auth/authRoutes');
const protected = require('./routes/protected/protectedRoutes');
const unprotected = require('./routes/unprotected/unprotectedRoutes');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const dbString = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.0oischi.mongodb.net/sessionsDB`;
app.use(session({
    secret: process.env.SESSION_PASS,
    store: MongoStore.create({
        mongoUrl: dbString,
        ttl: 60 * 60 * 24 * 7, // 1 week
        autoRemove: 'native'
    }),
    resave: false,
    saveUninitialized: true,
    name: 'session',
}));

app.use('/auth', auth);
app.use('/api', protected);
app.use('/api', unprotected);

const port = process.env.PORT || 9000;

app.get('/', (req, res) => {
    res.render('./pages/index');
});

app.get('/login', (req, res) => {
    res.render('./pages/login');
});

app.get('/signup', (req, res) => {
    res.render('./pages/signup');
});

app.get('/user', (req, res) => {
    if (req.session.email) {
        res.render('./pages/user');
    }
    else {
        res.redirect('/login');
    }
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});