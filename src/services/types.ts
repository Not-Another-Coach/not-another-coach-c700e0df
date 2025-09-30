/**
 * Common types used across all services
 */

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type ServiceMethod<TInput = void, TOutput = void> = 
  TInput extends void 
    ? () => Promise<ServiceResponse<TOutput>>
    : (input: TInput) => Promise<ServiceResponse<TOutput>>;
