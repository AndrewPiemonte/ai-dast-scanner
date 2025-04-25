import { defineFunction } from '@aws-amplify/backend';

export const preSignUpValidator = defineFunction({
  environment:{
    ALLOWED_DOMAINS: process.env.ALLOWED_DOMAINS || '',
  },
  name: 'preSignUpValidator',
  entry: './preSignUpHandler.ts'
});