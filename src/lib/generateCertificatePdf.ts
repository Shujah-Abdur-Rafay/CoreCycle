import jsPDF from 'jspdf';

interface CertificateData {
  learnerName: string;
  courseTitle: string;
  completionDate: string;
  certificateNumber: string;
  companyName?: string;
}

export const generateCertificatePdf = (data: CertificateData): void => {
  const { learnerName, courseTitle, completionDate, certificateNumber, companyName } = data;
  
  // Create PDF in landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Background color - light cream
  doc.setFillColor(252, 251, 247);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  // Decorative border
  doc.setDrawColor(22, 101, 52); // Forest green
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  // Inner border
  doc.setLineWidth(0.5);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);
  
  // Corner decorations
  const cornerSize = 15;
  doc.setFillColor(22, 101, 52);
  
  // Top left corner
  doc.triangle(10, 10, 10 + cornerSize, 10, 10, 10 + cornerSize, 'F');
  // Top right corner
  doc.triangle(pageWidth - 10, 10, pageWidth - 10 - cornerSize, 10, pageWidth - 10, 10 + cornerSize, 'F');
  // Bottom left corner
  doc.triangle(10, pageHeight - 10, 10 + cornerSize, pageHeight - 10, 10, pageHeight - 10 - cornerSize, 'F');
  // Bottom right corner
  doc.triangle(pageWidth - 10, pageHeight - 10, pageWidth - 10 - cornerSize, pageHeight - 10, pageWidth - 10, pageHeight - 10 - cornerSize, 'F');

  // Header - Organization name
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Ontario Waste Diversion Academy', pageWidth / 2, 35, { align: 'center' });
  
  // Certificate of Completion title
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 55, { align: 'center' });
  
  // Decorative line under title
  doc.setDrawColor(34, 197, 94); // Leaf green
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 60, 62, pageWidth / 2 + 60, 62);
  
  // "This certifies that" text
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('This is to certify that', pageWidth / 2, 78, { align: 'center' });
  
  // Learner name
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(learnerName, pageWidth / 2, 95, { align: 'center' });
  
  // Decorative line under name
  doc.setDrawColor(22, 101, 52);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - 50, 100, pageWidth / 2 + 50, 100);
  
  // Company name if available
  if (companyName) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.text(`of ${companyName}`, pageWidth / 2, 110, { align: 'center' });
  }
  
  // "has successfully completed" text
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('has successfully completed the course', pageWidth / 2, companyName ? 125 : 118, { align: 'center' });
  
  // Course title
  doc.setTextColor(22, 101, 52);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  
  // Word wrap for long course titles
  const splitTitle = doc.splitTextToSize(courseTitle, pageWidth - 80);
  const titleY = companyName ? 140 : 133;
  doc.text(splitTitle, pageWidth / 2, titleY, { align: 'center' });
  
  // Date section
  const dateY = titleY + (splitTitle.length * 10) + 15;
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed on: ${completionDate}`, pageWidth / 2, dateY, { align: 'center' });
  
  // Certificate number
  doc.setFontSize(10);
  doc.text(`Certificate No: ${certificateNumber}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
  
  // Signature line (left)
  const signatureY = pageHeight - 40;
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.line(50, signatureY, 120, signatureY);
  doc.setFontSize(10);
  doc.text('Program Director', 85, signatureY + 6, { align: 'center' });
  
  // Signature line (right)
  doc.line(pageWidth - 120, signatureY, pageWidth - 50, signatureY);
  doc.text('Date of Issue', pageWidth - 85, signatureY + 6, { align: 'center' });
  
  // Add formatted date on the right signature line
  doc.setFont('helvetica', 'italic');
  doc.text(completionDate, pageWidth - 85, signatureY - 3, { align: 'center' });

  // Save the PDF
  const fileName = `Certificate_${learnerName.replace(/\s+/g, '_')}_${courseTitle.replace(/\s+/g, '_').substring(0, 20)}.pdf`;
  doc.save(fileName);
};
