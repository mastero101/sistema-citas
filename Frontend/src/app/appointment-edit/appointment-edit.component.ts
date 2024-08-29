import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../services/appointment.service';
import { CommonModule } from '@angular/common';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-appointment-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './appointment-edit.component.html',
  styleUrl: './appointment-edit.component.scss' 
})
export class AppointmentEditComponent implements OnInit{
  appointmentForm: FormGroup;
  appointments: any[] = [];
  availableTimes: string[] = [];

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

    this.availableTimes = this.generateTimes();
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getAppointments().then(
      appointments => {
        this.appointments = appointments;
      },
      error => {
        console.error('Error loading appointments:', error);
      }
    );
  }

  onAppointmentSelect(event: any): void {
    const selectedAppointmentId = event.value;
    this.loadAppointmentDetails(selectedAppointmentId);
  }

  loadAppointmentDetails(id: string): void {
    this.appointmentService.getAppointmentById(id).then(
      appointment => {
        const date = new Date(appointment.date);
  
        // Convertir la hora UTC a hora local
        const localDate = new Date(date.getTime());
        const formattedDate = localDate.toISOString().split('T')[0];
        const formattedTime = this.formatTime(localDate);
  
        this.appointmentForm.patchValue({
          id: appointment._id,
          name: appointment.name,
          date: formattedDate,
          time: formattedTime,
          description: appointment.description
        });
      },
      error => {
        console.error('Error loading appointment details:', error);
      }
    );
  }
  
  onSubmit(): void {
    if (this.appointmentForm.valid) {
      const formValues = this.appointmentForm.value;
  
      // Convertir la hora a formato de 24 horas
      const time24h = this.convertTimeTo24HourFormat(formValues.time);
  
      // Formar la fecha y hora en formato ISO 8601 y ajustarla a la zona horaria local
      const localDateTime = new Date(`${formValues.date}T${time24h}:00`);
      const appointmentData = {
        ...formValues,
        date: localDateTime.toISOString() // Esto lo convierte a UTC automáticamente
      };
  
      this.appointmentService.updateAppointment(formValues.id, appointmentData).then(() => {
        this.appointmentForm.reset();
        this.loadAppointments();
        this.snackBar.open('Cita actualizada con éxito', 'Cerrar', {
          duration: 3000
        });
      }).catch(error => {
        console.error('Error updating appointment:', error);
      });
    }
  }

  onDelete(): void {
    if (confirm('¿Estás seguro de eliminar esta cita?')) {
      const appointmentId = this.appointmentForm.get('id')?.value;
      this.appointmentService.deleteAppointment(appointmentId).then(() => {
        this.appointmentForm.reset();
        this.loadAppointments();
        this.snackBar.open('Cita eliminada con éxito', 'Cerrar', {
          duration: 3000
        });
      }).catch(error => {
        console.error('Error deleting appointment:', error);
      });
    }
  }

  private generateTimes(): string[] {
    const times: string[] = [];
    for (let hour = 9; hour <= 21; hour++) {
      const hour12 = hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      times.push(`${hour12}:00 ${ampm}`);
      times.push(`${hour12}:30 ${ampm}`);
    }
    return times;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours12}:${minutesStr} ${ampm}`;
  }

  private convertTimeTo24HourFormat(time: string): string {
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    
    if (period === 'PM') {
      hours = String(Number(hours) + 12);
    }

    return `${hours}:${minutes}`;
  }
}
