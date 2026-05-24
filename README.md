# BookLeaf — Author Support & Communication Portal

A full-stack web application for BookLeaf Publishing that enables authors to manage support tickets and helps the operations team handle queries faster using AI-assisted response generation.

**Live Demo:** https://bookleaf-pearl.vercel.app
**Admin login:** admin@bookleaf.com / admin123  
**Author login:** priya.sharma@email.com / password123

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Setup](#local-setup)
- [Architecture Decisions](#architecture-decisions)
- [AI Integration](#ai-integration)
- [API Documentation](#api-documentation)
- [Known Limitations](#known-limitations)

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React + TypeScript + Vite | Fast dev experience, type safety |
| Styling | Tailwind CSS | Utility-first, consistent design |
| Backend | Node.js + Express + TypeScript | Familiar, lightweight, good ecosystem |
| Database | MongoDB + Mongoose | Flexible schema for ticket documents |
| Auth | JWT (jsonwebtoken) | Stateless, works well for two-role system |
| AI | OpenAI gpt-4o-mini | Fast, cheap, sufficient for classification and drafting |
| Real-time | Socket.IO | Bidirectional events, room-based targeting |
| Deployment | Render (backend) + Vercel (frontend) | Free tier, easy setup |

---

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI, JWT_SECRET, OPENAI_API_KEY
npm run seed      # seeds database with sample data
npm run dev       # starts on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in VITE_API_URL, VITE_API_BASE_URL
npm run dev       # starts on http://localhost:5173
```

### Environment Variables

**Backend `.env.example`:**
**Frontend `.env.example`:**


## Architecture Decisions 

### Single Backend, Two Frontends

One Express server handles both author and admin portals via RBAC middleware. A separate backend per portal would create data sync complexity with no benefit at this scale. 

### MongoDB over PostgreSQL 

Tickets have variable structure - some have attachment, some have AI metadata, some have internal notes. 

MongoDB's document model fits naturally. At scale with millions of tickets, a relational DB with proper indexing would be revisited. 

### Async AI Classification

Ticket creation never waits for AI. The ticket is saved immediately and the author gets an instant response. AI classification runs in the background and updates the ticket silently.

If AI fails, the ticekt defaults to `Pending/Medium` and admins can classify manually. 

### Socket.IO Room Strategy 

Author join room `author:{author_id}`. Admins join room `admin`. 

Events are targeted - when an admin responds to a ticket, only the specific author receives the update. This prevents cross-author data leakage. 

### Prompt Architecture 

The BookLeaf Knowledge Base lives in a dedicated `src/prompts/knowledge-base.ts` file. It is injected as the system prompt for draft generation.

Classification uses a separate focused prompt with strict JSON output instructions. This separation means policies can be updated without touching AI call logic.

---

## AI Integration

### Three AI Operations

| Operation | Trigger | Model | Tokens | Fallback |
|---|---|---|---|---|
| Classification | On ticket creation (async) | gpt-4o-mini | ~200 | Pending/Medium |
| Priority scoring | Same call as classification | gpt-4o-mini | included | Medium |
| Draft response | When admin opens ticket | gpt-4o-mini | ~400 | Empty textarea |



### Cost Awareness

Draft responses only generate when an admin actually opens a ticket - not for every ticket in the queue. 

Only the relevant book's data is sent as context, not the author's entire profile. The knowledge base (~800 tokens) is sent once per call as the system prompt. 

### Graceful Degradation

If OpenAI is unavailable: 

- New tickets are still created and saved normally
- Classification defaults to `Pending` - admin can override manually
- Draft panel shows empty textarea with a message - admin writes manually 
- No user-facing errors related to AI failure 

---

### Prompt Engineering Approach 

Classification prompt uses strict JSON output with explicit categories and priority rules. 

Draft prompt uses the full knowledge base as system context with tone guidelines matching BookLeaf's communication style. Low temperature (0.1) for classification, slightly higher (0.7) for natural-sounding draft responses. 

---

## API Documentation

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Protected | Get current user |

### Author
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/authors/me | Author | Profile + books |
| GET | /api/authors/me/books | Author | Books list |
| GET | /api/authors/me/royalties | Author | Royalty summary |

### Tickets (Author)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/tickets | Author | Create ticket |
| GET | /api/tickets/mine | Author | Own tickets |
| GET | /api/tickets/:id | Author | Single ticket |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | /api/admin/tickets | Admin | All tickets (filterable) |
| GET | /api/admin/tickets/:id | Admin | Single ticket + AI draft |
| POST | /api/admin/tickets/:id/respond | Admin | Send response |
| PATCH | /api/admin/tickets/:id | Admin | Update status |
| POST | /api/admin/tickets/:id/notes | Admin | Internal note |
| PATCH | /api/admin/tickets/:id/classify | Admin | Override AI classification |
| GET | /api/admin/authors | Admin | All authors |
| GET | /api/admin/authors/:author_id | Admin | Author detail |

### Response Format
All endpoints return:
```json
{
  "success": true,
  "data": {},
  "message": "Optional message"
}
```
Errors:
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message"
}
```


## Known Limitations 

- **File attachments** - UI is in place, actual upload not implemented. Would use AWS S3. 

- **Email notifications** - authors are not emailed when tickets are updated. Would add Nodemailer or Resend. 

- **Author Registration** - no self-serve signup. Accounts are created via seed. In production, BookLeaf would use an invite-based overboarding flow. 

- **Pagination** - ticket list loads all tickets. Would add cursor-based pagination at scale. 

- **Token refresh** - JWT expires after 7 days with no refresh token mechanism. Would add refresh tokens for production. 