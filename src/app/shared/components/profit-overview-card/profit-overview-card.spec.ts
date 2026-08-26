import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitOverviewCard } from './profit-overview-card';

describe('ProfitOverviewCard', () => {
  let component: ProfitOverviewCard;
  let fixture: ComponentFixture<ProfitOverviewCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfitOverviewCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfitOverviewCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
