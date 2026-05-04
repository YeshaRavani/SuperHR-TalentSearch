document.addEventListener('DOMContentLoaded', () => {
  const initialView = document.getElementById('initialView');
  const formView = document.getElementById('formView');
  const usernameField = document.getElementById('username');
  const passwordField = document.getElementById('password');
  const loginBtn = document.getElementById('formLoginBtn');

  document.getElementById('openLoginBtn').addEventListener('click', () => {
    initialView.classList.remove('active');
    initialView.classList.add('hidden');
    setTimeout(() => {
      formView.classList.remove('hidden');
      formView.classList.add('active');
      usernameField?.focus();
    }, 50);
  });

  document.getElementById('backBtn').addEventListener('click', () => {
    formView.classList.remove('active');
    formView.classList.add('hidden');
    setTimeout(() => {
      initialView.classList.remove('hidden');
      initialView.classList.add('active');
    }, 50);
  });

  async function submitLogin() {
    const usernameInput = usernameField.value.trim();
    const passwordInput = passwordField.value;

    if (!usernameInput || !passwordInput) {
      alert('Please enter both username/email and password.');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Authenticating...';

    try {
      await api.login(usernameInput, passwordInput);
      const user = await api.get('/user');
      
      localStorage.setItem('userRole', user.role);
      
      if (user.role === 'admin') {
        window.location.href = 'admin-home.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } catch (err) {
      alert('Login failed: ' + err.message);
      loginBtn.disabled = false;
      loginBtn.innerHTML = 'Login';
    }
  }

  loginBtn.addEventListener('click', submitLogin);

  [usernameField, passwordField].forEach((field) => {
    field.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submitLogin();
      }
    });
  });
});
