PRAGMA foreign_keys = ON;

-- 1. Users & Skills Hub

CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    email TEXT UNIQUE,
    hashed_password TEXT,
    role TEXT CHECK(role IN ('admin', 'contributors', 'head_of_department')),
    organisation TEXT,
    department_team TEXT,
    profile_photo_url TEXT,
    total_points INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
);

CREATE TABLE User_Skills (
    user_id TEXT,
    skill_id INTEGER,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

-- 2. Opportunities Hub

CREATE TABLE Opportunities (
    id TEXT PRIMARY KEY,
    type TEXT CHECK(type IN ('Event', 'Initiative', 'Workshop')),
    title TEXT,
    short_description TEXT,
    full_description TEXT,
    image_url TEXT,
    schedule_time TEXT,
    location TEXT,
    points_reward INTEGER DEFAULT 0,
    time_required TEXT,
    expectations TEXT,
    responsibilities TEXT,
    benefits TEXT,
    prerequisites TEXT,
    main_icon TEXT,
    tag_icon TEXT,
    bg_gradient TEXT,
    icon_color TEXT,
    status TEXT CHECK(status IN ('active', 'expired', 'completed')) DEFAULT 'active',
    author_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Opportunity_Skills (
    opportunity_id TEXT,
    skill_id INTEGER,
    PRIMARY KEY (opportunity_id, skill_id),
    FOREIGN KEY (opportunity_id) REFERENCES Opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES Skills(id) ON DELETE CASCADE
);

CREATE TABLE User_Opportunities (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    opportunity_id TEXT,
    status TEXT CHECK(status IN ('interested', 'applied', 'enrolled', 'rejected', 'completed')),
    updated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (opportunity_id) REFERENCES Opportunities(id) ON DELETE CASCADE
);

-- 3. Community, Chat & Mentorship

CREATE TABLE Channels (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE,
    description TEXT
);

CREATE TABLE Messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    channel_id TEXT,
    receiver_id TEXT,
    content TEXT,
    is_voice_record INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES Channels(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Invitations (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    receiver_id TEXT,
    topic TEXT,
    message TEXT,
    status TEXT CHECK(status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- 4. Reward System & Policies

CREATE TABLE Reward_Policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    active_mode TEXT CHECK(active_mode IN ('points', 'hours', 'money')) DEFAULT 'points',
    hours_per_leave INTEGER DEFAULT 8,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI Assistant & Chatbot

CREATE TABLE Chat_Sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE Chat_Messages (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    sender_type TEXT CHECK(sender_type IN ('user', 'ai')),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Chat_Sessions(id) ON DELETE CASCADE
);

