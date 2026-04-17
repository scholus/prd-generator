import { useState, useRef, useCallback, useEffect } from 'react'

const TABS = ['Rough brief', 'Bullet list', 'Meeting transcript']

const PLACEHOLDERS = {
  'Rough brief': 'Paste your rough brief here — problem statement, target users, desired outcome, anything you have...',
  'Bullet list': 'Add bullet points describing the feature or product...\n• Problem to solve\n• Target users\n• Key features\n• Success criteria',
  'Meeting transcript': 'Paste meeting transcript here — the agent will extract requirements and flag what\'s missing as [TBD].',
}

// ── Markdown → HTML renderer (ported from pm-agentic-tools/PrdGenerator.tsx) ─
function renderMarkdown(md) {
  let html = md
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  html = html.replace(/```[\w]*\n([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trimEnd()}</code></pre>`)
  html = html.replace(/^[ \t]*[-*_]{3,}[ \t]*$/gm, '<hr>')
  html = html.replace(/^---\s+(.+?)\s+---$/gm, '<div class="prd-divider">— $1 —</div>')
  html = html.replace(/^#{6}\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^#{5}\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
  html = html.replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/((?:^\|.+\|\n)+)/gm, (block) => {
    const lines = block.trim().split('\n')
    if (lines.length < 2) return block
    const isHeader = /^\|[\s\-:|]+\|/.test(lines[1])
    let t = '<table>'
    lines.forEach((line, i) => {
      if (isHeader && i === 1) return
      const cells = line.split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1)
      const tag = (isHeader && i === 0) ? 'th' : 'td'
      t += '<tr>' + cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('') + '</tr>'
    })
    return t + '</table>'
  })
  html = html.replace(/((?:^[ \t]*[-*+]\s+.+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => l.replace(/^[ \t]*[-*+]\s+/, ''))
    return '<ul>' + items.map(i => `<li>${i}</li>`).join('') + '</ul>'
  })
  html = html.replace(/((?:^[ \t]*\d+\.\s+.+\n?)+)/gm, (block) => {
    const items = block.trim().split('\n').map(l => l.replace(/^[ \t]*\d+\.\s+/, ''))
    return '<ol>' + items.map(i => `<li>${i}</li>`).join('') + '</ol>'
  })
  html = html.replace(/^(?!<[a-zA-Z\/])(.+)$/gm, '<p>$1</p>')
  html = html.replace(/<p>\s*<\/p>/g, '')
  html = html.replace(/<p>(<h[1-6]>)/g, '$1')
  html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1')
  html = html.replace(/<p>(<ul>|<ol>|<table>|<pre>|<hr>|<div)/g, '$1')
  html = html.replace(/(<\/ul>|<\/ol>|<\/table>|<\/pre>)<\/p>/g, '$1')
  return html
}

// ── Print CSS for PDF export ──────────────────────────────────────────────────
const PRINT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;1,400&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',sans-serif;color:#1a1a1a;padding:48px 56px;font-size:10pt;line-height:1.75;max-width:900px;margin:0 auto}
h1{font-size:22px;font-weight:700;color:#111;margin:0 0 10px;padding-bottom:10px;border-bottom:2px solid #111}
h2{font-size:17px;font-weight:700;color:#111;margin:28px 0 8px;padding-bottom:6px;border-bottom:0.5px solid #e0e0e0}
h3{font-size:15px;font-weight:600;color:#333;margin:18px 0 6px}
h4{font-size:14px;font-weight:600;color:#555;margin:14px 0 4px}
p{margin:0 0 10px;color:#333;font-size:10pt}
ul,ol{margin:6px 0 12px 20px;color:#333;font-size:10pt}
li{margin-bottom:4px}
strong{font-weight:700;color:#111}
em{font-style:italic}
code{font-family:'SF Mono','Consolas',monospace;font-size:9pt;background:#f3f4f6;padding:2px 5px;border-radius:3px}
pre{background:#f3f4f6;border-radius:6px;padding:12px 14px;overflow-x:auto;margin:10px 0;font-size:9pt}
hr{border:none;border-top:0.5px solid #e0e0e0;margin:22px 0}
table{width:100%;border-collapse:collapse;margin:12px 0;font-size:10pt}
th{background:#f5f5f5;font-weight:700;text-align:left;padding:8px 10px;border:0.5px solid #ddd;color:#333}
td{padding:7px 10px;border:0.5px solid #e5e5e5;color:#444;vertical-align:top;font-size:10pt}
tr:nth-child(even) td{background:#fafafa}
.prd-divider{text-align:center;color:#bbb;font-size:10pt;letter-spacing:2px;margin:28px 0 20px;font-weight:500}
`

export default function App() {
  const [activeTab, setActiveTab] = useState('Rough brief')
  const [inputs, setInputs] = useState({ 'Rough brief': '', 'Bullet list': '', 'Meeting transcript': '' })
  const [productName, setProductName] = useState('')
  const [industry, setIndustry] = useState('')
  const [constraints, setConstraints] = useState('')
  const [attachedFiles, setAttachedFiles] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [prdResult, setPrdResult] = useState(null)   // raw markdown string
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const fileInputRef = useRef(null)

  const handleInputChange = (e) => setInputs(prev => ({ ...prev, [activeTab]: e.target.value }))

  const handleFileSelect = (files) => {
    const newFiles = Array.from(files).filter(f =>
      f.size <= 20 * 1024 * 1024 &&
      /\.(pdf|png|jpg|jpeg|webp|gif|txt|md|csv|json|xml|yaml|yml)$/i.test(f.name)
    )
    setAttachedFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files)
  }, [])

  const removeFile = (idx) => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))

  const handleClear = () => {
    setInputs({ 'Rough brief': '', 'Bullet list': '', 'Meeting transcript': '' })
    setProductName(''); setIndustry(''); setConstraints('')
    setAttachedFiles([]); setPrdResult(null); setError(null)
  }

  const handleGenerate = async () => {
    const currentInput = inputs[activeTab].trim()
    if (!currentInput && attachedFiles.length === 0) { setError('Please enter some content before generating.'); return }
    setIsGenerating(true); setError(null); setPrdResult(null)

    try {
      const formData = new FormData()
      formData.append('inputType', activeTab)
      formData.append('inputText', currentInput)
      formData.append('productName', productName)
      formData.append('industry', industry)
      formData.append('constraints', constraints)
      attachedFiles.forEach(f => formData.append('files', f))

      const res = await fetch('/api/generate-prd', { method: 'POST', body: formData })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed to generate PRD') }

      // Consume SSE stream — render markdown as chunks arrive
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        // SSE lines end with \n\n
        const parts = buf.split('\n\n')
        buf = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6)
          if (payload === '[DONE]') continue
          try {
            const parsed = JSON.parse(payload)
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) { accumulated += parsed.text; setPrdResult(accumulated) }
          } catch (e) { if (e.message !== 'Unexpected token') throw e }
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!prdResult) return
    try {
      const res = await fetch('/api/download-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result: prdResult, productName }),
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = productName ? `PRD - ${productName}.docx` : 'PRD.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { setError(err.message) }
  }

  const handlePrint = () => {
    const body = document.getElementById('prd-rendered-output')?.innerHTML ?? ''
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>PRD${productName ? ' - ' + productName : ''}</title><style>${PRINT_CSS}</style></head><body>${body}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(prdResult).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f5', fontFamily: "'Nunito', sans-serif" }}>

      {/* ── Left Panel — Input ─────────────────────────────────────────────── */}
      <div style={{
        width: prdResult ? 400 : '100%',
        maxWidth: prdResult ? 400 : 780,
        margin: prdResult ? 0 : '0 auto',
        flexShrink: 0,
        background: '#fff',
        borderRight: prdResult ? '1px solid #e5e5e5' : 'none',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 28px 24px',
        overflowY: 'auto',
        transition: 'width 0.3s ease',
      }}>

        {/* Tabs */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 8, fontWeight: 500 }}>Input type</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                border: activeTab === tab ? '1.5px solid #111' : '0.5px solid #ddd',
                background: activeTab === tab ? '#111' : '#fff',
                color: activeTab === tab ? '#fff' : '#666',
                fontWeight: activeTab === tab ? 600 : 400,
              }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Main textarea */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 6, fontWeight: 500 }}>{activeTab}</div>
          <textarea
            value={inputs[activeTab]}
            onChange={handleInputChange}
            placeholder={PLACEHOLDERS[activeTab]}
            style={{
              width: '100%', minHeight: 180, padding: '10px 12px',
              border: '0.5px solid #ddd', borderRadius: 8, fontSize: 14,
              color: '#1a1a1a', resize: 'vertical', outline: 'none',
              lineHeight: 1.6, fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = '#999'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
          />
          <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>
            The agent will extract what it can and flag what's missing as [TBD].
          </div>
        </div>

        {/* File attachment */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 6, fontWeight: 500 }}>
            Attach files <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            style={{
              border: `0.5px dashed ${isDragging ? '#93a8f4' : '#ccc'}`,
              borderRadius: 8, padding: '18px 14px', textAlign: 'center', cursor: 'pointer',
              background: isDragging ? '#f0f4ff' : '#fafafa',
            }}
          >
            <div style={{ fontSize: 13, color: '#888' }}>
              <strong style={{ color: '#444' }}>Klik atau drag &amp; drop</strong> file ke sini
            </div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>
              PDF, gambar (PNG/JPG/WEBP), atau teks (TXT, MD, CSV, JSON) — maks 20MB per file
            </div>
          </div>
          <input ref={fileInputRef} type="file" multiple
            accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.json,.xml,.yaml"
            style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files)} />
          {attachedFiles.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {attachedFiles.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: '#f0f4ff', border: '0.5px solid #c7d2fe', borderRadius: 6, padding: '6px 10px', fontSize: 13,
                }}>
                  <span style={{ color: '#3730a3', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{f.name}</span>
                  <button onClick={() => removeFile(i)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 16, lineHeight: 1, marginLeft: 8
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <hr style={{ border: 'none', borderTop: '0.5px solid #eee', margin: '4px 0 16px' }} />

        {/* Optional fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          {[
            { label: 'Product / feature name', value: productName, setter: setProductName, placeholder: 'e.g. Driver Incentive Dashboard' },
            { label: 'Industry / domain', value: industry, setter: setIndustry, placeholder: 'e.g. Logistics, Fintech, Healthcare' },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 5, fontWeight: 500 }}>
                {label} <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
              </div>
              <input type="text" value={value} onChange={e => setter(e.target.value)} placeholder={placeholder}
                style={{ width: '100%', padding: '8px 12px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13, color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                onFocus={e => e.target.style.borderColor = '#999'}
                onBlur={e => e.target.style.borderColor = '#ddd'}
              />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 5, fontWeight: 500 }}>
            Additional constraints <span style={{ fontWeight: 400, color: '#aaa' }}>(optional)</span>
          </div>
          <textarea value={constraints} onChange={e => setConstraints(e.target.value)}
            placeholder="Timeline, team size, tech stack, known limitations..." rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '0.5px solid #ddd', borderRadius: 8, fontSize: 13, color: '#1a1a1a', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, minHeight: 70 }}
            onFocus={e => e.target.style.borderColor = '#999'}
            onBlur={e => e.target.style.borderColor = '#ddd'}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleGenerate} disabled={isGenerating} style={{
            padding: '9px 20px', background: isGenerating ? '#555' : '#1a1a1a', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: isGenerating ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit',
          }}>
            {isGenerating ? <><Spinner /> Generating...</> : 'Generate PRD ↗'}
          </button>
          <button onClick={handleClear} style={{
            padding: '9px 18px', background: '#fff', color: '#1a1a1a',
            border: '0.5px solid #ccc', borderRadius: 8, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Clear</button>
          {isGenerating && <span style={{ fontSize: 13, color: '#2563eb' }}>Generating PRD...</span>}
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#fff0f0', border: '0.5px solid #fca5a5', borderRadius: 8, fontSize: 13, color: '#dc2626' }}>
            {error}
          </div>
        )}
      </div>

      {/* ── Right Panel — Output ───────────────────────────────────────────── */}
      {prdResult && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: '#f5f5f5', minWidth: 0 }}>

          {/* Output header bar */}
          <div style={{
            border: '0.5px solid #ddd', borderRadius: '12px 12px 0 0', overflow: 'hidden',
            background: '#fff',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', borderBottom: '0.5px solid #ddd', background: '#f9f9f9',
              flexWrap: 'wrap', gap: 8,
            }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#666' }}>Generated PRD</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Print / Save PDF', onClick: handlePrint },
                  { label: copied ? 'Copied!' : 'Copy Raw', onClick: handleCopy },
                  { label: '↓ Download DOCX', onClick: handleDownload },
                ].map(({ label, onClick }) => (
                  <button key={label} onClick={onClick} style={{
                    padding: '6px 12px', fontSize: 13, fontWeight: 500,
                    border: '0.5px solid #ccc', borderRadius: 8, cursor: 'pointer',
                    background: '#fff', color: '#1a1a1a', fontFamily: 'inherit',
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* PRD body — rendered markdown */}
            <div id="prd-rendered-output" dangerouslySetInnerHTML={{ __html: renderMarkdown(prdResult) }}
              style={{
                padding: '32px 36px', color: '#1a1a1a',
                fontFamily: "'Nunito', sans-serif",
                fontSize: '10pt', lineHeight: 1.75,
              }}
            />
          </div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;1,400&display=swap');
            #prd-rendered-output, #prd-rendered-output * { font-family:'Nunito',sans-serif; }
            #prd-rendered-output h1 { font-size:22px;font-weight:700;color:#111;margin:0 0 8px;padding-bottom:10px;border-bottom:2px solid #111; }
            #prd-rendered-output h2 { font-size:17px;font-weight:700;color:#111;margin:28px 0 8px;padding-bottom:6px;border-bottom:0.5px solid #e0e0e0; }
            #prd-rendered-output h3 { font-size:15px;font-weight:600;color:#333;margin:18px 0 6px; }
            #prd-rendered-output h4 { font-size:14px;font-weight:600;color:#555;margin:14px 0 4px; }
            #prd-rendered-output p  { margin:0 0 12px;color:#333;font-size:10pt; }
            #prd-rendered-output ul, #prd-rendered-output ol { margin:6px 0 12px 20px;color:#333;font-size:10pt; }
            #prd-rendered-output li { margin-bottom:5px;line-height:1.65;font-size:10pt; }
            #prd-rendered-output strong { font-weight:700;color:#111; }
            #prd-rendered-output em { font-style:italic;color:#444; }
            #prd-rendered-output code { font-family:'SF Mono','Consolas',monospace;font-size:9pt;background:#f3f4f6;padding:2px 6px;border-radius:4px;color:#c2185b; }
            #prd-rendered-output pre { background:#f3f4f6;border-radius:8px;padding:14px 16px;overflow-x:auto;margin:12px 0; }
            #prd-rendered-output pre code { background:none;padding:0;color:#1a1a1a;font-size:9pt; }
            #prd-rendered-output hr { border:none;border-top:0.5px solid #e0e0e0;margin:24px 0; }
            #prd-rendered-output blockquote { border-left:3px solid #ddd;padding:4px 14px;margin:12px 0;color:#666;font-style:italic;font-size:10pt; }
            #prd-rendered-output table { width:100%;border-collapse:collapse;margin:12px 0;font-size:10pt; }
            #prd-rendered-output th { background:#f5f5f5;font-weight:700;text-align:left;padding:9px 12px;border:0.5px solid #ddd;color:#333;font-size:10pt; }
            #prd-rendered-output td { padding:8px 12px;border:0.5px solid #e5e5e5;color:#444;vertical-align:top;line-height:1.55;font-size:10pt; }
            #prd-rendered-output tr:nth-child(even) td { background:#fafafa; }
            #prd-rendered-output .prd-divider { text-align:center;color:#bbb;font-size:10pt;letter-spacing:2px;margin:28px 0 20px;font-weight:500; }
          `}</style>
        </div>
      )}
    </div>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
