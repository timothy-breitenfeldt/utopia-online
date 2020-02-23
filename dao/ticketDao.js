"use strict";

const db = require("./db");

function getTicketsByItineraryId(itineraryId) {
  return new Promise(function(resolve, reject) {
    const sql =
      "SELECT t.id, flight_number, itinerary_id, status, seat_number FROM ticket t JOIN itinerary i ON t.itinerary_id = i.id WHERE i.id = ? and t.status = 'ACTIVE';";
    db.connection.query(sql, [itineraryId], function(error, result) {
      return error ? reject(error) : resolve(result);
    });
  });
}

module.exports = {
  getTicketsByItineraryId
};
