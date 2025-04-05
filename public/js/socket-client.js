// Connect to WebSocket server
const socket = io(); // بيربط تلقائي على نفس الدومين

// انضمام لغرفة بوت معيّن لو في botId متاح
function joinBotRoom(botId) {
  if (!botId) return;
  socket.emit('joinRoom', botId);
}

// استقبال إشعارات QR جديد
socket.on('whatsapp:qr', (data) => {
  console.log('📲 New QR Received:', data);
  const qrImg = document.getElementById('qr-image');
  if (qrImg) {
    qrImg.src = data.qr;
    playSound('qr-sound');
  }
});

// إشعار عند الاتصال الناجح
socket.on('whatsapp:connected', (data) => {
  console.log('✅ WhatsApp Connected:', data);
  const statusEl = document.getElementById('wa-status');
  if (statusEl) {
    statusEl.textContent = 'Connected ✅';
    statusEl.classList.add('connected');
  }
});

// إشعار عند فشل الاتصال
socket.on('whatsapp:disconnected', (data) => {
  console.log('❌ WhatsApp Disconnected:', data);
  const statusEl = document.getElementById('wa-status');
  if (statusEl) {
    statusEl.textContent = 'Disconnected ❌';
    statusEl.classList.remove('connected');
  }
  playSound('error-sound');
});

// صوت للتنبيه
function playSound(id) {
  const audio = document.getElementById(id);
  if (audio) audio.play();
}
