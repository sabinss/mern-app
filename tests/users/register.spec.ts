import request from 'supertest';
import app from '../../src/app';
import { DataSource } from 'typeorm';

import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utils';
import { User } from '../../src/entity/User';

describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        console.log('beforeAll all running');
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        console.log('beforeEach all running');
        // Database truncate
        // database should be clean on every test , we need to test all in isolation
        await truncateTables(connection);
    });

    afterAll(async () => {
        console.log('after all running');
        //close db connection
        await connection.destroy();
    });

    describe('Happy path : Given All fields', () => {
        it('should return the 201 status code', async () => {
            // Arrange
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
            // Act;
            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            //assert
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();

            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
        it.todo('should retur an id of the created user');
    });

    describe('Sad path: Fields are missing', () => {});
});
