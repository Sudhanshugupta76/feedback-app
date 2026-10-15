# Feedback Portal (React + Spring Boot + MySQL)

## 1. Backend
- Install Java 25 (LTS), Maven, MySQL.
- Edit `backend/src/main/resources/application.properties` -> set your MySQL password.
- Run:  cd backend && mvn spring-boot:run   (http://localhost:8080)
- Database `feedback_db` and tables are auto-created.
- Default admin: username `admin` / password `admin123`

## 2. Frontend
  cd frontend && npm install && npm run dev   (http://localhost:5173)

## Flow
Register -> Login -> user: Add / Edit own feedback (one per user)
Login as admin -> dashboard with View / Edit / Delete / Add (CRUD)

## API
POST /api/auth/register, /api/auth/login
GET|POST|PUT /api/feedback/me        (header X-User-Id)
GET|POST /api/admin/feedback, GET|PUT|DELETE /api/admin/feedback/{id}   (admin only)
