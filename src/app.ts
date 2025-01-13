import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { createLogger } from "./Boilerplate/Logging/LoggingService";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";
import helmet from "helmet";
import { rateLimiting } from "./helper/rateLimiting";
import { Logger } from "nestjs-pino";
import { GlobalErrorHandler } from "./middleware/ErrorHandler";

export async function createApp(app: INestApplication): Promise<INestApplication> {
    app.use(helmet());
    app.use(rateLimiting);
    app.enableCors({ 
        origin: process.env.CORS_ORIGIN,
        methods: process.env.CORS_METHODS,
        credentials: true,
        allowedHeaders: process.env.CORS_ALLOWED_HEADERS,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors) => {
                return new BadRequestException(
                    errors.map(
                        (error) =>
                            `${error.property}: ${Object.values(error.constraints).join(", ")}` // Format error message
                    )
                );
            },
        })
    );

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
