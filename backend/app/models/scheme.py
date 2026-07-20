import uuid
from datetime import datetime, date
from sqlalchemy import String, Boolean, DateTime, Integer, Float, ForeignKey, Text, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.db.database import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    ministry: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    schemes: Mapped[list["Scheme"]] = relationship("Scheme", back_populates="department")


class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True
    )
    name: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    name_te: Mapped[str] = mapped_column(String(500), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    description_te: Mapped[str] = mapped_column(Text, nullable=True)
    objective: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active, closed, upcoming
    state_specific: Mapped[str] = mapped_column(String(100), nullable=True)
    launch_date: Mapped[date] = mapped_column(Date, nullable=True)
    app_start_date: Mapped[date] = mapped_column(Date, nullable=True)
    app_end_date: Mapped[date] = mapped_column(Date, nullable=True)
    official_url: Mapped[str] = mapped_column(String(1000), nullable=True)
    benefits: Mapped[dict] = mapped_column(JSONB, default=dict)
    benefits_te: Mapped[dict] = mapped_column(JSONB, default=dict)
    required_docs: Mapped[list] = mapped_column(JSONB, default=list)
    required_docs_te: Mapped[list] = mapped_column(JSONB, default=list)
    benefit_value_inr: Mapped[int] = mapped_column(Integer, default=0)
    category_tags: Mapped[list] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    department: Mapped["Department"] = relationship("Department", back_populates="schemes")
    eligibility_rules: Mapped[list["EligibilityRule"]] = relationship(
        "EligibilityRule", back_populates="scheme", cascade="all, delete-orphan"
    )
    saved_by: Mapped[list["SavedScheme"]] = relationship(
        "SavedScheme", back_populates="scheme", cascade="all, delete-orphan"
    )
    matches: Mapped[list["EligibilityMatch"]] = relationship(
        "EligibilityMatch", back_populates="scheme", cascade="all, delete-orphan"
    )


class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scheme_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False
    )
    field_name: Mapped[str] = mapped_column(String(100), nullable=False)
    operator: Mapped[str] = mapped_column(String(20), nullable=False)  # eq, ne, gte, lte, in, nin
    value: Mapped[str] = mapped_column(String(500), nullable=False)
    rule_type: Mapped[str] = mapped_column(String(20), default="mandatory")  # mandatory, bonus
    weight: Mapped[int] = mapped_column(Integer, default=10)
    label: Mapped[str] = mapped_column(String(255), nullable=True)

    scheme: Mapped["Scheme"] = relationship("Scheme", back_populates="eligibility_rules")


class EligibilityMatch(Base):
    __tablename__ = "eligibility_matches"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    scheme_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False
    )
    match_score: Mapped[float] = mapped_column(Float, default=0.0)
    matched_rules: Mapped[list] = mapped_column(JSONB, default=list)
    failed_rules: Mapped[list] = mapped_column(JSONB, default=list)
    ai_explanation: Mapped[str] = mapped_column(Text, nullable=True)
    computed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="matches")
    scheme: Mapped["Scheme"] = relationship("Scheme", back_populates="matches")


class SavedScheme(Base):
    __tablename__ = "saved_schemes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    scheme_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False
    )
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="saved_schemes")
    scheme: Mapped["Scheme"] = relationship("Scheme", back_populates="saved_by")
