import { UserRole } from "@prisma/client";
import { z } from "zod";

const createUser = z.object({
    password: z.string(),
    user: z.object({
        email: z
            .email(),
        name: z.string({
            error: "Name is required!",
        }),
        bio: z.string().optional(),
        interests: z.array(z.string()).optional(),
        location: z.string().optional(),
        profileImage: z.string().optional(),
        role: z.enum([UserRole.ADMIN, UserRole.USER]),
        status: z.enum(["ACTIVE", "INACTIVE"]),
    }),
});

export const userValidation = {
    createUser,
};