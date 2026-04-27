import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskLevelGauge } from './risk-level-gauge';

describe('RiskLevelGauge', () => {
  let component: RiskLevelGauge;
  let fixture: ComponentFixture<RiskLevelGauge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskLevelGauge],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskLevelGauge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
