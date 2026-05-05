document.addEventListener('DOMContentLoaded', async () => {
    const fields = {
        photo: document.getElementById('adminProfilePhoto'),
        editPhoto: document.getElementById('editProfilePhoto'),
        roleBadge: document.getElementById('adminRoleBadge'),
        fullName: document.getElementById('adminFullName'),
        subtitle: document.getElementById('adminSubtitle'),
        bio: document.getElementById('adminBio'),
        email: document.getElementById('adminEmail'),
        actions: document.getElementById('adminActionsSupervised'),
        overviewActions: document.getElementById('adminOverviewActions'),
        overviewUsers: document.getElementById('adminOverviewUsers'),
        overviewPosts: document.getElementById('adminOverviewPosts'),
        overviewHealth: document.getElementById('adminOverviewHealth'),
        editFullName: document.getElementById('adminEditFullName'),
        editId: document.getElementById('adminEditId'),
        editEmail: document.getElementById('adminEditEmail'),
        editDepartment: document.getElementById('adminEditDepartment'),
        editJobTitle: document.getElementById('adminEditJobTitle'),
        editBio: document.getElementById('adminEditBio'),
    };

    const modal = document.getElementById('editProfileModal');
    const openBtn = document.getElementById('openEditModal');
    const closeBtn = document.getElementById('closeEditModal');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const saveBtn = document.getElementById('saveEditBtn');
    const toast = document.getElementById('toastNotif');
    const imageInput = modal?.querySelector('input[type="file"]');

    let currentUser = null;
    let draftPhotoUrl = '';

    function titleCaseRole(role) {
        return (role || 'user')
            .replaceAll('_', ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    function fallbackPhoto(user) {
        if ((user?.role || '').toLowerCase() === 'admin') return 'assets/profilepic.jpg';
        return 'assets/rushilprofile.jpeg';
    }

    function profileSubtitle(user, jobTitle) {
        const title = jobTitle || titleCaseRole(user.role);
        const team = user.department_team || 'Unassigned Team';
        return `${title} • ${team}`;
    }

    function profileBio(user) {
        return `Managing ${user.organisation || 'the platform'} workflows for ${user.department_team || 'the wider team'}. This profile is loaded from the authenticated backend user record.`;
    }

    function renderUser(user) {
        currentUser = user;
        const photoUrl = user.profile_photo_url || fallbackPhoto(user);
        const roleLabel = titleCaseRole(user.role);
        const jobTitle = localStorage.getItem('adminJobTitle') || roleLabel;
        const bio = localStorage.getItem('adminBio') || profileBio(user);

        fields.photo.src = photoUrl;
        fields.editPhoto.src = photoUrl;
        fields.roleBadge.textContent = roleLabel;
        fields.fullName.textContent = user.full_name || user.username;
        fields.subtitle.textContent = profileSubtitle(user, jobTitle);
        fields.bio.textContent = bio;
        fields.email.textContent = user.email || '--';

        fields.editFullName.value = user.full_name || '';
        fields.editId.value = user.id || '';
        fields.editEmail.value = user.email || '';
        fields.editDepartment.value = user.department_team || '';
        fields.editJobTitle.value = jobTitle;
        fields.editBio.value = bio;
    }

    function renderStats(stats) {
        const actions = Number(stats.total_applications || 0) + Number(stats.total_interests || 0);
        fields.actions.textContent = actions.toLocaleString('en-IN');
        fields.overviewActions.textContent = actions.toLocaleString('en-IN');
        fields.overviewUsers.textContent = Number(stats.total_users || 0).toLocaleString('en-IN');
        fields.overviewPosts.textContent = Number(stats.active_opportunities || 0).toLocaleString('en-IN');
        fields.overviewHealth.textContent = `${stats.system_health ?? '--'}%`;
    }

    function openModal() {
        if (!modal) return;
        draftPhotoUrl = currentUser?.profile_photo_url || '';
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (currentUser) renderUser(currentUser);
    }

    function showToast() {
        if (!toast) return;
        toast.style.bottom = '40px';
        window.setTimeout(() => {
            toast.style.bottom = '-100px';
        }, 3000);
    }

    async function saveProfile() {
        if (!currentUser) return;

        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
            const updated = await window.api.put('/user', {
                full_name: fields.editFullName.value.trim(),
                email: fields.editEmail.value.trim(),
                department_team: fields.editDepartment.value.trim(),
                organisation: currentUser.organisation,
                profile_photo_url: draftPhotoUrl || currentUser.profile_photo_url || null,
            });

            localStorage.setItem('adminJobTitle', fields.editJobTitle.value.trim() || titleCaseRole(updated.role));
            localStorage.setItem('adminBio', fields.editBio.value.trim() || profileBio(updated));

            renderUser(updated);
            modal.style.display = 'none';
            document.body.style.overflow = '';
            showToast();
        } catch (err) {
            window.alert(err.message || 'Failed to save profile.');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    }

    const logoutBtn = document.getElementById('logoutBtn');

    openBtn?.addEventListener('click', openModal);
    closeBtn?.addEventListener('click', closeModal);
    cancelBtn?.addEventListener('click', closeModal);
    modal?.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    saveBtn?.addEventListener('click', saveProfile);

    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('userRole');
        window.location.href = 'index (1).html';
    });

    imageInput?.addEventListener('change', (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
            draftPhotoUrl = readerEvent.target.result;
            fields.editPhoto.src = draftPhotoUrl;
        };
        reader.readAsDataURL(file);
    });

    try {
        const user = await window.api.get('/user');
        if ((user.role || '').toLowerCase() !== 'admin') {
            window.location.href = 'dashboard.html';
            return;
        }
        renderUser(user);
    } catch (err) {
        console.error('Failed to load admin profile:', err);
        window.location.href = 'login.html';
        return;
    }

    try {
        const stats = await window.api.get('/admin/dashboard');
        renderStats(stats);
    } catch (err) {
        console.error('Failed to load admin profile stats:', err);
    }
});
