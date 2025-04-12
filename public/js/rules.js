async function loadRulesPage() {
  const section = document.getElementById('dashboard-section');
  const role = localStorage.getItem('role');

  section.innerHTML = `
    <h2>إدارة القواعد</h2>
    <div>
      <label for="botSelectRules">اختر بوت:</label>
      <select id="botSelectRules" onchange="selectBot(this.value)"></select>
    </div>
    <div id="formContainer"></div>
    ${role === 'admin' ? `
      <h3>القواعد الثابتة</h3>
      <button onclick="showCreateGlobalRuleForm()">➕ قاعدة ثابتة</button>
      <div id="globalRules"></div>
    ` : ""}
    <h3>القواعد العامة</h3>
    <button onclick="showCreateGeneralRuleForm()">➕ قاعدة عامة</button>
    <div id="generalRules"></div>

    <h3>المنتجات والأسعار</h3>
    <button onclick="showCreateProductRuleForm()">➕ منتج</button>
    <div id="productRules"></div>

    <h3>سؤال وجواب</h3>
    <button onclick="showCreateQARuleForm()">➕ سؤال وجواب</button>
    <div id="qaRules"></div>

    <h3>ربط المتجر</h3>
    <button onclick="showCreateStoreRuleForm()">➕ مفتاح API</button>
    <div id="storeRules"></div>
  `;

  const botsLoaded = await populateBotSelectRules();
  if (!botsLoaded) return;

  const botSelect = document.getElementById('botSelectRules');
  if (!localStorage.getItem("selectedBotId") && botSelect.options.length > 0) {
    selectBot(botSelect.options[0].value);
  }

  setTimeout(() => {
    fetchRules();
  }, 100);
}

async function populateBotSelectRules() {
  const select = document.getElementById('botSelectRules');
  const token = localStorage.getItem('token');

  try {
    const res = await fetch("/api/bots", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const bots = await res.json();
    if (!res.ok) throw new Error("فشل في جلب البوتات");

    select.innerHTML = '';
    bots.forEach(bot => {
      select.innerHTML += `<option value="${bot._id}">${bot.name}</option>`;
    });

    return true;
  } catch (err) {
    console.error(err);
    alert('⚠️ حدث خطأ أثناء تحميل البوتات');
    return false;
  }
}

function selectBot(botId) {
  localStorage.setItem("selectedBotId", botId);
  fetchRules();
}

function getSelectedBotId() {
  return localStorage.getItem("selectedBotId");
}

async function fetchRules() {
  const token = localStorage.getItem("token");
  const botId = getSelectedBotId();
  if (!botId) return;

  try {
    const res = await fetch(`/api/rules?botId=${botId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const rules = await res.json();
    if (!res.ok) throw new Error("فشل في جلب القواعد");

    document.getElementById("generalRules").innerHTML = '';
    document.getElementById("productRules").innerHTML = '';
    document.getElementById("qaRules").innerHTML = '';
    document.getElementById("storeRules").innerHTML = '';
    if (document.getElementById("globalRules")) {
      document.getElementById("globalRules").innerHTML = '';
    }

    rules.forEach(rule => {
      const el = document.createElement("div");

      if (rule.type === "global" && document.getElementById("globalRules")) {
        el.innerHTML = `${rule.content}
          <button onclick="editRule('${rule._id}', 'global', '${rule.content}')">✏️</button>
          <button onclick="deleteRule('${rule._id}')">🗑</button>`;
        document.getElementById("globalRules").appendChild(el);
      }

      if (rule.botId !== botId) return;

      if (rule.type === "general") {
        el.innerHTML = `${rule.content}
          <button onclick="editRule('${rule._id}', 'general', '${rule.content}')">✏️</button>
          <button onclick="deleteRule('${rule._id}')">🗑</button>`;
        document.getElementById("generalRules").appendChild(el);
      }

      if (rule.type === "products") {
        el.innerHTML = `📦 ${rule.content.product} - 💰 ${rule.content.price} ${rule.content.currency}
          <button onclick="editProductRule('${rule._id}', ${JSON.stringify(rule.content)})">✏️</button>
          <button onclick="deleteRule('${rule._id}')">🗑</button>`;
        document.getElementById("productRules").appendChild(el);
      }

      if (rule.type === "qa") {
        el.innerHTML = `❓ ${rule.content.question} <br> 💬 ${rule.content.answer}
          <button onclick="editQARule('${rule._id}', ${JSON.stringify(rule.content)})">✏️</button>
          <button onclick="deleteRule('${rule._id}')">🗑</button>`;
        document.getElementById("qaRules").appendChild(el);
      }

      if (rule.type === "store") {
        el.innerHTML = `🔑 API: ${rule.content.apiKey}
          <button onclick="editStoreRule('${rule._id}', '${rule.content.apiKey}')">✏️</button>
          <button onclick="deleteRule('${rule._id}')">🗑</button>`;
        document.getElementById("storeRules").appendChild(el);
      }
    });
  } catch (err) {
    console.error(err);
    alert("⚠️ فشل في تحميل القواعد");
  }
}

// ===== النماذج والإجراءات =====
function showCreateGeneralRuleForm() {
  document.getElementById("formContainer").innerHTML = `
    <textarea id="ruleContent" placeholder="اكتب القاعدة هنا"></textarea>
    <button onclick="createRule('general')">➕ إضافة</button>
  `;
}

function showCreateGlobalRuleForm() {
  document.getElementById("formContainer").innerHTML = `
    <textarea id="ruleContent" placeholder="قاعدة للسوبر أدمن"></textarea>
    <button onclick="createRule('global')">➕ إضافة</button>
  `;
}

function showCreateProductRuleForm() {
  document.getElementById("formContainer").innerHTML = `
    <input placeholder="المنتج" id="product">
    <input placeholder="السعر" id="price">
    <input placeholder="العملة" id="currency">
    <button onclick="createRule('products')">➕ إضافة</button>
  `;
}

function showCreateQARuleForm() {
  document.getElementById("formContainer").innerHTML = `
    <input placeholder="السؤال" id="question">
    <input placeholder="الإجابة" id="answer">
    <button onclick="createRule('qa')">➕ إضافة</button>
  `;
}

function showCreateStoreRuleForm() {
  document.getElementById("formContainer").innerHTML = `
    <input placeholder="API Key" id="apiKey">
    <button onclick="createRule('store')">➕ إضافة</button>
  `;
}

async function createRule(type) {
  const token = localStorage.getItem("token");
  const botId = getSelectedBotId();
  if (!botId) return;

  let content = "";
  if (type === "products") {
    content = {
      product: document.getElementById("product").value,
      price: document.getElementById("price").value,
      currency: document.getElementById("currency").value,
    };
  } else if (type === "qa") {
    content = {
      question: document.getElementById("question").value,
      answer: document.getElementById("answer").value,
    };
  } else if (type === "store") {
    content = { apiKey: document.getElementById("apiKey").value };
  } else {
    content = document.getElementById("ruleContent").value;
  }

  try {
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ botId, type, content })
    });

    const data = await res.json();
    if (res.ok) {
      fetchRules();
    } else {
      alert("❌ " + data.message);
    }
  } catch (err) {
    console.error(err);
  }
}

async function editRule(id, type, content) {
  const token = localStorage.getItem("token");
  const newContent = prompt("أدخل القاعدة الجديدة:", content);
  if (!newContent) return;

  try {
    await fetch(`/api/rules/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type, content: newContent })
    });

    fetchRules();
  } catch (err) {
    console.error(err);
  }
}

async function editProductRule(id, content) {
  const { product, price, currency } = content;
  const newProduct = prompt("اسم المنتج:", product);
  const newPrice = prompt("السعر:", price);
  const newCurrency = prompt("العملة:", currency);

  await fetch(`/api/rules/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "products",
      content: { product: newProduct, price: newPrice, currency: newCurrency }
    })
  });

  fetchRules();
}

async function editQARule(id, content) {
  const newQ = prompt("السؤال:", content.question);
  const newA = prompt("الإجابة:", content.answer);

  await fetch(`/api/rules/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      type: "qa",
      content: { question: newQ, answer: newA }
    })
  });

  fetchRules();
}

async function editStoreRule(id, apiKey) {
  const newKey = prompt("API Key الجديد:", apiKey);

  await fetch(`/api/rules/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ type: "store", content: { apiKey: newKey } })
  });

  fetchRules();
}

async function deleteRule(id) {
  if (!confirm("هل تريد حذف القاعدة؟")) return;

  await fetch(`/api/rules/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  fetchRules();
}
