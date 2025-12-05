import { EventCategory } from '@prisma/client';
import { Request } from 'express';
import prisma from '../../../shared/prisma';

const createEventsCetegory = async (req: Request): Promise<EventCategory> => {
    const { name } = req.body;
    const newCategory = await prisma.eventCategory.create({
        data: {
            name
        },
    });
    return newCategory;
};

const getEventsCetegories = async (): Promise<EventCategory[]> => {
    const categories = await prisma.eventCategory.findMany();
    return categories;
}

export const eventsCetegoryService = {
    createEventsCetegory,
    getEventsCetegories,
};