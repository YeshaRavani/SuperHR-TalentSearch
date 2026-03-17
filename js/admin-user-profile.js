(function () {
            

            // Navbar Scroll
            const navbar = document.getElementById('navbar');
            const scrollProgress = document.getElementById('scrollProgress');
            window.addEventListener('scroll', () => {
                if (window.scrollY > 20 && navbar) {
                    navbar.classList.add('scrolled');
                } else if (navbar) {
                    navbar.classList.remove('scrolled');
                }
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (height > 0) ? (winScroll / height) * 100 : 0;
                if (scrollProgress) scrollProgress.style.width = scrolled + "%";
            });
        })();

document.addEventListener('DOMContentLoaded', function () {
            const role = localStorage.getItem('userRole');
            if (role === 'employee') {
                // Hide 'Posted Opportunities' in navbar or anywhere
                document.querySelectorAll('a[href="posted-opportunities.html"]').forEach(el => el.style.display = 'none');

                // Hide any explicitly named 'Post Opportunity' buttons/links connecting to add-opportunity.html
                document.querySelectorAll('a[href="add-opportunity.html"]').forEach(el => el.style.display = 'none');

                // Hide dynamically labeled matching interface elements
                document.querySelectorAll('button, .btn').forEach(btn => {
                    if (btn.textContent.includes('Post Opportunity')) {
                        btn.style.display = 'none';
                    }
                });
            }
        });

document.addEventListener('DOMContentLoaded', () => {
        const markBtn = document.getElementById('markAllReadBtn');
        const badge = document.getElementById('notifBadge');
        if (markBtn && badge) {
            markBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                badge.style.display = 'none';
                document.querySelectorAll('.notif-item').forEach(item => {
                    item.style.opacity = '0.6';
                });
            });
        }
    });

document.addEventListener('DOMContentLoaded', () => {
            const editBtn = document.querySelector('button.btn-sky'); // Assuming the edit button is this
            const modal = document.getElementById('editProfileModal');
            const closeBtn = document.getElementById('closeEditModal');
            const cancelBtn = document.getElementById('cancelEditBtn');
            const saveBtn = document.getElementById('saveEditBtn');
            const toast = document.getElementById('toastNotif');
            
            if(editBtn && editBtn.innerText.includes('Edit Profile')) {
                editBtn.addEventListener('click', () => {
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden'; // stop background scroll
                });
            }
            
            const closeModal = () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            };
            
            closeBtn.addEventListener('click', closeModal);
            cancelBtn.addEventListener('click', closeModal);
            
            // Close on click outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
            
            saveBtn.addEventListener('click', () => {
                const originalText = saveBtn.innerText;
                saveBtn.innerText = 'Saving...';
                
                setTimeout(() => {
                    closeModal();
                    saveBtn.innerText = originalText;
                    
                    // Show Toast
                    toast.style.bottom = '40px';
                    setTimeout(() => {
                        toast.style.bottom = '-100px';
                    }, 3000);
                    
                }, 600);
            });
        });