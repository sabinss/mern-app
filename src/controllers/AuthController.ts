import fs from 'fs';
import { Response, NextFunction } from 'express';
import { RegisterUserRequest } from '../types';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { sign, JwtPayload } from 'jsonwebtoken';
import createHttpError from 'http-errors';

import path from 'path';
import { Config } from '../config';
import { Console } from 'console';

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
            let privateKey: Buffer;
            try {
                privateKey = fs.readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                );
            } catch (err) {
                const error = createHttpError(
                    500,
                    'Error while reading private key',
                );
                throw error;
            }
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };
            const accessToken = sign(payload, privateKey, {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'auth-service', // this indicates which service created this
            });
            console.log(
                'Config.REFRESH_TOKEN_SECRET',
                Config.REFRESH_TOKEN_SECRET,
            );
            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'auth-service', // this indicates which service created this
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60,
                httpOnly: true, // very important
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365,
                httpOnly: true, // very important
            });

            this.logger.info('User has been registered', { id: user.id });
            res.status(201).json();
        } catch (error) {
            console.log('error1', error);
            next(error);
            return;
        }
    }
}

export default AuthController;
