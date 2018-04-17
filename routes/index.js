var express = require('express');
var router = express.Router();
var path = require('path')
const conn = require('../lib/conn')
var multer = require('multer')
var upload = multer({
  dest: path.join(__dirname, '../public/uploads'),
  limits: {filesize: 1000000, files:1}
})

/* GET home page. */
router.get('/', function(req, res, next) {
  const sql = `
    SELECT	
    title,
    parent_id,
    id,
    slug
    FROM 
    categories
  `
  let data = {
    title: 'Home',
  }
  conn.query(sql, (err, results, fields) => {
    data.categories = results.filter(result => result.parent_id === null)
    data.categories.map(cat => {
      let subcat = results.filter(result => {
        if(cat.id === result.parent_id) {
          return result
        }
      })
      cat.subcats = subcat
    })
    res.render('home', data);
  })
});
//get category listings
router.get('/:slug/:view?', (req, res, next) => {
  console.log(req.params)
  let viewState = req.query[Object.keys(req.query)[0]]
  var dateReg = /\w+\s(\w+\s\d+)\s(\d+)\s([\d:]+)/
  const query = `SELECT id, title FROM categories WHERE slug = ?`
  conn.query(query, [req.params.slug], (err, results, fields) => {
    if(results.length > 0) {
      const id = results[0].id
      let sql = `
        SELECT 
          categories.title,
          categories.slug,
          listings.description,
          listings.content,
          listings.image_filename,
          listings.id,
          listings.list_price,
          listings.date_created
        FROM
          listings
        LEFT JOIN
          categories ON listings.category_id = categories.id
        WHERE listings.category_id = ${id} OR categories.parent_id = ${id}
      `
      // if (viewState === 'highest') {
      //   sql+='GROUP BY listings.list_price DESC'
      // } else if (viewState === 'lowest') {
      //   sql+='GROUP BY listings.list_price ASC'
      // } else if (viewState === 'recent') {
      //   sql+='GROUP BY listings.date_created DESC'
      // }
      var data = {
        listings: []
      }
      conn.query(sql, [id, id], (err2, results2, fields2) => {
        // console.log(results2)
        results2.map((result, i) => {
          result.date_created.toString().match(dateReg)
          listing = {
            desc: '',
            cont: '',
            listing_id: null,
            price: null,
            time: '',
            img: ''
          }
          if(result.image_filename) {listing.img = result.image_filename}
          if(result.date_created) {
            let dateString = result.date_created.toString().match(dateReg)
            listing.time = dateString[1]
          }
          console.log(viewState)
          listing.desc = result.description
          listing.cont = result.content
          listing.listing_id = result.id
          listing.price = result.list_price
          // listing.view = viewState || 'list'
          data.listings.push(listing)
        })
        data.view = viewState || 'gallery'
        console.log(data)
        res.render('category', data)
      })
    } else {
      next()    
    }
  })
    // data.title = req.params.title
    // if(viewState === 'gallery') {
    //   res.render('category', data)
    // } else if (viewState === 'list') {
    //   res.render('categoryListView', data)
    // } else if (viewState === 'thumb') {
    //   res.render('categoryThumbView', data)
    // } else {
    //   res.render('category', data)
    // }
  // })
})

router.get('/listing/:listing/:id', (req, res, next) => {
  let listing = req.params.listing
  let current_id = req.params.id
  let sql = `
  SELECT 
	  categories.title,
	  categories.slug,
	  listings.description,
    listings.content,
    listings.image_filename,
    listings.id,
    listings.list_price
  FROM
	  categories
  LEFT JOIN
	  listings ON categories.id = listings.category_id
  WHERE listings.id LIKE '${current_id}'
  `
  conn.query(sql, (err, results, fields) => {
    res.render('listing', results[0])
  })
})
//populate createpost
router.get('/createpost', (req, res, next) => {
  let sql = `
    SELECT *
    FROM categories
    WHERE parent_id > 0
  `
  let data = {
    categories: []
  }
  conn.query(sql, (err, results, fields) => {
    data.categories = results
    res.render('createpost', data)
  })
})

//create new post
router.post('/createpost' ,upload.single('picture'), (req, res, next) => {
  var reg = /([a-z/-]+)(\d+)/
  let name = req.body.radioname.slice(0, -1).match(reg)
    const description = req.body.desc
    const content = req.body.content
    const category_id = name[2]
    const image_filename = req.file ? req.file.filename : '' 
    const price = req.body.price
  
    const sql = `
      INSERT INTO listings (description, category_id, content, image_filename, list_price, date_created) 
      VALUES (?, ?, ?, ?, ?, NOW())`
    conn.query(sql, [description, category_id, content, image_filename, price], (err, results, fields) => {
      res.redirect(`/${name[1]}`)  //this needs fixing
    })
})


module.exports = router;

