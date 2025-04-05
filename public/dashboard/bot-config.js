const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login.html';
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
};

async function loadConfig() {
  try {
    const res = await fetch('/config', { headers });
    if (!res.ok) throw new Error('Failed to load config');
    const data = await res.json();

    data.forEach(cfg => {
      switch (cfg.key) {
        case 'OPENAI_KEY':
          document.getElementById('openaiKey').value = cfg.value;
          break;
        case 'GITHUB_TOKEN':
          document.getElementById('githubToken').value = cfg.value;
          break;
        case 'WHATSAPP_TOKEN':
          document.getElementById('whatsappToken').value = cfg.value;
          break;
        case 'MONGO_URI':
          document.getElementById('mongoUri').value = cfg.value;
          break;
      }
    });
  } catch (err) {
    console.error(err);
    alert('Error loading config');
  }
}

async function saveConfig() {
  const entries = [
    { key: 'OPENAI_KEY', value: document.getElementById('openaiKey').value },
    { key: 'GITHUB_TOKEN', value: document.getElementById('githubToken').value },
    { key: 'WHATSAPP_TOKEN', value: document.getElementById('whatsappToken').value },
    { key: 'MONGO_URI', value: document.getElementById('mongoUri').value },
  ];

  try {
    for (const entry of entries) {
      await fetch('/config', {
        method: 'PUT',
        headers,
        body: JSON.stringify(entry)
      });
    }

    document.getElementById('save-status').textContent = '✅ Settings saved successfully!';
  } catch (err) {
    console.error(err);
    document.getElementById('save-status').textContent = '❌ Error saving settings.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  document.getElementById('save-config').addEventListener('click', saveConfig);
});
