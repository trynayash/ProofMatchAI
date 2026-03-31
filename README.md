# 🛡️ ProofMatch AI

**AI-Powered UPI Payment Screenshot Verification System**

Built for the **Google Gen AI Academy APAC Hackathon** — Track 1: AI Agents using Gemini, ADK, and Cloud Run.

---

## What It Does

Upload a UPI payment receipt screenshot → a Gemini-powered ADK Agent extracts all transaction fields, cross-checks for fraud, detects duplicates, and returns a confidence-scored verdict — **GENUINE / SUSPICIOUS / FAKE** — with full reasoning.

## Architecture

```
┌──────────────┐     ┌──────────────────────────┐     ┌──────────────┐
│   React UI   │────▶│   FastAPI + ADK Agent     │────▶│ Gemini 2.0   │
│  (Tailwind)  │◀────│                           │◀────│ Flash Vision │
└──────────────┘     │  ┌─ extract_upi_fields    │     └──────────────┘
                     │  ├─ verify_integrity       │
                     │  ├─ check_duplicate        │     ┌──────────────┐
                     │  ├─ store_result       ────│────▶│  Firestore   │
                     │  └─ generate_verdict       │     └──────────────┘
                     └──────────────────────────┘
```

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Frontend     | React 19 + Vite + Tailwind CSS v4             |
| Backend      | Python FastAPI                                |
| AI Model     | Google Gemini 2.0 Flash (Vision)              |
| Agent Layer  | Google ADK (Agent Development Kit)            |
| Database     | Cloud Firestore (local in-memory fallback)    |
| File Storage | Google Cloud Storage (local disk fallback)    |
| Auth         | Firebase Authentication (Google Sign-In)      |
| Deployment   | Google Cloud Run (fully containerized)        |
| CI/CD        | Cloud Build + Artifact Registry               |

## ADK Agent — ProofMatchAgent

The agent runs 5 tools sequentially:

1. **`extract_upi_fields`** — Gemini Vision extracts structured transaction data from img
2. **`verify_transaction_integrity`** — Gemini checks for fraud signals and inconsistencies
3. **`check_duplicate`** — Queries Firestore for previously submitted transaction IDs
4. **`store_verification_result`** — Persists the full verification record
5. **`generate_verdict_report`** — Synthesizes all findings into a scored verdict

## Quick Start (Local Development)

### Prerequisites

- Python 3.11+
- Node.js 20+
- A Gemini API key ([get one here](https://aistudio.google.com/apikey))

### 1. Clone & Configure

```bash
git clone <repo-url>
cd ProofMatchAI
cp .env.example .env
# Edit .env with your GEMINI_API_KEY
```

### 2. Start Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python main.py
```

Backend runs at `http://localhost:8080`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

> **Note:** Auth is disabled in dev mode (`AUTH_DISABLED=true`). The Vite dev server proxies `/api` to the backend.

### 4. Docker (Alternative)

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`

## Cloud Run Deployment

### Prerequisites

- GCP project with billing enabled
- `gcloud` CLI installed and authenticated
- Artifact Registry Docker repository created

### Step-by-Step

```bash
# Set your project
export PROJECT_ID=your-project-id
export REGION=asia-south1
gcloud config set project $PROJECT_ID

# Create Artifact Registry repo
gcloud artifacts repositories create proofmatch \
  --repository-format=docker \
  --location=$REGION

# Store secrets
echo -n "your-api-key" | gcloud secrets create GEMINI_API_KEY --data-file=-
echo -n "proofmatch-uploads" | gcloud secrets create GCS_BUCKET_NAME --data-file=-
echo -n "$PROJECT_ID" | gcloud secrets create GOOGLE_CLOUD_PROJECT --data-file=-

# Deploy via Cloud Build
gcloud builds submit --config=infra/cloudbuild.yaml
```

## API Endpoints

| Method | Endpoint               | Description                     |
| ------ | ---------------------- | ------------------------------- |
| POST   | `/api/upload`          | Upload image, returns URI       |
| POST   | `/api/verify`          | Run verification agent pipeline |
| GET    | `/api/history`         | User's verification history     |
| GET    | `/api/transaction/:id` | Single verification detail      |
| GET    | `/api/stats`           | Aggregate statistics            |
| POST   | `/api/report/pdf`      | Generate PDF report             |
| GET    | `/api/health`          | Health check                    |

All endpoints return:
```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "request_id": "uuid"
}
```

## Folder Structure

```
ProofMatchAI/
├── frontend/
│   ├── src/
│   │   ├── pages/          # Landing, Verify, History, Admin
│   │   ├── components/     # UploadZone, ResultCard, Stepper, etc.
│   │   ├── hooks/          # useAuth, useVerify, useHistory
│   │   └── lib/            # firebase.js, api.js, utils.js
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   ├── main.py             # FastAPI app + routes
│   ├── agent.py            # ADK ProofMatchAgent
│   ├── tools/              # 5 agent tools
│   ├── middleware/          # Firebase auth
│   ├── models.py           # Pydantic schemas
│   ├── config.py           # Environment config
│   ├── requirements.txt
│   └── Dockerfile
├── infra/
│   ├── cloudbuild.yaml     # CI/CD pipeline
│   └── cloud-run.yaml      # Service definitions
├── docker-compose.yml
└── .env.example
```

## Environment Variables

| Variable                          | Required | Default            |
| --------------------------------- | -------- | ------------------ |
| `GEMINI_API_KEY`                  | Yes      | —                  |
| `GOOGLE_CLOUD_PROJECT`           | No       | `proofmatch-ai`    |
| `GCS_BUCKET_NAME`               | No       | `proofmatch-uploads` |
| `FIREBASE_PROJECT_ID`           | No       | `proofmatch-ai`    |
| `AUTH_DISABLED`                  | No       | `true` (dev)       |
| `APP_ENV`                        | No       | `development`      |

## License

Built for the Google Gen AI Academy APAC Hackathon 2026.
