import { PreSignUpTriggerEvent, Context } from 'aws-lambda';

export const handler = async (event: PreSignUpTriggerEvent, _context: Context) => {
    const email = event.request.userAttributes.email;
    // Add/Change allowed email domains 
    const allowedDomains = ['mail.ubc.ca', 'ubc.ca'];

    const domain = email?.split('@')[1]?.toLowerCase();

    if (!domain || !allowedDomains.includes(domain)) {
        const error = new Error('Only UBC email addresses are allowed to sign up');
        throw error;
    }

    return event;
};