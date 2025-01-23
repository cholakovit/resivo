import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import * as DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

/**
 * The SanitizeRequestsMiddleware class sanitizes incoming HTTP request data 
 * to protect against XSS and other vulnerabilities.
 *
 * Functionality:
 * - Sanitizes `req.body` and `req.query` by removing potentially harmful content from string values.
 * - Handles strings and arrays of strings but does not process nested objects or non-string values.
 * - Uses DOMPurify with JSDOM for sanitization.
 *
 * This middleware ensures that only clean and safe data reaches controllers or handlers.
 */

const window = new JSDOM("").window;
const purify = DOMPurify(window as unknown as typeof globalThis);

@Injectable()
export class SanitizeRequestsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    if (req.body && typeof req.body === "object")
      Object.keys(req.body).forEach((key: string) => {
        if (typeof req.body[key] === "string")
          req.body[key] = purify.sanitize(req.body[key]);
      });

    if (req.query)
      Object.keys(req.query).forEach((key: string) => {
        const value = req.query[key];
        if (typeof value === "string") req.query[key] = purify.sanitize(value);
        else if (Array.isArray(value))
          req.query[key] = (value as string[]).map((item: string) =>
            typeof item === "string" ? purify.sanitize(item) : item
          ) as string[];
      });

    next();
  }
}
