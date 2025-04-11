document.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('role');
  if (!localStorage.getItem('token')) {
    window.location.href = '/';
    return;
  }

  document.getElementById('botsBtn').addEventListener('click', () => {
    window.location.href = '#bots';
    loadBotsPage();
  });

  document.getElementById('rulesBtn').addEventListener('click', () => {
    window.location.href = '#rules';
    loadRulesPage();
  });

  // إضافة حدث لزر تسجيل الخروج
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
      // إرسال طلب للـ backend لتسجيل الخروج
      const response = await fetch('/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: localStorage.getItem('username') }),
      });

      const data = await response.json();
      if (data.success) {
        // تنظيف الـ localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        // إعادة توجيه المستخدم لصفحة تسجيل الدخول
        window.location.href = '/';
      } else {
        alert('فشل تسجيل الخروج، حاول مرة أخرى');
      }
    } catch (err) {
      console.error('❌ خطأ في تسجيل الخروج:', err);
      alert('حدث خطأ أثناء تسجيل الخروج');
    }
  });

  // Load bots page by default
  loadBotsPage();
});
