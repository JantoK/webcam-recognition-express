var express = require('express');
var router = express.Router();
const sql = require('mssql');

router.get('/your',async (req, res) => {
  try {
    const result = await req.pool.request().query('SELECT * FROM dbo.测试表');
    console.log('result: ', result);
    res.json(result)
  } catch (err) {
    console.error('Error retrieving data from database:', err);
    res.status(500).send('Error retrieving data from database');
  }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
