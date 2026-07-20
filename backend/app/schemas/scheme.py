from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime, date
import uuid


class DepartmentOut(BaseModel):
    id: uuid.UUID
    name: str
    ministry: Optional[str] = None

    model_config = {"from_attributes": True}


class EligibilityRuleOut(BaseModel):
    id: uuid.UUID
    field_name: str
    operator: str
    value: str
    rule_type: str
    weight: int
    label: Optional[str] = None

    model_config = {"from_attributes": True}


class EligibilityRuleCreate(BaseModel):
    field_name: str
    operator: str
    value: str
    rule_type: str = "mandatory"
    weight: int = 10
    label: Optional[str] = None


class SchemeBase(BaseModel):
    name: str
    name_te: Optional[str] = None
    description: str
    description_te: Optional[str] = None
    objective: Optional[str] = None
    status: str = "active"
    state_specific: Optional[str] = None
    launch_date: Optional[date] = None
    app_start_date: Optional[date] = None
    app_end_date: Optional[date] = None
    official_url: Optional[str] = None
    benefits: dict = {}
    benefits_te: dict = {}
    required_docs: list = []
    required_docs_te: list = []
    benefit_value_inr: int = 0
    category_tags: list = []


class SchemeCreate(SchemeBase):
    department_id: Optional[uuid.UUID] = None
    eligibility_rules: List[EligibilityRuleCreate] = []


class SchemeUpdate(SchemeBase):
    department_id: Optional[uuid.UUID] = None


class SchemeOut(SchemeBase):
    id: uuid.UUID
    department_id: Optional[uuid.UUID] = None
    department: Optional[DepartmentOut] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    eligibility_rules: List[EligibilityRuleOut] = []

    model_config = {"from_attributes": True}


class SchemeListItem(BaseModel):
    id: uuid.UUID
    name: str
    name_te: Optional[str] = None
    description: str
    status: str
    app_end_date: Optional[date] = None
    benefit_value_inr: int
    category_tags: list
    department: Optional[DepartmentOut] = None
    state_specific: Optional[str] = None

    model_config = {"from_attributes": True}


class MatchedSchemeOut(BaseModel):
    scheme: SchemeListItem
    match_score: float
    matched_rules: List[dict]
    failed_rules: List[dict]
    ai_explanation: Optional[str] = None

    model_config = {"from_attributes": True}


class BenefitsCalculation(BaseModel):
    total_schemes: int
    total_benefit_inr: int
    top_schemes: List[MatchedSchemeOut]


class SavedSchemeOut(BaseModel):
    id: uuid.UUID
    scheme: SchemeListItem
    saved_at: datetime

    model_config = {"from_attributes": True}


class NotificationOut(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    body: Optional[str] = None
    is_read: bool
    sent_at: datetime

    model_config = {"from_attributes": True}


class ChatMessage(BaseModel):
    message: str
    language: str = "en"


class ChatResponse(BaseModel):
    reply: str
    sources: List[dict] = []


class DashboardStats(BaseModel):
    total_eligible: int
    total_benefit_inr: int
    newly_launched: int
    closing_soon: int
    saved_count: int
