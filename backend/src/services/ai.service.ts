import OpenAI from "openai";
import {
  buildClassifyPrompt,
  type ClassificationResult,
} from "../prompts/classify.prompt.js";
import type { TicketCategory, TicketPriority } from "../types/index.js";
import { buildDraftSystemPrompt, buildDraftUserPrompt } from "../prompts/draft-response.prompt.js";

// lazy initialization - only creating OpenAI client when needed

let openaiClient: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPEN_API_KEY is not defined");
    }

    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

// Classification

export const classifyTicket = async (
  subject: string,
  description: string,
): Promise<ClassificationResult> => {
  // fallback result used when AI fails - system still remains functional, admin classifies manually

  const fallback: ClassificationResult = {
    category: `General Inquiry` as TicketCategory,
    priority: "Medium" as TicketPriority,
    confidence: 0,
    reasoning: "Auto-classification failed - please classify manually",
  };

  try {
    const client = getClient();

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 200,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: buildClassifyPrompt(subject, description),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content?.trim();

    if (!raw) return fallback;

    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as ClassificationResult;

    return parsed ; 
  } catch (error) {
    console.log('AI classification error: ', error) ; 
    return fallback; 
  }
};

// Drafting the response 

export const generateDraftResponse = async (
    authorName: string, 
    subject: string, 
    description: string, 
    bookContext?: {
        title: string; 
        status: string; 
        royalty_pending: number; 
        royalty_paid: number; 
        total_copies_sold: number, 
        last_royalty_payout_date: string | null 
    } | null 
) : Promise<string | null> => {
    try {
        const client = getClient() ; 

        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 400, 
            temperature: 0.7, 
            messages: [
                {
                    role: 'system', 
                    content: buildDraftSystemPrompt()
                }, 
                {
                    role: 'user', 
                    content: buildDraftUserPrompt(
                        authorName, 
                        subject, 
                        description, 
                        bookContext
                    ), 
                }, 
            ], 
        }) ; 

        return response.choices[0]?.message?.content?.trim() || null ;
    } catch (error) {
        console.error("AI draft generation failed: ", error) ; 
        return null ; 
    }
}