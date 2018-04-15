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
router.get('/categ/:category', (req, res, next) => {
  let cat = req.params.category
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
  WHERE categories.slug LIKE '${cat}'
  `
  var data = {
    listings: [ ]
  }
  conn.query(sql, (err, results, fields) => {
    results.map(result => {
      data.listings.push({desc: result.description, cont: result.content, img: result.image_filename, listing_id: result.id, price: result.list_price})
    })
    data.title = results[0].slug
    res.render('category', data)
  })
})
//get listing data
router.get('/listing/:listing/:id', (req, res, next) => {
  let listing = req.params.listing
  let current_id = req.params.id
  console.log(req.params)
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
    console.log(results)
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
    console.log(results)
    data.categories = results
    res.render('createpost', data)
  })
})

//create new post
router.post('/createpost' ,upload.single('picture'), (req, res, next) => {
  console.log(req.body)
  console.log(req.file)
  var reg = /([a-z/-]+)(\d+)/
  let name = req.body.radioname.slice(0, -1).match(reg)
    const description = req.body.desc
    const content = req.body.content
    const category_id = name[2]
    const image_filename = req.file.filename
    const price = req.body.price
  
    const sql = `
      INSERT INTO listings (description, category_id, content, image_filename, price) 
      VALUES (?, ?, ?, ?, ?)`
    //   INSERT INTO images (image_path, listing_id)
    //   VALUES
    // `
    conn.query(sql, [description, category_id, content, image_filename, price], (err, results, fields) => {
      res.redirect(`/listing/${description}`)
    })
})


module.exports = router;
