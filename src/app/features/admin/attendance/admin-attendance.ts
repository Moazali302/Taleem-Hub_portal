import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastService } from '@app/core/services/toast.service';
import { downloadCsv } from '@app/shared/utlis/csv-export.util';

type AttendanceTab = 'classes' | 'teachers' | 'leaves';
type RegisterStatus = 'Submitted' | 'Pending';
type TeacherStatus = 'On time' | 'Late' | 'On leave' | 'Not marked';
type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
type ClassFilter = 'All' | RegisterStatus;
type LeaveFilter = 'Pending' | 'Approved' | 'Rejected' | 'All';

interface ClassRegister {
  id: string;
  className: string;
  teacher: string;
  submittedAt: string | null;
  present: number | null;
  absent: number | null;
  leave: number | null;
  rate: number | null;
}

interface TeacherAttendance {
  id: string;
  name: string;
  assignment: string;
  markedAt: string | null;
  location: string;
  status: TeacherStatus;
  comment: string;
}

interface LeaveRequest {
  id: string;
  teacher: string;
  assignment: string;
  type: 'Sick leave' | 'Casual leave';
  dates: string;
  duration: string;
  reason: string;
  appliedAt: string;
  status: LeaveStatus;
}

@Component({
  selector: 'app-admin-attendance',
  imports: [FormsModule],
  templateUrl: './admin-attendance.html',
  styleUrl: './admin-attendance.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAttendanceComponent {
  readonly activeTab = signal<AttendanceTab>('classes');
  readonly selectedDate = signal(new Date());
  readonly searchTerm = signal('');
  readonly classFilter = signal<ClassFilter>('All');
  readonly teacherFilter = signal<TeacherStatus | 'All'>('All');
  readonly leaveFilter = signal<LeaveFilter>('Pending');
  readonly currentPage = signal(1);
  readonly pageSize = 5;
  readonly selectedClassId = signal('9-B');
  readonly selectedLeaveId = signal('leave-1');
  readonly rejectionRemark = signal('');
  readonly isRegisterOpen = signal(false);
  readonly editingRegisterId = signal<string | null>(null);
  readonly deleteRegisterId = signal<string | null>(null);
  readonly editPresent = signal(0);
  readonly editAbsent = signal(0);
  readonly editLeave = signal(0);

  readonly classRegisters = signal<ClassRegister[]>(createClassRegisters());
  readonly teachers = signal<TeacherAttendance[]>(createTeacherAttendance());
  readonly leaveRequests = signal<LeaveRequest[]>([
    {
      id: 'leave-1',
      teacher: 'Ayesha Khan',
      assignment: 'Class teacher · 9-B',
      type: 'Sick leave',
      dates: '27–28 Nov 2026',
      duration: '2 days',
      reason: 'Fever and doctor advised rest for two days.',
      appliedAt: '25 Nov',
      status: 'Pending',
    },
    {
      id: 'leave-2',
      teacher: 'Usman Ali',
      assignment: 'Subject teacher',
      type: 'Casual leave',
      dates: '30 Nov 2026',
      duration: '1 day',
      reason: 'Family function out of the city.',
      appliedAt: '25 Nov',
      status: 'Pending',
    },
    {
      id: 'leave-3',
      teacher: 'Sara Ahmed',
      assignment: 'Class teacher · 10-A',
      type: 'Sick leave',
      dates: '24 Nov 2026',
      duration: '1 day',
      reason: 'Medical appointment.',
      appliedAt: '23 Nov',
      status: 'Approved',
    },
    {
      id: 'leave-4',
      teacher: 'Bilal Hussain',
      assignment: 'Subject teacher',
      type: 'Casual leave',
      dates: '20 Nov 2026',
      duration: '1 day',
      reason: 'Personal work.',
      appliedAt: '19 Nov',
      status: 'Rejected',
    },
  ]);

  readonly filteredClasses = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    return this.classRegisters().filter((register) => {
      const matchesSearch = !search ||
        `${register.className} ${register.teacher}`.toLowerCase().includes(search);
      const matchesStatus = this.classFilter() === 'All' ||
        (register.submittedAt ? 'Submitted' : 'Pending') === this.classFilter();
      return matchesSearch && matchesStatus;
    });
  });

  readonly filteredTeachers = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    return this.teachers().filter((teacher) => {
      const matchesSearch = !search ||
        `${teacher.name} ${teacher.assignment} ${teacher.location}`.toLowerCase().includes(search);
      const matchesStatus = this.teacherFilter() === 'All' ||
        teacher.status === this.teacherFilter();
      return matchesSearch && matchesStatus;
    });
  });

  readonly filteredLeaves = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    return this.leaveRequests().filter((request) => {
      const matchesSearch = !search ||
        `${request.teacher} ${request.assignment} ${request.type}`.toLowerCase().includes(search);
      const matchesStatus = this.leaveFilter() === 'All' ||
        request.status === this.leaveFilter();
      return matchesSearch && matchesStatus;
    });
  });

  readonly visibleClasses = computed(() =>
    this.filteredClasses().slice(
      (this.currentPage() - 1) * this.activePageSize(),
      this.currentPage() * this.activePageSize(),
    ),
  );
  readonly visibleTeachers = computed(() =>
    this.filteredTeachers().slice((this.currentPage() - 1) * this.pageSize, this.currentPage() * this.pageSize),
  );
  readonly visibleLeaves = computed(() =>
    this.filteredLeaves().slice(
      (this.currentPage() - 1) * this.activePageSize(),
      this.currentPage() * this.activePageSize(),
    ),
  );
  readonly selectedClass = computed(() =>
    this.classRegisters().find((register) => register.id === this.selectedClassId()) ??
    this.classRegisters()[0],
  );
  readonly selectedLeave = computed(() =>
    this.leaveRequests().find((request) => request.id === this.selectedLeaveId()) ??
    this.leaveRequests().find((request) => request.status === 'Pending') ??
    this.leaveRequests()[0],
  );
  readonly registerStudents = computed(() => {
    const register = this.selectedClass();
    if (!register || register.present === null || register.absent === null || register.leave === null) {
      return [];
    }

    return Array.from(
      { length: register.present + register.absent + register.leave },
      (_, index) => {
        const rollNumber = index + 1;
        const status = rollNumber <= register.present!
          ? 'Present'
          : rollNumber <= register.present! + register.absent!
            ? 'Absent'
            : 'Leave';
        return { rollNumber: String(rollNumber).padStart(2, '0'), name: `Student ${rollNumber}`, status };
      },
    );
  });
  readonly pendingLeaveCount = computed(() =>
    this.leaveRequests().filter((request) => request.status === 'Pending').length,
  );
  readonly pageCount = computed(() => {
    const total = this.activeTab() === 'classes'
      ? this.filteredClasses().length
      : this.activeTab() === 'teachers'
        ? this.filteredTeachers().length
        : this.filteredLeaves().length;
    return Math.max(1, Math.ceil(total / this.activePageSize()));
  });
  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index + 1));
  readonly dateLabel = computed(() =>
    new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(this.selectedDate()),
  );
  readonly rangeLabel = computed(() => {
    const total = this.activeTab() === 'classes'
      ? this.filteredClasses().length
      : this.activeTab() === 'teachers'
        ? this.filteredTeachers().length
        : this.filteredLeaves().length;
    const pageSize = this.activePageSize();
    const first = total === 0 ? 0 : (this.currentPage() - 1) * pageSize + 1;
    const last = Math.min(this.currentPage() * pageSize, total);
    return `Showing ${first} to ${last} of ${total}`;
  });

  private readonly toaster = inject(ToastService);

  setTab(tab: AttendanceTab): void {
    this.activeTab.set(tab);
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.classFilter.set('All');
    this.teacherFilter.set('All');
    this.leaveFilter.set('Pending');
  }

  changeDate(offset: number): void {
    const date = new Date(this.selectedDate());
    date.setDate(date.getDate() + offset);
    this.selectedDate.set(date);
    this.toaster.info(`Attendance date changed to ${this.dateLabel()}.`);
  }

  setSearch(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.pageCount() || page === this.currentPage()) return;
    this.currentPage.set(page);
  }

  remindTeacher(name: string): void {
    this.toaster.show(`A reminder was sent to ${name}.`, 'info');
  }

  setClassFilter(filter: ClassFilter): void {
    this.classFilter.set(filter);
    this.currentPage.set(1);
  }

  setTeacherFilter(filter: TeacherStatus | 'All'): void {
    this.teacherFilter.set(filter);
    this.currentPage.set(1);
  }

  setLeaveFilter(filter: LeaveFilter): void {
    this.leaveFilter.set(filter);
    this.currentPage.set(1);
  }

  selectLeave(id: string): void {
    this.selectedLeaveId.set(id);
    this.rejectionRemark.set('');
  }

  reviewLeave(id: string): void {
    this.selectLeave(id);
    this.setTab('leaves');
    this.selectedLeaveId.set(id);
  }

  openEditRegister(register: ClassRegister): void {
    if (register.present === null || register.absent === null || register.leave === null) {
      this.toaster.error('This class register is still pending and cannot be edited.');
      return;
    }
    this.editingRegisterId.set(register.id);
    this.editPresent.set(register.present);
    this.editAbsent.set(register.absent);
    this.editLeave.set(register.leave);
  }

  saveRegisterEdit(): void {
    const id = this.editingRegisterId();
    if (!id) return;

    const present = this.editPresent();
    const absent = this.editAbsent();
    const leave = this.editLeave();
    if (present < 0 || absent < 0 || leave < 0) {
      this.toaster.error('Attendance counts cannot be negative.');
      return;
    }

    const total = present + absent + leave;
    if (total === 0) {
      this.toaster.error('Enter at least one attendance record.');
      return;
    }

    this.classRegisters.update((registers) =>
      registers.map((register) => {
        if (register.id !== id) return register;
        const rate = Math.round((present / total) * 100);
        return { ...register, present, absent, leave, rate };
      }),
    );
    this.editingRegisterId.set(null);
    this.toaster.success('Class attendance updated successfully.');
  }

  cancelRegisterEdit(): void {
    this.editingRegisterId.set(null);
  }

  requestRegisterDelete(id: string): void {
    this.deleteRegisterId.set(id);
  }

  cancelRegisterDelete(): void {
    this.deleteRegisterId.set(null);
  }

  confirmRegisterDelete(): void {
    const id = this.deleteRegisterId();
    if (!id) return;
    const register = this.classRegisters().find((item) => item.id === id);
    if (!register) {
      this.toaster.error('The selected class register could not be found.');
      return;
    }

    this.classRegisters.update((registers) => registers.filter((item) => item.id !== id));
    if (this.selectedClassId() === id) {
      this.selectedClassId.set(this.classRegisters()[0]?.id ?? '');
    }
    this.deleteRegisterId.set(null);
    this.toaster.success(`${register.className} attendance register deleted.`);
  }

  decideLeave(id: string, decision: 'Approved' | 'Rejected'): void {
    if (decision === 'Rejected' && !this.rejectionRemark().trim()) {
      this.toaster.error('Add a reason before rejecting this leave request.');
      return;
    }

    const request = this.leaveRequests().find((item) => item.id === id);
    if (!request || request.status !== 'Pending') return;

    this.leaveRequests.update((requests) =>
      requests.map((item) => item.id === id ? { ...item, status: decision } : item),
    );
    this.rejectionRemark.set('');
    this.toaster.success(`Leave request ${decision.toLowerCase()}.`);
  }

  exportReport(): void {
    try {
      if (this.activeTab() === 'classes') {
        downloadCsv('class-attendance.csv', [
          { header: 'Class', value: (row: ClassRegister) => row.className },
          { header: 'Teacher', value: (row: ClassRegister) => row.teacher },
          { header: 'Submitted', value: (row: ClassRegister) => row.submittedAt ?? 'Pending' },
          { header: 'Present', value: (row: ClassRegister) => row.present ?? '—' },
          { header: 'Absent', value: (row: ClassRegister) => row.absent ?? '—' },
          { header: 'Leave', value: (row: ClassRegister) => row.leave ?? '—' },
          { header: 'Attendance rate', value: (row: ClassRegister) => row.rate === null ? 'Pending' : `${row.rate}%` },
        ], this.classRegisters());
      } else if (this.activeTab() === 'teachers') {
        downloadCsv('teacher-attendance.csv', [
          { header: 'Teacher', value: (row: TeacherAttendance) => row.name },
          { header: 'Assignment', value: (row: TeacherAttendance) => row.assignment },
          { header: 'Marked at', value: (row: TeacherAttendance) => row.markedAt ?? '—' },
          { header: 'Location', value: (row: TeacherAttendance) => row.location },
          { header: 'Status', value: (row: TeacherAttendance) => row.status },
          { header: 'Comment', value: (row: TeacherAttendance) => row.comment },
        ], this.teachers());
      } else {
        downloadCsv('leave-requests.csv', [
          { header: 'Teacher', value: (row: LeaveRequest) => row.teacher },
          { header: 'Type', value: (row: LeaveRequest) => row.type },
          { header: 'Dates', value: (row: LeaveRequest) => row.dates },
          { header: 'Duration', value: (row: LeaveRequest) => row.duration },
          { header: 'Status', value: (row: LeaveRequest) => row.status },
          { header: 'Reason', value: (row: LeaveRequest) => row.reason },
        ], this.leaveRequests());
      }
      this.toaster.success('Attendance report downloaded successfully.');
    } catch {
      this.toaster.error('Unable to download the attendance report. Please try again.');
    }
  }

  private activePageSize(): number {
    return this.activeTab() === 'teachers' ? this.pageSize : 4;
  }
}

function createClassRegisters(): ClassRegister[] {
  const registers: ClassRegister[] = [
    { id: '8-A', className: '8-A', teacher: 'Ayesha Khan', submittedAt: '08:05 AM', present: 30, absent: 2, leave: 0, rate: 94 },
    { id: '9-B', className: '9-B', teacher: 'Usman Ali', submittedAt: '08:40 AM', present: 27, absent: 8, leave: 1, rate: 77 },
    { id: '10-A', className: '10-A', teacher: 'Sara Ahmed', submittedAt: '08:12 AM', present: 28, absent: 1, leave: 1, rate: 93 },
    { id: '7-B', className: '7-B', teacher: 'Bilal Hussain', submittedAt: null, present: null, absent: null, leave: null, rate: null },
  ];

  const additionalClasses = ['6-A', '6-B', '7-A', '8-B', '9-A', '10-B', '5-A', '5-B'];
  for (let index = 0; index < additionalClasses.length; index += 1) {
    const className = additionalClasses[index];
    const submitted = index < 6;
    registers.push({
      id: `class-${className}`,
      className,
      teacher: `Teacher ${String(index + 5).padStart(2, '0')}`,
      submittedAt: submitted ? `08:${String(15 + index).padStart(2, '0')} AM` : null,
      present: submitted ? 31 - (index % 4) : null,
      absent: submitted ? 2 + (index % 3) : null,
      leave: submitted ? index % 2 : null,
      rate: submitted ? 89 + (index % 9) : null,
    });
  }
  return registers;
}

function createTeacherAttendance(): TeacherAttendance[] {
  const samples: TeacherAttendance[] = [
    { id: 'teacher-1', name: 'Ayesha Khan', assignment: 'Class teacher · 8-A', markedAt: '07:52 AM', location: 'Inside campus', status: 'On time', comment: '' },
    { id: 'teacher-2', name: 'Usman Ali', assignment: 'Class teacher · 9-B', markedAt: '08:24 AM', location: 'Inside campus', status: 'Late', comment: 'Heavy traffic on the way to school.' },
    { id: 'teacher-3', name: 'Sara Ahmed', assignment: 'Subject teacher', markedAt: '07:58 AM', location: 'Outside campus · 3.2 km', status: 'On time', comment: 'Flagged: marked away from school.' },
    { id: 'teacher-4', name: 'Bilal Hussain', assignment: 'Class teacher · 10-A', markedAt: null, location: '—', status: 'On leave', comment: 'Sick leave · approved.' },
    { id: 'teacher-5', name: 'Nadia Iqbal', assignment: 'Subject teacher', markedAt: null, location: '—', status: 'Not marked', comment: 'No check-in or leave request.' },
  ];
  const additionalStatuses: TeacherStatus[] = [
    ...Array.from({ length: 35 }, () => 'On time' as const),
    ...Array.from({ length: 3 }, () => 'Late' as const),
    ...Array.from({ length: 2 }, () => 'On leave' as const),
    'Not marked',
  ];

  additionalStatuses.forEach((status, index) => {
    const number = index + 6;
    samples.push({
      id: `teacher-${number}`,
      name: `Teacher ${String(number).padStart(2, '0')}`,
      assignment: number % 2 ? `Class teacher · ${6 + (number % 5)}-A` : 'Subject teacher',
      markedAt: status === 'On time' || status === 'Late'
        ? status === 'Late' ? '08:18 AM' : '07:55 AM'
        : null,
      location: status === 'On time' || status === 'Late' ? 'Inside campus' : '—',
      status,
      comment: status === 'Late' ? 'Arrived after the check-in time.' : '',
    });
  });
  return samples;
}
