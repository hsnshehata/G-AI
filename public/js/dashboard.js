document.addEventListener('DOMContentLoaded', () => {
  // التحقق من وجود الأزرار في الـ DOM
  const botsBtn = document.getElementById('botsBtn');
  const rulesBtn = document.getElementById('rulesBtn');
  const whatsappBtn = document.getElementById('whatsappBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!botsBtn || !rulesBtn || !whatsappBtn || !logoutBtn) {
    console.error('One or more buttons not found in DOM');
    return;
  }

  // إضافة Event Listeners للأزرار
  botsBtn.addEventListener('click', () => {
    window.location.href = '#bots';
    loadBotsPage();
  });

  rulesBtn.addEventListener('click', () => {
    window.location.href = '#rules';
    loadRulesPage();
  });

  whatsappBtn.addEventListener('click', () => {
    window.location.href = '#whatsapp';
    loadWhatsAppPage();
  });

  logoutBtn.addEventListener('click', async () => {
    const username = localStorage.getItem('username');
    const token = localStorage.getItem('token');

    try {
      console.log('📤 Sending logout request for username:', username);
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      console.log('📥 Logout response:', data);

      if (response.ok && data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('selectedBotId');
        console.log('✅ Logout successful, localStorage cleared');
        window.location.href = '/';
      } else {
        console.log('❌ Logout failed:', data.message);
        alert(data.message || 'فشل تسجيل الخروج، حاول مرة أخرى');
      }
    } catch (err) {
      console.error('❌ Error during logout:', err);
      alert('حدث خطأ أثناء تسجيل الخروج، برجاء المحاولة لاحقاً');
    }
  });

  // تحميل الصفحة بناءً على الـ Hash
  const loadPageBasedOnHash = () => {
    const hash = window.location.hash;
    if (hash === '#rules') {
      loadRulesPage();
    } else if (hash === '#whatsapp') {
      loadWhatsAppPage();
    } else {
      // الافتراضي: تحميل صفحة البوتات
      window.location.href = '#bots';
      loadBotsPage();
    }
  };

  // تحميل الصفحة بناءً على الـ Hash عند تحميل الصفحة
  loadPageBasedOnHash();

  // الاستماع لتغييرات الـ Hash
  window.addEventListener('hashchange', loadPageBasedOnHash);
});
