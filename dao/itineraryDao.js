"use strict";

const db = require("./db");
const config = require("config");

function getItineraries() {
  return new Promise(function(resolve, reject) {
    const sql = "SELECT * FROM itinerary;";
    db.connection.query(sql, function(err, result) {
      return err ? reject(err) : resolve(result);
    });
  });
}

async function createItinerary(itinerary) {
  return new Promise(function(resolve, reject) {
    db.connection.beginTransaction(async function(err) {
      try {
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

        db.connection.commit(function(transactionError, result) {
          return err ? reject(err) : resolve({ id: itineraryId });
        });
      } catch (error) {
        db.connection.rollback(function(transactionError, result) {
          return result ? reject(error) : reject(transactionError);
        });
      }
    });
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
  const tax = config.get("application.salesTax");

  for (let price of ticketPrices) {
    subtotal += price;
  }

  total = subtotal;

  if (commissionRate != null) {
    total += subtotal * commissionRate;
  }

  total += subtotal * tax;
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

  for (let ticket of tickets) {
    let ticketPromice = new Promise(function(resolve, reject) {
      const sql =
        "INSERT INTO ticket (flight_number, itinerary_id, status, seat_number) VALUES(?, ?, ?, ?);";
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

module.exports = {
  getItineraries: getItineraries,
  createItinerary: createItinerary
};
