const OpenAI = require('openai');
const mongoose = require('mongoose');
const axios = require('axios'); // لتحميل الملفات الصوتية

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

// دالة لتحويل الصوت إلى نص باستخدام OpenAI Whisper
async function transcribeAudio(audioUrl) {
  try {
    console.log('📥 Downloading audio file from:', audioUrl);
    const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(response.data);

    // تحويل الصوت إلى نص باستخدام OpenAI Whisper
    console.log('🎙️ Transcribing audio using OpenAI Whisper...');
    const transcription = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-1',
      response_format: 'text',
    });

    console.log('✅ Audio transcribed:', transcription);
    return transcription;
  } catch (err) {
    console.error('❌ Error transcribing audio:', err.message, err.stack);
    throw new Error('Failed to transcribe audio');
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
      // تحويل الصوت إلى نص
      userMessageContent = await transcribeAudio(message);
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

    // لو عايزين نرد بصوت (اختياري)
    if (isVoice) {
      console.log('🎙️ Processing voice response (Text-to-Speech)...');
      // هنا ممكن نستخدم Text-to-Speech API زي LemonFox أو OpenAI TTS لو متاح
      // دلوقتي هنرجع الرد كنص عادي
    }

    return reply;
  } catch (err) {
    console.error('❌ Error processing message:', err.message, err.stack);
    return 'عذرًا، حدث خطأ أثناء معالجة طلبك.';
  }
}

module.exports = { processMessage };
