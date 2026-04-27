import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskDashboard } from './risk-dashboard';

describe('RiskDashboard', () => {
  let component: RiskDashboard;
  let fixture: ComponentFixture<RiskDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
