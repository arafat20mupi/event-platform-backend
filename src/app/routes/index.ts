import express from 'express';
import { apiLimiter } from '../middlewares/rateLimiter';
import { userRoutes } from '../modules/user/user.routes';


const router = express.Router();



router.use(apiLimiter); // Apply to all routes

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;