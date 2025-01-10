import { NestFactory } from "@nestjs/core";
import { AppModule } from "./AppModule";
import { createApp } from "./app";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ["error", "warn"], 
    });

    await createApp(app); 
    await app.listen(process.env.PORT, process.env.HOST); 

    console.log(`Application running. Swagger UI available @ http://${process.env.HOST}:${process.env.PORT}/api`);
}

bootstrap();
