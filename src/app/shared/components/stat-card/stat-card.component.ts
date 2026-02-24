import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() icon: string = 'activity';
  @Input() trend?: string;
  @Input() trendDirection?: 'up' | 'down' | 'neutral';
  @Input() bgClass: string = 'bg-surface';
  @Input() textClass: string = 'text-slate-900';
  @Input() textMutedClass: string = 'text-slate-500';
  @Input() iconClass: string = 'text-primary-500 bg-primary-50';
}

