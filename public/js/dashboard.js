let token = localStorage.getItem("token");

// محاولة تسجيل الدخول
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "فشل تسجيل الدخول");
    }

    token = data.token;
    localStorage.setItem("token", token);

    document.getElementById("login-section").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

  } catch (err) {
    document.getElementById("login-error").textContent = err.message;
  }
}

// تحميل قسم معيّن
function loadSection(section) {
  if (section === "rules") return loadRules(); // تحديث للتعامل مع القواعد

  const urlMap = {
    chats: "/chats",
    ratings: "/ratings",
    stats: "/stats/all",
    settings: "/config",
  };

  const endpoint = urlMap[section];
  if (!endpoint) return;

  async function fetchData() {
    try {
      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");

      renderSection(section, data);
    } catch (err) {
      document.getElementById("content-area").innerHTML =
        `<p style="color:red;">${err.message}</p>`;
    }
  }

  fetchData();
}

// عرض محتوى القسم
function renderSection(section, data) {
  const content = document.getElementById("content-area");
  content.innerHTML = `<h2>${getSectionTitle(section)}</h2><pre>${JSON.stringify(data, null, 2)}</pre>`;
}

// عناوين الأقسام
function getSectionTitle(section) {
  switch (section) {
    case "rules": return "قواعد البوت";
    case "chats": return "أرشيف المحادثات";
    case "ratings": return "تقييمات المستخدمين";
    case "stats": return "إحصائيات الأداء";
    case "settings": return "إعدادات النظام";
    default: return "";
  }
}

// إعادة إظهار الداشبورد لو التوكن محفوظ
window.onload = () => {
  if (token) {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
  }
};

// دالة تسجيل الخروج
function logout() {
  localStorage.removeItem("token");
  token = null;
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("login-section").style.display = "block";
}

// ✅ دالة تحميل القواعد من السيرفر
async function loadRules() {
  try {
    const res = await fetch("/rules", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل تحميل القواعد");
    renderRules(Array.isArray(data) ? data : data.rules || []); // التعديل هنا
  } catch (err) {
    document.getElementById("content-area").innerHTML = `<p style="color:red;">${err.message}</p>`;
  }
}

// ✨ دالة عرض القواعد في جدول + نموذج إضافة قاعدة
function renderRules(rules) {
  const content = document.getElementById("content-area");
  content.innerHTML = `
    <h2>إدارة القواعد</h2>
    <form id="addRuleForm">
      <input type="text" id="newKeyword" placeholder="الكلمة المفتاحية" required />
      <input type="text" id="newResponse" placeholder="الرد" required />
      <input type="text" id="newPageId" placeholder="Page ID" required />
      <button type="submit">➕ إضافة قاعدة</button>
    </form>
    <table border="1" cellpadding="8" style="width:100%;margin-top:15px">
      <thead><tr><th>الكلمة</th><th>الرد</th><th>Page ID</th><th>إجراءات</th></tr></thead>
      <tbody>
        ${rules.map(rule => `
          <tr>
            <td><input value="${rule.keyword}" onchange="editRule('${rule._id}', 'keyword', this.value)" /></td>
            <td><input value="${rule.response}" onchange="editRule('${rule._id}', 'response', this.value)" /></td>
            <td>${rule.pageId}</td>
            <td><button onclick="deleteRule('${rule._id}')">🗑 حذف</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  // حدث الفورم
  document.getElementById("addRuleForm").onsubmit = async (e) => {
    e.preventDefault();
    await addRule();
  };
}

// ✨ دوال الإضافة، التعديل، الحذف
async function addRule() {
  const keyword = document.getElementById("newKeyword").value;
  const response = document.getElementById("newResponse").value;
  const pageId = document.getElementById("newPageId").value;

  try {
    const res = await fetch("/rules", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ keyword, response, pageId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل الإضافة");

    loadRules(); // تحديث القائمة
  } catch (err) {
    alert(err.message);
  }
}

async function editRule(id, field, value) {
  try {
    const res = await fetch(`/rules/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ [field]: value }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل التعديل");
  } catch (err) {
    alert(err.message);
  }
}

async function deleteRule(id) {
  if (!confirm("هل أنت متأكد من الحذف؟")) return;
  try {
    const res = await fetch(`/rules/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "فشل الحذف");

    loadRules(); // تحديث القائمة
  } catch (err) {
    alert(err.message);
  }
}
