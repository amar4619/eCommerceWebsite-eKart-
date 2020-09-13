var express = require('express')
var path = require('path');
var session = require('express-session')
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var expressValidator = require('express-validator');
var passport = require('passport')
//var cookieParser = require('cookie-parser')


const mongoose = require("mongoose");
const config = require('./config/database')


const app = express();
//app.use(cookieParser())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(fileUpload());

// var expressValidator = require('express-validator');
// app.use(expressValidator())

app.use(express.static(path.join(__dirname, 'public')));

//set global variable error
app.locals.errors = null;

//get page model
let Page = require('./models/page')

//Get all pages
Page.find({}).sort({
  sorting: 1
}).exec(function (err, pages) {
  if (err) console.log(err);
  else {
    app.locals.pages = pages;
  }

})


//get category
let Category = require('./models/category');

Category.find(function (err, cat) {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = cat;
  }


})


//moongooee
mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

//session

//validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  },
  customValidators: {
    isImage: function (value, filename) {

      var extension = (path.extname(filename)).toLowerCase();
      switch (extension) {
        case '.jpg':
          return '.jpg';
        case '.jpeg':
          return '.jpeg';
        case '.png':
          return '.png';
        default:
          return false;
      }
    }
  }
}));

//messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//passport confif
require('./config/passport')(passport);

//passport middleware
//app.set('trust proxy', 1) 
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  
}))

app.use(passport.initialize());
app.use(passport.session());

//set cart



app.get('*', function (req, res, next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
})

 

// set resource
let pages = require('./routes/pages.js')
let users = require('./routes/user.js')
let products = require('./routes/products.js')
let cart = require('./routes/cart.js')
let adminpages = require('./routes/admin_pages.js')
let adminCategory = require('./routes/admin_categories.js')
let adminProducts = require('./routes/admin_products.js')


app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);
app.use('/admin/pages', adminpages);
app.use('/admin/categories', adminCategory);
app.use('/admin/products', adminProducts);
app.use('/', pages);



const port = 5000;
app.listen(port, function () {
  console.log("@" + port);

})