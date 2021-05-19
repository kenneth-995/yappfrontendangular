import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { pipe, Subject, Subscription } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from 'src/app/services/user.service';
import { ClinicService } from 'src/app/services/clinic.service';

import { ClinicDto } from 'src/app/models/dto/clinic/ClinicDto';



import { User } from 'src/app/models/entities/user-model';

@Component({
  selector: 'app-specialists',
  templateUrl: './specialists.component.html',
  styleUrls: ['./specialists.component.css']
})
export class SpecialistsComponent implements OnInit {
  @ViewChild("modalDelete", { static: false }) modalDelete: TemplateRef<any>;
  @ViewChild("modalCreateEdit", { static: false }) modalCreateEdit: TemplateRef<any>;

  private destroy$ = new Subject();

  public userLogged: User;
  public roleUser: number;

  public specialists: User[] = [];
  public clinics: ClinicDto[] = [];
  public clinic: ClinicDto = new ClinicDto;

  public createSpecialistForm: FormGroup;
  public observablecreateSpecialistForm: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private clinicService: ClinicService) {

  }

  ngOnInit(): void {
    if (this.userService.userLogged != null) this.userLogged = this.userService.userLogged;
    else this.userLogged = this.userService.getUserLocalStorage()
    this.getData();
  }


  getData() {
    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {
        this.roleUser = res;

        if (res === 1) {
          //superadmin
          this.userService.getAllUsers().pipe(takeUntil(this.destroy$)).subscribe(
            (res: User[]) => {
              this.specialists = res;
              console.log('specialists')
              console.log(res)
            }
          );

          this.clinicService.getAllClinics().pipe(takeUntil(this.destroy$)).subscribe(
            (clinics: ClinicDto[]) => {
              console.log('clinics')
              console.log(clinics)
              this.clinics = clinics ;
            }
          );


        } else if (res === 2) {
          //admin / user
          this.userService.getAllUsersByClinicId(this.userLogged.clinicId)
            .pipe(takeUntil(this.destroy$)).subscribe(
              (res: User[]) => {
                this.specialists = res;
                console.log('specialists')
                console.log(res)
              }
            );
          this.clinicService.getClinic(this.userLogged.clinicId).pipe(takeUntil(this.destroy$)).subscribe(
            (clinic: ClinicDto) => {
              console.log('clinic')
              console.log(clinic)
              this.clinic = clinic ;
            }
          );

        } else {
          this.router.navigateByUrl('/home');
          console.log('[errorSpecialistsComponent] get role user !=1 !=2');
        }


      }, error => {
        this.toast.error(JSON.stringify(error));
    });
  }

  public openModalCreateNewSpecialist() {

  }

  public openModalDeleteSpecialist(id:number) {
    this.modalService.open(this.modalDelete).result.then(
      r=> {
        if (r ==='1') {
          console.log('CONFIRM CREATE SPECIALIST: ' + id)
        } else {
          console.log('CANCEL CREATE SPECIALIST')
        }
      }
    );
  }

}
