import { NestFactory } from "@nestjs/core";
import { AppModule } from "./AppModule";
import { ValidationPipe } from "@nestjs/common";
import { createLogger } from "./Boilerplate/Logging/LoggingService";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true, logger: ["error", "warn"] });
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));

    const config = new DocumentBuilder()
        .setTitle('resivo Coding Challenge')
        .setDescription('The place where candidates shine :)')
        .setVersion('1.0')
        .addTag('resivo')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const logger = createLogger("bootstrap");
    logger.info("Application running. Swagger UI available @ http://localhost:3000/api");
    await app.listen(3000);
}


bootstrap();
