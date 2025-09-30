import { ServiceError as ServiceErrorClass } from './ServiceError';
import type { ServiceResponse, ServiceError } from '../types';

/**
 * Helper functions to create standardized service responses
 */

export const ServiceResponseHelper = {
  success<T>(data: T): ServiceResponse<T> {
    return {
      success: true,
      data,
    };
  },

  error<T = never>(error: ServiceError | ServiceErrorClass): ServiceResponse<T> {
    if (error instanceof ServiceErrorClass) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }

    return {
      success: false,
      error,
    };
  },

  fromPromise<T>(promise: Promise<T>): Promise<ServiceResponse<T>> {
    return promise
      .then((data) => this.success(data))
      .catch((error) => this.error(ServiceErrorClass.fromError(error)));
  },
};
