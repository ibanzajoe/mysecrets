import { Request, Response, NextFunction } from 'express';
import { db as pool } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config'; 
import { LoginSchema, RegistrationSchema, UserSchema } from '../schema/users.schema';
import { sql } from 'slonik';
// Import Zod schemas for validation and result typing (from schema.ts or validators.ts)
// Optional: Import custom error classes
// import { AuthenticationError, NotFoundError, ValidationError } from '@/lib/errors.js';
// Optional: Import utility functions
// import { generateToken } from '@/utils/jwt.util.js';


// Define the shape expected for registration (matching Zod Schema)
type UserRegistrationInput = z.infer<typeof RegistrationSchema>;
// Define the shape expected for login (matching Zod Schema)
type UserLoginInput = z.infer<typeof LoginSchema>;

type Unit =
        | "Years"
        | "Year"
        | "Yrs"
        | "Yr"
        | "Y"
        | "Weeks"
        | "Week"
        | "W"
        | "Days"
        | "Day"
        | "D"
        | "Hours"
        | "Hour"
        | "Hrs"
        | "Hr"
        | "H"
        | "Minutes"
        | "Minute"
        | "Mins"
        | "Min"
        | "M"
        | "Seconds"
        | "Second"
        | "Secs"
        | "Sec"
        | "s"
        | "Milliseconds"
        | "Millisecond"
        | "Msecs"
        | "Msec"
        | "Ms";

type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>;

type StringValue =
    | `${number}`
    | `${number}${UnitAnyCase}`
    | `${number} ${UnitAnyCase}`;
// --- Controller Functions ---

/**
 * @description Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const registerUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // 1. Validate Input (using Zod schema)
        // If not using validation middleware, validate here:
        const validationResult = RegistrationSchema.safeParse(req.body);
        if (!validationResult.success) {
            // throw new ValidationError('Invalid registration data', validationResult.error.errors);
            res.status(400).json({ message: "Validation failed", errors: validationResult.error.errors });
            return;
        }
        const { email, password, first_name, last_name /* other fields */ }: UserRegistrationInput = validationResult.data;

        // 2. Check if user already exists (example using Slonik + Zod for result)
        const existingUser = await pool.maybeOne(sql.type(z.object({ id: z.string().uuid() }))`
            SELECT id FROM users WHERE email = ${email}
        `);

        if (existingUser) {
            // throw new ValidationError('Email already in use');
             res.status(409).json({ message: "Email already in use" }); // 409 Conflict
             return;
        }

        // 3. Hash Password
        const saltRounds = 10; // Store in config ideally
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Create User in DB (using Slonik + Zod for result)
        // Select only necessary fields for the response/token generation
        const newUser = await pool.one(sql.type(UserSchema.omit({ password: true }))`
            INSERT INTO users (email, password, first_name, last_name)
            VALUES (${email}, ${hashedPassword}, ${first_name}, ${last_name})
            RETURNING id, email, role, status, first_name, last_name, created_at, updated_at
        `);

        // 5. Generate JWT (or session token)
        const payload = { userId: newUser.id, role: newUser.role };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: `${config.jwtExpiresIn}` as StringValue });

        // 6. Send Response (excluding sensitive data like password)
        res.status(201).json({
            message: 'User registered successfully',
            user: newUser, // Contains the fields selected in the RETURNING clause
            token: token
        });

    } catch (error) {
        // Pass error to the central error handling middleware
        next(error);
    }
};

/**
 * @description Authenticate user and get token
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
     try {
        // 1. Validate Input
        const validationResult = LoginSchema.safeParse(req.body);
         if (!validationResult.success) {
            res.status(400).json({ message: "Validation failed", errors: validationResult.error.errors });
            return;
        }
        const { email, password }: UserLoginInput = validationResult.data;

        // 2. Find User by Email (Select password for comparison!)
        // Define a specific Zod schema for this query including the password
        const UserWithPasswordSchema = UserSchema.extend({ password: z.string() });
        const user = await pool.maybeOne(sql.type(UserWithPasswordSchema)`
            SELECT id, email, password, role, status, first_name, last_name /* other needed fields */
            FROM users
            WHERE email = ${email}
        `);

        // 3. Check if user exists and password is correct
        if (!user) {
             // throw new AuthenticationError('Invalid credentials');
             res.status(401).json({ message: "Invalid credentials" }); // Use 401 Unauthorized
             return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
             // throw new AuthenticationError('Invalid credentials');
             res.status(401).json({ message: "Invalid credentials" });
             return;
        }

         // Optional: Check user status (e.g., if banned)
         if (user.status !== 'active') {
            res.status(403).json({ message: 'Account is not active.' }); // 403 Forbidden
            return;
         }

        // 4. Generate JWT
        const payload = { userId: user.id, role: user.role };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: `${config.jwtExpiresIn}` as StringValue });

        // 5. Send Response (exclude password!)
        const { password: _, ...userWithoutPassword } = user; // Simple way to omit password

        res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword,
            token: token
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @description Get current logged-in user's profile
 * @route GET /api/auth/me
 * @access Private (Requires valid token)
 */
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.id; // Get user ID from the token payload attached by middleware

        if (!userId) {
            // This shouldn't happen if middleware is working, but good practice to check
            res.status(401).json({ message: "Not authenticated" });
            return;
        }

        // Fetch user details from DB based on ID from token
        // Use the UserSchema (omitting password)
        const userProfile = await pool.maybeOne(sql.type(UserSchema.omit({ password: true }))`
            SELECT id, email, role, status, first_name, last_name, created_at, updated_at
            FROM users
            WHERE id = ${userId} AND status = 'active'
        `);

        if (!userProfile) {
            // User ID from token doesn't exist or is inactive (maybe deleted/banned after token issued)
            res.status(404).json({ message: "User not found or inactive" });
            return;
        }

        res.status(200).json(userProfile);

    } catch (error) {
        next(error);
    }
};

// Implement logoutUser, refreshToken controllers if needed...