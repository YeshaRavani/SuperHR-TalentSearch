import json
from pydantic import BaseModel, EmailStr, field_validator
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


class RewardsSummaryResponse(BaseModel):
    user_id: str
    total_points: int
    active_mode: str
    hours_per_leave: int
    leave_hours_available: float

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
    expectations: List[str] = []
    responsibilities: List[str] = []
    benefits: List[str] = []
    prerequisites: List[str] = []
    skills: List[str] = []
    main_icon: Optional[str] = None
    tag_icon: Optional[str] = None
    bg_gradient: Optional[str] = None
    icon_color: Optional[str] = None

    @field_validator('expectations', 'responsibilities', 'benefits', 'prerequisites', 'skills', mode='before')
    @classmethod
    def parse_json_strings(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                # Fallback for old comma-separated or plain text data
                if ';' in v: return [i.strip() for i in v.split(';')]
                if ',' in v: return [i.strip() for i in v.split(',')]
                return [v] if v else []
        if isinstance(v, list):
            # If it's a list of Skill objects from ORM, extract their names
            return [i.name if hasattr(i, 'name') else i for i in v]
        return v or []

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


class InvitationBase(BaseModel):
    topic: str
    message: str


class InvitationCreate(InvitationBase):
    receiver_id: str


class InvitationUpdate(BaseModel):
    status: str


class InvitationResponse(InvitationBase):
    id: str
    sender_id: str
    receiver_id: str
    status: str
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


class AIChatRequest(BaseModel):
    message: str
    history: List["AIChatTurn"] = []


class AIChatTurn(BaseModel):
    role: str
    content: str


class AIChatResponse(BaseModel):
    reply: str
    sources: List[str] = []
    suggested_actions: List[str] = []
