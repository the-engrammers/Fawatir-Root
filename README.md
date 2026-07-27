Here is a production-ready section you can paste directly into your project's `README.md` (or a `CONTRIBUTING.md` file).

This guide sets explicit expectations for the rest of your team, outlines Phase 4 integration rules, and defines the QA guardrails for opening Pull Requests.

---

# 🛠️ Team Onboarding & Contribution Guide (Phase 4 & Beyond)

Welcome to the team! To keep our codebase clean, automated, and ready for production, **all developers must follow this workflow**.

---

## 🚀 1. Developer Quickstart (Running locally with Docker)

Never run servers individually on your host machine. We use Docker so everyone runs the exact same Python, Node, and Tesseract environment.

### First-Time Setup

1. Clone the repository and navigate to the project root.
2. Copy the example environment variables file:
```bash
cp .env.example .env

```


3. Fill in your local `.env` values (ask P7/DevOps for the shared Supabase keys).
4. Spin up the entire environment (Frontend + Backend + AI Ollama Engine):
```bash
docker compose up --build

```



### Local Services Map

* 🌐 **Frontend (Next.js):** `http://localhost:3000`
* ⚡ **Backend API (Django DRF):** `http://localhost:8000`
* 📄 **OCR Test Page:** `http://localhost:8000/scanner/`
* 📊 **Spreadsheet Import Test Page:** `http://localhost:8000/import/`
* 🤖 **Ollama Engine:** `http://localhost:11434` *(automatically pulls `qwen2.5:3b-instruct` on first startup)*

---

## 📦 2. Phase 4 Technical Requirements (Frontend & Backend Devs)

To ensure your code packages correctly inside our production Docker containers, you **must** adhere to these rules:

### A. Next.js Config Requirement (`next.config.js`)

Frontend developers **must** ensure the standalone build option is turned on:

```javascript
// next.config.js
module.exports = {
  output: 'standalone', // Required for Docker containerization
  // ... rest of your config
}

```

### B. Dynamic PDF & Font Rules

* All invoice and document templates generated via `react-pdf` must support **Arabic, French, and English**.
* Do not rely on local desktop fonts. Use bundled web fonts (e.g., Google's *Amiri* for Arabic) placed inside `public/fonts/` so the Linux Docker container can render them.

### C. Multilingual UI (`next-intl`)

* **Zero hardcoded text strings in UI components.**
* Every label, button, and error message must use `next-intl` translation keys in `/messages/en.json`, `/messages/fr.json`, and `/messages/ar.json`.

---

## 🛡️ 3. Phase 5 Definition of Done (Pull Request Workflow)

> ⛔ **Direct pushes to `main` are locked.** All work must be submitted via Pull Requests.

### Git Branch Naming Strategy

When starting a task, create a branch off `main` using this naming pattern:

* `feature/invoice-pdf-export`
* `fix/ocr-arabic-parsing`
* `docs/update-api-routes`

### The Checklist before opening a PR

Before requesting a code review from P7 (DevOps/QA), confirm your branch hits these points:

* [ ] **Container Startup:** Does `docker compose up --build` compile without throwing errors?
* [ ] **No Exposed Secrets:** Did you verify no Supabase service keys, database passwords, or private tokens are hardcoded into the commit?
* [ ] **Translations Complete:** Are all user-facing strings translated using `next-intl` keys for Arabic, French, and English?
* [ ] **Clean Code:** Are all debug `console.log()` statements, `print()` calls, and local temporary test URLs removed?
* [ ] **Data Security:** Do all Supabase/Django queries enforce Row Level Security (RLS) so users cannot access another company's records?

### What Happens When You Submit a PR?

1. **Automated CI Check:** GitHub Actions will immediately build both the Django and Next.js Docker images in the cloud.
2. **Review:** Your PR will show a green checkmark (`Validate Docker Builds`) if it compiles.
3. **Approval:** Once CI passes and P7 approves the code review, your PR will be merged into `main`.

---

## ❓ 4. Troubleshooting & Helpful Docker Commands

* **Rebuild a specific container after changing dependencies (`package.json` or `requirements.txt`):**
```bash
docker compose build --no-cache backend

```


* **View live backend logs (Django & Tesseract errors):**
```bash
docker compose logs -f backend

```


* **View live AI logs (Ollama processing status):**
```bash
docker compose logs -f ollama

```


* **Reset local database volume (if models crash):**
```bash
docker compose down -v

```
