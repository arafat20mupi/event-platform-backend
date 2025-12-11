import express from 'express';
import { apiLimiter } from '../middlewares/rateLimiter';
import { userRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { eventsCetegoryRoutes } from '../modules/event-cetegory/event.cetegory.route';
import { eventsRoutes } from '../modules/event/event.route';


const router = express.Router();



router.use(apiLimiter); 

const moduleRoutes = [
    {
        path: '/user',
        route: userRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/events/categories",
        route: eventsCetegoryRoutes
    },
    {
        path: "/events",
        route: eventsRoutes
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;