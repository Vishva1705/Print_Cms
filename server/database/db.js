// src/utils/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  // host: process.env.DB_HOST,
  // user: process.env.DB_USER,
  // password: process.env.DB_PASSWORD,
  // database: process.env.DB_NAME,
  // connectionLimit: 10

  host: '192.168.90.31',
  user: 'root',
  password: 'MySQL123',
  database: 'test',
  connectionLimit: 10
});

pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release(); // Release the connection
  })
  .catch(error => {
    console.error('Error connecting to database:', error.message);
  });

module.exports = pool;
