import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Observable, combineLatest, map, switchMap, of } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';
import { BookingService } from '../../../core/services/booking.service';

@Component({
    selector: 'app-doctor-patients',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideAngularModule],
    templateUrl: './patients.component.html',
    styleUrl: './patients.component.scss'
})
export class PatientsComponent implements OnInit {
    private api = inject(MockApiService);
    private auth = inject(AuthService);
    private booking = inject(BookingService);
    
    // Unsplash profile image collections (as requested)
    private profileImages = [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=400&auto=format&fit=crop'
    ];
    
    patients$: Observable<any[]> | undefined;

    ngOnInit() {
        const user = this.auth.currentUser;
        if (user && user.role === 'doctor') {
            const patientsList$ = this.api.getPatientsByDoctor(user.uid);
            const appointments$ = this.booking.getDoctorAppointments(user.uid);

            this.patients$ = combineLatest([patientsList$, appointments$]).pipe(
                map(([patients, appointments]: [any[], any[]]) => {
                    return patients.map(patient => {
                        // Find the next upcoming session for this patient
                        const patientAppointments = (appointments || [])
                            .filter((apt: any) => apt.patientId === patient.uid && (apt.status === 'confirmed' || apt.status === 'pending'))
                            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        
                        return {
                            ...patient,
                            name: patient.fullName,
                            nextSession: patientAppointments.length > 0 ? patientAppointments[0] : null
                        };
                    });
                })
            );
        }
    }

    encodeURIComponent(str: string): string {
        return encodeURIComponent(str);
    }

    getPatientImage(p: any, index: number): string {
        // Use p.image if it's a "real" URL (not ui-avatars and not empty)
        if (p.image && !p.image.includes('ui-avatars.com')) {
            return p.image;
        }
        // Use a high-quality Unsplash image from our local array based on index
        return this.profileImages[index % this.profileImages.length];
    }

    sendWhatsApp(patient: any): void {
        const phone = patient.phone || patient.phoneNumber;
        if (!phone) {
            alert('Phone number not available for this patient');
            return;
        }
        
        // Clean the phone number (remove spaces, etc.)
        const cleanedPhone = phone.replace(/\D/g, '');
        const message = `Hello ${patient.fullName || patient.name}, this is your Physiotherapist. I hope you are doing well!`;
        const url = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }
}
