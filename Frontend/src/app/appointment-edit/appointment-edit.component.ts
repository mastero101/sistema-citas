import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../services/appointment.service';
import { CommonModule } from '@angular/common';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-appointment-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule
  ],
  templateUrl: './appointment-edit.component.html',
  styleUrl: './appointment-edit.component.scss' 
})
export class AppointmentEditComponent implements OnInit{
  appointmentForm: FormGroup;
  appointments: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {
    this.appointmentForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().then(
      appointments => {
        this.appointments = appointments;
      },
      (error: any) => {
        console.error('Error loading appointments:', error);
      }
    );
  }

  onAppointmentSelect(event: any): void {
    const selectedAppointmentId = event.target.value;
    this.loadAppointmentDetails(selectedAppointmentId);
  }

  loadAppointmentDetails(id: string): void {
    this.appointmentService.getAppointmentById(id).then(
      appointment => {
        const date = new Date(appointment.date);
        const formattedDate = date.toISOString().split('T')[0];
        const formattedTime = date.toTimeString().split(' ')[0];

        this.appointmentForm.patchValue({
          id: appointment._id,
          name: appointment.name,
          date: formattedDate,
          time: formattedTime,
          description: appointment.description
        });
      },
      (error: any) => {
        console.error('Error loading appointment details:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formValues = this.appointmentForm.value;
      const dateTime = `${formValues.date}T${formValues.time}`;
      const appointmentData = {
        ...formValues,
        date: dateTime
      };

      this.appointmentService.updateAppointment(formValues.id, appointmentData).then(() => {
        // Limpiar el formulario
        this.appointmentForm.reset();
        // Actualizar la lista de citas
        this.loadAppointments();
        // Snackbar de confirmacion
        this.snackBar.open('Cita actualizada con éxito', 'Cerrar', {
          duration: 3000
        });
      }).catch((error: any) => {
        console.error('Error updating appointment:', error);
      });
    }
  }

  onDelete(): void {
    if (confirm('Estas Seguro de Eliminar Esta Cita?')) {
      const appointmentId = this.appointmentForm.get('id')?.value;
      this.appointmentService.deleteAppointment(appointmentId).then(() => {
        // Limpiar el formulario
        this.appointmentForm.reset();
        // Actualizar la lista de citas
        this.loadAppointments();
        // Snackbar de confirmacion
        this.snackBar.open('Cita eliminada con éxito', 'Cerrar', {
          duration: 3000
        });
      }).catch((error: any) => {
        console.error('Error deleting appointment:', error);
      });
    }
  }
}
