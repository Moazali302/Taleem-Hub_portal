import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminTeachersService } from '@app/core/services/admin-teachers.service';
import { ToastService } from '@app/core/services/toast.service';
import { TeacherListItem, TeacherPage } from '@app/core/models/teacher.model';
import { TeacherListingComponent } from './teacher-listing';

const TEACHER: TeacherListItem = {
  id: 25,
  school_id: 'school-a',
  school_name: 'Punjab High School',
  teacher_name: 'Ayesha Khan',
  qualification: 'M.Sc Mathematics',
  subject: 'Mathematics',
  specialty: 'Mathematics',
  email: 'ayesha@example.com',
  phone: '0312-5550101',
  status: 'on_leave',
  account_status: 'inactive',
  rank: 'senior_teacher',
  created_at: '2026-10-25T10:00:00.000Z',
  updated_at: '2026-10-25T10:00:00.000Z',
};

const PAGE: TeacherPage = {
  summary: { totalTeachers: 38, activeTeachers: 36, inactiveTeachers: 2 },
  items: [TEACHER],
  total: 15,
  page: 1,
  limit: 5,
  totalPages: 3,
};

describe('TeacherListingComponent', () => {
  let fixture: ComponentFixture<TeacherListingComponent>;
  let component: TeacherListingComponent;
  let teachersService: {
    getAllTeachers: ReturnType<typeof vi.fn>;
    getAllMatchingTeachers: ReturnType<typeof vi.fn>;
  };
  let toastService: { error: ReturnType<typeof vi.fn>; success: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    teachersService = {
      getAllTeachers: vi.fn(() => of({ data: PAGE })),
      getAllMatchingTeachers: vi.fn(() => of([TEACHER])),
    };
    toastService = { error: vi.fn(), success: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TeacherListingComponent],
      providers: [
        { provide: AdminTeachersService, useValue: teachersService },
        { provide: ToastService, useValue: toastService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TeacherListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('uses the API summary and renders account status rather than employment status', () => {
    expect(component.statCards.map((card) => card.value)).toEqual([38, 36, 2]);
    expect(fixture.nativeElement.textContent).toContain('Inactive');
    expect(fixture.nativeElement.textContent).toContain('Ayesha Khan');
    expect(fixture.nativeElement.textContent).toContain('Mathematics');
    expect(component.accountStatusLabel(TEACHER.account_status)).toBe('Inactive');
  });

  it('resets to page one and sends the selected account status to the API', () => {
    component.page = 3;
    component.onStatusFilterChange('inactive');

    expect(teachersService.getAllTeachers).toHaveBeenLastCalledWith({
      page: 1,
      limit: 5,
      search: undefined,
      subject: undefined,
      status: 'inactive',
    });
  });

  it('uses server pagination metadata for the displayed result range', () => {
    expect(component.firstResult).toBe(1);
    expect(component.lastResult).toBe(5);
    expect(component.visiblePages).toEqual([1, 2, 3]);
  });
});
