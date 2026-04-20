# ⚡ AI Career Twin – Career Decision Simulator

A full-stack AI-powered web application that analyzes your resume, extracts skills with NLP, recommends career paths, shows skill gaps, simulates future outcomes, and provides an intelligent career advisor chatbot.

---

## 📁 Project Structure

```
ai-career-twin/
├── frontend/                   # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   └── index.js        # Axios API service layer
│   │   ├── components/
│   │   │   └── Layout.js       # Sidebar navigation layout
│   │   ├── pages/
│   │   │   ├── UploadPage.js   # Resume upload with drag-and-drop
│   │   │   ├── DashboardPage.js# Skills + career recommendations
│   │   │   ├── GapAnalysisPage.js # Skill gap analysis
│   │   │   ├── SimulationPage.js  # Career outcome simulation
│   │   │   └── ChatbotPage.js  # AI career advisor chat
│   │   ├── styles/
│   │   │   └── global.css      # Design system / global styles
│   │   ├── App.js              # Root with React Router
│   │   └── index.js            # Entry point
│   ├── package.json
│   └── .env.example
│
├── backend/                    # FastAPI backend
│   ├── routes/
│   │   ├── resume.py           # Upload & parse resume
│   │   ├── career.py           # Recommend / gap / simulate
│   │   └── chatbot.py          # AI chat endpoint
│   ├── main.py                 # FastAPI app + CORS
│   ├── requirements.txt
│   └── .env.example
│
├── ml/                         # Machine Learning modules
│   ├── resume_parser.py        # PDF text + skill extraction (spaCy)
│   ├── recommendation.py       # TF-IDF cosine similarity matching
│   ├── skill_gap.py            # Gap analysis + priority tiers
│   └── simulation.py           # Job probability + salary projection
│
├── database/
│   └── db.py                   # SQLite + SQLAlchemy models
│
├── render.yaml                 # Render deployment config
├── vercel.json                 # Vercel deployment config
├── .gitignore
└── README.md
```

---

## ✅ Features

| Feature | Status | Tech |
|---|---|---|
| Resume Upload (PDF) | ✅ | pdfplumber, FastAPI |
| Skill Extraction (NLP) | ✅ | spaCy + keyword matching |
| Career Recommendations | ✅ | TF-IDF cosine similarity |
| Skill Gap Analysis | ✅ | Set comparison + prioritization |
| Outcome Simulation | ✅ | Probabilistic model + salary projection |
| 5-Year Salary Chart | ✅ | Recharts AreaChart |
| AI Chatbot Advisor | ✅ | Rule-based + LLM-ready |
| SQLite Database | ✅ | SQLAlchemy ORM |

---

## 🔧 LOCAL SETUP GUIDE (Step-by-Step)

### Prerequisites

Make sure you have these installed:
- **Python 3.10+** → https://python.org
- **Node.js 18+** → https://nodejs.org
- **pip** (comes with Python)
- **npm** (comes with Node.js)

---

### Step 1 – Clone / Extract the Project

```bash
# If from ZIP:
unzip ai-career-twin.zip
cd ai-career-twin

# Or if using git:
git clone <your-repo-url>
cd ai-career-twin
```

---

### Step 2 – Set Up the Backend (Python / FastAPI)

```bash
# Navigate to backend folder
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment:
# On macOS / Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Download the spaCy English language model
python -m spacy download en_core_web_sm
```

**Important:** The backend also needs access to the `ml/` and `database/` folders.
Run it from the **project root** (not from inside `/backend`):

```bash
# Go back to project root
cd ..

# Run FastAPI server
uvicorn backend.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

✅ Backend is live at: **http://localhost:8000**
✅ API docs at: **http://localhost:8000/docs** (Swagger UI)

---

### Step 3 – Set Up the Frontend (React)

Open a **new terminal window** (keep backend running):

```bash
# Navigate to frontend folder
cd ai-career-twin/frontend

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the React development server
npm start
```

Your browser will automatically open:
✅ Frontend at: **http://localhost:3000**

---

### Step 4 – Connecting Frontend ↔ Backend

The frontend is pre-configured to call `http://localhost:8000`.

If you change the backend port, update `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:8000
```

Then restart the React dev server.

---

### Step 5 – Test the App

1. Open http://localhost:3000
2. Upload a PDF resume using drag-and-drop
3. Watch skills get extracted automatically
4. Browse your career recommendations
5. Run a skill gap analysis on any career
6. Simulate outcomes with salary charts
7. Chat with the AI advisor

---

## 🚀 DEPLOYMENT GUIDE

### Deploy Backend → Render (Free)

1. **Create account** at https://render.com

2. **Push your project to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/ai-career-twin.git
   git push -u origin main
   ```

3. **On Render:**
   - Click **New → Web Service**
   - Connect your GitHub repo
   - Fill in settings:
     - **Root Directory:** `backend`
     - **Runtime:** Python 3
     - **Build Command:**
       ```
       pip install -r requirements.txt && python -m spacy download en_core_web_sm
       ```
     - **Start Command:**
       ```
       uvicorn main:app --host 0.0.0.0 --port $PORT
       ```
   - Click **Deploy**

4. **Copy your Render URL** (e.g., `https://ai-career-twin.onrender.com`)

---

### Deploy Frontend → Vercel (Free)

1. **Create account** at https://vercel.com

2. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

3. **Set your backend URL** in `frontend/.env`:
   ```env
   REACT_APP_API_URL=https://ai-career-twin.onrender.com
   ```

4. **Build and deploy:**
   ```bash
   cd frontend
   npm run build
   vercel --prod
   ```
   Follow the prompts (select project root as `frontend/`).

5. **Or deploy via Vercel Dashboard:**
   - Go to https://vercel.com/new
   - Import your GitHub repo
   - Set **Root Directory** to `frontend`
   - Add environment variable:
     - Key: `REACT_APP_API_URL`
     - Value: your Render URL
   - Click Deploy

✅ Your app is now live!

---

### CORS Configuration for Production

In `backend/main.py`, update the `allow_origins` for production:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],  # your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📦 HOW TO CREATE A ZIP FILE

### On macOS / Linux:
```bash
# From the parent directory of ai-career-twin/
zip -r ai-career-twin.zip ai-career-twin/ \
  --exclude "*/node_modules/*" \
  --exclude "*/__pycache__/*" \
  --exclude "*/venv/*" \
  --exclude "*/.env" \
  --exclude "*/build/*" \
  --exclude "*.db"

echo "✅ ZIP created: ai-career-twin.zip"
```

### On Windows (PowerShell):
```powershell
# From the parent directory of ai-career-twin/
Compress-Archive -Path ai-career-twin -DestinationPath ai-career-twin.zip -Force
Write-Host "ZIP created: ai-career-twin.zip"
```

### Using VS Code:
1. Right-click the `ai-career-twin` folder in the Explorer
2. Select **"Download"** (if using VS Code web) or use the terminal above

---

## 🛠️ TROUBLESHOOTING

| Problem | Fix |
|---|---|
| `spacy` model not found | Run: `python -m spacy download en_core_web_sm` |
| Port 8000 in use | Change port: `uvicorn backend.main:app --port 8001` |
| CORS errors | Check `REACT_APP_API_URL` in `frontend/.env` |
| `ModuleNotFoundError: ml` | Run uvicorn from project root, not from `/backend` |
| `pdfplumber` can't read PDF | Ensure the file is a real PDF, not a renamed image |
| Frontend can't connect | Make sure backend is running on port 8000 |

---

## 🔮 Upgrade Ideas

- **Replace rule-based chatbot** with OpenAI GPT-4 or Claude API
- **Add user authentication** (JWT + PostgreSQL)
- **Add LinkedIn job scraping** to show real openings
- **Use sentence-transformers** for deeper semantic skill matching
- **Add email reports** with career insights PDF

---

## 📄 License

MIT License – free to use, modify, and distribute.

---

Built with ❤️ using FastAPI · React · spaCy · Recharts
