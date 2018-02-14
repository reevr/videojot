const express = require('express');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const app = express();
const ideasRouter = require('./routes/idea-routes');
const usersRouter = require('./routes/user-routes');
const passport = require('passport');

// Session
app.use(session({
    secret: 'keyboard',
    resave: true,
    saveUninitialized: true,
  }));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Flashh messages initialization
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user;
    next();
})

// Public directory
app.use(express.static(path.join(__dirname, 'public')));

// Passport config
require('./config/passport')(passport);

// Method override
app.use(methodOverride('_method'));

// Mongoose connection 
mongoose.connect('mongodb://localhost/videojot')
.then(() => {
    console.log('connected to mongodb');
})
.catch(err => console.log(err));

// App template engine settings
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Middleware
app.use(bodyParser.urlencoded({ urlencoded: false}));
app.use(bodyParser.json());


// Dashboard route
app.get('/', (req, res) => {
    res.render('index');
});

// About page route
app.get('/about', (req, res) => {
    res.render('about');
});


// Routers middleware
app.use('/ideas', ideasRouter);
app.use('/users', usersRouter);

// Listen to port
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server started and listening at port ${port}`);
});