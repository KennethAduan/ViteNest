import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { Env } from './config/env';
import {
  httpLoggingMiddleware,
  prependExpressMiddleware,
} from './utils/http-logging.middleware';
import { TransformInterceptor } from './utils/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Better Auth needs raw body
  });
  const expressApp = app.getHttpAdapter().getInstance() as Express;
  prependExpressMiddleware(expressApp, httpLoggingMiddleware);

  const configService = app.get(ConfigService<Env, true>);
  app.enableCors({
    origin: configService.get('FRONT_END_URL', { infer: true }),
    credentials: true,
  });
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableShutdownHooks();
  await app.listen(configService.get('PORT'));
}
void bootstrap();
