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

async function deleteUser(id) {
  if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
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
