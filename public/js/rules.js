// لاحظ: بدون تعريف token أو role هنا

// تبويبات القواعد
function switchRulesTab(tab) {
  document.querySelectorAll('.rules-tab-content').forEach(el => el.style.display = 'none');
  document.getElementById(`rules-${tab}-tab`).style.display = 'block';

  document.querySelectorAll('.rules-tabs button').forEach(btn => btn.classList.remove('active-subtab'));
  document.querySelector(`.rules-tabs button[onclick="switchRulesTab('${tab}')"]`)?.classList.add('active-subtab');
}

// تحميل تبويب القواعد عند الفتح
function loadRulesTab() {
  if (!selectedBotId) {
    document.getElementById('rulesContent').innerHTML = '<p>يرجى اختيار بوت لعرض القواعد الخاصة به.</p>';
    return;
  }

  switchRulesTab('text');
  loadTextRules();
}

// تحميل القواعد النصية
async function loadTextRules() {
  const listContainer = document.getElementById('textRulesList');
  listContainer.innerHTML = '...جارٍ التحميل';

  try {
    const res = await fetch(`/api/rules?botId=${selectedBotId}&type=text`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const rules = await res.json();
    listContainer.innerHTML = '';

    if (!rules.length) {
      listContainer.innerHTML = '<p>لا توجد قواعد نصية حالياً.</p>';
      return;
    }

    const ul = document.createElement('ul');
    rules.forEach(rule => {
      const li = document.createElement('li');
      li.textContent = rule.text;
      const del = document.createElement('button');
      del.textContent = '🗑️';
      del.style.marginRight = '10px';
      del.onclick = () => deleteRule(rule._id, 'text');
      li.appendChild(del);
      ul.appendChild(li);
    });

    listContainer.appendChild(ul);
  } catch (err) {
    listContainer.innerHTML = '<p>حدث خطأ أثناء تحميل القواعد النصية ❌</p>';
    console.error(err);
  }
}

// حفظ القواعد النصية الجديدة
async function saveTextRules() {
  const textarea = document.getElementById('textRulesInput');
  const lines = textarea.value.split('\n').map(line => line.trim()).filter(Boolean);

  if (!lines.length) return alert('يرجى إدخال قاعدة واحدة على الأقل');

  try {
    const savePromises = lines.map(text =>
      fetch('/api/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'text',
          botId: selectedBotId,
          text
        })
      })
    );

    await Promise.all(savePromises);
    textarea.value = '';
    loadTextRules();
  } catch (err) {
    alert('حدث خطأ أثناء حفظ القواعد');
    console.error(err);
  }
}

// حذف قاعدة
async function deleteRule(id, type) {
  if (!confirm('هل تريد حذف هذه القاعدة؟')) return;

  try {
    await fetch(`/api/rules/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (type === 'text') loadTextRules();
  } catch (err) {
    alert('حدث خطأ أثناء الحذف');
    console.error(err);
  }
}

// تحميل التبويب عند التبديل
window.loadRulesTab = loadRulesTab;
window.saveTextRules = saveTextRules;
window.switchRulesTab = switchRulesTab;
