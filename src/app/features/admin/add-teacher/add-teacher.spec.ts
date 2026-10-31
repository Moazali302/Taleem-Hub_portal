import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TeacherListItem } from '@app/core/models/teacher.model';
import { AdminTeachersService } from '@app/core/services/admin-teachers.service';
import { ToastService } from '@app/core/services/toast.service';
import { AddTeacherComponent } from './add-teacher';

const TEACHER: TeacherListItem = {
  id: 45,
  school_id: 'school-from-response',
  school_name: 'School Name',
  teacher_name: 'Teacher Name',
  qualification: 'M.Ed',
  phone: '+923001234567',
  email: 'teacher@example.test',
  subject: 'Math',
  specialty: 'Math',
  rank: 'senior_teacher',
  status: 'on_leave',
  account_status: 'active',
  gender: 'female',
  cnic: '12345-1234567-1',
  address: 'Lahore',
  joining_date: '2024-08-01',
  experience_years: 5,
  monthly_salary: 60000,
  created_at: '2026-10-25T10:00:00.000Z',
  updated_at: '2026-10-25T10:00:00.000Z',
};

describe('AddTeacherComponent', () => {
  let teachersService: {
    createTeacher: ReturnType<typeof vi.fn>;
    updateTeacher: ReturnType<typeof vi.fn>;
  };
  let toastService: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    teachersService = {
      createTeacher: vi.fn(() => of({ data: TEACHER })),
      updateTeacher: vi.fn(() => of({ data: TEACHER })),
    };
    toastService = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [AddTeacherComponent],
      providers: [
        { provide: AdminTeachersService, useValue: teachersService },
        { provide: ToastService, useValue: toastService },
      ],
    });
  });

  it('defaults create status to active and includes it without a school identifier', () => {
    const fixture = TestBed.createComponent(AddTeacherComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.form.controls.status.value).toBe('active');
    component.form.patchValue({
      teacher_name: 'Teacher Name',
      qualification: 'M.Ed',
      phone: '+923001234567',
      email: 'teacher@example.test',
      specialty: 'Math',
      password: 'a-secure-password',
      joining_date: '2026-11-01',
    });
    component.onSubmit();

    expect(teachersService.createTeacher).toHaveBeenCalledWith(expect.objectContaining({
      status: 'active',
      password: 'a-secure-password',
      joining_date: '2026-11-01',
    }));
    expect(teachersService.createTeacher.mock.calls[0][0]).not.toHaveProperty('cnic');
    expect(teachersService.createTeacher.mock.calls[0][0]).not.toHaveProperty('schoolId');
    expect(teachersService.createTeacher.mock.calls[0][0]).not.toHaveProperty('school_id');
  });

  it('accepts a blank optional CNIC and rejects an invalid CNIC format', () => {
    const fixture = TestBed.createComponent(AddTeacherComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.form.controls.cnic.valid).toBe(true);
    component.form.controls.cnic.setValue('12345-1234567-1');
    expect(component.form.controls.cnic.valid).toBe(true);
    component.form.controls.cnic.setValue('invalid-cnic');
    expect(component.form.controls.cnic.valid).toBe(false);
  });

  it('submits the added profile fields and omits an empty optional CNIC', () => {
    const fixture = TestBed.createComponent(AddTeacherComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.form.patchValue({
      teacher_name: 'Teacher Name',
      qualification: 'M.Ed',
      phone: '+923001234567',
      email: 'teacher@example.test',
      specialty: 'Math',
      password: 'a-secure-password',
      gender: 'female',
      address: 'Lahore',
      joining_date: '2026-11-01',
      experience_years: 5,
      monthly_salary: 60000,
    });
    component.onSubmit();

    expect(teachersService.createTeacher).toHaveBeenCalledWith(expect.objectContaining({
      gender: 'female',
      address: 'Lahore',
      joining_date: '2026-11-01',
      experience_years: 5,
      monthly_salary: 60000,
    }));
    expect(teachersService.createTeacher.mock.calls[0][0]).not.toHaveProperty('cnic');
  });

  it('loads status from the edit record and sends the selected status on update', () => {
    const fixture = TestBed.createComponent(AddTeacherComponent);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('teacher', TEACHER);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component.form.controls.status.value).toBe('on_leave');

    component.form.controls.status.setValue('active');
    component.form.controls.cnic.setValue('');
    component.form.controls.address.setValue('');
    component.form.controls.experience_years.setValue(null);
    component.form.controls.monthly_salary.setValue(null);
    component.onSubmit();
    expect(teachersService.updateTeacher).toHaveBeenCalledWith(TEACHER.id, expect.objectContaining({
      status: 'active',
      gender: 'female',
      cnic: null,
      address: null,
      joining_date: '2024-08-01',
      experience_years: null,
      monthly_salary: null,
    }));
    expect(teachersService.updateTeacher.mock.calls[0][1]).not.toHaveProperty('schoolId');
    expect(teachersService.updateTeacher.mock.calls[0][1]).not.toHaveProperty('school_id');
  });
});
