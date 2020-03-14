"use strict";

const itineraryDao = require("../dao/itineraryDao");
const flightDao = require("../dao/flightDao");
const ticketDao = require("../dao/ticketDao");
const { ApplicationError } = require("../helper/error");

function getItineraries(userId) {
  return itineraryDao.getItineraries(userId);
}

function createItinerary(itinerary) {
  if (!itinerary) {
    throw new ApplicationError(400, "Request body cannot be empty");
  }
  const expectedItinerary = ["traveler_id", "user_id", "tickets"];
  const expectedTicket = ["flight_number", "seat_number", "price"];

  for (let key of expectedItinerary) {
    if (itinerary[key] == null) {
      throw new ApplicationError(
        400,
        `Invalid request, missing ${key} in itinerary`
      );
    }
  }
  //Add 1 to account for agency_id which could be included
  if (
    expectedItinerary.length != Object.keys(itinerary).length &&
    expectedItinerary.length + 1 != Object.keys(itinerary).length
  ) {
    throw new ApplicationError(
      400,
      "Invalid request, to many arguments in itinerary"
    );
  }

  for (let ticket of itinerary.tickets) {
    for (let key of expectedTicket) {
      if (ticket[key] == null) {
        throw new ApplicationError(
          400,
          `Invalid request, missing ${key} in ticket ${JSON.stringify(ticket)}`
        );
      }

      if (expectedTicket.length != Object.keys(ticket).length) {
        throw new ApplicationError(
          400,
          "Invalid request, to many arguments in ticket"
        );
      }
    }
  }

  return itineraryDao.createItinerary(itinerary);
}

function getItinerary(itineraryId, userId) {
  if (isNaN(itineraryId)) {
    throw new ApplicationError(400, "Itinerary ID must be a number");
  }
  if (itineraryId <= 0) {
    throw new ApplicationError(
      400,
      "Itinerary ID cannot be less than or equal to 0"
    );
  }

  return itineraryDao.getItinerary(itineraryId, userId);
}

function cancelItinerary(itineraryId, userId) {
  if (isNaN(itineraryId)) {
    throw new ApplicationError(400, "Itinerary ID must be a number");
  }
  if (itineraryId <= 0) {
    throw new ApplicationError(
      400,
      "Itinerary ID cannot be less than or equal to 0"
    );
  }

  return itineraryDao.cancelItinerary(itineraryId, userId);
}

function getFlights(searchParameters) {
  const expected = [
    "flight_number",
    "airport_id",
    "departure_date",
    "arrival_date",
    "dest",
    "origin",
    "price"
  ];

  for (let key of Object.keys(searchParameters)) {
    if (!expected.includes(key)) {
      throw new ApplicationError(
        400,
        `Invalid request, ${key} is not a valid parameter`
      );
    }
  }

  return flightDao.getFlights(searchParameters);
}

function getTicketsByItineraryId(itineraryId, userId) {
  if (isNaN(itineraryId)) {
    throw new ApplicationError(400, "Itinerary ID must be a number");
  }
  if (itineraryId <= 0) {
    throw new ApplicationError(
      400,
      "Itinerary ID cannot be less than or equal to 0"
    );
  }

  return ticketDao.getTicketsByItineraryId(itineraryId, userId);
}

module.exports = {
  getItineraries,
  createItinerary,
  getItinerary,
  cancelItinerary,
  getFlights,
  getTicketsByItineraryId
};
