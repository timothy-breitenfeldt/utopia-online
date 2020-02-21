"use strict";

const itineraryDao = require("../dao/itineraryDao");

function getItineraries() {
  return itineraryDao.getItineraries();
}

function createItinerary(itinerary) {
  return itineraryDao.createItinerary(itinerary);
}

module.exports = {
  getItineraries: getItineraries,
  createItinerary: createItinerary
};
