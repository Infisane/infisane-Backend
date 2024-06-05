export interface IResponse {
  statusCode: number;
  message: string;
  data?: { [key: string]: any } | null;
  error?: {
    code?: string;
    message?: string;
    details?: any;
  } | null;
}
