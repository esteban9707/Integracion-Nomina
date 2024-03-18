/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads', // Carpeta donde se guardarán los archivos subidos
    }),
  ],
  controllers: [],
  providers: [],
})
export class NominaModule {}
