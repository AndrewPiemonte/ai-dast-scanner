import { defineFunction } from '@aws-amplify/backend';

export const preSignUpValidator = defineFunction({
  name: 'preSignUpValidator',
  entry: './preSignUpHandler.ts'
});