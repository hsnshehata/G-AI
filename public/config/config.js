const token = localStorage.getItem('token');
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

const botId = new URLSearchParams(window.location.search).get('botId');

async function loadConfig() {
  try {
    const res = await fetch(`/config/${botId}`, { headers });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to load config');

    document.getElementById('openaiKey').value = data.openaiKey || '';
    document.getElementById('githubToken').value = data.githubToken || '';
    document.getElementById('whatsappToken').value = data.whatsappToken || '';
    document.getElementById('mongoUri').value = data.mongoUri || '';
    document.getElementById('botName').value = data.botName || '';
    document.getElementById('botDescription').value = data.botDescription || '';
    document.getElementById('active').value = data.active ? 'true' : 'false';
  } catch (err) {
    document.getElementById('status-message').textContent = err.message;
  }
}

document.getElementById('config-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const config = {
    openaiKey: document.getElementById('openaiKey').value,
    githubToken: document.getElementById('githubToken').value,
    whatsappToken: document.getElementById('whatsappToken').value,
    mongoUri: document.getElementById('mongoUri').value,
    botName: document.getElementById('botName').value,
    botDescription: document.getElementById('botDescription').value,
    active: document.getElementById('active').value === 'true'
  };

  try {
    const res = await fetch(`/config/${botId}/update`, {
      method: 'POST',
      headers,
      body: JSON.stringify(config)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update');

    document.getElementById('status-message').textContent = '✅ Settings updated successfully!';
  } catch (err) {
    document.getElementById('status-message').textContent = `❌ ${err.message}`;
  }
});

document.addEventListener('DOMContentLoaded', loadConfig);
