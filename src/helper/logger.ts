import { Module } from "@nestjs/common";
import { LoggerModule } from "nestjs-pino";
import pino from "pino";
import { multistream } from "pino-multi-stream";
import * as fs from "fs";
import * as path from "path";

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