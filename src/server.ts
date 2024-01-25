import app from './app';

import { Config } from './config';
import logger from './config/logger';

const startServer = () => {
    const PORT = Config.PORT;
    // eslint-disable-next-line no-console
    try {
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

startServer();
