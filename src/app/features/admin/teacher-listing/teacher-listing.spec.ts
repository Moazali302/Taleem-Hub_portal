import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherListing } from './teacher-listing';

describe('TeacherListing', () => {
  let component: TeacherListing;
  let fixture: ComponentFixture<TeacherListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherListing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
