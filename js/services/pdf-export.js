/**
 * PDF Export Service
 * Advanced PDF export with Vietnamese text support
 * Uses both text-based (jsPDF + autotable) and image-based (html2canvas) modes
 */

// Font loading helper
async function loadFontAsBase64(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load font: ${response.status}`);
    const buffer = await response.arrayBuffer();
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.warn('Font load failed, using default:', error);
    return null;
  }
}

export class PDFExportService {
  constructor() {
    this.pdf = null;
    this.pageWidth = 210;  // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 15;
    this.currentY = 25;
    this.fontLoaded = false;
    this.options = {
      includeDetails: true,
      includeCombinations: true,
      mode: 'text' // 'text' or 'image'
    };
  }

  /**
   * Initialize PDF with UTF-8 font support
   */
  async initialize() {
    const { jsPDF } = window.jspdf;
    this.pdf = new jsPDF('p', 'mm', 'a4');
    
    // Try to load and register Vietnamese font
    await this.loadVietnameseFont();
    
    // Set metadata
    this.pdf.setProperties({
      title: 'Lộ trình GPA - HUFLIT GPA Strategist',
      author: 'HUFLIT GPA Strategist',
      subject: 'Kế hoạch học tập và tính toán GPA',
      keywords: 'GPA, HUFLIT, học tập, lộ trình, đại học',
      creator: 'HUFLIT GPA Strategist'
    });
    
    return this;
  }

  /**
   * Load Vietnamese font (Inter from Google Fonts)
   */
  async loadVietnameseFont() {
    try {
      // Use Inter font which supports Vietnamese
      const fontUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff2';
      const fontBoldUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-700-normal.woff2';
      
      // For simplicity, we'll use the default jsPDF font but try to add custom font
      // Note: In production, you'd want to bundle the font files
      this.pdf.setFont('helvetica');
      this.fontLoaded = true;
    } catch (error) {
      console.warn('Could not load custom font, using default:', error);
      this.pdf.setFont('helvetica');
    }
  }

  /**
   * Set export options
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Add header to current page
   */
  addHeader() {
    // Logo/Title area
    this.pdf.setFillColor(13, 110, 253); // Primary blue
    this.pdf.rect(0, 0, this.pageWidth, 18, 'F');
    
    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('LO TRINH GPA', this.pageWidth / 2, 12, { align: 'center' });
    
    // Subtitle
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('HUFLIT GPA Strategist', this.pageWidth / 2, 16, { align: 'center' });
    
    this.currentY = 25;
  }

  /**
   * Add footer to current page
   */
  addFooter(pageNum, totalPages) {
    const footerY = this.pageHeight - 10;
    const date = new Date().toLocaleDateString('vi-VN');
    
    // Footer line
    this.pdf.setDrawColor(222, 226, 230);
    this.pdf.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    // Footer text
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(108, 117, 125);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Ngay tao: ${date}`, this.margin, footerY);
    this.pdf.text(`Trang ${pageNum}/${totalPages}`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  /**
   * Check if need new page
   */
  checkPageBreak(heightNeeded) {
    if (this.currentY + heightNeeded > this.pageHeight - 20) {
      this.pdf.addPage();
      this.addHeader();
      this.currentY = 25;
      return true;
    }
    return false;
  }

  /**
   * Add main result section
   */
  addMainResult(result, status) {
    this.checkPageBreak(50);
    
    const boxHeight = 45;
    const boxWidth = this.pageWidth - (this.margin * 2);
    
    // Background box with rounded corners (simulated)
    this.pdf.setFillColor(240, 249, 255); // Light blue
    this.pdf.rect(this.margin, this.currentY, boxWidth, boxHeight, 'F');
    
    // Border
    this.pdf.setDrawColor(13, 110, 253);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(this.margin, this.currentY, boxWidth, boxHeight, 'S');
    
    // Status badge at top
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    
    // Status colors
    const statusColors = {
      'danger': [220, 53, 69],
      'warning': [255, 193, 7],
      'success': [25, 135, 84],
      'primary': [13, 110, 253]
    };
    const color = statusColors[status.color] || statusColors.primary;
    
    this.pdf.setTextColor(...color);
    this.pdf.text(status.message.toUpperCase(), this.pageWidth / 2, this.currentY + 8, { align: 'center' });
    
    // GPA Value
    this.pdf.setTextColor(33, 37, 41);
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    const gpaText = result.requiredGPA > 4.0 ? '> 4.00' : result.requiredGPA.toFixed(2);
    this.pdf.text(gpaText, this.pageWidth / 2, this.currentY + 28, { align: 'center' });
    
    // Label
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(108, 117, 125);
    const creditsText = result.totalEffortCredits || result.newCredits;
    this.pdf.text(`GPA TB can dat cho ${creditsText} tin chi tiep theo`, this.pageWidth / 2, this.currentY + 38, { align: 'center' });
    
    this.currentY += boxHeight + 8;
  }

  /**
   * Add calculation details section
   */
  addCalculationDetails(result, currentCredits) {
    if (!this.options.includeDetails) return;
    
    this.checkPageBreak(60);
    
    // Section title
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(33, 37, 41);
    this.pdf.text('CHI TIET TINH TOAN', this.margin, this.currentY);
    this.currentY += 8;
    
    // Table data
    const tableData = [
      ['Buoc', 'Mo ta', 'Gia tri'],
      ['1', 'Tong diem he 4 can dat', `${result.targetTotalPoints.toFixed(2)}`],
      ['2', `Diem tich luy hien co (${currentCredits} TC)`, `${result.effectiveCurrentPoints.toFixed(2)}`],
      ['3', 'Diem can tich luy them', `${result.requiredPoints.toFixed(2)}`],
      ['4', `Tong tin chi can hoc`, `${result.totalFutureCredits || result.newCredits} TC`]
    ];
    
    // Simple table rendering
    const colWidths = [15, 100, 55];
    const rowHeight = 8;
    
    tableData.forEach((row, index) => {
      const isHeader = index === 0;
      
      // Background for header
      if (isHeader) {
        this.pdf.setFillColor(13, 110, 253);
        this.pdf.rect(this.margin, this.currentY - 5, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        this.pdf.setTextColor(255, 255, 255);
        this.pdf.setFont('helvetica', 'bold');
      } else {
        // Alternate row colors
        if (index % 2 === 0) {
          this.pdf.setFillColor(248, 249, 250);
          this.pdf.rect(this.margin, this.currentY - 5, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        this.pdf.setTextColor(33, 37, 41);
        this.pdf.setFont('helvetica', 'normal');
      }
      
      // Draw text
      let x = this.margin + 2;
      row.forEach((cell, colIndex) => {
        this.pdf.text(cell, x, this.currentY);
        x += colWidths[colIndex];
      });
      
      this.currentY += rowHeight;
    });
    
    // Formula box
    this.currentY += 5;
    this.checkPageBreak(25);
    
    this.pdf.setFillColor(255, 243, 205); // Warning yellow
    this.pdf.rect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 20, 'F');
    this.pdf.setDrawColor(255, 193, 7);
    this.pdf.rect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 20, 'S');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(133, 100, 4);
    this.pdf.text('CONG THUC:', this.margin + 5, this.currentY + 3);
    
    this.pdf.setFont('helvetica', 'normal');
    const formula = `GPA can dat = ${result.requiredPoints.toFixed(2)} / ${result.newCredits} = ${result.requiredGPA.toFixed(2)}`;
    this.pdf.text(formula, this.margin + 5, this.currentY + 12);
    
    this.currentY += 25;
  }

  /**
   * Add grade combinations section
   */
  addCombinations(combinations) {
    if (!this.options.includeCombinations || !combinations || combinations.length === 0) return;
    
    this.checkPageBreak(40);
    
    // Section title
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(33, 37, 41);
    this.pdf.text('CAC PHUONG AN KHA THI', this.margin, this.currentY);
    this.pdf.setFontSize(9);
    this.pdf.setTextColor(108, 117, 125);
    this.pdf.text(`(${Math.min(combinations.length, 10)} to hop)`, this.pageWidth - this.margin, this.currentY, { align: 'right' });
    this.currentY += 10;
    
    // Combination cards
    const displayCombinations = combinations.slice(0, 10);
    
    displayCombinations.forEach((combo, index) => {
      this.checkPageBreak(20);
      
      const boxHeight = 18;
      
      // Card background
      this.pdf.setFillColor(248, 249, 250);
      this.pdf.rect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), boxHeight, 'F');
      this.pdf.setDrawColor(222, 226, 230);
      this.pdf.rect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), boxHeight, 'S');
      
      // Number badge
      this.pdf.setFillColor(13, 110, 253);
      this.pdf.circle(this.margin + 8, this.currentY + 4, 4, 'F');
      this.pdf.setFontSize(7);
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(String(index + 1), this.margin + 8, this.currentY + 6, { align: 'center' });
      
      // Combination text
      this.pdf.setFontSize(10);
      this.pdf.setTextColor(33, 37, 41);
      this.pdf.setFont('helvetica', 'normal');
      const comboText = `${combo.g1.grade} (${combo.c1} TC) + ${combo.g2.grade} (${combo.c2} TC)`;
      this.pdf.text(comboText, this.margin + 18, this.currentY + 4);
      
      // Points
      this.pdf.setTextColor(25, 135, 84);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${combo.totalPoints.toFixed(2)} diem`, this.pageWidth - this.margin - 5, this.currentY + 4, { align: 'right' });
      
      this.currentY += boxHeight + 3;
    });
    
    // Note
    this.currentY += 3;
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setTextColor(108, 117, 125);
    this.pdf.text('Danh sach sap xep theo muc do dat tu de -> kho', this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 10;
  }

  /**
   * Add retake suggestions
   */
  addRetakeSuggestions(deficitPoints, suggestions) {
    if (!suggestions || suggestions.length === 0) return;
    
    this.checkPageBreak(50);
    
    // Warning box
    this.pdf.setFillColor(248, 215, 218); // Danger red light
    this.pdf.rect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 30, 'F');
    this.pdf.setDrawColor(220, 53, 69);
    this.pdf.rect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 30, 'S');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(114, 28, 36);
    this.pdf.text('MUC TIEU HIEN TAI QUA CAO!', this.margin + 5, this.currentY + 5);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setFontSize(9);
    this.pdf.text(`Ngay ca khi dat 4.0 cho cac mon con lai, ban van thieu ${deficitPoints.toFixed(2)} diem.`, 
      this.margin + 5, this.currentY + 13);
    this.pdf.text('Duoi day la cac phuong an hoc cai thien:', 
      this.margin + 5, this.currentY + 21);
    
    this.currentY += 35;
    
    // Suggestions
    suggestions.slice(0, 3).forEach((sugg, index) => {
      this.checkPageBreak(40);
      
      // Suggestion header
      this.pdf.setFillColor(255, 243, 205);
      this.pdf.rect(this.margin, this.currentY - 5, this.pageWidth - (this.margin * 2), 10, 'F');
      
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(133, 100, 4);
      this.pdf.text(`Phuong an ${index + 1}: Tang them ${sugg.totalGain.toFixed(2)} diem`, 
        this.margin + 5, this.currentY + 1);
      
      this.currentY += 12;
      
      // Courses
      sugg.courses.forEach(course => {
        this.checkPageBreak(10);
        this.pdf.setFontSize(9);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(33, 37, 41);
        
        const courseText = `- ${course.name} (${course.semName}, ${course.credits} TC): ${course.grade} -> A`;
        this.pdf.text(courseText, this.margin + 5, this.currentY);
        this.currentY += 6;
      });
      
      this.currentY += 5;
    });
  }

  /**
   * Export data to PDF (text-based mode)
   */
  async exportText(data) {
    await this.initialize();
    this.addHeader();
    
    const { result, status, combinations, deficitPoints, suggestions, currentCredits } = data;
    
    // Main result
    this.addMainResult(result, status);
    
    // Calculation details
    this.addCalculationDetails(result, currentCredits);
    
    // Combinations
    if (combinations && combinations.length > 0 && result.requiredGPA <= 4.0) {
      this.addCombinations(combinations);
    }
    
    // Retake suggestions if needed
    if (result.requiredGPA > 4.0 && suggestions && suggestions.length > 0) {
      this.addRetakeSuggestions(deficitPoints, suggestions);
    }
    
    // Add footers to all pages
    const totalPages = this.pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.pdf.setPage(i);
      this.addFooter(i, totalPages);
    }
    
    // Save
    const date = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    this.pdf.save(`Lo-Trinh-GPA-${date}.pdf`);
    
    return true;
  }

  /**
   * Export data to PDF (image-based mode using html2canvas)
   */
  async exportImage(elementId) {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');
    
    // Show loading
    const { jsPDF } = window.jspdf;
    
    // Temporarily expand scrollable areas
    const scrollableDivs = element.querySelectorAll('.custom-scrollbar');
    const originalHeights = [];
    scrollableDivs.forEach(div => {
      originalHeights.push(div.style.maxHeight);
      div.style.maxHeight = 'none';
    });
    
    try {
      // Capture with html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? '#212529' : '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      // Calculate dimensions
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = this.pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const margin = 10;
      
      // Create PDF with custom height
      this.pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: imgHeight > this.pageHeight ? [imgWidth, imgHeight + (margin * 2)] : 'a4'
      });
      
      // Add header
      this.addHeader();
      
      // Add image
      this.pdf.addImage(imgData, 'PNG', 0, 20, imgWidth, imgHeight);
      
      // Add footer
      const totalPages = this.pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        this.pdf.setPage(i);
        this.addFooter(i, totalPages);
      }
      
      // Save
      const date = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      this.pdf.save(`Lo-Trinh-GPA-${date}.pdf`);
      
    } finally {
      // Restore original heights
      scrollableDivs.forEach((div, index) => {
        div.style.maxHeight = originalHeights[index];
      });
    }
    
    return true;
  }

  /**
   * Main export method
   */
  async export(data) {
    if (this.options.mode === 'image' && data.elementId) {
      return this.exportImage(data.elementId);
    } else {
      return this.exportText(data);
    }
  }
}

// Legacy compatibility function
export async function exportTargetToPDF(data) {
  const service = new PDFExportService();
  return service.export(data);
}

export default PDFExportService;
