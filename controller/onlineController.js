"use strict";

const routes = require("express").Router();
const db = require("../dao/db");
const onlineService = require("../service/onlineService");
const { ApplicationError, handleError } = require("../helper/error");

routes.get("/online/itineraries", async function(request, response, next) {
  try {
    const userId = request.user.id;
    const itineraries = await onlineService.getItineraries(userId);
    response.status(200);
    response.send(itineraries);
  } catch (error) {
    handleError(error, next);
  }
});

routes.post("/online/itineraries", async function(request, response, next) {
  try {
    const itinerary = request.body;
    itinerary.user_id = request.user.id;
    const id = await onlineService.createItinerary(itinerary);
    response.status(201);
    response.send(id);
  } catch (error) {
    handleError(error, next);
  }
});

routes.get("/online/itineraries/:id", async function(request, response, next) {
  try {
    const userId = request.user.id;
    const itineraryId = request.params.id;
    const itinerary = await onlineService.getItinerary(itineraryId, userId);
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
    const userId = request.user.id;
    const itineraryId = request.params.id;
    await onlineService.cancelItinerary(itineraryId, userId);
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
    if (!request.query && !request.query.id) {
      throw new ApplicationError(400, "Missing ID in query parameters");
    }

    const userId = request.user.id;
    const itineraryId = request.query.id;
    const tickets = await onlineService.getTicketsByItineraryId(
      itineraryId,
      userId
    );
    response.status(200);
    response.send(tickets);
  } catch (error) {
    handleError(error, next);
  }
});

//Health check
routes.get("/online", function(request, response, next) {
  response.send("Healthy").status(200);
});

module.exports = routes;
