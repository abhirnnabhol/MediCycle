# MediCycle 💊♻️
### *Turn Unused Medicines Into Affordable Care.*

[![Hackathon Prototype](https://img.shields.io/badge/Status-Hackathon%20Prototype-emerald.svg)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TailwindCSS%20%2B%20Vite-blue.svg)]()
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)]()
[![Database](https://img.shields.io/badge/Database-MongoDB%20%2B%20Mongoose-brightgreen.svg)]()

> **⚠️ IMPORTANT LEGAL & HACKATHON DISCLAIMER**  
> MediCycle is a hackathon prototype demonstrating a technological framework for responsible medicine-waste reduction. Actual medicine redistribution, sale, prescription handling, storage, and disposal are subject to applicable Indian pharmaceutical laws (Drugs and Cosmetics Act & Rules), pharmacy council regulations, and strict clinical safety standards. **Unrestricted peer-to-peer medicine selling is strictly prohibited.**

---

## 1. The Core Idea

Every year, thousands of tons of completely unexpired, sealed medications are thrown into landfills when patients recover or change treatment courses. Simultaneously, millions of families struggle with the cost of essential medicines.

MediCycle introduces a controlled verification model:

```
Unused Medicine ──> Submit ──> Verify (Pharmacist) ──> Approve ──> Affordable Access ──> Reduced Wastage
```

---

## 2. 30-Second Hackathon Demonstration Flow

| Step | Persona | Action & Screen | System Outcome |
|---|---|---|---|
| **1** | **Person A (Donor)** | Clicks *Demo Switcher* $\rightarrow$ **Person A (Aarav)**. Opens **Submit Medicine**, clicks **Autofill Demo Medicine**, and submits. | Medicine stored in MongoDB with status: `Pending Verification`. |
| **2** | **Admin / Pharmacist** | Clicks *Demo Switcher* $\rightarrow$ **Admin (Dr. Anita)**. Opens **Pharmacy Control Center**. Inspects submission, verifies batch & expiry, clicks **Approve**. | Medicine status updated to `APPROVED` and published to public catalog. |
| **3** | **Person B (Recipient)** | Clicks *Demo Switcher* $\rightarrow$ **Person B (Priya)**. Opens **Browse Medicines**, searches for the approved medicine, clicks **View Details**, and clicks **Request Medicine**. | Request created in MongoDB with status: `Pending`. |
| **4** | **Admin / Pharmacist** | Admin checks **Patient Request Queue**, clicks **Approve Request** $\rightarrow$ **Mark Completed**. | Request fulfilled; inventory deducted safely. |
| **5** | **Impact Dashboard** | Views live impact counters on Landing Page & User Dashboard. | Dynamic counts update (medicines saved, subsidized savings). |

---

## 3. Technology Stack

- **Frontend**:
  - React 18 with Vite
  - Tailwind CSS + Glassmorphism design tokens
  - Lucide React iconography
  - React Router DOM v6
  - Context API (`AuthContext`, `ToastContext`)
- **Backend**:
  - Node.js & Express REST API
  - Mongoose ODM
  - Dual Database Strategy: Supports both standard MongoDB connection strings (`MONGODB_URI`) and **automatic in-memory MongoDB fallback** (`mongodb-memory-server`) so it runs instantly on any evaluator machine without setup friction!
  - JWT (JSON Web Tokens) with 30-day expiry
  - Passwords secured with `bcryptjs`
- **Security & Validation**:
  - Backend validation automatically rejects expired dates ($\le \text{today}$)
  - Rejects opened/torn packaging
  - Enforces mandatory rejection feedback from pharmacists
  - Validates prescription acknowledgment for Schedule H/X medications

---

## 4. Pre-configured Demo Accounts

For rapid hackathon judging, use the **Demo Switcher** in the top navbar or log in with these credentials:

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin / Pharmacist** | Dr. Anita Sharma | `admin@medicycle.org` | `password123` |
| **Person A (Donor)** | Aarav Patel | `aarav@example.com` | `password123` |
| **Person B (Recipient)** | Priya Verma | `priya@example.com` | `password123` |

---

## 5. Quick Start & Local Installation

### Prerequisites
- Node.js v18+ and npm installed.

### Step 1: Clone or Navigate to Directory
```bash
cd "c:/Users/abhir/OneDrive/Desktop/web/javascript+html+css"
```

### Step 2: Install Backend & Frontend Dependencies
```bash
# In one terminal, install backend
cd backend
npm install

# In another terminal, install frontend
cd ../frontend
npm install
```

### Step 3: Launch Backend Server (Port 5000)
```bash
cd backend
npm start
```
*Note: If local MongoDB is not running, the backend automatically launches an embedded in-memory MongoDB server and seeds demo data immediately!*

### Step 4: Launch Frontend Dev Server (Port 3000)
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:3000`**.

---

## 6. API Reference Summary

### Authentication
- `POST /api/auth/register` — Register new user/admin account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get authenticated user details

### Medicines Catalog & Submissions
- `GET /api/medicines` — Filter approved medicines (`search`, `category`, `prescription`, `maxPrice`, `sort`)
- `GET /api/medicines/:id` — View details of a specific medicine
- `POST /api/medicines` — Submit unused medicine for verification
- `GET /api/medicines/my` — Get submissions by the logged-in user

### Verification & Admin Console (Protected)
- `GET /api/admin/medicines/pending` — Fetch pending verification queue
- `GET /api/admin/medicines/all` — Overview of entire medicine inventory
- `PUT /api/admin/medicines/:id/approve` — Verify and approve medicine for public listing
- `PUT /api/admin/medicines/:id/reject` — Reject submission with mandatory feedback reason
- `GET /api/admin/requests` — View patient request queue
- `PUT /api/admin/requests/:id` — Progress request status (`Pending` $\rightarrow$ `Approved` $\rightarrow$ `Completed`)
- `GET /api/admin/stats` — Real-time platform aggregates

### Public Impact
- `GET /api/stats/public` — Benchmark & live database impact aggregates
- `GET /api/health` — Service health check & prototype declaration
