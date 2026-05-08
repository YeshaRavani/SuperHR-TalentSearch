# Implementation Progress - Talent Search Backend

## Summary

- Total backend API routes currently identified: 54
- Non-AI API routes currently identified: 48
- AI API routes currently identified: 6
- Core contributor, admin, opportunity, community, reward, notification, and AI assistant flows are implemented at demo level
- Full deployment readiness: not complete

The backend is no longer limited to the original baseline endpoint list. It now includes expanded admin dashboards, organisation-scoped admin access, richer community messaging, notification APIs, AI chat, AI opportunity parsing, skill extraction, and audio transcription.

## Current Implementation Status

| Area | Status | Notes |
|------|--------|-------|
| Authentication | implemented | Signup, login, logout, current user, profile update, organisation list, notifications |
| Organisation scoping | implemented | Admin-facing pages are scoped to authenticated admin organisation |
| Opportunities | implemented | Browse, detail, create, delete, posted opportunities |
| Interest/application flow | implemented | Interested, apply, update application status, invitations |
| Admin management | implemented | Users, user profiles, opportunities, dashboard, reward policy, system settings |
| Community chat | implemented | Channels, messages, direct messages, unread/read support, user search |
| Rewards | implemented | Contributor reward summary and admin reward policy |
| AI assistant | implemented | Role-aware/platform-aware assistant with runtime context |
| AI opportunity drafting | implemented | Natural language parse endpoint with Groq path and fallback parser |
| AI skill extraction | implemented | Resume upload skill extraction endpoint |
| AI transcription | implemented | Audio upload transcription endpoint |
| AI eval coverage | partial | Eval fixture covers match, suggestions, and multiple chat scenarios; parse/extract/transcribe still need formal eval cases |
| Deployment readiness | incomplete | Needs config hardening, dependency lock, migration handling, and production setup |

## Endpoint Inventory

### Auth and User

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/organisations` | implemented | Lists organisations created by admin users for contributor signup dropdown |
| `POST /api/signup` | implemented | Admins can create organisations; contributors must select approved organisation |
| `POST /api/login` | implemented | Username or email login with bearer token |
| `GET /api/user` | implemented | Returns authenticated user |
| `PUT /api/user` | implemented | Updates profile fields and skills |
| `GET /api/notifications` | implemented | Role-aware notification summary for contributors/admins |
| `POST /api/logout` | implemented | Stateless logout response |

### Opportunities

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/opportunities` | implemented | Lists active opportunities with organisation/visibility logic |
| `GET /api/opportunities/{id}` | implemented | Returns opportunity detail |
| `POST /api/opportunities` | implemented | Creates opportunity and associated skills/channel data |
| `GET /api/my-posted-opportunities` | implemented | Lists opportunities created by authenticated user |
| `DELETE /api/opportunities/{id}` | implemented | Removes opportunity with author/admin permission checks |

### Interest, Applications, and Invitations

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/interested-opportunities` | implemented | Marks interest; protects against invalid self-interest cases |
| `GET /api/interested-opportunities` | implemented | Lists user's interested opportunities |
| `DELETE /api/interested-opportunities/{id}` | implemented | Removes interest record |
| `POST /api/applications` | implemented | Applies to opportunity |
| `GET /api/applications` | implemented | Lists user application records |
| `PUT /api/applications/{id}` | implemented | Updates application/enrollment/rejection status |
| `POST /api/invitations` | implemented | Creates collaboration invitation |
| `GET /api/invitations` | implemented | Lists sent/received invitations |
| `PUT /api/invitations/{id}` | implemented | Updates invitation status |

### Admin

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/admin/users` | implemented | Organisation-scoped user list |
| `GET /api/admin/users/{id}/profile` | implemented | Organisation-scoped detailed user profile for admin inspection |
| `POST /api/admin/users` | implemented | Creates user under admin organisation |
| `PUT /api/admin/users/{id}` | implemented | Updates user inside admin organisation |
| `DELETE /api/admin/users/{id}` | implemented | Deletes user inside admin organisation |
| `GET /api/opportunities/{id}/applicants` | implemented | Applicant records for author/admin |
| `GET /api/opportunities/{id}/applicants/overview` | implemented | Applicant counts and AI match score details |
| `GET /api/admin/reward-policy` | implemented | Returns active reward policy |
| `PUT /api/admin/reward-policy` | implemented | Updates reward policy |
| `GET /api/admin/system-settings` | implemented | Returns admin system settings |
| `PUT /api/admin/system-settings` | implemented | Updates admin system settings |
| `GET /api/admin/opportunities` | implemented | Organisation-scoped admin opportunity list |
| `GET /api/admin/opportunities/overview` | implemented | Organisation-scoped opportunity engagement overview |
| `GET /api/admin/dashboard` | implemented | Organisation-scoped dashboard metrics, skills, growth, activity |

### Community and Messaging

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/chat/channels` | implemented | Lists channels based on role and user engagement |
| `GET /api/chat/channels/{id}/messages` | implemented | Channel message history |
| `GET /api/chat/channels/{id}/messages/overview` | implemented | Serialized channel messages with sender metadata |
| `POST /api/chat/channels/{id}/messages` | implemented | Posts channel message with broadcast/opportunity permissions |
| `PATCH /api/chat/channels/{channel_id}/broadcast` | implemented | Toggles broadcast mode for owner/admin |
| `DELETE /api/chat/channels/{channel_id}` | implemented | Deletes channel with owner/admin/global-channel rules |
| `GET /api/chat/direct-messages/{user_id}` | implemented | Direct message history |
| `GET /api/chat/direct-messages/{user_id}/overview` | implemented | Direct message history with sender/receiver metadata |
| `POST /api/chat/direct-messages` | implemented | Sends direct message |
| `GET /api/community/members` | implemented | Lists active members |
| `GET /api/chat/dm-sidebar` | implemented | Direct message sidebar with unread counts and latest message time |
| `POST /api/chat/direct-messages/{user_id}/read` | implemented | Marks direct messages from a user as read |
| `GET /api/users/search` | implemented | Searches users by name, username, organisation, or team |

### Rewards

| Endpoint | Status | Notes |
|----------|--------|-------|
| `GET /api/rewards/me` | implemented | Returns contributor reward summary |

### AI

| Endpoint | Status | Notes |
|----------|--------|-------|
| `POST /api/ai/parse-opportunity` | implemented | Parses natural language opportunity text into editable structured form fields; uses Groq with fallback parser |
| `GET /api/ai/match` | implemented | Ranks opportunities for the current user |
| `GET /api/ai/suggestions` | implemented | Returns personalized platform suggestions |
| `POST /api/ai/chat` | implemented | Platform-aware assistant with role, organisation, opportunity, interest, application, invitation, and community context |
| `POST /api/ai/extract-skills` | implemented | Extracts skills from uploaded resume text using resume parser and Groq |
| `POST /api/ai/transcribe` | implemented | Transcribes uploaded audio through Groq transcription |

## AI Implementation Detail

### AI assistant context

`POST /api/ai/chat` now receives runtime context including:

- authenticated/guest state,
- role,
- organisation,
- visible opportunity count,
- application count,
- interested opportunity count,
- posted opportunity count,
- pending invitation count,
- community channels,
- and admin organisation metrics when the user is an admin.

This makes the assistant platform-aware instead of only returning generic responses.

### AI opportunity parsing

`POST /api/ai/parse-opportunity` supports the opportunity drafting flow:

1. user describes an opportunity in natural language,
2. backend asks Groq to return structured JSON,
3. missing fields are filled with deterministic fallback parsing,
4. frontend can open the posting page with editable prefilled fields.

The fallback parser currently extracts:

- title,
- location,
- points,
- schedule,
- time commitment,
- skills,
- description,
- and normalized type `Opportunity`.

### AI resume skill extraction

`POST /api/ai/extract-skills` accepts an uploaded resume file, parses text, and asks Groq to return a flat list of professional skills.

This endpoint exists, but profile setup/AI resume mapping is being handled separately by another group member, so integration risk should be coordinated before changing that flow.

### AI transcription

`POST /api/ai/transcribe` accepts uploaded audio, writes it temporarily, sends it to Groq transcription, and returns text.

The chatbot also has browser speech-to-text on the frontend. This backend transcription endpoint is separate and useful for uploaded audio flows.

## Evaluation and Test Coverage

### Current AI eval coverage

`backend/evals/fixtures/ai_endpoints.json` currently includes benchmark scenarios for:

- `GET /api/ai/match`
- `GET /api/ai/suggestions`
- multiple `POST /api/ai/chat` scenarios, including recommendations, rewards, community, admin tools, platform overview, and out-of-scope questions

### Current automated tests

Current backend tests include:

- AI logic tests in `backend/tests/test_ai_logic.py`
- AI router smoke test in `backend/tests/test_ai_router.py`

### Missing AI coverage

Formal eval/test cases are still needed for:

- `POST /api/ai/parse-opportunity`
- `POST /api/ai/extract-skills`
- `POST /api/ai/transcribe`

Recommended parse-opportunity tests:

- normal opportunity prompt with title, skills, points, and time commitment,
- typo-heavy prompt where intent is still clear,
- sparse prompt requiring fallback defaults,
- prompt with location and schedule extraction.

## Known Technical Gaps

### Database migration gap

The project currently uses SQLite and SQLAlchemy models, but there is no formal migration system. When models gain columns such as chat metadata, an older `database.db` can fail with errors like:

- missing `Channels.opportunity_id`
- missing `Messages.is_read`

This should be fixed with one of:

- Alembic migrations,
- a controlled local migration script,
- or a documented database reset/reseed flow for demo environments.

### Deployment gaps

The backend is broad enough for a demo, but production readiness still needs:

- locked dependency manifest,
- environment-based secrets and configuration,
- CORS origin hardening,
- provider configuration for Groq/OpenAI-style services,
- production database setup,
- migration strategy,
- Docker or deployment process config,
- stronger auth/session hardening,
- and broader endpoint tests.

### API robustness gaps

Recommended next backend hardening work:

- add tests for admin organisation scoping,
- add tests for self-apply/self-interest restrictions,
- add tests for community unread/read flows,
- validate file upload limits and supported file types,
- validate AI endpoint failure behavior,
- document required environment variables.

## Overall Status

Talent Search is now a backend-connected demo product with a broad endpoint surface. The main implemented strengths are:

- contributor opportunity journey,
- posting and applicant management,
- organisation-scoped admin management,
- community messaging,
- reward visibility,
- notifications,
- platform-aware AI assistant,
- AI opportunity drafting,
- and AI skill/audio support.

The biggest remaining engineering risks are database schema migration, production configuration, and test coverage depth.
