import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskCategoryChart } from './risk-category-chart';

describe('RiskCategoryChart', () => {
  let component: RiskCategoryChart;
  let fixture: ComponentFixture<RiskCategoryChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskCategoryChart],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskCategoryChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
