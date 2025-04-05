const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
};

async function fetchRatings() {
  try {
    const res = await fetch('/ratings', { headers });
    const data = await res.json();

    document.getElementById('positiveCount').textContent = data.positive;
    document.getElementById('negativeCount').textContent = data.negative;

    const list = document.getElementById('ratings-list');
    list.innerHTML = '';

    data.ratings.forEach(rating => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          ${rating.value === 'positive' ? '👍' : '👎'} - 
          <span class="rating-meta">${new Date(rating.createdAt).toLocaleString()}</span>
        </div>
        <div class="rating-actions">
          <button onclick="deleteRating('${rating._id}')">🗑️</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    alert('Failed to fetch ratings');
    console.error(err);
  }
}

async function deleteRating(id) {
  if (!confirm('Are you sure you want to delete this rating?')) return;

  await fetch(`/ratings/${id}`, {
    method: 'DELETE',
    headers
  });

  fetchRatings();
}

document.addEventListener('DOMContentLoaded', fetchRatings);
