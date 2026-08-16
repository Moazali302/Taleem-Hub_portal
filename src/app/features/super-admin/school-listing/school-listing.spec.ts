import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolListing } from './school-listing';

describe('SchoolListing', () => {
  let component: SchoolListing;
  let fixture: ComponentFixture<SchoolListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchoolListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchoolListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
