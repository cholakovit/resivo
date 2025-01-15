import * as zlib from 'zlib';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { PassThrough } from 'stream';

export const rateLimiting = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 20, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Define the Content Security Policy
export const cspOptions = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'", "https:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
};

// Define CORS options
export const corsOptions = {
  origin: process.env.CORS_ORIGIN,  // Only allow this origin to access your API
  methods: process.env.CORS_METHODS, // Allow only these HTTP methods
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS, // Allow only these headers
  credentials: true // Allow cookies to be sent
};

export function compressionMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    let compressStream: zlib.BrotliCompress | zlib.Gzip | PassThrough = new PassThrough();

    // Ако клиентът поддържа Brotli
    if (acceptEncoding.includes('br')) {
      res.setHeader('Content-Encoding', 'br');
      compressStream = zlib.createBrotliCompress();
    }
    // Ако клиентът поддържа Gzip
    else if (acceptEncoding.includes('gzip')) {
      res.setHeader('Content-Encoding', 'gzip');
      compressStream = zlib.createGzip({ level: 1 });
    } else {
      res.setHeader('Content-Encoding', 'identity');
    }

    // Насочване на потока към компресиращия стрийм
    const originalWrite = res.write.bind(res);
    const originalEnd = res.end.bind(res);

    res.write = (chunk: any, encoding?: BufferEncoding | ((error?: Error | null) => void), cb?: (error?: Error | null) => void): boolean => {
      if (compressStream) {
        if (typeof encoding === 'function') {
          compressStream.write(chunk, undefined, encoding);
        } else {
          compressStream.write(chunk, encoding, cb);
        }
        return true;
      }
      return false;
    };

    res.end = (chunk?: any, encoding?: BufferEncoding | ((error?: Error | null) => void), cb?: (error?: Error | null) => void): Response => {
      if (compressStream) {
        if (typeof encoding === 'function') {
          compressStream.end(chunk, undefined, encoding);
        } else {
          compressStream.end(chunk, encoding, cb);
        }
      }
      return res;
    };

    compressStream.on('data', (chunk) => originalWrite(chunk));
    compressStream.on('end', () => originalEnd());
    compressStream.on('error', (err) => {
      console.error('Compression error:', err);
      originalEnd();
    });

    next();
  };
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
          return new BadRequestException(
              errors.map(
                  (error) =>
                      `${error.property}: ${Object.values(error.constraints).join(', ')}` // Format error message
              )
          );
      },
  });
}