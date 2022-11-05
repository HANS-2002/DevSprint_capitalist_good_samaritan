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
const { SanityClient } = require('./routes/config');

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
    const postQuery = `*[_type == "post"] | order(_createdAt desc){_id, mainImage, _createdAt, title, body, author} `;
    SanityClient.fetch(postQuery).then(async (posts) => {
        const Posts = [];
        posts.forEach(post => {
            let imgString = post.mainImage.asset._ref.substring(6);
            imgString = imgString.slice(0, -4) + '.' + imgString.slice(-3);
            let imgUrl = 'https://cdn.sanity.io/images/aac64ffk/production/' + imgString;
            let monthDict = { 0: 'January', 1: 'February', 2: 'March', 3: 'April', 4: 'May', 5: 'June', 6: 'July', 7: 'August', 8: 'September', 9: 'October', 10: 'November', 11: 'December' };
            let date = new Date(post._createdAt);
            let dateStr = monthDict[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
            Posts.push({
                _id: post._id,
                imgUrl: imgUrl,
                postDate: dateStr,
                postTitle: post.title,
                postDescription: post.body,
            });
        });
        const userQuery = `*[_type == "user" && email == "${req.session.email}"]`;
        SanityClient.fetch(userQuery).then(async (user) => {
            if (user.length > 0) {
                let imgString = user[0].displayPicture.asset._ref.substring(6);
                imgString = imgString.slice(0, -4) + '.' + imgString.slice(-3);
                let imgUrl = 'https://cdn.sanity.io/images/aac64ffk/production/' + imgString;
                return res.render('./pages/index', { dpImgUrl: imgUrl, posts: Posts });
            }
            else {
                res.render('./pages/index', { dpImgUrl: null, posts: Posts });
            }
        });
    });
});

app.get('/login', (req, res) => {
    res.render('./pages/login');
});

app.get('/signup', (req, res) => {
    res.render('./pages/signup');
});

app.get('/user', (req, res) => {
    if (req.session.email) {
        const query = `*[_type == "user" && email == "${req.session.email}"]`;
        SanityClient.fetch(query).then(async (user) => {
            let monthDict = { 0: 'January', 1: 'February', 2: 'March', 3: 'April', 4: 'May', 5: 'June', 6: 'July', 7: 'August', 8: 'September', 9: 'October', 10: 'November', 11: 'December' };
            let date = new Date(user[0]._createdAt);
            let dateStr = monthDict[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
            let imgString = user[0].displayPicture.asset._ref.substring(6);
            imgString = imgString.slice(0, -4) + '.' + imgString.slice(-3);
            let imgUrl = 'https://cdn.sanity.io/images/aac64ffk/production/' + imgString;
            return res.render('./pages/user', { user: user[0].name, memberSince: dateStr, dpImgUrl: imgUrl });
        });
    }
    else {
        res.redirect('/login');
    }
});

app.post('/search', (req, res) => {
    const query = `*[_type == "tag" && name == "${req.body.search}"]{posts}[0].posts`;
    SanityClient.fetch(query).then(async (posts) => {
        console.log(posts);
    });
    return res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});