// تفعيل زر تسجيل الخروج
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/login.html';
});

// تفعيل التابات
const tabLinks = document.querySelectorAll('a[data-tab]');
const tabContent = document.getElementById('tab-content');

tabLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tabName = link.getAttribute('data-tab');
    loadTabContent(tabName);
  });
});

function loadTabContent(tab) {
  tabContent.innerHTML = '<p>جاري التحميل...</p>';

  switch (tab) {
    case 'rules':
      fetch('/rules')
        .then(res => res.json())
        .then(data => {
          tabContent.innerHTML = `
            <h2>قواعد البوت</h2>
            <ul>${data.map(rule => `<li>${rule}</li>`).join('')}</ul>
          `;
        })
        .catch(() => {
          tabContent.innerHTML = '<p>حدث خطأ أثناء تحميل القواعد.</p>';
        });
      break;

    case 'ratings':
      fetch('/ratings')
        .then(res => res.json())
        .then(data => {
          tabContent.innerHTML = `
            <h2>تقييمات المستخدمين</h2>
            <ul>${data.map(r => `<li>${r.rating} نجوم - ${r.comment}</li>`).join('')}</ul>
          `;
        })
        .catch(() => {
          tabContent.innerHTML = '<p>حدث خطأ أثناء تحميل التقييمات.</p>';
        });
      break;

    case 'faqs':
      fetch('/faqs')
        .then(res => res.json())
        .then(data => {
          tabContent.innerHTML = `
            <h2>الأسئلة الشائعة</h2>
            <ul>${data.map(f => `<li><strong>${f.q}</strong>: ${f.a}</li>`).join('')}</ul>
          `;
        })
        .catch(() => {
          tabContent.innerHTML = '<p>تعذر تحميل الأسئلة الشائعة.</p>';
        });
      break;

    case 'activity':
      fetch('/activity')
        .then(res => res.json())
        .then(data => {
          tabContent.innerHTML = `
            <h2>سجل النشاط</h2>
            <ul>${data.map(log => `<li>${log.action} - ${new Date(log.timestamp).toLocaleString()}</li>`).join('')}</ul>
          `;
        })
        .catch(() => {
          tabContent.innerHTML = '<p>خطأ في تحميل سجل النشاط.</p>';
        });
      break;

    case 'chats':
      fetch('/chats')
        .then(res => res.json())
        .then(data => {
          tabContent.innerHTML = `
            <h2>أرشيف المحادثات</h2>
            <ul>${data.map(chat => `<li><strong>${chat.userId}:</strong> ${chat.message}</li>`).join('')}</ul>
          `;
        })
        .catch(() => {
          tabContent.innerHTML = '<p>فشل تحميل المحادثات.</p>';
        });
      break;

    default:
      tabContent.innerHTML = '<p>القسم غير معروف.</p>';
  }
}
