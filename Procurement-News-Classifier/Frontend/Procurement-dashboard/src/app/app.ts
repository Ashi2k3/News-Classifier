import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { HeaderComponent } from './shared/components/header/header';
import { RiskDashboardComponent } from './dashboard/risk-dashboard/risk-dashboard';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    RiskDashboardComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}