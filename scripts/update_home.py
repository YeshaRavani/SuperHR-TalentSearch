import re

with open('test.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Hero Content
html = html.replace('🚀 Welcome to the new platform', '🎯 Welcome to Talent Search')
html = html.replace('Unlock Potential,<br><span>Discover Talent.</span>', 'Welcome to<br><span>Talent Search</span>')
html = html.replace(
    'Join a dynamic ecosystem of creators and builders. Explore short-term initiatives, hands-on\n                        workshops, and connect with peers to build something extraordinary.',
    'Discover and contribute to short-term opportunities — internships, events, workshops and quick projects that help talents and creators grow. Explore curated initiatives and post opportunities in a few clicks.'
)
html = html.replace('Explore Opportunities', 'Get Involved')
html = html.replace('Join Community', 'Learn More')

# Add quick post bar to hero actions
quick_post_html = """
                    <div class="post-bar" style="margin-top: 24px; display: flex; gap: 12px; align-items: center; background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); padding: 12px; border-radius: var(--radius-md); border: 1px solid rgba(15, 31, 43, 0.1); box-shadow: var(--shadow-sm); animation: fadeUp 0.8s ease-out 0.4s both;">
                        <input id="quickPost" type="text" placeholder="Have an opportunity? Describe it briefly..." style="flex: 1; padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid rgba(15, 31, 43, 0.1); background: rgba(255, 255, 255, 0.9); font-family: inherit; font-size: 0.95rem; outline: none; transition: all 0.2s;" onfocus="this.style.borderColor='var(--sky-400)'; this.style.boxShadow='0 0 0 3px var(--sky-100)';" onblur="this.style.borderColor='rgba(15, 31, 43, 0.1)'; this.style.boxShadow='none';" aria-label="Post an opportunity brief" />
                        <button onclick="quickPost()" class="btn btn-sky" style="height: 44px; padding: 0 20px; font-size: 0.95rem;">Post</button>
                    </div>
"""
# insert after hero-actions closing div
hero_actions_end = html.find('</div>', html.find('class="hero-actions"')) + 6
html = html[:hero_actions_end] + quick_post_html + html[hero_actions_end:]

# Add quickPost js function
js_to_add = """
            // Quick Post Functionality
            window.quickPost = function() {
                const input = document.getElementById('quickPost');
                const val = input.value.trim();
                if(!val){
                    input.focus();
                    return alert('Please enter a short description of the opportunity.');
                }
                alert('Thanks! Your opportunity has been noted: "' + (val.length>80? val.slice(0,77)+'...': val) + '"');
                input.value='';
            }
"""
html = html.replace('// 1. Navbar Scroll', js_to_add + '\n            // 1. Navbar Scroll')

# Update title
html = html.replace('<title>Talent & Opportunity Discovery</title>', '<title>Talent Search — Home</title>')

with open('home.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated home.html")
