import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlatformAnalyticsService } from '@app/core/services/PlatformAnalyticsService';
import { AnalyticsComponent } from './analytics';

describe('AnalyticsComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AnalyticsComponent],
      providers: [{
        provide: PlatformAnalyticsService,
        useValue: { getAnalytics: () => of({ data: {} }) },
      }],
    });
  });

  it('keeps unavailable percentages distinct from zero', () => {
    const component = TestBed.createComponent(AnalyticsComponent).componentInstance;

    expect(component.formatPercentage(null)).toBe('—');
    expect(component.formatPercentage(0)).toBe('0%');
  });
});
