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
async function loadSection(section) {
  const urlMap = {
    rules: "/rules",
    chats: "/chats",
    ratings: "/ratings",
    stats: "/stats/all",
    settings: "/config",
  };

  const endpoint = urlMap[section];
  if (!endpoint) return;

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
