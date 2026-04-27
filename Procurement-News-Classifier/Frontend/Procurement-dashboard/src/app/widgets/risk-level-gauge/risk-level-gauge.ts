import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Risk } from '../../core/models/risk';

@Component({
  selector: 'app-risk-level-gauge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risk-level-gauge.html',
  styleUrl: './risk-level-gauge.css'
})
export class RiskLevelGauge implements OnChanges {

  @Input() risks: Risk[] = [];

  avgScore = 0;
  riskLabel = 'Low';
  riskColor = '#34d399';
  needleAngle = -90;
  arcPath = '';

  ngOnChanges(): void {
    this.buildGauge();
  }

  buildGauge(): void {

    if (this.risks.length === 0) {
      this.avgScore = 0;
      this.needleAngle = -90;
      this.riskLabel = 'No Data';
      this.riskColor = '#888';
      return;
    }

    const total = this.risks.reduce((sum, r) => sum + Number(r.risk_score), 0);
    this.avgScore = Math.round((total / this.risks.length) * 10) / 10;

    // Map score 0-10 to angle -90 to +90 degrees
    this.needleAngle = -90 + (this.avgScore / 10) * 180;

    if (this.avgScore >= 8) {
      this.riskLabel = 'Critical';
      this.riskColor = '#ff1a1a';
    } else if (this.avgScore >= 6) {
      this.riskLabel = 'High';
      this.riskColor = '#ff4d4d';
    } else if (this.avgScore >= 4) {
      this.riskLabel = 'Medium';
      this.riskColor = '#ffcc00';
    } else {
      this.riskLabel = 'Low';
      this.riskColor = '#34d399';
    }

  }

  // Convert polar to cartesian for SVG arc
  polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  getArcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
    const start = this.polarToCartesian(cx, cy, r, endAngle);
    const end = this.polarToCartesian(cx, cy, r, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  getNeedleX(): number {
    const rad = (this.needleAngle * Math.PI) / 180;
    return 100 + 65 * Math.cos(rad);
  }

  getNeedleY(): number {
    const rad = (this.needleAngle * Math.PI) / 180;
    return 100 + 65 * Math.sin(rad);
  }

}