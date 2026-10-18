# CivicLens AI — Smart Community Issue Resolver

**CivicLens AI** is a modern civic-tech platform that bridges community residents and municipal public works departments. Residents can report local hazards (potholes, flickering high-voltage streetlights, illegal commercial dumping, clogged stormwater drains), receive instant server-side **Gemini AI triage recommendations**, track issue lifecycle stages, and monitor community-wide infrastructure health.

---

## 🌟 Key Features

1. **Resident Dashboard (Resident Hub)**:
   - Live metrics: Total reports, active repairs in progress, resolved rate, average triage time.
   - 4-step visual lifecycle tracker: `Submitted` ➔ `Under Review` ➔ `In Progress` ➔ `Resolved`.
   - Search by keyword/address and filter by category or priority.
   - Detailed modal displaying full descriptions, attached photo evidence, location map link, and complete audit trail.

2. **AI-Powered Issue Reporting**:
   - Clean, validated input form for issue title, description, category, and street address.
   - One-click **"Use My Location"** (HTML5 Geolocation) with quick landmark chips.
   - Optional photo upload with automatic client-side optimization.
   - **Gemini 3.8 Flash Triage Engine**:
     - Analyzes description and optional photo evidence via secure server-side API.
     - Recommends municipal Category, Priority (`Low`, `Medium`, `High`, `Critical`), and confidence score.
     - Generates municipal explanation and recommended operational dispatch action.
     - **Human Review Safeguard**: Clearly labeled as advisory AI recommendations for human dispatcher review.
     - One-click button to apply AI recommendations directly to the submission form.

3. **Administrator Dashboard (Municipal Console)**:
   - High-level municipal operations overview with pending intake and critical alert counters.
   - Filterable ledger table with Category, Location, Priority, Status, and AI Triage metrics.
   - Interactive status update modal allowing dispatchers to advance lifecycle status and append official work order notes.
   - One-click **Export to CSV** for city council reporting.
   - Instant Resident/Admin view switcher for testing without IAM configuration hurdles.

4. **Community Insights & Civic Analytics**:
   - Interactive category distribution charts with percentage and count breakdowns.
   - Status pipeline resolution funnel.
   - **Gemini AI Strategic Digest**: Automated synthesis summarizing recurring neighborhood problems, geographic hotspots, and proactive civic interventions.

5. **Simulated Email Notification Service (Firebase Context)**:
   - Automatically triggers whenever an administrator or city official changes the lifecycle status of an issue in Cloud Firestore.
   - Formats transactional municipal emails with report reference ID, previous and new status, dispatcher notes, and timestamp.
   - Persists delivered emails to the `notifications` collection in Cloud Firestore with secure ABAC security rules.
   - **Interactive Resident Email Inbox**: Accessible from the top navigation bar with real-time unread counter, email listing, and full rich municipal email viewer.
   - **Real-Time Toast Alerts**: Floating animated notification whenever a simulated email is dispatched.

6. **CivicLens AI Concierge Chatbot (`gemini-3.8-flash`)**:
   - Multi-turn conversational civic assistant accessible via the bottom floating launcher.
   - Maintains conversation history, scrollable message thread, and starter municipal prompt suggestions.
   - Clarifies reporting rules, department jurisdictions, and estimated repair timelines.

7. **Voice Dictation with Audio Transcription (`gemini-3.5-transcribe`)**:
   - One-click microphone recording on the "Report Issue" page.
   - Transcribes spoken descriptions using Google's `gemini-3.5-transcribe` audio model and inserts them directly into the report form.

---

## 🏗️ Architecture & Security

```
├── client (React 19 + Tailwind CSS v4)
│   ├── src/components/       # Modular UI (Resident, Admin, Report, Insights)
│   ├── src/firebase/         # Firestore DB client & Google Auth configuration
│   └── src/utils/            # Category configs & priority styles
│
├── server (Node.js + Express)
│   ├── server.ts             # Cloud Run production entrypoint (serves static dist + /api/*)
│   ├── src/server/api.ts     # Server-side Gemini 3.8 Flash SDK endpoints
│   └── vite.config.ts        # Vite development middleware for seamless local dev
│
└── cloud resources
    ├── Cloud Firestore       # Persistent reports, status histories, and security rules
    ├── Firebase Auth         # Google Sign-in authentication
    └── Google Cloud Run      # Containerized full-stack deployment
```

### Security & Secret Protection
- **No Client-Side API Keys**: All calls to the Gemini API (`@google/genai`) are executed exclusively from server-side code (`/api/analyze-issue` and `/api/insights-summary`). The `GEMINI_API_KEY` is never bundled into client JavaScript.
- **Hardened Firestore Security Rules (`firestore.rules`)**:
  - Default-deny all unmapped collections.
  - Mandatory authentication checks on read/write.
  - Strict Attribute-Based Access Control (ABAC): Residents can create valid reports; only authorized administrators can update status or delete records.
  - Payload validation helpers verifying string lengths, schema bounds, and immutable fields.

---

## 🚀 Setup & Local Development

### Prerequisites
- Node.js 20+ or 22+
- npm or bun

### 1. Environment Configuration
Create a `.env` file from `.env.example`:
```bash
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

> **Note for AI Studio**: `GEMINI_API_KEY` and `APP_URL` are automatically injected at runtime into the server environment from your configured Secrets panel.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. In development mode, Vite serves the frontend while running the embedded API middleware for `/api/analyze-issue` and `/api/insights-summary`.

---

## 🚢 Google Cloud Run Deployment

CivicLens AI is built to run as a single, containerized full-stack service on Google Cloud Run.

### 1. Build Production Frontend Bundle
```bash
npm run build
```
This compiles the React 19 application into the `dist/` directory.

### 2. Run Production Server Locally
```bash
npm start
```
This launches `server.ts`, which serves the `dist/` static files and hosts the Express API endpoints on `PORT 3000`.

### 3. Deploy via Google Cloud CLI (`gcloud`)
```bash
# 1. Set Google Cloud project
gcloud config set project YOUR_PROJECT_ID

# 2. Build and deploy to Cloud Run from source
gcloud run deploy civiclens-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

## 🧪 Testing Features Guide

1. **Test Resident Reporting**:
   - Navigate to **"Report Issue"**.
   - Enter a title (e.g. `Severe pothole on 4th Ave`) and description (`A 6-inch deep pothole in the right lane damaged two tire rims today near the school crossing`).
   - Click **"Analyze with CivicLens AI"**.
   - Verify that Gemini returns a **High** or **Critical** priority recommendation with an explanation and recommended asphalt patch action.
   - Click **"Apply AI Category & Priority to Form"**.
   - Click **"Submit Official Community Report"**.
   - Confirm your report appears in the **Resident Hub** with status `Submitted`.

2. **Test Administrator Status Progression**:
   - Toggle the top-bar role switcher to **Admin** (or click **"Admin Console"**).
   - Locate the newly submitted report in the table.
   - Click **"Update Status"**.
   - Select `In Progress` or `Resolved` and write an official crew note (`Asphalt patch completed by crew #3`).
   - Click **"Commit Status Update"**.
   - Open the report to verify the **4-step progress tracker** and the appended timeline entry in the **Resolution Audit Trail**.

3. **Test Community Insights**:
   - Navigate to **"Community Insights"**.
   - Inspect the **Issues by Municipal Category** bar chart and the **Lifecycle Resolution Pipeline**.
   - Click **"Refresh AI Strategic Digest"** to trigger a real-time Gemini synthesis of neighborhood issues.
