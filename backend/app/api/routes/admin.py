from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import List
import uuid

from app.db.database import get_db
from app.models.scheme import Scheme, Department, EligibilityRule, EligibilityMatch
from app.models.user import User
from app.models.activity import UserActivity
from app.schemas.scheme import SchemeCreate, SchemeUpdate, SchemeOut, SchemeListItem
from app.core.deps import get_admin_user

router = APIRouter()


class DepartmentCreate(Exception):
    pass


from pydantic import BaseModel

class DeptCreate(BaseModel):
    name: str
    ministry: str = None


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    users_count = await db.execute(select(func.count(User.id)))
    schemes_count = await db.execute(select(func.count(Scheme.id)).where(Scheme.is_active == True))
    matches_count = await db.execute(select(func.count(EligibilityMatch.id)))
    views_count = await db.execute(select(func.count(UserActivity.id)).where(UserActivity.action == "view"))

    return {
        "total_users": users_count.scalar(),
        "total_schemes": schemes_count.scalar(),
        "total_matches": matches_count.scalar(),
        "total_views": views_count.scalar(),
    }


@router.get("/users")
async def list_users(
    skip: int = 0, limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(
        select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
    )
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }
        for u in users
    ]


@router.get("/departments")
async def list_departments(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(select(Department))
    return result.scalars().all()


@router.post("/departments")
async def create_department(
    data: DeptCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    dept = Department(name=data.name, ministry=data.ministry)
    db.add(dept)
    await db.commit()
    await db.refresh(dept)
    return dept


@router.get("/schemes", response_model=List[SchemeListItem])
async def list_schemes(
    skip: int = 0, limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(
        select(Scheme)
        .options(selectinload(Scheme.department))
        .offset(skip).limit(limit)
        .order_by(Scheme.created_at.desc())
    )
    return [SchemeListItem.model_validate(s) for s in result.scalars().all()]


@router.post("/schemes", response_model=SchemeOut, status_code=201)
async def create_scheme(
    data: SchemeCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    scheme = Scheme(
        **data.model_dump(exclude={"eligibility_rules"}),
    )
    db.add(scheme)
    await db.flush()

    for rule_data in data.eligibility_rules:
        rule = EligibilityRule(scheme_id=scheme.id, **rule_data.model_dump())
        db.add(rule)

    await db.commit()
    result = await db.execute(
        select(Scheme).where(Scheme.id == scheme.id)
        .options(selectinload(Scheme.eligibility_rules), selectinload(Scheme.department))
    )
    return result.scalar_one()


@router.put("/schemes/{scheme_id}", response_model=SchemeOut)
async def update_scheme(
    scheme_id: uuid.UUID,
    data: SchemeUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(
        select(Scheme).where(Scheme.id == scheme_id)
        .options(selectinload(Scheme.eligibility_rules), selectinload(Scheme.department))
    )
    scheme = result.scalar_one_or_none()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")

    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(scheme, k, v)

    await db.commit()
    await db.refresh(scheme)
    return scheme


@router.delete("/schemes/{scheme_id}")
async def delete_scheme(
    scheme_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(select(Scheme).where(Scheme.id == scheme_id))
    scheme = result.scalar_one_or_none()
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    scheme.is_active = False
    await db.commit()
    return {"message": "Scheme deactivated"}


@router.post("/schemes/{scheme_id}/rules")
async def add_rule(
    scheme_id: uuid.UUID,
    rule_data: dict,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    rule = EligibilityRule(scheme_id=scheme_id, **rule_data)
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule


@router.delete("/schemes/{scheme_id}/rules/{rule_id}")
async def delete_rule(
    scheme_id: uuid.UUID,
    rule_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_admin_user),
):
    result = await db.execute(
        select(EligibilityRule).where(
            EligibilityRule.id == rule_id, EligibilityRule.scheme_id == scheme_id
        )
    )
    rule = result.scalar_one_or_none()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    await db.delete(rule)
    await db.commit()
    return {"message": "Rule deleted"}
