# BookLeaf — Engineering Write-Up

## What I Prioritised

AI integration and architecture quality were the primary focus given their combined 50% weight in evaluation criteria. I spent significant time designing the prompt architecture — keeping the knowledge base separate from prompt logic, using async classification so ticket creation never blocks on AI, and building proper fallback behaviour so the system works fully even when OpenAI is unavailable.

The second priority was the ticket lifecycle — ensuring the full flow works end to end: author submits, AI classifies, admin sees draft, admin responds, author sees update in real time. This covers the core product value and demonstrates Socket.IO, REST API design, and AI integration working together.

## Trade-offs Made

**MongoDB over PostgreSQL** — faster to move with at assignment scale. A relational schema with proper foreign keys would be more appropriate for production, especially for reporting on royalties across books and authors.

**Single monolithic backend** — no microservices. For a 5-day assignment this is the right call. In production, the AI service could be extracted as a separate service with its own rate limiting, retry logic, and cost tracking.

**No file upload implementation** — the UI is in place but the backend handler is not. Given the time constraint, this was correctly deprioritised. The assignment marked it as bonus.

**No email notifications** — authors currently only see updates in the portal. A production system would send email notifications via a service like Resend when tickets are updated.

## How I'd Evolve This for Production

**Observability** — add structured logging (Winston/Pino), error tracking (Sentry), and AI cost tracking per ticket to understand real usage patterns.

**AI improvements** — track which AI drafts admins actually use versus edit versus discard. This data would let us improve prompts over time. Add a feedback mechanism so admins can flag poor AI responses.

**Scale** — move Socket.IO to a Redis adapter so it works across multiple server instances. Add cursor-based pagination on the ticket queue. Add a job queue (BullMQ) for AI classification instead of fire-and-forget promises.

**Author onboarding** — replace seed-based account creation with an invite flow: BookLeaf creates the account, system sends a set-password email, author sets their own credentials.

**Analytics** — a lightweight admin dashboard showing ticket volume by category, average response time, AI draft usage rate, and pending royalty totals across all authors.