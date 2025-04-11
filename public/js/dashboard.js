document.getElementById('botsBtn').addEventListener('click', () => {
  window.location.href = '#bots';
  loadBotsPage();
});

function loadBotsPage() {
  const content = document.getElementById('content');
  const role = localStorage.getItem('role');

  let html = `
    <h2>Bots Management</h2>
  `;

  if (role === 'superadmin') {
    html += `
      <button onclick="showCreateUserForm()">Create New User</button>
      <button onclick="showCreateBotForm()">Create New Bot</button>
      <div id="formContainer"></div>
    `;
  }

  html += `
    <table>
      <thead>
        <tr>
          <th>Username</th>
          <th>Bots</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="usersTable"></tbody>
    </table>
  `;

  content.innerHTML = html;
  fetchUsers();
}

async function fetchUsers() {
  try {
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const users = await res.json();

    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';

    users.forEach((user) => {
      const botsList = user.bots.map((bot) => `
        ${bot.name}
        <button onclick="editBot('${bot._id}', '${bot.name}')">Edit</button>
        <button onclick="deleteBot('${bot._id}')">Delete</button>
      `).join('<br>');

      const row = `
        <tr>
          <td>${user.username}</td>
          <td>${botsList || 'No bots'}</td>
          <td>
            <button onclick="editUser('${user._id}', '${user.username}')">Edit</button>
            <button onclick="deleteUser('${user._id}')">Delete</button>
          </td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  } catch (err) {
    console.error(err);
  }
}

function showCreateUserForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <h3>Create New User</h3>
    <form id="createUserForm">
      <div>
        <label for="username">Username:</label>
        <input type="text" id="username" required>
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" id="password" required>
      </div>
      <div>
        <label for="confirmPassword">Confirm Password:</label>
        <input type="password" id="confirmPassword" required>
      </div>
      <button type="submit">Create</button>
    </form>
    <p id="userError" style="color: red;"></p>
  `;

  document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorEl = document.getElementById('userError');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        formContainer.innerHTML = '<p>User created successfully!</p>';
        fetchUsers();
      } else {
        errorEl.textContent = data.message;
      }
    } catch (err) {
      errorEl.textContent = 'Server error';
    }
  });
}

function showCreateBotForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <h3>Create New Bot</h3>
    <form id="createBotForm">
      <div>
        <label for="botName">Bot Name:</label>
        <input type="text" id="botName" required>
      </div>
      <div>
        <label for="userId">User:</label>
        <select id="userId" required></select>
      </div>
      <button type="submit">Create</button>
    </form>
    <p id="botError" style="color: red;"></p>
  `;

  // Fetch users for dropdown
  fetch('/api/users', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
    .then((res) => res.json())
    .then((users) => {
      const select = document.getElementById('userId');
      users.forEach((user) => {
        select.innerHTML += `<option value="${user._id}">${user.username}</option>`;
      });
    });

  document.getElementById('createBotForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('botName').value;
    const userId = document.getElementById('userId').value;
    const errorEl = document.getElementById('botError');

    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name, userId }),
      });

      const data = await res.json();
      if (res.ok) {
        formContainer.innerHTML = '<p>Bot created successfully!</p>';
        fetchUsers();
      } else {
        errorEl.textContent = data.message;
      }
    } catch (err) {
      errorEl.textContent = 'Server error';
    }
  });
}

async function deleteUser(id) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }
}

async function editUser(id, username) {
  const newUsername = prompt('Enter new username:', username);
  if (newUsername) {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username: newUsername }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }
}

async function deleteBot(id) {
  if (confirm('Are you sure you want to delete this bot?')) {
    try {
      await fetch(`/api/bots/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }
}

async function editBot(id, name) {
  const newName = prompt('Enter new bot name:', name);
  if (newName) {
    try {
      await fetch(`/api/bots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }
}
