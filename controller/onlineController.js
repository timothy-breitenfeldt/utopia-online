"use strict";

const routes = require("express").Router();
const db = require("../dao/db");
const onlineService = require("../service/onlineService");
const { ApplicationError, handleError } = require("../helper/error");

routes.get("/online/itineraries", async function(request, response, next) {
  try {
    const itineraries = await onlineService.getItineraries();
    response.status(200);
    response.send(itineraries);
  } catch (error) {
    handleError(error, next);
  }
});

routes.post("/online/itineraries", async function(request, response, next) {
  try {
    const itinerary = request.body;
    const id = await onlineService.createItinerary(itinerary);
    response.status(201);
    response.send(id);
  } catch (error) {
    handleError(error, next);
  }
});

routes.get("/online/itineraries/:id", async function(request, response, next) {
  try {
    const itineraryId = request.params.id;
    const itinerary = await onlineService.getItinerary(itineraryId);
    response.status(200);
    response.send(itinerary);
  } catch (error) {
    handleError(error, next);
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
    response.sendStatus(204);
  } catch (error) {
    handleError(error, next);
  }
});

routes.post("/online/flights/search", async function(request, response, next) {
  try {
    const searchParameters = request.body;
    const flights = await onlineService.getFlights(searchParameters);
    response.status(200);
    response.send(flights);
  } catch (error) {
    handleError(error, next);
  }
});

routes.get("/online/tickets/itineraries", async function(
  request,
  response,
  next
) {
  try {
    const itineraryId = request.query.id;
    const tickets = await onlineService.getTicketsByItineraryId(itineraryId);
    response.status(200);
    response.send(tickets);
  } catch (error) {
    handleError(error, next);
  }
});

module.exports = routes;
