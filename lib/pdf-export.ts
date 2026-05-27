import { LogEntry, UserSettings } from '@/types'
import { getDayRating } from '@/lib/constants'

export interface ReportOptions {
  startDate: string
  endDate: string
  settings: UserSettings
  entries: LogEntry[]
}

function avg(entries: LogEntry[], field: keyof LogEntry): number {
  const vals = entries.map(e => (e[field] as number) ?? 0).filter(v => v > 0)
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function formatShort(ds: string): string {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatLong(ds: string): string {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function rfcLevel(score: number): string {
  if (score >= 8) return 'Marked/Extreme'
  if (score >= 6) return 'Moderate-Severe'
  if (score >= 4) return 'Moderate'
  if (score >= 2) return 'Mild-Moderate'
  return 'Minimal'
}

function severityContext(a: number): string {
  if (a >= 8) return 'Severe limitation consistent with disability'
  if (a >= 6) return 'Significant ongoing functional limitation'
  if (a >= 4) return 'Moderate limitation affecting daily function'
  return 'Mild limitation; variable symptoms'
}

function mobilityImpact(a: number): string {
  if (a >= 7) return 'Unable to sustain walking/standing; primarily bedridden or sedentary'
  if (a >= 5) return 'Walking/standing limited to short intervals; requires frequent rest'
  if (a >= 3) return 'Moderate reduction in walking/standing tolerance'
  return 'Mild mobility limitation'
}

function selfCareImpact(a: number): string {
  if (a >= 7) return 'Unable to perform most personal care independently; requires assistance'
  if (a >= 5) return 'Significant difficulty with dressing, hygiene, and meal prep'
  if (a >= 3) return 'Moderate ADL limitations; adapts with difficulty'
  return 'Mild self-care limitations'
}

function cogImpact(a: number): string {
  if (a >= 7) return 'Severe cognitive impairment; cannot concentrate, remember, or process information'
  if (a >= 5) return 'Moderate cognitive deficits affecting task completion and communication'
  if (a >= 3) return 'Mild-to-moderate concentration and memory difficulties'
  return 'Occasional mild cognitive difficulty'
}

function socialImpact(a: number): string {
  if (a >= 7) return 'Unable to maintain social interactions or work tasks; socially isolated'
  if (a >= 5) return 'Significant limitation in social and occupational functioning'
  if (a >= 3) return 'Moderate difficulty sustaining social and work activities'
  return 'Mild social and occupational limitation'
}

export async function generatePDFReport(opts: ReportOptions): Promise<void> {
  const jsPDFModule = await import('jspdf')
  const jsPDF = jsPDFModule.jsPDF
  const autoTableModule = await import('jspdf-autotable')
  const autoTable = autoTableModule.default

  const { startDate, endDate, settings, entries } = opts
  const filtered = [...entries]
    .filter(e => e.date >= startDate && e.date <= endDate)
    .sort((a, b) => a.date.localeCompare(b.date))

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const M = 20
  let y = M

  const PURPLE: [number, number, number] = [88, 28, 135]
  const TEXT: [number, number, number]   = [15, 23, 42]
  const GRAY: [number, number, number]   = [100, 116, 139]
  const RED: [number, number, number]    = [220, 38, 38]
  const AMBER: [number, number, number]  = [180, 120, 0]

  let pageNum = 0

  function addHeaderBar() {
    pageNum++
    doc.setFillColor(...PURPLE)
    doc.rect(0, 0, W, 18, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('ClaimGuard — Symptom & Functional Limitation Log', M, 12)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Page ${pageNum}  |  CONFIDENTIAL — CLAIMANT COPY`, W - M, 12, { align: 'right' })
    y = 26
  }

  function addDisclaimerBox() {
    doc.setFillColor(254, 226, 226)
    doc.setDrawColor(...RED)
    doc.roundedRect(M, y, W - M * 2, 18, 2, 2, 'FD')
    doc.setTextColor(...RED)
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.text('⚠ DISCLAIMER', M + 4, y + 6)
    doc.setFont('helvetica', 'normal')
    doc.text('This is a USER-GENERATED symptom log. NOT legal or medical advice. NOT a medical record.', M + 4, y + 11)
    doc.text('Always consult your disability attorney and treating physicians. Document only what actually occurred.', M + 4, y + 16)
    y += 24
  }

  // ── PAGE 1: Cover + Stats
  addHeaderBar()
  addDisclaimerBox()

  doc.setTextColor(...PURPLE)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Disability Claim Symptom Report', M, y)
  y += 7

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(`Claimant: ${settings.userName || 'Claimant'}  |  Claim Type: ${settings.claimType}`, M, y)
  y += 5
  doc.text(`Reporting Period: ${formatShort(startDate)} – ${formatShort(endDate)}  |  Generated: ${new Date().toLocaleString()}`, M, y)
  y += 5
  doc.text(`Total Entries in Period: ${filtered.length}`, M, y)
  y += 10

  if (filtered.length > 0) {
    const avgSev  = avg(filtered, 'overallSeverity')
    const avgPain = avg(filtered, 'painLevel')
    const avgFat  = avg(filtered, 'fatigueLevel')
    const badDays = filtered.filter(e => e.overallSeverity >= 7).length
    const missedDays = filtered.filter(e => e.missedActivities).length

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Value', 'Clinical Context']],
      body: [
        ['Average Overall Severity', `${avgSev.toFixed(1)}/10`, severityContext(avgSev)],
        ['Average Pain Level', `${avgPain.toFixed(1)}/10`, avgPain >= 6 ? 'High pain consistently limiting function' : 'Moderate chronic pain pattern'],
        ['Average Fatigue Level', `${avgFat.toFixed(1)}/10`, avgFat >= 7 ? 'Debilitating fatigue; unable to sustain activity' : 'Significant fatigue limiting daily activities'],
        ['High-Severity Days (≥7/10)', `${badDays} of ${filtered.length}`, `${((badDays / filtered.length) * 100).toFixed(0)}% of reported days`],
        ['Days with Missed Activities', `${missedDays} of ${filtered.length}`, `${((missedDays / filtered.length) * 100).toFixed(0)}% of reported days`],
      ],
      theme: 'striped',
      headStyles: { fillColor: PURPLE, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 62 }, 1: { cellWidth: 24, halign: 'center' }, 2: { } },
      margin: { left: M, right: M },
    })
    y = (doc as any).lastAutoTable?.finalY + 10

    // Functional Limitations
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PURPLE)
    doc.text('SSA RFC Functional Limitations Summary', M, y)
    y += 6

    const avgMob = avg(filtered, 'mobilityScore')
    const avgSC  = avg(filtered, 'selfCareScore')
    const avgCog = avg(filtered, 'cognitiveScore')
    const avgSoc = avg(filtered, 'socialScore')

    autoTable(doc, {
      startY: y,
      head: [['RFC Domain', 'Avg Score', 'SSA Level', 'Impact Summary']],
      body: [
        ['Exertional / Mobility',     `${avgMob.toFixed(1)}/10`, rfcLevel(avgMob), mobilityImpact(avgMob)],
        ['Self-Care (ADLs)',           `${avgSC.toFixed(1)}/10`,  rfcLevel(avgSC),  selfCareImpact(avgSC)],
        ['Cognitive / Mental',        `${avgCog.toFixed(1)}/10`, rfcLevel(avgCog), cogImpact(avgCog)],
        ['Social / Occupational',     `${avgSoc.toFixed(1)}/10`, rfcLevel(avgSoc), socialImpact(avgSoc)],
      ],
      theme: 'grid',
      headStyles: { fillColor: PURPLE, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 48 }, 1: { cellWidth: 22, halign: 'center' }, 2: { cellWidth: 30, halign: 'center' }, 3: {} },
      margin: { left: M, right: M },
    })
  }

  // ── PAGE 2: Daily Log Table
  doc.addPage()
  addHeaderBar()

  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...PURPLE)
  doc.text('Daily Symptom Log', M, y)
  y += 7

  autoTable(doc, {
    startY: y,
    head: [['Date', 'Overall', 'Pain', 'Fatigue', 'Top Symptoms', 'Sleep', 'Missed']],
    body: filtered.map(e => [
      formatShort(e.date),
      e.overallSeverity,
      e.painLevel || 0,
      e.fatigueLevel || 0,
      (e.symptomTags || []).slice(0, 2).map(id => id.replace(/-/g, ' ')).join(', ') || '—',
      e.sleepHours ? `${e.sleepHours}h` : '—',
      e.missedActivities ? 'Yes' : 'No',
    ]),
    theme: 'striped',
    headStyles: { fillColor: PURPLE, textColor: [255,255,255], fontStyle: 'bold', fontSize: 8.5 },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 16, halign: 'center' },
      4: { },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 16, halign: 'center' },
    },
    margin: { left: M, right: M },
    didParseCell: (data) => {
      if (data.column.index === 1 && data.section === 'body') {
        const v = parseInt(String(data.cell.text[0]))
        if (v >= 8) data.cell.styles.textColor = RED
        else if (v >= 6) data.cell.styles.textColor = [234, 88, 12]
        else if (v >= 4) data.cell.styles.textColor = AMBER
        else data.cell.styles.textColor = [34, 197, 94]
      }
    }
  })

  // ── PAGE 3+: Professional Summaries
  if (filtered.length > 0) {
    doc.addPage()
    addHeaderBar()

    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...PURPLE)
    doc.text('Detailed Daily Summaries — Professional Format', M, y)
    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...GRAY)
    doc.text('Inputs translated to functional-limitation language for disability reviewers and legal counsel.', M, y)
    y += 8

    const ratingColors: Record<string, [number, number, number]> = {
      bad:    [239, 68,  68],
      rough:  [249, 115, 22],
      medium: [234, 179, 8],
      decent: [132, 204, 16],
      good:   [34,  197, 94],
    }

    for (const entry of filtered) {
      if (y > 245) {
        doc.addPage()
        addHeaderBar()
      }
      const rating = getDayRating(entry)
      const col = ratingColors[rating] || GRAY
      doc.setFillColor(...col)
      doc.rect(M, y - 3, 3, 9, 'F')
      doc.setFontSize(9.5)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...TEXT)
      doc.text(`${formatLong(entry.date)}  —  Overall: ${entry.overallSeverity}/10`, M + 5, y + 3)
      y += 8

      const summaryText = entry.professionalSummary || '(No summary generated)'
      const wrapped = doc.splitTextToSize(summaryText, W - M * 2 - 5)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...GRAY)
      doc.text(wrapped, M + 5, y)
      y += (wrapped.length * 4) + 4

      doc.setDrawColor(226, 232, 240)
      doc.line(M, y, W - M, y)
      y += 4
    }
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(6.5)
    doc.setTextColor(...GRAY)
    doc.text(
      'DISCLAIMER: User-generated symptom log. NOT legal or medical advice. Consult your attorney and physician.',
      W / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    )
  }

  doc.save(`ClaimGuard_Report_${startDate}_to_${endDate}.pdf`)
}
