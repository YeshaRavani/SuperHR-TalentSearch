PRAGMA foreign_keys = ON;

-- 1. Users & Skills Hub

CREATE TABLE Users (
    id TEXT PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    password_hash TEXT,
    role TEXT CHECK(role IN ('admin', 'contributors', 'head_of_department')),
    organisation TEXT,
    department_team TEXT,
    profile_photo_url TEXT,
    total_points INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Skills (
    id INTEGER PRIMARY KEY,
    name TEXT
);

CREATE TABLE User_Skills (
    user_id TEXT,
    skill_id INTEGER,
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (skill_id) REFERENCES Skills(id)
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
    points_reward INTEGER,
    time_required TEXT,
    expectations TEXT,
    status TEXT CHECK(status IN ('active', 'expired', 'completed')),
    author_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES Users(id)
);

CREATE TABLE Opportunity_Skills (
    opportunity_id TEXT,
    skill_id INTEGER,
    PRIMARY KEY (opportunity_id, skill_id),
    FOREIGN KEY (opportunity_id) REFERENCES Opportunities(id),
    FOREIGN KEY (skill_id) REFERENCES Skills(id)
);

CREATE TABLE User_Opportunities (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    opportunity_id TEXT,
    status TEXT CHECK(status IN ('interested', 'applied', 'enrolled', 'rejected', 'completed')),
    updated_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (opportunity_id) REFERENCES Opportunities(id)
);

-- 3. Community, Chat & Mentorship

CREATE TABLE Channels (
    id TEXT PRIMARY KEY,
    name TEXT,
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
    FOREIGN KEY (sender_id) REFERENCES Users(id),
    FOREIGN KEY (channel_id) REFERENCES Channels(id),
    FOREIGN KEY (receiver_id) REFERENCES Users(id)
);

CREATE TABLE Invitations (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    receiver_id TEXT,
    topic TEXT,
    message TEXT,
    status TEXT CHECK(status IN ('pending', 'accepted', 'declined')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES Users(id),
    FOREIGN KEY (receiver_id) REFERENCES Users(id)
);

-- 4. AI Assistant & Chatbot

CREATE TABLE Chat_Sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

CREATE TABLE Chat_Messages (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    sender_type TEXT CHECK(sender_type IN ('user', 'ai')),
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES Chat_Sessions(id)
);
