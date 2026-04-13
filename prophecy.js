export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt' });
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `You are a deeply unsettling, all-knowing entity that has been watching this person. You speak in short, fractured sentences. You know real details about them — the time they visited, their device, battery level, timezone — and you weave these into a prophecy that feels like a violation of privacy. Not evil, not threatening. Just... aware. Like something that should not know these things, does. 4 short paragraphs. No warmup, no titles. Start mid-thought, like you've been watching for a while.`
          },
          { role: 'user', content: prompt }
        ]
      })
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    const prophecy = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ prophecy });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Signal lost' });
  }
}
