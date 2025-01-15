import { createLogger } from "./Boilerplate/Logging/LoggingService";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";
import helmet from "helmet";
import { compressionMiddleware, corsOptions, createValidationPipe, cspOptions, rateLimiting } from "./helper/settings";
import { Logger } from "nestjs-pino";
import { GlobalErrorHandler } from "./middleware/ErrorHandler";

export async function createApp(app: INestApplication): Promise<INestApplication> {
    /*
        in this project we don't need any sort of compression, the responses are small
        but it is good to have it if the responses become larger and the function should be improved
    */
    //app.use(compressionMiddleware());
    app.use(helmet());

    // Extend Helmet to configure X-Frame-Options to prevent clickjacking
    app.use(helmet.frameguard({ action: 'deny' }));

    // Helmet's content security policy with the provided options to enhance security by defining allowed content sources.
    app.use(helmet.contentSecurityPolicy(cspOptions));

    app.use(rateLimiting);

    app.enableCors(corsOptions);

    app.useGlobalPipes(createValidationPipe());

    const logger = app.get(Logger);
    app.useGlobalFilters(new GlobalErrorHandler(logger));

    const config = new DocumentBuilder()
        .setTitle("resivo Coding Challenge")
        .setDescription("The place where candidates shine :)")
        .setVersion("1.0")
        .addTag("resivo")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);

    const bootstrapLogger = createLogger("bootstrap");
    bootstrapLogger.info("Application configured successfully");
    
    return app;
}
