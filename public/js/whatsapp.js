// تحميل مكتبة qrcode من CDN
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
document.head.appendChild(script);

async function loadWhatsAppPage() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <div id="whatsappContent">
      <h2>إدارة واتساب</h2>
      <p>اختر بوتًا لربطه مع واتساب:</p>
      <select id="botSelect">
        <option value="">-- اختر بوت --</option>
      </select>
      <div id="connectionStatus"></div>
      <div id="sessionDuration"></div>
      <div id="qrCode"></div>
      <button id="connectBtn" style="display: none;">توصيل واتساب</button>
      <button id="disconnectBtn" style="display: none;">فصل الجلسة</button>
    </div>
  `;

  const botSelect = document.getElementById('botSelect');
  const connectionStatus = document.getElementById('connectionStatus');
  const sessionDuration = document.getElementById('sessionDuration');
  const qrCodeDiv = document.getElementById('qrCode');
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');

  // جلب قائمة البوتات
  try {
    const res = await fetch('/api/bots', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    const bots = await res.json();
    bots.forEach(bot => {
      const option = document.createElement('option');
      option.value = bot._id;
      option.textContent = bot.name; // عرض الـ name بدل الـ _id
      botSelect.appendChild(option);
    });
  } catch (err) {
    console.error('❌ خطأ في جلب البوتات:', err);
    content.innerHTML += '<p style="color: red;">خطأ في جلب البوتات</p>';
    return;
  }

  // تحديث حالة الاتصال عند اختيار بوت
  botSelect.addEventListener('change', async () => {
    const botId = botSelect.value;
    if (!botId) {
      connectionStatus.textContent = '';
      sessionDuration.textContent = '';
      connectBtn.style.display = 'none';
      disconnectBtn.style.display = 'none';
      qrCodeDiv.innerHTML = '';
      return;
    }

    try {
      const res = await fetch(`/api/whatsapp/status/${botId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();

      if (data.isConnected) {
        connectionStatus.textContent = 'حالة الاتصال: متصل ✅';
        const duration = Math.floor((new Date() - new Date(data.connectedAt)) / 1000 / 60); // بالدقايق
        sessionDuration.textContent = `مدة الجلسة: ${duration} دقيقة`;
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'inline-block';
        qrCodeDiv.innerHTML = '';
      } else {
        connectionStatus.textContent = 'حالة الاتصال: غير متصل ❌';
        sessionDuration.textContent = '';
        connectBtn.style.display = 'inline-block';
        disconnectBtn.style.display = 'none';
        qrCodeDiv.innerHTML = '';
      }
    } catch (err) {
      console.error('❌ خطأ في جلب حالة الجلسة:', err);
      connectionStatus.textContent = 'خطأ في جلب حالة الجلسة';
    }
  });

  // زر توصيل واتساب (توليد QR Code)
  connectBtn.addEventListener('click', async () => {
    const botId = botSelect.value;
    if (!botId) return alert('يرجى اختيار بوت');

    try {
      const res = await fetch(`/api/whatsapp/connect/${botId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();

      if (data.qr) {
        qrCodeDiv.innerHTML = '';
        QRCode.toCanvas(data.qr, { width: 200 }, (err, canvas) => {
          if (err) {
            console.error('❌ خطأ في توليد QR Code:', err);
            qrCodeDiv.textContent = 'خطأ في توليد QR Code';
            return;
          }
          qrCodeDiv.appendChild(canvas);
        });
      } else {
        qrCodeDiv.textContent = 'فشل في توليد QR Code';
      }
    } catch (err) {
      console.error('❌ خطأ في ربط واتساب:', err);
      qrCodeDiv.textContent = 'خطأ في ربط واتساب';
    }
  });

  // زر فصل الجلسة
  disconnectBtn.addEventListener('click', async () => {
    const botId = botSelect.value;
    if (!botId) return alert('يرجى اختيار بوت');

    try {
      const res = await fetch(`/api/whatsapp/disconnect/${botId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();

      if (res.ok) {
        connectionStatus.textContent = 'حالة الاتصال: غير متصل ❌';
        sessionDuration.textContent = '';
        connectBtn.style.display = 'inline-block';
        disconnectBtn.style.display = 'none';
        qrCodeDiv.innerHTML = '';
      } else {
        alert(data.message || 'فشل في فصل الجلسة');
      }
    } catch (err) {
      console.error('❌ خطأ في فصل الجلسة:', err);
      alert('خطأ في فصل الجلسة');
    }
  });

  // تحديث حالة الاتصال تلقائيًا كل 10 ثواني
  setInterval(async () => {
    const botId = botSelect.value;
    if (!botId) return;

    try {
      const res = await fetch(`/api/whatsapp/status/${botId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();

      if (data.isConnected) {
        connectionStatus.textContent = 'حالة الاتصال: متصل ✅';
        const duration = Math.floor((new Date() - new Date(data.connectedAt)) / 1000 / 60);
        sessionDuration.textContent = `مدة الجلسة: ${duration} دقيقة`;
        connectBtn.style.display = 'none';
        disconnectBtn.style.display = 'inline-block';
        qrCodeDiv.innerHTML = '';
      } else {
        connectionStatus.textContent = 'حالة الاتصال: غير متصل ❌';
        sessionDuration.textContent = '';
        connectBtn.style.display = 'inline-block';
        disconnectBtn.style.display = 'none';
        qrCodeDiv.innerHTML = '';
      }
    } catch (err) {
      console.error('❌ خطأ في تحديث حالة الجلسة:', err);
    }
  }, 10000); // كل 10 ثواني
}
