import json
import os
import urllib.error
import urllib.request

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
INDUSTRY_OPTIONS = [
    "Software Engineering",
    "Data Science",
    "Manufacturing",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Robotics",
    "Aerospace",
    "Research & Development",
    "Quality Assurance",
    "Other",
]
CAREER_STATUS_MAP = {
    "currently in industry": "in_industry",
    "in industry": "in_industry",
    "seeking opportunities": "seeking_opportunities",
    "seeking opportunity": "seeking_opportunities",
    "student": "student",
    "career break": "career_break",
}


def _build_prompt(query: str) -> str:
    return (
        "You are a parser that extracts structured search filters from a natural "
        "language query for a professional network. Return ONLY valid JSON. Here are some extra condtions. If the the input has 'at' then they are talking about school, if they say 'in' it refers to location.\n\n"
        "Allowed fields:\n"
        '- "text_query": string (extra terms that do not map to filters)\n'
        '- "industry": string\n'
        '- "location": string\n'
        '- "school": string\n'
        '- "career_status": string (one of: in_industry, seeking_opportunities, student, career_break)\n'
        '- "skills": array of strings\n\n'
        "Industry values (match case-insensitively; output the exact casing shown):\n"
        "- Software Engineering\n"
        "- Data Science\n"
        "- Manufacturing\n"
        "- Mechanical Engineering\n"
        "- Electrical Engineering\n"
        "- Chemical Engineering\n"
        "- Biotechnology\n"
        "- Robotics\n"
        "- Aerospace\n"
        "- Research & Development\n"
        "- Quality Assurance\n"
        "- Other\n\n"
        "Career status mapping (match case-insensitively; output these exact values):\n"
        '- "Currently in Industry" -> in_industry\n'
        '- "Seeking Opportunities" -> seeking_opportunities\n'
        '- "Student" -> student\n'
        '- "Career Break" -> career_break\n\n'
        "Rules:\n"
        "- Use empty string for unknown string fields.\n"
        "- Use [] for skills when not mentioned.\n"
        "- Prefer setting a filter rather than putting it in text_query.\n"
        "- Matching should be case-insensitive for the industry list and career status labels.\n"
        "- Keep capitalization as written in the query for text_query and skills when possible.\n\n"
        "Examples:\n"
        'Query: "people who went to Virginia Tech"\n'
        'JSON: {"text_query":"","industry":"","location":"","school":"Virginia Tech","career_status":"","skills":[]}\n'
        'Query: "women in data science in Seattle"\n'
        'JSON: {"text_query":"women","industry":"Data Science","location":"Seattle","school":"","career_status":"","skills":[]}\n'
        'Query: "student with python and react"\n'
        'JSON: {"text_query":"","industry":"","location":"","school":"","career_status":"student","skills":["Python","React"]}\n\n'
        f'Query: "{query}"\n'
        "JSON:"
    )


def _post_openrouter(payload: dict, api_key: str, app_url: str, app_name: str) -> dict:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if app_url:
        headers["HTTP-Referer"] = app_url
    if app_name:
        headers["X-Title"] = app_name

    req = urllib.request.Request(
        OPENROUTER_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            body = resp.read().decode("utf-8")
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8") if exc.fp else ""
        raise RuntimeError(f"OpenRouter HTTP {exc.code}: {error_body}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"OpenRouter request failed: {exc}") from exc

    return json.loads(body)


def _extract_json(content: str) -> dict:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start = content.find("{")
        end = content.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(content[start : end + 1])
        raise


def _fallback_parse(query: str) -> dict:
    lowered = query.lower()
    industry = ""
    for option in INDUSTRY_OPTIONS:
        if option.lower() in lowered:
            industry = option
            break

    career_status = ""
    for phrase, value in CAREER_STATUS_MAP.items():
        if phrase in lowered:
            career_status = value
            break

    school = ""
    for marker in ("went to", "at", "from"):
        if marker in lowered:
            after = query.lower().split(marker, 1)[1].strip()
            for stopper in (" and ", " who ", " with ", " in "):
                if stopper in after:
                    after = after.split(stopper, 1)[0].strip()
            school = after.title() if after else ""
            break

    return {
        "text_query": "",
        "industry": industry,
        "location": "",
        "school": school,
        "career_status": career_status,
        "skills": [],
    }


def parse_search_query(query: str) -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        # Fallback to basic parsing if API key not available
        return _fallback_parse(query)

    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")
    app_url = os.getenv("OPENROUTER_APP_URL", "")
    app_name = os.getenv("OPENROUTER_APP_NAME", "Aurelia")

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Return only JSON. No extra text."},
            {"role": "user", "content": _build_prompt(query)},
        ],
        "temperature": 0,
        "max_tokens": 300,
    }
    if os.getenv("OPENROUTER_JSON_MODE", "").strip() == "1":
        payload["response_format"] = {"type": "json_object"}
    data = _post_openrouter(payload, api_key, app_url, app_name)
    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )

    if not isinstance(content, str):
        content = json.dumps(content)
    if not content.strip():
        return _fallback_parse(query)

    try:
        return _extract_json(content)
    except json.JSONDecodeError:
        repair_payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": "Fix invalid JSON and return only valid JSON."},
                {
                    "role": "user",
                    "content": (
                        "Fix this to valid JSON. Preserve keys and values. "
                        "Return only JSON:\n\n"
                        f"{content}"
                    ),
                },
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0,
            "max_tokens": 300,
        }
        repair_data = _post_openrouter(repair_payload, api_key, app_url, app_name)
        repair_content = (
            repair_data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        if not isinstance(repair_content, str):
            repair_content = json.dumps(repair_content)
        if not repair_content.strip():
            return _fallback_parse(query)
        try:
            return _extract_json(repair_content)
        except json.JSONDecodeError:
            return _fallback_parse(query)


def _prepare_profile_summary(profile: dict) -> dict:
    return {
        "id": profile.get("id"),
        "location": profile.get("location") or "",
        "industry": profile.get("industry") or "",
        "custom_industry": profile.get("custom_industry") or "",
        "current_school": profile.get("current_school") or "",
        "career_status": profile.get("career_status") or "",
        "skills": profile.get("skills") or [],
        "bio": (profile.get("bio") or "")[:200],
    }


def _score_profile(user_profile: dict, candidate: dict) -> int:
    score = 0
    if user_profile.get("location") and candidate.get("location"):
        if user_profile["location"].lower() in candidate["location"].lower():
            score += 3
    user_industry = (user_profile.get("custom_industry") or user_profile.get("industry") or "").lower()
    cand_industry = (candidate.get("custom_industry") or candidate.get("industry") or "").lower()
    if user_industry and cand_industry and user_industry == cand_industry:
        score += 4
    if user_profile.get("current_school") and candidate.get("current_school"):
        if user_profile["current_school"].lower() == candidate["current_school"].lower():
            score += 4
    if user_profile.get("career_status") and candidate.get("career_status"):
        if user_profile["career_status"] == candidate["career_status"]:
            score += 2
    user_skills = set([s.lower() for s in (user_profile.get("skills") or [])])
    cand_skills = set([s.lower() for s in (candidate.get("skills") or [])])
    if user_skills and cand_skills:
        score += len(user_skills.intersection(cand_skills)) * 2
    return score


def recommend_profile_ids(user_profile: dict, candidates: list[dict]) -> list[str]:
    api_key = os.getenv("OPENROUTER_API_KEY")
    model = os.getenv("OPENROUTER_MODEL", "openai/gpt-oss-20b:free")
    app_url = os.getenv("OPENROUTER_APP_URL", "")
    app_name = os.getenv("OPENROUTER_APP_NAME", "Aurelia")

    candidates = candidates[:50]
    if not candidates:
        return []

    if not api_key:
        return [c["id"] for c in sorted(candidates, key=lambda p: _score_profile(user_profile, p), reverse=True)]

    user_summary = _prepare_profile_summary(user_profile)
    candidate_summaries = [_prepare_profile_summary(c) for c in candidates]

    prompt = (
        "You are ranking professional profiles for a user. Return ONLY valid JSON.\n\n"
        "Return format:\n"
        '{"ranked_ids": ["id1","id2","id3"]}\n\n'
        "Rank by best overall match considering location, school, industry, career_status, and skills.\n"
        "If ties, prefer same industry and overlapping skills.\n\n"
        f"User profile:\n{json.dumps(user_summary)}\n\n"
        f"Candidate profiles:\n{json.dumps(candidate_summaries)}\n\n"
        "JSON:"
    )

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Return only JSON. No extra text."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0,
        "max_tokens": 300,
    }
    if os.getenv("OPENROUTER_JSON_MODE", "").strip() == "1":
        payload["response_format"] = {"type": "json_object"}

    try:
        data = _post_openrouter(payload, api_key, app_url, app_name)
        content = (
            data.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
        )
        if not isinstance(content, str):
            content = json.dumps(content)
        if not content.strip():
            raise ValueError("Empty OpenRouter response")
        parsed = _extract_json(content)
        ranked_ids = parsed.get("ranked_ids", [])
        if not isinstance(ranked_ids, list) or not ranked_ids:
            raise ValueError("Invalid ranked_ids")
        valid = {c["id"] for c in candidates}
        filtered = [rid for rid in ranked_ids if rid in valid]
        if filtered:
            return filtered
    except Exception:
        pass

    return [c["id"] for c in sorted(candidates, key=lambda p: _score_profile(user_profile, p), reverse=True)]
