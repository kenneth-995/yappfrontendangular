import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { User } from 'src/app/models/entities/user-model';
import { UserService } from '../../../services/user.service'
import { ClinicService } from 'src/app/services/clinic.service';
import { ClinicDto } from 'src/app/models/dto/clinic/ClinicDto';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject();

  constructor(private userService: UserService, 
    private clinicService: ClinicService) {}

  public userLogged: User;
  public roleUser: number;

  public clinic: ClinicDto = new ClinicDto;

  ngOnInit(): void {
    if (this.userService.userLogged != null) {
      this.userLogged = this.userService.userLogged;
    } else {
      console.log('[HeaderComponent] user==null!');
      console.log(this.userService.userLogged) //null
      this.userLogged = this.userService.getUserLocalStorage()
    }


    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      res => {
        this.roleUser = res as number;
        if (res ===2 || res ===3) this.getClinic();
      }
    );
    
  }


  private getClinic() {
      this.clinicService.getClinic(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res) => this.clinic = res as ClinicDto
      );
  }

  public logout() {
    this.userService.logout()
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
