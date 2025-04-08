const StoreLink = require('../models/StoreLink');

// حفظ ربط المتجر
exports.createStoreLink = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'الرجاء إدخال مفتاح API' });
    }

    // حذف أي ربط متجر سابق (عشان يكون في ربط واحد بس)
    await StoreLink.deleteMany({});
    
    const storeLink = new StoreLink({ apiKey });
    await storeLink.save();
    res.status(201).json(storeLink);
  } catch (err) {
    console.error('خطأ في ربط المتجر:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};

// جلب ربط المتجر
exports.getStoreLink = async (req, res) => {
  try {
    const storeLink = await StoreLink.findOne();
    if (!storeLink) {
      return res.status(404).json({ error: 'لم يتم العثور على ربط متجر' });
    }
    res.json(storeLink);
  } catch (err) {
    console.error('خطأ في جلب ربط المتجر:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};

// حذف ربط المتجر
exports.deleteStoreLink = async (req, res) => {
  try {
    const storeLinkId = req.params.id;
    const storeLink = await StoreLink.findByIdAndDelete(storeLinkId);
    if (!storeLink) {
      return res.status(404).json({ error: 'لم يتم العثور على ربط المتجر' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    console.error('خطأ في حذف ربط المتجر:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};
