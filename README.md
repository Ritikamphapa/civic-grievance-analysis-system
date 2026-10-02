# AI-Powered Civic Grievance Analysis System

A full-stack platform where citizens submit civic complaints (water, electricity,
roads, sanitation, safety, etc.) and the backend automatically:

- **Classifies** the complaint into a category using a TF-IDF + Naive Bayes NLP model
- **Scores sentiment** (Positive / Neutral / Negative) using TextBlob
- **Stores** the result in MongoDB (or in-memory, for local testing)
- **Serves** a small dashboard showing category and sentiment breakdowns

Tech stack: **React**, **FastAPI**, **MongoDB**, **Docker**, **Google Cloud Run**.

See `DEPLOYMENT_GUIDE.md` for the complete, step-by-step instructions for
running this in VS Code, pushing to GitHub, and deploying to the cloud.

## Quick start (local, no database needed)

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m textblob.download_corpora
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

Open http://localhost:3000 — the app talks to the API at http://localhost:8000.
API docs are auto-generated at http://localhost:8000/docs.

## Project structure

```
civic-grievance-system/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app + CORS setup
│   │   ├── database.py       # MongoDB / in-memory data layer
│   │   ├── models.py         # Pydantic request/response schemas
│   │   ├── nlp_utils.py      # Classification + sentiment analysis
│   │   └── routers/
│   │       └── complaints.py # /complaints API endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── api.js
│   │   └── components/
│   ├── package.json
│   └── .env.example
├── .gitignore
├── README.md
└── DEPLOYMENT_GUIDE.md
```
