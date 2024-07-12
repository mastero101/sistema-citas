import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { AppointmentService } from '../services/appointment.service';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './appointment-create.component.html',
  styleUrl: './appointment-create.component.scss'
})
export class AppointmentCreateComponent {
  appointmentForm: FormGroup;
  times: string[] = this.generateTimeSlots();

  constructor(
    private appointmentService: AppointmentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.appointmentForm = this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      description: ['']
    });
  }

  generateTimeSlots(): string[] {
    const times: string[] = [];
    const startHour = 1;
    const endHour = 24;

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const hour24 = hour % 24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 || 12;
        const minuteString = minutes === 0 ? '00' : '30';
        const timeString = `${hour12}:${minuteString} ${ampm}`;
        times.push(timeString);
      }
    }

    return times;
  }

  async onSubmit(): Promise<void> {
    if (this.appointmentForm.valid) {
      const formValues = this.appointmentForm.value;
      const date = new Date(formValues.date).toISOString().split('T')[0];
      const time = this.convertTo24Hour(formValues.time);
      const dateTime = `${date}T${time}`;
      const appointmentData = {
        ...formValues,
        date: dateTime
      };

      try {
        await this.appointmentService.createAppointment(appointmentData);
        this.appointmentForm.reset();
        this.snackBar.open('Cita creada con éxito', 'Cerrar', {
          duration: 3000
        });
      } catch (error) {
        console.error('Error creating appointment:', error);
      }
    }
  }

  convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
      hours = '00';
    }

    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }

    return `${hours}:${minutes}`;
  }
}
