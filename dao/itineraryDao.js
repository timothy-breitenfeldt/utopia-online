"use strict";

const db = require("./db");
const config = require("config");

function getItineraries() {
  return new Promise(function(resolve, reject) {
    const sql = "SELECT * FROM itinerary";
    db.connection.query(sql, function(error, result) {
      return error ? reject(error) : resolve(result);
    });
  });
}

function createItinerary(itinerary) {
  return new Promise(async function(resolve, reject) {
    try {
      await db.connection.beginTransaction();

      let commissionRate = null;

      if (itinerary.agency_id != null) {
        const commissionRateData = await _getCommissionRate(
          itinerary.agency_id
        );
        commissionRate = commissionRateData[0].commission_rate;
      }

      const totalPrice = _calculatePrice(
        itinerary.tickets.map(v => v.price),
        commissionRate
      );

      await _createItinerary(
        itinerary.traveler_id,
        itinerary.user_id,
        itinerary.agency_id,
        totalPrice
      );

      const lastInsertedData = await db.getLastInsertedId();
      const itineraryId = lastInsertedData.id;
      await _createTickets(itinerary.tickets, itineraryId);

      await decrementFlightCapacities(
        itinerary.tickets.map(t => t.flight_number)
      );

      await db.connection.commit();
      return resolve({ id: itineraryId });
    } catch (error) {
      db.connection.rollback(function(transactionError, result) {
        return result ? reject(error) : reject(transactionError);
      });
    }
  });
}

function _getCommissionRate(agencyId) {
  return new Promise(function(resolve, reject) {
    const sql = "SELECT commission_rate FROM travel_agency WHERE id = ?;";
    db.connection.query(sql, [agencyId], function(err, result) {
      return err ? reject(err) : resolve(result);
    });
  });
}

function _calculatePrice(ticketPrices, commissionRate) {
  let total = 0;
  let subtotal = 0;
  let tax = 0.0;

  for (let price of ticketPrices) {
    subtotal += price;
  }

  total = subtotal;

  if (commissionRate != null) {
    total += subtotal * commissionRate;
  }

  if (config.has("application.salesTax")) {
    tax = config.get("application.salesTax");
    total += subtotal * tax;
  }

  return parseFloat(total.toFixed(2), 10); //round the number to exactly 2 decimal places, and cast back to a float
}

function _createItinerary(travelerId, userId, agencyId, totalPrice) {
  return new Promise(function(resolve, reject) {
    const sql =
      "INSERT INTO itinerary (traveler_id, user_id, agency_id, price_total) VALUES(?, ?, ?, ?);";
    db.connection.query(
      sql,
      [travelerId, userId, agencyId, totalPrice],
      function(err, result) {
        return err ? reject(err) : resolve(result);
      }
    );
  });
}

function _createTickets(tickets, itineraryId) {
  const promises = [];
  const sql =
    "INSERT INTO ticket (flight_number, itinerary_id, status, seat_number) VALUES(?, ?, ?, ?);";

  for (let ticket of tickets) {
    let ticketPromice = new Promise(function(resolve, reject) {
      db.connection.query(
        sql,
        [ticket.flight_number, itineraryId, "ACTIVE", ticket.seat_number],
        function(err, result) {
          return err ? reject(err) : resolve(result);
        }
      );
    });

    promises.push(ticketPromice);
  }

  return Promise.all(promises);
}

function decrementFlightCapacities(flights) {
  const promises = [];
  const sql = "UPDATE flight SET capacity = capacity-1 WHERE id = ?;";

  for (let flightNumber of flights) {
    let promise = new Promise(function(resolve, reject) {
      db.connection.query(sql, [flightNumber], function(error, result) {
        return error ? reject(error) : resolve(result);
      });
    });

    promises.push(promise);
  }

  return Promise.all(promises);
}

function getItinerary(itineraryId) {
  return new Promise(function(resolve, reject) {
    const sql = "SELECT * FROM itinerary WHERE id = ?;";
    db.connection.query(sql, [itineraryId], function(error, result) {
      return error ? reject(error) : resolve(result);
    });
  });
}

function cancelItinerary(itineraryId) {
  return new Promise(async function(resolve, reject) {
    try {
      const sql = "UPDATE ticket SET status='CANCELED' WHERE itinerary_id = ?;";

      await db.connection.beginTransaction();
      await db.connection.query(sql, [itineraryId]);
      await db.connection.commit();
      return resolve();
    } catch (error) {
      db.connection.rollback(function(transactionError, result) {
        return result ? reject(error) : reject(transactionError);
      });
    }
  });
}

module.exports = {
  getItineraries,
  createItinerary,
  getItinerary,
  cancelItinerary
};
