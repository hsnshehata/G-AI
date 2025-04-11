document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error');

      // التأكد من إن البيانات موجودة
      if (!username || !password) {
        errorEl.textContent = 'يرجى إدخال اسم المستخدم وكلمة المرور';
        console.log('❌ Missing username or password');
        return;
      }

      try {
        console.log('📤 Sending login request:', { username, password });
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        console.log('📥 Login response:', data);

        if (res.ok) {
          // تخزين البيانات في localStorage
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', data.role);
          localStorage.setItem('userId', data.userId);
          localStorage.setItem('username', data.username); // إضافة تخزين الـ username
          console.log('✅ Login successful, stored in localStorage:', {
            token: data.token,
            role: data.role,
            userId: data.userId,
            username: data.username,
          });

          window.location.href = '/dashboard#bots'; // توجيه مباشر لصفحة البوتات
        } else {
          errorEl.textContent = data.message || 'فشل تسجيل الدخول';
          console.log('❌ Login failed:', data.message);
        }
      } catch (err) {
        errorEl.textContent = 'خطأ في السيرفر';
        console.error('❌ Server error during login:', err);
      }
    });
  }
});
