/**
 * Common types used across all services
 */

// Re-export domain types for convenience
export * from './auth/types';
export * from './storage/types';
export * from './profile/types';
export * from './trainer/types';
export * from './client/types';
export * from './messaging/types';
export * from './payment/types';
export * from './admin/types';
export * from './notification/types';

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

// Common utility types
export type UUID = string;
export type Timestamp = string;
export type JSONValue = string | number | boolean | null | JSONObject | JSONArray;
export interface JSONObject { [key: string]: JSONValue; }
export interface JSONArray extends Array<JSONValue> {}

// Sort and filter types
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}
