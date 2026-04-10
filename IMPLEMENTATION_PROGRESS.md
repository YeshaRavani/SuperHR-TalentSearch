# Implementation Progress - Talent Search Backend

## Summary

- Non-AI endpoints expected in this repo: 32/32 implemented
- AI endpoints currently identified: 3/3 implemented at baseline level
- AI evaluation coverage: 3/3 endpoints have sample benchmark cases in `backend/evals/fixtures/ai_endpoints.json`
- Full deployment readiness: not complete

## Endpoint Status

| Endpoint | Category | Status | Notes |
|----------|----------|--------|-------|
| `POST /api/signup` | Auth | implemented | |
| `POST /api/login` | Auth | implemented | |
| `POST /api/logout` | Auth | implemented | Stateless logout |
| `GET /api/user` | Auth | implemented | |
| `GET /api/opportunities` | Opportunities | implemented | |
| `GET /api/opportunities/{id}` | Opportunities | implemented | |
| `POST /api/opportunities` | Opportunities | implemented | |
| `GET /api/my-posted-opportunities` | Opportunities | implemented | |
| `POST /api/interested-opportunities` | Engagement | implemented | |
| `GET /api/interested-opportunities` | Engagement | implemented | Added in current review pass |
| `DELETE /api/interested-opportunities/{id}` | Engagement | implemented | |
| `POST /api/applications` | Engagement | implemented | |
| `GET /api/applications` | Engagement | implemented | |
| `PUT /api/applications/{id}` | Engagement | implemented | |
| `POST /api/invitations` | Invitations | implemented | Added in current review pass |
| `GET /api/invitations` | Invitations | implemented | Added in current review pass |
| `PUT /api/invitations/{id}` | Invitations | implemented | Added in current review pass |
| `GET /api/admin/users` | Admin | implemented | |
| `POST /api/admin/users` | Admin | implemented | |
| `PUT /api/admin/users/{id}` | Admin | implemented | |
| `DELETE /api/admin/users/{id}` | Admin | implemented | |
| `GET /api/opportunities/{id}/applicants` | Admin | implemented | |
| `GET /api/chat/channels` | Community | implemented | |
| `GET /api/chat/channels/{id}/messages` | Community | implemented | |
| `POST /api/chat/channels/{id}/messages` | Community | implemented | |
| `GET /api/chat/direct-messages/{user_id}` | Community | implemented | Added in current review pass |
| `POST /api/chat/direct-messages` | Community | implemented | Added in current review pass |
| `GET /api/community/members` | Community | implemented | |
| `GET /api/users/search` | Community | implemented | Added in current review pass |
| `GET /api/admin/reward-policy` | Admin | implemented | |
| `PUT /api/admin/reward-policy` | Admin | implemented | |
| `GET /api/rewards/me` | User | implemented | Added in current review pass |
| `GET /api/ai/match` | AI | implemented | Baseline deterministic recommender |
| `GET /api/ai/suggestions` | AI | implemented | Baseline personalized suggestions |
| `POST /api/ai/chat` | AI | implemented | Added in current review pass |

## AI Benchmark Coverage

Each AI endpoint now has:

- Sample input and expected signals in `backend/evals/fixtures/ai_endpoints.json`
- An eval runner in `backend/evals/run_ai_evals.py`
- LLM-as-judge support via `OPENAI_API_KEY` and `OPENAI_MODEL`
- A heuristic fallback judge for offline local validation

## Deployment Gaps

The backend is functionally broad enough for a demo, but full deployment still needs:

- A locked dependency manifest such as `requirements.txt`
- Environment-based configuration for secrets, DB URL, CORS origins, and model provider settings
- Automated API tests beyond the current AI logic smoke tests
- Production serving config such as Dockerfile, process manager, and deployment target configuration
- Auth hardening, password/seed consistency cleanup, and stricter role/access checks
