import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Risk } from '../../core/models/risk';

interface TimelinePoint {
  date: string;
  count: number;
}

@Component({
  selector: 'app-risk-timeline-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-timeline-chart.html',
  styleUrl: './risk-timeline-chart.css'
})
export class RiskTimelineChartComponent implements OnChanges {

  @Input() risks: Risk[] = [];

  timelineData: TimelinePoint[] = [];

  readonly chartWidth = 500;
  readonly chartHeight = 120;
  readonly padX = 10;
  readonly padY = 10;

  ngOnChanges(): void {
    this.buildChart();
  }

  buildChart(): void {

    const dateMap: { [key: string]: number } = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dateMap[key] = 0;
    }

    this.risks.forEach(r => {
      if (r.published_at) {
        const key = new Date(r.published_at).toISOString().split('T')[0];
        if (dateMap[key] !== undefined) {
          dateMap[key]++;
        }
      }
    });

    this.timelineData = Object.entries(dateMap).map(([date, count]) => ({ date, count }));

  }

  getMaxCount(): number {
    return Math.max(...this.timelineData.map(d => d.count), 1);
  }

  getPointX(i: number): number {
    return this.padX + (i / (this.timelineData.length - 1)) * (this.chartWidth - this.padX * 2);
  }

  getPointY(count: number): number {
    return this.chartHeight - this.padY - (count / this.getMaxCount()) * (this.chartHeight - this.padY * 2);
  }

  getLinePoints(): string {
    if (this.timelineData.length === 0) return '';
    return this.timelineData.map((d, i) =>
      `${this.getPointX(i)},${this.getPointY(d.count)}`
    ).join(' ');
  }

  getAreaPoints(): string {
    if (this.timelineData.length === 0) return '';
    return `${this.padX},${this.chartHeight} ${this.getLinePoints()} ${this.chartWidth - this.padX},${this.chartHeight}`;
  }

}