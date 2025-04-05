// Ensure token is available
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/dashboard/login.html';
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
};

async function loadBotOptions() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const select = document.getElementById('bot-select');
    select.innerHTML = '';

    // Superadmin يشوف كل البوتات
    if (user.role === 'superadmin' && user.bots) {
      user.bots.forEach(bot => {
        const opt = document.createElement('option');
        opt.value = bot.botId;
        opt.textContent = bot.name || bot.botId;
        select.appendChild(opt);
      });
    } else {
      const opt = document.createElement('option');
      opt.value = user.pageId;
      opt.textContent = user.pageId;
      select.appendChild(opt);
    }
  } catch (err) {
    console.error('Error loading bots:', err);
  }
}

// Load ratings
async function loadRatings() {
  const botId = document.getElementById('bot-select')?.value;
  const type = document.getElementById('rating-type').value;

  if (!botId) {
    alert('Bot not selected');
    return;
  }

  try {
    const response = await fetch(`/ratings?pageId=${botId}&type=${type}`, { headers });
    if (!response.ok) throw new Error('Failed to fetch ratings');
    const ratings = await response.json();

    const list = document.getElementById('rating-list');
    list.innerHTML = '';

    if (ratings.length === 0) {
      list.innerHTML = '<tr><td colspan="4">No ratings found</td></tr>';
      return;
    }

    ratings.forEach(rating => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${rating.userId}</td>
        <td>${rating.message || '—'}</td>
        <td>${rating.rating === 'positive' ? '👍' : '👎'}</td>
        <td>${new Date(rating.timestamp).toLocaleString()}</td>
      `;
      list.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading ratings:', err);
    alert('Could not load ratings');
  }
}

// Delete ratings
async function deleteRatings() {
  const botId = document.getElementById('bot-select')?.value;
  const type = document.getElementById('rating-type').value;

  if (!botId || !type) {
    alert('Missing bot or type');
    return;
  }

  if (!confirm(`Are you sure you want to delete all ${type} ratings?`)) return;

  try {
    const response = await fetch('/ratings/delete', {
      method: 'POST',
      headers,
      body: JSON.stringify({ pageId: botId, type })
    });
    if (!response.ok) throw new Error('Failed to delete ratings');

    alert('Ratings deleted');
    loadRatings();
  } catch (err) {
    console.error('Error deleting ratings:', err);
    alert('Could not delete ratings');
  }
}

// Events
document.addEventListener('DOMContentLoaded', () => {
  loadBotOptions();
  document.getElementById('load-ratings').addEventListener('click', loadRatings);
  document.getElementById('delete-ratings').addEventListener('click', deleteRatings);
});
