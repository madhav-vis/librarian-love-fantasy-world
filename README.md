# EPUB Quiz Visual Novel

A RenPy-style Visual Novel app that generates quizzes from EPUB books using LLM.

## Features

- 📚 Upload EPUB files
- 🎮 RenPy-style VN interface
- ❓ LLM-powered quiz generation
- 📊 Progress tracking

## Setup

1. Install dependencies:
```bash
npm run install:all
```

2. Start development:
```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Adding LLM API

Add your API key to `apps/api/.env`:
```
OPENAI_API_KEY=your_key_here
```

Or use any LLM provider by updating `apps/api/src/llm/client.ts`.<img width="1048" height="730" alt="Screenshot 2026-01-10 at 11 33 28 PM" src="https://github.com/user-attachments/assets/0f0b8196-08b0-48ba-ba32-49f57d34e215" />
