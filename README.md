# 📸 PhotoShare
<img width="1470" height="956" alt="Screenshot 2026-09-09 at 7 05 32 PM" src="https://github.com/user-attachments/assets/be457a3a-33b3-4ffe-9830-dbe433cf2b20" />


### Full-Stack Photography Team & Client Gallery Platform

PhotoShare is a full-stack web application designed for photography teams to upload, organize, review, select, and securely share event photographs with customers.

The platform provides separate access for **Admins, Team Members, and Customers**, with role-based authorization and PIN-protected customer galleries.

---

# ✨ Features

## 👨‍💼 Admin
<img width="1470" height="956" alt="Screenshot 2026-09-09 at 7 05 59 PM" src="https://github.com/user-attachments/assets/432705e8-3098-47ee-a33b-760b5ddf469f" />


* Register and login
* Create and manage events
* Add and remove team members
* Assign team members to events
* View uploaded photos
* Review and select photos
* Create galleries
* Publish galleries
* Generate shareable gallery links
* Set gallery PINs

## 📸 Team Member
<img width="1470" height="956" alt="Screenshot 2026-09-09 at 7 06 22 PM" src="https://github.com/user-attachments/assets/00beb810-8f44-41fd-a26a-8e447433774e" />


* Secure login
* View assigned events
* Upload multiple photos
* View uploaded photos
* Access only assigned events
* Cannot publish galleries
* Cannot manage other users' photos

## 👤 Customer
<img width="2940" height="1912" alt="image" src="https://github.com/user-attachments/assets/a59ac041-bc29-4e78-849a-eb2aa4d94ff0" />


* No account required
* Access gallery through a shareable link
* Enter gallery PIN
* View published photos only
* Cannot access unpublished galleries

---

# 🔄 Application Workflow

```text
Admin creates an event
        ↓
Admin assigns team members
        ↓
Team members upload photos
        ↓
Admin reviews uploaded photos
        ↓
Admin selects photos
        ↓
Admin creates and publishes gallery
        ↓
Customer receives gallery link + PIN
        ↓
Customer enters PIN
        ↓
Customer views published photos
```

---

# 🏗️ Architecture

```text
                 ┌──────────────────────┐
                 │   React + Vite       │
                 │      Frontend        │
                 └──────────┬───────────┘
                            │
                         REST API
                            │
                            ▼
                 ┌──────────────────────┐
                 │   FastAPI Backend    │
                 │   Authentication     │
                 │   Authorization      │
                 │   Business Logic     │
                 └──────────┬───────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
        ┌─────────────────┐    ┌─────────────────┐
        │   PostgreSQL    │    │   Cloudinary    │
        │    Database     │    │  Image Storage  │
        └─────────────────┘    └─────────────────┘
```

---

# 🛠️ Technology Stack

| Category             | Technology                |
| -------------------- | ------------------------- |
| Frontend             | React, Vite, Tailwind CSS |
| Routing              | React Router              |
| API Client           | Axios                     |
| Backend              | Python, FastAPI           |
| Database             | PostgreSQL                |
| ORM                  | SQLAlchemy                |
| Validation           | Pydantic                  |
| Authentication       | JWT                       |
| Password/PIN Hashing | bcrypt                    |
| Image Storage        | Cloudinary                |
| Testing              | Pytest                    |
| Deployment           | Render                    |
| Version Control      | GitHub                    |

---

# 🔐 Security

* JWT-based authentication
* Role-based authorization
* bcrypt password and PIN hashing
* Event membership validation
* Photo access restrictions
* Backend-enforced authorization
* Customer access only to published galleries
* Environment variables for sensitive configuration
* Unauthorized event access protection
* Gallery PIN validation

---

# 🗄️ Data Storage

PostgreSQL stores application data and photo metadata.

Cloudinary stores the actual image files.

## Photo Metadata

Each uploaded photo stores information such as:

* Photo ID
* Event ID
* Uploaded By
* Filename
* Storage Location
* File Size
* Created At
* Selection Status

---

# 🌐 Live Application

## Frontend

https://photoshare-frontend.onrender.com

## Backend API

https://photoshare-backend-ieke.onrender.com

## API Documentation

https://photoshare-backend-ieke.onrender.com/docs

---

# 🚀 Local Setup

## Prerequisites

Make sure the following are installed:

* Python 3
* Node.js
* npm
* PostgreSQL
* Git
* Cloudinary account

---

# ⚙️ Backend Setup

Open a terminal:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

## Backend

```text
http://localhost:8000
```

## API Documentation

```text
http://localhost:8000/docs
```

---

# 💻 Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Frontend

```text
https://photoshare-frontend.onrender.com/team/dashboard
```

---

# 🔑 Environment Variables

Configure the required variables in `.env`.

```env
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> ⚠️ **Never commit real credentials, API keys, database URLs, or secrets to GitHub.**

---

# 📡 API

The backend provides REST APIs for:

* Authentication
* User registration
* User login
* Event management
* Team member assignment
* Photo uploads
* Photo management
* Gallery creation
* Gallery publishing
* Gallery access
* Gallery PIN verification

Interactive API documentation is available through FastAPI Swagger UI:

https://photoshare-backend-ieke.onrender.com/docs

---

# 🧪 Testing

Run backend tests:

```bash
cd backend
pytest -v
```

## Testing Covers

* Authentication
* Invalid authentication
* Role-based authorization
* Event access
* Unauthorized event access
* Photo upload authorization
* Gallery creation
* Gallery publishing
* Incorrect gallery PIN
* Correct gallery PIN
* Customer access to published photos

---

# 📋 Internship Challenge Requirements

| Requirement                | Status |
| -------------------------- | :----: |
| Admin Registration/Login   |    ✅   |
| Event Creation             |    ✅   |
| Team Member Assignment     |    ✅   |
| Team Member Login          |    ✅   |
| Assigned Event Access      |    ✅   |
| Multiple Photo Upload      |    ✅   |
| Cloud/Object Photo Storage |    ✅   |
| Photo Metadata             |    ✅   |
| Admin Photo Review         |    ✅   |
| Photo Selection            |    ✅   |
| Gallery Creation           |    ✅   |
| Gallery Publishing         |    ✅   |
| Shareable Gallery Link     |    ✅   |
| PIN-Protected Gallery      |    ✅   |
| Customer Without Account   |    ✅   |
| Role-Based Authorization   |    ✅   |
| Input Validation           |    ✅   |
| Error Handling             |    ✅   |
| Cloud Deployment           |    ✅   |

---

# 👥 User Roles

## Admin

The Admin has complete control over events, team assignments, photos, and galleries.

```text
Admin
 ├── Create Events
 ├── Manage Team
 ├── Review Photos
 ├── Select Photos
 ├── Create Gallery
 └── Publish Gallery
```

## Team Member

Team Members can work only with events assigned to them.

```text
Team Member
 ├── Login
 ├── View Assigned Events
 ├── Upload Photos
 └── View Own Uploads
```

## Customer

Customers do not need an account.

```text
Customer
 ├── Open Gallery Link
 ├── Enter PIN
 └── View Published Photos
```

---

# 🔒 Access Control

PhotoShare follows **role-based access control (RBAC)**.

## Admin

### Can

* Manage events
* Assign team members
* Review photos
* Select photos
* Create galleries
* Publish galleries

## Team Member

### Can

* Access assigned events
* Upload photos
* View their uploads

### Cannot

* Publish galleries
* Manage events
* Manage other users' photos

## Customer

### Can

* Access a valid gallery link
* Enter the correct gallery PIN
* View published photos

### Cannot

* Access unpublished galleries
* Access protected admin functionality
* Upload or manage photos

---

# ☁️ Deployment

The application is deployed using **Render**.

## Frontend

```text
React + Vite
      ↓
Render Static Site
```

## Backend

```text
FastAPI
   ↓
Render Web Service
```

## Database

```text
PostgreSQL
    ↓
Render PostgreSQL
```

## Image Storage

```text
Uploaded Photos
       ↓
Cloudinary
```

---

# 📁 Project Structure

```text
Trizen-Internship-Task/
│
├── backend/
│   ├── app/
│   │   ├── auth/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── .env.example
│
├── PhotoShare_Postman_Collection.json
├── README.md
├── render.yaml
└── .gitignore
```

---

# ⚠️ Error Handling

The application handles important security and access scenarios, including:

* Invalid login credentials
* Unauthorized event access
* Unauthorized photo access
* Team members attempting restricted operations
* Failed photo uploads
* Invalid gallery PIN
* Unpublished gallery access
* Invalid gallery links

---

# ⚠️ Known Limitations

* Advanced gallery analytics are not currently included.
* Audit logging is not currently implemented.
* Professional RAW image formats may require conversion.
* Additional features can be added in future versions.

---

# 🚀 Future Enhancements

Possible future improvements include:

* Gallery download functionality
* Advanced search and filtering
* Photo tagging
* Image compression
* Watermarking
* Gallery analytics
* Audit logs
* Email notifications
* Social sharing
* Cloud-based background processing
* Advanced image recognition

---

# 📌 Project Goals

The main goals of PhotoShare are:

1. Provide secure authentication for different user roles.
2. Allow photography teams to manage event photos.
3. Restrict team members to their assigned events.
4. Allow Admins to review and publish selected photos.
5. Provide customers with secure PIN-protected galleries.
6. Store images securely using cloud object storage.
7. Provide a responsive and easy-to-use interface.
8. Demonstrate a complete full-stack cloud deployment.

---

# 👨‍💻 Author

## Gangadhar Reddy

**Full-Stack / AI & Data Science Student**

### GitHub

https://github.com/gangadharreddy-dev

---

# 📄 Project Information

| Details    | Information                     |
| ---------- | ------------------------------- |
| Project    | PhotoShare                      |
| Type       | Full-Stack Web Application      |
| Purpose    | Full-Stack Internship Challenge |
| Frontend   | React + Vite                    |
| Backend    | FastAPI                         |
| Database   | PostgreSQL                      |
| Storage    | Cloudinary                      |
| Deployment | Render                          |

---

# ⭐ Internship Challenge Submission

Developed as a **Full-Stack Internship Challenge submission**.

PhotoShare demonstrates a complete full-stack application with authentication, role-based authorization, event management, photo uploads, cloud storage, photo review, gallery publishing, PIN-protected customer access, automated testing, and cloud deployment.
