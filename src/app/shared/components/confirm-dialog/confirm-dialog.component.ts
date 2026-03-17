import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-fade-in" (click)="onCancel()"></div>
      
      <!-- Modal Content -->
      <div class="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-zoom-in border border-slate-200/50 dark:border-slate-800/50">
        <div class="p-8 pb-6 flex flex-col items-center text-center">
          <div [class]="'w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-6 ' + iconBgClass">
            <i-lucide [name]="icon" [class]="'w-8 h-8 ' + iconColorClass"></i-lucide>
          </div>
          
          <h3 class="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ title }}</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{{ message }}</p>
        </div>
        
        <div class="p-6 flex flex-col sm:flex-row gap-3">
          <button (click)="onCancel()" class="flex-1 order-2 sm:order-1 py-4 px-6 rounded-2xl text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-[0.98]">
            {{ cancelText }}
          </button>
          <button (click)="onConfirm()" [class]="'flex-1 order-1 sm:order-2 py-4 px-6 rounded-2xl text-white font-black shadow-xl transition-all active:scale-[0.98] ' + confirmBtnClass">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
    .animate-fade-in { animation: fadeIn 0.25s ease-out; }
    .animate-zoom-in { animation: zoomIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
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
