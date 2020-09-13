const express = require('express');
let router = express.Router();
var auth = require('../config/auth')
var isAdmin = auth.isAdmin;

let Category = require('../models/category');


router.get('/', isAdmin, function (req, res) {
  Category.find(function (err, cat) {
    if (err) console.log(err);

    res.render("admin/categories", {
      cat: cat
    });
  })

})

router.get('/add-category', isAdmin, function (req, res) {
  let title = "";



  res.render('admin/add-categories', {
    title: title,
  })
})

//Get a edit page
router.get('/edit-category/:id', isAdmin, function (req, res) {
  let id = req.params.id;

  Category.findById(id, function (err, page) {
    if (err) {
      console.log(err);
    }
    res.render('admin/edit-categories', {
      title: page.title,
      id: page._id,
    })
  })

})

//post edit page
router.post('/edit-category/:id', function (req, res) {
  req.checkBody('title', 'Title must have a value').notEmpty()
  let id = req.params.id;

  let title = req.body.title;
  let slug = title.replace(/\s+/g, '-').toLowerCase();


  let errors = req.validationErrors();
  if (errors) {

    res.render('admin/edit-categories', {
      errors: errors,
      title: title,
      id: id
    })
  } else {

    Category.findOne({
      slug: slug,
      _id: {
        $ne: id
      }
    }, function (err, page) {
      if (page) {
        req.flash('danger', 'Category slug exists, choose another..')
        res.render('admin/edit-categories', {
          title: title,
          id: req.params.id
        })
      } else {
        Category.findById({
          _id: id
        }, function (err, page) {

          page.title = title;

          page.save(function (error) {
            if (error) {
              console.log(error);
            } else {
              Category.find(function (err, cat) {
                if (err) {
                  console.log(err);
                } else {
                  req.app.locals.categories = cat;
                }


              })
              req.flash('success', 'Category edited');
              res.redirect('/admin/categories/edit-category/' + id);
            }
          })
        })

      }
    })
  }
})

//post add page
router.post('/add-category', function (req, res) {
  req.checkBody('title', 'Title must have a value').notEmpty()


  let title = req.body.title;
  let slug = title.replace(/\s+/g, '-').toLowerCase();
  let errors = req.validationErrors();
  if (errors) {

    res.render('admin/add-categories', {
      errors: errors,
      title: title,

    })
  } else {

    Category.findOne({
      slug: slug
    }, function (err, page) {
      if (page) {
        req.flash('danger', 'Category slug exists, choose another..')
        res.render('admin/add-categories', {
          title: title,
        })
      } else {
        let page = new Category({
          title: title,
          slug: slug,

        });
        page.save(function (error) {
          if (error) {
            console.log(error);
          } else {
            Category.find(function (err, cat) {
              if (err) {
                console.log(err);
              } else {
                req.app.locals.categories = cat;
              }


            })
            req.flash('success', 'Caegory Added');
            res.redirect('/admin/categories');
          }
        })
      }
    })
  }
})

router.post('/reorder-page', function (req, res) {
//  console.log("In--reorder");

  let ids = req.body.id;
  //console.log(ids);
  let count = 0;

  for (let i = 0; i < ids.length; i++) {
    let id = ids[i];
    count++;

    (function (count) {
      Page.findById(id, function (err, page) {
        page.sorting = count;
        page.save(function (err) {
          if (err) return console.log(err);

        })
      })
    })(count)

  }
  res.redirect("/admin/pages")

})

//get delete page
router.get('/delete-category/:id', isAdmin, function (req, res) {
  let id = req.params.id;
  Category.findByIdAndRemove(
    id,
    function (err) {
      if (err) {
        console.log(err);
      } else {
        Category.find(function (err, cat) {
          if (err) {
            console.log(err);
          } else {
            req.app.locals.categories = cat;
          }


        })
        req.flash('success', 'Removed a object');
        res.redirect('/admin/categories');
      }

    })
})


module.exports = router;