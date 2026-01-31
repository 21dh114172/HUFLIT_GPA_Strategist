/**
 * PDF Export Service - Ultimate Professional Edition
 * Text-based PDF export with perfect layout
 * Vietnamese text normalization with smart formatting
 */

import { normalizeVietnameseText, setupPDFFonts, FONT_CONFIG } from './pdf-fonts.js';

// Helper to process Vietnamese text
const v = normalizeVietnameseText;

export class PDFExportService {
  constructor() {
    this.pdf = null;
    this.pageWidth = 210;
    this.pageHeight = 297;
    this.margin = 15;
    this.currentY = 30;
    this.pageNumber = 1;
    this.totalPages = 1;
    
    // Color palette - Bootstrap inspired
    this.colors = {
      primary: [13, 110, 253],
      success: [25, 135, 84],
      warning: [255, 193, 7],
      danger: [220, 53, 69],
      info: [13, 202, 240],
      dark: [33, 37, 41],
      gray: [108, 117, 125],
      lightGray: [248, 249, 250],
      border: [222, 226, 230],
      white: [255, 255, 255]
    };
    
    this.options = {
      includeDetails: true,
      includeCombinations: true,
      includeWatermark: true
    };
  }

  async initialize() {
    const { jsPDF } = window.jspdf;
    this.pdf = new jsPDF('p', 'mm', 'a4');
    setupPDFFonts(this.pdf);
    
    this.pdf.setProperties({
      title: v('Lo trinh GPA - HUFLIT'),
      author: 'HUFLIT GPA Strategist',
      subject: v('Bao cao hoc tap'),
      keywords: 'GPA, HUFLIT, hoc tap, sinh vien'
    });
    
    return this;
  }

  setOptions(options) {
    this.options = { ...this.options, ...options };
    return this;
  }

  setTextColor(color) {
    this.pdf.setTextColor(color[0], color[1], color[2]);
  }

  setFillColor(color) {
    this.pdf.setFillColor(color[0], color[1], color[2]);
  }

  setDrawColor(color) {
    this.pdf.setDrawColor(color[0], color[1], color[2]);
  }

  /**
   * Professional header with brand
   */
  addHeader() {
    // Top accent bar
    this.setFillColor(this.colors.primary);
    this.pdf.rect(0, 0, this.pageWidth, 4, 'F');
    
    // Header background
    this.setFillColor(this.colors.white);
    this.pdf.rect(0, 4, this.pageWidth, 22, 'F');
    
    // Brand
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.setTextColor(this.colors.primary);
    this.pdf.setFontSize(20);
    this.pdf.text('HUFLIT', this.margin, 16);
    
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
    this.setTextColor(this.colors.dark);
    this.pdf.setFontSize(20);
    this.pdf.text(v('GPA Strategist'), this.margin + 28, 16);
    
    // Document title
    this.pdf.setFontSize(9);
    this.setTextColor(this.colors.gray);
    this.pdf.text(v('BAO CAO LO TRINH HOC TAP'), this.pageWidth - this.margin, 12, { align: 'right' });
    this.pdf.text(v('Academic Planning Report'), this.pageWidth - this.margin, 17, { align: 'right' });
    
    // Separator
    this.setDrawColor(this.colors.border);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, 26, this.pageWidth - this.margin, 26);
    
    this.currentY = 32;
  }

  /**
   * Watermark removed
   */

  /**
   * Professional footer
   */
  addFooter() {
    const footerY = this.pageHeight - 10;
    
    this.setDrawColor(this.colors.border);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    const date = new Date().toLocaleDateString('vi-VN');
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
    this.setTextColor(this.colors.gray);
    this.pdf.setFontSize(8);
    
    this.pdf.text(v(`Ngay tao: ${date}`), this.margin, footerY);
    this.pdf.text(v('HUFLIT GPA Strategist'), this.pageWidth / 2, footerY, { align: 'center' });
    this.pdf.text(v(`Trang ${this.pageNumber}/${this.totalPages}`), this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  checkPageBreak(heightNeeded) {
    if (this.currentY + heightNeeded > this.pageHeight - 18) {
      this.addFooter();
      this.pdf.addPage();
      this.pageNumber++;
      this.addWatermark();
      this.addHeader();
      return true;
    }
    return false;
  }

  /**
   * Add quick stats section
   */
  addQuickStats(result, state) {
    this.checkPageBreak(35);
    
    const boxWidth = (this.pageWidth - (this.margin * 2) - 10) / 3;
    const boxHeight = 28;
    
    const stats = [
      { 
        label: v('Tin chi con lai'), 
        value: String(state.newCredits || 0),
        unit: 'TC',
        color: this.colors.info
      },
      { 
        label: v('GPA can dat'), 
        value: result.requiredGPA > 4.0 ? '>4.0' : result.requiredGPA.toFixed(2),
        unit: '',
        color: this.getDifficultyColor(result.requiredGPA)
      },
      { 
        label: v('Muc do'), 
        value: this.getDifficultyLabel(result.requiredGPA),
        unit: '',
        color: this.getDifficultyColor(result.requiredGPA)
      }
    ];
    
    stats.forEach((stat, index) => {
      const x = this.margin + (index * (boxWidth + 5));
      
      // Card shadow
      this.setFillColor([230, 230, 230]);
      this.pdf.rect(x + 0.5, this.currentY + 0.5, boxWidth, boxHeight, 'F');
      
      // Card background
      this.setFillColor(this.colors.white);
      this.pdf.rect(x, this.currentY, boxWidth, boxHeight, 'F');
      
      // Top accent
      this.setFillColor(stat.color);
      this.pdf.rect(x, this.currentY, boxWidth, 3, 'F');
      
      // Border
      this.setDrawColor(this.colors.border);
      this.pdf.setLineWidth(0.3);
      this.pdf.rect(x, this.currentY, boxWidth, boxHeight, 'S');
      
      // Value
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
      this.setTextColor(stat.color);
      this.pdf.setFontSize(16);
      this.pdf.text(stat.value + stat.unit, x + boxWidth / 2, this.currentY + 14, { align: 'center' });
      
      // Label
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
      this.setTextColor(this.colors.gray);
      this.pdf.setFontSize(8);
      this.pdf.text(stat.label, x + boxWidth / 2, this.currentY + 22, { align: 'center' });
    });
    
    this.currentY += boxHeight + 12;
  }

  getDifficultyColor(gpa) {
    if (gpa <= 0) return this.colors.success;
    if (gpa <= 3.0) return this.colors.success;
    if (gpa <= 3.5) return this.colors.primary;
    if (gpa <= 3.8) return this.colors.warning;
    if (gpa <= 4.0) return this.colors.danger;
    return this.colors.danger;
  }

  getDifficultyLabel(gpa) {
    if (gpa <= 0) return v('Da dat');
    if (gpa <= 3.0) return v('De');
    if (gpa <= 3.5) return v('Trung binh');
    if (gpa <= 3.8) return v('Kho');
    if (gpa <= 4.0) return v('Rat kho');
    return v('Khong kha thi');
  }

  /**
   * Add main result card with status
   */
  addMainResult(result, status) {
    this.checkPageBreak(60);
    
    const cardWidth = this.pageWidth - (this.margin * 2);
    const cardHeight = 50;
    
    // Shadow
    this.setFillColor([220, 220, 220]);
    this.pdf.rect(this.margin + 1, this.currentY + 1, cardWidth, cardHeight, 'F');
    
    // Background based on status
    let bgColor = this.colors.lightGray;
    let accentColor = this.colors.primary;
    
    if (status.color === 'success') {
      bgColor = [212, 237, 218];
      accentColor = this.colors.success;
    } else if (status.color === 'warning') {
      bgColor = [255, 249, 230];
      accentColor = [255, 160, 0];
    } else if (status.color === 'danger') {
      bgColor = [254, 226, 226];
      accentColor = this.colors.danger;
    }
    
    this.setFillColor(bgColor);
    this.pdf.rect(this.margin, this.currentY, cardWidth, cardHeight, 'F');
    
    // Left accent
    this.setFillColor(accentColor);
    this.pdf.rect(this.margin, this.currentY, 5, cardHeight, 'F');
    
    // Status badge
    const badgeText = v(status.message.toUpperCase());
    const badgeWidth = this.pdf.getTextWidth(badgeText) + 12;
    this.setFillColor(accentColor);
    this.pdf.rect(this.margin + 12, this.currentY + 6, badgeWidth, 9, 'F');
    
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(8);
    this.pdf.text(badgeText, this.margin + 18, this.currentY + 12);
    
    // GPA Value
    this.setTextColor(accentColor);
    this.pdf.setFontSize(32);
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    const gpaText = result.requiredGPA > 4.0 ? '> 4.00' : result.requiredGPA.toFixed(2);
    this.pdf.text(gpaText, this.pageWidth / 2, this.currentY + 32, { align: 'center' });
    
    // Labels
    this.setTextColor(this.colors.dark);
    this.pdf.setFontSize(10);
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
    this.pdf.text(v('GPA trung binh can dat'), this.pageWidth / 2, this.currentY + 40, { align: 'center' });
    
    this.setTextColor(this.colors.gray);
    this.pdf.setFontSize(9);
    const creditsText = result.totalEffortCredits || result.newCredits;
    this.pdf.text(v(`cho ${creditsText} tin chi tiep theo`), this.pageWidth / 2, this.currentY + 46, { align: 'center' });
    
    this.currentY += cardHeight + 10;
  }

  /**
   * Add student info
   */
  addStudentInfo(state) {
    this.checkPageBreak(35);
    
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.setTextColor(this.colors.dark);
    this.pdf.setFontSize(11);
    this.pdf.text(v('THONG TIN SINH VIEN'), this.margin, this.currentY);
    this.currentY += 8;
    
    // Grid layout
    const colWidth = (this.pageWidth - (this.margin * 2) - 20) / 2;
    
    const infoRows = [
      [v('GPA hien tai:'), state.currentGpa || '0.00', v('Tin chi tich luy:'), state.currentCredits || '0'],
      [v('GPA muc tieu:'), state.targetGpa || '0.00', v('Tin chi con lai:'), state.newCredits || '0']
    ];
    
    infoRows.forEach((row, rowIndex) => {
      const y = this.currentY + (rowIndex * 8);
      
      // First column
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
      this.setTextColor(this.colors.gray);
      this.pdf.setFontSize(9);
      this.pdf.text(row[0], this.margin, y + 5);
      
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
      this.setTextColor(this.colors.dark);
      this.pdf.text(row[1], this.margin + 35, y + 5);
      
      // Second column
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
      this.setTextColor(this.colors.gray);
      this.pdf.text(row[2], this.margin + colWidth + 10, y + 5);
      
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
      this.setTextColor(this.colors.dark);
      this.pdf.text(row[3], this.margin + colWidth + 45, y + 5);
    });
    
    this.currentY += 22;
    
    // Separator
    this.setDrawColor(this.colors.border);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  /**
   * Add calculation details table
   */
  addCalculationDetails(result, currentCredits) {
    if (!this.options.includeDetails) return;
    
    this.checkPageBreak(75);
    
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.setTextColor(this.colors.dark);
    this.pdf.setFontSize(11);
    this.pdf.text(v('CHI TIET TINH TOAN'), this.margin, this.currentY);
    this.currentY += 10;
    
    const tableWidth = this.pageWidth - (this.margin * 2);
    const rowHeight = 11;
    
    // Header
    this.setFillColor(this.colors.primary);
    this.pdf.rect(this.margin, this.currentY - 6, tableWidth, rowHeight, 'F');
    
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(9);
    this.pdf.text(v('Buoc'), this.margin + 8, this.currentY);
    this.pdf.text(v('Mo ta'), this.margin + 35, this.currentY);
    this.pdf.text(v('Gia tri'), this.pageWidth - this.margin - 5, this.currentY, { align: 'right' });
    
    this.currentY += rowHeight - 3;
    
    // Data rows
    const tableData = [
      ['1', v('Tong diem he 4 can dat'), `${result.targetTotalPoints.toFixed(2)}`],
      ['2', v(`Diem tich luy hien co (${currentCredits} TC)`), `${result.effectiveCurrentPoints.toFixed(2)}`],
      ['3', v('Diem can tich luy them'), `${result.requiredPoints.toFixed(2)}`],
      ['4', v('Tong tin chi can hoc'), `${result.totalFutureCredits || result.newCredits} TC`]
    ];
    
    tableData.forEach((row, index) => {
      const y = this.currentY + (index * rowHeight);
      
      // Alternate background
      if (index % 2 === 1) {
        this.setFillColor([250, 250, 250]);
        this.pdf.rect(this.margin, y - 6, tableWidth, rowHeight, 'F');
      }
      
      // Border
      this.setDrawColor(this.colors.border);
      this.pdf.setLineWidth(0.2);
      this.pdf.rect(this.margin, y - 6, tableWidth, rowHeight, 'S');
      
      // Step number
      this.setFillColor(this.colors.primary);
      this.pdf.circle(this.margin + 12, y - 1, 3.5, 'F');
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(7);
      this.pdf.text(row[0], this.margin + 12, y + 0.5, { align: 'center' });
      
      // Description
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
      this.setTextColor(this.colors.dark);
      this.pdf.setFontSize(9);
      this.pdf.text(row[1], this.margin + 28, y);
      
      // Value
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
      this.setTextColor(this.colors.primary);
      this.pdf.text(row[2], this.pageWidth - this.margin - 8, y, { align: 'right' });
    });
    
    this.currentY += (tableData.length * rowHeight) + 10;
    
    // Formula box
    this.checkPageBreak(28);
    
    const formulaHeight = 22;
    this.setFillColor([255, 251, 235]);
    this.pdf.rect(this.margin, this.currentY - 6, tableWidth, formulaHeight, 'F');
    this.setDrawColor([251, 191, 36]);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(this.margin, this.currentY - 6, tableWidth, formulaHeight, 'S');
    
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.setTextColor([146, 64, 14]);
    this.pdf.setFontSize(8);
    this.pdf.text(v('CONG THUC TINH:'), this.margin + 8, this.currentY + 2);
    
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
    this.setTextColor(this.colors.dark);
    const formula = v(`GPA can dat = ${result.requiredPoints.toFixed(2)} / ${result.newCredits} = ${result.requiredGPA.toFixed(2)}`);
    this.pdf.text(formula, this.margin + 8, this.currentY + 12);
    
    this.currentY += formulaHeight + 12;
  }

  /**
   * Add combinations with proper 2-column grid layout - NO RECURSION to prevent duplicates
   */
  addCombinations(combinations) {
    if (!this.options.includeCombinations || !combinations || combinations.length === 0) return;
    
    this.checkPageBreak(50);
    
    // Section title
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.setTextColor(this.colors.dark);
    this.pdf.setFontSize(11);
    this.pdf.text(v('CAC PHUONG AN KHA THI'), this.margin, this.currentY);
    
    // Count badge
    const countText = v(`${Math.min(combinations.length, 10)} phuong an`);
    const badgeWidth = this.pdf.getTextWidth(countText) + 10;
    this.setFillColor(this.colors.primary);
    this.pdf.rect(this.pageWidth - this.margin - badgeWidth, this.currentY - 5, badgeWidth, 8, 'F');
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(7);
    this.pdf.text(countText, this.pageWidth - this.margin - 5, this.currentY, { align: 'right' });
    
    this.currentY += 8;
    
    // Subtitle
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'italic');
    this.setTextColor(this.colors.gray);
    this.pdf.setFontSize(8);
    this.pdf.text(v('Sap xep theo muc do dat duoc tu de -> kho'), this.margin, this.currentY);
    this.currentY += 12;
    
    // Grid layout
    const displayCombinations = combinations.slice(0, 10);
    const cardWidth = (this.pageWidth - (this.margin * 2) - 6) / 2;
    const cardHeight = 20;
    const gap = 6;
    
    let itemsDrawn = 0;
    
    for (let index = 0; index < displayCombinations.length; index++) {
      const combo = displayCombinations[index];
      const isLeft = index % 2 === 0;
      const col = isLeft ? 0 : 1;
      const row = Math.floor(index / 2);
      
      const x = this.margin + (col * (cardWidth + gap));
      const y = this.currentY + (row * (cardHeight + gap));
      
      // Check page break
      if (isLeft && y + cardHeight > this.pageHeight - 20) {
        this.addFooter();
        this.pdf.addPage();
        this.pageNumber++;
        this.addHeader();
        this.currentY = 35;
        // Reset row counter for new page
        itemsDrawn = 0;
      }
      
      // Recalculate Y after potential page break
      const currentRow = Math.floor(itemsDrawn / 2);
      const currentCol = itemsDrawn % 2 === 0 ? 0 : 1;
      const finalX = this.margin + (currentCol * (cardWidth + gap));
      const finalY = this.currentY + (currentRow * (cardHeight + gap));
      
      // Card shadow
      this.setFillColor([230, 230, 230]);
      this.pdf.rect(finalX + 0.5, finalY + 0.5, cardWidth, cardHeight, 'F');
      
      // Card background
      this.setFillColor(this.colors.white);
      this.pdf.rect(finalX, finalY, cardWidth, cardHeight, 'F');
      
      // Border
      this.setDrawColor(this.colors.border);
      this.pdf.setLineWidth(0.3);
      this.pdf.rect(finalX, finalY, cardWidth, cardHeight, 'S');
      
      // Number circle
      this.setFillColor(this.colors.primary);
      this.pdf.circle(finalX + 10, finalY + 7, 4, 'F');
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(7);
      this.pdf.text(String(index + 1), finalX + 10, finalY + 8.5, { align: 'center' });
      
      // Combination text
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
      this.setTextColor(this.colors.dark);
      this.pdf.setFontSize(8);
      const comboText = v(`${combo.g1.grade} (${combo.c1}TC) + ${combo.g2.grade} (${combo.c2}TC)`);
      this.pdf.text(comboText, finalX + 20, finalY + 8);
      
      // Points badge
      const pointsText = `${combo.totalPoints.toFixed(1)}`;
      const pointsLabel = v('diem');
      const pointsWidth = this.pdf.getTextWidth(pointsText + ' ' + pointsLabel) + 8;
      
      this.setFillColor([220, 252, 231]);
      this.pdf.rect(finalX + cardWidth - pointsWidth - 5, finalY + 12, pointsWidth, 6, 'F');
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
      this.setTextColor(this.colors.success);
      this.pdf.setFontSize(7);
      this.pdf.text(pointsText + ' ' + pointsLabel, finalX + cardWidth - 8, finalY + 16.5, { align: 'right' });
      
      itemsDrawn++;
    }
    
    // Update currentY
    const totalRows = Math.ceil(itemsDrawn / 2);
    this.currentY += (totalRows * (cardHeight + gap)) + 5;
  }

  /**
   * Add retake suggestions
   */
  addRetakeSuggestions(deficitPoints, suggestions) {
    if (!suggestions || suggestions.length === 0) return;
    
    this.checkPageBreak(55);
    
    // Warning box
    const boxWidth = this.pageWidth - (this.margin * 2);
    const boxHeight = 32;
    
    this.setFillColor([254, 252, 232]);
    this.pdf.rect(this.margin, this.currentY - 6, boxWidth, boxHeight, 'F');
    this.setDrawColor([251, 191, 36]);
    this.pdf.setLineWidth(0.5);
    this.pdf.rect(this.margin, this.currentY - 6, boxWidth, boxHeight, 'S');
    
    // Title
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.setTextColor([146, 64, 14]);
    this.pdf.setFontSize(10);
    this.pdf.text(v('MUC TIEU HIEN TAI QUA CAO!'), this.margin + 8, this.currentY + 3);
    
    // Content
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
    this.pdf.setFontSize(9);
    const warningText = v(`Ngay ca khi dat 4.0 cho cac mon con lai, ban van thieu ${deficitPoints.toFixed(2)} diem.`);
    this.pdf.text(warningText, this.margin + 8, this.currentY + 12);
    this.pdf.text(v('Duoi day la cac phuong an hoc cai thien de bu dap:'), this.margin + 8, this.currentY + 19);
    
    this.currentY += boxHeight + 8;
    
    // Suggestions
    suggestions.slice(0, 3).forEach((sugg, index) => {
      this.checkPageBreak(45);
      
      // Header
      const headerWidth = boxWidth;
      this.setFillColor([254, 242, 242]);
      this.pdf.rect(this.margin, this.currentY - 5, headerWidth, 10, 'F');
      this.setDrawColor([252, 165, 165]);
      this.pdf.rect(this.margin, this.currentY - 5, headerWidth, 10, 'S');
      
      this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
      this.setTextColor([153, 27, 27]);
      this.pdf.setFontSize(9);
      const headerText = v(`Phuong an ${index + 1}: Tang ${sugg.totalGain.toFixed(2)} diem (${sugg.totalCredits} TC)`);
      this.pdf.text(headerText, this.margin + 8, this.currentY + 1);
      
      this.currentY += 12;
      
      // Courses
      sugg.courses.forEach(course => {
        this.checkPageBreak(7);
        
        // Bullet
        this.setFillColor(this.colors.danger);
        this.pdf.circle(this.margin + 10, this.currentY - 1.5, 1.5, 'F');
        
        // Course name
        this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
        this.setTextColor(this.colors.dark);
        this.pdf.setFontSize(8);
        const courseName = v(course.name);
        const maxWidth = this.pageWidth - (this.margin * 2) - 80;
        const truncated = courseName.length > 35 ? courseName.substring(0, 35) + '...' : courseName;
        this.pdf.text(truncated, this.margin + 16, this.currentY);
        
        // Grade improvement
        const gradeText = v(`${course.grade} -> A (4.0)`);
        this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
        this.setTextColor(this.colors.success);
        this.pdf.text(gradeText, this.pageWidth - this.margin - 5, this.currentY, { align: 'right' });
        
        this.currentY += 6;
      });
      
      this.currentY += 6;
    });
  }

  /**
   * Add notes section
   */
  addNotes() {
    this.checkPageBreak(45);
    
    // Separator
    this.setDrawColor(this.colors.border);
    this.pdf.setLineWidth(0.3);
    this.pdf.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
    
    // Title
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'bold');
    this.setTextColor(this.colors.dark);
    this.pdf.setFontSize(10);
    this.pdf.text(v('LUU Y:'), this.margin, this.currentY);
    this.currentY += 8;
    
    // Notes
    const notes = [
      v('* GPA duoc tinh theo thang diem 4.0 cua truong HUFLIT'),
      v('* Cac phuong an chi mang tinh chat tham khao'),
      v('* Neu muc tieu khong kha thi, hay can nhac hoc cai thien'),
      v('* Cong cu nay khong thay the tu van hoc vu tu phong Dao tao')
    ];
    
    this.pdf.setFont(FONT_CONFIG.defaultFont, 'normal');
    this.setTextColor(this.colors.gray);
    this.pdf.setFontSize(8);
    
    notes.forEach(note => {
      this.checkPageBreak(5);
      this.pdf.text(note, this.margin, this.currentY);
      this.currentY += 5;
    });
    
    this.currentY += 8;
  }

  /**
   * Main export method
   */
  async export(data) {
    const { result, status, combinations, deficitPoints, suggestions, state } = data;
    
    await this.initialize();
    // Watermark removed as per request
    this.addHeader();
    
    // Quick stats
    this.addQuickStats(result, state);
    
    // Student info
    this.addStudentInfo(state);
    
    // Main result
    this.addMainResult(result, status);
    
    // Note: Calculation details section removed as per request
    // Only keep essential information for cleaner PDF
    
    // Combinations
    if (combinations && combinations.length > 0 && result.requiredGPA <= 4.0) {
      this.addCombinations(combinations);
    }
    
    // Retake suggestions
    if (result.requiredGPA > 4.0 && suggestions && suggestions.length > 0) {
      this.addRetakeSuggestions(deficitPoints, suggestions);
    }
    
    // Notes
    this.addNotes();
    
    // Finalize
    this.totalPages = this.pageNumber;
    for (let i = 1; i <= this.totalPages; i++) {
      this.pdf.setPage(i);
      this.pageNumber = i;
      this.addFooter();
    }
    
    // Save
    const date = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
    const gpaText = result.requiredGPA > 4.0 ? 'khong-kha-thi' : result.requiredGPA.toFixed(2);
    this.pdf.save(`Lo-Trinh-GPA-${gpaText}-${date}.pdf`);
    
    return true;
  }
}

export async function exportTargetToPDF(data) {
  const service = new PDFExportService();
  return service.export(data);
}

export default PDFExportService;
