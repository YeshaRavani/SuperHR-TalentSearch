from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# Auth Models
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role: str
    organisation: Optional[str] = None
    department_team: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: str
    total_points: int
    is_active: bool
    created_at: datetime
    profile_photo_url: Optional[str] = None

    class Config:
        from_attributes = True

# Opportunity Models
class OpportunityBase(BaseModel):
    type: str
    title: str
    short_description: str
    full_description: str
    image_url: Optional[str] = None
    schedule_time: str
    location: str
    points_reward: int = 0
    time_required: str
    expectations: str

class OpportunityCreate(OpportunityBase):
    pass

class OpportunityResponse(OpportunityBase):
    id: str
    status: str
    author_id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Application/Interest Models
class UserOpportunityBase(BaseModel):
    opportunity_id: str
    status: str

class UserOpportunityCreate(UserOpportunityBase):
    pass

class UserOpportunityResponse(UserOpportunityBase):
    id: str
    user_id: str
    updated_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True

# Channel/Message Models
class ChannelBase(BaseModel):
    name: str
    description: Optional[str] = None

class ChannelResponse(ChannelBase):
    id: str
    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    content: str
    is_voice_record: bool = False

class MessageCreate(MessageBase):
    channel_id: Optional[str] = None
    receiver_id: Optional[str] = None

class MessageResponse(MessageBase):
    id: str
    sender_id: str
    channel_id: Optional[str]
    receiver_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Reward Policy
class RewardPolicyBase(BaseModel):
    active_mode: str
    hours_per_leave: int

class RewardPolicyUpdate(RewardPolicyBase):
    pass

class RewardPolicyResponse(RewardPolicyBase):
    id: int
    updated_at: datetime

    class Config:
        from_attributes = True
