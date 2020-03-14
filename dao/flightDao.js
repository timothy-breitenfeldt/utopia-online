"use strict";

const db = require("./db");

function getFlights(searchParameters) {
  return new Promise(async function(resolve, reject) {
    try {
      let flights = [];

      if (Object.keys(searchParameters).length === 0) {
        const sql = `SELECT * FROM flight;`;
        flights = await _getFlights(sql, []);
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
            } else if (k == "flight_number") {
              return "flight.id = ?";
            } else if (k == "airport_id") {
              return "airport.id=?";
            } else if (k.includes("date") || k == "airport_name") {
              return `${k} like ?`;
            } else if (k == "price") {
              return `price <= ?`;
            } else {
              return `${k}=?`;
            }
          })
          .join(" and ");

        const sql = `SELECT flight.id, flight.capacity, flight.price, flight.arrival_date, flight.departure_date, flight.dest, flight.origin
        FROM flight JOIN airport ON flight.origin = airport.id
        WHERE capacity > 0 AND ${conditions};
      `;

        flights = await _getFlights(sql, parameters);
      }

      return resolve(flights);
    } catch (error) {
      reject(error);
    }
  });
}

function _getFlights(sql, parameters) {
  return new Promise(async function(resolve, reject) {
    try {
      const flights = await new Promise(function(resolve, reject) {
        db.connection.query(sql, parameters, function(error, result) {
          return error ? reject(error) : resolve(result);
        });
      });
      const promises = [];

      flights.map(function(flight) {
        promises.push(
          _getAirport(flight.dest).then(
            airport => (flight.dest_airport = airport[0])
          )
        );

        promises.push(
          _getAirport(flight.origin).then(
            airport => (flight.origin_airport = airport[0])
          )
        );

        delete flight.dest;
        delete flight.origin;
      });

      await Promise.all(promises);
      return resolve(flights);
    } catch (error) {
      reject(error);
    }
  });
}

function _getAirport(airportId) {
  return new Promise(function(resolve, reject) {
    const sql = "SELECT * FROM airport WHERE id = ?";
    db.connection.query(sql, [airportId], function(error, result) {
      return error ? reject(error) : resolve(result);
    });
  });
}

module.exports = {
  getFlights
};
