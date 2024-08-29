import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';

import { AppointmentService } from '../services/appointment.service';

interface Appointment {
  _id: string;
  name: string;
  date: Date;
  description: string;
}

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatNativeDateModule
  ],
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
  appointments: Appointment[] = [];
  searchTerm: string = '';
  selectedDate: Date | null = null;

  constructor(private appointmentService: AppointmentService) { }

  async ngOnInit(): Promise<void> {
    try {
      this.appointments = await this.appointmentService.getAppointments();
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }

  filteredAppointments(): Appointment[] {
    return this.appointments.filter(appointment => {
      const matchesName = appointment.name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesDate = this.selectedDate
        ? new Date(appointment.date).toDateString() === this.selectedDate.toDateString()
        : true;

      return matchesName && matchesDate;
    });
  }
}
