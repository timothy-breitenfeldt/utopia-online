"use strict";

const routes = require("express").Router();
const db = require("../dao/db");
const onlineService = require("../service/onlineService");

routes.get("/online/itineraries", async function(request, response, next) {
  try {
    const itineraries = await onlineService.getItineraries();
    response.status(200);
    response.send(itineraries);
    next();
  } catch (error) {
    next(error);
  }
});

routes.post("/online/itineraries", async function(request, response, next) {
  try {
    const itinerary = request.body;
    const id = await onlineService.createItinerary(itinerary);
    response.status(201);
    response.send(id);
    next();
  } catch (error) {
    next(error);
  }
});

routes.get("/online/itineraries/:id", async function(request, response, next) {
  try {
    const itineraryId = request.params.id;
    const itinerary = await onlineService.getItinerary(itineraryId);
    response.status(200);
    response.send(itinerary);
    next();
  } catch (error) {
    next(error);
  }
});

routes.delete("/online/itineraries/:id", async function(
  request,
  response,
  next
) {
  try {
    const itineraryId = request.params.id;
    await onlineService.cancelItinerary(itineraryId);
    response.status(204).send();
    next();
  } catch (error) {
    next(error);
  }
});

routes.post("/online/flights/search", async function(request, response, next) {
  try {
    const searchParameters = request.body;
    const flights = await onlineService.getFlights(searchParameters);
    response.status(200);
    response.send(flights);
    next();
  } catch (error) {
    next(error);
  }
});

routes.get("/online/tickets/itineraries/:id", async function(
  request,
  response,
  next
) {
  try {
    const itineraryId = request.params.id;
    const tickets = await onlineService.getTicketsByItineraryId(itineraryId);
    response.status(200);
    response.send(tickets);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = routes;
