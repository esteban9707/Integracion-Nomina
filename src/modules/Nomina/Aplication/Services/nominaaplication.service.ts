import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { parseString } from 'xml2js';
import * as xml2js from 'xml2js';
import { promisify } from 'util';
import { NominaInfraestructureService } from '../../Infraestructure/nominainfraestructure.service';
import { RequestBodyProcessJournal } from '../../Domain/Interfaces/RequestBodyProcessJournal';
import { Console } from 'console';
const uuid = require('uuid');
const short = require('short-uuid');
const translator = short();

@Injectable()
export class NominaAplicationService {
  constructor(
    private readonly nominaInfraestructureService: NominaInfraestructureService,
  ) {}

  //Procesa el asiento contable
  async processJournalEntry(fileContent: string, requestBody: RequestBodyProcessJournal) {  
      const xmlObject = await this.parseXmlString(fileContent);
      const journalEntry = await this.mappingFields(xmlObject, requestBody);
      const response = await this.createJornalEntry(
        journalEntry,
      );
      return response;
    
  }

  //Convierte la cadena string en json
  async parseXmlString(xmlString: string): Promise<any> {
    const parseStringPromise = promisify(parseString);
      const result = await parseStringPromise(xmlString, {
        explicitArray: false,
        ignoreAttrs: true,
      });
      return result;

  }

  //Mapea los campos de B1 y S4HC
  async mappingFields(xmlString, requestBody:RequestBodyProcessJournal) {
    try {
      var sid = translator.generate();
      var date = new Date().toISOString();
      //Obtiene el encabezado del asiento de b1
      var JournalEntry = xmlString.BOM?.BO?.OJDT?.row;
      //Obtiene las lines del asiento de b1
      var JournalEntryItems = xmlString.BOM?.BO?.JDT1?.row;
      const refDate = `${JournalEntry.RefDate.substring(
        0,
        4,
      )}-${JournalEntry.RefDate.substring(
        4,
        6,
      )}-${JournalEntry.RefDate.substring(6, 8)}`;
      //Mapea el enzabezado del asiento
      const jsonData = await this.createSoapEnvelope(
        sid,
        date,
        JournalEntry,
        refDate,
        requestBody.CompanyCode
      );
      const items =
        jsonData['soapenv:Envelope']['soapenv:Body'][
          'sfin:JournalEntryBulkCreateRequest'
        ]['JournalEntryCreateRequest']['JournalEntry']['Item'];
      //Mapea los items del asiento
      const mappedItems = await this.mapXmlItemsToJournalEntryItems(
        JournalEntryItems, requestBody.CurrencyCode
      );
      items.push(...mappedItems);
      //Convierte el json a xml
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(jsonData);
      return xml;
    } catch (error) {
      return error;
    }
  }

  //Crea el encabezado del asiento contable
  async createSoapEnvelope(sid, date, JournalEntry, refDate, companyCode) {
    try {
      return {
        'soapenv:Envelope': {
          $: {
            'xmlns:soapenv': 'http://schemas.xmlsoap.org/soap/envelope/',
            'xmlns:sfin': 'http://sap.com/xi/SAPSCORE/SFIN',
            'xmlns:yy1': 'http://SAPCustomFields.com/YY1_',
          },
          'soapenv:Body': {
            'sfin:JournalEntryBulkCreateRequest': {
              MessageHeader: {
                ID: sid,
                CreationDateTime: date,
              },
              JournalEntryCreateRequest: {
                MessageHeader: {
                  ID: sid,
                  CreationDateTime: date,
                },
                JournalEntry: {
                  OriginalReferenceDocumentType: 'BKPFF',
                  BusinessTransactionType: 'RFBU',
                  AccountingDocumentType: 'SA',
                  DocumentHeaderText: JournalEntry.Memo,
                  CreatedByUser: 'CC0000000047',
                  CompanyCode: companyCode,
                  DocumentDate: refDate,
                  PostingDate: refDate,
                  Item: [],
                },
              },
            },
          },
        },
      };  
    } catch (error) {
      return error;
    }
   
  }

  //Mapea los campos de las lineas de los asientos provenientes de b1 a los campos de S4HC
  async mapXmlItemsToJournalEntryItems(journalEntryItems, currencyCode) {
    try {
      return journalEntryItems.map((item) => {
        const DebitCreditCode = item.Debit > 0 ? 'S' : 'H';
        const AmountInTransactionCurrency =
          item.Debit > 0 ? item.Debit : -item.Credit;
        return {
          GLAccount: item.Account,
          AmountInTransactionCurrency: {
            $: {
              currencyCode: currencyCode,
            },
            _: AmountInTransactionCurrency,
          },
          DebitCreditCode,
          DocumentItemText: item.ShortName,
          AccountAssignment: {
            ProfitCenter: item.ProfitCode,
            'yy1:YY1_HBT_Tercero_S4': item.U_infoco01,
          },
        };
      });
    } catch (error) {
      return error;
    }
    
  }

  async createJornalEntry(journalEntry: any){
    try {
      const response = await this.nominaInfraestructureService.createJornalEntry(
        journalEntry,
      );
      return response;
    } catch (error) {
      return error
    }
  }
}
