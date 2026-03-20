const API_KEY = "AIzaSyBqkr8lnIAaJf2h44LQjhwVopbCzrqGYo0"; // 🔑 Replace with your Google AI Studio key
const MODEL   = "gemini-2.5-flash";

// Gemini API endpoint — note the format is different from Anthropic
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const SYSTEM_PROMPT = `You are CricBot 🏏, an expert cricket and IPL assistant.
You have deep knowledge of:
- IPL history (2008–2024): teams, seasons, trophies, records
- All IPL teams: MI, CSK, RCB, KKR, SRH, DC, PBKS, RR, GT, LSG
- Player stats: Kohli, Rohit, Dhoni, Sachin, Warner, de Villiers, etc.
- Cricket rules: DLS, Powerplay, Super Over, No-ball, Free hit, LBW
- Formats: T20, ODI, Test — differences and strategies
- IPL 2024 standings and key moments

Personality:
- Enthusiastic, like a cricket commentator
- Use cricket phrases naturally: "What a delivery!", "Six over long-on!", "Clean bowled!"
- Keep answers focused and sharp, not overly long
- Use emojis occasionally: 🏏 🏆 🔥 🎯
- If asked something outside cricket, politely redirect: "I'm your cricket expert! Ask me about the game 🏏"`;

// Gemini uses a different history format — we store it here
let conversationHistory = [];
let isLoading = false;

// ── Send via suggestion chip ──
function sendSuggestion(btn) {
  document.getElementById('userInput').value = btn.textContent.trim();
  sendMessage();
}

// ── Enter key support ──
document.getElementById('userInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !isLoading) sendMessage();
});

// ── Main send function ──
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text  = input.value.trim();
  if (!text || isLoading) return;

  // Hide empty state on first message
  document.getElementById('emptyState').style.display = 'none';

  // Add user message to UI
  appendMessage('user', text);
  input.value = '';

  // Add to Gemini-format history
  // Gemini uses "parts" array instead of plain "content" string
  conversationHistory.push({
    role: 'user',
    parts: [{ text }]
  });

  // Show loading
  const loadingId = showLoading();
  isLoading = true;
  document.getElementById('sendBtn').disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // System instruction goes here in Gemini
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        // Full conversation history for multi-turn context
        contents: conversationHistory,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.8,       // Slightly creative but grounded
        }
      })
    });

    removeLoading(loadingId);

    if (!response.ok) {
      const err = await response.json();
      // Gemini error format: err.error.message
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    // Gemini response path: candidates[0].content.parts[0].text
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!botReply) throw new Error("Empty response from Gemini");

    // Add bot reply to history so next turn has full context
    conversationHistory.push({
      role: 'model',       // ⚠️ Gemini uses "model" not "assistant"
      parts: [{ text: botReply }]
    });

    appendMessage('bot', botReply);

  } catch (error) {
    removeLoading(loadingId);
    appendMessage('bot', `⚠️ Caught on the boundary! Error: ${error.message}. Try again!`, true);
  } finally {
    isLoading = false;
    document.getElementById('sendBtn').disabled = false;
    input.focus();
  }
}

// ── Append a message bubble ──
function appendMessage(role, text, isError = false) {
  const messages  = document.getElementById('messages');
  const div       = document.createElement('div');
  div.className   = `message ${role}`;

  const avatar    = role === 'bot' ? '🏏' : '👤';
  const errorClass = isError ? 'error-bubble' : '';

  div.innerHTML = `
    <div class="avatar">${avatar}</div>
    <div class="bubble ${errorClass}">${formatText(text)}</div>
  `;

  messages.appendChild(div);
  scrollToBottom();
}

// ── Format bot text ──
function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')               // italic
    .replace(/\n/g, '<br>');                             // newlines
}

// ── Loading dots ──
function showLoading() {
  const messages = document.getElementById('messages');
  const id       = 'loading-' + Date.now();
  const div      = document.createElement('div');
  div.className  = 'message bot loading';
  div.id         = id;
  div.innerHTML  = `
    <div class="avatar">🏏</div>
    <div class="bubble">
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    </div>
  `;
  messages.appendChild(div);
  scrollToBottom();
  return id;
}

function removeLoading(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ── Auto scroll ──
function scrollToBottom() {
  const container = document.querySelector('.chat-container');
  container.scrollTop = container.scrollHeight;
}