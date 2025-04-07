export default function initAddBot() {
  const form = document.getElementById('add-bot-form');
  const msg = document.getElementById('add-bot-msg');
  const fbToken = document.getElementById('fbToken');
  const pageId = document.getElementById('pageId');

  // إظهار خانة Facebook Page ID عند إدخال توكن فيسبوك
  fbToken.addEventListener('input', () => {
    if (fbToken.value.trim() !== '') {
      pageId.style.display = 'block';
      pageId.required = true;
    } else {
      pageId.style.display = 'none';
      pageId.required = false;
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name: document.getElementById('botName').value,
      username: document.getElementById('botUsername').value,
      password: document.getElementById('botPassword').value,
      fbToken: fbToken.value.trim() || null,
      pageId: pageId.value.trim() || null,
      openaiKey: document.getElementById('openaiKey').value.trim() || null,
    };

    try {
      const res = await fetch('/api/bots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        msg.textContent = '✅ تم إنشاء البوت بنجاح!';
        msg.style.color = 'green';
        form.reset();
        pageId.style.display = 'none';
      } else {
        msg.textContent = `❌ خطأ: ${result.message || 'فشل في الإنشاء'}`;
        msg.style.color = 'red';
      }
    } catch (err) {
      msg.textContent = `❌ حدث خطأ في الاتصال بالسيرفر`;
      msg.style.color = 'red';
      console.error(err);
    }
  });
}
