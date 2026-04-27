import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskTimelineChart } from './risk-timeline-chart';

describe('RiskTimelineChart', () => {
  let component: RiskTimelineChart;
  let fixture: ComponentFixture<RiskTimelineChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskTimelineChart],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskTimelineChart);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
