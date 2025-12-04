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

export const userValidation = {
    createUser,
};