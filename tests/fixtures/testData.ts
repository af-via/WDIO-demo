import type { UserCredentials } from '../../src/types';

export const users = {
  validUser: {
    username: process.env.TEST_USERNAME || 'testuser@example.com',
    password: process.env.TEST_PASSWORD || 'Password123!',
  } as UserCredentials,

  invalidUser: {
    username: 'invalid@example.com',
    password: 'wrongpassword',
  } as UserCredentials,

  emptyUser: {
    username: '',
    password: '',
  } as UserCredentials,
};

export const searchTerms = {
  valid: 'Product Name',
  noResults: 'xyzzy_no_results_12345',
};
