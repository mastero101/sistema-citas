import { Component, ViewChild, OnInit, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

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
    MatButtonModule,
    AppointmentCreateComponent,
    AppointmentEditComponent,
    AppointmentListComponent
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  mode: 'side' | 'over' = 'side';
  opened: boolean = true;
  isBrowser: boolean;

  constructor(
    private breakpointObserver: BreakpointObserver,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet])
        .subscribe(result => {
          this.mode = result.matches ? 'over' : 'side';
          this.opened = !result.matches;
          this.checkScreenSize();
        });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (this.isBrowser) {
      this.checkScreenSize();
    }
  }

  checkScreenSize() {
    const isHandset = this.breakpointObserver.isMatched(Breakpoints.Handset);
    const isTablet = this.breakpointObserver.isMatched(Breakpoints.Tablet);
    
    if (isHandset || isTablet) {
      this.mode = 'over';
      this.opened = false;
    } else {
      this.mode = 'side';
      this.opened = true;
    }
  }

  toggleSidenav() {
    if (this.drawer) {
      this.drawer.toggle();
      this.opened = this.drawer.opened;
    }
  }
}