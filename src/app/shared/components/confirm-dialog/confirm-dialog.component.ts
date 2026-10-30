import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in" (click)="onCancel()"></div>
      
      <!-- Modal Content — slides up on mobile, scales in on desktop -->
      <div class="relative w-full sm:max-w-sm bg-white dark:bg-slate-900 
                  rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-dialog-in
                  border-t sm:border border-slate-200/50 dark:border-slate-800/50
                  safe-area-bottom">
        <div class="p-5 sm:p-7 pb-4 sm:pb-5 flex flex-col items-center text-center">
          <div [class]="'w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-5 ' + iconBgClass">
            <i-lucide [name]="icon" [class]="'w-6 h-6 sm:w-7 sm:h-7 ' + iconColorClass"></i-lucide>
          </div>
          
          <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-white mb-1.5 tracking-tight">{{ title }}</h3>
          <p class="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed max-w-[280px]">{{ message }}</p>
        </div>
        
        <div class="p-4 sm:p-5 pt-2 sm:pt-3 flex flex-col-reverse sm:flex-row gap-2.5">
          <button (click)="onCancel()" 
            class="flex-1 py-3 sm:py-3.5 px-5 rounded-xl sm:rounded-2xl text-slate-500 dark:text-slate-400 font-bold text-sm
                   hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]">
            {{ cancelText }}
          </button>
          <button (click)="onConfirm()" 
            [class]="'flex-1 py-3 sm:py-3.5 px-5 rounded-xl sm:rounded-2xl text-white font-bold text-sm shadow-lg transition-all active:scale-[0.98] ' + confirmBtnClass">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes dialogIn { 
      from { opacity: 0; transform: translateY(40px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    .animate-dialog-in { animation: dialogIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1); }
    .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
    
    @media (min-width: 640px) {
      @keyframes dialogIn { 
        from { opacity: 0; transform: scale(0.92); } 
        to { opacity: 1; transform: scale(1); } 
      }
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() icon = 'help-circle';
  @Input() iconBgClass = 'bg-primary-50 dark:bg-primary-900/20';
  @Input() iconColorClass = 'text-primary-500';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() confirmBtnClass = 'bg-gradient-to-r from-primary-500 to-primary-600 shadow-primary-500/25';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
    this.isOpen = false;
  }

  onCancel() {
    this.cancelled.emit();
    this.isOpen = false;
  }
}
