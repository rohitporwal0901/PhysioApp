import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { MockApiService } from '../../core/services/mock-api.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './landing.component.html',
    styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
    private api = inject(MockApiService);
    private router = inject(Router);

    doctors$: Observable<any[]> | undefined;

    services = [
        { icon: 'activity', title: 'Sports Rehabilitation', desc: 'Expert care for sports-related injuries to get you back in peak form.', color: 'from-primary-400 to-primary-600' },
        { icon: 'heart', title: 'Cardiopulmonary Therapy', desc: 'Breathing and cardiovascular exercises tailored to your condition.', color: 'from-rose-400 to-rose-600' },
        { icon: 'zap', title: 'Neurological Rehab', desc: 'Advanced treatments for stroke, Parkinson\'s, and nerve injuries.', color: 'from-amber-400 to-amber-600' },
        { icon: 'users', title: 'Pediatric Physio', desc: 'Gentle, fun therapy designed specifically for children\'s needs.', color: 'from-secondary-400 to-secondary-600' },
        { icon: 'shield', title: 'Post-Surgical Care', desc: 'Structured recovery plans after orthopedic or spinal surgeries.', color: 'from-accent-400 to-accent-600' },
        { icon: 'star', title: 'Geriatric Care', desc: 'Specialized exercises to improve mobility and prevent falls in seniors.', color: 'from-violet-400 to-violet-600' },
    ];

    stats = [
        { value: '500+', label: 'Patients Helped' },
        { value: '15+', label: 'Expert Therapists' },
        { value: '98%', label: 'Satisfaction Rate' },
        { value: '10+', label: 'Years Experience' },
    ];

    testimonials = [
        { name: 'Priya Sharma', role: 'Marathon Runner', rating: 5, text: 'After my knee injury, I thought I\'d never run again. The team here gave me my life back!', avatar: 'https://randomuser.me/api/portraits/women/32.jpg' },
        { name: 'Ramesh Gupta', role: 'IT Professional', rating: 5, text: 'The online booking system made it so easy. Highly professional and caring staff.', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
        { name: 'Neha Verma', role: 'Teacher', rating: 5, text: 'My back pain of 5 years is finally gone. I wish I had come here sooner!', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    ];

    ngOnInit() {
        this.doctors$ = this.api.getDoctors();
    }

    openDoctorProfile(doc: any) {
        this.router.navigate(['/doctor-profile', doc.id], { state: { doctor: doc } });
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
