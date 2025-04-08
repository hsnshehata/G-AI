export function initRules() {
  const content = document.getElementById('main-content');
  const userRole = localStorage.getItem("role"); // جلب الـ role من localStorage
  const token = localStorage.getItem("token"); // جلب التوكن من localStorage
  const botId = localStorage.getItem("currentBotId"); // جلب معرف البوت المختار

  // تحديد إذا كان الزر والتبويب بتاع "قواعد عامة" هيظهر ولا لأ
  const isSuperAdmin = userRole === "admin";
  const generalRulesButton = isSuperAdmin
    ? '<button class="tab-button" id="generalRulesBtn">قواعد عامة (للسوبر أدمن)</button>'
    : '';
  const generalRulesTab = isSuperAdmin
    ? `
      <div id="generalRulesTab" class="tab-section" style="display:none;">
        <h3>قواعد عامة</h3>
        <textarea id="generalRulesText" class="create-bot-form input" placeholder="أدخل القواعد العامة هنا..." rows="4" required></textarea>
        <button id="saveGeneralRulesBtn" class="action-button">حفظ القواعد العامة</button>
      </div>
    `
    : '';

  // بناء الـ HTML بناءً على الـ role
  content.innerHTML = `
    <section class="card">
      <h2>إدارة القواعد</h2>
      <div class="top-tabs">
        ${generalRulesButton}
        <button class="tab-button" id="botSpecificRulesBtn">قواعد خاصة بهذا البوت</button>
        <button class="tab-button" id="faqRulesBtn">أسئلة وأجوبة</button>
        <button class="tab-button" id="productRulesBtn">منتجات وأسعار</button>
        <button class="tab-button" id="storeLinkBtn">ربط المتجر</button>
      </div>
      
      ${generalRulesTab}
      <div id="botSpecificRulesTab" class="tab-section" style="display:none;">
        <h3>قواعد خاصة بالبوت</h3>
        <textarea id="botSpecificRulesText" class="create-bot-form input" placeholder="أدخل القواعد الخاصة بالبوت هنا..." rows="4" required></textarea>
        <button id="saveBotSpecificRulesBtn" class="action-button">حفظ القواعد الخاصة بالبوت</button>
      </div>

      <div id="faqRulesTab" class="tab-section" style="display:none;">
        <h3>أسئلة وأجوبة</h3>
        <input type="text" id="faqQuestion" class="create-bot-form input" placeholder="أدخل السؤال هنا..." required />
        <input type="text" id="faqAnswer" class="create-bot-form input" placeholder="أدخل الإجابة هنا..." required />
        <button id="saveFaqRulesBtn" class="action-button">حفظ الأسئلة والأجوبة</button>
        <div id="faqList"></div>
      </div>

      <div id="productRulesTab" class="tab-section" style="display:none;">
        <h3>منتجات وأسعار</h3>
        <input type="text" id="productName" class="create-bot-form input" placeholder="اسم المنتج" required />
        <input type="number" id="productPrice" class="create-bot-form input" placeholder="السعر" required />
        <button id="saveProductBtn" class="action-button">حفظ المنتج والسعر</button>
        <div id="productList"></div>
      </div>

      <div id="storeLinkTab" class="tab-section" style="display:none;">
        <h3>ربط المتجر</h3>
        <input type="text" id="storeApiKey" class="create-bot-form input" placeholder="مفتاح API للمتجر" required />
        <button id="saveStoreLinkBtn" class="action-button">حفظ ربط المتجر</button>
        <div id="storeLinkInfo"></div>
      </div>
    </section>
  `;

  // جلب القواعد المحفوظة وعرضها
  loadRules(token, botId, isSuperAdmin);

  // أزرار التبديل بين التبويبات
  if (isSuperAdmin) {
    document.getElementById("generalRulesBtn").addEventListener("click", () => toggleTab('generalRules'));
  }
  document.getElementById("botSpecificRulesBtn").addEventListener("click", () => toggleTab('botSpecificRules'));
  document.getElementById("faqRulesBtn").addEventListener("click", () => toggleTab('faqRules'));
  document.getElementById("productRulesBtn").addEventListener("click", () => toggleTab('productRules'));
  document.getElementById("storeLinkBtn").addEventListener("click", () => toggleTab('storeLink'));

  // دالة لتبديل التبويبات
  function toggleTab(tabName) {
    const tabs = isSuperAdmin
      ? ['generalRules', 'botSpecificRules', 'faqRules', 'productRules', 'storeLink']
      : ['botSpecificRules', 'faqRules', 'productRules', 'storeLink'];
    tabs.forEach(tab => {
      const tabElement = document.getElementById(tab + 'Tab');
      if (tabElement) {
        tabElement.style.display = tab === tabName ? 'block' : 'none';
      }
    });

    // تحديث حالة الأزرار
    const tabButtons = document.querySelectorAll(".tab-button");
    tabButtons.forEach(button => {
      button.classList.remove("active");
      if (button.id === `${tabName}Btn`) {
        button.classList.add("active");
      }
    });
  }

  // حفظ القواعد العامة (للسوبر أدمن فقط)
  if (isSuperAdmin) {
    document.getElementById("saveGeneralRulesBtn").addEventListener("click", async () => {
      const text = document.getElementById('generalRulesText').value;
      await saveRule(text, 'general', botId, token);
      loadRules(token, botId, isSuperAdmin); // إعادة تحميل القواعد بعد الحفظ
    });
  }

  // حفظ القواعد الخاصة بالبوت
  document.getElementById("saveBotSpecificRulesBtn").addEventListener("click", async () => {
    const text = document.getElementById('botSpecificRulesText').value;
    await saveRule(text, 'bot', botId, token);
    loadRules(token, botId, isSuperAdmin); // إعادة تحميل القواعد بعد الحفظ
  });

  // حفظ الأسئلة والأجوبة
  document.getElementById("saveFaqRulesBtn").addEventListener("click", async () => {
    const question = document.getElementById('faqQuestion').value;
    const answer = document.getElementById('faqAnswer').value;
    await saveFaq(question, answer, token);
    loadFaqs(token); // إعادة تحميل الأسئلة والأجوبة بعد الحفظ
  });

  // حفظ المنتجات والأسعار
  document.getElementById("saveProductBtn").addEventListener("click", async () => {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    await saveProduct(name, price, token);
    loadProducts(token); // إعادة تحميل المنتجات بعد الحفظ
  });

  // ربط المتجر
  document.getElementById("saveStoreLinkBtn").addEventListener("click", async () => {
    const apiKey = document.getElementById('storeApiKey').value;
    await linkStore(apiKey, token);
    loadStoreLink(token); // إعادة تحميل ربط المتجر بعد الحفظ
  });

  // دالة لجلب القواعد المحفوظة وعرضها
  async function loadRules(token, botId, isSuperAdmin) {
    try {
      const response = await fetch(`/rules?botId=${botId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const rules = await response.json();
      if (response.ok) {
        // عرض القواعد الخاصة بالبوت
        const botRule = rules.find(rule => rule.type === 'bot' && rule.botId === botId);
        if (botRule) {
          document.getElementById('botSpecificRulesText').value = botRule.text || '';
        }

        // عرض القواعد العامة (للسوبر أدمن فقط)
        if (isSuperAdmin) {
          const generalRule = rules.find(rule => rule.type === 'general');
          if (generalRule) {
            document.getElementById('generalRulesText').value = generalRule.text || '';
          }
        }
      } else {
        console.error('خطأ في جلب القواعد:', rules);
      }
    } catch (error) {
      console.error('حدث خطأ أثناء جلب القواعد:', error);
    }
  }

  // دالة لحفظ القاعدة
  async function saveRule(text, type, botId, token) {
    try {
      const response = await fetch('/rules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text, type, botId }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('قاعدة تم حفظها:', result);
        alert('تم حفظ القاعدة بنجاح!');
      } else {
        console.error('خطأ في حفظ القاعدة:', result);
        alert('فشل في حفظ القاعدة: ' + (result.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ القاعدة:', error);
      alert('حدث خطأ أثناء حفظ القاعدة');
    }
  }

  // دالة لحفظ الأسئلة والأجوبة
  async function saveFaq(question, answer, token) {
    try {
      const response = await fetch('/faq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ question, answer }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('تم حفظ السؤال والإجابة:', result);
        alert('تم حفظ السؤال والإجابة بنجاح!');
      } else {
        console.error('خطأ في حفظ السؤال والإجابة:', result);
        alert('فشل في حفظ السؤال والإجابة: ' + (result.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ السؤال والإجابة:', error);
      alert('حدث خطأ أثناء حفظ السؤال والإجابة');
    }
  }

  // دالة لجلب الأسئلة والأجوبة وعرضها
  async function loadFaqs(token) {
    try {
      const response = await fetch('/faq', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const faqs = await response.json();
      if (response.ok) {
        const faqList = document.getElementById('faqList');
        faqList.innerHTML = faqs.map(faq => `
          <div class="faq-item">
            <p><strong>سؤال:</strong> ${faq.question}</p>
            <p><strong>إجابة:</strong> ${faq.answer}</p>
          </div>
        `).join('');
      } else {
        console.error('خطأ في جلب الأسئلة والأجوبة:', faqs);
      }
    } catch (error) {
      console.error('حدث خطأ أثناء جلب الأسئلة والأجوبة:', error);
    }
  }

  // دالة لحفظ المنتجات
  async function saveProduct(name, price, token) {
    try {
      const response = await fetch('/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('منتج تم حفظه:', result);
        alert('تم حفظ المنتج بنجاح!');
      } else {
        console.error('خطأ في حفظ المنتج:', result);
        alert('فشل في حفظ المنتج: ' + (result.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('حدث خطأ أثناء حفظ المنتج:', error);
      alert('حدث خطأ أثناء حفظ المنتج');
    }
  }

  // دالة لجلب المنتجات وعرضها
  async function loadProducts(token) {
    try {
      const response = await fetch('/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const products = await response.json();
      if (response.ok) {
        const productList = document.getElementById('productList');
        productList.innerHTML = products.map(product => `
          <div class="product-item">
            <p><strong>المنتج:</strong> ${product.name}</p>
            <p><strong>السعر:</strong> ${product.price}</p>
          </div>
        `).join('');
      } else {
        console.error('خطأ في جلب المنتجات:', products);
      }
    } catch (error) {
      console.error('حدث خطأ أثناء جلب المنتجات:', error);
    }
  }

  // دالة لربط المتجر
  async function linkStore(apiKey, token) {
    try {
      const response = await fetch('/store-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('تم ربط المتجر:', result);
        alert('تم ربط المتجر بنجاح!');
      } else {
        console.error('خطأ في ربط المتجر:', result);
        alert('فشل في ربط المتجر: ' + (result.error || 'خطأ غير معروف'));
      }
    } catch (error) {
      console.error('حدث خطأ أثناء ربط المتجر:', error);
      alert('حدث خطأ أثناء ربط المتجر');
    }
  }

  // دالة لجلب ربط المتجر وعرضه
  async function loadStoreLink(token) {
    try {
      const response = await fetch('/store-link', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const storeLink = await response.json();
      if (response.ok && storeLink.apiKey) {
        const storeLinkInfo = document.getElementById('storeLinkInfo');
        storeLinkInfo.innerHTML = `
          <p><strong>مفتاح API للمتجر:</strong> ${storeLink.apiKey}</p>
        `;
      } else {
        console.error('خطأ في جلب ربط المتجر:', storeLink);
      }
    } catch (error) {
      console.error('حدث خطأ أثناء جلب ربط المتجر:', error);
    }
  }

  // تعيين التبويب الافتراضي عند التحميل
  toggleTab('botSpecificRules'); // تبويب افتراضي لكل المستخدمين
}
