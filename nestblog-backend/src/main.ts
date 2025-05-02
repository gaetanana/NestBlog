// src/main.ts - Fixed version
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Updated CORS configuration to be more permissive during development
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // Allow both frontend and backend origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3001);
}
bootstrap();
