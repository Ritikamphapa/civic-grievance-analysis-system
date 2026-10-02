# Complete Setup & Deployment Guide

Every step, in order, from opening the project in VS Code to a live URL you
can put on your resume. Do them in this order — later steps depend on earlier
ones.

---

## Part 0 — Install prerequisites (one-time)

Install these if you don't already have them:

1. **VS Code** — https://code.visualstudio.com/
2. **Python 3.11+** — https://www.python.org/downloads/ (tick "Add to PATH" on Windows)
3. **Node.js 18+ (LTS)** — https://nodejs.org/
4. **Git** — https://git-scm.com/downloads
5. **Docker Desktop** — https://www.docker.com/products/docker-desktop/
6. **Google Cloud CLI (`gcloud`)** — https://cloud.google.com/sdk/docs/install
7. A **GitHub** account — https://github.com
8. A **MongoDB Atlas** account (free tier) — https://www.mongodb.com/cloud/atlas/register
9. A **Google Cloud Platform** account — https://console.cloud.google.com (new accounts get free credits)

In VS Code, install these extensions (Extensions icon on the left sidebar, search and click Install):
- **Python** (by Microsoft)
- **ES7+ React/Redux/React-Native snippets**
- **Docker** (by Microsoft)

---

## Part 1 — Open the project in VS Code

1. Unzip the project folder you downloaded (`civic-grievance-system`) somewhere convenient, e.g. `Documents/civic-grievance-system`.
2. Open VS Code.
3. `File > Open Folder...` and select `civic-grievance-system`.
4. Open the built-in terminal: `Terminal > New Terminal` (or `` Ctrl+` ``). You'll use this terminal for every command below unless told otherwise.

---

## Part 2 — Run the backend locally

1. In the VS Code terminal:
   ```bash
   cd backend
   python -m venv venv
   ```
2. Activate the virtual environment:
   - **Windows (PowerShell):** `venv\Scripts\Activate.ps1`
   - **Windows (cmd):** `venv\Scripts\activate.bat`
   - **Mac/Linux:** `source venv/bin/activate`

   You'll see `(venv)` appear at the start of your terminal prompt — that confirms it worked.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Download the NLTK data TextBlob needs for sentiment analysis:
   ```bash
   python -m textblob.download_corpora
   ```
5. Run the API:
   ```bash
   uvicorn app.main:app --reload
   ```
6. You should see `Uvicorn running on http://127.0.0.1:8000`. Open http://localhost:8000/docs in your browser — you'll see interactive Swagger docs. Try the `POST /complaints` endpoint there with a sample description to confirm classification works.
7. Leave this terminal running. It's using the in-memory fallback store for now (no database needed yet) — you'll see `"using_mongo": false` at http://localhost:8000.

---

## Part 3 — Run the frontend locally

1. Open a **second** terminal in VS Code (click the `+` icon in the terminal panel, or `Terminal > New Terminal`). Keep the backend running in the first one.
2. In the new terminal:
   ```bash
   cd frontend
   npm install
   npm start
   ```
3. Your browser should open http://localhost:3000 automatically. You'll see the Civic Grievance form. Submit a test complaint (e.g. "There is no water supply in our street") and confirm it appears below with a category and sentiment tag.

If you see a "Could not reach the backend API" error, double check the backend terminal from Part 2 is still running.

---

## Part 4 — Push the project to GitHub

1. Go to https://github.com/new and create a new repository, e.g. `civic-grievance-analysis-system`. Do **not** tick "Add a README" (you already have one) — leave it empty.
2. Back in the VS Code terminal, go to the project root (not `backend` or `frontend`):
   ```bash
   cd ..
   ```
   (if you're inside `frontend`, run `cd ..` twice to reach the project root)
3. Initialize git and make your first commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: full-stack civic grievance analysis system"
   ```
4. Connect it to the GitHub repo you created (replace the URL with yours — copy it from the GitHub page after creating the repo):
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/civic-grievance-analysis-system.git
   git push -u origin main
   ```
5. Refresh the GitHub page — your code should now be there. Your `.env` files are correctly excluded (check `.gitignore`), so no secrets are pushed.

From now on, whenever you make changes:
```bash
git add .
git commit -m "describe your change"
git push
```

---

## Part 5 — Set up MongoDB Atlas (free tier)

1. Log in to https://cloud.mongodb.com.
2. Click **Build a Database** → choose the **free (M0)** tier → pick any cloud provider/region close to you → **Create**.
3. **Create a database user:** set a username and password (save these somewhere — you'll need them shortly). Under "Database Access."
4. **Allow network access:** under "Network Access," click **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`). This is fine for a student project; for production you'd restrict this.
5. Once the cluster is ready, click **Connect** → **Drivers** → select **Python**. Copy the connection string, which looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with the credentials from step 3.

### Connect your local backend to it
1. In VS Code, inside the `backend` folder, copy `.env.example` to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
   (Windows: `copy .env.example .env`)
2. Open `.env` and paste your real connection string into `MONGO_URI`.
3. Restart the backend (stop it with `Ctrl+C` in its terminal, then run `uvicorn app.main:app --reload` again).
4. Visit http://localhost:8000 — you should now see `"using_mongo": true`. Submit a complaint from the frontend and check it appears in Atlas under **Browse Collections**.

---

## Part 6 — Dockerize the backend

1. Make sure Docker Desktop is open and running.
2. In the VS Code terminal:
   ```bash
   cd backend
   docker build -t civic-grievance-backend .
   ```
   This takes a minute or two the first time.
3. Run the container locally to confirm it works:
   ```bash
   docker run -p 8080:8080 --env-file .env -e PORT=8080 civic-grievance-backend
   ```
4. Visit http://localhost:8080 — you should see the same JSON response as before, now served from inside a container.
5. Stop it with `Ctrl+C` when you're done checking.

---

## Part 7 — Deploy the backend to Google Cloud Run

1. Log in to the Google Cloud CLI:
   ```bash
   gcloud auth login
   ```
2. Create a project (or use an existing one — replace `civic-grievance-app` with a globally unique ID):
   ```bash
   gcloud projects create civic-grievance-app --set-as-default
   ```
3. **Link a billing account** to the project in the Cloud Console (https://console.cloud.google.com/billing) — Cloud Run's free tier is generous, but a billing account must be attached even to use it.
4. Enable the required APIs:
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
   ```
5. From inside the `backend` folder, deploy directly from source (Cloud Build will containerize it for you using your Dockerfile):
   ```bash
   gcloud run deploy civic-grievance-backend \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars MONGO_URI="<your-mongodb-connection-string>",DB_NAME="civic_grievance_db",ALLOWED_ORIGINS="*"
   ```
   Replace `<your-mongodb-connection-string>` with the real Atlas URI. Keep the quotes.
6. After a minute or two, it prints a **Service URL** like:
   ```
   https://civic-grievance-backend-xxxxxxxxxx-uc.a.run.app
   ```
   Open it in your browser — you should see the same JSON response, now live on the internet. Visit `<that-url>/docs` to test it.

**Keeping your Mongo URI secret:** passing it with `--set-env-vars` on the command line is fine for a student project. For extra credit, use **Secret Manager** instead:
```bash
echo -n "<your-mongodb-connection-string>" | gcloud secrets create mongo-uri --data-file=-
gcloud run deploy civic-grievance-backend --source . --region us-central1 \
  --allow-unauthenticated --set-secrets MONGO_URI=mongo-uri:latest
```

---

## Part 8 — Deploy the frontend

The simplest option is **Vercel** (free, and built for React apps).

1. Push your latest code to GitHub first (see Part 4's commands) if you haven't already.
2. Go to https://vercel.com and sign up/log in with your GitHub account.
3. Click **Add New... > Project**, select your `civic-grievance-analysis-system` repo.
4. Set the **Root Directory** to `frontend` (important — the repo has both frontend and backend).
5. Under **Environment Variables**, add:
   - `REACT_APP_API_URL` = your Cloud Run backend URL from Part 7 (e.g. `https://civic-grievance-backend-xxxxxxxxxx-uc.a.run.app`)
6. Click **Deploy**. In a minute you'll get a live URL like `https://civic-grievance-analysis-system.vercel.app`.
7. Open it and submit a complaint to confirm the deployed frontend talks correctly to the deployed backend.

### Tighten CORS (optional but recommended)
Once you know your Vercel URL, redeploy the backend with it locked down instead of `*`:
```bash
gcloud run deploy civic-grievance-backend --source . --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ALLOWED_ORIGINS="https://civic-grievance-analysis-system.vercel.app"
```

---

## Part 9 — (Optional) Add CI/CD with GitHub Actions

If you want automatic redeployment on every push — and a legitimate "CI/CD pipeline" bullet point — add this file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend to Cloud Run

on:
  push:
    branches: [main]
    paths:
      - "backend/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - id: auth
        uses: google-github-actions/auth@v2
        with:
          credentials_json: "${{ secrets.GCP_SA_KEY }}"

      - uses: google-github-actions/setup-gcloud@v2

      - name: Deploy to Cloud Run
        working-directory: backend
        run: |
          gcloud run deploy civic-grievance-backend \
            --source . \
            --region us-central1 \
            --project ${{ secrets.GCP_PROJECT_ID }} \
            --allow-unauthenticated \
            --set-secrets MONGO_URI=mongo-uri:latest
```

To make this work you'd need to create a Google Cloud **service account** with the Cloud Run Admin + Cloud Build Editor roles, download its JSON key, and add it plus your project ID as **GitHub repo secrets** (`Settings > Secrets and variables > Actions`) named `GCP_SA_KEY` and `GCP_PROJECT_ID`. This is the one part worth doing only if you have time before your interview — it's a genuine CI/CD pipeline, but it has more moving pieces than Parts 1–8.

---

## Part 10 — Update your resume

Once your backend is live, add the actual URL to your project bullet, e.g.:

> Deployed at `https://civic-grievance-backend-xxxxxxxxxx-uc.a.run.app` (API) and `https://civic-grievance-analysis-system.vercel.app` (frontend)

Be ready to explain in an interview:
- Why Cloud Run (serverless, scales to zero, no server management) instead of a VM
- What Docker actually does (packages the app + its dependencies into a portable image)
- Why secrets go in environment variables / Secret Manager instead of hardcoded in the code
- How the NLP classification works (TF-IDF vectorization + Naive Bayes) and its limitation (small seed dataset — a real system would retrain on actual complaint history)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ModuleNotFoundError` when running uvicorn | Make sure your virtual environment is activated (`(venv)` should show in the prompt) and you ran `pip install -r requirements.txt` |
| Frontend shows "Could not reach the backend API" | Check the backend terminal is running and `REACT_APP_API_URL` in `frontend/.env` matches it |
| `gcloud: command not found` | Restart your terminal after installing the Cloud SDK, or re-check it was added to PATH |
| Cloud Run deploy fails with a billing error | Link a billing account to your GCP project in the Cloud Console |
| MongoDB connection times out | Double-check Network Access in Atlas allows `0.0.0.0/0`, and that the password in your URI doesn't contain unencoded special characters |
