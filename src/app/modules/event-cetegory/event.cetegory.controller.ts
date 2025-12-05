import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";;
import catchAsync from "../../../shared/catchAsync";
import { eventsCetegoryService } from "./event.cetegory.service";

const createEventsCetegory = catchAsync(async (req: Request, res: Response) => {
    console.log(req.body);
    const result = await eventsCetegoryService.createEventsCetegory(req);
    console.log(result);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User created successfully!",
        data: result,
    });
});


const getEventsCetegories = catchAsync(async (req: Request, res: Response) => {
    const result = await eventsCetegoryService.getEventsCetegories();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User fetched successfully!",
        data: result,
    });
});

export const eventsCetegoryController = {
    createEventsCetegory,
    getEventsCetegories,
};