import { Response, NextFunction } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';

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

        const result = validationResult(req);

        if (!result.isEmpty()) {
            return res.status(400).json({ erros: result.array() });
        }
        // if (!email) {
        //     const err = createHttpError(400, 'Email is required');
        //     // throw err;  here throw will not work, here we have to pass to global handler so use next
        //     next(err);
        //     return;
        // }
        this.logger.debug('New request to register user', {
            firstName,
            lastName,
            email,
            password: '******',
        });
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
            this.logger.info('User has been registered', { id: user.id });
            res.status(201).json();
        } catch (error) {
            next(error);
            return;
        }
    }
}

export default AuthController;
