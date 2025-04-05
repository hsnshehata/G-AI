const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // استرجاع التوكن من الهيدر

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // التحقق من صحة التوكن
    req.user = decoded;  // إضافة بيانات المستخدم إلى الطلب
    next();  // المتابعة في المعالجة
  } catch (err) {
    return res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = authenticateToken;
