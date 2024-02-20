import express, { Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import logger from '../config/logger';
import registerValidator from '../validators/register-validator';

const router = express.Router();

const userRepository = AppDataSource.getRepository(User);

const userService = new UserService(userRepository);

const authController = new AuthController(userService, logger);

// router.post('/register', authController.register);

router.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next),
);

// note
// 1. if we call like this authController.register, the value of this will point to
// this context router.post('/register', authController.register);
// 2, if we want this to point to AuthController class we can use arrow function

export default router;
