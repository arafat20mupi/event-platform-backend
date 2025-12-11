import { UserRole, UserStatus } from "@prisma/client";
import { z } from "zod";


const createUser = z.object({
    password: z.string(),
    user: z.object({
        email: z
            .email(),
        name: z.string({
            error: "Name is required!",
        }),
        contactNumber: z.string({
            error: "Contact number is required!",
        }).optional(),
        address: z.string({
            error: "Address is required",
        }).optional(),
    }),
});

const createAdmin = z.object({
    password: z.string(),
    user: z.object({
        email: z.email(),
        name: z.string({
            error: "Name is required!",
        }),
        contactNumber: z.string({
            error: "Contact number is required!",
        }).optional(),
        address: z.string({
            error: "Address is required",
        }).optional(),
        role: z.enum([UserRole.ADMIN]),
    }),
});


const createHost = z.object({
    password: z.string(),
    Host: z.object({
        email: z.email(),
        name: z.string({
            error: "Name is required!",
        }),
        contactNumber: z.string({
            error: "Contact number is required!",
        }).optional(),
        bio: z.string().optional(),
        location: z.string().optional(),
        role: z.enum([UserRole.HOST]),
        isVerified: z.boolean().optional(),
        isDeleted: z.boolean().optional(),
    }),
});

export const userValidation = {
    createUser,
    createAdmin,
    createHost
};