import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { LucideAngularModule } from 'lucide-angular';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Mobile: top-center | Desktop: top-right -->
    <div class="toast-container fixed z-[9999] flex flex-col gap-2.5 sm:gap-3 pointer-events-none
                top-[env(safe-area-inset-top,0px)] pt-2 sm:pt-0
                left-2 right-2 items-center
                sm:left-auto sm:right-4 sm:top-20 sm:items-end sm:w-auto">
      <div *ngFor="let toast of (toastService.toasts | async); trackBy: trackByFn"
           [@toastAnimation]
           class="pointer-events-auto flex items-start gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-xl sm:rounded-2xl
                  shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:shadow-[0_16px_48px_rgba(0,0,0,0.16)]
                  border backdrop-blur-2xl w-full max-w-[400px] sm:w-[360px] transition-all duration-300"
           [ngClass]="{
             'bg-white/95 dark:bg-slate-900/95 border-emerald-200/80 dark:border-emerald-900/30': toast.type === 'success',
             'bg-white/95 dark:bg-slate-900/95 border-red-200/80 dark:border-red-900/30': toast.type === 'error',
             'bg-white/95 dark:bg-slate-900/95 border-amber-200/80 dark:border-amber-900/30': toast.type === 'warning',
             'bg-white/95 dark:bg-slate-900/95 border-blue-200/80 dark:border-blue-900/30': toast.type === 'info'
           }">
        
        <!-- Icon -->
        <div class="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm"
             [ngClass]="{
               'bg-emerald-500/10 text-emerald-600': toast.type === 'success',
               'bg-red-500/10 text-red-600': toast.type === 'error',
               'bg-amber-500/10 text-amber-600': toast.type === 'warning',
               'bg-blue-500/10 text-blue-600': toast.type === 'info'
             }">
          <i-lucide [name]="getIconName(toast.type)" class="w-4.5 h-4.5 sm:w-5 sm:h-5"></i-lucide>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0 py-0.5">
          <h4 class="text-[13px] sm:text-[14px] font-extrabold tracking-tight mb-0.5 leading-tight"
              [ngClass]="{
                'text-emerald-800 dark:text-emerald-400': toast.type === 'success',
                'text-red-800 dark:text-red-400': toast.type === 'error',
                'text-amber-800 dark:text-amber-400': toast.type === 'warning',
                'text-blue-800 dark:text-blue-400': toast.type === 'info'
              }">
            {{ toast.title || (toast.type | titlecase) }}
          </h4>
          <p class="text-[11px] sm:text-xs font-semibold leading-snug text-slate-500 dark:text-slate-400 truncate-2-lines">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close -->
        <button (click)="toastService.remove(toast.id)" 
                class="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center
                       hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 active:scale-90">
          <i-lucide name="x" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i-lucide>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .truncate-2-lines {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(-20px) scale(0.95)', opacity: 0 }),
        animate('350ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ transform: 'translateY(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ transform: 'translateY(-10px) scale(0.95)', opacity: 0 }))
      ])
    ])
  ]
})
export class ToastComponent {
  public toastService = inject(ToastService);

  trackByFn(index: number, item: Toast) {
    return item.id;
  }

  getIconName(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'alert-triangle';
      default: return 'info';
    }
  }
}
