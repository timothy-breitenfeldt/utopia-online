"use strict";

const db = require("./db");

function getFlights(searchParameters) {
  return new Promise(function(resolve, reject) {
    if (
      searchParameters == null ||
      Object.keys(searchParameters).length === 0
    ) {
      db.connection.query("SELECT * FROM flight;", function(error, result) {
        return error ? reject(error) : resolve(result);
      });
    } else {
      const parameterConditions = Object.keys(searchParameters)
        .map(k => `${k}=?`)
        .join(" and ");
      const parameters = Object.values(searchParameters);
      const sql = `SELECT * FROM flight WHERE ${parameterConditions} and capacity > 0;`;
      console.log(sql);

      db.connection.query(sql, parameters, function(error, result) {
        return error ? reject(error) : resolve(result);
      });
    }
  });
}

module.exports = {
  getFlights: getFlights
};
