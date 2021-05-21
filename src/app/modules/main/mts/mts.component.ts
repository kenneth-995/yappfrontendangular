import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { pipe, Subject, Subscription } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FullCalendarComponent, CalendarOptions } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
//import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { UserService } from 'src/app/services/user.service';
import { MtsService } from 'src/app/services/mts.service';
import { PatientService } from 'src/app/services/patient.service';
import { TreatmentService } from '../../../services/treatment.service';

import { MtsCreateUpdateDto } from 'src/app/models/dto/mts/MtsCreateUpdateDto';
import { MtsDto } from 'src/app/models/dto/mts/MtsDto';
import { TreatmentDto } from '../../../models/dto/treatment/TreatmentDto';

import { PatientDto } from '../../../models/dto/patient/PatientDto';
import { User } from 'src/app/models/entities/user-model';

@Component({
  selector: 'app-mts',
  templateUrl: './mts.component.html',
  styleUrls: ['./mts.component.css']
})
export class MtsComponent implements OnInit {
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  public showCalendar: boolean = true;
  public classShowCalendar: string = 'col-8 shadow p-0 rounded bg-white';
  public classShowTable: string = 'col-8 shadow p-0 rounded bg-white';

  private destroy$ = new Subject();
  public userLogged: User;
  public roleUser: number;

  public formMts: FormGroup;

  public medicalSheets: MtsDto[] = [];
  public specialists: User[] = [];
  public patients: PatientDto[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private mtsService: MtsService,
    private userService: UserService,
    private patientService: PatientService,
    private treatmentService: TreatmentService) {

  }

  calendarOptions: CalendarOptions = {
    plugins: [ dayGridPlugin,  ],/* interactionPlugin */
    initialView: 'dayGridMonth',
    themeSystem: 'standard',
    locale: esLocale,
    weekNumberCalculation: 'ISO',
    initialEvents: [],
    events: [
      { title: 'event 1', date: '2021-05-01' },
      { title: 'event 2', date: '2021-05-02' }
    ],
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventClick: this.handleDateClick.bind(this),
    select: this.handleDateClick.bind(this)
  };

  ngOnInit(): void {
    if (this.userService.userLogged != null) {
      this.userLogged = this.userService.userLogged;
    } else {
      this.userLogged = this.userService.getUserLocalStorage()
    }

    this.getRoleUserAndData();

    
  }

  public handleDateClick(arg) {
    console.log(arg)
  }

  public checkShowCalendar(event:any) {
    console.log(event)
    if (!event) {
      this.classShowCalendar = "col-8 shadow p-0 rounded bg-white d-none";
      this.classShowTable = "col-8 shadow p-0 rounded bg-white";
    } 
    else {
      this.classShowCalendar = "col-8 shadow p-0 rounded bg-white";
      this.classShowTable = "col-8 shadow p-0 rounded bg-white d-none";
    } 
    console.log(this.classShowCalendar)
    console.log(this.classShowTable)
  }

  private getRoleUserAndData() {


    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {
        this.roleUser = res;

        if (res === 1) {
          //superadmin
          this.getAllMts();
          this.getAllPAtients();
          this.getAllSpecialists();



        } else if (res === 2 ) {
          //admin / user
          this.getAllMtsByClinic();
          this.getAllPAtientsByClinic();
          this.getAllSpecialistsByClinic();


        }else if (res === 3) {
          //admin / user
          this.getAllMtsBySpecialist();
          this.getAllPAtientsByClinic();
          //this.getAllSpecialistsByClinic();


        } else {
          this.router.navigateByUrl('/login');
          console.log('[errorMtsComponent] get role user !=1 !=2 =!3');
        }


      }, error => {
        this.toast.error(JSON.stringify(error));
      });
  }

  private getAllMts() {
    this.mtsService.getAllMts().pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.medicalSheets = res;
        console.log('mts')
        console.log(this.medicalSheets)
      }
    );
  }

  private getAllMtsByClinic() {
    this.mtsService.getAllMtsByClinic(this.userLogged.clinicId)
    .pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.medicalSheets = res;
        console.log('mts')
        console.log(this.medicalSheets)
      }
    );
  }

  private getAllMtsBySpecialist() { 
    this.mtsService.getAllMtsBySpecialist(this.userLogged.id)
    .pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.medicalSheets = res;
        console.log('mts')
        console.log(this.medicalSheets)
      }
    );
  }

  private getAllSpecialists() {
    this.userService.getAllUsers().pipe(takeUntil(this.destroy$)).subscribe(
      (res: User[]) => {
        this.specialists = res;
        console.log('specialists')
        console.log(res)
      }
    );
  }

  private getAllSpecialistsByClinic() {
    this.userService.getAllUsersByClinicId(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: User[]) => {
          this.specialists = res;
          console.log('specialists')
          console.log(res)
        }
      );
  }


  private getAllPAtients() {
    this.patientService.getAllPatients()
      .pipe(takeUntil(this.destroy$)).subscribe(
        (patientsRes: PatientDto[]) => {
          this.patients = patientsRes;
          console.log('patients')
          console.log(patientsRes)
        }
      );
  }

  private getAllPAtientsByClinic() {
    this.patientService.getPatientsByClinic(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (patientsRes: PatientDto[]) => {
          this.patients = patientsRes;
          console.log('patients')
          console.log(patientsRes)
        }
      );
  }




  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
