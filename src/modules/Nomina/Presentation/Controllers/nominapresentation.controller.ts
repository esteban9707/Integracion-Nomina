import {
  Controller,
  UploadedFile,
  Post,
  UseInterceptors,
  Body,
  Get,
  HttpException,
  HttpStatus,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NominaAplicationService } from '../../Aplication/Services/nominaaplication.service';
import { RequestBodyProcessJournal } from '../../Domain/Interfaces/RequestBodyProcessJournal';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { HttpStatusCode } from 'axios';

@Controller('api/v1/journal')
export class NominaPresentationController {
  constructor(
    private readonly _nominaAplicationService: NominaAplicationService,
  ) {}


  @Post('/upload')
  @UseInterceptors(FileInterceptor('File'))
  async processJournalEntry(@UploadedFile() file, @Body() requestBody: RequestBodyProcessJournal): Promise<any> {
    try {
      if (!file || !requestBody.CompanyCode || !requestBody.CurrencyCode) {
        throw new BadRequestException('Invalid request parameters');
      }
      const fileContent = file.buffer.toString('utf-8');
      return await this._nominaAplicationService.processJournalEntry(fileContent, requestBody);
      
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          error: error.message,
        }, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error || 'Internal server error',
        }, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  

}
