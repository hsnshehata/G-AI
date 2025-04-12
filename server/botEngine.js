const OpenAI = require('openai');
const mongoose = require('mongoose');
const axios = require('axios');
const FormData = require('form-data'); // للتعامل مع multipart/form-data

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const conversationSchema = new mongoose.Schema({
  botId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bot', required: true },
  userId: { type: String, required: true }, // Facebook/WhatsApp user ID
  messages: [
    {
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Conversation = mongoose.model('Conversation', conversationSchema);

const Rule = require('./models/Rule');

// دالة لتحويل الصوت إلى نص باستخدام LemonFox
async function transcribeAudio(audioUrl) {
  const body = new FormData();
  body.append('file', audioUrl); // بنبعت رابط الصوت مباشرة
  body.append('language', 'arabic');
  body.append('response_format', 'json');
  try {
    console.log(
      'LemonFox API Key: ' +
        (process.env.LEMONFOX_API_KEY ? 'تم جلب المفتاح' : 'المفتاح فاضي!')
    );
    const response = await axios.post(
      'https://api.lemonfox.ai/v1/audio/transcriptions',
      body,
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}`,
          ...body.getHeaders(),
        },
      }
    );
    console.log('✅ Audio transcribed with LemonFox:', response.data.text);
    return response.data.text;
  } catch (err) {
    console.error('❌ Error transcribing audio with LemonFox:', err.message, err.stack);
    throw new Error(`Failed to transcribe audio: ${err.message}`);
  }
}

async function processMessage(botId, userId, message, isImage = false, isVoice = false) {
  try {
    console.log('🤖 Processing message for bot:', botId, 'user:', userId, 'message:', message);

    // Fetch bot rules
    const rules = await Rule.find({ $or: [{ botId }, { type: 'global' }] });
    console.log('📜 Rules found:', rules);

    let systemPrompt = 'أنت بوت ذكي يساعد المستخدمين بناءً على القواعد التالية:\n';
    if (rules.length === 0) {
      systemPrompt += 'لا توجد قواعد محددة، قم بالرد بشكل عام ومفيد.\n';
    } else {
      rules.forEach((rule) => {
        if (rule.type === 'global' || rule.type === 'general') {
          systemPrompt += `${rule.content}\n`;
        } else if (rule.type === 'products') {
          systemPrompt += `المنتج: ${rule.content.product}، السعر: ${rule.content.price} ${rule.content.currency}\n`;
        } else if (rule.type === 'qa') {
          systemPrompt += `السؤال: ${rule.content.question}، الإجابة: ${rule.content.answer}\n`;
        }
      });
    }
    console.log('📝 System prompt:', systemPrompt);

    // Fetch or create conversation
    let conversation = await Conversation.findOne({ botId, userId });
    if (!conversation) {
      console.log('📋 Creating new conversation for bot:', botId, 'user:', userId);
      conversation = await Conversation.create({ botId, userId, messages: [] });
    } else {
      console.log('📋 Found existing conversation:', conversation._id);
    }

    // معالجة الرسالة بناءً على نوعها
    let userMessageContent = message;

    if (isVoice) {
      // تحويل الصوت إلى نص باستخدام LemonFox
      userMessageContent = await transcribeAudio(message);
      if (!userMessageContent) {
        throw new Error('Failed to transcribe audio: No text returned');
      }
      console.log('💬 Transcribed audio message:', userMessageContent);
    }

    // Add user message to conversation
    conversation.messages.push({ role: 'user', content: userMessageContent });
    await conversation.save();
    console.log('💬 User message added to conversation:', userMessageContent);

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation.messages.map((msg) => ({ role: msg.role, content: msg.content })),
    ];

    if (isImage) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image:' },
          { type: 'image_url', image_url: { url: message } },
        ],
      });
      console.log('🖼️ Processing image message');
    }

    // Call OpenAI
    console.log('📡 Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 700,
    });

    const reply = response.choices[0].message.content;
    console.log('✅ OpenAI reply:', reply);

    // Add assistant reply to conversation
    conversation.messages.push({ role: 'assistant', content: reply });
    await conversation.save();
    console.log('💬 Assistant reply added to conversation:', reply);

    // بنرجع الرد النصي مباشرة (سواء الرسالة صوتية أو نصية أو صورة)
    return reply;
  } catch (err) {
    console.error('❌ Error processing message:', err.message, err.stack);
    return 'عذرًا، حدث خطأ أثناء معالجة طلبك.';
  }
}

module.exports = { processMessage };
