import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {

  activeSection: string = 'dashboard';

  private getScrollContainer(): Element {
    return document.querySelector('.page-content')
      ?? document.querySelector('.content')
      ?? document.documentElement;
  }

  scrollTo(sectionId: string): void {

    this.activeSection = sectionId;

    const container = this.getScrollContainer();

    if (sectionId === 'dashboard') {
      container.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(sectionId);

    if (!element) {
      console.warn(`No element found for section: "${sectionId}"`);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    const yOffset = -80;
    const y = container.scrollTop + (elementRect.top - containerRect.top) + yOffset;

    container.scrollTo({ top: y, behavior: 'smooth' });

  }

}