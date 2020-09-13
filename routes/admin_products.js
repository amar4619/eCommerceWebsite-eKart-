const express = require('express');
let router = express.Router();
// var bodyParser = require('body-parser');
var mkdirp = require("mkdirp")
var fs = require("fs-extra");
const path = require("path")
var resizeImg = require('resize-img')
var auth = require('../config/auth')
var isAdmin = auth.isAdmin;
var isFarmer = auth.isFarmer;
rmdir = require('rimraf');


//get page model
let Category = require('../models/category')
let Product = require('../models/product');
let Farmer = require('../models/farmer');

//const u = res.locals.user.username;
router.get('/', isFarmer, function (req, res) {
  //console.log(res.locals.user);
  var count;
  var c;
  Product.countDocuments(function (err, c) {
    count = c;
  })

  // console.log(res.locals.user.admin);

  let nor = res.locals.user.admin;


  if (nor == 2) {
    Product.find({
      username: res.locals.user.username
    }, function (err, products) {
      res.render('admin/products', {
        products: products,
        count: count,

      })
    })
  } else {
    Product.find(function (err, products) {
      res.render('admin/products', {
        products: products,
        count: count

      })
    })
  }
})


//add product
router.get('/add-product', isFarmer, function (req, res) {
  let title = "";
  let desc = "";
  let price = "";
  let user1 = res.locals.user.username;
  let nor = res.locals.user.admin;
  let qty = 0;

  Category.find(function (err, cats) {
    res.render('admin/add-product', {
      title: title,
      desc: desc,
      categories: cats,
      price: price,
      user1: user1,
      nor: nor,
      qty: qty,
    })
  })

})

//post add page
router.post('/add-product', function (req, res) {



  var imageFile = "";
  if (req.files == null) imageFile = "";
  else {
    imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : "";
  }
  req.checkBody('title', 'Title must have a value').notEmpty()
  req.checkBody('desc', 'Description must have a value').notEmpty()
  req.checkBody('price', 'Price must have a value').isDecimal()
  req.checkBody('qty', 'Quantity must have a value').isDecimal()
  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  let title = req.body.title;
  let slug = title.replace(/\s+/g, '-').toLowerCase();
  let desc = req.body.desc;
  let price = req.body.price;
  let category = req.body.category;
  let qty = req.body.qty;
  let u = req.body.user1;
  let nor = req.body.nor;



  // console.log(u + '##########');


  let errors = req.validationErrors();
  if (errors) {

    Category.find(function (err, cats) {
      res.render('admin/add-product', {
        errors: errors,
        title: title,
        desc: desc,
        categories: cats,
        price: price,
        qty: qty,
        user1: u,
        nor: nor,
        user: u
      })
    })
  } else {
    Farmer.findOne({
      username: u
    }, function (err, foundList) {
      if (!err) {
        if (!foundList) {
          //   console.log("Doesn't exist!");
          const list = new Farmer({
            username: u,
          })
          list.save();
        } else {
          // console.log("Exist");
        }
      }
    })

    Product.findOne({
      slug: slug
    }, function (err, page) {
      if (page) {
        req.flash('danger', 'Product  title exists, choose another..')
        Category.find(function (err, cats) {
          res.render('admin/add-product', {
            title: title,
            desc: desc,
            categories: cats,
            price: price,
            user1: u,
            nor: nor,
            user: u,
            qty: qty,
          })
        })
      } else {

        let price2 = parseFloat(price).toFixed(2);
        let product = new Product({
          title: title,
          slug: slug,
          desc: desc,
          price: price2,
          category: category,
          image: imageFile,
          username: u,
          qty: qty,
        });
        product.save(function (error) {

          if (error) console.log(error);




          // mkdirp('public/product_images/' + product._id ).then(made =>
          //   console.log(`1made directories, starting with ${made}`))



          let dir = 'public/product_images/' + product._id;
          fs.ensureDir(dir, err => {
            console.log(err) // => null
            // dir has now been created, including the directory it is to be placed in
          })





          dir = 'public/product_images/' + product._id + '/gallery'

          fs.ensureDir(dir, err => {
            console.log(err) // => null
            // dir has now been created, including the directory it is to be placed in
          })

          dir = 'public/product_images/' + product._id + '/gallery/thumbs'

          fs.ensureDir(dir, err => {
            console.log(err) // => null
            // dir has now been created, including the directory it is to be placed in
          })

          if (imageFile != "") {
            let productImage = req.files.image;
            let path = 'public/product_images/' + product._id + '/' + imageFile;
            // console.log(productImage);
            mvv(path, productImage)
          }
          req.flash('success', 'Product Added');
          res.redirect('/admin/products');
        })
      }
    })
  }
})


//Get a edit product
router.get('/edit-product/:id', isFarmer, function (req, res) {
  var errors;

  if (req.session.errors)
    errors = req.session.errors;

  req.session.errors = null;

  Category.find(function (err, cats) {

    Product.findById(req.params.id, function (err, p) {
      if (err) {
        console.log(err);
      } else {
        var galleryDir = 'public/product_images/' + p._id + '/gallery';
        var galleryImages = null;

        fs.readdir(galleryDir, function (err, files) {
          if (err) console.log("11" + err);

          else {
            galleryImages = files;

            res.render('admin/edit-product', {
              title: p.title,
              errors: errors,
              desc: p.desc,
              qty: p.qty,
              categories: cats,
              price: parseFloat(p.price).toFixed(2),
              category: p.category.replace(/\s+/g, '-').toLowerCase(),
              galleryImages: galleryImages,
              id: p._id,
              image: p.image,
            })
          }
        })
      }
    })
  })
})

//post edit page
router.post('/edit-product/:id', function (req, res) {
  var imageFile = "";
  if (req.files == null) imageFile = "";
  else {
    imageFile = typeof req.files.image !== 'undefined' ? req.files.image.name : "";
  }
  req.checkBody('title', 'Title must have a value').notEmpty()
  req.checkBody('desc', 'Description must have a value').notEmpty()
  req.checkBody('price', 'Price must have a value').isDecimal()

  //  req.checkBody('image', 'You must upload an image').isImage(imageFile);

  let title = req.body.title;
  let slug = title.replace(/\s+/g, '-').toLowerCase();
  let desc = req.body.desc;
  let price = req.body.price;
  let category = req.body.category;
  let id = req.params.id;
  let pimage = req.body.pimage;
  let qty = req.body.qty;


  let errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect('/admin/products/edit-product/' + id)
  } else {
    Product.findOne({
      slug: slug,
      _id: {
        '$ne': id
      }
    }, function (err, p) {
      if (err) console.log(err);
      if (p) {
        req.flash('danger', 'Product title exists ,choose another.');
        res.redirect('/admin/products/edit-product/' + id)
      } else {
        Product.findById(id, function (err, p) {
          if (err) {
            console.log(err);

          }

          p.title = title
          p.slug = slug;
          p.desc = desc;
          p.qty = qty;
          p.price = parseFloat(price).toFixed(2);
          p.category = category;
          if (imageFile != '') p.image = imageFile;

          p.save(function (err) {
            if (err) console.log(err);

            if (imageFile != '') {
              if (pimage != '') {
                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                  if (err) {
                    console.log(err);
                  }
                })
              }

              let productImage = req.files.image;
              let path = 'public/product_images/' + id + '/' + imageFile;
              // console.log(productImage);
              mvv(path, productImage)


            }
            req.flash('success', 'Product Added');
            res.redirect('/admin/products');
          })
        })
      }
    })
  }
})





//post gallery images

router.post("/product-gallery/:id", function (req, res) {

  let productImage = req.files.file;
  let id = req.params.id;
  let path = 'public/product_images/' + id + '/gallery/' + productImage.name;
  let thumbspath = 'public/product_images/' + id + '/gallery/thumbs/' + productImage.name;



  productImage.mv(path, function (err) {
    if (err) console.log(err);

    resizeImg(fs.readFileSync(path), {
      width: 100,
      height: 100
    }).then(function (buf) {

      fs.writeFileSync(thumbspath, buf);
    })

  })
  res.sendStatus(200)

  // res.redirect("/admin/products/edit-product/" + id)


})

//get delete image of gallery
router.get('/delete-image/:image', isFarmer, function (req, res) {

  var id = req.query.id;



  fs.remove('public/product_images/' + id + '/gallery/' + req.params.image, function (err) {
    if (err) {
      console.log(err);
    } else {


      fs.remove('public/product_images/' + id + '/gallery/thumbs/' + req.params.image, function (err) {
        if (err) {
          console.log(err);
        } else {
          req.flash('success', 'Image Deleted');
          res.redirect('/admin/products/edit-product/' + id)
        }
      })

    }
  })


})


//get delete page
router.get('/delete-product/:id', isFarmer, function (req, res) {
  let id = req.params.id;
  Product.findByIdAndRemove({
    _id: req.params.id
  }, function (err) {
    if (err) {
      console.log(err);
    } else {
     const pathToDir =path.join('public/product_images/',id)
 
 rmdir(pathToDir, function(error){
   if(!error){
    // console.log("hare bol");
     
   }
 });
  }
    req.flash('success', 'Removed a object');
    res.redirect('/admin/products');

  })
})


module.exports = router;

function mvv(path, p) {
  p.mv(path, function (err) {
    //console.log("error in mv");
    return console.log(err);

  })

}


