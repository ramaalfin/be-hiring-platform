import { User } from "@prisma/client";
import prisma from "../prisma/client";
import { BaseRepository } from "./base.repository";

export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(data: {
        fullName: string;
        email: string;
        password: string;
        role?: "ADMIN" | "CANDIDATE";
    }): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<User>;
}

export class UserRepository extends BaseRepository<User> implements IUserRepository {
    constructor() {
        super(prisma.user);
    }

    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({ where: { email } });
    }

    async create(data: {
        fullName: string;
        email: string;
        password: string;
        role?: "ADMIN" | "CANDIDATE";
    }): Promise<User> {
        return prisma.user.create({ data });
    }
}

export const userRepository = new UserRepository();
