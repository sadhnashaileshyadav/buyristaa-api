import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { TransformInterceptor } from './lib/Interceptors/transform-interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        return new UnprocessableEntityException({
          statusCode: 400,
          error: 'Unprocessable Entity',
          message: errors.reduce(
            (acc, e) => ({
              ...acc,
              [e.property]: Object.values(e.constraints),
            }),
            {},
          ),
        });
      },
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
