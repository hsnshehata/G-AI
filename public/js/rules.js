// تحميل صفحة القواعد وإعدادها
async function loadRulesPage() {
  const content = document.getElementById('content');
  const role = localStorage.getItem('role');

  // بناء الواجهة الرئيسية
  let html = `
    <h2>إدارة القواعد</h2>
    <div>
      <label for="botSelectRules">اختر بوت:</label>
      <select id="botSelectRules" onchange="selectBot(this.value)"></select>
    </div>
    <div id="formContainer"></div>
  `;

  // إضافة قسم القواعد الثابتة إذا كان المستخدم سوبر أدمن
  if (role === 'superadmin') {
    html += `
      <h3>القواعد الثابتة (للسوبر أدمن)</h3>
      <button onclick="showCreateGlobalRuleForm()">إضافة قاعدة ثابتة</button>
      <div id="globalRules"></div>
    `;
  }

  // إضافة الأقسام الأخرى
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

  // إدراج الواجهة في الصفحة
  content.innerHTML = html;

  // تعبئة قائمة البوتات
  await populateBotSelectRules();

  // اختيار أول بوت تلقائيًا إذا لم يتم تحديد واحد
  const botSelect = document.getElementById('botSelectRules');
  if (!getSelectedBotId() && botSelect.options.length > 0) {
    selectBot(botSelect.options[0].value);
  }

  // جلب القواعد الخاصة بالبوت المحدد
  await fetchRules();
}

// تعبئة قائمة البوتات
async function populateBotSelectRules() {
  const botSelect = document.getElementById('botSelectRules');
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('/api/bots', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bots = await res.json();

    botSelect.innerHTML = '';
    const userBots = role === 'superadmin' ? bots : bots.filter((bot) => bot.userId._id === localStorage.getItem('userId'));

    userBots.forEach((bot) => {
      botSelect.innerHTML += `<option value="${bot._id}">${bot.name}</option>`;
    });
  } catch (err) {
    console.error('Error fetching bots:', err);
  }
}

// جلب القواعد
async function fetchRules() {
  const selectedBotId = getSelectedBotId();
  if (!selectedBotId) {
    console.log('No bot selected');
    return;
  }

  try {
    const res = await fetch(`/api/rules?botId=${selectedBotId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const rules = await res.json();

    // مسح العناصر القديمة
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

    // عرض القواعد الجديدة
    rules.forEach((rule) => {
      const ruleElement = document.createElement('p');

      if (rule.type === 'global' && globalRulesDiv) {
        ruleElement.innerHTML = `${rule.content}
          <button class="edit-rule" data-id="${rule._id}" data-type="global" data-content="${rule.content}">تعديل</button>
          <button class="delete-rule" data-id="${rule._id}">حذف</button>`;
        globalRulesDiv.appendChild(ruleElement);
      } else if (rule.botId && rule.botId.toString() === selectedBotId) {
        if (rule.type === 'general') {
          ruleElement.innerHTML = `${rule.content}
            <button class="edit-rule" data-id="${rule._id}" data-type="general" data-content="${rule.content}">تعديل</button>
            <button class="delete-rule" data-id="${rule._id}">حذف</button>`;
          generalRulesDiv.appendChild(ruleElement);
        } else if (rule.type === 'products') {
          ruleElement.innerHTML = `المنتج: ${rule.content.product}، السعر: ${rule.content.price} ${rule.content.currency}
            <button class="edit-product-rule" data-id="${rule._id}" data-product="${rule.content.product}" data-price="${rule.content.price}" data-currency="${rule.content.currency}">تعديل</button>
            <button class="delete-rule" data-id="${rule._id}">حذف</button>`;
          productRulesDiv.appendChild(ruleElement);
        } else if (rule.type === 'qa') {
          ruleElement.innerHTML = `السؤال: ${rule.content.question}، الإجابة: ${rule.content.answer}
            <button class="edit-qa-rule" data-id="${rule._id}" data-question="${rule.content.question}" data-answer="${rule.content.answer}">تعديل</button>
            <button class="delete-rule" data-id="${rule._id}">حذف</button>`;
          qaRulesDiv.appendChild(ruleElement);
        } else if (rule.type === 'store') {
          ruleElement.innerHTML = `مفتاح API: ${rule.content.apiKey}
            <button class="edit-store-rule" data-id="${rule._id}" data-apikey="${rule.content.apiKey}">تعديل</button>
            <button class="delete-rule" data-id="${rule._id}">حذف</button>`;
          storeRulesDiv.appendChild(ruleElement);
        }
      }
    });

    // إضافة Event Listeners للأزرار
    addEventListeners();
  } catch (err) {
    console.error('Error fetching rules:', err);
  }
}

// إضافة Event Listeners للأزرار
function addEventListeners() {
  document.querySelectorAll('.edit-rule').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const type = button.getAttribute('data-type');
      const content = button.getAttribute('data-content');
      editRule(id, type, content);
    });
  });

  document.querySelectorAll('.edit-product-rule').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const product = button.getAttribute('data-product');
      const price = button.getAttribute('data-price');
      const currency = button.getAttribute('data-currency');
      editProductRule(id, product, price, currency);
    });
  });

  document.querySelectorAll('.edit-qa-rule').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const question = button.getAttribute('data-question');
      const answer = button.getAttribute('data-answer');
      editQARule(id, question, answer);
    });
  });

  document.querySelectorAll('.edit-store-rule').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      const apiKey = button.getAttribute('data-apikey');
      editStoreRule(id, apiKey);
    });
  });

  document.querySelectorAll('.delete-rule').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-id');
      deleteRule(id);
    });
  });
}

// إنشاء قاعدة جديدة
async function createRule(type, content) {
  try {
    const res = await fetch('/api/rules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ botId: getSelectedBotId(), type, content }),
    });

    if (res.ok) {
      document.getElementById('formContainer').innerHTML = '<p>تم إضافة القاعدة بنجاح!</p>';
      await fetchRules();
    } else {
      const data = await res.json();
      alert(data.message || 'حدث خطأ أثناء إضافة القاعدة.');
    }
  } catch (err) {
    alert('خطأ في السيرفر');
  }
}

// تعديل قاعدة
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
      await fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}

// تعديل منتج
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
      await fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}

// تعديل سؤال وجواب
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
      await fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}

// تعديل مفتاح API للمتجر
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
      await fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}

// حذف قاعدة
async function deleteRule(id) {
  if (confirm('هل أنت متأكد من حذف هذه القاعدة؟')) {
    try {
      await fetch(`/api/rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      await fetchRules();
    } catch (err) {
      console.error(err);
    }
  }
}

// اختيار بوت
function selectBot(botId) {
  localStorage.setItem('selectedBotId', botId);
  fetchRules();
}

// الحصول على ID البوت المحدد
function getSelectedBotId() {
  return localStorage.getItem('selectedBotId');
}

// إظهار نموذج إضافة قاعدة ثابتة
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

// إظهار نموذج إضافة قاعدة عامة
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

// إظهار نموذج إضافة منتج
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

// إظهار نموذج إضافة سؤال وجواب
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

// إظهار نموذج إضافة مفتاح API للمتجر
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
