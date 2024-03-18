export interface JournalEntryCreateRequest {
    MessageHeader: {
      ID: string;
      CreationDateTime: string;
    };
    JournalEntry: {
      OriginalReferenceDocumentType: string;
      BusinessTransactionType: string;
      AccountingDocumentType: string;
      DocumentHeaderText: string;
      CreatedByUser: string;
      CompanyCode: string;
      DocumentDate: string;
      PostingDate: string;
      Item: any[];
    };
  }
  
export interface JournalEntryBulkCreateRequest {
    MessageHeader: {
      ID: string;
      CreationDateTime: string;
    };
    JournalEntryCreateRequest: JournalEntryCreateRequest;
  }
  
export interface SoapEnvelope {
    $: {
      'xmlns:soapenv': string;
      'xmlns:sfin': string;
      'xmlns:yy1': string;
    };
    'soapenv:Body': {
      'sfin:JournalEntryBulkCreateRequest': JournalEntryBulkCreateRequest;
    };
  }
  
export interface JsonData {
    'soapenv:Envelope': SoapEnvelope;
}