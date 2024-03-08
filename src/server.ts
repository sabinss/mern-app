import app from './app';

import { Config } from './config';
import { AppDataSource } from './config/data-source';
import logger from './config/logger';

const startServer = async () => {
    const PORT = Config.PORT;
    // eslint-disable-next-line no-console
    try {
        // const err = createError(401, 'Please login to view this page.');
        // throw err;

        await AppDataSource.initialize();
        logger.info('Database connected successfully');
        app.listen(PORT, () =>
            logger.info(`Linstening on port ${PORT}`, { test: 1 }),
        );
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
        }
        setTimeout(() => {
            process.exit(1);
        }, 1000);
    }
};

void startServer();
