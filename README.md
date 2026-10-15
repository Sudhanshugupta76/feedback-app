# Feedback Portal

A feedback portal with a React frontend and a Spring Boot backend. Users can register, sign in, and submit or edit their own feedback. Admins can view, add, edit, and delete feedback.

## Project structure

- `feedback-app/backend` — Spring Boot REST API and MySQL persistence
- `feedback-app/frontend` — React application built with Vite

## Requirements

- Java 25
- Maven
- Node.js and npm
- MySQL

## Run locally

### 1. Configure the database

Start MySQL and configure the connection in `feedback-app/backend/src/main/resources/application.properties`. The default settings use the `root` user and create the `feedback_db` database automatically. Set your database password locally; do not commit credentials.

### 2. Start the backend

From the repository root:

```powershell
cd feedback-app\backend
mvn spring-boot:run
```

The API starts at `http://localhost:8080`.

### 3. Start the frontend

In a second terminal, from the repository root:

```powershell
cd feedback-app\frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Default admin account

- Username: `admin`
- Password: `admin123`

Change the default password and use suitable authentication before deploying this application publicly.

## API overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register an account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/feedback/me` | Get the signed-in user's feedback |
| `POST` | `/api/feedback/me` | Submit feedback |
| `PUT` | `/api/feedback/me` | Edit the signed-in user's feedback |
| `GET` | `/api/admin/feedback` | List all feedback (admin) |
| `POST` | `/api/admin/feedback` | Add feedback (admin) |
| `GET` | `/api/admin/feedback/{id}` | Get feedback (admin) |
| `PUT` | `/api/admin/feedback/{id}` | Edit feedback (admin) |
| `DELETE` | `/api/admin/feedback/{id}` | Delete feedback (admin) |

Feedback and admin endpoints expect the `X-User-Id` request header.
