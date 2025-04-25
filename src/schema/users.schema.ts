import { z } from "zod";
import { ImageSchema } from "./images.schema";

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BANNED = 'banned',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  EMPLOYEE = 'employee'
}

export const AddressSchema = z.object({
  id: z.string().uuid().optional(),
  street: z.string().max(255),
  street2: z.string().max(255).optional(),
  city: z.string().max(255),
  state: z.string(),
  zip: z.string()
})

export const UserSchema = z.object({
    id: z.string().uuid().optional(),
    friendly_id: z.number().optional(),
    email: z.string().email(),
    password: z.string(),
    session_token: z.string().nullable().optional(),
    password_reset_token: z.string().nullable().optional(),
    role: z.nativeEnum(UserRole),
    status: z.nativeEnum(UserStatus),
    first_name: z.string().max(255).nullable().optional(),
    last_name: z.string().max(255).nullable().optional(),
    send_news_letter: z.boolean().default(false),
    billing_address: AddressSchema.optional(),
    shipping_address: AddressSchema.optional(),
    phone: z.string().max(255).nullable().optional(),
    created_at: z.coerce.date().optional(), // TIMESTAMPTZ
    updated_at: z.coerce.date().optional(), // TIMESTAMPTZ
});

export const LoginSchema = z.object({
    email: z.string(),
    password: z.string()
})

export const RegistrationSchema = z.object({
    email: z.string(),
    password: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
});

export type TLoginSchema = z.infer<typeof LoginSchema>;
export type TRegistrationSchema = z.infer<typeof RegistrationSchema>;
export type TUserSchema = z.infer<typeof UserSchema>;
export type TCurrentUser = Omit<TUserSchema, 'password'>;