import './load-env';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import express, { Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
    const port = Number(process.env.PORT) || 3000;
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

    await app.listen(port, '0.0.0.0');
    Logger.log(`Application listening on 0.0.0.0:${port}`, 'Bootstrap');
}

void bootstrap().catch((error: unknown) => {
    Logger.error('Application failed to start', error, 'Bootstrap');
    process.exitCode = 1;
});
