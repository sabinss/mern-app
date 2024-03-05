/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';

import { AppDataSource } from '../../src/config/data-source';
// import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';
import { isJwt, truncateTables } from '../utils';

describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        await connection.dropDatabase();
        await connection.synchronize();
        // Database truncate
        // database should be clean on every test , we need to test all in isolation
        // await truncateTables(connection);
    });

    afterAll(async () => {
        //close db connection
        await connection.destroy();
    });

    describe('Happy path : Given All fields', () => {
        it('should return the 201 status code', async () => {
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@merna.space',
                password: 'password',
            };
            // Act;
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Assert
            expect(response.statusCode).toBe(201);
        });

        it('should return valid json format', async () => {
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'password',
            };
            // Act;
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            expect(
                (response.headers as Record<string, string>)['content-type'],
            ).toEqual(expect.stringContaining('json'));
        });

        it('should persist the user in the database', async () => {
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'password',
            };
            await request(app).post('/auth/register').send(userData);
            //assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
        it.todo('should return an id of the created user');
        it('should assign a customer role', async () => {
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'password',
            };
            // Act
            await request(app).post('/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.CUSTOMER);
        });

        it('should store the hashed password in the database', async () => {
            // Arrange
            const userData = {
                firstName: 'Rakesh',
                lastName: 'K',
                email: 'rakesh@mern.space',
                password: 'password',
            };
            // Act
            await request(app).post('/auth/register').send(userData);

            // Assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });
    });
    it('should return 400 status code if email is already exists', async () => {
        // Arrange
        const userData = {
            firstName: 'Rakesh',
            lastName: 'K',
            email: 'rakesh@mern.space',
            password: 'password',
        };
        const userRepository = connection.getRepository(User);
        await userRepository.save({ ...userData, role: Roles.CUSTOMER });

        // Act
        const response = await request(app)
            .post('/auth/register')
            .send(userData);

        const users = await userRepository.find();
        // Assert
        expect(response.statusCode).toBe(400);
        expect(users).toHaveLength(1);
    });

    it('should return 400 status code if email is already exist', async () => {
        // Arrange
        const userData = {
            firstName: 'Rakesh',
            lastName: 'K',
            email: 'rakesh@mern.space',
            password: 'password',
        };
        const userRepository = connection.getRepository(User);
        await userRepository.save({ ...userData, role: Roles.CUSTOMER });

        // Act
        const response = await request(app)
            .post('/auth/register')
            .send(userData);
        const users = await userRepository.find();
        // Assert
        expect(response.statusCode).toBe(400);
        expect(users).toHaveLength(1);
    });

    it('should return the access token and refresh token inside a cookie', async () => {
        // Arrange
        const userData = {
            firstName: 'Rakesh',
            lastName: 'K',
            email: 'rakesh@mern.space',
            password: 'password',
        };

        // Act
        const response = await request(app)
            .post('/auth/register')
            .send(userData);

        let accessToken = null;
        let refreshToken = null;

        const cookies = response.headers['set-cookie'] || [];

        // Type assertion to treat cookies as an array of strings
        if (Array.isArray(cookies)) {
            cookies.forEach((cookie: string) => {
                // Assertion added here
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                    // eslint-disable-next-line no-console
                }

                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });
        } else {
            // eslint-disable-next-line no-console
            console.error('Cookies is not an array.');
        }
        // eslint-disable-next-line no-console
        expect(accessToken).not.toBeNull();
        expect(refreshToken).not.toBeNull();

        expect(isJwt(accessToken)).toBeTruthy();
        expect(isJwt(refreshToken)).toBeTruthy();
    });

    describe('Sad path: Fields are missing', () => {
        it('test', () => {
            expect(true).toBeTruthy();
        });
    });
});
