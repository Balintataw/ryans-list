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
	  listings.content
  FROM
	  categories
  LEFT JOIN
	  listings ON categories.id = listings.category_id
  WHERE categories.slug LIKE '${cat}'
  `
  var data = {
    descriptions: [],
    contents: []
  }
  conn.query(sql, (err, results, fields) => {
    results.map(result => {
      data.descriptions.push(result.description)
      data.contents.push(result.content)
    })
    res.render('category', data)
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
router.post('/createpost' , upload.single('picture'), (req, res, next) => {
  console.log(req.body)
  console.log(req.file)
  const post = {
    description: req.body.description,
    content: req.body.content,
    category_id: 1,             //make this dynamic
    image_path: req.file.path
  }
  
})


module.exports = router;


// app.post('/declining', (req, res, next) => {
//   const person = {
//       picture: req.body.picture,
//       name: req.body.name,
//       cell: req.body.phone,
//       email: req.body.email
//   }
//   db.declined.push(person)
//   res.redirect('/')
// })