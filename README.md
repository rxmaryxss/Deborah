# The Oracle v3 — "This Site Knows You" 👁️

Psychological horror oracle. Pulls real device data (time, battery, timezone, OS, screen size) and weaves it into an AI-generated prophecy using OpenAI GPT-4o. Tracks hesitations, tab switches, and returning visitors via localStorage.

## Deploy

1. Push to GitHub
2. Vercel → New Project → import repo
3. Settings → Environment Variables:
   - OPENAI_API_KEY = sk-...
4. Save → Redeploy
5. Done.

## What makes it uncomfortable
- Boot sequence that "scans" them
- Warning screen with their real data displayed
- Questions that reference their device/time mid-quiz
- Intrusion messages that appear after a delay ("we noticed the hesitation")
- Returning visitors get called out ("you came back")
- Prophecy weaves in real data so it feels violating
- Typewriter reveal with random glitch stutters
- Footer: "you have been here X seconds. we have been here longer."
