# 📸 PhotoShare

### Full-Stack Photography Team & Client Gallery Platform

PhotoShare is a full-stack web application designed for photography teams, studios, and event photographers to collaboratively upload, organize, curate, and securely share event photographs with clients.

The platform provides a complete workflow:

**Admin creates an event → Assigns team members → Team members upload photos → Admin reviews and selects photos → Admin publishes a private gallery → Customer accesses the gallery using a shareable link and PIN.**

Customers do not need to create an account.

---

## ✨ Features

### 👨‍💼 Admin / Lead

* Register and log in securely
* Create and manage photography events
* Add and remove team members from events
* View all photographs uploaded for an event
* Review photographs uploaded by different team members
* Select and deselect photographs for publication
* View the number of selected and uploaded photographs
* Create and publish a customer gallery
* Generate a unique shareable gallery URL
* Configure a gallery access PIN
* Control gallery publishing status

### 📸 Team Member

* Secure login
* View only assigned events
* Upload multiple photographs
* View uploaded photographs
* View their own uploaded photo library
* Upload validation and error handling

Team members cannot:

* Access unassigned events
* Publish galleries
* Manage other users' photographs
* Perform Admin-only operations

### 👤 Customer

Customers do not require an account.

They can:

1. Open the shared gallery URL
2. Enter the gallery PIN
3. Access the published gallery
4. Browse the selected photographs

Customers cannot access unpublished or unselected photographs.

---

# 🔄 Application Workflow

```text
                    ┌─────────────────────┐
                    │       ADMIN         │
                    │                     │
                    │ Create Event        │
                    │ Add Team Members    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    TEAM MEMBERS     │
                    │                     │
                    │ Upload Photos       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    PHOTO STORAGE    │
                    │                     │
                    │ Cloud Object Store  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       ADMIN         │
                    │                     │
                    │ Review Photos       │
                    │ Select Photos       │
                    │ Publish Gallery     │
                    └──────────┬──────────┘
                               │
                         Gallery URL
                              +
                             PIN
                               │
                               ▼
                    ┌─────────────────────┐
                    │      CUSTOMER       │
                    │                     │
                    │ Enter PIN           │
                    │ Browse Gallery      │
                    └─────────────────────┘
```

---

# 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│                 React + Vite + Tailwind                 │
│                                                          │
│  Admin Dashboard    Team Dashboard    Customer Gallery  │
└────────────────────────────┬─────────────────────────────┘
                             │
                         REST API
                             │
                             ▼
┌──────────────────────────────────────────────────────────┐
│                   FastAPI Backend                        │
│                       Python                             │
│                                                          │
│ Authentication | Authorization | Events | Photos         │
│ Gallery Management | PIN Verification | Validation       │
└───────────────┬──────────────────────────┬───────────────┘
                │                          │
                │ SQLAlchemy               │ Storage API
                ▼                          ▼
┌────────────────────────┐    ┌────────────────────────────┐
│      PostgreSQL        │    │      Cloudinary             │
│                        │    │                             │
│ Users                  │    │ Original Images             │
│ Events                 │    │ Optimized Images            │
│ Event Memberships      │    │ CDN Delivery                │
│ Photo Metadata         │    │                             │
│ Galleries              │    │                             │
│ Gallery Photos         │    │                             │
└────────────────────────┘    └────────────────────────────┘
```

### Architecture Principles

* RESTful backend architecture
* Separation of frontend and backend
* Relational database for structured application data
* Object storage for photographs
* Backend-enforced authorization
* Secure authentication
* PIN-protected customer galleries
* Environment-based configuration
* Deployable frontend and backend services

---

# 🛠️ Technology Stack

| Layer                | Technology         | Purpose                     |
| -------------------- | ------------------ | --------------------------- |
| Frontend             | React + Vite       | User interface              |
| Styling              | Tailwind CSS       | Responsive UI               |
| Routing              | React Router       | Client-side navigation      |
| HTTP Client          | Axios              | API communication           |
| Backend              | Python + FastAPI   | REST API                    |
| Validation           | Pydantic           | Request/response validation |
| ORM                  | SQLAlchemy         | Database interaction        |
| Database             | PostgreSQL         | Persistent relational data  |
| Authentication       | JWT                | User authentication         |
| Password/PIN Hashing | bcrypt             | Secure credential hashing   |
| Image Storage        | Cloudinary         | Object/media storage        |
| Testing              | Pytest             | Backend testing             |
| API Testing          | FastAPI TestClient | API test execution          |
| Version Control      | Git + GitHub       | Source-code management      |
| Deployment           | Render             | Cloud deployment            |

---

# 👥 User Roles & Authorization

## Admin

The Admin has full control over the event workflow.

```text
ADMIN
 ├── Register/Login
 ├── Create Events
 ├── Manage Team Members
 ├── View Event Photos
 ├── Select Photos
 ├── Create Gallery
 └── Publish Gallery
```

## Team Member

Team members have limited access based on event membership.

```text
TEAM MEMBER
 ├── Login
 ├── View Assigned Events
 ├── Upload Photos
 └── View Own Photos
```

## Customer

Customers use a temporary gallery-access flow.

```text
CUSTOMER
 ├── Open Gallery URL
 ├── Enter PIN
 └── View Published Photos
```

Authorization is enforced on the backend rather than relying only on frontend route restrictions.

---

# 🗄️ Database Design

The application uses PostgreSQL as the primary relational database.

## Users

Stores Admin and Team Member accounts.

```text
users
----------------
id
name
email
password_hash
role
created_at
```

## Events

Stores photography events.

```text
events
----------------
id
name
created_by
event_date
created_at
```

## Event Members

Maps Team Members to their assigned events.

```text
event_members
----------------
id
event_id
user_id
```

## Photos

Stores photograph metadata.

```text
photos
----------------
id
event_id
uploaded_by
filename
storage_location
file_size
created_at
is_selected
```

## Galleries

Stores customer gallery information.

```text
galleries
----------------
id
event_id
public_token
pin_hash
published
created_at
```

## Gallery Photos

Maps selected photographs to a gallery.

```text
gallery_photos
----------------
gallery_id
photo_id
```

### Relationships

```text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Events       Event Members
 │               │
 │               └── Team Members
 │
 ▼
Photos
 │
 │ selected
 ▼
Gallery Photos
 │
 ▼
Gallery
 │
 ▼
Customer
```

### Database Design Principles

* Unique email addresses
* Foreign-key relationships
* Event membership constraints
* Unique gallery public tokens
* Referential integrity
* Indexed frequently queried fields
* No binary image files stored in PostgreSQL

---

# 📷 Photo Storage Architecture

Actual photograph files are stored using Cloudinary.

PostgreSQL stores only photograph metadata.

```text
Photo Upload
     │
     ▼
FastAPI
     │
     ├──────────────► Cloudinary
     │                  │
     │                  └── Image URL
     │
     ▼
PostgreSQL
     │
     └── Photo metadata + storage URL
```

### Stored Photo Metadata

* Photo ID
* Event ID
* Uploaded By
* Filename
* Storage Location
* File Size
* Created At
* Selection Status

This prevents the database from being unnecessarily used to store large binary image files.

---

# 🔐 Security

Security is implemented at both the authentication and authorization levels.

## Password Security

User passwords are securely hashed using bcrypt.

Passwords are never stored as plain text.

## Gallery PIN Security

Gallery PINs are securely hashed using bcrypt.

The original PIN is not stored as plain text in the database.

## JWT Authentication

Authenticated Admin and Team Member users receive JWT access tokens.

Tokens are used to authenticate protected API requests.

Example:

```text
Authorization: Bearer <JWT>
```

## Backend Authorization

The backend verifies:

* User authentication
* User role
* Event membership
* Photo ownership where applicable
* Gallery publication state
* Customer gallery access

Frontend restrictions alone are not treated as security boundaries.

---

# 🔒 Access Control Examples

### Team Member accessing an unassigned event

```text
Request
   ↓
Check authentication
   ↓
Check event membership
   ↓
Not assigned
   ↓
403 Forbidden
```

### Team Member attempting to publish a gallery

```text
Team Member
     ↓
Publish Request
     ↓
Backend checks role
     ↓
TEAM_MEMBER ≠ ADMIN
     ↓
403 Forbidden
```

### Customer entering incorrect PIN

```text
Gallery URL
     ↓
Enter PIN
     ↓
Verify bcrypt hash
     ↓
Incorrect
     ↓
401 Unauthorized
```

### Customer accessing unpublished photos

```text
Gallery Request
     ↓
Check gallery status
     ↓
Not published
     ↓
Access denied
```

---

# 🌐 API Endpoints

## Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/users
```

## Events

```text
POST   /api/events
GET    /api/events
GET    /api/events/{id}
PUT    /api/events/{id}
DELETE /api/events/{id}
```

## Event Members

```text
POST   /api/events/{id}/members
GET    /api/events/{id}/members
DELETE /api/events/{id}/members/{user_id}
```

## Photos

```text
POST   /api/events/{id}/photos
GET    /api/events/{id}/photos
GET    /api/photos/my
PUT    /api/events/{id}/photos/selection
DELETE /api/photos/{id}
```

## Galleries

```text
POST   /api/events/{id}/gallery
POST   /api/galleries/{id}/publish
GET    /api/galleries/{id}
```

## Customer Gallery

```text
GET    /api/gallery/{token}/info
POST   /api/gallery/{token}/verify
GET    /api/gallery/{token}/photos
```

---

# 📂 Project Structure

```text
photoshare/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── auth/
│   │   └── storage/
│   │
│   ├── tests/
│   ├── requirements.txt
│   ├── seed_data.py
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── .env.example
│
├── README.md
├── render.yaml
└── .gitignore
```

---

# 💻 Local Development

## Prerequisites

Install:

* Python 3.10+
* Node.js 18+
* Git
* PostgreSQL

---

## 1. Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>

cd photoshare
```

---

# Backend Setup

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it:

### macOS/Linux

```bash
source venv/bin/activate
```

### Windows

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create your environment file:

```bash
cp .env.example .env
```

Configure the required environment variables.

Run the backend:

```bash
uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔑 Environment Variables

Never commit real credentials or secrets to Git.

Example backend environment:

```env
DATABASE_URL=your_postgresql_connection_string

JWT_SECRET=your_secure_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Use `.env.example` to document required variables without exposing real values.

---

# ☁️ Cloudinary Setup

1. Create a Cloudinary account.
2. Obtain the Cloud Name.
3. Obtain the API Key.
4. Obtain the API Secret.
5. Add the values to the backend environment variables.
6. Restart the backend.

The application uses Cloudinary for photograph storage and delivery.

---

# 🚀 Deployment

The application is designed for deployment using Render.

The deployment consists of:

```text
GitHub Repository
       │
       ▼
Render
       │
 ┌─────┼──────────────┐
 ▼     ▼              ▼
Frontend Backend   PostgreSQL
```

## Deployment Steps

1. Push the project to GitHub.
2. Create a Render account.
3. Connect the GitHub repository.
4. Configure the frontend service.
5. Configure the FastAPI backend service.
6. Create/configure PostgreSQL.
7. Add required environment variables.
8. Configure Cloudinary credentials.
9. Deploy the application.
10. Verify the complete Admin → Team Member → Customer workflow.

---

# 🌐 Live Application

> Replace the following placeholders after deployment.

**Frontend:**
`https://YOUR-FRONTEND-URL`

**Backend:**
`https://YOUR-BACKEND-URL`

**API Documentation:**
`https://YOUR-BACKEND-URL/docs`

---

# 🧪 Testing

The backend includes automated tests using Pytest.

Run:

```bash
cd backend

pytest -v
```

## Important Test Scenarios

The test suite should cover:

* Admin registration
* User login
* Invalid authentication
* Role-based authorization
* Team Member event access
* Unauthorized event access
* Photo upload authorization
* Gallery creation
* Gallery publishing
* Incorrect gallery PIN
* Correct gallery PIN
* Customer access to published photos
* Customer restriction from unpublished photos

Example expected authorization behavior:

```text
Admin publishing gallery
        ↓
       200 ✅

Team Member publishing gallery
        ↓
       403 ❌

Incorrect customer PIN
        ↓
       401 ❌

Correct customer PIN
        ↓
       Access granted ✅
```

---

# 👤 Demo Credentials

> Replace these values with the credentials of your actual deployed demo accounts.

### Admin

```text
Email:    YOUR_ADMIN_EMAIL
Password: YOUR_ADMIN_PASSWORD
Role:     Admin
```

### Team Member

```text
Email:    YOUR_TEAM_MEMBER_EMAIL
Password: YOUR_TEAM_MEMBER_PASSWORD
Role:     Team Member
```

### Customer

No account is required.

```text
Gallery URL:
https://YOUR-DOMAIN/gallery/YOUR_PUBLIC_TOKEN

PIN:
YOUR_DEMO_PIN
```

**Never commit production credentials, API keys, database passwords, or secrets to the repository.**

---

# 📊 Example Operational Flow

Example event:

```text
Event:
Arjun & Priya Wedding

Uploaded Photos:
1,250

Selected Photos:
600

Gallery:
https://YOUR-DOMAIN/gallery/abc123

PIN:
482917
```

Workflow:

```text
Admin creates event
        ↓
Adds photographers
        ↓
Photographers upload 1,250 photos
        ↓
Admin reviews photos
        ↓
Admin selects 600 photos
        ↓
Admin publishes gallery
        ↓
Customer receives URL + PIN
        ↓
Customer enters PIN
        ↓
Customer views 600 published photos
```

---

# 🎯 Design Goals

PhotoShare focuses on:

### Reliability

Core workflows should function consistently from upload to customer delivery.

### Security

Authentication and authorization are enforced on the backend.

### Maintainability

The application separates frontend, backend, database, authentication, storage, and business logic.

### Usability

The interface is designed to be simple for photographers and customers.

### Scalability

Object storage is used for photographs while PostgreSQL manages structured metadata.

---

# ⚠️ Known Limitations

The following limitations depend on the current implementation:

* Initial versions may focus on standard web image formats such as JPEG, PNG, and WebP.
* Professional camera RAW formats such as CR3, ARW, and NEF may require conversion before client delivery.
* Advanced CDN optimization may depend on the configured storage provider.
* Additional enterprise features such as advanced audit logging, gallery expiration, and automated CI/CD can be added in future iterations.

Only features implemented in the deployed version should be considered part of the current production workflow.

---

# ⭐ Future Enhancements

Potential future improvements include:

* Image thumbnails and automatic resizing
* Pagination and infinite scrolling
* Advanced photo search and filtering
* Bulk photo management
* Customer photo downloads
* Gallery expiration
* CDN optimization
* Email gallery invitations
* Gallery analytics
* Activity/audit logs
* Automated CI/CD
* Automated image moderation
* Advanced event management

These enhancements should be added without compromising the core application workflow.

---

# 📋 Internship Challenge Requirement Coverage

| Requirement              | Implementation |
| ------------------------ | -------------- |
| Admin Registration/Login | ✅              |
| Event Creation           | ✅              |
| Team Member Assignment   | ✅              |
| Team Member Login        | ✅              |
| Assigned Event Access    | ✅              |
| Multiple Photo Upload    | ✅              |
| Cloud/Object Storage     | ✅              |
| Photo Metadata           | ✅              |
| Admin Photo Review       | ✅              |
| Photo Selection          | ✅              |
| Gallery Creation         | ✅              |
| Gallery Publishing       | ✅              |
| Shareable Gallery Link   | ✅              |
| PIN-Protected Gallery    | ✅              |
| Customer Without Account | ✅              |
| Role-Based Authorization | ✅              |
| Input Validation         | ✅              |
| Error Handling           | ✅              |
| Cloud Deployment         | ✅              |
| README Documentation     | ✅              |
| Automated Tests          | ✅              |

---

# 🧑‍💻 Development Philosophy

The project prioritizes:

```text
Simple Architecture
        +
Clear Code
        +
Secure Access Control
        +
Reliable Core Features
        +
Good Documentation
        =
Maintainable Full-Stack Application
```

The implementation is intentionally designed to remain understandable and explainable during technical evaluation.

---

# 📄 License

This project was developed as a Full-Stack Internship Challenge submission.

---

# 👨‍💻 Author

**Gangadhar Reddy**

Full-Stack / AI & Data Science Student

GitHub:
`<YOUR_GITHUB_PROFILE_URL>`

LinkedIn:
`<YOUR_LINKEDIN_PROFILE_URL>`
