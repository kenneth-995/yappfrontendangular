import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'yappfrontend';

  headerFooter: boolean = false;
  lastUrl: string;
  currentUrl: string;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      this.headerFooter = (event.url !== '/login' && event.url !== '/register')
      
    });

  }
}
