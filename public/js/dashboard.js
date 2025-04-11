let selectedBotId = null;

document.addEventListener('DOMContentLoaded', () => {
  const role = localStorage.getItem('role');
  if (!localStorage.getItem('token')) {
    window.location.href = '/';
    return;
  }

  document.getElementById('botsBtn').addEventListener('click', () => {
    window.location.href = '#bots';
    loadBotsPage();
  });

  document.getElementById('rulesBtn').addEventListener('click', () => {
    window.location.href = '#rules';
    loadRulesPage();
  });

  // Load bots page by default
  loadBotsPage();
});

async function loadBotsPage() {
  const content = document.getElementById('content');
  const role = localStorage.getItem('role');

  let html = `
    <h2>إدارة البوتات</h2>
    <div>
      <label for="botSelect">اختر بوت:</label>
      <select id="botSelect" onchange="selectBot(this.value)"></select>
    </div>
  `;

  if (role === 'superadmin') {
    html += `
      <button onclick="showCreateUserForm()">إنشاء مستخدم جديد</button>
      <button onclick="showCreateBotForm()">إنشاء بوت جديد</button>
    `;
  }

  html += `
    <div id="formContainer"></div>
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
  await fetchUsers();
  await populateBotSelect();
  if (!selectedBotId && document.getElementById('botSelect').options.length > 0) {
    selectBot(document.getElementById('botSelect').options[0].value);
  }
}

async function populateBotSelect() {
  const botSelect = document.getElementById('botSelect');
  const role = localStorage.getItem('role');
  const res = await fetch('/api/bots', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  const bots = await res.json();

  botSelect.innerHTML = '';
  const userBots = role === 'superadmin' ? bots : bots.filter((bot) => bot.userId._id === localStorage.getItem('userId'));
  userBots.forEach((bot) => {
    botSelect.innerHTML += `<option value="${bot._id}">${bot.name}</option>`;
  });
}

function selectBot(botId) {
  selectedBotId = botId;
  const botSelect = document.getElementById('botSelect');
  for (let option of botSelect.options) {
    option.classList.remove('selected-bot');
    if (option.value === botId) {
      option.classList.add('selected-bot');
    }
  }
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
        <button onclick="editBot('${bot._id}', '${bot.name}', '${bot.facebookApiKey || ''}', '${bot.facebookPageId || ''}')">تعديل</button>
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
        <label for="facebookApiKey">رقم API لفيسبوك (اختياري):</label>
        <input type="text" id="facebookApiKey">
      </div>
      <div id="facebookPageIdContainer" style="display: none;">
        <label for="facebookPageId">معرف صفحة الفيسبوك:</label>
        <input type="text" id="facebookPageId">
      </div>
      <div>
        <label for="userId">المستخدم:</label>
        <input type="text" id="userSearch" placeholder="ابحث عن المستخدم...">
        <select id="userId" required></select>
      </div>
      <button type="submit">إنشاء</button>
    </form>
    <p id="botError" style="color: red;"></p>
  `;

  const facebookApiKeyInput = document.getElementById('facebookApiKey');
  const facebookPageIdContainer = document.getElementById('facebookPageIdContainer');
  facebookApiKeyInput.addEventListener('input', () => {
    facebookPageIdContainer.style.display = facebookApiKeyInput.value ? 'block' : 'none';
  });

  const userSearch = document.getElementById('userSearch');
  const userSelect = document.getElementById('userId');
  let allUsers = [];

  fetch('/api/users', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
    .then((res) => res.json())
    .then((users) => {
      allUsers = users;
      users.forEach((user) => {
        userSelect.innerHTML += `<option value="${user._id}">${user.username}</option>`;
      });
    });

  userSearch.addEventListener('input', () => {
    const searchTerm = userSearch.value.toLowerCase();
    userSelect.innerHTML = '';
    allUsers
      .filter((user) => user.username.toLowerCase().includes(searchTerm))
      .forEach((user) => {
        userSelect.innerHTML += `<option value="${user._id}">${user.username}</option>`;
      });
  });

  document.getElementById('createBotForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('botName').value;
    const userId = document.getElementById('userId').value;
    const facebookApiKey = document.getElementById('facebookApiKey').value;
    const facebookPageId = document.getElementById('facebookPageId').value;
    const errorEl = document.getElementById('botError');

    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name, userId, facebookApiKey, facebookPageId }),
      });

      const data = await res.json();
      if (res.ok) {
        formContainer.innerHTML = '<p>تم إنشاء البوت بنجاح!</p>';
        fetchUsers();
        await populateBotSelect();
        if (!selectedBotId && document.getElementById('botSelect').options.length > 0) {
          selectBot(document.getElementById('botSelect').options[0].value);
        }
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

async function editBot(id, name, facebookApiKey, facebookPageId) {
  const newName = prompt('أدخل اسم البوت الجديد:', name);
  const newFacebookApiKey = prompt('أدخل رقم API لفيسبوك (اختياري):', facebookApiKey);
  let newFacebookPageId = facebookPageId;
  if (newFacebookApiKey) {
    newFacebookPageId = prompt('أدخل معرف صفحة الفيسبوك:', facebookPageId);
  }
  if (newName) {
    try {
      await fetch(`/api/bots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name: newName, facebookApiKey: newFacebookApiKey, facebookPageId: newFacebookPageId }),
      });
      fetchUsers();
      await populateBotSelect();
    } catch (err) {
      console.error(err);
    }
  }
}

async function deleteBot(id) {
  if (confirm('هل أنت متأكد من حذف هذا البوت؟')) {
    try {
      await fetch(`/api/bots/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchUsers();
      await populateBotSelect();
      if (selectedBotId === id && document.getElementById('botSelect').options.length > 0) {
        selectBot(document.getElementById('botSelect').options[0].value);
      }
    } catch (err) {
      console.error(err);
    }
  }
}

async function loadRulesPage() {
  const content = document.getElementById('content');
  const role = localStorage.getItem('role');

  let html = `
    <h2>إدارة القواعد</h2>
    <div>
      <label for="botSelectRules">اختر بوت:</label>
      <select id="botSelectRules" onchange="selectBot(this.value)"></select>
    </div>
    <div id="formContainer"></div>
  `;

  if (role === 'superadmin') {
    html += `
      <h3>القواعد الثابتة (للسوبر أدمن)</h3>
      <button onclick="showCreateGlobalRuleForm()">إضافة قاعدة ثابتة</button>
      <div id="globalRules"></div>
    `;
  }

  html += `
    <h3>القواعد العامة</h3>
    <button onclick="showCreateGeneralRuleForm()">إضافة قاعدة عامة</button>
    <div id="generalRules"></div>

    <h3>المنتجات والأسعار</h3>
    <button onclick="showCreateProductRuleForm()">إضافة منتج</button>
    <div id="productRules"></div>

    <h3>سؤال وجواب</h3>
    <button onclick="showCreateQARuleForm()">إضافة سؤال وجواب</button>
    <div id="qaRules"></div>

    <h3>ربط المتجر</h3>
    <button onclick="showCreateStoreRuleForm()">إضافة مفتاح API</button>
    <div id="storeRules"></div>
  `;

  content.innerHTML = html;
  await populateBotSelectRules();
  if (!selectedBotId && document.getElementById('botSelectRules').options.length > 0) {
    selectBot(document.getElementById('botSelectRules').options[0].value);
  }
  await fetchRules();
}

async function populateBotSelectRules() {
  const botSelect = document.getElementById('botSelectRules');
  const role = localStorage.getItem('role');
  const res = await fetch('/api/bots', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  const bots = await res.json();

  botSelect.innerHTML = '';
  const userBots = role === 'superadmin' ? bots : bots.filter((bot) => bot.userId._id === localStorage.getItem('userId'));
  userBots.forEach((bot) => {
    botSelect.innerHTML += `<option value="${bot._id}">${bot.name}</option>`;
  });
}

async function fetchRules() {
  if (!selectedBotId) return;

  const res = await fetch('/api/rules', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  const rules = await res.json();

  const generalRulesDiv = document.getElementById('generalRules');
  const productRulesDiv = document.getElementById('productRules');
  const qaRulesDiv = document.getElementById('qaRules');
  const storeRulesDiv = document.getElementById('storeRules');
  const globalRulesDiv = document.getElementById('globalRules');

  generalRulesDiv.innerHTML = '';
  productRulesDiv.innerHTML = '';
  qaRulesDiv.innerHTML = '';
  storeRulesDiv.innerHTML = '';
  if (globalRulesDiv) globalRulesDiv.innerHTML = '';

  rules.forEach((rule) => {
    if (rule.type === 'global' && globalRulesDiv) {
      globalRulesDiv.innerHTML += `
        <p>${rule.content}
          <button onclick="editRule('${rule._id}', 'global', '${rule.content}')">تعديل</button>
          <button onclick="deleteRule('${rule._id}')">حذف</button>
        </p>`;
    } else if (rule.botId.toString() === selectedBotId) {
      if (rule.type === 'general') {
        generalRulesDiv.innerHTML += `
          <p>${rule.content}
            <button onclick="editRule('${rule._id}', 'general', '${rule.content}')">تعديل</button>
            <button onclick="deleteRule('${rule._id}')">حذف</button>
          </p>`;
      } else if (rule.type === 'products') {
        productRulesDiv.innerHTML += `
          <p>المنتج: ${rule.content.product}، السعر: ${rule.content.price} ${rule.content.currency}
            <button onclick="editProductRule('${rule._id}', '${rule.content.product}', '${rule.content.price}', '${rule.content.currency}')">تعديل</button>
            <button onclick="deleteRule('${rule._id}')">حذف</button>
          </p>`;
      } else if (rule.type === 'qa') {
        qaRulesDiv.innerHTML += `
          <p>السؤال: ${rule.content.question}، الإجابة: ${rule.content.answer}
            <button onclick="editQARule('${rule._id}', '${rule.content.question}', '${rule.content.answer}')">تعديل</button>
            <button onclick="deleteRule('${rule._id}')">حذف</button>
          </p>`;
      } else if (rule.type === 'store') {
        storeRulesDiv.innerHTML += `
          <p>مفتاح API: ${rule.content.apiKey}
            <button onclick="editStoreRule('${rule._id}', '${rule.content.apiKey}')">تعديل</button>
            <button onclick="deleteRule('${rule._id}')">حذف</button>
          </p>`;
      }
    }
  });
}

function showCreateGlobalRuleForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <h3>إضافة قاعدة ثابتة</h3>
    <form id="createGlobalRuleForm">
      <div>
        <label for="globalRuleContent">القاعدة:</label>
        <textarea id="globalRuleContent" required></textarea>
      </div>
      <button type="submit">إضافة</button>
    </form>
  `;

  document.getElementById('createGlobalRuleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('globalRuleContent').value;

    await createRule('global', content);
  });
}

function showCreateGeneralRuleForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <h3>إضافة قاعدة عامة</h3>
    <form id="createGeneralRuleForm">
      <div>
        <label for="generalRuleContent">القاعدة:</label>
        <textarea id="generalRuleContent" required></textarea>
      </div>
      <button type="submit">إضافة</button>
    </form>
  `;

  document.getElementById('createGeneralRuleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('generalRuleContent').value;

    await createRule('general', content);
  });
}

function showCreateProductRuleForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <h3>إضافة منتج</h3>
    <form id="createProductRuleForm">
      <div>
        <label for="productName">اسم المنتج:</label>
        <input type="text" id="productName" required>
      </div>
      <div>
        <label for="productPrice">السعر:</label>
        <input type="number" id="productPrice" required>
      </div>
      <div>
        <label for="productCurrency">العملة:</label>
        <select id="productCurrency" required>
          <option value="جنيه مصري">جنيه مصري</option>
          <option value="دولار">دولار</option>
        </select>
      </div>
      <button type="submit">إضافة</button>
    </form>
  `;

  document.getElementById('createProductRuleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const product = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const currency = document.getElementById('productCurrency').value;

    await createRule('products', { product, price, currency });
  });
}

function showCreateQARuleForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <h3>إضافة سؤال وجواب</h3>
    <form id="createQARuleForm">
      <div>
        <label for="qaQuestion">السؤال:</label>
        <input type="text" id="qaQuestion" required>
      </div>
      <div>
        <label for="qaAnswer">الإجابة:</label>
        <input type="text" id="qaAnswer" required>
      </div>
      <button type="submit">إضافة</button>
    </form>
  `;

  document.getElementById('createQARuleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const question = document.getElementById('qaQuestion').value;
    const answer = document.getElementById('qaAnswer').value;

    await createRule('qa', { question, answer });
  });
}

function showCreateStoreRuleForm() {
  const formContainer = document.getElementById('formContainer');
  formContainer.innerHTML = `
    <h3>إضافة مفتاح API للمتجر</h3>
    <form id="createStoreRuleForm">
      <div>
        <label for="storeApiKey">مفتاح API:</label>
        <input type="text" id="storeApiKey" required>
      </div>
      <button type="submit">إضافة</button>
    </form>
  `;

  document.getElementById('createStoreRuleForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const apiKey = document.getElementById('storeApiKey').value;

    await createRule('store', { apiKey });
  });
}

async function createRule(type, content) {
  try {
    const res = await fetch('/api/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ botId: selectedBotId, type, content }),
    });

    if (res.ok) {
      document.getElementById('formContainer').innerHTML = '<p>تم إضافة القاعدة بنجاح!</p>';
      fetchRules();
    } else {
      const data = await res.json();
      alert(data.message);
    }
  } catch (err) {
    alert('خطأ في السيرفر');
  }
}

async function editRule(id, type, content) {
  const newContent = prompt('أدخل القاعدة الجديدة:', content);
  if (newContent) {
    try {
      await fetch(`/api/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type, content: newContent }),
      });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}

async function editProductRule(id, product, price, currency) {
  const newProduct = prompt('أدخل اسم المنتج الجديد:', product);
  const newPrice = prompt('أدخل السعر الجديد:', price);
  const newCurrency = prompt('أدخل العملة (جنيه مصري أو دولار):', currency);
  if (newProduct && newPrice && newCurrency) {
    try {
      await fetch(`/api/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type: 'products', content: { product: newProduct, price: newPrice, currency: newCurrency } }),
      });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}

async function editQARule(id, question, answer) {
  const newQuestion = prompt('أدخل السؤال الجديد:', question);
  const newAnswer = prompt('أدخل الإجابة الجديدة:', answer);
  if (newQuestion && newAnswer) {
    try {
      await fetch(`/api/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type: 'qa', content: { question: newQuestion, answer: newAnswer } }),
      });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}

async function editStoreRule(id, apiKey) {
  const newApiKey = prompt('أدخل مفتاح API الجديد:', apiKey);
  if (newApiKey) {
    try {
      await fetch(`/api/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ type: 'store', content: { apiKey: newApiKey } }),
      });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}

async function deleteRule(id) {
  if (confirm('هل أنت متأكد من حذف هذه القاعدة؟')) {
    try {
      await fetch(`/api/rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}
