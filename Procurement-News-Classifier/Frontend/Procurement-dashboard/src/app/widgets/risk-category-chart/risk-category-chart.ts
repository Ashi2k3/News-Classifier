import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Risk } from '../../core/models/risk';

interface CategorySegment {
  label: string;
  count: number;
  color: string;
  dash: number;
  offset: number;
}

@Component({
  selector: 'app-risk-category-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-category-chart.html',
  styleUrl: './risk-category-chart.css'
})
export class RiskCategoryChartComponent implements OnChanges {

  @Input() risks: Risk[] = [];

  totalRisks = 0;
  segments: CategorySegment[] = [];

  private readonly colors = [
    '#00e0ff', '#ff4d4d', '#ffcc00', '#34d399',
    '#a78bfa', '#fb923c', '#f472b6', '#60a5fa'
  ];

  ngOnChanges(): void {
    this.buildChart();
  }

  buildChart(): void {

    this.totalRisks = this.risks.length;

    const categoryCounts: { [key: string]: number } = {};

    this.risks.forEach(r => {
      if (r.category && r.category !== 'Not Relevant') {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      }
    });

    const total = Object.values(categoryCounts).reduce((s, c) => s + c, 0);
    const circumference = 2 * Math.PI * 40;

    let offset = 0;

    this.segments = Object.entries(categoryCounts).map(([label, count], i) => {
      const dash = (count / total) * circumference;
      const segment: CategorySegment = {
        label,
        count,
        color: this.colors[i % this.colors.length],
        dash,
        offset: circumference - offset
      };
      offset += dash;
      return segment;
    });

  }

}