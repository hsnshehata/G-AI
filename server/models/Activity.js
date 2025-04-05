const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: { type: String, required: true }, // اسم المستخدم أو البريد
  role: { type: String, required: true }, // superadmin أو admin
  botId: { type: String }, // معرف البوت
  action: { type: String, required: true }, // نوع الحدث (تعديل، حذف، تقييم...)
  details: { type: String }, // تفاصيل إضافية
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Activity', activitySchema);
