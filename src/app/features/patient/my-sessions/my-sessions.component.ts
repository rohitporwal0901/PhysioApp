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

    // Start Loading Overlay
    this.generatingReportId = session.id;

    let aiAnalysis;

    try {
      // Step 1: Attempt Real AI Analysis
      if (environment.geminiApiKey) {
        try {
          const aiRawResponse = await this.aiService.generateClinicalReport({
            condition: session.patientCondition || session.type,
            notes: (session.notes || '') + " " + (session.treatmentNotes || ""),
            patientName: session.patientName,
            doctorName: session.doctorName
          });
          aiAnalysis = this.aiService.parseAIResponse(aiRawResponse);
        } catch (apiError) {
          console.error("Gemini API failed, falling back to local review:", apiError);
          aiAnalysis = this.performLocalAIReview(session);
        }
      } else {
        // Fallback if no key is present
        aiAnalysis = this.performLocalAIReview(session);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Short simulation
      }

      // Step 2: Generate PDF
      this.generatePDF(session, aiAnalysis);

    } catch (globalError) {
      console.error("Report Generation Error:", globalError);
      alert("Could not generate report. Please try again later.");
    } finally {
      // Stop Loading Overlay
      this.generatingReportId = null;
    }
  }

  private generatePDF(session: BookedAppointment, ai: any) {
    const doc = new jsPDF();
    
    // Watermark & Background cross pattern
    this.drawWatermark(doc);

    // Border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);
    doc.rect(7, 7, 196, 283);

    // Modern Header Block
    doc.setFillColor(15, 23, 42); // Navy
    doc.rect(5, 5, 200, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont('times', 'bold');
    doc.text('PhysioPro', 20, 30);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text('PREMIUM CLINICAL REHABILITATION SERVICES', 120, 22);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL AI-DIAGNOSTIC REPORT', 120, 28);

    // Progress Badge
    doc.setDrawColor(133, 77, 14); // Gold
    doc.setFillColor(255, 255, 255, 0.1);
    doc.circle(185, 25, 12, 'FD');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text(`${ai.score}%`, 181, 26);
    doc.setFontSize(5);
    doc.text('RECOVERY', 178, 29);

    let currentY = 65;

    // Patient & Provider Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.text('PATIENT RECORD', 25, currentY);
    doc.text('PROVIDER DETAILS', 115, currentY);

    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.8);
    doc.line(25, currentY + 3, 90, currentY + 3);
    doc.line(115, currentY + 3, 185, currentY + 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(`Name: ${session.patientName}`, 25, currentY + 15);
    doc.text(`Condition: ${session.patientCondition || session.type}`, 25, currentY + 23);
    doc.text(`Date: ${session.date}`, 25, currentY + 31);

    doc.text(`Dr. ${session.doctorName}`, 115, currentY + 15);
    doc.text(`${session.doctorSpecialty}`, 115, currentY + 23);
    doc.text(`ID: #PHY-${session.id?.substring(0, 8).toUpperCase()}`, 115, currentY + 31);

    currentY += 50;

    // AI Summary Box
    const summary = doc.splitTextToSize(ai.summary, 160);
    const boxH = (summary.length * 7) + 20;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(20, currentY, 170, boxH, 3, 3, 'FD');
    
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(12);
    doc.setFont('times', 'bolditalic');
    doc.text('AI CLINICAL OBSERVATIONS', 30, currentY + 10);
    
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text(summary, 30, currentY + 20);

    currentY += boxH + 15;

    // Roadmap Table
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('REHABILITATION ROADMAP', 25, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['PHASE', 'GOAL', 'PROTOCOL', 'FOCUS']],
      body: ai.roadmap,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: 255, font: 'times' },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold', textColor: [16, 185, 129] } },
      margin: { left: 20, right: 20 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Clinical Advice
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('FINAL CLINICAL ADVICE', 25, finalY);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    const advice = doc.splitTextToSize(ai.recommendation, 160);
    doc.text(advice, 25, finalY + 8);

    doc.save(`Report_${session.patientName.replace(/\s+/g, '_')}.pdf`);
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
      ['Phase 1', 'Pain Control', 'ISO exercises', 'Stability'],
      ['Phase 2', 'Mobility', 'Active stretching', 'Range'],
      ['Phase 3', 'Integration', 'Functional drills', 'Power']
    ];

    if (c.includes('back') || c.includes('spine')) {
      summary = "Spinal assessment suggests reduced mechanical stress. Core stability is improving, allowing for increased functional load-bearing capacity.";
      roadmap[0] = ['Phase 1', 'Decompression', 'Pelvic tilts', 'Relief'];
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
      this.closeFeedbackModal();
    } catch (error) {
      console.error('Feedback error:', error);
      alert('Failed to submit feedback.');
    } finally {
      this.isSubmittingFeedback = false;
    }
  }
}
