"use strict";

const itineraryDao = require("../dao/itineraryDao");
const flightDao = require("../dao/flightDao");
const ticketDao = require("../dao/ticketDao");

function getItinerary(itineraryId) {
  return itineraryDao.getItinerary(itineraryId);
}

function getItineraries() {
  return itineraryDao.getItineraries();
}

function createItinerary(itinerary) {
  return itineraryDao.createItinerary(itinerary);
}

function getFlights(searchParameters) {
  const expected = {
    id: 0,
    departure_date: {},
    arrival_date: {},
    destination: "destination",
    origin: "origin",
    capasity: 0,
    price: 0
  };
  return flightDao.getFlights(searchParameters);
}

function getTicketsByItineraryId(itineraryId) {
  return ticketDao.getTicketsByItineraryId(itineraryId);
}

module.exports = {
  getItinerary: getItinerary,
  getItineraries: getItineraries,
  createItinerary: createItinerary,
  getFlights: getFlights,
  getTicketsByItineraryId: getTicketsByItineraryId
};
