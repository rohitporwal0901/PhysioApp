import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Observable } from 'rxjs';
import { SpecializationService, Specialty } from '../../../core/services/specialization.service';

@Component({
  selector: 'app-specialty-list',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-50 pt-12 md:pt-24 pb-12 overflow-hidden">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <!-- Back Button -->
        <div class="mb-6 md:mb-10 reveal-header">
           <a routerLink="/" class="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-600 hover:text-emerald-600 hover:border-emerald-100 transition-all duration-300 group">
              <i-lucide name="arrow-left" class="w-4 h-4 transition-transform group-hover:-translate-x-1"></i-lucide>
              <span class="text-xs font-black uppercase tracking-widest">Back to Home</span>
           </a>
        </div>

        <!-- Header -->
        <div class="text-center mb-8 md:mb-16 reveal-header">
          <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-4 md:mb-6 font-heading tracking-tight leading-tight">
            Browse by <span class="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">Specialty</span>
          </h1>
          <p class="text-slate-600 max-w-2xl mx-auto text-lg md:text-xl font-light">
            Select a specialty to view our certified medical experts and book your consultation.
          </p>
        </div>

        <!-- Specialty Grid (Compact Image 1 Style) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
          <ng-container *ngIf="specialties$ | async as specialties; else loading">
            <div *ngFor="let s of specialties; let i = index" 
                 (click)="selectSpecialty(s.name)"
                 class="specialty-card group"
                 [style.animation-delay]="i * 50 + 'ms'">
              
              <!-- Premium Linear Light Green Gradient Background -->
              <div class="card-bg-gradient"></div>
              
              <!-- Subtle glass shimmer -->
              <div class="shimmer-overlay"></div>
              
              <div class="relative z-10 flex items-center gap-4 w-full">
                <div class="icon-container-mini">
                  <i-lucide [name]="s.icon" class="w-7 h-7"></i-lucide>
                </div>
                
                <div class="flex-1 min-w-0">
                  <h3 class="text-[15px] font-black text-slate-800 group-hover:text-emerald-800 transition-colors leading-tight truncate">
                    {{ s.name }}
                  </h3>
                  <p class="text-[10px] uppercase font-bold text-slate-500/80 tracking-widest mt-0.5">Experts</p>
                </div>

                <div class="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <i-lucide name="chevron-right" class="w-4 h-4 text-emerald-600"></i-lucide>
                </div>
              </div>
            </div>
          </ng-container>

          <ng-template #loading>
            <div *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12]" 
                 class="h-24 bg-white rounded-2xl border border-emerald-50 overflow-hidden relative">
              <div class="shimmer-loader"></div>
              <div class="flex items-center gap-4 p-4">
                <div class="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 w-2/3 bg-slate-100 rounded"></div>
                  <div class="h-2 w-1/3 bg-slate-50 rounded"></div>
                </div>
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
      animation: fadeInDown 1s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .specialty-card {
      @apply relative p-4 rounded-[1.25rem] border border-emerald-100/50 
             cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] 
             overflow-hidden flex items-center shadow-sm;
      animation: cardEntrance 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .card-bg-gradient {
      @apply absolute inset-0 opacity-100 transition-all duration-500;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    }

    .shimmer-overlay {
      @apply absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none;
      background: linear-gradient(
        45deg,
        transparent 25%,
        rgba(255, 255, 255, 0.3) 50%,
        transparent 75%
      );
      background-size: 200% 200%;
      animation: shimmer 2s infinite linear;
    }

    .specialty-card:hover {
      transform: translateY(-8px) scale(1.03);
      @apply shadow-xl shadow-emerald-200/50 border-emerald-300;
    }

    .specialty-card:hover .card-bg-gradient {
      background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%);
    }

    .icon-container-mini {
      @apply w-12 h-12 rounded-[1rem] bg-white shadow-sm border border-emerald-50
             flex items-center justify-center text-emerald-600 flex-shrink-0
             group-hover:scale-110 group-hover:rotate-6 group-hover:bg-emerald-600 
             group-hover:text-white transition-all duration-500 ease-in-out;
    }

    @keyframes shimmer {
      0% { background-position: -200% -200%; }
      100% { background-position: 200% 200%; }
    }

    .shimmer-loader {
      @apply absolute inset-0;
      background: linear-gradient(90deg, #f1f5f9 25%, #f8fafc 50%, #f1f5f9 75%);
      background-size: 200% 100%;
      animation: shimmerLoop 1.5s infinite linear;
    }

    @keyframes shimmerLoop {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes cardEntrance {
      from { 
        opacity: 0; 
        transform: translateY(30px) scale(0.95);
      }
      to { 
        opacity: 1; 
        transform: translateY(0) scale(1);
      }
    }

    @keyframes fadeInDown {
      from { 
        opacity: 0; 
        transform: translateY(-30px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
  `]
})
export class SpecialtyListComponent implements OnInit {
  private specializationService = inject(SpecializationService);
  private router = inject(Router);
  
  specialties$: Observable<Specialty[]> | undefined;

  ngOnInit() {
    this.specialties$ = this.specializationService.getSpecialties();
  }

  selectSpecialty(name: string) {
    this.router.navigate(['/doctors'], { queryParams: { specialty: name } });
  }
}
