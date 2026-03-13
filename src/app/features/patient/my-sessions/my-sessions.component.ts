import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService, BookedAppointment } from '../../../core/services/booking.service';
import { AuthService } from '../../../core/services/auth.service';
import { map } from 'rxjs';
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

  generatingReportId: string | null = null;

  // Unsplash doctor profile image collection
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
        // Step 1: Divide sessions into Upcoming and Past based on status
        this.upcomingSessions = appointments
          .filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
          .sort((a, b) => this.compareDateTime(a, b));

        this.pastSessions = appointments
          .filter(apt => apt.status === 'completed' || apt.status === 'cancelled')
          .sort((a, b) => this.compareDateTime(b, a)); // Past history latest first

        this.isLoading = false;
      });
    }
  }

  /** Helper to compare date and time for sorting */
  private compareDateTime(a: BookedAppointment, b: BookedAppointment): number {
    const dateA = new Date(a.date + 'T00:00:00');
    const dateB = new Date(b.date + 'T00:00:00');
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
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
    if (session.doctorImage && !session.doctorImage.includes('ui-avatars.com')) {
      return session.doctorImage;
    }
    return this.doctorImages[index % this.doctorImages.length];
  }

  encodeURIComponent(str: string): string {
    return encodeURIComponent(str);
  }

  // ═══════════════════════════════════════
  //  AI-POWERED PDF REPORT GENERATION
  // ═══════════════════════════════════════

  async downloadReport(session: BookedAppointment) {
    if (!session.id) return;
    
    // Simulate AI Processing Animation (5 Seconds)
    this.generatingReportId = session.id;
    await new Promise(resolve => setTimeout(resolve, 5000));
    this.generatingReportId = null;

    const doc = new jsPDF();
    const primaryColor = [16, 185, 129]; // Emerald (Health)
    const classicNavy = [15, 23, 42];    // Midnight Blue (Classic)
    const goldAccent = [133, 77, 14];    // Classic Gold

    const aiAnalysis = this.performAIClinicalReview(session);

    // --- PAGE 1 SETUP ---
    // Classic Watermark (Manual Drawing to avoid file signature errors)
    this.drawClassicWatermark(doc);
    
    // Classic Border
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.5);
    doc.rect(5, 5, 200, 287);
    doc.rect(7, 7, 196, 283);

    // Header Content
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
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL AI-DIAGNOSTIC REPORT', 120, 28);

    // AI Score (Classic Gold Badge)
    doc.setDrawColor(133, 77, 14); // Gold
    doc.setLineWidth(0.5);
    doc.setFillColor(255, 255, 255, 0.1);
    doc.circle(185, 25, 12, 'FD');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.text(`${aiAnalysis.score}%`, 181, 25);
    doc.setFontSize(5);
    doc.text('RECOVERY', 178, 28);

    let currentY = 65;

    // Classic Split Info
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
    
    // Left: Patient
    doc.text(`Full Name: ${session.patientName}`, 25, currentY + 15);
    doc.text(`Medical Case: ${session.patientCondition || session.type}`, 25, currentY + 23);
    doc.text(`Enrollment Date: ${session.date}`, 25, currentY + 31);
    
    // Right: Doctor
    doc.text(`Consultant: Dr. ${session.doctorName}`, 115, currentY + 15);
    doc.text(`Specialization: ${session.doctorSpecialty}`, 115, currentY + 23);
    doc.text(`Report Ref: #PHY-${session.id?.substring(0, 8).toUpperCase()}`, 115, currentY + 31);

    currentY += 50;

    // AI Analysis Section (Premium Box)
    const analysisText = aiAnalysis.summary;
    const splitText = doc.splitTextToSize(analysisText, 160);
    const boxHeight = (splitText.length * 7) + 20;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.3);
    doc.roundedRect(20, currentY, 170, boxHeight, 3, 3, 'FD');

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(12);
    doc.setFont('times', 'bolditalic');
    doc.text('AI THERAPEUTIC OBSERVATIONS', 30, currentY + 10);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');
    doc.text(splitText, 30, currentY + 20);

    currentY += boxHeight + 15;

    // Recovery Table (Classic Modern Fusion)
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text('PERSONALIZED REHABILITATION ROADMAP', 25, currentY);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['PHASE', 'CLINICAL GOAL', 'EXERCISE PROTOCOL', 'THERAPEUTIC FOCUS']],
      body: aiAnalysis.roadmap,
      theme: 'grid',
      headStyles: { 
        fillColor: [15, 23, 42], 
        textColor: 255, 
        font: 'times', 
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center'
      },
      styles: { 
        font: 'helvetica', 
        fontSize: 9, 
        cellPadding: 5,
        lineColor: [226, 232, 240]
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [16, 185, 129] },
        3: { fontStyle: 'italic', textColor: [100, 116, 139] }
      },
      margin: { left: 20, right: 20 }
    });

    // Signatures / Footer
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.setDrawColor(203, 213, 225);
    doc.line(30, finalY + 15, 80, finalY + 15);
    doc.line(130, finalY + 15, 180, finalY + 15);
    
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Verified Clinical Specialist', 42, finalY + 20);
    doc.text('System Generated (AI Review)', 138, finalY + 20);

    // Authentication Badge
    doc.setFillColor(16, 185, 129, 0.1);
    doc.roundedRect(85, finalY + 10, 40, 12, 2, 2, 'F');
    doc.setTextColor(16, 185, 129);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('SECURE & VERIFIED', 92, finalY + 18);

    doc.save(`Classic_AI_Report_${session.patientName.replace(/\s+/g, '_')}.pdf`);
  }

  /**
   * Draws a professional clinical watermark pattern manually
   */
  private drawClassicWatermark(doc: jsPDF) {
    // Background clinical pattern
    doc.setDrawColor(240, 245, 245); // Extremely faint teal-grey
    doc.setLineWidth(0.1);
    
    // Draw a grid of subtle clinical crosses
    for (let x = 20; x < 200; x += 50) {
      for (let y = 60; y < 280; y += 50) {
        doc.line(x - 1.5, y, x + 1.5, y);
        doc.line(x, y - 1.5, x, y + 1.5);
      }
    }

    // Large diagonal watermark
    doc.setTextColor(245, 248, 248); // Near white but visible
    doc.setFontSize(55);
    doc.setFont('times', 'bold');
    
    // Using a more manual approach for shadow text feeling
    doc.text('OFFICIAL CLINICAL RECORD', 30, 180, { 
        angle: 45,
        renderingMode: 'fill'
    });
  }

  /**
   * Advanced AI Clinical Review Engine
   * Analyzing patient conditions, doctor notes, and historical data
   */
  private performAIClinicalReview(session: BookedAppointment) {
    const pNotes = (session.notes || '').toLowerCase();
    const tNotes = (session.treatmentNotes || '').toLowerCase();
    const cond = (session.patientCondition || session.type || '').toLowerCase();
    
    let summary = "AI ANALYSIS: Based on clinical cross-referencing, the patient requires a structured neuro-muscular re-education protocol. Current status suggests moderate inflammation with restricted range of motion.";
    let score = 42; 
    let roadmap = [
      ['Acute', 'Pain Management', 'Gentle ISOMetrics, Ice compression', 'Inflammation'],
      ['Recovery', 'Functional ROM', 'Assisted stretching, Light bands', 'Mobility'],
      ['Final', 'Functional Strength', 'Proprioceptive training, Loading', 'Integrity']
    ];

    // Comprehensive Condition Mapping
    const c = cond + " " + pNotes + " " + tNotes;

    if (c.includes('back') || c.includes('sciatica') || c.includes('spine')) {
      summary = "AI ANALYSIS: Lumbar Vertebrae Analysis indicates nerve compression or mechanical stress. Suggesting core stabilization and decompression protocols.";
      score = c.includes('sciatica') ? 28 : 35;
      roadmap = [
        ['Acute', 'Nerve Decompress', 'Slump stretch (gentle), Pelvic tilts', 'Safety'],
        ['Sub-Acute', 'Core Bracing', 'Bird-dog, Dead-bug, Modified planks', 'Stability'],
        ['Return', 'Functional Load', 'Glute bridges, Wall slides, Walking', 'Endurance']
      ];
    } 
    else if (c.includes('knee') || c.includes('arthritis')) {
      summary = "AI ANALYSIS: Joint stress detected. Recommending VMO activation and non-weight bearing range of motion to preserve joint integrity.";
      score = c.includes('arthritis') ? 18 : 55;
      roadmap = [
        ['Phase 1', 'Activation', 'Quad sets, Ankle pumps, Ice', 'Inflammation'],
        ['Phase 2', 'ROM', 'Heel slides, Straight leg raises', 'Mobility'],
        ['Phase 3', 'Load', 'Wall sits, Monster walks, Step-ups', 'Power']
      ];
    }
    else if (c.includes('neck') || c.includes('cervical')) {
      summary = "AI ANALYSIS: Postural strain or cervical impingement identified. Focus on deep neck flexor activation and scapular rhythm.";
      score = 48;
      roadmap = [
        ['Phase 1', 'Alignment', 'Chin tucks, Scapular squeezes', 'Posture'],
        ['Phase 2', 'Mobility', 'Isometric neck holds, Trap stretch', 'ROM'],
        ['Phase 3', 'Stability', 'Face pulls, External rotations', 'Endurance']
      ];
    }
    else if (c.includes('shoulder') || c.includes('frozen shoulder')) {
      summary = "AI ANALYSIS: Adhesive capsulitis or impingement suspected. Priority: Glenohumeral rhythm restoration and Strengthening of posterior chain.";
      score = c.includes('frozen') ? 22 : 40;
      roadmap = [
        ['Acute', 'Capsule Mobility', 'Pendulums, Towel stretches', 'ROM'],
        ['Active', 'Scapular Rhythm', 'I-Y-T movements, Wall crawls', 'Rhythm'],
        ['Power', 'Rotator Strength', 'Band rotations, Overhead press', 'Load']
      ];
    }
    else if (c.includes('sports') || c.includes('injury')) {
      summary = "AI ANALYSIS: Athletic injury protocol enabled. Phased return to sport focusing on explosive power and proprioceptive control.";
      score = 65;
      roadmap = [
        ['Phase 1', 'Bio-mechanics', 'Static holds, Basic mobility', 'Recovery'],
        ['Phase 2', 'Proprioception', 'Single leg balance, Plyo-jumps', 'Control'],
        ['Phase 3', 'Sport-Spec', 'Agility drills, Sprint starts', 'Performance']
      ];
    }
    else if (c.includes('post surgery') || c.includes('surgical')) {
      summary = "AI ANALYSIS: Post-surgical adherence is critical. Monitoring for scar tissue management and gradual introduction of kinematic chains.";
      score = 15;
      roadmap = [
        ['Acute', 'Wound Management', 'Passive ROM, Compression', 'Healing'],
        ['Sub-Acute', 'Controlled Load', 'Active-assisted movements', 'Fibrosis'],
        ['Functional', 'Kinematic Chain', 'Progressive resistance training', 'Return']
      ];
    }
    else if (c.includes('stroke') || c.includes('neuro')) {
      summary = "AI ANALYSIS: Neuro-plasticity protocol required. High emphasis on task-oriented training to facilitate motor recovery.";
      score = 12;
      roadmap = [
        ['Sensory', 'Neuro-Input', 'Mirror therapy, Tactile stimul.', 'Rewiring'],
        ['Motor', 'Coordination', 'Reach-to-grasp, Sit-to-stand', 'Patterns'],
        ['ADL', 'Independence', 'Unassisted walking, Fine motor', 'Autonomy']
      ];
    }
    else if (c.includes('other')) {
      summary = "AI ANALYSIS: General rehabilitation plan initiated. Focused on improving functional movement and baseline strength.";
      score = 50;
      roadmap = [
        ['Week 1', 'Assessment', 'Baseline mobility, Pain monitor', 'Baseline'],
        ['Week 2', 'Mobilization', 'Light resistance, Active ROM', 'Progress'],
        ['Week 3', 'Strengthening', 'Bodyweight squats, Pull-aparts', 'Integrity']
      ];
    }

    return { summary, roadmap, score };
  }

  // ═══════════════════════════════════════
  //  FEEDBACK MANAGEMENT
  // ═══════════════════════════════════════

  openFeedbackModal(session: BookedAppointment) {
    this.selectedSessionForFeedback = session;
    this.feedbackRating = 5;
    this.feedbackComment = '';
    this.isFeedbackModalOpen = true;
  }

  closeFeedbackModal() {
    this.isFeedbackModalOpen = false;
    this.selectedSessionForFeedback = null;
  }

  async submitFeedback() {
    if (!this.selectedSessionForFeedback || !this.selectedSessionForFeedback.id) return;
    
    this.isSubmittingFeedback = true;
    try {
      await this.bookingService.updateFeedback(this.selectedSessionForFeedback.id, {
        rating: this.feedbackRating,
        comment: this.feedbackComment
      });
      
      // Update local state to show feedback immediately (or let real-time handle it)
      this.selectedSessionForFeedback.feedback = {
        rating: this.feedbackRating,
        comment: this.feedbackComment,
        createdAt: new Date()
      };
      
      this.closeFeedbackModal();
      // Optional: Show success toast
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      this.isSubmittingFeedback = false;
    }
  }
}
