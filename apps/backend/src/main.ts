import 'dotenv/config';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const staticPath = join(__dirname, '..', 'public');
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(express.static(staticPath));
  expressApp.get(
    /^(?!\/api(?:\/|$)).*/,
    (_request: Request, response: Response) => {
      response.sendFile(join(staticPath, 'index.html'));
    },
  );

  await app.init();
  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}

void bootstrap();
