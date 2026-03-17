import re

def main():
    with open('opportunities.html', 'r', encoding='utf-8') as f:
        opps_content = f.read()

    with open('admin-manage-opportunities.html', 'r', encoding='utf-8') as f:
        admin_content = f.read()

    # Extract styling and main container structure from opportunities.html
    style_match = re.search(r'<style>([\s\S]*?)</style>', opps_content)
    if style_match:
        styles = style_match.group(0)
    else:
        styles = ""

    # Fix specific overlapping styles if needed, but injecting styles is fine.
    
    # We want to replace the `main` tag in admin-manage-opportunities.html 
    # with the one from opportunities.html, but modified.
    
    new_main = """    <main class="page" id="top" style="max-width: 1200px; margin: 0 auto; padding: 120px 24px 60px;">
      <section class="page-head reveal" style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 32px; padding: 48px; box-shadow: 0 10px 30px rgba(15,31,43,0.08); margin-bottom: 40px; position: relative; overflow: hidden;">
        <h1 style="font-size: clamp(2.5rem, 4vw, 3.5rem); font-weight: 800; margin-bottom: 16px; color: var(--ink-900);">Manage Opportunities</h1>
        <p class="head-subtext" style="font-size: 1.15rem; color: var(--ink-500); max-width: 600px;">Review and remove platform opportunities.</p>
      </section>

      <div class="filters reveal" style="display: flex; gap: 12px; margin-bottom: 40px; flex-wrap: wrap;">
        <button class="filter-btn active" data-filter="all" style="padding: 8px 16px; border-radius: 999px; background: var(--sky-50); color: var(--sky-600); border: 1px solid var(--sky-200); font-weight: 600; cursor: pointer;">All</button>
        <button class="filter-btn" data-filter="event" style="padding: 8px 16px; border-radius: 999px; background: var(--white); color: var(--ink-700); border: 1px solid rgba(15,31,43,0.1); font-weight: 600; cursor: pointer;">Events</button>
        <button class="filter-btn" data-filter="initiative" style="padding: 8px 16px; border-radius: 999px; background: var(--white); color: var(--ink-700); border: 1px solid rgba(15,31,43,0.1); font-weight: 600; cursor: pointer;">Initiatives</button>
        <button class="filter-btn" data-filter="workshop" style="padding: 8px 16px; border-radius: 999px; background: var(--white); color: var(--ink-700); border: 1px solid rgba(15,31,43,0.1); font-weight: 600; cursor: pointer;">Workshops</button>
      </div>

      <div id="opportunities-master-container">
        <!-- Rendered via JS -->
      </div>
      
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const container = document.getElementById('opportunities-master-container');
          const filterBtns = document.querySelectorAll('.filter-btn');

          function renderAdminCard(opp, indexDelay = 0) {
            const delayStyle = indexDelay > 0 ? `transition-delay: ${indexDelay * 0.1}s;` : '';
            return `
                <article class="initiative-card reveal active" style="background: var(--white); border-radius: 24px; overflow: hidden; box-shadow: 0 4px 12px rgba(15,31,43,0.05); border: 1px solid rgba(15,31,43,0.05); display: flex; flex-direction: column; ${delayStyle}">
                    <div class="card-image" style="height: 180px; background: ${opp.bgGradient}; position: relative; overflow: hidden;">
                        <div style="position: absolute; width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,0.5); top: 20px; right: -20px;"></div>
                        <div style="position: absolute; width: 180px; height: 180px; border-radius: 50%; background: rgba(158,202,225,0.3); bottom: -60px; left: -40px;"></div>
                        <div class="card-icon-overlay" style="color: ${opp.iconColor}; position: absolute; z-index: 10; top: 20px; left: 24px; background: rgba(255,255,255,0.8); padding: 12px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                ${opp.mainIcon}
                            </svg>
                        </div>
                    </div>
                    <div class="card-content" style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
                        <h3 style="margin: 0 0 12px; font-size: 1.25rem; font-weight: 700;">${opp.title}</h3>
                        <p style="margin: 0 0 20px; color: var(--ink-500); line-height: 1.6; flex-grow: 1; font-size: 0.95rem;">${opp.description}</p>
                        <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom: 20px;">
                            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: var(--sky-50); color: var(--sky-600); font-size: 0.85rem; font-weight: 600; border: 1px solid var(--sky-100);">
                                ${opp.dateStr}
                            </span>
                            <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; background: var(--white); color: var(--ink-700); font-size: 0.85rem; font-weight: 600; border: 1px solid var(--sky-200);">
                                ${opp.category}
                            </span>
                        </div>
                        <div style="border-top: 1px solid rgba(15,31,43,0.05); padding-top: 16px;">
                           <button onclick="this.closest('article').remove();" class="btn" style="width: 100%; height: 40px; border-radius: 999px; font-weight: 600; cursor: pointer; border: 1px solid #fca5a5; background: #fee2e2; color: #ef4444; transition: 0.3s;">Remove Opportunity</button>
                        </div>
                    </div>
                </article>
            `;
          }

          function renderAll(filter = 'all') {
            if (!container || !window.superHrOpportunities) return;
            let html = '';
            const categories = [
              { key: 'Event', title: 'Events', viewKey: 'events' },
              { key: 'Initiative', title: 'Initiatives', viewKey: 'initiatives' },
              { key: 'Workshop', title: 'Workshops', viewKey: 'workshops' }
            ];

            categories.forEach(cat => {
              if (filter !== 'all' && filter !== cat.key.toLowerCase()) return;
              
              const items = window.superHrOpportunities.filter(o => o.category === cat.key);
              if (items.length > 0) {
                html += `
                  <div class="category-section" style="margin-bottom: 60px;">
                    <h2 class="category-title" style="font-size: 1.8rem; font-weight: 800; margin-bottom: 24px;">${cat.title}</h2>
                    <section class="initiatives-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 30px;">
                      ${items.map((opp, index) => renderAdminCard(opp, index % 4)).join('')}
                    </section>
                  </div>
                `;
              }
            });
            container.innerHTML = html;
          }

          renderAll();

          filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
              filterBtns.forEach(b => {
                 b.classList.remove('active');
                 b.style.background = 'var(--white)';
                 b.style.color = 'var(--ink-700)';
                 b.style.borderColor = 'rgba(15,31,43,0.1)';
              });
              btn.classList.add('active');
              btn.style.background = 'var(--sky-50)';
              btn.style.color = 'var(--sky-600)';
              btn.style.borderColor = 'var(--sky-200)';
              renderAll(btn.getAttribute('data-filter'));
            });
          });
        });
      </script>
    </main>"""

    # Replace <main>...</main> in admin
    # Ensure opportunities_data.js is linked in head
    admin_content = re.sub(r'<main[\s\S]*?</main>', new_main, admin_content)
    
    # inject script into head if not there
    if 'js/opportunities_data.js' not in admin_content:
        admin_content = admin_content.replace('</head>', '  <script src="js/opportunities_data.js"></script>\\n</head>')

    with open('admin-manage-opportunities.html', 'w', encoding='utf-8') as f:
        f.write(admin_content)

if __name__ == '__main__':
    main()
