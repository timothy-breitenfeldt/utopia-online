"use strict";

const routes = require("express").Router();
const db = require("../dao/db");
const onlineService = require("../service/onlineService");

routes.get("/online/itineraries", async function(request, response, next) {
  try {
    const itineraries = await onlineService.getItineraries();
    response.status(200);
    response.send(itineraries);
  } catch (error) {
    return next(error);
  }
});

routes.post("/online/itineraries", async function(request, response, next) {
  try {
    const itinerary = request.body;
    const id = await onlineService.createItinerary(itinerary);
    response.status(201);
    response.send(id);
  } catch (error) {
    return next(error);
  }
});

routes.post("/online/flights/search", async function(request, response, next) {
  try {
    const searchParameters = request.body;
    const flights = await onlineService.getFlights(searchParameters);
    response.status(200);
    response.send(flights);
  } catch (error) {
    return next(error);
  }
});

module.exports = routes;
