const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
};

// Fetch bot list for dropdown
async function loadBotOptions() {
  try {
    const res = await fetch('/bots', { headers });
    const bots = await res.json();
    const select = document.getElementById('bot-select');
    select.innerHTML = '';

    bots.forEach(bot => {
      const option = document.createElement('option');
      option.value = bot._id;
      option.textContent = bot.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('❌ Error loading bots:', err);
  }
}

// Load stats for selected bot
async function loadStats() {
  const botId = document.getElementById('bot-select').value;
  if (!botId) return alert('Please select a bot');

  try {
    const res = await fetch(`/stats/all?botId=${botId}`, { headers });
    const data = await res.json();

    // Fill counters
    document.getElementById('daily-count').textContent = data.daily || 0;
    document.getElementById('weekly-count').textContent = data.weekly || 0;
    document.getElementById('monthly-count').textContent = data.monthly || 0;
    document.getElementById('avg-words').textContent = data.avgWords || 0;
    document.getElementById('top-words').textContent = (data.topWords || []).join(', ') || 'N/A';

    // Render chart
    drawChart(data.chartLabels, data.chartData);
  } catch (err) {
    console.error('❌ Failed to load stats:', err);
    alert('Could not load statistics.');
  }
}

// Chart.js
let chart;
function drawChart(labels, data) {
  const ctx = document.getElementById('stats-chart').getContext('2d');

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels || [],
      datasets: [{
        label: 'Messages per Day',
        data: data || [],
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Daily Message Count' }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadBotOptions();
  document.getElementById('load-stats').addEventListener('click', loadStats);
});
