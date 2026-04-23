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
