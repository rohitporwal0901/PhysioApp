import {
    Component, inject, OnInit, OnDestroy, AfterViewInit,
    HostListener, ChangeDetectorRef, ViewChild, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Observable, map } from 'rxjs';
import { MockApiService } from '../../core/services/mock-api.service';
import { AuthService } from '../../core/services/auth.service';
import { BookingService, BookedAppointment } from '../../core/services/booking.service';
import { SettingsService, AppSettings } from '../../core/services/settings.service';
import { SafePipe } from '../../shared/pipes/safe.pipe';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, SafePipe],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
    private api = inject(MockApiService);
    private router = inject(Router);
    private cdr = inject(ChangeDetectorRef);
    private authService = inject(AuthService);
    private bookingService = inject(BookingService);
    private settingsService = inject(SettingsService);

    doctors$: Observable<any[]> | undefined;
    labs$: Observable<any[]> | undefined;
    feedbacks$: Observable<BookedAppointment[]> | undefined;
    mobileMenuOpen = false;
    navScrolled = false;
    searchQuery = '';
    private observers: IntersectionObserver[] = [];
    activeTestimonial = 0;
    private testimonialInterval: any;
    private feedbackCount = 5;
    @ViewChild('doctorsSlider') doctorsSlider: ElementRef | undefined;
    @ViewChild('labsSlider') labsSlider: ElementRef | undefined;
    openFaqIndex: number | null = null;
    
    // Dynamic Hero Video
    heroVideoSettings: AppSettings['heroVideo'] | null = null;
    isAuthChecking = true;

    get isLoggedIn() { return this.authService.isLoggedIn; }
    get userRole() { return this.authService.userRole; }

    // Hero image slideshow
    activeHeroImage = 0;
    private heroImageInterval: any;
    heroImages = [
        {
            url: 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1200&auto=format&fit=crop',
            label: 'Expert Physiotherapy',
            caption: 'Personalised hands-on treatment by certified specialists'
        },
        {
            url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop',
            label: 'Fitness Rehabilitation',
            caption: 'Guided strength training & active recovery'
        },
        {
            url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200&auto=format&fit=crop',
            label: 'Yoga & Flexibility',
            caption: 'Improve mobility with therapeutic yoga sessions'
        },
        {
            url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200&auto=format&fit=crop',
            label: 'Sports Recovery',
            caption: 'Get back to peak performance after injury'
        },

    ];

    private labImages = [
      'https://images.unsplash.com/photo-1579152276503-0852bc239270?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=400&auto=format&fit=crop'
    ];

    // Unsplash doctor profile image collection
    private doctorImages = [
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'
    ];

    // Animated counters
    statCounters = [
        { label: 'Patients Treated', numericValue: 5000, current: 0, suffix: '+', animated: false },
        { label: 'Expert Therapists', numericValue: 30, current: 0, suffix: '+', animated: false },
        { label: 'Satisfaction Rate', numericValue: 98, current: 0, suffix: '%', animated: false },
        { label: 'Years of Excellence', numericValue: 12, current: 0, suffix: '+', animated: false },
    ];

    statIcons = ['users', 'stethoscope', 'heart-pulse', 'award'];

    conditions = [
        { label: 'Back Pain', icon: 'accessibility' },
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
        { name: 'Priya Sharma', role: 'Marathon Runner', rating: 5, text: 'After my ACL tear I thought I\'d never run again. Six weeks of targeted physio at PhysioPro and I was back on track. Truly world-class care.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
        { name: 'Ramesh Gupta', role: 'IT Professional', rating: 5, text: 'Booking took 2 minutes, the therapist was on time and my chronic back pain improved after three sessions. Highly recommend.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
        { name: 'Neha Verma', role: 'School Teacher', rating: 5, text: 'Five years of debilitating back pain — gone in 8 weeks. The personalised exercise plan changed my life. I wish I had come sooner!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' },
        { name: 'Arjun Mehta', role: 'Cricket Player', rating: 5, text: 'Shoulder surgery rehab was seamless. The team monitored progress weekly and adjusted the plan. I\'m now bowling at full pace again.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
        { name: 'Sunita Rao', role: 'Retired Educator', rating: 5, text: 'The geriatric programme gave me my independence back. Safe exercises, caring staff and brilliant follow-up. 10/10.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
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

    socialLinks = [
        { icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/physiopro' },
        { icon: 'twitter', label: 'Twitter', url: 'https://twitter.com/physiopro' },
        { icon: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/physiopro' },
        { icon: 'youtube', label: 'YouTube', url: 'https://youtube.com/physiopro' },
    ];

    @HostListener('window:scroll')
    onScroll() {
        this.navScrolled = window.scrollY > 30;
    }

    ngOnInit() {
        this.doctors$ = this.api.getDoctors().pipe(
            map(docs => docs.filter(doc => doc.active))
        );
        this.labs$ = this.api.getLabTechnicians().pipe(
            map(labs => labs.filter(lab => lab.isActive))
        );
        // Re-trigger observer whenever doctors load
        this.doctors$.subscribe(() => {
            setTimeout(() => this.setupScrollAnimations(), 200);
        });
        this.labs$.subscribe(() => {
            setTimeout(() => this.setupScrollAnimations(), 200);
        });

        this.feedbacks$ = this.bookingService.getLatestFeedbacks(5);
        this.feedbacks$.subscribe(feedbacks => {
            if (feedbacks && feedbacks.length > 0) {
                this.feedbackCount = feedbacks.length;
            }
        });

        this.settingsService.settings$.subscribe(settings => {
            if (settings) {
                this.heroVideoSettings = settings.heroVideo;
            }
        });

        this.startTestimonialRotation();
        this.startHeroImageRotation();

        // Manage auth checking state
        this.authService.currentUser$.subscribe(user => {
            if (user !== undefined) {
                this.isAuthChecking = false;
                this.cdr.markForCheck();
            }
        });
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
        // Disconnect existing observers to avoid duplicates
        this.observers.forEach(o => o.disconnect());
        this.observers = [];

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
            { threshold: 0.1 }
        );

        document.querySelectorAll('.reveal, .stats-trigger, .doctor-card, .service-card').forEach(el => observer.observe(el));
        this.observers.push(observer);
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
            this.activeTestimonial = (this.activeTestimonial + 1) % this.feedbackCount;
            this.cdr.markForCheck();
        }, 4500);
    }

    startHeroImageRotation() {
        // Disabled since we are now using a YouTube Video iframe
        // this.heroImageInterval = setInterval(() => {
        //     this.activeHeroImage = (this.activeHeroImage + 1) % this.heroImages.length;
        //     this.cdr.markForCheck();
        // }, 3800);
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

    scrollDoctors(direction: 'next' | 'prev') {
      if (this.doctorsSlider && this.doctorsSlider.nativeElement) {
        const el = this.doctorsSlider.nativeElement;
        const scrollAmount = el.clientWidth * 0.8;
        if (direction === 'next') {
          el.scrollTo({ left: el.scrollLeft + scrollAmount, behavior: 'smooth' });
        } else {
          el.scrollTo({ left: el.scrollLeft - scrollAmount, behavior: 'smooth' });
        }
      }
    }

    scrollLabs(direction: 'next' | 'prev') {
      if (this.labsSlider && this.labsSlider.nativeElement) {
        const el = this.labsSlider.nativeElement;
        const scrollAmount = el.clientWidth * 0.8;
        if (direction === 'next') {
          el.scrollTo({ left: el.scrollLeft + scrollAmount, behavior: 'smooth' });
        } else {
          el.scrollTo({ left: el.scrollLeft - scrollAmount, behavior: 'smooth' });
        }
      }
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

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    goToLogin() { this.router.navigate(['/login']); }
    goToRegister() { this.router.navigate(['/patient/register']); }
    goToDoctorRegister() { this.router.navigate(['/doctor/register']); }
    goToLabRegister() { this.router.navigate(['/lab/register']); }

    goToDashboard() {
        if (this.userRole === 'admin') this.router.navigate(['/admin/dashboard']);
        else if (this.userRole === 'doctor') this.router.navigate(['/doctor/dashboard']);
        else this.router.navigate(['/patient/dashboard']);
    }

    logout() {
        this.authService.logout();
    }

    encodeURIComponent(str: string): string {
        return encodeURIComponent(str);
    }

    getDoctorImage(doc: any, index: number): string {
        if (doc.image && !doc.image.includes('ui-avatars.com')) {
            return doc.image;
        }
        return this.doctorImages[index % this.doctorImages.length];
    }

    getLabImage(lab: any, index: number): string {
        if (lab.image && !lab.image.includes('ui-avatars.com')) {
            return lab.image;
        }
        return this.labImages[index % this.labImages.length];
    }

    callLab(phone: string) {
        if (phone) {
            window.location.href = `tel:${phone}`;
        }
    }

    getWhatsAppUrl(lab: any): string | null {
        const isAvailable = lab.isAvailable || lab.available;
        if (!isAvailable) return null;
        const phone = lab.phone ? lab.phone.replace('+', '').replace(/\s/g, '') : '';
        const name = lab.fullName || lab.name || '';
        const msg = encodeURIComponent(`Hi, I would like to book a diagnostic test at ${name}`);
        return `https://wa.me/${phone}?text=${msg}`;
    }

    onTestImgError(event: any, name: string) {
        event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`;
    }
}
