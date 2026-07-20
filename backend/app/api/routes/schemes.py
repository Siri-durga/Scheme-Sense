from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
from typing import Optional, List
from datetime import date, timedelta
import uuid

from app.db.database import get_db
from app.models.scheme import Scheme, EligibilityMatch, SavedScheme, Department
from app.models.user import User, UserProfile
from app.models.activity import UserActivity, Notification
from app.schemas.scheme import (
    SchemeOut, SchemeListItem, MatchedSchemeOut, BenefitsCalculation,
    SavedSchemeOut, NotificationOut, DashboardStats, ChatMessage, ChatResponse
)
from app.core.deps import get_current_user
from app.services.eligibility import compute_match, generate_explanation
from app.ai.chat import get_ai_response

router = APIRouter()


async def get_or_compute_matches(user: User, db: AsyncSession) -> List[EligibilityMatch]:
    """Return cached matches or compute fresh ones."""
    existing = await db.execute(
        select(EligibilityMatch)
        .where(EligibilityMatch.user_id == user.id)
        .options(selectinload(EligibilityMatch.scheme).selectinload(Scheme.department))
        .order_by(EligibilityMatch.match_score.desc())
    )
    matches = existing.scalars().all()

    if matches:
        return matches

    # Compute fresh matches
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == user.id)
    )
    profile = profile_result.scalar_one_or_none()
    if not profile or not profile.age:
        return []

    schemes_result = await db.execute(
        select(Scheme)
        .where(Scheme.is_active == True)
        .options(selectinload(Scheme.eligibility_rules), selectinload(Scheme.department))
    )
    schemes = schemes_result.scalars().all()

    new_matches = []
    for scheme in schemes:
        result = compute_match(scheme, profile)
        if result["eligible"]:
            explanation = generate_explanation(
                scheme.name, result["matched_rules"], user.preferred_language
            )
            match = EligibilityMatch(
                user_id=user.id,
                scheme_id=scheme.id,
                match_score=result["match_score"],
                matched_rules=result["matched_rules"],
                failed_rules=result["failed_rules"],
                ai_explanation=explanation,
            )
            db.add(match)
            new_matches.append(match)

    await db.commit()

    # Re-fetch with relationships
    refreshed = await db.execute(
        select(EligibilityMatch)
        .where(EligibilityMatch.user_id == user.id)
        .options(selectinload(EligibilityMatch.scheme).selectinload(Scheme.department))
        .order_by(EligibilityMatch.match_score.desc())
    )
    return refreshed.scalars().all()


@router.post("/compute-matches")
async def compute_matches(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Force recompute eligibility matches for current user."""
    # Delete old matches
    old = await db.execute(
        select(EligibilityMatch).where(EligibilityMatch.user_id == current_user.id)
    )
    for m in old.scalars().all():
        await db.delete(m)
    await db.commit()

    matches = await get_or_compute_matches(current_user, db)
    return {"matched": len(matches)}


@router.get("/my-matches", response_model=List[MatchedSchemeOut])
async def get_my_matches(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    matches = await get_or_compute_matches(current_user, db)
    result = []
    for m in matches:
        result.append(MatchedSchemeOut(
            scheme=SchemeListItem.model_validate(m.scheme),
            match_score=m.match_score,
            matched_rules=m.matched_rules or [],
            failed_rules=m.failed_rules or [],
            ai_explanation=m.ai_explanation,
        ))
    return result


@router.get("/benefits-calculator", response_model=BenefitsCalculation)
async def benefits_calculator(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    matches = await get_or_compute_matches(current_user, db)
    total = sum(m.scheme.benefit_value_inr for m in matches)
    top = matches[:8]
    return BenefitsCalculation(
        total_schemes=len(matches),
        total_benefit_inr=total,
        top_schemes=[
            MatchedSchemeOut(
                scheme=SchemeListItem.model_validate(m.scheme),
                match_score=m.match_score,
                matched_rules=m.matched_rules or [],
                failed_rules=m.failed_rules or [],
                ai_explanation=m.ai_explanation,
            )
            for m in top
        ],
    )


@router.get("/dashboard-stats", response_model=DashboardStats)
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    matches = await get_or_compute_matches(current_user, db)
    today = date.today()
    soon = today + timedelta(days=30)

    newly = await db.execute(
        select(func.count(Scheme.id))
        .where(Scheme.launch_date >= today - timedelta(days=30), Scheme.is_active == True)
    )
    closing = sum(
        1 for m in matches
        if m.scheme.app_end_date and today <= m.scheme.app_end_date <= soon
    )
    saved_res = await db.execute(
        select(func.count(SavedScheme.id)).where(SavedScheme.user_id == current_user.id)
    )
    return DashboardStats(
        total_eligible=len(matches),
        total_benefit_inr=sum(m.scheme.benefit_value_inr for m in matches),
        newly_launched=newly.scalar() or 0,
        closing_soon=closing,
        saved_count=saved_res.scalar() or 0,
    )


@router.get("/search", response_model=List[SchemeListItem])
async def search_schemes(
    q: str = Query("", min_length=0),
    state: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Scheme).where(Scheme.is_active == True).options(selectinload(Scheme.department))
    if q:
        query = query.where(
            or_(
                Scheme.name.ilike(f"%{q}%"),
                Scheme.description.ilike(f"%{q}%"),
            )
        )
    if state:
        query = query.where(
            or_(Scheme.state_specific == state, Scheme.state_specific == None)
        )
    result = await db.execute(query.limit(50))
    return [SchemeListItem.model_validate(s) for s in result.scalars().all()]


@router.get("/list", response_model=List[SchemeListItem])
async def list_schemes(
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Scheme).where(Scheme.is_active == True).options(selectinload(Scheme.department))
    if status:
        query = query.where(Scheme.status == status)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return [SchemeListItem.model_validate(s) for s in result.scalars().all()]


@router.get("/{scheme_id}", response_model=SchemeOut)
async def get_scheme(
    scheme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    result = await db.execute(
        select(Scheme)
        .where(Scheme.id == scheme_id)
        .options(selectinload(Scheme.eligibility_rules), selectinload(Scheme.department))
    )
    scheme = result.scalar_one_or_none()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    if current_user:
        activity = UserActivity(user_id=current_user.id, scheme_id=scheme.id, action="view")
        db.add(activity)
        await db.commit()

    return scheme


@router.post("/{scheme_id}/save")
async def save_scheme(
    scheme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await db.execute(
        select(SavedScheme).where(
            SavedScheme.user_id == current_user.id,
            SavedScheme.scheme_id == scheme_id,
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "Already saved"}

    saved = SavedScheme(user_id=current_user.id, scheme_id=scheme_id)
    db.add(saved)
    await db.commit()
    return {"message": "Scheme saved"}


@router.delete("/{scheme_id}/save")
async def unsave_scheme(
    scheme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SavedScheme).where(
            SavedScheme.user_id == current_user.id,
            SavedScheme.scheme_id == scheme_id,
        )
    )
    saved = result.scalar_one_or_none()
    if saved:
        await db.delete(saved)
        await db.commit()
    return {"message": "Removed from saved"}


@router.get("/user/saved", response_model=List[SavedSchemeOut])
async def get_saved_schemes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(SavedScheme)
        .where(SavedScheme.user_id == current_user.id)
        .options(selectinload(SavedScheme.scheme).selectinload(Scheme.department))
        .order_by(SavedScheme.saved_at.desc())
    )
    return result.scalars().all()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    data: ChatMessage,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    matches = await get_or_compute_matches(current_user, db)

    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.user_id == current_user.id)
    )
    profile = profile_result.scalar_one_or_none()

    response = await get_ai_response(
        message=data.message,
        matched_schemes=matches,
        profile=profile,
        language=data.language,
    )
    return ChatResponse(**response)


@router.get("/user/notifications", response_model=List[NotificationOut])
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.sent_at.desc())
        .limit(20)
    )
    return result.scalars().all()


@router.put("/user/notifications/{notif_id}/read")
async def mark_read(
    notif_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == notif_id, Notification.user_id == current_user.id
        )
    )
    notif = result.scalar_one_or_none()
    if notif:
        notif.is_read = True
        await db.commit()
    return {"message": "Marked as read"}
