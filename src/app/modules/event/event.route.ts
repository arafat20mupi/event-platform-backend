import express, { NextFunction, Request, Response } from 'express';
import { eventsController } from './event.controller';
import { fileUploader } from '../../../helpers/fileUploader';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.post(
    "/",
    fileUploader.upload.single('file'),
     auth(
        UserRole.ADMIN,
        UserRole.HOST,
        UserRole.USER
    ),
    (req: Request, res: Response, next: NextFunction) => {
        return eventsController.createEvents(req, res, next)
    }
);

router.get("/", (req: Request, res: Response, next: NextFunction) => {
    return eventsController.getEvents(req, res, next)
});



export const eventsRoutes = router;