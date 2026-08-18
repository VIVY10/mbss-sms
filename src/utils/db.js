// const db = require('../config/db.js');


// function query(sql, values = []) {
//   return new Promise((resolve, reject) => {
//     db.query(sql, values, (error, results) => {
//       if (error) return reject(error);
//       resolve(results);
//     });
//   });
// }


// function getConnection() {
//   return new Promise((resolve, reject) => {
//     db.getConnection((error, connection) => {
//       if (error) return reject(error);
//       resolve(connection);
//     });
//   });
// }

 
// function connectionQuery(connection, sql, values = []) {
//   return new Promise((resolve, reject) => {
//     connection.query(sql, values, (error, results) => {
//       if (error) return reject(error);
//       resolve(results);
//     });
//   });
// }


// function beginTransaction(connection) {
//   return new Promise((resolve, reject) => {
//     connection.beginTransaction(error => {
//       if (error) {
//         return reject(error);
//       }

//       resolve();
//     });
//   });
// }


// function commit(connection) {
//   return new Promise((resolve, reject) => {
//     connection.commit(error => {
//       if (error) {
//         return reject(error);
//       }
//       resolve();
//     });
//   });
// }


// function rollback(connection) {
//   return new Promise(resolve => {
//     connection.rollback(() => resolve());
//   });
// }


// module.exports = {
//   query,
//   getConnection,
//   connectionQuery,
//   beginTransaction,
//   commit,
//   rollback
// };

const db = require('../config/db.js');

async function query(sql, values = []) {
  const [results] = await db.query(sql, values);
  return results;
}

async function getConnection() {
  return await db.getConnection();
}

async function connectionQuery(connection, sql, values = []) {
  const [results] = await connection.query(sql, values);
  return results;
}

async function beginTransaction(connection) {
  await connection.beginTransaction();
}

async function commit(connection) {
  await connection.commit();
}

async function rollback(connection) {
  await connection.rollback();
}

module.exports = {
  query,
  getConnection,
  connectionQuery,
  beginTransaction,
  commit,
  rollback
};