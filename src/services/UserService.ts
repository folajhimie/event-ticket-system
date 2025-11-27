import { prisma } from '../../src/lib/prisma';
import { User } from '../../generated/prisma/client';

export class UserService {
    async createUser(email: string, name: string): Promise<User> {
        if (!email || !name) {
            throw new Error('Email and name are required');
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        return await prisma.user.create({
            data: {
                email,
                name,
            },
        });
    }

    async getUserById(userId: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id: userId },
            include: {
                bookings: {
                    include: {
                        event: {
                            select: {
                                name: true,
                                totalTickets: true,
                                availableTickets: true,
                            },
                        },
                    },
                    orderBy: { bookingTime: 'desc' },
                },
                waitingList: {
                    include: {
                        event: {
                            select: {
                                name: true,
                                totalTickets: true,
                                availableTickets: true,
                            },
                        },
                    },
                    orderBy: { joinedAt: 'asc' },
                },
            },
        });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    async getAllUsers(): Promise<User[]> {
        return await prisma.user.findMany({
            include: {
                bookings: {
                    select: {
                        id: true,
                        status: true,
                        bookingTime: true,
                    },
                },
                waitingList: {
                    select: {
                        id: true,
                        joinedAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateUser(userId: string, data: { name?: string; email?: string }): Promise<User> {
        if (data.email) {
            // Check if email is already taken by another user
            const existingUser = await prisma.user.findUnique({
                where: { email: data.email },
            });

            if (existingUser && existingUser.id !== userId) {
                throw new Error('Email is already taken by another user');
            }
        }

        return await prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async deleteUser(userId: string): Promise<void> {
        await prisma.user.delete({
            where: { id: userId },
        });
    }
}

export default new UserService();