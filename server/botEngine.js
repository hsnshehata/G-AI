const OpenAI = require('openai');
const mongoose = require('mongoose');

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

async function processMessage(botId, userId, message, isImage = false, isVoice = false) {
  try {
    console.log('🤖 Processing message for bot:', botId, 'user:', userId, 'message:', message);

    // Fetch bot rules
    const rules = await Rule.find({ $or: [{ botId }, { type: 'global' }] });
    console.log('📜 Rules found:', rules);

    let systemPrompt = 'أنت بوت ذكي يساعد المستخدمين بناءً على القواعد التالية:\n';
    rules.forEach((rule) => {
      if (rule.type === 'global' || rule.type === 'general') {
        systemPrompt += `${rule.content}\n`;
      } else if (rule.type === 'products') {
        systemPrompt += `المنتج: ${rule.content.product}، السعر: ${rule.content.price} ${rule.content.currency}\n`;
      } else if (rule.type === 'qa') {
        systemPrompt += `السؤال: ${rule.content.question}، الإجابة: ${rule.content.answer}\n`;
      }
    });
    console.log('📝 System prompt:', systemPrompt);

    // Fetch or create conversation
    let conversation = await Conversation.findOne({ botId, userId });
    if (!conversation) {
      console.log('📋 Creating new conversation for bot:', botId, 'user:', userId);
      conversation = await Conversation.create({ botId, userId, messages: [] });
    } else {
      console.log('📋 Found existing conversation:', conversation._id);
    }

    // Add user message to conversation
    conversation.messages.push({ role: 'user', content: message });
    await conversation.save();
    console.log('💬 User message added to conversation:', message);

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
    });

    const reply = response.choices[0].message.content;
    console.log('✅ OpenAI reply:', reply);

    // Add assistant reply to conversation
    conversation.messages.push({ role: 'assistant', content: reply });
    await conversation.save();
    console.log('💬 Assistant reply added to conversation:', reply);

    if (isVoice) {
      // Simulate voice response using LemonFox API (placeholder)
      console.log('🎙️ Processing voice response with LemonFox API...');
      // Add actual LemonFox API integration here
    }

    return reply;
  } catch (err) {
    console.error('❌ Error processing message:', err.message, err.stack);
    return 'عذرًا، حدث خطأ أثناء معالجة طلبك.';
  }
}

module.exports = { processMessage };
