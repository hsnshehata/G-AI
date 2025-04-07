export default function initAddBot() {
  const content = document.getElementById('main-content');
  content.innerHTML = `
    <h2>إنشاء بوت جديد</h2>
    <form id="add-bot-form">
      <input type="text" id="botName" placeholder="اسم البوت" required />
      <input type="text" id="botUsername" placeholder="اسم المستخدم" required />
      <input type="password" id="botPassword" placeholder="كلمة المرور" required />
      <input type="text" id="fbToken" placeholder="مفتاح ربط فيسبوك (اختياري)" />
      <input type="text" id="pageId" placeholder="Facebook Page ID" style="display: none;" />
      <input type="text" id="openaiKey" placeholder="مفتاح OpenAI (اختياري)" />
      <button type="submit">إنشاء البوت</button>
    </form>
    <p id="add-bot-msg"></p>
  `;

  const form = document.getElementById('add-bot-form');
  const msg = document.getElementById('add-bot-msg');
  const fbToken = document.getElementById('fbToken');
  const pageId = document.getElementById('pageId');

  fbToken?.addEventListener('input', () => {
    if (fbToken.value.trim() !== '') {
      pageId.style.display = 'block';
      pageId.required = true;
    } else {
      pageId.style.display = 'none';
      pageId.required = false;
    }
  });

  form?.addEventListener('submit', async (e) => {
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
      const res = await fetch('/bots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      msg.textContent = res.ok ? '✅ تم إنشاء البوت بنجاح!' : `❌ ${result.message}`;
      msg.style.color = res.ok ? 'green' : 'red';

      if (res.ok) {
        form.reset();
        pageId.style.display = 'none';
      }

    } catch (err) {
      msg.textContent = '❌ حدث خطأ في الاتصال بالسيرفر';
      msg.style.color = 'red';
      console.error(err);
    }
  });
}
