import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AppointmentService } from '../services/appointment.service';


@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.scss'
})
export class AppointmentListComponent implements OnInit{
  appointments: any[] = [];

  constructor(private appointmentService: AppointmentService) { }

  async ngOnInit(): Promise<void> {
    try {
      this.appointments = await this.appointmentService.getAppointments();
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  }
}
