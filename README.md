# Itera

> Version control for AI prompts. Iterate faster, ship confidently.

Itera is a prompt engineering workbench that brings software development best practices to LLM prompt management. Track versions like Git, compare outputs side-by-side, and let AI suggest improvements—all while maintaining complete reproducibility.

---

## The Problem

Prompt engineering today is chaotic:
- No version history → lost track of what worked
- No reproducibility → can't verify what produced an output  
- No systematic comparison → guessing which version is better
- No improvement workflow → manual trial-and-error at scale

---

## The Solution

Itera provides four core capabilities:

### 1. Git-like Versioning
- Automatic version numbering (v1, v2, v3...)
- Parent tracking for complete lineage
- Diff viewing between any two versions
- Instant rollback to previous versions

### 2. Reproducible Runs
- Every run stores complete audit trail
- Template variable rendering with full transparency
- Re-run any execution with identical configuration
- Error tracking and status monitoring

### 3. Fast A/B Comparison
- Side-by-side output comparison
- Identical input for fair testing
- Human decision recording (A better / B better / tie)
- Comparison history and notes

### 4. AI-Assisted Improvement
- Describe what went wrong in plain English
- System suggests improved prompt with diff preview
- Manual approval → auto-compare vs current version
- Tight feedback loop: critique → suggest → validate → apply

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- [Ollama](https://ollama.ai) running locally with models installed

```bash
# Start Ollama
ollama serve

# Pull a model (if not already installed)
ollama pull llama3.1:8b
```

### Installation

```bash
# Clone repository
git clone <repo-url>
cd Itera

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies  
cd ../frontend
npm install

# Start development servers
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Core Workflow

### 1. Create & Version
```
1. Create prompt: "Support Agent"
2. Edit content with variables: "Help customer with: {issue}"
3. Save → auto-creates v1
4. Edit again → auto-creates v2 (parent: v1)
5. View diff, rollback, or keep iterating
```

### 2. Run & Audit
```
1. Select version to run
2. Provide input JSON: { "issue": "refund request" }
3. Execute → stores everything (input, rendered prompt, output, params)
4. View full run details
5. Re-run identically any time
```

### 3. Compare & Decide
```
1. Select two versions to compare
2. Use same input for both
3. View outputs side-by-side
4. Record decision: which is better?
5. Build confidence through direct comparison
```

### 4. Improve & Validate
```
1. Identify problem run
2. Describe issue: "Too verbose, be concise"
3. System suggests improved prompt (with diff)
4. Apply suggestion → creates new version
5. Auto-compare old vs new
6. Record whether improvement worked
```

---

## Architecture

**Frontend:** Vite + React + TypeScript  
**Backend:** Express + TypeScript  
**Database:** SQLite (local file)  
**LLM Provider:** Ollama (local)  

```
frontend/          # React SPA
├── src/
│   ├── components/
│   ├── pages/
│   └── api/

backend/           # Express API
├── src/
│   ├── routes/
│   ├── services/
│   └── db/

data/              # SQLite database
└── itera.db
```

---

## Key Features

**Prompt Management**
- ✅ Create, edit, version prompts
- ✅ Template variables (`{var_name}`)
- ✅ Default version pointer
- ✅ Rollback to any version
- ✅ Version lineage tracking

**Execution & Audit**
- ✅ Execute against Ollama models
- ✅ Full reproducibility metadata
- ✅ Input hashing for deduplication
- ✅ Error handling & status tracking
- ✅ Token counting (when available)

**Comparison & Testing**
- ✅ A/B testing workflow
- ✅ Side-by-side output display
- ✅ Decision recording with notes
- ✅ Comparison history

**AI-Assisted Improvement**
- ✅ Optimizer prompt (versioned)
- ✅ User feedback → suggested changes
- ✅ Diff preview before apply
- ✅ Auto-validation via comparison
- ✅ Improvement audit trail

---

## Development Phases

This project is built in 4 phases, each independently demoable:

- **Phase 0:** Foundation (0.5-1 day) - Project skeleton, database, Ollama integration
- **Phase 1:** Versioning (1-1.5 days) - Git-like prompt management
- **Phase 2:** Runs (1.5-2 days) - Reproducible execution with audit trails
- **Phase 3:** Comparison (1 day) - A/B testing workflow
- **Phase 4:** Improve (1.5-2 days) - AI-assisted improvement loop

**Total Timeline:** 5.5-7.5 days for complete POC

See detailed phase documentation in `.context/phases/`

---

## Configuration

### Backend `.env`
```env
PORT=3001
DATABASE_PATH=./data/itera.db
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_DEFAULT_MODEL=llama3.1:8b
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`
```env
VITE_API_BASE_URL=http://localhost:3001
```

---

## Demo Script (3 minutes)

1. **Create mediocre v1** → run it → see okay output
2. **Click Improve** → enter "Too verbose, be concise"
3. **View suggested changes** → see diff highlighting improvements
4. **Apply suggestion** → auto-creates v2 (parent: v1)
5. **Auto-compare** v1 vs v2 → see side-by-side outputs
6. **Pick winner** → "v2 is better"
7. **Rollback to v1** → prove safety and version control
8. **Re-run old execution** → demonstrate full reproducibility

**Message:** "Prompt engineering that feels like software engineering. Version control, reproducibility, systematic testing, and AI-assisted improvement—all in one tight loop."

---

## Roadmap (Post-POC)

**Branching & Merging**
- Multiple prompt variants from same parent
- Merge improvements back to main line

**Test Suites**
- Automated regression testing
- Batch evaluation across versions

**Analytics**
- Success rate tracking
- Latency trends
- Cost monitoring (for cloud models)

**Collaboration**
- Team workflows
- Approval processes
- Shared prompt libraries

**Integrations**
- Cloud LLM providers (OpenAI, Anthropic, etc.)
- CI/CD pipelines
- API for programmatic access

**Meta-Optimization**
- Optimizer that improves the optimizer
- Multi-shot refinement
- Automated improvement campaigns

---

## Why Itera?

**For Individual Engineers:**
- Stop losing track of prompt iterations
- Build confidence through systematic comparison
- Accelerate improvement with AI assistance

**For Teams:**
- Share prompts with complete history
- Audit what changed and why
- Reproduce results reliably

**For Production:**
- Version control for deployed prompts
- Rollback instantly when issues arise
- Track improvements over time

---

## License

MIT

---

## Contributing

This is a POC implementation. Contributions, feedback, and ideas welcome!

**Current Status:** Phase 0 (Planning Complete)

---

## Contact

Questions? Issues? Ideas?  
Open an issue or reach out!
