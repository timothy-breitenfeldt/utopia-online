"use strict";

const db = require("./db");
const config = require("config");
const { ApplicationError } = require("../helper/error");

function getItineraries(userId) {
  return new Promise(async function(resolve, reject) {
    try {
      const sql =
        "SELECT DISTINCT i.id, traveler_id, user_id, agency_id, price_total, date_created FROM itinerary i JOIN ticket t ON i.id = t.itinerary_id WHERE t.status = 'ACTIVE' AND user_id = ?;";
      const itineraries = await new Promise(function(resolve, reject) {
        db.connection.query(sql, [userId], function(error, result) {
          return error ? reject(error) : resolve(result);
        });
      });
      const promises = [];

      itineraries.map(function(itinerary) {
        promises.push(
          _getTickets(itinerary.id).then(
            tickets => (itinerary.tickets = tickets)
          )
        );

        promises.push(
          _getTraveler(itinerary.traveler_id).then(
            traveler => (itinerary.traveler = traveler)
          )
        );

        promises.push(
          _getUser(itinerary.user_id).then(user => (itinerary.user = user))
        );

        if (itinerary.agency_id) {
          promises.push(
            _getTravelAgency(itinerary.agency_id).then(
              agency => (itinerary.agency = agency)
            )
          );
        }

        delete itinerary.traveler_id;
        delete itinerary.user_id;
        delete itinerary.agency_id;
      });

      await Promise.all(promises);
      return resolve(itineraries);
    } catch (error) {
      reject(error);
    }
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

      await _modifyFlightCapacities(
        itinerary.tickets.map(t => t.flight_number),
        "DECREMENT"
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

function getItinerary(itineraryId, userId) {
  return new Promise(async function(resolve, reject) {
    try {
      const sql =
        "SELECT DISTINCT i.id, traveler_id, user_id, agency_id, price_total, date_created FROM itinerary i JOIN ticket t ON i.id = t.itinerary_id WHERE i.id = ? and t.status = 'ACTIVE' AND user_id = ?;";

      const result = await new Promise(function(resolve, reject) {
        db.connection.query(sql, [itineraryId, userId], function(
          error,
          result
        ) {
          return error ? reject(error) : resolve(result);
        });
      });

      if (result.length == 0) {
        return resolve(result);
      }

      const itinerary = result[0];
      itinerary.tickets = await _getTickets(itineraryId);
      itinerary.traverler = await _getTraveler(itinerary.traveler_id);
      itinerary.user = await _getUser(itinerary.user_id);

      if (itinerary.agency_id) {
        itinerary.agency = await _getTravelAgency(itinerary.agency_id);
      }

      delete itinerary.traveler_id;
      delete itinerary.user_id;
      delete itinerary.agency_id;
      return resolve(itinerary);
    } catch (error) {
      reject(error);
    }
  });
}

function _getTickets(itineraryId) {
  return new Promise(function(resolve, reject) {
    const sql = "SELECT * FROM ticket WHERE itinerary_id = ?;";
    db.connection.query(sql, [itineraryId], function(error, result) {
      return error ? reject(error) : resolve(result);
    });
  });
}

function _getTraveler(travelerId) {
  return new Promise(function(resolve, reject) {
    const sql = "SELECT * FROM traveler WHERE id = ?;";
    db.connection.query(sql, [travelerId], function(error, result) {
      return error ? reject(error) : resolve(result[0]);
    });
  });
}

function _getTravelAgency(agencyId) {
  return new Promise(function(resolve, reject) {
    const sql = "SELECT * FROM travel_agency WHERE id = ?;";
    db.connection.query(sql, [agencyId], function(error, result) {
      return error ? reject(error) : resolve(result[0]);
    });
  });
}

function _getUser(userId) {
  return new Promise(function(resolve, reject) {
    const sql = "SELECT * FROM user WHERE id = ?;";
    db.connection.query(sql, [userId], function(error, result) {
      return error ? reject(error) : resolve(result[0]);
    });
  });
}

function cancelItinerary(itineraryId, userId) {
  return new Promise(async function(resolve, reject) {
    try {
      const sql =
        "UPDATE ticket INNER JOIN itinerary ON itinerary.id = ticket.itinerary_id SET status='CANCELED' WHERE itinerary_id = ? AND user_id = ?;";

      await db.connection.beginTransaction();

      const updateResult = await new Promise(function(resolve, reject) {
        db.connection.query(sql, [itineraryId, userId], function(
          error,
          result
        ) {
          return error ? reject(error) : resolve(result);
        });
      });

      if (updateResult.changedRows > 0) {
        const flights = await _getFlightNumbers(itineraryId);
        await _modifyFlightCapacities(flights, "INCREMENT");
        await db.connection.commit();
        return resolve();
      } else {
        db.connection.rollback(function(transactionError, result) {
          return result
            ? reject(
                new ApplicationError(400, "Unable to cancel that itinerary")
              )
            : reject(transactionError);
        });
      }
    } catch (error) {
      db.connection.rollback(function(transactionError, result) {
        return result ? reject(error) : reject(transactionError);
      });
    }
  });
}

function _getFlightNumbers(itineraryId) {
  return new Promise(function(resolve, reject) {
    const sql =
      "SELECT flight_number FROM itinerary i JOIN ticket t ON i.id = t.itinerary_id WHERE i.id = ?";

    db.connection.query(sql, [itineraryId], function(error, result) {
      return error ? reject(error) : resolve(result.map(v => v.flight_number));
    });
  });
}

function _modifyFlightCapacities(flights, flag) {
  const promises = [];
  let sql = "";

  if (flag == "INCREMENT") {
    sql = "UPDATE flight SET capacity = capacity+1 WHERE id = ?;";
  } else if (flag == "DECREMENT") {
    sql = "UPDATE flight SET capacity = capacity-1 WHERE id = ?;";
  } else {
    throw new Error("Invalid value for flag, must be increment or decrement");
  }

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

module.exports = {
  getItineraries,
  createItinerary,
  getItinerary,
  cancelItinerary
};
