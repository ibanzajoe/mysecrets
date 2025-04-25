// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { SlonikError } from 'slonik'; // Import specific Slonik error types if needed

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): Promise<any> => {
    console.error("Error occurred:", err.stack); // Log the error stack trace

    // Handle specific error types if needed
    if (err instanceof SlonikError) {
        // Handle Slonik specific errors (e.g., UniqueIntegrityConstraintViolationError)
        return res.status(400).json({ message: 'Database error occurred', error: err.message }); // Be careful not to expose sensitive details
    }

    // Handle Zod validation errors (if using Zod globally)
    // if (err instanceof ZodError) {
    //   return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    // }

    // Generic error handler
    res.status(500).json({
        message: 'Internal Server Error',
        // Only include error details in development
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
};