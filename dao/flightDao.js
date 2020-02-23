"use strict";

const db = require("./db");

function getFlights(searchParameters) {
  return new Promise(function(resolve, reject) {
    if (Object.keys(searchParameters).length === 0) {
      const sql = "SELECT * FROM flight;";
      db.connection.query(sql, function(error, result) {
        return error ? reject(error) : resolve(result);
      });
    } else {
      const parameters = Object.keys(searchParameters).map(k =>
        k.includes("date") ? `%${searchParameters[k]}%` : searchParameters[k]
      );

      const conditions = Object.keys(searchParameters)
        .map(k => {
          if (k == "dest") {
            return "flight.dest IN (SELECT id FROM airport WHERE airport.city like ?)";
          } else if (k == "origin") {
            return "flight.origin IN (SELECT id FROM airport WHERE airport.city like ?)";
          } else if (k.includes("date") || k == "airport_name") {
            return `${k} like ?`;
          } else {
            return `${k}=?`;
          }
        })
        .join(" and ");

      const sql = `SELECT flight.id as flight_id, airport.id as airport_id, airport.name airport_name, flight.capacity, flight.price, flight.departure_date, flight.arrival_date
        FROM flight JOIN airport ON flight.origin = airport.id
        WHERE capacity > 0 AND ${conditions};
      `;
      console.log(JSON.stringify(parameters));
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
