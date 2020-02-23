"use strict";

const mysql = require("mysql");
const config = require("config");

const dbConfig = config.get("server.dbConfig");

const connection = mysql.createConnection(dbConfig);

function getLastInsertedId() {
  return new Promise(function(resolve, reject) {
    connection.query("select LAST_INSERT_ID() as id;", function(err, result) {
      return err ? reject(err) : resolve(result[0]);
    });
  });
}

module.exports = {
  connection,
  getLastInsertedId
};
