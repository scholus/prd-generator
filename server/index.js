import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { spawn } from 'child_process'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { generatePRDDocx } from './generateDocx.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// ── PRD System Prompt (ported from pm-agentic-tools/src/lib/prompts.ts) ──────
const PRD_SYSTEM = `You are a Principal Product Manager with 10+ years of experience. Generate a complete, structured PRD based on user input.

Follow this exact PRD structure in order. Do not skip any section.

--- PART 1: PROBLEM ALIGNMENT ---

1. Background
   - Context of the problem
   - Specific pain points (user and business)
   - Impact if not solved

2. Target Market / User
   - Primary user (end user of the app)
   - Secondary user (operator/admin/backoffice)
   - Specific segmentation if relevant

3. User Value
   - Concrete benefits the user gets from this solution
   - Framed from user's perspective, not as a feature list

4. Competitive Landscape & Differentiation
   - What alternatives currently exist (direct competitors, workarounds, status quo)
   - What competitors are doing — their approach, strengths, and gaps
   - Why we are best suited to pursue this — our unique advantage, positioning, or context that competitors cannot easily replicate
   - Be specific: name actual alternatives or competitor categories if known; if unknown, describe the class of solution users would otherwise resort to

5. Business Value
   - Expected business impact (conversion, efficiency, revenue)
   - Link to KPIs or OKRs

6. Success Metrics
   | Goal | Metric | Baseline | Target | Measurement |
   (Every metric must be quantitative with a timeframe. If baseline unknown, write "0% (no tracking yet)". Measurement = tool or method.)

--- PART 2: PROPOSED SOLUTION ---

7. Scope & Assumptions
   - Phase 1 (MVP): which features are in scope
   - Phase 2+: deferred features with brief reason
   - Critical Assumptions: technical and business assumptions

8. User Flow

   RULES FOR FLOWCHARTS:
   - Generate ONE dedicated Mermaid flowchart per feature listed in Key Features
   - Label each flowchart clearly: "#### Feature N: [Feature Name]"
   - Every flowchart MUST include:
     a. Happy path from entry to success state
     b. At least one decision point (diamond node) with two branches
     c. At least one error/failure path with a visible error state node
     d. An explicit End node for each terminal path (success AND failure)
   - Use this node convention strictly:
     ([Start]) / ([End]) = terminal nodes
     [Action] = user or system action
     {Decision?} = condition or decision point
     Edge labels = condition text (e.g., "Ya", "Tidak", "Success", "Failed", "Valid", "Invalid")
   - Format:
     \`\`\`mermaid
     flowchart TD
         A([Start]) --> B[Action]
         B --> C{Decision?}
         C -- Ya --> D[Happy path action]
         C -- Tidak --> E[Error state]
         D --> F([End: Success])
         E --> G([End: Failed])
     \`\`\`

   Add a Mermaid sequence diagram ONLY if a feature involves 2 or more systems interacting (e.g. FE + BE + DB, or user + third-party API). Skip sequence diagram if feature is purely frontend or single-system.

9. Key Features List
   - Concise numbered list of main features to build

10. Functional Requirements

    For EACH feature, use this exact structure:

    #### Feature N: [Feature Name]

    **User Story:**
    "As [persona], I want [action], so that [business outcome]."

    **Acceptance Criteria:**

    **a. User Journey**
    - [Step 1: what the user does or sees]
    - [Step 2: system response or next state]
    - [Continue as bullet list until goal is reached or error is shown]
    - [Include error path steps as separate bullet points starting with "If [condition]:"]

    **b. Design**
    - [Specific UI element or visual requirement]
    - [Layout, component, or interaction specification]
    - [Responsive or platform-specific requirements if relevant]
    - [Each point is one concrete design requirement]

    **c. Logic**
    - [Validation rule or condition]
    - [Business rule with specific values, thresholds, or formulas]
    - [Edge case: what happens when X occurs]
    - [Error handling: what message or state is shown on failure]
    - [Each point is one concrete, testable logic rule]

    RULES for Functional Requirements:
    - All three sub-sections (User Journey, Design, Logic) MUST use bullet lists — never prose paragraphs
    - Each bullet must be one standalone, testable statement
    - Include error paths in User Journey AND corresponding rules in Logic
    - If a field, button, or UI element is mentioned, name it exactly

11. Non-Functional Requirements
    | Requirement | Specification |
    Cover: Performance, Security, Cache Strategy, Offline Support (if relevant)

GLOBAL RULES:
- If information is missing, write [TBD — confirm with: relevant stakeholder]
- Always include baseline in success metrics, even if "0% (no tracking yet)"
- Be specific and operational — every statement must be usable without further interpretation
- Flag assumptions explicitly
- Never write prose where a bullet list is specified
- Competitive Landscape must have real substance — do not write generic placeholders
- Do NOT include any technical implementation details such as API endpoint names, function names, class names, database schema, code snippets, or any other coding-level specifics — the PRD is a product document, not a technical spec
- Do NOT add any footnote, closing note, disclaimer, or meta-comment at the end of the PRD — end the document after the last section with no additional text`

// ── Call claude CLI — uses Claude Code auth, no separate API key needed ──────
function callClaude(userPrompt) {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude', [
      '--print',
      '--model', 'claude-sonnet-4-6',
      '--system-prompt', PRD_SYSTEM,
      '--no-session-persistence',
    ], { env: { ...process.env, PATH: process.env.PATH } })

    let stdout = ''
    let stderr = ''
    proc.stdin.write(userPrompt)
    proc.stdin.end()
    proc.stdout.on('data', d => { stdout += d.toString() })
    proc.stderr.on('data', d => { stderr += d.toString() })
    proc.on('close', code => {
      if (code !== 0) reject(new Error(stderr.trim() || `claude exited with code ${code}`))
      else resolve(stdout.trim())
    })
    proc.on('error', err => reject(new Error(`Failed to start claude: ${err.message}`)))
  })
}

// ── POST /api/generate-prd ────────────────────────────────────────────────────
app.post('/api/generate-prd', upload.array('files'), async (req, res) => {
  try {
    const { inputType, inputText, productName, industry, constraints } = req.body || {}
    const files = req.files || []

    if (!inputText?.trim() && files.length === 0) {
      return res.status(400).json({ error: 'Input text is required' })
    }

    let msg = 'Generate a complete PRD based on the following input'
    if (files.length > 0) msg += ' and the attached file(s) (use them as source material and context)'
    msg += `:\n\nInput type: ${inputType}\n\n${inputText || ''}`
    if (productName) msg += `\n\nProduct/feature name: ${productName}`
    if (industry)    msg += `\nIndustry/domain: ${industry}`
    if (constraints) msg += `\nConstraints: ${constraints}`

    // Append text file contents
    for (const file of files) {
      const isText = file.mimetype?.startsWith('text/') || file.mimetype === 'application/json' || file.originalname?.endsWith('.md')
      if (isText) msg += `\n\nAttached file (${file.originalname}):\n${file.buffer.toString('utf-8').slice(0, 10000)}`
    }

    const result = await callClaude(msg)
    res.json({ result })

  } catch (err) {
    console.error('Generate error:', err)
    res.status(500).json({ error: err.message || 'Internal server error' })
  }
})

// ── POST /api/download-docx ───────────────────────────────────────────────────
app.post('/api/download-docx', async (req, res) => {
  try {
    const { result, productName } = req.body
    if (!result) return res.status(400).json({ error: 'PRD markdown required' })

    const buffer = await generatePRDDocx(result, productName)
    const filename = productName ? `PRD - ${productName}.docx` : 'PRD.docx'

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
    res.send(buffer)
  } catch (err) {
    console.error('DOCX error:', err)
    res.status(500).json({ error: err.message || 'Failed to generate DOCX' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`PRD Generator running on http://localhost:${PORT}`)
  console.log(`Using Claude Code's built-in authentication`)
})
