/*
https://docs.nestjs.com/providers#services
*/

import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { HttpStatusCode } from 'axios';
import * as xml2js from 'xml2js';

@Injectable()
export class NominaInfraestructureService {
  logItems;
  logItemsSucess;

  async createJornalEntry(xml) {
    const destinoConfig = JSON.parse(process.env.Destino);
    const username = destinoConfig.User;
    const password = destinoConfig.Password;
    const url = destinoConfig.Url

      const response = await axios.post(
        url,
        xml,
        {
          auth: {
            username: username,
            password: password
          },
          headers: {
            'Content-Type': 'text/xml',
          },
        }
      );
      xml2js.parseString(response.data, (err, result) => {
        this.logItems = result['soap-env:Envelope']['soap-env:Body'][0]['n0:JournalEntryBulkCreateConfirmation'][0]['JournalEntryCreateConfirmation'][0]['Log'][0];
        this.logItemsSucess = result['soap-env:Envelope']['soap-env:Body'][0]['n0:JournalEntryBulkCreateConfirmation'][0]['JournalEntryCreateConfirmation']
      });
      if(this.logItems.MaximumLogItemSeverityCode == '3'){
        throw this.logItems;
      }else{
        return {statusCode: HttpStatusCode.Created,response:this.logItemsSucess}
      }
   
  }
}

