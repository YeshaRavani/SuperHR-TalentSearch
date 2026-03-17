import re

styles = """
        .notif-item {
            padding: 16px;
            background: var(--sky-50);
            border-radius: var(--radius-md);
            margin-bottom: 12px;
            border: 1px solid var(--sky-100);
            transition: all 0.2s;
        }
        .notif-item:hover {
            background: var(--sky-100);
            transform: translateX(5px);
        }
        .notif-dropdown {
            transform: translateY(15px) scale(0.95);
            opacity: 0;
            visibility: hidden;
            transition: all var(--transition-bounce, 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275));
            transform-origin: top right;
        }
        .notif-dropdown.active, .notif-dropdown.open {
            transform: translateY(0) scale(1);
            opacity: 1;
            visibility: visible;
        }
"""

files = [
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-home.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-manage-users.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-manage-opportunities.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-contributor-profile.html',
    '/Users/yesharavani/AI_prod/Talent search/SuperHR-TalentSearch/admin-system-settings.html'
]

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        if '.notif-item {' not in content:
            # inject logic before </style>
            content = content.replace('</style>', f'{styles}</style>')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print("Replaced in " + filepath)

    except Exception as e:
        print(e)
