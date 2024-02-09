import { Response, Request, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { nextTick } from 'process';
import { Logger } from 'winston';

export class AuthController {
    userService: UserService;
    constructor(
        userService: UserService,
        private logger: Logger,
    ) {
        this.userService = userService;
    }
    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        const { firstName, lastName, email, password } = req.body;
        this.logger.debug('New request to register user', {
            firstName,
            lastName,
            email,
            password: '******',
        });
        console.log(firstName, lastName, email, 'user');
        /**
         * This is bad creating userservice instance inside contoller
         * it became coupled with COntroller function.
         * we need to decoupe user service here , for that we can inject in constructor
         */
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });
            console.log(user, 'user');
            this.logger.info('User has been registered', { id: user.id });
            res.status(201).json();
        } catch (error) {
            next(error);
            return;
        }
    }
}

export default AuthController;
