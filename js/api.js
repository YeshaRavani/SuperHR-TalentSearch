const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('access_token');
        const isFormData = options.body instanceof FormData;
        
        const headers = {
            ...options.headers,
        };

        if (!isFormData) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            if (response.status === 401 && endpoint !== '/login' && endpoint !== '/signup') {
                localStorage.removeItem('access_token');
                localStorage.removeItem('userRole');
                
                const isPublicAppPage = window.location.pathname.includes('opportunities.html') 
                    || window.location.pathname.includes('python.html')
                    || window.location.pathname.includes('interested.html')
                    || window.location.pathname.includes('home.html')
                    || window.location.pathname.includes('aboutus.html')
                    || window.location.pathname.includes('initiatives.html')
                    || window.location.pathname.includes('workshops.html')
                    || window.location.pathname.includes('login.html')
                    || window.location.pathname.includes('signup.html')
                    || window.location.pathname.endsWith('/')
                    || window.location.pathname.includes('index');

                if (!isPublicAppPage) {
                    window.location.href = 'login.html';
                }
                throw new Error("Your session has expired. Please log in again.");
            }
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            const errDetail = error.detail;
            const errMsg = typeof errDetail === 'string' ? errDetail : JSON.stringify(errDetail);
            throw new Error(errMsg || response.statusText);
        }

        return response.json();
    },

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    async post(endpoint, data) {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        return this.request(endpoint, {
            method: 'POST',
            body: body,
        });
    },

    async put(endpoint, data) {
        const body = data instanceof FormData ? data : JSON.stringify(data);
        return this.request(endpoint, {
            method: 'PUT',
            body: body,
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    async login(username, password) {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Login failed' }));
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        return data;
    },

    logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('userRole');
        window.location.href = 'login.html';
    }
};

window.api = api;
