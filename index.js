if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// packages
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan'); // logging
const ejsMate = require('ejs-mate'); // inserting templates into boilerplate
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoDBStore = require("connect-mongo");

// dependencies
const ExpressError = require('./utils/ExpressError');
const User = require('./models/User');
// routes require
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const userRoutes = require('./routes/users');

// mongoose
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelpcamp';
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, "DB Connection Error\n"))
db.once('open', () => {
    console.log('DB Connected');
});

// app set
const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_'
}));


const secret = process.env.SECRET || 'thisisasecret';
const store = new MongoDBStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", (e) => {
    console.log("SESSION STORE ERROR", e)
})
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/di2xvj7s1/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    console.log(req.query);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



// all routes
app.use('/', userRoutes);
app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/fakeuser', async(req, res) => {
    const user = new User({ email: 'caraj0503@gmail.com', username: 'chaitanya' });
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
});

// home page
app.get('/', (req, res) => {
    res.render('home');
});

// only for 404
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message)
        err.message = 'Something Went Wrong';
    res.status(statusCode).render('error', { err });

});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`On Port ${port}`);
});