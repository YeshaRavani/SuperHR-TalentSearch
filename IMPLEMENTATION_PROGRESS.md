# Implementation Progress - Talent Search Backend

| Endpoint | Category | Frontend Screen | Status | Swagger Tested | Notes |
|----------|----------|-----------------|--------|----------------|-------|
| `POST /api/signup` | Auth | `signup.html` | implemented | yes | |
| `POST /api/login` | Auth | `login.html` | implemented | yes | |
| `POST /api/logout` | Auth | - | implemented | yes | |
| `GET /api/user` | Auth | `dashboard.html` | implemented | yes | |
| `GET /api/opportunities` | Opportunities | `opportunities.html` | implemented | yes | |
| `GET /api/opportunities/{id}` | Opportunities | `event-detail.html` etc. | implemented | yes | |
| `POST /api/opportunities` | Opportunities | `add-opportunity.html` | implemented | yes | |
| `GET /api/my-posted-opportunities` | Opportunities | `posted-opportunities.html` | implemented | yes | |
| `POST /api/interested-opportunities` | Engagement | `opportunities.html` | implemented | yes | |
| `GET /api/interested-opportunities` | Engagement | `interested.html` | implemented | yes | |
| `DELETE /api/interested-opportunities/{id}` | Engagement | `interested.html` | implemented | yes | |
| `POST /api/applications` | Engagement | `event-detail.html` | implemented | yes | |
| `GET /api/applications` | Engagement | `contributor-profile.html` | implemented | yes | |
| `PUT /api/applications/{id}` | Engagement | `admin-applicants.html` | implemented | yes | |
| `POST /api/invitations` | Invitations | `appointment.html` | not_started | no | |
| `GET /api/invitations` | Invitations | `appointment.html` | not_started | no | |
| `PUT /api/invitations/{id}` | Invitations | `appointment.html` | not_started | no | |
| `GET /api/admin/users` | Admin | `admin-manage-users.html` | implemented | yes | |
| `POST /api/admin/users` | Admin | `admin-manage-users.html` | implemented | yes | |
| `PUT /api/admin/users/{id}` | Admin | `admin-manage-users.html` | implemented | yes | |
| `PUT /api/admin/users/{id}/role` | Admin | `admin-manage-users.html` | implemented | yes | |
| `DELETE /api/admin/users/{id}` | Admin | `admin-manage-users.html` | implemented | yes | |
| `GET /api/opportunities/{id}/applicants` | Admin | `admin-applicants.html` | implemented | yes | |
| `GET /api/chat/channels` | Community | `community.html` | not_started | no | |
| `GET /api/chat/channels/{id}/messages` | Community | `community.html` | not_started | no | |
| `POST /api/chat/channels/{id}/messages` | Community | `community.html` | not_started | no | |
| `GET /api/chat/direct-messages/{user_id}` | Community | `community.html` | not_started | no | |
| `POST /api/chat/direct-messages` | Community | `community.html` | not_started | no | |
| `GET /api/community/members` | Community | `community.html` | not_started | no | |
| `GET /api/users/search` | Community | `community.html` | not_started | no | |
| `GET /api/admin/reward-policy` | Admin | `admin-manage-users.html` | not_started | no | |
| `PUT /api/admin/reward-policy` | Admin | `admin-manage-users.html` | not_started | no | |
| `GET /api/rewards/me` | User | `dashboard.html` | not_started | no | |
| `POST /api/ai/chat` | AI | `chatbot.js` | not_started | no | Stub for now |
