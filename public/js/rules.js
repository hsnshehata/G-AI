export function initRules() {
  const content = document.getElementById('main-content');
  content.innerHTML = `
    <section>
      <h2>إدارة القواعد</h2>
      <form id="rule-form">
        <input type="text" id="ruleText" placeholder="نص القاعدة" required />
        <select id="ruleType">
          <option value="bot">خاصة بهذا البوت</option>
          <option value="global">قاعدة عامة (للسوبر أدمن)</option>
        </select>
        <button type="submit">إضافة قاعدة</button>
      </form>
      <ul id="rulesList"></ul>
    </section>
  `;

  const ruleForm = document.getElementById('rule-form');
  const ruleList = document.getElementById('rulesList');
  const botId = localStorage.getItem('currentBotId');

  async function loadRules() {
    const res = await fetch(`/rules?botId=${botId}`);
    const rules = await res.json();
    ruleList.innerHTML = '';
    rules.forEach(rule => {
      const li = document.createElement('li');
      li.textContent = `${rule.text}`;
      const delBtn = document.createElement('button');
      delBtn.textContent = '🗑️';
      delBtn.onclick = async () => {
        await fetch(`/rules/${rule._id}`, { method: 'DELETE' });
        loadRules();
      };
      li.appendChild(delBtn);
      ruleList.appendChild(li);
    });
  }

  ruleForm.onsubmit = async (e) => {
    e.preventDefault();
    const text = document.getElementById('ruleText').value;
    const type = document.getElementById('ruleType').value;

    await fetch('/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        type,
        botId: type === 'bot' ? botId : undefined
      })
    });

    ruleForm.reset();
    loadRules();
  };

  loadRules();
}
