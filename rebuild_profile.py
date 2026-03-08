import re

def process_profile(filepath, templatesrc):
    # Fetch exactly the correct header from admin-home
    with open(templatesrc, 'r', encoding='utf-8') as f:
        master_content = f.read()
    
    header_match = re.search(r'(<header class="topbar" id="navbar">.*?</header>)', master_content, re.DOTALL)
    if not header_match:
        print("Header not found in templatesrc")
        return
    admin_header = header_match.group(1)
    
    # Switch the "active" nav class for admin-user-profile? Actually, no link in the nav points to Profile. They just point to Home, Manage Users, Manage Opps, System Settings. 
    # Just remove "active" from Home.
    admin_header = admin_header.replace('<a href="admin-home.html" class="active">Home</a>', '<a href="admin-home.html">Home</a>')

    with open(filepath, 'r', encoding='utf-8') as f:
        prof_html = f.read()
        
    # Overwrite header
    prof_html = re.sub(r'<header class="topbar" id="navbar">.*?</header>', admin_header, prof_html, flags=re.DOTALL)
    
    # Process Permission matrix removal and adjust layout
    # The grid is: <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px;">
    # It has a left column with Admin Bio and Permission Matrix, and a Right Column with Governance Metric and Contact Info.
    # If we remove Permission Matrix, the left column is just Admin Bio.
    
    matrix_pattern = r'<div style="background: var\(--white\); border-radius: var\(--radius-lg\); padding: 30px; box-shadow: var\(--shadow-sm\); border: 1px solid rgba\(15, 31, 43, 0\.05\);">\s*<h3.*?Permission Matrix.*?</ul>\s*</div>'
    
    prof_html = re.sub(matrix_pattern, '', prof_html, flags=re.DOTALL)
    
    # Remove old notification specific js hooks inside <script>
    notif_js_pattern = r'// notification dropdown behaviour.*?(?=\s*// Navbar Scroll)'
    prof_html = re.sub(notif_js_pattern, '', prof_html, flags=re.DOTALL)
    
    # inject the standard markallread js at end
    js_logic = """
<script>
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
</script>
"""
    prof_html = prof_html.replace('</body>', f'{js_logic}</body>')
    
    # Also we need to inject the Edit Profile behaviour. We'll add a modal to the bottom of the body.
    modal_html = """
    <!-- Edit Profile Modal -->
    <div id="editProfileModal" style="display: none; position: fixed; inset: 0; background: rgba(15, 31, 43, 0.4); backdrop-filter: blur(4px); z-index: 100; align-items: center; justify-content: center; padding: 20px;">
        <div style="background: var(--white); width: 100%; max-width: 600px; border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); overflow: hidden; display: flex; flex-direction: column; max-height: 90vh;">
            <div style="padding: 24px 32px; border-bottom: 1px solid var(--sky-50); display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; background: var(--white); z-index: 10;">
                <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--ink-900);">Edit Admin Profile</h2>
                <button id="closeEditModal" style="background: none; border: none; cursor: pointer; color: var(--ink-400); padding: 8px; border-radius: 50%; display: grid; place-items: center; transition: all 0.2s;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            
            <div class="form" style="padding: 32px; overflow-y: auto;">
                <div class="form-group" style="align-items: center; margin-bottom: 16px;">
                    <div style="position: relative; width: 100px; height: 100px; border-radius: 50%; background: var(--sky-100); overflow: hidden; margin-bottom: 12px; border: 3px solid var(--white); box-shadow: var(--shadow-sm);">
                        <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300" alt="Current Photo" style="width: 100%; height: 100%; object-fit: cover;">
                        <label style="position: absolute; inset: 0; background: rgba(15,31,43,0.5); display: flex; align-items: center; justify-content: center; color: white; opacity: 0; cursor: pointer; transition: opacity 0.2s;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <input type="file" style="display: none;" accept="image/*">
                        </label>
                    </div>
                    <span style="font-size: 0.85rem; color: var(--sky-600); font-weight: 600; cursor: pointer;">Change Photo</span>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="text-input" value="Sarah Jenkins">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Admin ID</label>
                        <input type="text" class="text-input" value="ADM-88021" disabled style="background:var(--sky-50); cursor:not-allowed;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" class="text-input" value="sarah.jenkins@company.com">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone</label>
                        <input type="tel" class="text-input" value="+1 (555) 123-4567">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div class="form-group">
                        <label class="form-label">Department</label>
                        <input type="text" class="text-input" value="Core Operations">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Job Title</label>
                        <input type="text" class="text-input" value="Platform Governance Lead">
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 10px;">
                    <label class="form-label">Admin Bio</label>
                    <textarea class="text-input" style="min-height: 80px;">Leading the platform governance initiatives to ensure a safe, collaborative, and highly effective environment for all teams. Focused on optimizing user experiences, streamlining approval workflows, and maintaining data integrity across departments.</textarea>
                </div>
            </div>
            
            <div style="padding: 24px 32px; border-top: 1px solid var(--sky-50); display: flex; justify-content: flex-end; gap: 16px; background: var(--white); position: sticky; bottom: 0; z-index: 10;">
                <button id="cancelEditBtn" class="btn" style="background: var(--white); border: 1px solid var(--ink-200); color: var(--ink-700);">Cancel</button>
                <button id="saveEditBtn" class="btn btn-sky">Save Changes</button>
            </div>
        </div>
    </div>
    
    <!-- Toast Notification -->
    <div id="toastNotif" style="position: fixed; bottom: -100px; left: 50%; transform: translateX(-50%); background: var(--ink-900); color: white; padding: 14px 28px; border-radius: 999px; box-shadow: 0 10px 40px rgba(15,31,43,0.2); font-weight: 600; font-size: 0.95rem; z-index: 200; transition: bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); display: flex; align-items: center; gap: 10px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
        Profile updated successfully
    </div>
    
    <script>
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
    </script>
"""
    prof_html = prof_html.replace('</body>', f'{modal_html}</body>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(prof_html)

process_profile('/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-user-profile.html', '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-home.html')
