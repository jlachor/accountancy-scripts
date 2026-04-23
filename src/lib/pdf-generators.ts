import autoTable from 'jspdf-autotable'
import { createPdf, tableFont } from './pdf'

function formatPln(value: number): string {
  return value.toFixed(2)
}

function getFinalY(doc: ReturnType<typeof createPdf>): number {
  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}

interface VatMarzaData {
  sprzedaz: number
  zakup: number
  vatRate: number
  roznicaBrutto: number
  roznicaNetto: number
  vat: number
  sprzedazKpir: number
}

export function generateVatMarzaPdf(data: VatMarzaData) {
  const { sprzedaz, zakup, vatRate, roznicaBrutto, roznicaNetto, vat, sprzedazKpir } = data
  const vatPercent = Math.round(vatRate * 100)
  const doc = createPdf()

  doc.setFontSize(18)
  doc.text('VAT Marża', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`, 14, 28)
  doc.setTextColor(0)

  // Input data table
  autoTable(doc, {
    ...tableFont,
    startY: 35,
    head: [['Dane wejściowe', 'Wartość']],
    body: [
      ['Sprzedaż z Faktury', `${formatPln(sprzedaz)} PLN`],
      ['Zakup z Faktury Zakupowej', `${formatPln(zakup)} PLN`],
      ['Stawka VAT', `${vatPercent}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [60, 60, 60] },
    columnStyles: { 1: { halign: 'right' } },
  })

  // Step 1
  const y1 = getFinalY(doc) + 10
  doc.setFontSize(12)
  doc.text('Różnica Brutto', 14, y1)
  autoTable(doc, {
    ...tableFont,
    startY: y1 + 4,
    body: [
      ['Sprzedaż', formatPln(sprzedaz)],
      ['− Zakup', formatPln(zakup)],
      ['= Różnica Brutto', formatPln(roznicaBrutto)],
    ],
    theme: 'plain',
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  // Step 2
  const y2 = getFinalY(doc) + 10
  doc.setFontSize(12)
  doc.text('Różnica Netto i VAT', 14, y2)
  autoTable(doc, {
    ...tableFont,
    startY: y2 + 4,
    body: [
      ['Różnica Brutto', formatPln(roznicaBrutto)],
      [`÷ (1 + ${vatPercent}%)`, (1 + vatRate).toFixed(2)],
      ['= Różnica Netto', formatPln(roznicaNetto)],
      ['', ''],
      ['Różnica Brutto', formatPln(roznicaBrutto)],
      ['− Różnica Netto', formatPln(roznicaNetto)],
      ['= VAT', formatPln(vat)],
    ],
    theme: 'plain',
    columnStyles: { 1: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === 2 || data.row.index === 6) {
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  // Step 3
  const y3 = getFinalY(doc) + 10
  doc.setFontSize(12)
  doc.text('Sprzedaż w KPiR', 14, y3)
  autoTable(doc, {
    ...tableFont,
    startY: y3 + 4,
    body: [
      ['Różnica Netto', formatPln(roznicaNetto)],
      ['+ Zakup', formatPln(zakup)],
      ['= Sprzedaż w KPiR', formatPln(sprzedazKpir)],
    ],
    theme: 'grid',
    columnStyles: { 1: { halign: 'right' } },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.fontSize = 12
      }
    },
  })

  doc.save('vat-marza.pdf')
}

interface CurrencyToPlnLine {
  date?: Date
  amount: string
  rate: string
  rateDate?: string
}

interface CurrencyToPlnSection {
  title: string
  lines: CurrencyToPlnLine[]
  total: number
}

interface CurrencyToPlnData {
  usd: CurrencyToPlnSection
  eur: CurrencyToPlnSection
  grandTotal: number
}

function formatDate(date?: Date): string {
  if (!date) return ''
  return date.toLocaleDateString('pl-PL')
}

export function generateCurrencyToPlnPdf(data: CurrencyToPlnData) {
  const { usd, eur, grandTotal } = data
  const doc = createPdf()

  doc.setFontSize(18)
  doc.text('Przelicznik walut na PLN', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`, 14, 28)
  doc.setTextColor(0)

  let startY = 35

  for (const section of [usd, eur]) {
    if (section.lines.length === 0) continue

    doc.setFontSize(14)
    doc.text(section.title, 14, startY)

    autoTable(doc, {
      ...tableFont,
      startY: startY + 4,
      head: [['Data', 'Kwota', 'Kurs', 'Kurs z dnia', 'PLN']],
      body: [
        ...section.lines.map((line) => {
          const pln = parseFloat(line.amount) * parseFloat(line.rate)
          return [
            formatDate(line.date),
            line.amount,
            line.rate,
            line.rateDate ?? '',
            isNaN(pln) ? '0.00' : formatPln(pln),
          ]
        }),
        [
          { content: 'Suma', colSpan: 4, styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
          { content: formatPln(section.total), styles: { fontStyle: 'bold' as const } },
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 60] },
      columnStyles: {
        1: { halign: 'right' },
        2: { halign: 'right' },
        4: { halign: 'right' },
      },
    })

    startY = getFinalY(doc) + 12
  }

  // Grand total
  autoTable(doc, {
    ...tableFont,
    startY,
    body: [
      [
        { content: 'Suma całkowita (PLN)', styles: { fontStyle: 'bold' as const, fontSize: 12 } },
        { content: formatPln(grandTotal), styles: { fontStyle: 'bold' as const, fontSize: 12, halign: 'right' as const } },
      ],
    ],
    theme: 'grid',
  })

  doc.save('przelicznik-walut.pdf')
}

interface ExchangeRateDiffLine {
  date?: Date
  amount: string
  rate: string
  rateDate?: string
  paymentDate?: Date
  paymentRate: string
  paymentRateDate?: string
}

interface ExchangeRateDiffSection {
  title: string
  lines: ExchangeRateDiffLine[]
  total: number
}

interface ExchangeRateDiffData {
  usd: ExchangeRateDiffSection
  eur: ExchangeRateDiffSection
  grandTotal: number
}

export function generateExchangeRateDiffPdf(data: ExchangeRateDiffData) {
  const { usd, eur, grandTotal } = data
  const doc = createPdf()

  doc.setFontSize(18)
  doc.text('Różnica kursowa', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`, 14, 28)
  doc.setTextColor(0)

  let startY = 35

  for (const section of [usd, eur]) {
    if (section.lines.length === 0) continue

    doc.setFontSize(14)
    doc.text(section.title, 14, startY)

    autoTable(doc, {
      ...tableFont,
      startY: startY + 4,
      head: [['Data faktury', 'Kurs faktury', 'Kurs z dnia', 'Kwota', 'Data zapłaty', 'Kurs zapłaty', 'Kurs z dnia', 'Wart. faktury', 'Wart. zapłaty', 'Różnica']],
      body: [
        ...section.lines.map((line) => {
          const amt = parseFloat(line.amount) || 0
          const invRate = parseFloat(line.rate) || 0
          const payRate = parseFloat(line.paymentRate) || 0
          const invoicePln = Math.round(amt * invRate * 100) / 100
          const paymentPln = Math.round(amt * payRate * 100) / 100
          const diff = Math.round(amt * (payRate - invRate) * 100) / 100
          return [
            formatDate(line.date),
            line.rate,
            line.rateDate ?? '',
            line.amount,
            formatDate(line.paymentDate),
            line.paymentRate,
            line.paymentRateDate ?? '',
            formatPln(invoicePln),
            formatPln(paymentPln),
            formatPln(diff),
          ]
        }),
        [
          { content: 'Suma', colSpan: 9, styles: { halign: 'right' as const, fontStyle: 'bold' as const } },
          { content: formatPln(section.total), styles: { fontStyle: 'bold' as const } },
        ],
      ],
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 60], fontSize: 7 },
      styles: { font: 'Roboto', fontSize: 8 },
      columnStyles: {
        1: { halign: 'right' },
        3: { halign: 'right' },
        5: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' },
      },
    })

    startY = getFinalY(doc) + 12
  }

  // Grand total
  autoTable(doc, {
    ...tableFont,
    startY,
    body: [
      [
        { content: 'Suma różnic kursowych (PLN)', styles: { fontStyle: 'bold' as const, fontSize: 12 } },
        { content: formatPln(grandTotal), styles: { fontStyle: 'bold' as const, fontSize: 12, halign: 'right' as const } },
      ],
    ],
    theme: 'grid',
  })

  doc.save('roznica-kursowa.pdf')
}
