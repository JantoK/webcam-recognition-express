var express = require('express');
var router = express.Router();
const sql = require('mssql');

// 获取所有对象数据信息
router.get('/selectAll',async (req, res) => {
  try {
     // 查询数据
     req.pool.request().query('SELECT * FROM person', (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('服务器错误，请重试或联系管理员');
        return;
      }

      if (result.recordset.length === 0) {
        return res.json({ result: '查询结果为空', code: 204 });
      }
      // 处理数据
      const persons = result.recordset.map(person => ({
        id: person.id,
        name: person.name,
        img: person.img,
        description: person.description
      }));

      // 返回数据
      res.json({ result: persons, code: 200 });
    });
  } catch (err) {
    console.error('Error retrieving data from database:', err);
    res.status(500).send('Error retrieving data from database');
  }
});

// 新增用户信息
router.post('/add', (req, res) => {
    try {
        const { 
            name, 
            description, 
            department,
            approver,
            reason
        } = req.body;
        // 判断是路径型img还是binary型img_date

        if (!name  || !description || !department || !approver || !reason) {
            return res.json({ result: '参数不能为空', code: 400 });
        }
      
        // 插入数据并返回插入记录的id、name 和description
        const queryStr = `
          INSERT INTO check_in_application (name, description, department, approver, reason)
          OUTPUT INSERTED.id, INSERTED.name, INSERTED.description
          VALUES (@name, @description, @department, @approver, @reason)
        `;
        req.pool.request()
        .input('name', sql.NVarChar(50), name)
        .input('description', sql.NVarChar(sql.MAX), description)
        .input('department', sql.NVarChar(50), department)
        .input('approver', sql.NVarChar(10), approver)
        .input('reason', sql.NVarChar(10), reason)
        .query(queryStr, (err, result) => {
          if (err) {
            console.log(err);
            return res.json({ result: '添加失败', code: 500 });
          }
          const { id, name, img, description } = result.recordset[0];
          // 返回添加成功的记录
          res.json({
            result: { id, name, img, description },
            code: 200
          });
        });
    } catch (err) {
        console.error('Error updating data in database:', err);
        res.status(500).send('服务器错误，请重试或联系管理员');
    }
});

router.post('/addWithImg', async (req, res) => {
  const requiredFields = ['name', 'img', 'description', 'department', 'approver', 'reason'];
  if (requiredFields.every(field => req.body[field] != null && req.body[field].trim() !== '')) {
    try {
      const connection = await req.pool.acquire();
      const transaction = new sql.Transaction(connection)
      await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

      try {
        const addImgSql = `INSERT INTO person_img (img) OUTPUT INSERTED.id VALUES (@img);`;

        const addImgResult = await transaction.request()
          .input('img', sql.VarChar(sql.MAX), req.body['img'])
          .query(addImgSql);

        console.log('addImgResult: ', addImgResult);
        const imgId = addImgResult.recordset[0].id;

        const addPersonSql = `
          INSERT INTO check_in_application (name, img_id, description, department, approver, reason)
          OUTPUT INSERTED.id, INSERTED.name, INSERTED.description
          VALUES (@name, @img_id, @description, @department, @approver, @reason)
        `;

        const addPersonResult = await transaction
          .input('name', sql.NVarChar(50), req.body['name'])
          .input('description', sql.NVarChar(sql.MAX), req.body['description'])
          .input('department', sql.NVarChar(50), req.body['department'])
          .input('approver', sql.NVarChar(10), req.body['approver'])
          .input('reason', sql.NVarChar(500), req.body['reason'])
          .input('img_id', sql.Int, imgId)
          .query(addPersonSql);

        console.log('addPersonResult: ', addPersonResult);
        await transaction.commit();
        res.json({
          result: addPersonResult,
          code: 200
        });
      } catch (err) {
        console.error(err);
        await transaction.rollback();
        throw err;
      } finally {
        req.pool.release(transaction);
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
  } else {
    res.status(400).send('Missing required fields');
  }
});

router.post('/selectById', async (req, res) => {
  const { id } = req.body; // 获取传入的 id
  if (!id) {
    return res.json({ result: 'ID不能为空', code: 400 });
  }
  try {
    // 查询数据
    const data = await req.pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM person WHERE id = @id');

    // 处理数据
    if (data.recordset.length === 0) {
        return res.json({ result: '查询不到该ID结果', code: 204 });
    }

    const result = {
      id: data.recordset[0].id,
      name: data.recordset[0].name,
      img: data.recordset[0].img,
      description: data.recordset[0].description,
      checkIn: data.recordset[0].checkIn
    };

    // 返回数据
    res.json({ result, code: 200 });
  } catch (err) {
    console.error('Error retrieving data from database:', err);
    res.status(500).send('服务器错误，请重试或联系管理员');
}
});

router.post('/updateCheckIn', async (req, res) => {
    const { id } = req.body; // 获取传入的 id
    if (!id) {
      return res.json({ result: 'ID不能为空', code: 400 });
    }
  
    try {
      // 查询数据
      const data = await req.pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM person WHERE id = @id');
  
      // 处理数据
      if (data.recordset.length === 0) {
        return res.json({ result: '查询不到该ID结果', code: 204 });
      }
  
      // 判断该用户是否已登录
      if (data.recordset[0].checkIn === true) {
        return res.json({ result: '该用户已登记进入', code: 409 });
      }
  
      // 更新 checkIn 字段为 1
      const result = await req.pool.request()
        .input('id', sql.Int, id)
        .query('UPDATE person SET checkIn = 1 WHERE id = @id');
  
      if(result.rowsAffected[0] !== 1){
        // 更新条数不为1
        res.json({ result: '请将此订单记录并反馈管理员', code: 500 });
      }
      res.json({ result: '更新成功', code: 200 });
    } catch (err) {
      console.error('Error updating data in database:', err);
      res.status(500).send('服务器错误，请重试或联系管理员');
    }
  });

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
