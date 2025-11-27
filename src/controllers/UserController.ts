import { Request, Response } from 'express';
import UserService from '../services/UserService';
import { ApiResponse } from '../types';

export class UserController {
    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const { email, name } = req.body;

            if (!email || !name) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: 'Email and name are required'
                };
                res.status(400).json(response);
                return;
            }

            const user = await UserService.createUser(email, name);
            
            const response: ApiResponse<typeof user> = {
                success: true,
                data: user
            };
            res.status(201).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message
            };
            res.status(400).json(response);
        }
    }

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const user = await UserService.getUserById(userId as string);
            
            if (!user) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: 'User not found'
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse<typeof user> = {
                success: true,
                data: user
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message
            };
            res.status(400).json(response);
        }
    }

    async getUserByEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;

            const user = await UserService.getUserByEmail(email as string);
            
            if (!user) {
                const response: ApiResponse<null> = {
                    success: false,
                    error: 'User not found'
                };
                res.status(404).json(response);
                return;
            }

            const response: ApiResponse<typeof user> = {
                success: true,
                data: user
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message
            };
            res.status(400).json(response);
        }
    }

    async getAllUsers(req: Request, res: Response): Promise<void> {
        try {
            const users = await UserService.getAllUsers();
            
            const response: ApiResponse<typeof users> = {
                success: true,
                data: users
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message
            };
            res.status(500).json(response);
        }
    }

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { name, email } = req.body;

            const user = await UserService.updateUser(userId as string, { name, email });
            
            const response: ApiResponse<typeof user> = {
                success: true,
                data: user
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message
            };
            res.status(400).json(response);
        }
    }

    async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            await UserService.deleteUser(userId as string);
            
            const response: ApiResponse<null> = {
                success: true,
                data: null
            };
            res.status(200).json(response);
        } catch (error: any) {
            const response: ApiResponse<null> = {
                success: false,
                error: error.message
            };
            res.status(400).json(response);
        }
    }
}

export default new UserController();