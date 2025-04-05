document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) return (window.location.href = '/login.html');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  fetch('/activity', { headers })
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch activity');
      return res.json();
    })
    .then(data => {
      const body = document.getElementById('activity-body');
      body.innerHTML = '';

      if (!data.length) {
        body.innerHTML = `<tr><td colspan="6">No activity found</td></tr>`;
        return;
      }

      data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.user}</td>
          <td>${item.role}</td>
          <td>${item.botId || '—'}</td>
          <td>${item.action}</td>
          <td>${item.details}</td>
          <td>${new Date(item.timestamp).toLocaleString()}</td>
        `;
        body.appendChild(tr);
      });
    })
    .catch(err => {
      console.error('❌ Error loading activity:', err);
      alert('Could not load activity log');
    });
});
