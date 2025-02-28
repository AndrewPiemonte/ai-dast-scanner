import { defineStorage } from '@aws-amplify/backend'

export const storage = defineStorage({
    name: 'AI-EnhancedReports',
    access: (allow) => ({
      'reports/{entity_id}/*': [
        allow.entity('identity').to(['read', 'write', 'delete'])
      ],
    })
  });