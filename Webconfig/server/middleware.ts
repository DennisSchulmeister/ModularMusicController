import { Request, Response, NextFunction, ErrorRequestHandler, RequestHandler } from 'express';

/**
 * This function creates an Express middleware that logs a line to the console
 * for each received request.
 * 
 * @param logger Logger for console output
 * @returns Express middleware function
 */

export function logRequest(logger: { info: (msg: string) => void }): RequestHandler {
    return function(req: Request, res: Response, next: NextFunction) {
        logger.info(`${req.method} ${req.originalUrl}`);
        next();
    }
}

/**
 * This function creates an Express middleware for handling errors and uncaught exceptions.
 * These are logged to the console and sent to the client in JSON format.
 * 
 * @param logger Logger for console output
 * @returns Express middleware function
 */
export function handleError(logger: { error: (err: unknown) => void }): ErrorRequestHandler {
    return function (err: any, req: Request, res: Response, next: NextFunction) {
        logger.error(err);
        
        if (!err.httpStatus) console.error(err);

        res.status(err.httpStatus || 500);
        
        res.send({
            error:   err.name    || "Error",
            message: err.message || "",
        });

        next();
    }
}