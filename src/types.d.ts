export {};

declare global {
    type AccessRestrictions = {
        validFrom: Date;
        validTo: Date;
    };


    type IApiError = {
        statusCode: number;
        status: string;
        message: string;
      }

}