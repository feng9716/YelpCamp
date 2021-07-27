if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ExpressError = require('./util/ExpressError');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const MongoStore = require('connect-mongo');
// Deployment online cloud DB


const Joi = require('joi');

// Require all the routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(dbUrl, {
// mongoose.connect(dbUrl,{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

// To remove data, use:
app.use(mongoSanitize());

//Tell html to parse our request
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(methodOverride('_method'));

const secret = process.env.SECRET || 'thisshouldbeabettersecret';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: secret
    },
    touchAfter: 24 * 60 * 60
});

store.on('error', function(e){
    console.log("Session Store Error" ,e);
})

const sessionConfig = {
    store,
    name: "session",
    secret: secret,
    resave:false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        // secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Helmet
app.use(helmet({contentSecurityPolicy: false}));

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
    "https://cdn.jsdelivr.net"
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
                "https://res.cloudinary.com/ddqo49buw/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Flash middleware and currentUser
app.use(flash());
app.use((req,res,next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    
    next();
});



// Routers
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


app.get('/' ,(req,res) => {
    res.render('campgrounds/home.ejs');
});

app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404)); 
})

app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    // if(!err.message){
    //     err.message = "Oh no! Something went wrong"
    // }
    res.status(statusCode).render('error',{err});
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server on port ${port}`);
})

