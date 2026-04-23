import { jsPDF } from 'jspdf'
import type { UserOptions } from 'jspdf-autotable'
import { robotoRegular, robotoBold } from './fonts'

export const tableFont: Pick<UserOptions, 'styles' | 'headStyles'> = {
  styles: { font: 'Roboto' },
  headStyles: { font: 'Roboto' },
}

export function createPdf(): jsPDF {
  const doc = new jsPDF()

  doc.addFileToVFS('Roboto-Regular.ttf', robotoRegular)
  doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal')
  doc.addFileToVFS('Roboto-Bold.ttf', robotoBold)
  doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
  doc.setFont('Roboto')

  return doc
}
