import { ConsoleSink, LoggingStore } from "@hardcodet/logging-js";


// just log to the console

const loggingStore = new LoggingStore("Coding Challenge", "DEV", [new ConsoleSink()]);

export const createLogger = (context: string) => {
    return loggingStore.createLogger(context);
};
