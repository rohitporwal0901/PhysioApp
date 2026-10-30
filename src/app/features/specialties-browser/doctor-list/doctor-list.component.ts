import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Observable, map, switchMap } from 'rxjs';
import { MockApiService } from '../../../core/services/mock-api.service';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50 pt-16 pb-12 overflow-hidden">
      <!-- Background orbs -->
      <div class="fixed inset-0 pointer-events-none opacity-20">
        <div class="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-emerald-100 rounded-full blur-[100px]"></div>
        <div class="absolute bottom-[-5%] left-[-10%] w-[35rem] h-[35rem] bg-teal-50 rounded-full blur-[100px]"></div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Breadcrumbs -->
        <nav class="flex mb-6 text-[11px] uppercase tracking-widest font-black text-slate-400 reveal-header">
          <a routerLink="/" class="hover:text-emerald-600 transition-colors">Home</a>
          <span class="mx-3 text-slate-300">/</span>
          <a routerLink="/specialties" class="hover:text-emerald-600 transition-colors">Specialties</a>
          <span class="mx-3 text-slate-300">/</span>
          <span class="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">{{ selectedSpecialty }}</span>
        </nav>

        <!-- Header -->
        <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-8 reveal-header">
          <div class="max-w-3xl">
            <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-4 font-heading tracking-tight leading-none">
              Our <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">{{ selectedSpecialty }}</span> Specialists
            </h1>
            <p class="text-slate-500 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
              Handpicked medical experts ensuring you receive world-class care and personalized attention.
            </p>
          </div>
        </div>

        <!-- Doctors Grid (Vertical Layout) -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ng-container *ngIf="doctors$ | async as doctors; else loading">
            <div *ngIf="doctors.length === 0" class="col-span-full py-20 text-center bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-dashed border-emerald-100">
                <div class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i-lucide name="user-search" class="w-10 h-10 text-emerald-400"></i-lucide>
                </div>
                <h3 class="text-xl font-bold text-slate-800 mb-2">No specialists available</h3>
                <p class="text-slate-500 text-base max-w-md mx-auto">We're currently updating our roster for {{ selectedSpecialty }}. Check back soon!</p>
                <button routerLink="/specialties" class="mt-8 btn-emerald px-8 py-3.5 rounded-2xl font-black text-xs text-white shadow-xl shadow-emerald-500/20">Explore Other Specialties</button>
            </div>

            <div *ngFor="let doc of doctors; let i = index" 
                 (click)="viewProfile(doc)"
                 class="doctor-card group"
                 [style.animation-delay]="i * 100 + 'ms'"
                 [class.opacity-80]="!doc.available">
              
              <div class="relative h-72 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-[0.98] group-hover:rounded-[2rem]">
                <img [src]="getDoctorImage(doc, i)" 
                     class="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-1000" 
                     alt="{{ doc.fullName }}">
                
                <!-- Availability Overlay -->
                <div class="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                
                <!-- Top Badges -->
                <div class="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                   <!-- Verified Badge -->
                   <div class="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl shadow-xl border border-emerald-50">
                      <i-lucide name="shield-check" class="w-4 h-4 text-emerald-600"></i-lucide>
                      <span class="text-[10px] font-black uppercase tracking-widest text-emerald-700">Verified</span>
                   </div>

                   <!-- Heart / Favorite -->
                   <div class="flex items-center gap-3">
                      <!-- <div class="w-10 h-10 bg-white/90 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 shadow-lg transition-all cursor-pointer">
                         <i-lucide name="heart" class="w-5 h-5"></i-lucide>
                      </div> -->
                      <!-- Status Dot -->
                      <div [class]="doc.available ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-400'" 
                           class="w-3.5 h-3.5 rounded-full ring-4 ring-white/40 shadow-lg"></div>
                   </div>
                </div>

                <!-- Basic Profile -->
                <div class="absolute bottom-8 left-8 right-8">
                   <h3 class="text-3xl font-black text-white mb-2 font-heading tracking-tight leading-none group-hover:text-emerald-400 transition-colors">{{ doc.fullName }}</h3>
                   <div class="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-widest text-shadow-sm">
                      <i-lucide name="award" class="w-3.5 h-3.5"></i-lucide>
                      {{ doc.specialization || selectedSpecialty }}
                   </div>
                </div>
              </div>

              <!-- Details Section -->
              <div class="px-6 py-8">
                <div class="flex items-center justify-between mb-8">
                   <div class="flex flex-col gap-1">
                      <div class="flex items-center gap-1.5">
                         <i-lucide name="star" class="w-4 h-4 text-amber-400 fill-current"></i-lucide>
                         <span class="text-lg font-black text-slate-800">{{ doc.rating }}</span>
                      </div>
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
                   </div>
                   
                   <div class="h-8 w-px bg-slate-200"></div>

                   <div class="flex flex-col gap-1 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                         <span class="text-lg font-black text-slate-800">{{ doc.experience ?? '5+' }}+</span>
                         <span class="text-slate-400">Yrs</span>
                      </div>
                      <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</span>
                   </div>
                </div>

                <button [disabled]="!doc.available"
                        class="btn-book group/btn">
                   <span>{{ doc.available ? 'View Profile & Book' : 'Currently Unavailable' }}</span>
                   <i-lucide [name]="doc.available ? 'arrow-right' : 'calendar-x'" class="w-5 h-5 group-hover/btn:translate-x-1 transition-transform"></i-lucide>
                </button>
              </div>
            </div>
          </ng-container>

          <ng-template #loading>
            <div *ngFor="let i of [1,2,3]" class="doctor-skeleton relative bg-white rounded-[3rem] overflow-hidden p-6 border border-slate-100 shadow-sm">
                <div class="h-72 rounded-[2.5rem] bg-slate-100 shimmer"></div>
                <div class="mt-8 space-y-4">
                  <div class="h-8 w-3/4 rounded-xl bg-slate-100 shimmer"></div>
                  <div class="h-4 w-1/2 rounded-lg bg-slate-50 shimmer"></div>
                  <div class="flex justify-between items-center py-6 border-y border-slate-50 mt-8">
                     <div class="h-10 w-20 rounded-xl bg-slate-100 shimmer"></div>
                     <div class="h-10 w-20 rounded-xl bg-slate-100 shimmer"></div>
                  </div>
                  <div class="h-16 w-full rounded-2xl bg-emerald-50 shimmer mt-6"></div>
                </div>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .font-heading { font-family: 'Outfit', sans-serif; }

    .reveal-header {
      animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .doctor-card {
      @apply bg-white rounded-[3rem] border border-slate-100 shadow-sm 
             transition-all duration-500 cursor-pointer overflow-hidden p-2;
      animation: cardEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .doctor-card:hover {
      @apply shadow-2xl shadow-emerald-200/50 border-emerald-100;
    }

    .btn-book {
      @apply w-full py-4 rounded-[1.25rem] bg-slate-900 text-white font-black text-sm 
             transition-all duration-300 flex items-center justify-center gap-3 
             hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30
             disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed;
    }

    .btn-emerald {
      @apply bg-emerald-600 hover:bg-emerald-700 transition-colors;
    }

    @keyframes cardEntrance {
      from { opacity: 0; transform: translateY(40px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .shimmer {
      background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmerLoop 1.5s infinite linear;
    }

    @keyframes shimmerLoop {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `]
})
export class DoctorListComponent implements OnInit {
  private api = inject(MockApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  doctors$: Observable<any[]> | undefined;
  selectedSpecialty = '';

  private doctorImages = [
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1559839734-2b71f1536783?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'
  ];

  ngOnInit() {
    this.doctors$ = this.route.queryParams.pipe(
      switchMap(params => {
        this.selectedSpecialty = params['specialty'] || '';
        this.cdr.detectChanges();
        return this.api.getDoctors().pipe(
          map(docs => {
            // Only show active doctors
            const activeDocs = docs.filter(d => d.active);
            if (!this.selectedSpecialty) return activeDocs;
            return activeDocs.filter(d =>
              (d.specialization && d.specialization.toLowerCase() === this.selectedSpecialty.toLowerCase()) ||
              (d.specialty && d.specialty.toLowerCase() === this.selectedSpecialty.toLowerCase())
            );
          })
        );
      })
    );
  }

  getDoctorImage(doc: any, index: number): string {
    if (doc.image && !doc.image.includes('ui-avatars.com')) return doc.image;
    return this.doctorImages[index % this.doctorImages.length];
  }

  viewProfile(doc: any) {
    if (!doc.available) return;
    this.router.navigate(['/doctor-profile', doc.id], { state: { doctor: doc } });
  }
}
