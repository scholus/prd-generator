import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, LevelFormat,
} from 'docx'

const FONT = 'Nunito'
const CONTENT_SIZE = 20  // 10pt in half-points

// ── Inline markdown parser → array of TextRun ────────────────────────────────
function parseInline(text) {
  const runs = []
  const re = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g
  let last = 0
  let m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) runs.push(new TextRun({ text: text.slice(last, m.index), font: FONT, size: CONTENT_SIZE }))
    if (m[2]) runs.push(new TextRun({ text: m[2], font: FONT, size: CONTENT_SIZE, bold: true, italics: true }))
    else if (m[3]) runs.push(new TextRun({ text: m[3], font: FONT, size: CONTENT_SIZE, bold: true }))
    else if (m[4]) runs.push(new TextRun({ text: m[4], font: FONT, size: CONTENT_SIZE, italics: true }))
    else if (m[5]) runs.push(new TextRun({ text: m[5], font: 'Courier New', size: CONTENT_SIZE, color: 'C2185B' }))
    last = m.index + m[0].length
  }
  if (last < text.length) runs.push(new TextRun({ text: text.slice(last), font: FONT, size: CONTENT_SIZE }))
  return runs.length ? runs : [new TextRun({ text, font: FONT, size: CONTENT_SIZE })]
}

// ── Cell helpers ──────────────────────────────────────────────────────────────
const BORDER = { style: BorderStyle.SINGLE, size: 1, color: 'E5E5E5' }
const BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER }
const CELL_MARGINS = { top: 80, bottom: 80, left: 160, right: 160 }

function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA }, borders: BORDERS,
    shading: { fill: 'F5F5F5', type: ShadingType.CLEAR },
    margins: CELL_MARGINS,
    children: [new Paragraph({ children: [new TextRun({ text, font: FONT, size: CONTENT_SIZE, bold: true, color: '333333' })] })]
  })
}

function dataCell(text, width) {
  const runs = parseInline(text || '')
  return new TableCell({
    width: { size: width, type: WidthType.DXA }, borders: BORDERS,
    margins: CELL_MARGINS,
    children: [new Paragraph({ children: runs })]
  })
}

// ── Markdown → docx elements ──────────────────────────────────────────────────
export async function generatePRDDocx(markdown, productName) {
  const lines = markdown.split('\n')
  const children = []

  // For numbered list tracking
  let inCodeBlock = false
  let codeLines = []
  let tableRows = []
  let listBuffer = [] // { type: 'ul'|'ol', text }

  const flushList = () => {
    if (!listBuffer.length) return
    for (const item of listBuffer) {
      children.push(new Paragraph({
        numbering: { reference: item.type === 'ol' ? 'numbers' : 'bullets', level: 0 },
        children: parseInline(item.text),
        spacing: { before: 0, after: 60 },
      }))
    }
    listBuffer = []
  }

  const flushTable = () => {
    if (tableRows.length < 2) { tableRows = []; return }
    // First row = headers, second row = separator (skip), rest = data
    const headerCells = tableRows[0]
    const dataRowsData = tableRows.slice(2)
    if (!headerCells.length) { tableRows = []; return }

    const colCount = headerCells.length
    const colWidth = Math.floor(9360 / colCount)
    const colWidths = headerCells.map((_, i) => i === colCount - 1 ? 9360 - colWidth * (colCount - 1) : colWidth)

    const tblRows = [
      new TableRow({
        tableHeader: true,
        children: headerCells.map((cell, i) => headerCell(cell, colWidths[i]))
      }),
      ...dataRowsData.map((row, ri) => new TableRow({
        children: row.map((cell, i) => {
          const c = dataCell(cell, colWidths[i])
          if (ri % 2 === 1) {
            // Alternate row shading (light)
          }
          return c
        })
      }))
    ]

    children.push(new Table({
      width: { size: 9360, type: WidthType.DXA },
      columnWidths: colWidths,
      rows: tblRows,
    }))
    tableRows = []
  }

  const parseCells = (line) =>
    line.split('|').filter((_, ci, arr) => ci > 0 && ci < arr.length - 1).map(c => c.trim())

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trimEnd()

    // Code block toggle
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        flushList()
        flushTable()
        inCodeBlock = true
        codeLines = []
      } else {
        inCodeBlock = false
        const codeText = codeLines.join('\n')
        children.push(new Paragraph({
          children: [new TextRun({ text: codeText, font: 'Courier New', size: CONTENT_SIZE, color: '444444' })],
          spacing: { before: 80, after: 80 },
          shading: { fill: 'F3F4F6', type: ShadingType.CLEAR },
          indent: { left: 360 },
        }))
      }
      continue
    }
    if (inCodeBlock) { codeLines.push(line); continue }

    // Table rows
    if (line.startsWith('|')) {
      flushList()
      // Separator row detection
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        tableRows.push([]) // sentinel for separator
      } else {
        tableRows.push(parseCells(line))
      }
      continue
    } else if (tableRows.length) {
      flushTable()
    }

    // Headings
    const h1 = line.match(/^#\s+(.+)$/)
    const h2 = line.match(/^##\s+(.+)$/)
    const h3 = line.match(/^###\s+(.+)$/)
    const h4 = line.match(/^####\s+(.+)$/)

    if (h4) {
      flushList()
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: parseInline(h4[1]), spacing: { before: 200, after: 80 } }))
      continue
    }
    if (h3) {
      flushList()
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: parseInline(h3[1]), spacing: { before: 240, after: 80 } }))
      continue
    }
    if (h2) {
      flushList()
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: parseInline(h2[1]), spacing: { before: 320, after: 100 } }))
      continue
    }
    if (h1) {
      flushList()
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: parseInline(h1[1]), spacing: { before: 360, after: 120 }, pageBreakBefore: children.length > 0 && !lines[i - 1]?.startsWith('#') }))
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(line.trim())) {
      flushList()
      children.push(new Paragraph({
        children: [],
        border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E0E0E0', space: 1 } },
        spacing: { before: 200, after: 200 },
      }))
      continue
    }

    // Part dividers: --- PART 1: ... ---
    const partDiv = line.match(/^---\s+(.+?)\s+---$/)
    if (partDiv) {
      flushList()
      children.push(new Paragraph({
        children: [new TextRun({ text: `— ${partDiv[1]} —`, font: FONT, size: CONTENT_SIZE, color: 'BBBBBB', allCaps: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      }))
      continue
    }

    // Bullet list
    const ulMatch = line.match(/^[ \t]*[-*+]\s+(.+)$/)
    if (ulMatch) {
      listBuffer.push({ type: 'ul', text: ulMatch[1] })
      continue
    }

    // Ordered list
    const olMatch = line.match(/^[ \t]*\d+\.\s+(.+)$/)
    if (olMatch) {
      listBuffer.push({ type: 'ol', text: olMatch[1] })
      continue
    }

    // Empty line — flush list if any, add spacing
    if (!line.trim()) {
      flushList()
      // Only add spacing paragraph if not consecutive blanks
      if (children.length && !(children[children.length - 1] instanceof Paragraph && !children[children.length - 1].root?.length))
        children.push(new Paragraph({ children: [], spacing: { before: 0, after: 80 } }))
      continue
    }

    // Regular paragraph
    flushList()
    children.push(new Paragraph({
      children: parseInline(line),
      spacing: { before: 0, after: 80 },
    }))
  }

  // Flush any remaining buffer
  flushList()
  if (tableRows.length) flushTable()

  // ── Build Document ──────────────────────────────────────────────────────────
  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
        },
        {
          reference: 'numbers',
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
        },
      ]
    },
    styles: {
      default: { document: { run: { font: FONT, size: CONTENT_SIZE, color: '1A1A1A' } } },
      paragraphStyles: [
        {
          id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 40, bold: true, font: FONT, color: '111111' },
          paragraph: {
            spacing: { before: 360, after: 120 }, outlineLevel: 0,
            border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '111111', space: 1 } }
          }
        },
        {
          id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 30, bold: true, font: FONT, color: '111111' },
          paragraph: {
            spacing: { before: 320, after: 100 }, outlineLevel: 1,
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'E0E0E0', space: 1 } }
          }
        },
        {
          id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: FONT, color: '333333' },
          paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 2 }
        },
      ]
    },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [
              new TextRun({ text: productName || 'Product Requirement Document', font: FONT, size: 18, color: '888888' }),
            ],
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: 'E0E0E0', space: 1 } },
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [
              new TextRun({ text: 'Page ', font: FONT, size: 18, color: '888888' }),
              new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: '888888' }),
              new TextRun({ text: ' of ', font: FONT, size: 18, color: '888888' }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: '888888' }),
            ],
            alignment: AlignmentType.RIGHT,
          })]
        })
      },
      children,
    }]
  })

  return Packer.toBuffer(doc)
}
