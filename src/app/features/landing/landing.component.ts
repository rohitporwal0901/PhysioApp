import {
    Component, inject, OnInit, OnDestroy, AfterViewInit,
    HostListener, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../core/services/mock-api.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
    private api = inject(MockApiService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);

    doctors$: Observable<any[]> | undefined;
    mobileMenuOpen = false;
    navScrolled = false;
    searchQuery = '';
    private observers: IntersectionObserver[] = [];
    activeTestimonial = 0;
    private testimonialInterval: any;
    openFaqIndex: number | null = null;

    // Hero image slideshow
    activeHeroImage = 0;
    private heroImageInterval: any;
    heroImages = [
        {
            url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop',
            label: 'Manual Therapy',
            caption: 'Expert hands-on physiotherapy treatment'
        },
        {
            url: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=2070&auto=format&fit=crop',
            label: 'Rehabilitation',
            caption: 'Guided recovery & mobility exercises'
        },
        {
            url: 'https://images.unsplash.com/photo-1576765607924-3f7b8410a787?q=80&w=2069&auto=format&fit=crop',
            label: 'Therapeutic Massage',
            caption: 'Targeted soft-tissue & deep-tissue therapy'
        },
        {
            url: 'https://images.unsplash.com/photo-1518611012118-696072a63b2a?q=80&w=2070&auto=format&fit=crop',
            label: 'Exercise Therapy',
            caption: 'Personalised active rehabilitation plans'
        },
        {
            url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2070&auto=format&fit=crop',
            label: 'Post-Surgical Care',
            caption: 'Structured recovery after orthopaedic surgery'
        },
    ];

    // Animated counters
    statCounters = [
        { label: 'Patients Treated', numericValue: 5000, current: 0, suffix: '+', animated: false },
        { label: 'Expert Therapists', numericValue: 30, current: 0, suffix: '+', animated: false },
        { label: 'Satisfaction Rate', numericValue: 98, current: 0, suffix: '%', animated: false },
        { label: 'Years of Excellence', numericValue: 12, current: 0, suffix: '+', animated: false },
    ];

    conditions = [
        { label: 'Back Pain', icon: 'person-standing' },
        { label: 'Knee Injury', icon: 'footprints' },
        { label: 'Shoulder Pain', icon: 'activity' },
        { label: 'Neck Pain', icon: 'brain' },
        { label: 'Sports Injury', icon: 'zap' },
        { label: 'Post Surgery', icon: 'stethoscope' },
        { label: 'Frozen Shoulder', icon: 'shield-check' },
        { label: 'Arthritis', icon: 'bone' },
        { label: 'Sciatica', icon: 'activity' },
        { label: 'Stroke Rehab', icon: 'heart-pulse' },
    ];

    howItWorks = [
        {
            step: '01',
            icon: 'search',
            title: 'Find Your Specialist',
            desc: 'Browse verified physiotherapists by condition, location or availability.',
            color: 'teal'
        },
        {
            step: '02',
            icon: 'calendar-check',
            title: 'Book an Appointment',
            desc: 'Pick a date and time that suits you — online, in-clinic or home visit.',
            color: 'emerald'
        },
        {
            step: '03',
            icon: 'clipboard-list',
            title: 'Get Your Treatment Plan',
            desc: 'Your therapist builds a personalised plan tailored to your exact needs.',
            color: 'sky'
        },
        {
            step: '04',
            icon: 'trending-up',
            title: 'Track Your Recovery',
            desc: 'Monitor progress, receive reminders and celebrate every milestone.',
            color: 'violet'
        },
    ];

    services = [
        { icon: 'activity', title: 'Sports Rehabilitation', desc: 'Advanced care for sports injuries — muscle tears, ligament sprains, fractures & more.', color: 'from-primary-400 to-primary-600' },
        { icon: 'heart', title: 'Cardiopulmonary Therapy', desc: 'Breathing & cardiovascular rehabilitation for heart and lung conditions.', color: 'from-rose-400 to-rose-600' },
        { icon: 'zap', title: 'Neurological Rehab', desc: 'Expert care for stroke, Parkinson\'s, MS, and peripheral nerve injuries.', color: 'from-amber-400 to-amber-600' },
        { icon: 'users', title: 'Paediatric Physiotherapy', desc: 'Gentle, child-friendly therapy for developmental delays and physical conditions.', color: 'from-secondary-400 to-secondary-600' },
        { icon: 'shield-check', title: 'Post-Surgical Recovery', desc: 'Structured rehabilitation plans following orthopaedic or spinal surgeries.', color: 'from-accent-400 to-accent-600' },
        { icon: 'star', title: 'Geriatric Care', desc: 'Mobility, balance and pain-management programmes for elderly patients.', color: 'from-violet-400 to-violet-600' },
    ];

    testimonials = [
        { name: 'Priya Sharma', role: 'Marathon Runner', rating: 5, text: 'After my ACL tear I thought I\'d never run again. Six weeks of targeted physio at PhysioPro and I was back on track. Truly world-class care.', avatar: 'https://randomuser.me/api/portraits/women/32.jpg' },
        { name: 'Ramesh Gupta', role: 'IT Professional', rating: 5, text: 'Booking took 2 minutes, the therapist was on time and my chronic back pain improved after three sessions. Highly recommend.', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
        { name: 'Neha Verma', role: 'School Teacher', rating: 5, text: 'Five years of debilitating back pain — gone in 8 weeks. The personalised exercise plan changed my life. I wish I had come sooner!', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
        { name: 'Arjun Mehta', role: 'Cricket Player', rating: 5, text: 'Shoulder surgery rehab was seamless. The team monitored progress weekly and adjusted the plan. I\'m now bowling at full pace again.', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
        { name: 'Sunita Rao', role: 'Retired Educator', rating: 5, text: 'The geriatric programme gave me my independence back. Safe exercises, caring staff and brilliant follow-up. 10/10.', avatar: 'https://randomuser.me/api/portraits/women/55.jpg' },
    ];

    whyChoose = [
        { icon: 'calendar-check', title: 'Instant Online Booking', desc: 'Book, reschedule or cancel in minutes — any device, 24 × 7.' },
        { icon: 'user-check', title: 'Verified & Certified', desc: 'Every therapist holds valid certifications with verified clinical records.' },
        { icon: 'clipboard-list', title: 'Evidence-Based Plans', desc: 'Treatment protocols backed by clinical research, tailored to each patient.' },
        { icon: 'shield-check', title: 'Safe Clinical Standards', desc: 'ISO-compliant hygiene, sterilised equipment & structured safety protocols.' },
    ];

    faqs = [
        { q: 'Do I need a doctor\'s referral to book?', a: 'No referral is needed. You can book directly with any of our certified physiotherapists at any time.' },
        { q: 'How long is a typical session?', a: 'Initial assessment sessions are 45–60 minutes. Follow-up treatment sessions typically last 30–45 minutes depending on your plan.' },
        { q: 'Is physiotherapy covered by insurance?', a: 'Most major health insurance plans cover physiotherapy. We recommend checking with your insurer before your first visit. We provide invoices for reimbursement.' },
        { q: 'Do you offer home visits?', a: 'Yes. We offer home-visit physiotherapy in select areas. You can filter therapists by "Home Visit Available" when booking.' },
        { q: 'How many sessions will I need?', a: 'This depends on your condition. Many acute conditions improve in 4–8 sessions; chronic conditions may require a longer programme. Your therapist will set clear milestones.' },
        { q: 'Can I switch my therapist if needed?', a: 'Absolutely. Patient satisfaction is our priority. You can request a different therapist anytime through your patient portal without any extra fee.' },
    ];

    trustBadges = [
        { icon: 'award', label: 'ISO 9001 Certified' },
        { icon: 'shield-check', label: 'NABH Accredited' },
        { icon: 'users', label: '500+ Trained Specialists' },
        { icon: 'heart-pulse', label: 'Evidence-Based Care' },
    ];

    @HostListener('window:scroll')
    onScroll() {
        this.navScrolled = window.scrollY > 30;
    }

    ngOnInit() {
        this.doctors$ = this.api.getDoctors();
        this.startTestimonialRotation();
        this.startHeroImageRotation();
    }

    ngAfterViewInit() {
        this.setupScrollAnimations();
    }

    ngOnDestroy() {
        this.observers.forEach(o => o.disconnect());
        clearInterval(this.testimonialInterval);
        clearInterval(this.heroImageInterval);
    }

    private setupScrollAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        if (entry.target.classList.contains('stats-trigger')) {
                            this.animateCounters();
                        }
                    }
                });
            },
            { threshold: 0.12 }
        );
        setTimeout(() => {
            document.querySelectorAll('.reveal, .stats-trigger').forEach(el => observer.observe(el));
            this.observers.push(observer);
        }, 100);
    }

    animateCounters() {
        this.statCounters.forEach(stat => {
            if (stat.animated) return;
            stat.animated = true;
            const duration = 2000;
            const steps = 70;
            const stepVal = stat.numericValue / steps;
            let current = 0;
            const timer = setInterval(() => {
                current = Math.min(current + stepVal, stat.numericValue);
                stat.current = Math.floor(current);
                this.cdr.markForCheck();
                if (current >= stat.numericValue) clearInterval(timer);
            }, duration / steps);
        });
    }

    startTestimonialRotation() {
        this.testimonialInterval = setInterval(() => {
            this.activeTestimonial = (this.activeTestimonial + 1) % this.testimonials.length;
            this.cdr.markForCheck();
        }, 4500);
    }

    startHeroImageRotation() {
        this.heroImageInterval = setInterval(() => {
            this.activeHeroImage = (this.activeHeroImage + 1) % this.heroImages.length;
            this.cdr.markForCheck();
        }, 3800);
    }

    goToHeroImage(i: number) {
        this.activeHeroImage = i;
        clearInterval(this.heroImageInterval);
        this.startHeroImageRotation();
    }

    setTestimonial(i: number) {
        this.activeTestimonial = i;
        clearInterval(this.testimonialInterval);
        this.startTestimonialRotation();
    }

    toggleFaq(index: number) {
        this.openFaqIndex = this.openFaqIndex === index ? null : index;
    }

    bookCondition(condition: string) {
        this.router.navigate(['/patient/register'], { queryParams: { condition } });
    }

    searchAndBook() {
        this.router.navigate(['/patient/register'], { queryParams: { q: this.searchQuery } });
    }

    toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
    closeMobileMenu() { this.mobileMenuOpen = false; }

    openDoctorProfile(doc: any) {
        this.router.navigate(['/doctor-profile', doc.id], { state: { doctor: doc } });
    }

    goToLogin() { this.router.navigate(['/login']); }
    goToRegister() { this.router.navigate(['/patient/register']); }
    goToDoctorRegister() { this.router.navigate(['/doctor/register']); }
}
