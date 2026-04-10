import json
import os
from pathlib import Path
import sys
from typing import Any
from urllib import error, request

ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.services.ai_logic import answer_platform_question, build_personalized_suggestions, get_ranked_matches, groq_aided_chat


FIXTURES_PATH = Path(__file__).with_name("fixtures") / "ai_endpoints.json"


class EvalUser:
    def __init__(self, **kwargs: Any):
        self.id = kwargs.get("id", "eval-user")
        self.full_name = kwargs.get("full_name", "Eval User")
        self.role = kwargs.get("role", "contributors")
        self.organisation = kwargs.get("organisation")
        self.department_team = kwargs.get("department_team")
        self.total_points = kwargs.get("total_points", 32)


class EvalOpportunity:
    def __init__(self, **kwargs: Any):
        self.id = kwargs["id"]
        self.title = kwargs["title"]
        self.short_description = kwargs.get("short_description", "")
        self.full_description = kwargs.get("full_description", "")
        self.expectations = kwargs.get("expectations", "")
        self.location = kwargs.get("location", "Remote")
        self.status = kwargs.get("status", "active")
        self.created_at = kwargs.get("created_at", "2026-01-01T00:00:00")


DEFAULT_OPPORTUNITIES = [
    EvalOpportunity(
        id="py-automation",
        title="Python Automation Project",
        short_description="Automate internal workflows using Python scripts.",
        full_description="Create cron jobs and reduce manual entry work.",
        expectations="Python, automation, APIs, documentation",
    ),
    EvalOpportunity(
        id="py-api",
        title="Backend API Development",
        short_description="Build scalable backend services.",
        full_description="Outline endpoints and database access layers.",
        expectations="Python, REST APIs, databases",
    ),
    EvalOpportunity(
        id="ux-research",
        title="UX Research Sprint",
        short_description="Interview users and synthesize findings.",
        full_description="Support design research and service improvements.",
        expectations="UX research, interviews, design thinking",
    ),
]


def evaluate_case(case: dict[str, Any]) -> dict[str, Any]:
    user = EvalUser(**case["user_profile"])
    endpoint = case["endpoint"]

    if endpoint == "GET /api/ai/match":
        actual_output = [opportunity.title for opportunity in get_ranked_matches(user, DEFAULT_OPPORTUNITIES)]
    elif endpoint == "GET /api/ai/suggestions":
        actual_output = build_personalized_suggestions(user, DEFAULT_OPPORTUNITIES)
    elif endpoint == "POST /api/ai/chat":
        reply, sources, actions = groq_aided_chat(case["input"]["message"], user, DEFAULT_OPPORTUNITIES)
        actual_output = {
            "reply": reply,
            "sources": sources,
            "suggested_actions": actions,
        }
    else:
        raise ValueError(f"Unsupported endpoint fixture: {endpoint}")

    judge = llm_judge(case, actual_output)
    return {
        "endpoint": endpoint,
        "scenario": case["scenario"],
        "pass": judge["pass"],
        "score": judge["score"],
        "judge_mode": judge["mode"],
        "summary": judge["summary"],
        "actual_output": actual_output,
    }


def llm_judge(case: dict[str, Any], actual_output: Any) -> dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
    prompt = (
        "You are evaluating an AI endpoint for product quality.\n"
        f"Endpoint: {case['endpoint']}\n"
        f"Scenario: {case['scenario']}\n"
        f"Expected signals: {case['expected_signals']}\n"
        f"Rubric: {case['judge_rubric']}\n"
        f"Actual output: {json.dumps(actual_output, ensure_ascii=True)}\n"
        'Return compact JSON with keys pass (boolean), score (0-1), summary (string).'
    )

    if api_key:
        try:
            payload = json.dumps(
                {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a strict but fair QA evaluator."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0,
                    "response_format": {"type": "json_object"},
                }
            ).encode("utf-8")
            req = request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=payload,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            with request.urlopen(req, timeout=30) as response:
                data = json.loads(response.read().decode("utf-8"))
            message = data["choices"][0]["message"]["content"]
            parsed = json.loads(message)
            return {
                "pass": bool(parsed["pass"]),
                "score": float(parsed["score"]),
                "summary": parsed["summary"],
                "mode": f"llm_judge:{model}",
            }
        except (error.URLError, KeyError, json.JSONDecodeError, TimeoutError, ValueError):
            pass

    haystack = json.dumps(actual_output).lower()
    matched = sum(1 for signal in case["expected_signals"] if signal.lower() in haystack)
    score = round(matched / max(len(case["expected_signals"]), 1), 2)
    return {
        "pass": score >= 0.34,
        "score": score,
        "summary": f"Heuristic fallback matched {matched} of {len(case['expected_signals'])} expected signals.",
        "mode": "heuristic_fallback",
    }


def main() -> None:
    cases = json.loads(FIXTURES_PATH.read_text())
    results = [evaluate_case(case) for case in cases]
    passed = sum(1 for result in results if result["pass"])
    print(json.dumps({"passed": passed, "total": len(results), "results": results}, indent=2))


if __name__ == "__main__":
    main()
