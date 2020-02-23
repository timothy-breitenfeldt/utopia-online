"use strict";

const itineraryDao = require("../dao/itineraryDao");
const flightDao = require("../dao/flightDao");
const ticketDao = require("../dao/ticketDao");
const ApplicationError = require("../errors/applicationError");

function getItinerary(itineraryId) {
  if (isNaN(itineraryId)) {
    throw new ApplicationError(400, "Itinerary ID must be a number");
  }
  if (itineraryId <= 0) {
    throw new ApplicationError(
      400,
      "Itinerary ID cannot be less than or equal to 0"
    );
  }

  return itineraryDao.getItinerary(itineraryId);
}

function getItineraries() {
  return itineraryDao.getItineraries();
}

function createItinerary(itinerary) {
  if (!itinerary) {
    throw new ApplicationError(400, "Request body cannot be empty");
  }
  const expectedItinerary = ["traveler_id", "user_id", "agency_id", "tickets"];
  const expectedTicket = ["flight_number", "seat_number", "price"];

  for (let key of expectedItinerary) {
    if (itinerary[key] == null) {
      throw new ApplicationError(
        400,
        `Invalid request, missing ${key} in itinerary`
      );
    }
  }
  if (expectedItinerary.length != Object.keys(itinerary).length) {
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

function getFlights(searchParameters) {
  const expected = [
    "flight_id",
    "airport_id",
    "departure_date",
    "arrival_date",
    "dest",
    "origin",
    "capasity",
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

function getTicketsByItineraryId(itineraryId) {
  if (isNaN(itineraryId)) {
    throw new ApplicationError(400, "Itinerary ID must be a number");
  }
  if (itineraryId <= 0) {
    throw new ApplicationError(
      400,
      "Itinerary ID cannot be less than or equal to 0"
    );
  }

  return ticketDao.getTicketsByItineraryId(itineraryId);
}

module.exports = {
  getItinerary,
  getItineraries,
  createItinerary,
  getFlights,
  getTicketsByItineraryId
};
