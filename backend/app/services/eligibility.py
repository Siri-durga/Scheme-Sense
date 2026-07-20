from typing import Optional
from app.models.user import UserProfile
from app.models.scheme import Scheme, EligibilityRule


def evaluate_rule(rule: EligibilityRule, profile: UserProfile) -> tuple[bool, str]:
    """Evaluate a single eligibility rule against a user profile. Returns (passed, label)."""
    field = rule.field_name
    op = rule.operator
    rule_val = rule.value

    profile_val = getattr(profile, field, None)
    if profile_val is None:
        profile_val = (profile.extra_fields or {}).get(field)

    if profile_val is None:
        return False, rule.label or f"{field} not provided"

    label = rule.label or f"{field} {op} {rule_val}"

    try:
        if op == "eq":
            return str(profile_val).lower() == str(rule_val).lower(), label
        elif op == "ne":
            return str(profile_val).lower() != str(rule_val).lower(), label
        elif op == "gte":
            return float(profile_val) >= float(rule_val), label
        elif op == "lte":
            return float(profile_val) <= float(rule_val), label
        elif op == "gt":
            return float(profile_val) > float(rule_val), label
        elif op == "lt":
            return float(profile_val) < float(rule_val), label
        elif op == "in":
            options = [x.strip().lower() for x in rule_val.split(",")]
            return str(profile_val).lower() in options, label
        elif op == "nin":
            options = [x.strip().lower() for x in rule_val.split(",")]
            return str(profile_val).lower() not in options, label
        elif op == "bool_true":
            return bool(profile_val) is True, label
        elif op == "bool_false":
            return bool(profile_val) is False, label
        else:
            return False, label
    except (ValueError, TypeError):
        return False, label


def compute_match(scheme: Scheme, profile: UserProfile) -> dict:
    """Compute eligibility match between a scheme and user profile."""
    rules = scheme.eligibility_rules
    if not rules:
        return {
            "match_score": 50.0,
            "matched_rules": [],
            "failed_rules": [],
            "eligible": True,
        }

    mandatory_rules = [r for r in rules if r.rule_type == "mandatory"]
    bonus_rules = [r for r in rules if r.rule_type == "bonus"]

    matched = []
    failed = []
    all_mandatory_passed = True

    for rule in mandatory_rules:
        passed, label = evaluate_rule(rule, profile)
        entry = {"field": rule.field_name, "label": label, "weight": rule.weight}
        if passed:
            matched.append(entry)
        else:
            failed.append(entry)
            all_mandatory_passed = False

    for rule in bonus_rules:
        passed, label = evaluate_rule(rule, profile)
        entry = {"field": rule.field_name, "label": label, "weight": rule.weight}
        if passed:
            matched.append(entry)
        else:
            failed.append(entry)

    if not all_mandatory_passed:
        return {
            "match_score": 0.0,
            "matched_rules": matched,
            "failed_rules": failed,
            "eligible": False,
        }

    total_weight = sum(r.weight for r in rules)
    matched_weight = sum(r["weight"] for r in matched)
    score = (matched_weight / total_weight * 100) if total_weight > 0 else 100.0

    return {
        "match_score": round(score, 1),
        "matched_rules": matched,
        "failed_rules": failed,
        "eligible": score > 0,
    }


def generate_explanation(scheme_name: str, matched_rules: list, lang: str = "en") -> str:
    """Generate a human-readable eligibility explanation without LLM."""
    if not matched_rules:
        return f"You meet the basic criteria for {scheme_name}."

    labels = [r["label"] for r in matched_rules[:5]]
    reasons = ", ".join(labels)

    if lang == "te":
        return f"మీరు {scheme_name} కు అర్హులు ఎందుకంటే: {reasons}."
    return f"You are eligible for {scheme_name} because: {reasons}."
