import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule  } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav } from '@angular/material/sidenav';
import { MatDrawerMode } from '@angular/material/sidenav';

import { AppointmentEditComponent } from '../appointment-edit/appointment-edit.component';
import { AppointmentListComponent } from '../appointment-list/appointment-list.component';
import { AppointmentCreateComponent } from '../appointment-create/appointment-create.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatSidenav,
    AppointmentCreateComponent,
    AppointmentEditComponent,
    AppointmentListComponent
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent{
  @ViewChild('drawer') drawer!: MatSidenav;

  mode: MatDrawerMode = 'side';
  opened: boolean = true;

  constructor() {}

  toggleSidenav2() {
    this.opened = !this.opened;
    if (this.drawer) {
      this.drawer.toggle();
    }
  }

  toggleSidenav(){
    console.log("works")
  }

}
