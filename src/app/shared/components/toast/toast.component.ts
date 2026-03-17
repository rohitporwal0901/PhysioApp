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
    <div class="fixed top-24 right-6 z-[9999] flex flex-col gap-4 pointer-events-none min-w-[320px]">
      <div *ngFor="let toast of (toastService.toasts | async); trackBy: trackByFn"
           [@toastAnimation]
           class="pointer-events-auto flex items-start gap-4 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border backdrop-blur-2xl w-[350px] transition-all duration-300"
           [ngClass]="{
             'bg-white/95 dark:bg-slate-900/95 border-emerald-100 dark:border-emerald-900/30': toast.type === 'success',
             'bg-white/95 dark:bg-slate-900/95 border-red-100 dark:border-red-900/30': toast.type === 'error',
             'bg-white/95 dark:bg-slate-900/95 border-amber-100 dark:border-amber-900/30': toast.type === 'warning',
             'bg-white/95 dark:bg-slate-900/95 border-blue-100 dark:border-blue-900/30': toast.type === 'info'
           }">
        
        <!-- Icon Container -->
        <div class="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform"
             [ngClass]="{
               'bg-emerald-500/10 text-emerald-600': toast.type === 'success',
               'bg-red-500/10 text-red-600': toast.type === 'error',
               'bg-amber-500/10 text-amber-600': toast.type === 'warning',
               'bg-blue-500/10 text-blue-600': toast.type === 'info'
             }">
          <i-lucide [name]="getIconName(toast.type)" class="w-6 h-6"></i-lucide>
        </div>

        <!-- Content Area -->
        <div class="flex-1 min-w-0 pr-2">
          <h4 class="text-[15px] font-black tracking-tight mb-0.5"
              [ngClass]="{
                'text-emerald-900 dark:text-emerald-400': toast.type === 'success',
                'text-red-900 dark:text-red-400': toast.type === 'error',
                'text-amber-900 dark:text-amber-400': toast.type === 'warning',
                'text-blue-900 dark:text-blue-400': toast.type === 'info'
              }">
            {{ toast.title || (toast.type | titlecase) }}
          </h4>
          <p class="text-xs font-bold leading-relaxed text-slate-600 dark:text-slate-400 truncate-2-lines">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button (click)="toastService.remove(toast.id)" 
                class="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400">
          <i-lucide name="x" class="w-4 h-4"></i-lucide>
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
        style({ transform: 'translateX(50px) scale(0.95)', opacity: 0 }),
        animate('400ms cubic-bezier(0.34, 1.56, 0.64, 1)', 
          style({ transform: 'translateX(0) scale(1)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'scale(0.9)', opacity: 0 }))
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
