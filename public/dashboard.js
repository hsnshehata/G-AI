async function loadActivityLogs() {
    const res = await fetch(`/activity?botId=${selectedBotId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('activity-body');
    tbody.innerHTML = '';
  
    data.forEach(log => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${log.user}</td>
        <td>${log.role}</td>
        <td>${log.action}</td>
        <td>${log.botId || '-'}</td>
        <td>${log.details || ''}</td>
        <td>${new Date(log.timestamp).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  }
  
