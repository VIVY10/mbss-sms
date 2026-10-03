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