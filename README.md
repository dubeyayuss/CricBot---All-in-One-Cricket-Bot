# 🏏 CricBot — IPL & Cricket Chatbot

A purpose-built chatbot for cricket fans. Ask anything about IPL,
player stats, match rules, team history, and more.

**Live Demo:** [your-vercel-link.vercel.app]

## Why Cricket?
Cricket isn't just a sport in India — it's culture. I wanted to build
something that felt native to that passion, not a generic chatbot.

## Stack
- Plain HTML, CSS, JavaScript (no frameworks)
- Anthropic Claude API (claude-haiku) as the AI backend
- Deployed on Vercel

## Design Decisions
- Dark stadium-inspired theme with IPL blue/gold palette
- Suggestion chips for empty state — reduces blank-page anxiety
- Typing indicator (bouncing dots) for loading state
- Cricket-flavored error messages to stay on-brand
- Conversation history sent with each request for context

## Note on API Key
For this demo, the API key is client-side (visible in JS).
In production, this would be proxied through a backend endpoint.
