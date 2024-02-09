import 'reflect-metadata';

import express, { Response, Request, NextFunction } from 'express';
import logger from './config/logger';
import { HttpError } from 'http-errors';
import createError from 'http-errors';
import authRouter from './routes/auth';

const app = express();
app.use(express.json());

app.get('/', async (req, res, next) => {
    // when we set asyn here and when we throw error , in this case
    // global error canot cath in this case
    // const err = createError(401, 'Please login to view this page.');
    // throw err;
    // return next(err);
    // solution
    // - we can sedn error using next, in this way global handler can catch error
    res.send('Welcome to Auth service');
});

app.use('/auth', authRouter);

// global error handling
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                msg: err.message,
                path: '',
                lcation: '',
            },
        ],
    });
});

export default app;
