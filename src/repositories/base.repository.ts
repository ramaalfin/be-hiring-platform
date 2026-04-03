import prisma from "../prisma/client";

export interface IBaseRepository<T> {
    findById(id: string): Promise<T | null>;
    findMany(where?: any, options?: any): Promise<T[]>;
    create(data: any): Promise<T>;
    update(id: string, data: any): Promise<T>;
    delete(id: string): Promise<T>;
    count(where?: any): Promise<number>;
}

export abstract class BaseRepository<T> implements IBaseRepository<T> {
    constructor(protected model: any) { }

    async findById(id: string): Promise<T | null> {
        return this.model.findUnique({ where: { id } });
    }

    async findMany(where?: any, options?: any): Promise<T[]> {
        return this.model.findMany({ where, ...options });
    }

    async create(data: any): Promise<T> {
        return this.model.create({ data });
    }

    async update(id: string, data: any): Promise<T> {
        return this.model.update({ where: { id }, data });
    }

    async delete(id: string): Promise<T> {
        return this.model.delete({ where: { id } });
    }

    async count(where?: any): Promise<number> {
        return this.model.count({ where });
    }
}
