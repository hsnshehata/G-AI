export function initRules() {
  const content = document.getElementById('main-content');
  content.innerHTML = `
    <section>
      <h2>إدارة القواعد</h2>
      <form id="rule-form">
        <input type="text" id="ruleKeyword" placeholder="كلمة مفتاحية" required />
        <input type="text" id="ruleResponse" placeholder="الرد التلقائي" required />
        <select id="ruleType">
          <option value="bot">خاصة بهذا البوت</option>
          <option value="global">قاعدة عامة (للسوبر أدمن)</option>
          <option value="faq">س و ج</option>
          <option value="product">منتجات وأسعار</option>
        </select>
        <button type="submit">إضافة قاعدة</button>
      </form>
      <ul id="rulesList"></ul>
    </section>
  `;

  const ruleForm = document.getElementById('rule-form');
  const ruleList = document.getElementById('rulesList');
  const botId = localStorage.getItem('currentBotId');

  if (!botId) {
    content.innerHTML = '<p class="text">❗ من فضلك اختر بوت أولاً من قسم "بوتاتي".</p>';
    return;
  }

  async function loadRules() {
    try {
      const res = await fetch(`/rules?botId=${botId}`);
      const { rules } = await res.json();
      ruleList.innerHTML = '';

      if (!Array.isArray(rules)) {
        ruleList.innerHTML = '<li>⚠️ لم يتم تحميل القواعد بشكل صحيح.</li>';
        return;
      }

      rules.forEach(rule => {
        const li = document.createElement('li');
        li.textContent = `${rule.keyword} → ${rule.response}`;
        const delBtn = document.createElement('button');
        delBtn.textContent = '🗑️';
        delBtn.onclick = async () => {
          await fetch(`/rules/${rule._id}`, { method: 'DELETE' });
          loadRules();
        };
        li.appendChild(delBtn);
        ruleList.appendChild(li);
      });
    } catch (err) {
      ruleList.innerHTML = '<li>⚠️ حدث خطأ أثناء تحميل القواعد.</li>';
      console.error(err);
    }
  }

  ruleForm.onsubmit = async (e) => {
    e.preventDefault();
    const keyword = document.getElementById('ruleKeyword').value;
    const response = document.getElementById('ruleResponse').value;
    const type = document.getElementById('ruleType').value;

    await fetch('/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyword,
        response,
        pageId: type === 'bot' ? botId : 'global',
        ruleType: type
      })
    });

    ruleForm.reset();
    loadRules();
  };

  loadRules();
}
