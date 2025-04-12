async function loadUsersPage() {
  const token = localStorage.getItem("token");
  const dashboard = document.getElementById("dashboard-section");
  dashboard.innerHTML = `
    <h2>إدارة المستخدمين</h2>
    <button onclick="showCreateUserForm()">➕ إضافة مستخدم</button>
    <div id="formContainer"></div>
    <div id="usersList">جاري التحميل...</div>
  `;

  try {
    const res = await fetch("/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = await res.json();
    const usersList = document.getElementById("usersList");

    if (!Array.isArray(users)) {
      usersList.innerHTML = "<p>لا يوجد مستخدمون متاحون</p>";
      return;
    }

    const usersHTML = users
      .map(
        (u) => `
      <div class="user-box">
        <h4>👤 ${u.username} (${u.role})</h4>
        <button onclick="deleteUser('${u._id}')">🗑 حذف</button>
      </div>`
      )
      .join("");

    usersList.innerHTML = usersHTML;
  } catch (err) {
    console.error("حدث خطأ في جلب المستخدمين:", err);
  }
}

function showCreateUserForm() {
  const container = document.getElementById("formContainer");
  container.innerHTML = `
    <h3>إنشاء مستخدم جديد</h3>
    <input type="text" id="newUsername" placeholder="اسم المستخدم">
    <input type="password" id="newPassword" placeholder="كلمة المرور">
    <select id="newRole">
      <option value="user">مستخدم عادي</option>
      <option value="admin">سوبر أدمن</option>
    </select>
    <button onclick="createUser()">إنشاء</button>
  `;
}

async function createUser() {
  const token = localStorage.getItem("token");
  const username = document.getElementById("newUsername").value;
  const password = document.getElementById("newPassword").value;
  const role = document.getElementById("newRole").value;

  if (!username || !password) {
    alert("يرجى إدخال جميع البيانات");
    return;
  }

  try {
    const res = await fetch("/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ تم إنشاء المستخدم");
      loadUsersPage();
    } else {
      alert("❌ فشل في الإنشاء: " + (data.error || "حدث خطأ"));
    }
  } catch (err) {
    console.error("فشل الإنشاء:", err);
  }
}

async function deleteUser(userId) {
  const token = localStorage.getItem("token");

  if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

  try {
    const res = await fetch(`/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      alert("✅ تم الحذف");
      loadUsersPage();
    } else {
      alert("❌ فشل في الحذف");
    }
  } catch (err) {
    console.error("خطأ في حذف المستخدم:", err);
  }
}
