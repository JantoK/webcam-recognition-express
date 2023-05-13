const sql = require('mssql')
require('dotenv').config();
const ENV = process.env

const config = {
  server: ENV.SQL_SERVER_IP,
  user: ENV.SQL_SERVER_USER,
  password: ENV.SQL_SERVER_PASSWORD,
  database: ENV.SQL_SERVER_DATABASE,
  options: {
    encrypt: true,
    cryptoCredentialsDetails: {
        minVersion: 'TLSv1' // 设置最小支持版本为 TLS 1.0
    },
    trustServerCertificate: true,
    connectionLimit: 10, // 设置最大连接数
    workstationId: ENV.SQL_SERVER_WORKSTATIONID // 指定客户端的主机名，绕过开发机win7版本问题，正式环境去掉
  }
}

const pool = new sql.ConnectionPool(config, err => {
  if (err) {
    console.error(err);
    return;
  }}
);
pool.connect();

module.exports = (req, res, next) => {
  req.sql = sql;
  req.pool = pool;
  next();
}