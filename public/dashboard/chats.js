const token = localStorage.getItem('token');
const headers = { 'Authorization': `Bearer ${token}` };

// ✅ تحميل المحادثات
async function loadChats() {
  const userId = document.getElementById('userId').value.trim();
  const from = document.getElementById('from').value.trim();
  const to = document.getElementById('to').value.trim();

  let url = '/chats?';
  if (userId) url += `userId=${encodeURIComponent(userId)}&`;
  if (from) url += `from=${encodeURIComponent(from)}&`;
  if (to) url += `to=${encodeURIComponent(to)}&`;

  // حذف العلامة الزائدة (&) في نهاية الرابط
  url = url.slice(0, -1);

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();

    const tbody = document.getElementById('chat-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No chats found</td></tr>';
      return;
    }

    data.forEach(chat => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${chat.userId}</td>
        <td>${chat.message}</td>
        <td>${chat.source || 'web'}</td>
        <td>${new Date(chat.timestamp).toLocaleString()}</td>
        <td>
          <button onclick="reply('${chat.userId}')">Reply</button>
          <button onclick="resend('${chat._id}')">Resend</button>
          <button onclick="deleteChat('${chat._id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    alert('Failed to load chats');
    console.error(err);
  }
}

// ✅ الرد على رسالة
function reply(userId) {
  const msg = prompt(`Reply to ${userId}:`);
  if (!msg) return;
  // هنا هنكمل الرد اليدوي لاحقًا
  alert(`(Simulated) Reply sent: "${msg}"`);
}

// ✅ إعادة إرسال رسالة
function resend(chatId) {
  alert(`(Simulated) Message with ID ${chatId} resent`);
}

// ✅ حذف رسالة
async function deleteChat(chatId) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  try {
    const res = await fetch(`/chats/${chatId}`, {
      method: 'DELETE',
      headers
    });

    if (!res.ok) throw new Error('Failed to delete message');
    alert('Message deleted');
    loadChats(); // تحديث الجدول بعد الحذف
  } catch (err) {
    alert('Error deleting message');
    console.error(err);
  }
}

// ✅ عند الضغط على زر الفلترة
document.getElementById('filter').addEventListener('click', loadChats);

// ✅ عند تحميل الصفحة لأول مرة
window.addEventListener('DOMContentLoaded', loadChats);