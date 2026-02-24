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
}

