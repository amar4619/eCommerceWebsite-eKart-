const express = require('express');
let router = express.Router();
var fs = require("fs-extra")

var Products = require('../models/product')
let Category = require('../models/category')


router.get('/', function (req, res) {

    //  console.log("came here");
    Products.find(function (err, page) {
        if (err) {
            console.log(err);
        } else {
            res.render('all_products', {
                title: 'All _Products',
                products: page,
            })
        }

    })
})

router.get('/:slug', function (req, res) {
    let slug = req.params.slug;

    Category.findOne({
        slug: slug
    }, function (err, page) {
        if (err) {
            console.log(err);
        } else if (!page) {
            res.redirect('/products')
        } else {
            Products.find({
                category: slug
            }, function (err, p) {
                res.render('all_products', {
                    title: page.title,
                    products: p,
                })
            })
        }

    })

})


//get details of a product
router.get('/:cslug/:pslug', function (req, res) {
    let cslug = req.params.cslug;
    let pslug = req.params.pslug;

    var galleryfiles = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Products.findOne({
        slug: pslug
    }, function (err, page) {
        if (err) {
            console.log(err);
        } else if (!page) {
            res.redirect('/products')
        } else {
            //  Products.find({category:slug},function(err,p) {
            let galleryPath = "public/product_images/" + page.id + "/gallery"

            fs.readdir(galleryPath, function (err, files) {
                if (err) {
                    console.log(err);

                } else {
                    galleryfiles = files;

                    res.render('product-details', {
                        title: page.title,
                        p: page,
                        galleryfiles: galleryfiles,
                        loggedIn: loggedIn
                    })
                }

            })

            // })
        }

    })

})



module.exports = router;