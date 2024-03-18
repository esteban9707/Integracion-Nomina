import { NominaAplicationService } from './modules/Nomina/Aplication/Services/nominaaplication.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NominaModule } from './modules/Nomina/nomina.module';
import { NominaPresentationController } from './modules/Nomina/Presentation/Controllers/nominapresentation.controller';
import { NominaInfraestructureService } from './modules/Nomina/Infraestructure/nominainfraestructure.service';

@Module({
  imports: [NominaModule],
  controllers: [AppController, NominaPresentationController],
  providers: [NominaInfraestructureService, NominaAplicationService, AppService, ],
})
export class AppModule {}
