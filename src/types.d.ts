export {};

declare global {
    type AccessRestrictions = {
        validFrom?: Date;
        validTo?: Date;
    };


    type IApiError = {
        statusCode: number;
        status: string;
        message: string;
      }

      type Registration = {
        userId: string;
        pinCode: string;
        doorsIds: string[];
      }

      type ApiErrorDetail = {
        field: string; 
        message: string; 
      }

}