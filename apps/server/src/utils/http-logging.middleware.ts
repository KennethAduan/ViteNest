import { Logger } from '@nestjs/common';
import type {
  Express,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

const logger = new Logger('HTTP');

export function httpLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const started = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const message = `${method} ${url} ${res.statusCode} ${Date.now() - started}ms`;

    if (res.statusCode >= 500) {
      logger.error(message);
      return;
    }

    logger.log(message);
  });

  next();
}

/** Run before Better Auth's httpAdapter.use handler. */
export function prependExpressMiddleware(
  app: Express,
  middleware: RequestHandler,
): void {
  const router = app._router as
    { stack: Array<{ route?: unknown; handle: RequestHandler }> } | undefined;

  if (router?.stack) {
    router.stack.unshift({ route: undefined, handle: middleware });
    return;
  }

  app.use(middleware);
}
