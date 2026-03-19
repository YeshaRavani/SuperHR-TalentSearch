document.addEventListener('DOMContentLoaded', () => {
  const initialView = document.getElementById('initialView');
  const formView = document.getElementById('formView');

  document.getElementById('openLoginBtn').addEventListener('click', () => {
    initialView.classList.remove('active');
    initialView.classList.add('hidden');
    setTimeout(() => {
      formView.classList.remove('hidden');
      formView.classList.add('active');
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

  document.getElementById('formLoginBtn').addEventListener('click', function () {
    localStorage.setItem('userRole', 'user');

    this.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Authenticating...';

    setTimeout(() => window.location.href = 'dashboard.html', 800);
  });
});