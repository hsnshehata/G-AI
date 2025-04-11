document.getElementById('botsBtn').addEventListener('click', () => {
  window.location.href = '#bots';
  loadBotsPage();
});

function loadBotsPage() {
  const content = document.getElementById('content');
  const role = localStorage.getItem('role');
  let html = `
    <h2>إدارة البوتات</h2>
  `;
  if (role === 'superadmin') {
    html += `
      <button onclick="showCreateUserForm()">إنشاء مستخدم جديد</button>
      <button onclick="showCreateBotForm()">إنشاء بوت جديد</button>
      <div id="formContainer"></div>
    `;
  }
  html += `
    <table>
      <thead>
        <tr>
          <th>اسم المستخدم</th>
          <th>نوع المستخدم</th>
          <th>البوتات</th>
          <th>الإجراءات</th>
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
        <button onclick="editBot('${bot._id}', '${bot.name}')">تعديل</button>
        <button onclick="deleteBot('${bot._id}')">حذف</button>
      `).join('<br>');
      const row = `
        <tr>
          <td>${user.username}</td>
          <td>${user.role === 'superadmin' ? 'سوبر أدمن' : 'مستخدم عادي'}</td>
          <td>${botsList || 'لا توجد بوتات'}</td>
          <td>
            <button onclick="editUser('${user._id}', '${user.username}', '${user.role}')">تعديل</button>
            <button onclick="deleteUser('${user._id}')">حذف</button>
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
    <h3>إنشاء مستخدم جديد</h3>
    <form id="createUserForm">
      <div>
        <label for="username">اسم المستخدم:</label>
        <input type="text" id="username" required>
      </div>
      <div>
        <label for="password">كلمة المرور:</label>
        <input type="password" id="password" required>
      </div>
      <div>
        <label for="confirmPassword">تأكيد كلمة المرور:</label>
        <input type="password" id="confirmPassword" required>
      </div>
      <div>
        <label for="role">نوع المستخدم:</label>
        <select id="role" required>
          <option value="user">مستخدم عادي</option>
          <option value="superadmin">سوبر أدمن</option>
        </select>
      </div>
      <button type="submit">إنشاء</button>
    </form>
    <p id="userError" style="color: red;"></p>
  `;
  document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const errorEl = document.getElementById('userError');
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username, password, confirmPassword, role }),
      });
      const data = await res.json();
      if (res.ok) {
        formContainer.innerHTML = '<p>تم إنشاء المستخدم بنجاح!</p>';
        fetchUsers();
      } else {
        errorEl.textContent = data.message;
      }
    } catch (err) {
      errorEl.textContent = 'خطأ في السيرفر';
    }
  });
}

function showCreateBotForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <h3>إنشاء بوت جديد</h3>
    <form id="createBotForm">
      <div>
        <label for="botName">اسم البوت:</label>
        <input type="text" id="botName" required>
      </div>
      <div>
        <label for="userId">المستخدم:</label>
        <select id="userId" required></select>
      </div>
      <button type="submit">إنشاء</button>
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
        formContainer.innerHTML = '<p>تم إنشاء البوت بنجاح!</p>';
        fetchUsers();
      } else {
        errorEl.textContent = data.message;
      }
    } catch (err) {
      errorEl.textContent = 'خطأ في السيرفر';
    }
  });
}

async function deleteUser(id) {
  if (confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟')) {
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

async function editUser(id, username, role) {
  const newUsername = prompt('أدخل اسم المستخدم الجديد:', username);
  const newRole = prompt('أدخل نوع المستخدم (user أو superadmin):', role);
  if (newUsername && newRole) {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username: newUsername, role: newRole }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  }
}

async function deleteBot(id) {
  if (confirm('هل أنت متأكد أنك تريد حذف هذا البوت؟')) {
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
  const newName = prompt('أدخل اسم البوت الجديد:', name);
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
