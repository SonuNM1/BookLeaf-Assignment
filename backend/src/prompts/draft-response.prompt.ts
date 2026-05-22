import { KNOWLEDGE_BASE } from './knowledge-base.js';

// builds the system prompt — this is constant across all draft calls
// contains knowledge base + tone instructions
export const buildDraftSystemPrompt = (): string => {
  return `You are a senior support specialist at BookLeaf Publishing.
Your job is to write empathetic, accurate, and helpful responses to author support queries.

${KNOWLEDGE_BASE}

RESPONSE RULES:
- Address the author by their first name
- Acknowledge their concern in the first sentence
- Provide specific information based on the knowledge base
- Give concrete timelines where applicable
- End with a clear next step
- Keep response between 80-150 words
- Sound human and warm, not robotic
- Always sign off as "BookLeaf Support Team" never use placeholders like [Your Name]
- Never say "I hope this email finds you well" or similar filler phrases`;
};

// builds the user prompt — contains the specific ticket context
// we include relevant book data so AI can reference actual numbers
export const buildDraftUserPrompt = (
  authorName: string,
  subject: string,
  description: string,
  bookContext?: {
    title: string;
    status: string;
    royalty_pending: number;
    royalty_paid: number;
    total_copies_sold: number;
    last_royalty_payout_date: string | null;
  } | null
): string => {
  // only include book data if ticket is about a specific book
  // sending irrelevant data wastes tokens
  const bookSection = bookContext
    ? `
RELEVANT BOOK DATA:
- Title: ${bookContext.title}
- Status: ${bookContext.status}
- Total copies sold: ${bookContext.total_copies_sold}
- Royalty paid to date: ₹${bookContext.royalty_paid}
- Royalty pending: ₹${bookContext.royalty_pending}
- Last payout date: ${bookContext.last_royalty_payout_date || 'Never (no payout yet)'}
`
    : '';

  return `Write a response to this author support ticket.

AUTHOR NAME: ${authorName}
SUBJECT: ${subject}
AUTHOR'S MESSAGE: ${description}
${bookSection}
Write the response now:`;
};