import { ILogger } from "@hardcodet/logging-js";
import { createLogger } from "./LoggingService";


export abstract class LogEnabled {

    protected logger: ILogger;


    protected constructor(loggerName?: string) {
        this.logger = createLogger(loggerName || this.constructor.name);
    }
}
