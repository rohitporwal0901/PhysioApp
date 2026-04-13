import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-legal-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './legal-modal.component.html',
  styleUrl: './legal-modal.component.scss'
})
export class LegalModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() initialTab: 'terms' | 'privacy' = 'terms';
  @Input() userType: 'patient' | 'doctor' | 'lab' = 'patient';
  
  @Output() close = new EventEmitter<void>();

  activeTab: 'terms' | 'privacy' = 'terms';

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']?.currentValue === true) {
      this.activeTab = this.initialTab;
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else if (changes['isOpen']?.currentValue === false) {
      document.body.style.overflow = '';
    }
  }

  setTab(tab: 'terms' | 'privacy') {
    this.activeTab = tab;
  }

  onClose() {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.close.emit();
  }
}
