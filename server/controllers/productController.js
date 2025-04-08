const Product = require('../models/Product');

// حفظ منتج جديد
exports.createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'الرجاء إدخال جميع الحقول المطلوبة' });
    }

    const product = new Product({ name, price });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('خطأ في حفظ المنتج:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};

// جلب كل المنتجات
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('خطأ في جلب المنتجات:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};

// حذف منتج
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ error: 'لم يتم العثور على المنتج' });
    }
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (err) {
    console.error('خطأ في حذف المنتج:', err);
    res.status(500).json({ error: 'خطأ في السيرفر' });
  }
};
