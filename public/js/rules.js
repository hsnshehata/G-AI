function initRules() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login.html';
    return;
  }

  const botId = localStorage.getItem('currentBotId'); // جلب botId من localStorage
  if (!botId) {
    alert('Bot ID is missing. Please select a bot first.');
    window.location.href = '/'; // Redirect للصفحة الرئيسية بدل /dashboard.html
    return;
  }

  const rulesForm = document.getElementById('rules-form');
  const rulesInput = document.getElementById('rules-input');
  const faqForm = document.getElementById('faq-form');
  const faqQuestionInput = document.getElementById('faq-question');
  const faqAnswerInput = document.getElementById('faq-answer');
  const faqList = document.getElementById('faq-list');
  const productForm = document.getElementById('product-form');
  const productNameInput = document.getElementById('product-name');
  const productPriceInput = document.getElementById('product-price');
  const productList = document.getElementById('product-list');
  const storeLinkForm = document.getElementById('store-link-form');
  const storeLinkInput = document.getElementById('store-link-input');
  const storeLinkDisplay = document.getElementById('store-link-display');

  // جلب القواعد
  const fetchRules = async () => {
    try {
      const response = await fetch(`/rules?botId=${botId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rules = await response.json();
      if (response.ok) {
        rulesInput.value = rules.rules || '';
      } else {
        console.error('خطأ في جلب القواعد:', rules.error);
      }
    } catch (err) {
      console.error('خطأ في جلب القواعد:', err);
    }
  };

  // جلب الأسئلة والأجوبة
  const fetchFaqs = async () => {
    try {
      const response = await fetch(`/faq?botId=${botId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const faqs = await response.json();
      if (response.ok) {
        faqList.innerHTML = ''; // تفريغ القايمة قبل الإضافة
        faqs.forEach(faq => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${faq.question}</strong>: ${faq.answer}`;
          
          // إضافة زرار الحذف
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'حذف';
          deleteBtn.className = 'btn btn-danger btn-sm ms-2'; // استايل زي أزرار الصفحة
          deleteBtn.onclick = () => deleteFaq(faq._id);
          li.appendChild(deleteBtn);
          
          faqList.appendChild(li);
        });
      } else {
        console.error('خطأ في جلب الأسئلة والأجوبة:', faqs.error);
      }
    } catch (err) {
      console.error('خطأ في جلب الأسئلة والأجوبة:', err);
    }
  };

  // جلب المنتجات
  const fetchProducts = async () => {
    try {
      const response = await fetch(`/products?botId=${botId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const products = await response.json();
      if (response.ok) {
        productList.innerHTML = ''; // تفريغ القايمة قبل الإضافة
        products.forEach(product => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${product.name}</strong>: ${product.price} جنيه`;
          
          // إضافة زرار الحذف
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'حذف';
          deleteBtn.className = 'btn btn-danger btn-sm ms-2'; // استايل زي أزرار الصفحة
          deleteBtn.onclick = () => deleteProduct(product._id);
          li.appendChild(deleteBtn);
          
          productList.appendChild(li);
        });
      } else {
        console.error('خطأ في جلب المنتجات:', products.error);
      }
    } catch (err) {
      console.error('خطأ في جلب المنتجات:', err);
    }
  };

  // جلب ربط المتجر
  const fetchStoreLink = async () => {
    try {
      const response = await fetch(`/store-link?botId=${botId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const storeLink = await response.json();
      if (response.ok) {
        storeLinkDisplay.innerHTML = ''; // تفريغ العرض قبل الإضافة
        if (storeLink) {
          const div = document.createElement('div');
          div.innerHTML = `مفتاح API: ${storeLink.apiKey}`;
          
          // إضافة زرار الحذف
          const deleteBtn = document.createElement('button');
          deleteBtn.textContent = 'حذف';
          deleteBtn.className = 'btn btn-danger btn-sm ms-2'; // استايل زي أزرار الصفحة
          deleteBtn.onclick = () => deleteStoreLink(storeLink._id);
          div.appendChild(deleteBtn);
          
          storeLinkDisplay.appendChild(div);
        }
      } else {
        console.error('خطأ في جلب ربط المتجر:', storeLink.error);
      }
    } catch (err) {
      console.error('خطأ في جلب ربط المتجر:', err);
    }
  };

  // حذف سؤال وإجابة
  const deleteFaq = async (faqId) => {
    try {
      const response = await fetch(`/faq/${faqId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        alert('تم حذف السؤال والإجابة بنجاح!');
        fetchFaqs(); // إعادة جلب الأسئلة والأجوبة بعد الحذف
      } else {
        alert('خطأ في حذف السؤال والإجابة: ' + result.error);
      }
    } catch (err) {
      console.error('خطأ في حذف السؤال والإجابة:', err);
      alert('خطأ في السيرفر');
    }
  };

  // حذف منتج
  const deleteProduct = async (productId) => {
    try {
      const response = await fetch(`/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        alert('تم حذف المنتج بنجاح!');
        fetchProducts(); // إعادة جلب المنتجات بعد الحذف
      } else {
        alert('خطأ في حذف المنتج: ' + result.error);
      }
    } catch (err) {
      console.error('خطأ في حذف المنتج:', err);
      alert('خطأ في السيرفر');
    }
  };

  // حذف ربط المتجر
  const deleteStoreLink = async (storeLinkId) => {
    try {
      const response = await fetch(`/store-link/${storeLinkId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      if (response.ok) {
        alert('تم حذف ربط المتجر بنجاح!');
        fetchStoreLink(); // إعادة جلب ربط المتجر بعد الحذف
      } else {
        alert('خطأ في حذف ربط المتجر: ' + result.error);
      }
    } catch (err) {
      console.error('خطأ في حذف ربط المتجر:', err);
      alert('خطأ في السيرفر');
    }
  };

  // حفظ القواعد
  rulesForm.addEventListener('submit', async e => {
    e.preventDefault();
    const rules = rulesInput.value;
    try {
      const response = await fetch(`/rules?botId=${botId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rules }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('تم حفظ القواعد بنجاح!');
        // إعادة جلب البيانات بعد حفظ القواعد
        fetchRules();
        fetchFaqs();
        fetchProducts();
        fetchStoreLink();
      } else {
        alert('خطأ في حفظ القواعد: ' + result.error);
      }
    } catch (err) {
      console.error('خطأ في حفظ القواعد:', err);
      alert('خطأ في السيرفر');
    }
  });

  // حفظ سؤال وإجابة
  faqForm.addEventListener('submit', async e => {
    e.preventDefault();
    const question = faqQuestionInput.value;
    const answer = faqAnswerInput.value;
    try {
      const response = await fetch(`/faq?botId=${botId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question, answer }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('تم حفظ السؤال والإجابة بنجاح!');
        faqQuestionInput.value = '';
        faqAnswerInput.value = '';
        fetchFaqs();
      } else {
        alert('خطأ في حفظ السؤال والإجابة: ' + result.error);
      }
    } catch (err) {
      console.error('خطأ في حفظ السؤال والإجابة:', err);
      alert('خطأ في السيرفر');
    }
  });

  // حفظ منتج
  productForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = productNameInput.value;
    const price = parseFloat(productPriceInput.value);
    try {
      const response = await fetch(`/products?botId=${botId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, price }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('تم حفظ المنتج بنجاح!');
        productNameInput.value = '';
        productPriceInput.value = '';
        fetchProducts();
      } else {
        alert('خطأ في حفظ المنتج: ' + result.error);
      }
    } catch (err) {
      console.error('خطأ في حفظ المنتج:', err);
      alert('خطأ في السيرفر');
    }
  });

  // حفظ ربط المتجر
  storeLinkForm.addEventListener('submit', async e => {
    e.preventDefault();
    const apiKey = storeLinkInput.value;
    try {
      const response = await fetch(`/store-link?botId=${botId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey }),
      });
      const result = await response.json();
      if (response.ok) {
        alert('تم ربط المتجر بنجاح!');
        storeLinkInput.value = '';
        fetchStoreLink();
      } else {
        alert('خطأ في ربط المتجر: ' + result.error);
      }
    } catch (err) {
      console.error('خطأ في ربط المتجر:', err);
      alert('خطأ في السيرفر');
    }
  });

  // جلب البيانات عند تحميل الصفحة
  fetchRules();
  fetchFaqs();
  fetchProducts();
  fetchStoreLink();
}

  }
});
