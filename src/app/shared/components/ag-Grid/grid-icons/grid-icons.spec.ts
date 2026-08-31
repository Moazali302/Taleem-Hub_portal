import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridIcons } from './grid-icons';

describe('GridIcons', () => {
  let component: GridIcons;
  let fixture: ComponentFixture<GridIcons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridIcons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridIcons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
