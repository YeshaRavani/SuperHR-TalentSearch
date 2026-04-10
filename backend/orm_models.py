from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "Users"
    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    full_name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)
    organisation = Column(String)
    department_team = Column(String)
    profile_photo_url = Column(String)
    total_points = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    opportunities = relationship("Opportunity", back_populates="author")
    interests = relationship("UserOpportunity", back_populates="user")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id", back_populates="receiver")
    sent_invitations = relationship("Invitation", foreign_keys="Invitation.sender_id", back_populates="sender")
    received_invitations = relationship("Invitation", foreign_keys="Invitation.receiver_id", back_populates="receiver")
    chat_sessions = relationship("ChatSession", back_populates="user")
    skills = relationship("Skill", secondary="User_Skills", back_populates="users")

class Skill(Base):
    __tablename__ = "Skills"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, index=True)

    users = relationship("User", secondary="User_Skills", back_populates="skills")
    opportunities = relationship("Opportunity", secondary="Opportunity_Skills", back_populates="skills")

class UserSkill(Base):
    __tablename__ = "User_Skills"
    user_id = Column(String, ForeignKey("Users.id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("Skills.id", ondelete="CASCADE"), primary_key=True)

class OpportunitySkill(Base):
    __tablename__ = "Opportunity_Skills"
    opportunity_id = Column(String, ForeignKey("Opportunities.id", ondelete="CASCADE"), primary_key=True)
    skill_id = Column(Integer, ForeignKey("Skills.id", ondelete="CASCADE"), primary_key=True)

class Opportunity(Base):
    __tablename__ = "Opportunities"
    id = Column(String, primary_key=True, index=True)
    type = Column(String)
    title = Column(String)
    short_description = Column(String)
    full_description = Column(String)
    image_url = Column(String)
    schedule_time = Column(String)
    location = Column(String)
    points_reward = Column(Integer, default=0)
    time_required = Column(String)
    expectations = Column(Text)
    responsibilities = Column(Text)
    benefits = Column(Text)
    prerequisites = Column(Text)
    main_icon = Column(Text)
    tag_icon = Column(Text)
    bg_gradient = Column(Text)
    icon_color = Column(Text)
    status = Column(String, default="active")
    author_id = Column(String, ForeignKey("Users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, server_default=func.now())

    author = relationship("User", back_populates="opportunities")
    applicants = relationship("UserOpportunity", back_populates="opportunity")
    skills = relationship("Skill", secondary="Opportunity_Skills", back_populates="opportunities")

class UserOpportunity(Base):
    __tablename__ = "User_Opportunities"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("Users.id", ondelete="CASCADE"))
    opportunity_id = Column(String, ForeignKey("Opportunities.id", ondelete="CASCADE"))
    status = Column(String)
    updated_at = Column(DateTime, onupdate=func.now())
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="interests")
    opportunity = relationship("Opportunity", back_populates="applicants")

class Channel(Base):
    __tablename__ = "Channels"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, unique=True)
    description = Column(String)
    messages = relationship("Message", back_populates="channel")

class Message(Base):
    __tablename__ = "Messages"
    id = Column(String, primary_key=True, index=True)
    sender_id = Column(String, ForeignKey("Users.id", ondelete="CASCADE"))
    channel_id = Column(String, ForeignKey("Channels.id", ondelete="CASCADE"), nullable=True)
    receiver_id = Column(String, ForeignKey("Users.id", ondelete="CASCADE"), nullable=True)
    content = Column(Text)
    is_voice_record = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")
    channel = relationship("Channel", back_populates="messages")

class Invitation(Base):
    __tablename__ = "Invitations"
    id = Column(String, primary_key=True, index=True)
    sender_id = Column(String, ForeignKey("Users.id", ondelete="CASCADE"))
    receiver_id = Column(String, ForeignKey("Users.id", ondelete="CASCADE"))
    topic = Column(String)
    message = Column(Text)
    status = Column(String, default="pending")
    created_at = Column(DateTime, server_default=func.now())

    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_invitations")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_invitations")

class RewardPolicy(Base):
    __tablename__ = "Reward_Policies"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    active_mode = Column(String, default="points")
    hours_per_leave = Column(Integer, default=8)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class ChatSession(Base):
    __tablename__ = "Chat_Sessions"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("Users.id", ondelete="CASCADE"))
    title = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "Chat_Messages"
    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("Chat_Sessions.id", ondelete="CASCADE"))
    sender_type = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    session = relationship("ChatSession", back_populates="messages")
