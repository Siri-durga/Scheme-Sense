from typing import Optional, List
from app.core.config import settings


SCHEME_CONTEXT_TEMPLATE = """You are SchemeSense AI, a helpful assistant that helps Indian citizens find government schemes they are eligible for.

Answer ONLY based on the scheme information provided below. Do not hallucinate or invent schemes.
If the user asks something not covered by the data, say you don't have that information.

Available schemes for this user:
{schemes_text}

User profile summary: {profile_summary}

Answer in {language}.
"""


def build_profile_summary(profile) -> str:
    if not profile:
        return "Profile not completed"
    parts = []
    if profile.age:
        parts.append(f"Age {profile.age}")
    if profile.gender:
        parts.append(profile.gender)
    if profile.state:
        parts.append(f"from {profile.state}")
    if profile.occupation:
        parts.append(profile.occupation)
    if profile.income_annual:
        parts.append(f"income ₹{profile.income_annual:,}/year")
    if profile.category:
        parts.append(f"category {profile.category}")
    if profile.is_student:
        parts.append("student")
    if profile.is_farmer:
        parts.append("farmer")
    return ", ".join(parts) if parts else "No profile data"


def build_schemes_text(matched_schemes: list) -> str:
    if not matched_schemes:
        return "No matching schemes found yet. Please complete your profile first."
    lines = []
    for i, m in enumerate(matched_schemes[:10], 1):
        s = m.scheme
        lines.append(
            f"{i}. {s.name} (Match: {m.match_score:.0f}%)\n"
            f"   Benefits: {s.benefits.get('summary', 'See official site')}\n"
            f"   Value: ₹{s.benefit_value_inr:,}\n"
            f"   Apply: {s.official_url or 'Check official government portal'}\n"
            f"   Why eligible: {m.ai_explanation or 'Profile matches criteria'}"
        )
    return "\n\n".join(lines)


async def get_ai_response(
    message: str,
    matched_schemes: list,
    profile,
    language: str = "en",
) -> dict:
    """Get AI chat response. Uses OpenAI if key available, else rule-based fallback."""
    schemes_text = build_schemes_text(matched_schemes)
    profile_summary = build_profile_summary(profile)

    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "sk-your-openai-key-here":
        return await _openai_response(message, schemes_text, profile_summary, language)
    else:
        return _fallback_response(message, matched_schemes, language)


async def _openai_response(message, schemes_text, profile_summary, language) -> dict:
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        lang_name = "Telugu" if language == "te" else "English"
        system_prompt = SCHEME_CONTEXT_TEMPLATE.format(
            schemes_text=schemes_text,
            profile_summary=profile_summary,
            language=lang_name,
        )

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            max_tokens=600,
            temperature=0.3,
        )
        return {
            "reply": response.choices[0].message.content,
            "sources": [],
        }
    except Exception as e:
        return _fallback_response(message, [], language)


def _fallback_response(message: str, matched_schemes: list, language: str) -> dict:
    """Rule-based fallback when no OpenAI key."""
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["eligible", "qualify", "which scheme", "my scheme", "what scheme"]):
        if matched_schemes:
            names = [m.scheme.name for m in matched_schemes[:5]]
            if language == "te":
                reply = f"మీరు {len(matched_schemes)} పథకాలకు అర్హులు. వీటిలో ముఖ్యమైనవి: {', '.join(names)}."
            else:
                reply = f"Based on your profile, you are eligible for {len(matched_schemes)} schemes. Top matches: {', '.join(names)}."
        else:
            reply = "Please complete your profile first so I can find matching schemes for you."

    elif any(w in msg_lower for w in ["document", "doc", "required", "need"]):
        if matched_schemes:
            s = matched_schemes[0].scheme
            docs = s.required_docs or []
            reply = f"For {s.name}, you typically need: {', '.join(docs[:5]) if docs else 'Aadhaar card, Income certificate, Bank passbook'}."
        else:
            reply = "Common documents required for most schemes: Aadhaar card, Income certificate, Caste certificate (if applicable), Bank passbook, Passport photo."

    elif any(w in msg_lower for w in ["apply", "application", "how to"]):
        if matched_schemes:
            s = matched_schemes[0].scheme
            url = s.official_url or "the official government portal"
            reply = f"To apply for {s.name}, visit: {url}. Click 'Apply Now' on the scheme detail page for a direct link."
        else:
            reply = "Click 'Apply Now' on any scheme card to go to the official government portal. Complete your profile first to see your eligible schemes."

    elif any(w in msg_lower for w in ["benefit", "money", "amount", "how much"]):
        if matched_schemes:
            total = sum(m.scheme.benefit_value_inr for m in matched_schemes)
            reply = f"Your total estimated benefit across {len(matched_schemes)} eligible schemes is ₹{total:,}. This includes scholarships, subsidies, and financial assistance."
        else:
            reply = "Complete your profile to see the estimated benefits you can receive."

    elif any(w in msg_lower for w in ["deadline", "last date", "expire", "close"]):
        closing = [m for m in matched_schemes if m.scheme.app_end_date]
        if closing:
            s = closing[0].scheme
            reply = f"Upcoming deadline: {s.name} closes on {s.app_end_date}. Check your dashboard for all scheme deadlines."
        else:
            reply = "Check the scheme cards on your dashboard for application deadlines."

    elif any(w in msg_lower for w in ["farmer", "kisan", "agriculture", "krishi"]):
        farmer_schemes = [m for m in matched_schemes if "farm" in m.scheme.name.lower() or "kisan" in m.scheme.name.lower() or "agri" in m.scheme.name.lower()]
        if farmer_schemes:
            names = [m.scheme.name for m in farmer_schemes]
            reply = f"Farmer schemes you qualify for: {', '.join(names)}."
        else:
            reply = "Major farmer schemes include PM-KISAN (₹6,000/year), PM Fasal Bima Yojana (crop insurance), Kisan Credit Card. Update your profile as a farmer to see your eligible schemes."

    elif any(w in msg_lower for w in ["student", "scholarship", "education", "study"]):
        reply = "Major scholarship schemes include: National Scholarship Portal schemes, Post-Matric Scholarships for SC/ST/OBC, Merit-cum-Means Scholarship. Mark yourself as a student in your profile to see all eligible scholarships."

    elif any(w in msg_lower for w in ["women", "mahila", "girl", "female"]):
        reply = "Schemes for women include: Mahila Shakti Kendra, Pradhan Mantri Matru Vandana Yojana, Sukanya Samriddhi Yojana, Stand Up India for women entrepreneurs. Update your gender in profile to see all eligible schemes."

    else:
        if language == "te":
            reply = "నేను మీకు ప్రభుత్వ పథకాల గురించి సహాయం చేయగలను. మీరు దేని గురించి తెలుసుకోవాలనుకుంటున్నారు?"
        else:
            reply = "I can help you find government schemes, check eligibility, understand required documents, or guide you through the application process. What would you like to know?"

    return {"reply": reply, "sources": []}
