# Service Layer Architecture

This directory contains the service layer for the application, providing a centralized and consistent way to handle business logic and data operations.

## Structure

```
services/
├── base/           # Base utilities and types
├── auth/           # Authentication services
├── profile/        # Profile management services
├── trainer/        # Trainer-specific services
├── client/         # Client-specific services
├── messaging/      # Messaging and communication services
├── payment/        # Payment and transaction services
└── types.ts        # Shared types
```

## Principles

1. **Single Responsibility**: Each service handles one domain
2. **Error Handling**: Consistent error handling via ServiceError
3. **Type Safety**: Full TypeScript support
4. **Testability**: Services are easily testable in isolation
5. **Reusability**: Services can be used across components and hooks

## Usage Example

```typescript
import { ProfileService } from '@/services/profile';

// In a component or hook
const result = await ProfileService.getProfile(userId);

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```
