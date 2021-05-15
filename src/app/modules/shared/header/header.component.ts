import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

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
    private toast: ToastrService
    ) {}

  public username: string;
  public roleUser: number;

  ngOnInit(): void {
    this.username = localStorage.getItem('username');
    this.getRoleUser();
  }

  private getRoleUser() {
    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      res => {
        this.roleUser = res as number;
      }, error=> {
        this.toast.error(JSON.stringify(error));
    });
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    localStorage.removeItem('id');
    localStorage.removeItem('user');
    this.router.navigateByUrl('/login');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
