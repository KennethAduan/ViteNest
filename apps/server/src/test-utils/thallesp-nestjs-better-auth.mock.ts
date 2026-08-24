import { createParamDecorator } from '@nestjs/common';

export const AllowAnonymous = () => () => undefined;
export const OptionalAuth = () => () => undefined;
export const Roles = (_roles: string[]) => () => undefined;
export const Session = createParamDecorator(() => undefined);

export class AuthService<T = unknown> {
  get api(): T extends { api: infer Api } ? Api : never {
    throw new Error('AuthService is mocked in tests; provide a useValue.');
  }
  get instance(): T {
    throw new Error('AuthService is mocked in tests; provide a useValue.');
  }
}
