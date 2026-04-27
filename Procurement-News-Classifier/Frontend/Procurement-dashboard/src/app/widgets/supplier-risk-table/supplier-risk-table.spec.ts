import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierRiskTable } from './supplier-risk-table';

describe('SupplierRiskTable', () => {
  let component: SupplierRiskTable;
  let fixture: ComponentFixture<SupplierRiskTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierRiskTable],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierRiskTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
