// تحميل صفحة البوتات
async function loadBotsPage() {
  const content = document.getElementById('content');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  let html = `
    <h2>إدارة البوتات</h2>
    <button onclick="showCreateBotForm()">إنشاء بوت جديد</button>
    <div id="botsList"></div>
  `;

  if (role === 'superadmin') {
    html += `
      <h3>إدارة المستخدمين</h3>
      <button onclick="showCreateUserForm()">إضافة مستخدم</button>
      <div id="usersList"></div>
    `;
  }

  content.innerHTML = html;

  // جلب البوتات
  const botsLoaded = await fetchBots();
  if (!botsLoaded) {
    content.innerHTML += '<p>فشل في جلب البوتات. برجاء المحاولة لاحقاً.</p>';
    return;
  }

  // جلب المستخدمين إذا كان المستخدم سوبر أدمن
  if (role === 'superadmin') {
    const usersLoaded = await fetchUsers();
    if (!usersLoaded) {
      content.innerHTML += '<p>فشل في جلب المستخدمين. برجاء المحاولة لاحقاً.</p>';
    }
  }
}

// جلب البوتات
async function fetchBots() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const botsList = document.getElementById('botsList');

  try {
    const res = await fetch('/api/bots', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Failed to fetch bots:', data.message);
      alert(data.message || 'فشل في جلب البوتات');
      return false;
    }

    const userBots = role === 'superadmin' ? data : data.filter((bot) => bot.userId._id === userId);

    botsList.innerHTML = userBots
      .map(
        (bot) => `
          <div>
            <p>اسم البوت: ${bot.name}</p>
            <p>الحالة: ${bot.status}</p>
            <button onclick="editBot('${bot._id}', '${bot.name}', '${bot.status}')">تعديل</button>
            <button onclick="deleteBot('${bot._id}')">حذف</button>
          </div>
        `
      )
      .join('');
    return true;
  } catch (err) {
    console.error('Error fetching bots:', err);
    alert('خطأ في السيرفر أثناء جلب البوتات، برجاء المحاولة لاحقاً');
    return false;
  }
}

// جلب المستخدمين
async function fetchUsers() {
  const token = localStorage.getItem('token');
  const usersList = document.getElementById('usersList');

  try {
    const res = await fetch('/api/users', {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Failed to fetch users:', data.message);
      alert(data.message || 'فشل في جلب المستخدمين');
      return false;
    }

    usersList.innerHTML = data
      .map(
        (user) => `
          <div>
            <p>اسم المستخدم: ${user.username}</p>
            <p>الدور: ${user.role}</p>
            <button onclick="editUser('${user._id}', '${user.username}', '${user.role}')">تعديل</button>
            <button onclick="deleteUser('${user._id}')">حذف</button>
          </div>
        `
      )
      .join('');
    return true;
  } catch (err) {
    console.error('Error fetching users:', err);
    alert('خطأ في السيرفر أثناء جلب المستخدمين، برجاء المحاولة لاحقاً');
    return false;
  }
}

// إنشاء بوت جديد
async function createBot(name, status) {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('/api/bots', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, status }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Failed to create bot:', data.message);
      alert(data.message || 'فشل في إنشاء البوت');
      return;
    }

    await fetchBots();
  } catch (err) {
    console.error('Error creating bot:', err);
    alert('خطأ في السيرفر أثناء إنشاء البوت، برجاء المحاولة لاحقاً');
  }
}

// تعديل بوت
async function editBot(id, name, status) {
  const token = localStorage.getItem('token');
  const newName = prompt('أدخل اسم البوت الجديد:', name);
  const newStatus = prompt('أدخل حالة البوت الجديدة (active/inactive):', status);

  if (newName && newStatus) {
    try {
      const res = await fetch(`/api/bots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName, status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to edit bot:', data.message);
        alert(data.message || 'فشل في تعديل البوت');
        return;
      }

      await fetchBots();
    } catch (err) {
      console.error('Error editing bot:', err);
      alert('خطأ في السيرفر أثناء تعديل البوت، برجاء المحاولة لاحقاً');
    }
  }
}

// حذف بوت
async function deleteBot(id) {
  const token = localStorage.getItem('token');

  if (confirm('هل أنت متأكد من حذف هذا البوت؟')) {
    try {
      const res = await fetch(`/api/bots/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to delete bot:', data.message);
        alert(data.message || 'فشل في حذف البوت');
        return;
      }

      await fetchBots();
    } catch (err) {
      console.error('Error deleting bot:', err);
      alert('خطأ في السيرفر أثناء حذف البوت، برجاء المحاولة لاحقاً');
    }
  }
}

// إنشاء مستخدم جديد
async function createUser(username, password, role) {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error('Failed to create user:', data.message);
      alert(data.message || 'فشل في إنشاء المستخدم');
      return;
    }

    await fetchUsers();
  } catch (err) {
    console.error('Error creating user:', err);
    alert('خطأ في السيرفر أثناء إنشاء المستخدم، برجاء المحاولة لاحقاً');
  }
}

// تعديل مستخدم
async function editUser(id, username, role) {
  const token = localStorage.getItem('token');
  const newUsername = prompt('أدخل اسم المستخدم الجديد:', username);
  const newRole = prompt('أدخل الدور الجديد (user/superadmin):', role);

  if (newUsername && newRole) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername, role: newRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to edit user:', data.message);
        alert(data.message || 'فشل في تعديل المستخدم');
        return;
      }

      await fetchUsers();
    } catch (err) {
      console.error('Error editing user:', err);
      alert('خطأ في السيرفر أثناء تعديل المستخدم، برجاء المحاولة لاحقاً');
    }
  }
}

// حذف مستخدم
async function deleteUser(id) {
  const token = localStorage.getItem('token');

  if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('Failed to delete user:', data.message);
        alert(data.message || 'فشل في حذف المستخدم');
        return;
      }

      await fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('خطأ في السيرفر أثناء حذف المستخدم، برجاء المحاولة لاحقاً');
    }
  }
}

// إظهار نموذج إنشاء بوت
function showCreateBotForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h3>إنشاء بوت جديد</h3>
    <form id="createBotForm">
      <div>
        <label for="botName">اسم البوت:</label>
        <input type="text" id="botName" required>
      </div>
      <div>
        <label for="botStatus">الحالة:</label>
        <select id="botStatus" required>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
      </div>
      <button type="submit">إنشاء</button>
    </form>
  `;

  document.getElementById('createBotForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('botName').value;
    const status = document.getElementById('botStatus').value;
    await createBot(name, status);
  });
}

// إظهار نموذج إضافة مستخدم
function showCreateUserForm() {
  const content = document.getElementById('content');
  content.innerHTML = `
    <h3>إضافة مستخدم جديد</h3>
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
        <label for="role">الدور:</label>
        <select id="role" required>
          <option value="user">مستخدم</option>
          <option value="superadmin">سوبر أدمن</option>
        </select>
      </div>
      <button type="submit">إضافة</button>
    </form>
  `;

  document.getElementById('createUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    await createUser(username, password, role);
  });
}
