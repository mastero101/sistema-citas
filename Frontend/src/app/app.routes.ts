import { Routes } from '@angular/router';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { AppointmentCreateComponent } from './appointment-create/appointment-create.component';
import { AppointmentEditComponent } from './appointment-edit/appointment-edit.component';

export const routes: Routes = [
  { path: 'list', component: AppointmentListComponent },
  { path: 'create', component: AppointmentCreateComponent },
  { path: 'edit', component: AppointmentEditComponent}
];
