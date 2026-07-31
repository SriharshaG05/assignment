# Live CRM Notification System

A modern, production-grade CRM application featuring a layered architecture, real-time WebSocket notifications, JWT authentication, role-based access control, and asynchronous background reminder tasks.

---

## Architecture

This project uses a strict layered architecture:
`Controller (FastAPI Route) -> Service -> Repository -> Database`

- **Controllers**: Handle HTTP and WebSocket endpoints, route validation, and serializing responses.
- **Services**: Contain business logic, validation rules (e.g. duplicate name/email checks), and workflow orchestration (e.g. creating assignments, pushing notifications via WebSocket, and scheduling background reminders).
- **Repositories**: Encapsulate SQLAlchemy queries and raw database operations using a generic CRUD base.
- **WebSocket Manager**: Maintains client connection pools mapped to `user_id` and targets messages specifically to the assigned user (no broad broadcast).
- **Background Tasks**: Employs FastAPI `BackgroundTasks` to wait 30 seconds after any assignment before auto-dispatching a reminder notification.

```mermaid
graph TD
    Client[React SPA] <-->|HTTP / WebSockets| API[FastAPI Controller]
    API <--> Services[Service Layer]
    Services <--> Repositories[Repository Layer]
    Repositories <--> DB[(PostgreSQL / SQLite)]
    Services -.->|BackgroundTasks| Worker[Background Worker]
    Worker -.->|WebSocket Push| Client
```

---

## Folder Structure

```
assignment-project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── controllers/     # Routers (auth, users, companies, contacts, assignments, notifications)
│   │   ├── services/            # Business logic services
│   │   ├── repositories/        # Generic CRUD & model repositories
│   │   ├── models/              # SQLAlchemy model declarations
│   │   ├── schemas/             # Pydantic schema validation
│   │   ├── database/            # DB engine and session maker
│   │   ├── config/              # App environment settings
│   │   ├── core/                # Encryption, native bcrypt, JWT utilities
│   │   ├── middlewares/         # Authorization checks & CORS settings
│   │   ├── websocket/           # WebSocket Connection Manager
│   │   ├── workers/             # Asynchronous background tasks
│   │   └── utils/               # Helpers
│   ├── main.py                  # API entry point
│   ├── seed.py                  # Database seeder
│   ├── verify.py                # Integration test suite
│   └── requirements.txt         # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Login, Dashboard, Companies, Contacts, Assignments, Notifications
│   │   ├── layouts/             # Main layout, sidebar, header, active toasts
│   │   ├── hooks/               # Custom hooks
│   │   ├── contexts/            # AuthContext, NotificationContext
│   │   ├── services/            # Axios API client wrapper
│   │   ├── types/               # TypeScript interfaces
│   │   ├── App.tsx              # Main routing and guards
│   │   └── main.tsx             # Mounting scripts
│   ├── tailwind.config.js       # Tailwind CSS v3 settings
│   ├── tsconfig.json            # TS settings
│   └── package.json             # NPM package list
└── README.md                    # Project documentation
```

---

## Environment Variables

### Backend Configuration
Create a `.env` file under the `backend/` folder to override defaults if necessary:
```env
DATABASE_URL=sqlite:///./crm.db
SECRET_KEY=5e2fb60b81df986bc052db5877f884179e8c46002f23cfb8625b81a8bfd32ff1
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```
*(Supports PostgreSQL seamlessly. For production, set `DATABASE_URL=postgresql://user:pass@host:port/dbname`)*

### Frontend Configuration
Create a `.env` file under the `frontend/` folder:
```env
VITE_API_URL=http://localhost:8000
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Setup and Run Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install requests  # required for verify integration test
   ```
4. Seed the database (creates default admin, employees, companies, contacts):
   ```bash
   python seed.py
   ```
5. Run the FastAPI development server:
   ```bash
   python main.py
   ```
   *API will be available at `http://localhost:8000`.*

### Setup and Run Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *Frontend will be running at `http://localhost:5173`.*

---

## Demo Flow & Testing Real-Time Alerts

1. Open `http://localhost:5173` in a web browser tab.
2. Log in as the **Admin**:
   - **Email**: `admin@crm.com`
   - **Password**: `adminpassword`
3. Open an Incognito window (or a different browser) and log in as the **Employee**:
   - **Email**: `employee1@crm.com`
   - **Password**: `employeepassword`
4. In the **Admin** browser window:
   - Go to the **Assignments** tab.
   - Select **Company Account** or **Contact Person** to assign.
   - Choose **Employee One** as the user.
   - Type in an **Assigned Role** (e.g. `Account executive`).
   - Click **Assign Account**.
5. In the **Employee** browser window:
   - The employee immediately receives a real-time WebSocket toast notification sliding in at the top-right of their screen.
   - The unread badge on their notification bell increments instantly.
6. Wait **30 seconds**:
   - A second, automated reminder notification pops up via WebSocket in the Employee's window: *"Reminder: You were assigned as Account executive for the Company... 30 seconds ago."*
7. Open the notification bell or page to mark alerts as read.

---

## API Documentation

FastAPI provides interactive Swagger docs out-of-the-box. Access it at:
`http://localhost:8000/docs`

### Major Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Register a new system user | No |
| **POST** | `/auth/login` | Login and obtain JWT access token | No |
| **GET** | `/users` | List all system users | Yes |
| **GET** | `/companies` | Get all companies | Yes |
| **POST** | `/companies` | Create a new company (unique name checked) | Yes |
| **PUT** | `/companies/{id}` | Update company details | Yes |
| **DELETE** | `/companies/{id}`| Delete company and cascades relationships | Yes |
| **GET** | `/contacts` | Get all contact persons | Yes |
| **POST** | `/contacts` | Create a contact (requires valid company) | Yes |
| **POST** | `/assignments` | Assign account/contact to user | **Admin Only** |
| **GET** | `/notifications` | Fetch current user notifications | Yes |
| **PATCH**| `/notifications/{id}/read` | Mark a notification as read | Yes |
