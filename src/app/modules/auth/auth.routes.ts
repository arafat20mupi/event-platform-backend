import { UserRole } from '@prisma/client';
import express from 'express';
import { authLimiter } from '../../middlewares/rateLimiter';
import { AuthController } from './auth.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
    '/login',
    authLimiter,
    AuthController.loginUser
);

router.post(
    '/refresh-token',
    AuthController.refreshToken
)

router.post(
    '/change-password',
    auth(
        UserRole.ADMIN,
        UserRole.HOST,
        UserRole.USER
    ),
    AuthController.changePassword
);

router.post(
    '/forgot-password',
    AuthController.forgotPassword
);

router.post(
    '/reset-password',
    AuthController.resetPassword
)

router.get(
    '/me',
    AuthController.getMe
)

export const AuthRoutes = router;