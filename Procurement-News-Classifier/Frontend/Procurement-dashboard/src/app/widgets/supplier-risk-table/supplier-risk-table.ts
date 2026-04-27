import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Risk } from '../../core/models/risk';

interface EntitySummary {
  name: string;
  count: number;
  maxScore: number;
  barWidth: number;
  color: string;
  risks: Risk[];
  expanded: boolean;
}

@Component({
  selector: 'app-supplier-risk-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './supplier-risk-table.html',
  styleUrl: './supplier-risk-table.css'
})
export class SupplierRiskTableComponent implements OnChanges {

  @Input() risks: Risk[] = [];

  entitySummaries: EntitySummary[] = [];

  private readonly colors = [
    '#ff4d4d', '#fb923c', '#ffcc00',
    '#34d399', '#00e0ff', '#a78bfa',
    '#f472b6', '#60a5fa'
  ];

  ngOnChanges(): void {
    this.buildEntitySummaries();
  }

  buildEntitySummaries(): void {

    const entityMap: { [key: string]: Risk[] } = {};

    this.risks.forEach(r => {
      if (!r.entity || r.entity === 'None' || r.entity === 'Unknown') return;
      if (!entityMap[r.entity]) entityMap[r.entity] = [];
      entityMap[r.entity].push(r);
    });

    const sorted = Object.entries(entityMap)
      .sort((a, b) => {
        const maxA = Math.max(...a[1].map(r => Number(r.risk_score)));
        const maxB = Math.max(...b[1].map(r => Number(r.risk_score)));
        return maxB - maxA;
      });

    const maxCount = Math.max(...sorted.map(([, risks]) => risks.length), 1);

    // Preserve expanded state across reloads
    const existingExpanded: { [key: string]: boolean } = {};
    this.entitySummaries.forEach(e => {
      existingExpanded[e.name] = e.expanded;
    });

    this.entitySummaries = sorted.map(([name, risks], i) => ({
      name,
      count: risks.length,
      maxScore: Math.max(...risks.map(r => Number(r.risk_score))),
      barWidth: Math.round((risks.length / maxCount) * 100),
      color: this.colors[i % this.colors.length],
      risks: risks.sort((a, b) => Number(b.risk_score) - Number(a.risk_score)),
      expanded: existingExpanded[name] ?? false
    }));

  }

  toggleExpand(entity: EntitySummary): void {
    entity.expanded = !entity.expanded;
  }

}