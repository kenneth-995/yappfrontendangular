import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { UserService } from '../../../services/user.service'

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  constructor(
    private userService: UserService, 
    private router: Router,
    /* private toast: ToastrService */
    ) {}

  public username: string;

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
