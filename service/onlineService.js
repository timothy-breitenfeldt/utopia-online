"use strict";

const itineraryDao = require("../dao/itineraryDao");
const flightDao = require("../dao/flightDao");

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

module.exports = {
  getItineraries: getItineraries,
  createItinerary: createItinerary,
  getFlights: getFlights
};
