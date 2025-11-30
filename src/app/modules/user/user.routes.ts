import express, { NextFunction, Request, Response } from 'express';
import { fileUploader } from '../../../helpers/fileUploader';
import { userController } from './user.controller';
import { userValidation } from './user.validation';

const router = express.Router();

router.post(
    "/create-user",
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createUser.parse(JSON.parse(req.body.data))
        return userController.createUser(req, res, next)
    }
);





export const userRoutes = router;