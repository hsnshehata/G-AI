const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

async function loadActivityLogs() {
  try {
    const response = await fetch('/activity-logs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const logs = await response.json();
    const tbody = document.getElementById('log-body');
    tbody.innerHTML = '';

    logs.forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${log.user}</td>
        <td>${log.action}</td>
        <td>${new Date(log.timestamp).toLocaleString()}</td>
        <td>${log.botId}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    console.error('Error loading activity logs:', err);
    alert('Failed to load logs');
  }
}

document.addEventListener('DOMContentLoaded', loadActivityLogs);
