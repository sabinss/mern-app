import { Repository } from 'typeorm';
import { User } from '../entity/User';
import { UserData } from '../types';
import createHttpError from 'http-errors';
import { Roles } from '../constants';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(private userRepository: Repository<User>) {}
    async create({ firstName, lastName, email, password }: UserData) {
        const user = await this.userRepository.findOne({ where: { email } });

        if (user) {
            const err = createHttpError(400, 'Email is already exists');
            throw err;
        }
        // hash password
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);
        try {
            const user = await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashPassword,
                role: Roles.CUSTOMER,
            });
            return user;
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store data in the database',
            );
            throw error;
        }
    }

    async findByEmailWithPassword(email: string) {
        return this.userRepository.findOne({
            where: {
                email,
            },
            select: [
                'id',
                'firstName',
                'lastName',
                'email',
                'role',
                'password',
            ],
        });
    }
}
