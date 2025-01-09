import { Request } from "express";
import { LogEnabled } from "../Logging/LogEnabled";
import { ForbiddenException } from "@nestjs/common";

export abstract class ControllerBase extends LogEnabled {

    constructor(protected readonly request: Request) {
        super();
    }

    protected getUserId() {
        const userId = this.request.headers["x-user-id"] as string;
        if(!userId) {
            const msg = "Missing 'x-user-id' header - please provide one to simulate authenticated calls."
            this.logger.warn(msg);
            throw new ForbiddenException(msg);
        }

        return userId;
    }
}
