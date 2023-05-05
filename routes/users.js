var express = require('express');
var router = express.Router();
const sql = require('mssql');

router.get('/your',async (req, res) => {
  try {
     // 查询数据
     req.pool.request().query('SELECT * FROM person', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error while querying database');
        return;
      }

      // 处理数据
      const persons = result.recordset.map(person => ({
        id: person.id,
        name: person.name,
        img: person.img,
        description: person.description
      }));

      // 返回数据
      res.json(persons);
    });
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
