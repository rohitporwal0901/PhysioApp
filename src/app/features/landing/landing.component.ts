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
import { SpecializationService, Specialty } from '../../core/services/specialization.service';
import { LegalModalComponent } from '../../shared/components/legal-modal/legal-modal.component';
import { ChatbotComponent } from '../../shared/components/chatbot/chatbot.component';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, SafePipe, LegalModalComponent, ChatbotComponent],
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
    private specializationService = inject(SpecializationService);

    doctors$: Observable<any[]> | undefined;
    labs$: Observable<any[]> | undefined;
    specialties$: Observable<Specialty[]> | undefined;
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
    isFabMenuOpen = false;

    // Dynamic Hero Video
    heroVideoSettings: AppSettings['heroVideo'] | null = null;
    isAuthChecking = true;

    // Legal Modal
    isLegalModalOpen = false;
    legalModalTab: 'terms' | 'privacy' = 'terms';

    openLegalModal(tab: 'terms' | 'privacy') {
        this.legalModalTab = tab;
        this.isLegalModalOpen = true;
    }

    get isLoggedIn() { return this.authService.isLoggedIn; }
    get userRole() { return this.authService.userRole; }

    // Hero image slideshow
    activeHeroImage = 0;
    private heroImageInterval: any;
    heroImages = [
        {
            url: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1200&auto=format&fit=crop',
            label: 'Expert Doctor Consultation',
            caption: 'Personalised care by board-certified specialists'
        },
        {
            url: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1200&auto=format&fit=crop',
            label: 'Advanced Diagnostics',
            caption: 'Cutting-edge diagnostic tools for accurate results'
        },
        {
            url: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f3?q=80&w=1200&auto=format&fit=crop',
            label: 'Preventive Healthcare',
            caption: 'Regular health check-ups for a healthier tomorrow'
        },
        {
            url: 'https://images.unsplash.com/photo-1666214280429-8d828f79eed6?q=80&w=1200&auto=format&fit=crop',
            label: 'Specialist Care',
            caption: 'Access top specialists across every medical field'
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
        { label: 'Patients Served', numericValue: 50000, current: 0, suffix: '+', animated: false },
        { label: 'Verified Doctors', numericValue: 500, current: 0, suffix: '+', animated: false },
        { label: 'Satisfaction Rate', numericValue: 98, current: 0, suffix: '%', animated: false },
        { label: 'Medical Specialties', numericValue: 30, current: 0, suffix: '+', animated: false },
    ];

    statIcons = ['users', 'stethoscope', 'heart-pulse', 'award'];

    conditions = [
        { label: 'Fever & Cold', icon: 'thermometer' },
        { label: 'Diabetes', icon: 'activity' },
        { label: 'Heart Disease', icon: 'heart-pulse' },
        { label: 'Skin Issues', icon: 'shield-check' },
        { label: 'Mental Health', icon: 'brain' },
        { label: 'Bone & Joint', icon: 'stethoscope' },
        { label: 'Eye Care', icon: 'eye' },
        { label: 'Child Health', icon: 'users' },
        { label: 'Women Health', icon: 'heart' },
        { label: 'Cancer Care', icon: 'zap' },
    ];

    howItWorks = [
        {
            step: '01',
            icon: 'search',
            title: 'Find Your Doctor',
            desc: 'Browse verified doctors by specialty, location or availability across 30+ disciplines.',
            color: 'teal',
            bgImage: 'assets/how-it-works/step1.png'
        },
        {
            step: '02',
            icon: 'calendar-check',
            title: 'Book an Appointment',
            desc: 'Pick a date and time that suits you — in-clinic, online video or home visit.',
            color: 'emerald',
            bgImage: 'assets/how-it-works/step2.png'
        },
        {
            step: '03',
            icon: 'stethoscope',
            title: 'Consult & Get Diagnosed',
            desc: 'Meet your doctor, get a thorough diagnosis and a personalised treatment plan.',
            color: 'sky',
            bgImage: 'assets/how-it-works/step3.png'
        },
        {
            step: '04',
            icon: 'trending-up',
            title: 'Follow-Up & Stay Healthy',
            desc: 'Track medications, receive follow-up reminders and monitor your health journey.',
            color: 'violet',
            bgImage: 'assets/how-it-works/step4.png'
        },
    ];

    services = [
        { icon: 'heart-pulse', title: 'Cardiology', desc: 'Expert diagnosis and treatment for heart disease, hypertension, arrhythmias and cardiac conditions.', color: 'from-rose-400 to-rose-600', specialty: 'Cardiology' },
        { icon: 'brain', title: 'Neurology', desc: 'Specialised care for stroke, migraines, epilepsy, Parkinson\'s and nervous system disorders.', color: 'from-violet-400 to-violet-600', specialty: 'Neurology' },
        { icon: 'bone', title: 'Orthopaedics', desc: 'Bone, joint and muscle care — fractures, arthritis, joint replacements and sports injuries.', color: 'from-amber-400 to-amber-600', specialty: 'Orthopedics' },
        { icon: 'users', title: 'Paediatrics', desc: 'Compassionate, child-friendly medical care from newborns to adolescents.', color: 'from-secondary-400 to-secondary-600', specialty: 'Pediatrics' },
        { icon: 'eye', title: 'Ophthalmology', desc: 'Complete eye care — vision tests, cataract surgery, glaucoma and retinal treatments.', color: 'from-sky-400 to-sky-600', specialty: 'Ophthalmology' },
        { icon: 'stethoscope', title: 'General Medicine', desc: 'Comprehensive health check-ups, preventive care and treatment for common illnesses.', color: 'from-primary-400 to-primary-600', specialty: 'General Physician' },
    ];

    testimonials = [
        { name: 'Priya Sharma', role: 'Working Professional', rating: 5, text: 'I consulted a cardiologist on HealthHub and was diagnosed early. The doctor was thorough, explained everything clearly and my health has improved dramatically.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' },
        { name: 'Ramesh Gupta', role: 'Business Owner', rating: 5, text: 'Booking an appointment took 2 minutes. The doctor was on time, the consultation was excellent and my diabetes is now well under control. Highly recommend!', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
        { name: 'Neha Verma', role: 'School Teacher', rating: 5, text: 'Found a top dermatologist in my city through HealthHub. The skin condition I\'d struggled with for years was resolved in just 4 weeks. Truly life-changing!', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop' },
        { name: 'Arjun Mehta', role: 'Software Engineer', rating: 5, text: 'My mother needed a neurologist urgently. HealthHub connected us with a specialist same day. The care and follow-up were outstanding. Couldn\'t be more grateful.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
        { name: 'Sunita Rao', role: 'Retired Civil Servant', rating: 5, text: 'The senior citizen health programme connected me with a caring geriatrician. Regular check-ups, medication reminders and follow-ups — all managed seamlessly. 10/10.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
    ];

    whyChoose = [
        { icon: 'calendar-check', title: 'Instant Online Booking', desc: 'Book, reschedule or cancel in minutes — any device, any time, 24 × 7.' },
        { icon: 'user-check', title: 'Verified & Certified Doctors', desc: 'Every doctor is board-certified, background-verified and holds valid medical registration.' },
        { icon: 'clipboard-list', title: 'Personalised Treatment Plans', desc: 'Evidence-based treatment protocols tailored specifically to each patient\'s condition.' },
        { icon: 'shield-check', title: 'Safe & Secure Platform', desc: 'Your health data is encrypted, private and protected under ISO & HIPAA-compliant standards.' },
    ];

    faqs = [
        { q: 'Do I need a referral to book a specialist?', a: 'No referral is needed. You can directly search and book any specialist — cardiologist, dermatologist, neurologist and more — right from our platform.' },
        { q: 'How long is a typical consultation?', a: 'Initial consultations are typically 20–40 minutes. Follow-up visits are usually 15–20 minutes. The duration may vary based on the doctor and your condition.' },
        { q: 'Is the consultation covered by health insurance?', a: 'Many major health insurance plans cover doctor consultations. We recommend checking with your insurer. We provide detailed invoices for reimbursement claims.' },
        { q: 'Do you offer online video consultations?', a: 'Yes. Most of our doctors offer online video consultations. You can filter by "Online Available" when searching for a doctor to find those offering telemedicine.' },
        { q: 'How do I access my prescriptions and reports?', a: 'All prescriptions, lab reports and medical records are stored securely in your Patient Portal. You can download or share them with any doctor anytime.' },
        { q: 'Can I switch my doctor if needed?', a: 'Absolutely. Patient satisfaction is our priority. You can book with a different doctor anytime through your patient portal without any cancellation fee.' },
    ];

    trustBadges = [
        { icon: 'award', label: 'ISO 9001 Certified' },
        { icon: 'shield-check', label: 'NABH Accredited' },
        { icon: 'users', label: '500+ Verified Doctors' },
        { icon: 'heart-pulse', label: 'Evidence-Based Care' },
    ];

    socialLinks = [
        { icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/healthhub' },
        { icon: 'twitter', label: 'Twitter', url: 'https://twitter.com/healthhub' },
        { icon: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/healthhub' },
        { icon: 'youtube', label: 'YouTube', url: 'https://youtube.com/healthhub' },
    ];

    @HostListener('window:scroll')
    onScroll() {
        this.navScrolled = window.scrollY > 30;
    }

    ngOnInit() {
        this.doctors$ = this.api.getDoctors().pipe(
            map(docs => docs
                .filter(doc => doc.active)
                .sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0))
                .slice(0, 10)
            )
        );
        this.labs$ = this.api.getLabTechnicians().pipe(
            map(labs => labs.filter(lab => lab.active))
        );
        this.specialties$ = this.specializationService.getSpecialties();
        // Re-trigger observer whenever doctors load
        this.doctors$.subscribe(() => {
            setTimeout(() => this.setupScrollAnimations(), 200);
        });
        this.labs$.subscribe(() => {
            setTimeout(() => this.setupScrollAnimations(), 200);
        });

        this.feedbacks$ = this.bookingService.getLatestFeedbacks(6);
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
    toggleFabMenu() { this.isFabMenuOpen = !this.isFabMenuOpen; }

    filterDoctorsBySpecialty(specialty: string) {
        this.router.navigate(['/doctors'], { queryParams: { specialty: specialty } });
    }

    scrollToSection(sectionId: string) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    openDoctorProfile(doc: any) {
        if (!doc.available) return;
        this.router.navigate(['/doctor-profile', doc.id], { state: { doctor: doc } });
    }

    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    scrollToDoctorSection() {
        const element = document.getElementById('doctors');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    goToLogin() { this.router.navigate(['/login']); }
    goToRegister() { this.router.navigate(['/patient/register']); }
    goToDoctorRegister() { this.router.navigate(['/doctor/register']); }
    goToLabRegister() { this.router.navigate(['/lab/register']); }
    goToSpecialties() { this.router.navigate(['/specialties']); }

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
        const isAvailable = lab.available;
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
