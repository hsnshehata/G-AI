const rulesTextarea = document.getElementById('textRules');
const saveBtn = document.getElementById('saveTextRules');
const rulesError = document.getElementById('rulesError');
const rulesSuccess = document.getElementById('rulesSuccess');

async function loadRulesTab() {
  const botId = localStorage.getItem('selectedBotId');
  if (!botId) {
    rulesError.textContent = 'يرجى تحديد بوت أولاً.';
    rulesTextarea.value = '';
    return;
  }

  try {
    const res = await fetch(`/api/rules/text/${botId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await res.json();

    if (res.ok) {
      rulesTextarea.value = result.rules || '';
      rulesError.textContent = '';
    } else {
      rulesTextarea.value = '';
      rulesError.textContent = result.error || 'فشل تحميل القواعد.';
    }
  } catch (err) {
    rulesTextarea.value = '';
    rulesError.textContent = 'خطأ في الاتصال بالسيرفر.';
    console.error(err);
  }
}

async function saveTextRules() {
  const botId = localStorage.getItem('selectedBotId');
  const rules = rulesTextarea.value.trim();

  if (!botId) {
    rulesError.textContent = 'لا يوجد بوت محدد.';
    return;
  }

  try {
    const res = await fetch(`/api/rules/text/${botId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ rules })
    });

    const result = await res.json();

    if (res.ok) {
      rulesSuccess.textContent = '✅ تم حفظ القواعد بنجاح';
      rulesError.textContent = '';
      setTimeout(() => {
        rulesSuccess.textContent = '';
      }, 3000);
    } else {
      rulesError.textContent = result.error || 'فشل حفظ القواعد.';
    }
  } catch (err) {
    rulesError.textContent = 'حدث خطأ أثناء الحفظ.';
    console.error(err);
  }
}

window.loadRulesTab = loadRulesTab;
window.saveTextRules = saveTextRules;
