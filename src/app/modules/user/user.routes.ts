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

router.post(
    "/create-admin",
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createAdmin.parse(JSON.parse(req.body.data))
        return userController.createAdmin(req, res, next)
    }
);

router.post(
    "/create-host",
    fileUploader.upload.single('file'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = userValidation.createHost.parse(JSON.parse(req.body.data))
        return userController.createHost(req, res, next)
    }
);
router.get("/get-hosts", (req: Request, res: Response, next: NextFunction) => {
    return userController.getAllHostsFromDB(req, res, next)
});



router.get("/get-users" , userController.getAllFromDB);

export const userRoutes = router;