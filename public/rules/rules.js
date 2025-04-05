const token = localStorage.getItem('token');
if (!token) window.location.href = '/login.html';

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
};

let currentPageId = ''; // fetched dynamically

async function fetchRules() {
  try {
    const res = await fetch('/rules', { headers });
    const data = await res.json();

    currentPageId = data.pageId;
    const list = document.getElementById('rules-list');
    list.innerHTML = '';

    data.rules.forEach(rule => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${rule.keyword}</strong>: ${rule.response}
        <div class="rule-actions">
          <button onclick="editRule('${rule._id}', '${rule.keyword}', '${rule.response.replace(/'/g, "\\'")}')">✏️</button>
          <button onclick="deleteRule('${rule._id}')">🗑️</button>
        </div>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    alert('Failed to load rules');
    console.error(err);
  }
}

async function addRule() {
  const keyword = document.getElementById('keyword').value.trim();
  const response = document.getElementById('response').value.trim();
  if (!keyword || !response) return alert('Fill both fields');

  await fetch('/rules', {
    method: 'POST',
    headers,
    body: JSON.stringify({ keyword, response, pageId: currentPageId })
  });

  document.getElementById('keyword').value = '';
  document.getElementById('response').value = '';
  fetchRules();
}

async function editRule(id, keyword, response) {
  const newKeyword = prompt('Edit keyword', keyword);
  const newResponse = prompt('Edit response', response);
  if (!newKeyword || !newResponse) return;

  await fetch(`/rules/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ keyword: newKeyword, response: newResponse })
  });

  fetchRules();
}

async function deleteRule(id) {
  if (!confirm('Are you sure you want to delete this rule?')) return;
  await fetch(`/rules/${id}`, {
    method: 'DELETE',
    headers
  });
  fetchRules();
}

document.addEventListener('DOMContentLoaded', fetchRules);
