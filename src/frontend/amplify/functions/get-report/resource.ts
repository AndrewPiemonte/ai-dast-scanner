import { defineFunction } from '@aws-amplify/backend'

export const getReport = defineFunction({
    name: 'get-zap-report',
    entry: './handler.ts'
})