import {
  Controller,
  UploadedFile,
  Post,
  UseInterceptors,
  Body,
  Get,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NominaAplicationService } from '../../Aplication/Services/nominaaplication.service';
import { RequestBodyProcessJournal } from '../../Domain/Interfaces/RequestBodyProcessJournal';

@Controller('api/v1/journal')
export class NominaPresentationController {
  constructor(
    private readonly _nominaAplicationService: NominaAplicationService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('File'))
  async processJournalEntry(@UploadedFile() file, @Body() requestBody: RequestBodyProcessJournal): Promise<any> {
    try {
      if (file) {
        const fileContent = file.buffer.toString('utf-8');
        return await this._nominaAplicationService.processJournalEntry(
          fileContent, requestBody
        );
      }
    } catch (error) {
      return new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('/upload')
  async get(){
    throw new HttpException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error: "logItems",
    }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
