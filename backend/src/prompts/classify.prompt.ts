import type { TicketCategory, TicketPriority } from "../types/index.js";

// exact JSON structure we expect from the AI 

export interface ClassificationResult {
    category: TicketCategory; 
    priority: TicketPriority; 
    confidence: number; 
    reasoning: string; 
}

// building the prompt for classifying a ticket 

export const buildClassifyPrompt = (
    subject: string, 
    description: string 
): string => {
    return `You are a support ticket classifier for BookLeaf Publishing.
    
Classify the following support ticket into EXACTLY one category and priority. 

CATEGORIES (pick exactly one): 
- Royalty & Payments
- ISBN & Metadata Issues  
- Printing & Quality
- Distribution & Availability
- Book Status & Production Updates
- General Inquiry

PRIORITY RULES: 
- Critical: financial loss, legal risk, data errors (wrong ISBN, missing royalties > 3 months)
- High: significant issue affecting author income or book availability (royalties delayed, book unavailable)
- Medium: production delays, quality issues, general account questions
- Low: cosmetic changes, bio updates, curiosity questions

TICKET: 
Subject: ${subject}
Description: ${description}

Respond only with a valid JSON object. No explanation, no markdown, no extra text. 

{
    "category": "<one of the categories above>", 
    "priority": "<Critical | High | Medium | Low>", 
    "confidence": "<0.0 to 1.0>", 
    "reasoning": "<one sentence explaining your decision>"
}` ; 
}