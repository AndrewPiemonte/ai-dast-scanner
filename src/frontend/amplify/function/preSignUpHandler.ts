import { PreSignUpTriggerEvent, Context } from 'aws-lambda';
import { env } from '$amplify/env/preSignUpValidator';

export const handler = async (event: PreSignUpTriggerEvent, _context: Context) => {
    const email = event.request.userAttributes.email;
    // Add/Change allowed email domains 
    const allowedDomains = env.ALLOWED_DOMAINS.split(',').map((domain: string) => domain.trim().toLowerCase());

    const domain = email?.split('@')[1]?.toLowerCase();

    if (!domain || !allowedDomains.includes(domain)) {
        const error = new Error('Error validating email domain during pre-signup');
        throw error;
    }

    return event;
};