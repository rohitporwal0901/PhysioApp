import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { AiService } from '../../../core/services/ai.service';
import { environment } from '../../../../environments/environment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-my-sessions',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: './my-sessions.component.html',
  styleUrl: './my-sessions.component.scss'
})
export class MySessionsComponent implements OnInit {
  private bookingService = inject(BookingService);
  private authService = inject(AuthService);
  private aiService = inject(AiService);
  private toast = inject(ToastService);

  upcomingSessions: BookedAppointment[] = [];
  pastSessions: BookedAppointment[] = [];
  activeTab: 'upcoming' | 'past' = 'upcoming';
  isLoading = true;

  // Feedback Modal State
  isFeedbackModalOpen = false;
  selectedSessionForFeedback: BookedAppointment | null = null;
  feedbackRating = 5;
  feedbackComment = '';
  isSubmittingFeedback = false;

  // AI Generation State
  generatingReportId: string | null = null;

  private doctorImages = [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'
  ];

  ngOnInit() {
    const user = this.authService.currentUser;
    if (user && user.role === 'patient') {
      this.bookingService.getPatientAppointments(user.uid).subscribe(appointments => {
        this.upcomingSessions = appointments
          .filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
          .sort((a, b) => this.compareDateTime(a, b));

        this.pastSessions = appointments
          .filter(apt => apt.status === 'completed' || apt.status === 'cancelled')
          .sort((a, b) => this.compareDateTime(b, a));

        this.isLoading = false;
      });
    }
  }

  private compareDateTime(a: BookedAppointment, b: BookedAppointment): number {
    const dateA = new Date(a.date + 'T00:00:00');
    const dateB = new Date(b.date + 'T00:00:00');
    if (dateA.getTime() !== dateB.getTime()) return dateA.getTime() - dateB.getTime();
    return this.parseTime(a.time) - this.parseTime(b.time);
  }

  private parseTime(timeStr: string): number {
    const match = timeStr.match(/(\d+):(\d+)\s+(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    if (match[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (match[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  getDoctorImage(session: any, index: number): string {
    if (session.doctorImage && !session.doctorImage.includes('ui-avatars.com')) return session.doctorImage;
    return this.doctorImages[index % this.doctorImages.length];
  }

  // ═══════════════════════════════════════
  //  AI-POWERED PDF REPORT GENERATION
  // ═══════════════════════════════════════

  async downloadReport(session: BookedAppointment) {
    if (!session.id) return;

    // 1. If AI Report already exists, just generate the PDF immediately
    if (session.aiReport) {
      this.generatePDF(session, session.aiReport);
      return;
    }

    // 2. Otherwise, generate new report via AI
    this.generatingReportId = session.id;
    let aiAnalysis;

    try {
      try {
        const aiRawResponse = await this.aiService.generateClinicalReport({
          condition: session.patientCondition || session.type,
          notes: (session.notes || '') + " " + (session.treatmentNotes || ""),
          patientName: session.patientName,
          doctorName: session.doctorName
        });
        aiAnalysis = this.aiService.parseAIResponse(aiRawResponse);
      } catch (apiError) {
        console.error("Gemini API failed, using high-quality local template:", apiError);
        aiAnalysis = this.performLocalAIReview(session);
      }

      // 3. PERSIST the report to database
      if (aiAnalysis) {
        await this.bookingService.updateAiReport(session.id, aiAnalysis);

        // Update local state immediately for better UX
        session.aiReport = {
          ...aiAnalysis,
          generatedAt: new Date()
        };
        this.toast.success('AI Report generated successfully!', 'Success');
        this.generatePDF(session, aiAnalysis);
      }

    } catch (globalError) {
      console.error("Report Generation Error:", globalError);
      this.toast.error("Could not generate report. Please try again later.", "Error");
    } finally {
      this.generatingReportId = null;
    }
  }

  private generatePDF(session: BookedAppointment, ai: any) {
    const doc = new jsPDF();
    const primaryColor = [16, 185, 129];
    const classicNavy = [15, 23, 42];
    const goldAccent = [133, 77, 14];

    this.drawWatermark(doc);

    // Main Border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);

    // Slim Premium Header
    doc.setFillColor(15, 23, 42);
    doc.rect(5, 5, 200, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('times', 'bold');
    doc.text('PhysioPro', 15, 25);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('PREMIUM CLINICAL AI REPORT', 140, 20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text(`DATE: ${session.date}`, 140, 25);
    doc.text(`REPORT ID: #PHY-${session.id?.substring(0, 6).toUpperCase()}`, 140, 30);

    let currentY = 50;

    // Patient & Clinical Context (Side by Side)
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(10, currentY, 190, 30, 2, 2, 'F');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', 15, currentY + 8);
    doc.text('CLINICAL PROVIDER', 110, currentY + 8);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Name: ${session.patientName}`, 15, currentY + 16);
    doc.text(`Condition: ${session.patientCondition || session.type}`, 15, currentY + 23);

    doc.text(`Lead: Dr. ${session.doctorName}`, 110, currentY + 16);
    doc.text(`Specialty: ${session.doctorSpecialty}`, 110, currentY + 23);

    currentY += 40;

    // Progress Badge inside summary box
    // Observations Box (Dynamic Height)
    const summary = doc.splitTextToSize(ai.summary, 155);
    const summaryHeight = summary.length * 5;
    const observationBoxHeight = Math.max(45, summaryHeight + 20); // Maintain a minimum height of 45

    doc.setFillColor(243, 244, 246);
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.roundedRect(10, currentY, 190, observationBoxHeight, 3, 3, 'FD');

    // Score Circle
    doc.setFillColor(15, 23, 42);
    doc.circle(180, currentY + (observationBoxHeight / 2), 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${ai.score}%`, 180, currentY + (observationBoxHeight / 2) + 1, { align: 'center' });
    doc.setFontSize(5);
    doc.text('RECOVERY', 180, currentY + (observationBoxHeight / 2) + 4, { align: 'center' });

    // Observations Text
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text('EXPERT CLINICAL OBSERVATIONS', 15, currentY + 10);

    doc.setTextColor(51, 65, 85);
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.text(summary, 15, currentY + 18);

    currentY += observationBoxHeight + 10;

    // Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('REHABILITATION ROADMAP', 15, currentY);

    // 1. Normalize Roadmap Data (Handle both old array format and new object format)
    const normalizedRoadmap = ai.roadmap.map((r: any) => {
      if (Array.isArray(r)) {
        return {
          phase: r[0] || 'N/A',
          goal: r[1] || 'N/A',
          exercises: r[2] || 'N/A',
          focus: r[3] || 'N/A',
          videoUrl: null
        };
      }
      return r;
    });

    autoTable(doc, {
      startY: currentY + 5,
      head: [['PHASE', 'CLINICAL GOALS', 'SPECIFIC PROTOCOL', 'PRIMARY FOCUS', 'VIDEO']],
      body: normalizedRoadmap.map((r: any) => [r.phase, r.goal, r.exercises, r.focus, r.videoUrl ? 'Watch Guide' : 'N/A']),
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, font: 'times', fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [16, 185, 129], cellWidth: 20 },
        1: { cellWidth: 40 },
        2: { cellWidth: 55 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 } // Removed fixed blue
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const rowData = normalizedRoadmap[data.row.index];
          if (rowData && rowData.videoUrl) {
            data.cell.styles.textColor = [37, 99, 235]; // Blue
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [150, 150, 150]; // Grey
          }
        }
      },
      didDrawCell: (data) => {
        const rowData = normalizedRoadmap[data.row.index];
        if (data.section === 'body' && data.column.index === 4 && rowData && rowData.videoUrl) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, {
            url: rowData.videoUrl
          });
        }
      },
      margin: { left: 10, right: 10 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;

    // Final Advice (Dynamic Amber Box)
    const advice = doc.splitTextToSize(ai.recommendation, 180);
    const textHeight = advice.length * 5; // roughly 5 units per line
    const adviceBoxHeight = textHeight + 15; // padding for header and bottom

    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(10, finalY, 190, adviceBoxHeight, 2, 2, 'FD');

    doc.setTextColor(146, 64, 14);
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.text('FINAL CLINICAL RECOMMENDATION', 15, finalY + 7);

    doc.setTextColor(69, 26, 3);
    doc.setFont('times', 'italic'); // Changed to times for consistency
    doc.setFontSize(9);
    doc.text(advice, 15, finalY + 13);

    // Signature
    doc.setDrawColor(203, 213, 225);
    doc.line(140, 275, 190, 275);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Certified Clinical Signatory', 145, 280);

    const fileName = `Report_${session.patientName.replace(/\s+/g, '_')}.pdf`;

    // ROBUST MOBILE DOWNLOAD: Instead of window.open, we use a hidden link approach 
    // which is more reliable across mobile browsers and webviews like Android APK.
    try {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile) {
        const blob = doc.output('blob');
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        this.toast.success('Report download started.', 'Mobile Download');
      } else {
        doc.save(fileName);
        this.toast.success('Report downloaded successfully.', 'Success');
      }
    } catch (e) {
      console.error('Download error:', e);
      // Fallback
      doc.save(fileName);
    }
  }

  private drawWatermark(doc: jsPDF) {
    doc.setDrawColor(240, 245, 245);
    doc.setLineWidth(0.1);
    for (let x = 20; x < 200; x += 50) {
      for (let y = 60; y < 280; y += 50) {
        doc.line(x - 1, y, x + 1, y);
        doc.line(x, y - 1, x, y + 1);
      }
    }
    doc.setTextColor(245, 248, 248);
    doc.setFontSize(55);
    doc.setFont('times', 'bold');
    doc.text('OFFICIAL MEDICAL RECORD', 30, 180, { angle: 45 });
  }

  private performLocalAIReview(session: BookedAppointment) {
    const c = (session.patientCondition || session.type || '').toLowerCase();
    let summary = "The session evaluation shows consistent progress. Structural alignment and motor control are improving steadily with the current intervention protocol.";
    let score = 65;
    let recommendation = "Maintain active consistency with the home exercise protocol. Focus on gradual load progression.";
    let roadmap = [
      { phase: 'Phase 1', goal: 'Pain Control', exercises: 'ISO exercises', focus: 'Stability', videoUrl: 'https://www.youtube.com/results?search_query=physiotherapy+pain+management' },
      { phase: 'Phase 2', goal: 'Mobility', exercises: 'Active stretching', focus: 'Range', videoUrl: 'https://www.youtube.com/results?search_query=physiotherapy+mobility+exercises' },
      { phase: 'Phase 3', goal: 'Integration', exercises: 'Functional drills', focus: 'Power', videoUrl: 'https://www.youtube.com/results?search_query=physiotherapy+functional+return' }
    ];

    if (c.includes('back') || c.includes('spine')) {
      summary = "Spinal assessment suggests reduced mechanical stress. Core stability is improving, allowing for increased functional load-bearing capacity.";
      roadmap[0] = { ...roadmap[0], goal: 'Decompression', exercises: 'Pelvic tilts', focus: 'Relief', videoUrl: 'https://www.youtube.com/results?search_query=physiotherapy+back+decompression' };
    }

    return { summary, score, roadmap, recommendation };
  }

  // ═══════════════════════════════════════
  //  FEEDBACK MANAGEMENT
  // ═══════════════════════════════════════

  openFeedbackModal(session: BookedAppointment) {
    this.selectedSessionForFeedback = session;
    this.isFeedbackModalOpen = true;
    this.feedbackRating = 5;
    this.feedbackComment = '';
  }

  closeFeedbackModal() {
    this.isFeedbackModalOpen = false;
    this.selectedSessionForFeedback = null;
  }

  async submitFeedback() {
    if (!this.selectedSessionForFeedback?.id) return;
    this.isSubmittingFeedback = true;
    try {
      await this.bookingService.updateFeedback(this.selectedSessionForFeedback.id, {
        rating: this.feedbackRating,
        comment: this.feedbackComment
      });
      this.selectedSessionForFeedback.feedback = {
        rating: this.feedbackRating,
        comment: this.feedbackComment,
        createdAt: new Date()
      };
      this.toast.success('Thank you for your valuable feedback!', 'Feedback Submitted');
      this.closeFeedbackModal();
    } catch (error) {
      console.error('Feedback error:', error);
      this.toast.error('Failed to submit feedback. Please try again.', 'Error');
    } finally {
      this.isSubmittingFeedback = false;
    }
  }
}
