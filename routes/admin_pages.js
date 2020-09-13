const express = require('express');
let router = express.Router();
var auth = require('../config/auth')
var isAdmin = auth.isAdmin;

let Page = require('../models/page');


router.get('/', isAdmin, function (req, res) {
  Page.find({}).sort({
    sorting: 1
  }).exec(function (err, pages) {
    res.render('admin/pages', {
      pages: pages
    })

  })
})

router.get('/add-page', isAdmin, function (req, res) {
  let title = "";
  let slug = "";
  let content = "";


  res.render('admin/add-pages', {
    title: title,
    slug: slug,
    content: content
  })
})

//Get a edit page
router.get('/edit-page/:id', isAdmin, function (req, res) {
  let id = req.params.id;
  Page.findById(id, function (err, page) {
    if (err) {
      console.log(err);
    }
    //console.log(page.content + "  " + page._id);

    res.render('admin/edit-page', {
      title: page.title,
      slug: page.slug,
      content: page.content,
      id: page._id,
    })
  })

})

//post edit page
router.post('/edit-page/:id', function (req, res) {
  req.checkBody('title', 'Title must have a value').notEmpty()
  req.checkBody('content', 'Content must have a value').notEmpty()

  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
  let id = req.params.id;

  if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();


  let content = req.body.content;
  let errors = req.validationErrors();
  if (errors) {

    res.render('admin/edit-page', {
      errors: errors,
      title: title,
      slug: slug,
      content: content,
      id: id
    })
  } else {

    Page.findOne({
      slug: slug,
      _id: {
        $ne: id
      }
    }, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another..')
        res.render('admin/edit-page', {
          title: title,
          slug: slug,
          content: content,
          _id: id
        })
      } else {
        Page.findById({
          _id: id
        }, function (err, page) {
         // console.log(page);

          page.title = title;
          page.content = content;
          page.slug = slug;
          page.save(function (error) {
            if (error) console.log(error);

            Page.find({}).sort({
              sorting: 1
            }).exec(function (err, pages) {
              if (err) console.log(err);
              else {
                req.app.locals.pages = pages;
              }

            })
            req.flash('success', 'Page edited');
            res.redirect('/admin/pages/edit-page/' + id);
          })
        })

      }
    })
  }
})

//post add page
router.post('/add-page', function (req, res) {
  req.checkBody('title', 'Title must have a value').notEmpty()
  req.checkBody('content', 'Content must have a value').notEmpty()

  let title = req.body.title;
  let slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();


  if (slug == '') slug = title.replace(/\s+/g, '-').toLowerCase();


  let content = req.body.content;
  let errors = req.validationErrors();
  if (errors) {

    res.render('admin/add-pages', {
      errors: errors,
      title: title,
      slug: slug,
      content: content
    })
  } else {

    Page.findOne({
      slug: slug
    }, function (err, page) {
      if (page) {
        req.flash('danger', 'Page slug exists, choose another..')
        res.render('admin/add-pages', {
          title: title,
          slug: slug,
          content: content
        })
      } else {
        let page = new Page({
          title: title,
          slug: slug,
          content: content,
          sorting: 100
        });
        page.save(function (error) {
          if (error) console.log(error);


          Page.find({}).sort({
            sorting: 1
          }).exec(function (err, pages) {
            if (err) console.log(err);
            else {
              req.app.locals.pages = pages;
            }

          })
          req.flash('success', 'Page Added');
          res.redirect('/admin/pages');
        })
      }
    })
  }
})

//reorder function

function sortPages(ids, callback) {
  let count = 0;

  for (let i = 0; i < ids.length; i++) {
    let id = ids[i];
    count++;

    (function (count) {
      Page.findById(id, function (err, page) {
        page.sorting = count;
        page.save(function (err) {
          if (err) return console.log(err);
          ++count;
          if (count >= ids.length) {
            callback();
          }
        })
      })
    })(count)

  }
}

router.post('/reorder-page', function (req, res) {
  // console.log(req.body);

  let ids = req.body.id;
  //console.log(ids);

  sortPages(ids, function () {


    Page.find({}).sort({
      sorting: 1
    }).exec(function (err, pages) {
      if (err) console.log(err);
      else {
        req.app.locals.pages = pages;
      }

    })


  })
  //res.redirect("/admin/pages")

})

//get delete page
router.get('/delete-page/:id', isAdmin, function (req, res) {

  Page.findByIdAndRemove({
    _id: req.params.id
  }, function (err) {
    if (err) {
      console.log(err);
    }

    Page.find({}).sort({
      sorting: 1
    }).exec(function (err, pages) {
      if (err) console.log(err);
      else {
        req.app.locals.pages = pages;
      }

    })
    req.flash('success', 'Removed a object');
    res.redirect('/admin/pages');

  })
})


module.exports = router;