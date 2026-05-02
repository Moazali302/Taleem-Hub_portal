import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-registration',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-registration.component.html',
  styleUrl: './verify-registration.component.css'
})
export class VerifyRegistrationComponent implements OnInit {
 email = '';
  schoolName = '';
 
  constructor(private route: ActivatedRoute) {}
 
   ngOnInit(): void {
    this.route.queryParams.subscribe(({ email, school }) => {
      this.email = email || '—';
      this.schoolName = school|| '—';
    });
  }
}
