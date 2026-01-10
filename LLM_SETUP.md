# LLM API Setup Guide

This guide will help you set up LLM integration for quiz generation.

## Google Gemini (Currently Configured)

### Step 1: Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key (starts with `AIza...`)

### Step 2: Add to Environment

1. Create a `.env` file in `apps/api/`:
   ```bash
   cd apps/api
   touch .env
   ```

2. Edit `apps/api/.env` and add your key:
   ```
   GEMINI_API_KEY=AIzaSy-xxxxxxxxxxxxxxxxxxxxx
   GEMINI_MODEL=gemini-2.0-flash-exp
   PORT=3001
   NODE_ENV=development
   ```

3. Available models:
   ```
   GEMINI_MODEL=gemini-2.0-flash-exp  # Fast, lightweight (default)
   GEMINI_MODEL=gemini-2.5-flash      # Latest Flash model (if available)
   GEMINI_MODEL=gemini-2.5-flash-lite # Most cost-efficient, fastest
   GEMINI_MODEL=gemini-pro            # Original model
   ```

### Step 3: Install Dependencies

```bash
cd apps/api
npm install
```

### Step 4: Test

Start the server:
```bash
npm run dev
```

Upload an EPUB file and it should generate real quizzes using the LLM!

## Pricing

- **Gemini Flash models**: Faster and more cost-efficient than Pro
- **Gemini Pro**: Free tier with generous limits (60 requests/minute)
- **Paid tier**: Check [Google AI pricing](https://ai.google.dev/pricing)

Each quiz generation uses approximately 500-1000 tokens. Flash models are optimized for speed and lower costs.

## Troubleshooting

### "API key not found" error
- Make sure `.env` is in `apps/api/` directory
- Check that the file is named exactly `.env`
- Restart your server after adding the key

### "Invalid API key" error
- Verify your key is correct
- Make sure you copied the entire key (starts with `AIza`)
- Check that your Google account has API access enabled

### Rate limits
- Free tier: 60 requests per minute
- The app will automatically fall back to mock quizzes if rate limited

## Progress Percentage Feature

When uploading an EPUB, you can specify your reading progress (0-100%). This helps:
- Generate quizzes from content you've already read
- Avoid spoilers by only using content up to your progress point
- Create quizzes relevant to where you are in the book

The system automatically selects the appropriate chapter/section based on your progress percentage.