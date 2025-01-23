import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import pino from "pino";
import { multistream } from "pino-multi-stream";
import * as fs from "fs";
import * as path from "path";

/**
 * AppLoggerModule configures centralized logging for the application using Pino and nestjs-pino.
 * 
 * Features:
 * - Logs are written to both the console and a file (`logs/app.log`).
 * - Uses `pino-pretty` for readable logs in development mode.
 * - Automatically creates the logs directory if it doesn't exist.
 * - Supports configurable log levels via the `LOG_LEVEL` environment variable.
 * - Ensures seamless logging for both development and production environments.
 */

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: () => {
        const logDir = path.resolve(__dirname, "../../logs/");

        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }

        const logFilePath = path.resolve(logDir, "app.log");

        const streams = [
          process.env.NODE_ENV !== "production"
            ? { stream: require("pino-pretty")() }
            : { stream: process.stdout },


          {
            stream: pino.destination({
              dest: logFilePath,
              minLength: 0,
              sync: true,
            }),
          },
        ];

        return {
          pinoHttp: {
            level: process.env.LOG_LEVEL,
            stream: multistream(streams),
          },
        };
      },
    }),
  ],
})
export class AppLoggerModule {}