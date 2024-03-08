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
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';
import { CredentialService } from '../services/CredentialService';
export class AuthController {
    userService: UserService;
    constructor(
        userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService,
    ) {
        this.userService = userService;
        this.tokenService = tokenService;
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
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

    async login(req: RegisterUserRequest, res: Response, next: NextFunction) {
        const result = validationResult(req);

        const { email, password } = req.body;

        if (!result.isEmpty()) {
            return res.status(400).json({ erros: result.array() });
        }

        this.logger.debug('New login  request', {
            email,
            password: '******',
        });

        try {
            const user = await this.userService.findByEmailWithPassword(email);
            if (!user) {
                const error = createHttpError(
                    400,
                    'Email or password does not match.',
                );
                next(error);
                return;
            }
            const passwordMatch = await this.credentialService.comparePassword(
                password,
                user.password,
            );

            if (!passwordMatch) {
                const error = createHttpError(
                    400,
                    'Email or password does not match.',
                );
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
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

            this.logger.info('User has been logged in ', { id: user.id });
            res.status(200).json({ id: user.id });
        } catch (error) {
            console.log('error1', error);
            next(error);
            return;
        }
    }
}

export default AuthController;
