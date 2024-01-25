import winston from 'winston';
import { Config } from '.';

const logger = winston.createLogger({
    // format: combine(timestamp({format: 'YYYY-MM-DD HH:mm:ss'}), customFormat),
    level: 'info',
    defaultMeta: {
        // this add additional information in our log, it add auth-service in our every log
        serviceName: 'auth-service',
    },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.File({
            dirname: 'logs',
            filename: 'combine.log',
            level: 'info',
            silent: Config.NODE_ENV === 'test',
        }),
        new winston.transports.File({
            dirname: 'logs',
            filename: 'error.log',
            level: 'error',
            silent: Config.NODE_ENV === 'test',
            // in test environemnt i donot want to write log
        }),
        new winston.transports.Console({
            level: 'info',
            // format: winston.format.simple(),
            format: winston.format.json(),
        }),
    ],
});

export default logger;
