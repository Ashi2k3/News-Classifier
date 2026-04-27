import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RiskService } from '../../core/services/risk.services';
import { Risk } from '../../core/models/risk';
import { SupplierRiskTableComponent } from '../../widgets/supplier-risk-table/supplier-risk-table';
import { RiskCategoryChartComponent } from '../../widgets/risk-category-chart/risk-category-chart';
import { RiskTimelineChartComponent } from '../../widgets/risk-timeline-chart/risk-timeline-chart';
import { RiskLevelGauge } from '../../widgets/risk-level-gauge/risk-level-gauge';
@Component({
  selector: 'app-risk-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SupplierRiskTableComponent,
    RiskCategoryChartComponent,
    RiskTimelineChartComponent,
    RiskLevelGauge
  ],
  templateUrl: './risk-dashboard.html',
  styleUrl: './risk-dashboard.css'
})
export class RiskDashboardComponent implements OnInit, OnDestroy {

  risks: Risk[] = [];
  allNews: Risk[] = [];
  recentRisks: Risk[] = [];

  totalRisks = 0;
  highRisk = 0;
  mediumRisk = 0;
  criticalRisks = 0;
  avgRiskScore = 0;
  topCategory = 'N/A';
  risksThisWeek = 0;
  suppliersImpacted = new Set<string>();

  refreshInterval: any;
  private riskUpdatedListener = () => {
    this.loadRisks();
    this.loadAllNews();
    this.loadRecentRisks();
  };

  filteredRisks: Risk[] = [];
  selectedFilter: string = '';

  newsText: string = '';
  isAnalyzing: boolean = false;

  constructor(private riskService: RiskService) {}

  ngOnInit(): void {
    this.loadRisks();
    this.loadAllNews();
    this.loadRecentRisks();
    window.addEventListener('risk-updated', this.riskUpdatedListener);
    this.refreshInterval = setInterval(() => {
      this.loadRisks();
      this.loadAllNews();
      this.loadRecentRisks();
    }, 86400000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
    window.removeEventListener('risk-updated', this.riskUpdatedListener);
  }

  loadRisks(): void {

    this.riskService.getRisks().subscribe((data: Risk[]) => {

      this.risks = data;
      this.totalRisks = data.length;

      this.highRisk = data.filter(r => r.risk_score >= 8).length;
      this.mediumRisk = data.filter(r => r.risk_score >= 5 && r.risk_score < 8).length;
      this.criticalRisks = data.filter(r => r.risk_score >= 9).length;

      if (data.length > 0) {
        const total = data.reduce((sum, r) => sum + Number(r.risk_score), 0);
        this.avgRiskScore = Math.round((total / data.length) * 10) / 10;
      } else {
        this.avgRiskScore = 0;
      }

      const categoryCounts: { [key: string]: number } = {};
      data.forEach(r => {
        if (r.category && r.category !== 'Not Relevant') {
          categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
        }
      });

      const sorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
      this.topCategory = sorted.length > 0 ? sorted[0][0] : 'N/A';

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      this.risksThisWeek = data.filter(r =>
        new Date(r.published_at) >= oneWeekAgo
      ).length;

      this.suppliersImpacted.clear();
      data.forEach(r => {
        if (r.entity && r.entity !== 'None') {
          this.suppliersImpacted.add(r.entity);
        }
      });

    });

  }

  loadAllNews(): void {
    this.riskService.getAllNews().subscribe((data: Risk[]) => {
      this.allNews = data;
    });
  }

  loadRecentRisks(): void {
    this.riskService.getRecentRisks(3).subscribe((data: Risk[]) => {
      this.recentRisks = data;
    });
  }

  filterRisks(type: string): void {

    this.selectedFilter = type;

    if (type === 'high') {
      this.filteredRisks = this.risks.filter(r => r.risk_score >= 8);
    } else if (type === 'medium') {
      this.filteredRisks = this.risks.filter(r => r.risk_score >= 5 && r.risk_score < 8);
    } else if (type === 'critical') {
      this.filteredRisks = this.risks.filter(r => r.risk_score >= 9);
    } else if (type === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      this.filteredRisks = this.risks.filter(r => new Date(r.published_at) >= oneWeekAgo);
    } else {
      this.filteredRisks = [...this.risks];
    }

  }

  analyzeRisk(): void {

    if (!this.newsText.trim()) {
      alert('Please paste some news text before analyzing.');
      return;
    }

    this.isAnalyzing = true;

    this.riskService.analyzeNews(this.newsText).subscribe({
      next: (response) => {

        this.isAnalyzing = false;
        this.newsText = '';

        if (response?.error) {
          alert('Analysis failed: ' + response.error);
          return;
        }

        const score = response?.classification?.risk_score;
        const category = response?.classification?.category;

        if (response?.message === 'Low risk' || !score || score < 3 || category === 'Not Relevant') {
          alert('No significant risk detected in this news. Risk score is too low to impact the dashboard.');
          return;
        }

        this.loadRisks();
        this.loadAllNews();
        this.loadRecentRisks();
        window.dispatchEvent(new Event('risk-updated'));
        alert(`Risk detected! Category: ${category} | Score: ${score}`);

      },
      error: (err) => {
        console.error('Analysis failed:', err);
        this.isAnalyzing = false;
        alert('Analysis failed. Please check your connection and try again.');
      }
    });

  }

}