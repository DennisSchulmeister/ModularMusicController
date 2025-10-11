import logging from "logging";

/**
 * Logger for outputting info messages, warnings, and errors
 * with the methods `info()`, `warning()`, and `error()`.
 */
export const logger = logging("main");

/**
 * Utility function for throwing an error that is sent to the client as a JSON-formated
 * error object. Basically this just throws a `new Error()` as an exception, but adds
 * the error name and HTTP status code.
 * 
 * @param name Technical error name
 * @param message Readable error message
 * @param status HTTP status code (default: 400)
 * @returns never
 */
export function throwError(name: string, message: string, status?: number): never {
    let error = new Error(message || "");
    error.name = name || "Error";
    (error as any).httpStatus = status || 400;

    throw error;
}

/**
 * Utility function for throwing an HTTP 404 (Not Found) error.
 * 
 * @returns never
 */
export function throwNotFound(): never {
    throwError("NOT-FOUND", "Not found", 404);
}
