const express = require('express');
let router = express.Router();

var Product = require('../models/product')
router.get('/add/:product', function (req, res) {
    let tf = true;
    let slug = req.params.product;
    Product.findOne({
        slug: slug
    }, function (err, p) {
        if (err) {
            console.log(err);
        } else {
            if (typeof req.session.cart == 'undefined') {
                req.session.cart = [];
                if (p.qty <= 0) {
                    req.flash('danger', "😥 Stock not available");
                    tf = false;
                }else{
                req.session.cart.push({
                    title: p.title,
                    slug: slug,
                    qty: 1,
                    price: parseFloat(p.price).toFixed(2),
                    image: '/product_images/' + p._id + '/' + p.image
                })}
            } else {
                var cart = req.session.cart;
                var newItem = true;
                if (p.qty <= 0) {
                    req.flash('danger', "😥 Stock not available");
                    tf = false;
                }else{
                for (let i = 0; i < cart.length; i++) {
                    if (cart[i].slug == slug) {
                        cart[i].qty++;
                        newItem = false;
                        break;
                    }

                }
                if (newItem) {

                    cart.push({
                        title: p.title,
                        slug: slug,
                        qty: 1,
                        price: parseFloat(p.price).toFixed(2),
                        image: '/product_images/' + p._id + '/' + p.image
                    })

                }}
            }
        }
        //console.log(req.session.cart);
        if (tf)
            req.flash('success', '😃 Product added');
        res.redirect('back');

    })
})


//get checkout page

router.get('/checkout', function (req, res) {



    if (req.session.cart && req.session.cart.length == 0) {
        //console.log("in checkout");
        delete req.session.cart
        res.redirect('/cart/checkout')
    } else {
        var cart = req.session.cart
        if (cart != undefined) {
            for (let i = 0; i < cart.length; i++) {
                Product.findOne({
                    slug: cart[i].slug
                }, function (err, p) {
                   
                    if (p.qty <= 0) {

                        cart.splice(i, 1)
                        if (cart.length == 0) delete req.session.cart
                    }
                    res.render('checkout')
                })
            }

        }else{
            res.render('checkout')
        }
    }
})

router.get('/clear', function (req, res) {
    // console.log("in clear");
    delete req.session.cart
    res.redirect('/cart/checkout')
})


router.get('/update/:slug', function (req, res) {
    let tf = false;
    var task = req.query.action;
    var cart = req.session.cart
    var slug = req.params.slug;


    Product.findOne({
        slug: slug
    }, function (err, p) {
        let qty = p.qty;
        if (cart != 'undefined') {

            for (let i = 0; i < cart.length; i++) {
                if (cart[i].slug == slug) {
                    switch (task) {
                        case "add":
                            if (qty > cart[i].qty) {
                                cart[i].qty++;
                            } else {

                                tf = true;
                            }
                            break;
                        case "remove":
                            cart[i].qty--;
                            if (cart[i].qty < 1) cart.splice(i, 1);

                            break;
                        case "clear":
                            cart.splice(i, 1)
                            if (cart.length == 0) delete req.session.cart
                            break;
                        default:
                            console.log("sorry could not update");

                            break;
                    }
                    break;
                }
            }
            if (tf) {
                req.flash('danger', "😥 We don't have that quantity!! ")
                res.redirect('back')
            } else {
                req.flash('success', 'Product updated!')
                res.redirect('back')
            }
        }
    })
})

router.get('/buy', function (req, res) {
    var cart = req.session.cart

    if (cart != 'undefined') {


        for (let i = 0; i < cart.length; i++) {
            Product.findOne({
                slug: cart[i].slug
            }, function (err, p) {
                let qty = p.qty;
                if (p.qty > 0)
                    p.qty = qty - cart[i].qty;
                p.save(function (err) {
                    if (err) {
                        console.log(err);

                    }
                })
                delete req.session.cart
                res.render("thank", {
                    cart: cart
                });
            })
        }

    }
})
module.exports = router;