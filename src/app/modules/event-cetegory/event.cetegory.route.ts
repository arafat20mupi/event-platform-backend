import express, { NextFunction, Request, Response } from 'express';
import { eventsCetegoryController } from './event.cetegory.controller';

const router = express.Router();

router.post(
    "/",
    (req: Request, res: Response, next: NextFunction) => {
        return eventsCetegoryController.createEventsCetegory(req, res, next)
    }
);

router.get(
    "/",
    (req: Request, res: Response, next: NextFunction) => {
        return eventsCetegoryController.getEventsCetegories(req, res, next)
    }
);




export const eventsCetegoryRoutes = router;