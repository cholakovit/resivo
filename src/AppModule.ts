import { MiddlewareConsumer, Module } from "@nestjs/common";
import { RootController } from "./App/RootController";
import { UserService } from "./Boilerplate/Users/UserService";
import { DoorService } from "./Coding Challenge/Doors/Services/DoorService";
import { DoorRepository } from "./Coding Challenge/Doors/Repositories/DoorRepository";
import { UserRepository } from "./Boilerplate/Users/Data/UserRepository";
import { PinCodeRegistrationService } from "./Coding Challenge/PinCodes/Services/PinCodeRegistrationService";
import { PinCodeRegistrationController } from "./Coding Challenge/PinCodes/Controllers/PinCodeRegistrationController";
import { AccessRequestController } from "./Coding Challenge/Doors/Controllers/AccessRequestController";
import { PinCodeRegistrationRepository } from "./Coding Challenge/PinCodes/Repositories/PinCodeRegistrationRepository";
import { SanitizeRequestsMiddleware } from "./middleware/SanitizeRequests";
import { AppLoggerModule } from "./helper/logger";
import { rateLimiting } from "./helper/rateLimiting";

@Module({
    imports: [AppLoggerModule],
    controllers: [RootController, PinCodeRegistrationController, AccessRequestController],
    providers: [
        PinCodeRegistrationService,
        PinCodeRegistrationRepository,
        DoorService,
        UserService,
        UserRepository,
        DoorRepository
    ]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(rateLimiting, SanitizeRequestsMiddleware)
            .forRoutes('*')
    }
}
