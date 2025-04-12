const express = require('express');
const router = express.Router();
const { verifyWebhook, handleMessage } = require('../controllers/facebookController');

// Middleware لتحديد botId بناءً على pageId (هنفترض إن pageId متخزن في قاعدة البيانات مع botId)
const setBotId = async (req, res, next) => {
  const body = req.body;
  if (body.object === 'page') {
    const pageId = body.entry[0]?.messaging[0]?.recipient?.id;
    // هنا لازم تجيب botId بناءً على pageId من قاعدة البيانات
    // هنفترض إنك عندك مودل Bot فيه pageId
    const Bot = require('../models/Bot');
    const bot = await Bot.findOne({ pageId });
    if (bot) {
      req.botId = bot._id;
      next();
    } else {
      console.error('❌ Bot not found for pageId:', pageId);
      res.sendStatus(404);
    }
  } else {
    res.sendStatus(400);
  }
};

// Webhook لفيسبوك
router.get('/', verifyWebhook);
router.post('/', setBotId, handleMessage);

module.exports = router;
