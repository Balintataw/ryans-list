var express = require('express');
var router = express.Router();
var multer = require('multer')
var path = require('path')
const conn = require('../lib/conn')

/* GET home page. */
router.get('/', function(req, res, next) {
  const sql = `
    SELECT	
    title,
    parent_id,
    id
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
    
    console.log(data)
    res.render('home', data);
    // res.json(data)
  })
});

var upload = multer({
  dest: path.join(__dirname, 'public/uploads')
})
module.exports = router;
