import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getServices } from '@sap/xsenv';
const xsuaa = getServices({ xsuaa: { tag: 'xsuaa' } }).xsuaa;

import * as passport from 'passport';
import { JWTStrategy } from '@sap/xssec';
passport.use(new JWTStrategy(xsuaa));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(passport.initialize());
  app.use(passport.authenticate('JWT', { session: false }));
  await app.listen(8080);
}
bootstrap();
