const OpenAI = require('openai');
const Bot = require('../models/Bot');

// توليد رد من GPT بناءً على رسالة
const generateAIResponse = async (req, res) => {
  try {
    const { message, botId } = req.body;
    if (!message || !botId) return res.status(400).json({ error: 'Missing message or botId' });

    const bot = await Bot.findById(botId);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const openai = new OpenAI({ apiKey: bot.openaiKey || process.env.API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: message }],
    });

    const reply = response.choices[0]?.message?.content || 'معنديش رد دلوقتي 🧐';
    res.json({ reply });
  } catch (err) {
    console.error('GPT error:', err);
    res.status(500).json({ error: 'AI processing failed' });
  }
};

// الرد على صورة (تحليل الصورة باستخدام GPT-4o)
const analyzeImageAndRespond = async (req, res) => {
  try {
    const { imageUrl, botId } = req.body;
    if (!imageUrl || !botId) return res.status(400).json({ error: 'Missing image or botId' });

    const bot = await Bot.findById(botId);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const openai = new OpenAI({ apiKey: bot.openaiKey || process.env.API_KEY });

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'حلل الصورة وأخبرني بما تراها' },
        { role: 'user', content: [{ type: 'image_url', image_url: { url: imageUrl } }] },
      ],
    });

    const reply = response.choices[0]?.message?.content || 'مش شايف الصورة كويس 🙈';
    res.json({ reply });
  } catch (err) {
    console.error('Image AI error:', err);
    res.status(500).json({ error: 'Image analysis failed' });
  }
};

// تحويل صوت إلى نص باستخدام Lemonfox
const transcribeAudioAndRespond = async (req, res) => {
  try {
    const { audioUrl, botId } = req.body;
    if (!audioUrl || !botId) return res.status(400).json({ error: 'Missing audio or botId' });

    const bot = await Bot.findById(botId);
    if (!bot) return res.status(404).json({ error: 'Bot not found' });

    const lemonfoxRes = await fetch('https://api.lemonfox.ai/api/v1/asr/transcribe-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LEMONFOX_KEY,
      },
      body: JSON.stringify({ url: audioUrl, model: 'general' }),
    });

    const result = await lemonfoxRes.json();
    if (!result.transcription) {
      return res.status(500).json({ error: 'Transcription failed' });
    }

    // بعد تحويل الصوت لنص، نولد رد من GPT
    const openai = new OpenAI({ apiKey: bot.openaiKey || process.env.API_KEY });
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: result.transcription }],
    });

    const reply = gptResponse.choices[0]?.message?.content || 'مش سامعك كويس 😅';
    res.json({ reply, transcription: result.transcription });
  } catch (err) {
    console.error('Audio error:', err);
    res.status(500).json({ error: 'Audio processing failed' });
  }
};

module.exports = {
  generateAIResponse,
  analyzeImageAndRespond,
  transcribeAudioAndRespond,
};
