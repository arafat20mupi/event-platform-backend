import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";;
import catchAsync from "../../../shared/catchAsync";
import { eventsService } from "./event.service";

const createEvents = catchAsync(async (req: Request, res: Response) => {
    console.log(req.body);
    const result = await eventsService.createEvents(req);
    console.log(result);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully!",
        data: result,
    });
});

const getEvents = catchAsync(async (req: Request, res: Response) => {
    const result = await eventsService.getEvents();
    sendResponse(res, { 
        statusCode: httpStatus.OK,
        success: true,
        message: "Events fetched successfully!",
        data: result,
    });
});

export const eventsController = {
    createEvents,
    getEvents
};