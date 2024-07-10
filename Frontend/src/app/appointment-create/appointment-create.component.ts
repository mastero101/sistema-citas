import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AppointmentService } from '../services/appointment.service';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-appointment-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule
  ],
  templateUrl: './appointment-create.component.html',
  styleUrl: './appointment-create.component.scss'
})
export class AppointmentCreateComponent {
  appointmentForm: FormGroup;

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

  async onSubmit(): Promise<void> {
    if (this.appointmentForm.valid) {
      const formValues = this.appointmentForm.value;
      const dateTime = `${formValues.date}T${formValues.time}`;
      const appointmentData = {
        ...formValues,
        date: dateTime
      };

      try {
        await this.appointmentService.createAppointment(appointmentData);
        this.appointmentForm.reset();
        // Snackbar de confirmacion
        this.snackBar.open('Cita creada con éxito', 'Cerrar', {
          duration: 3000
        });
      } catch (error) {
        console.error('Error creating appointment:', error);
      }
    }
  }
}
