import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { pipe, Subject, Subscription } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { formatDate } from '@angular/common'
import { FullCalendarComponent, CalendarOptions } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
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
  @ViewChild("modalCreateEdit", { static: false }) modalCreateEdit: TemplateRef<any>;
  @ViewChild("modalInfo", { static: false }) modalInfo: TemplateRef<any>;
  public mtsModalInfo: MtsDto = new MtsDto;

  public showCalendar: boolean = true;
  public classShowCalendar: string = 'col-8 shadow p-0 rounded bg-white';
  public classShowTable: string = 'col-8 shadow p-0 rounded bg-white';

  private destroy$ = new Subject();
  public userLogged: User;
  public roleUser: number;

  public formMts: FormGroup;
  public observableForm: Subscription = new Subscription();
  public showButtonsForm: boolean = false;
  public isUpdateMts: boolean = false;
  public textCreateUpdateModal: string = '';


  public medicalSheets: MtsDto[] = [];
  public specialists: User[] = [];
  public patients: PatientDto[] = [];
  public treatments: TreatmentDto[] = [];

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
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    themeSystem: 'standard',
    locale: esLocale,
    timeZone: 'Europe/Madrid',

    headerToolbar: {
      left: 'prevcustom,nextcustom today',
      center: 'title',
      right: 'dayGridMonth dayGridWeek dayGridDay',
    },
    customButtons: {
      nextcustom: {
        icon: 'chevron-right',
        click: () => {
          this.calendarComponent.getApi().next();
        }
      },
      prevcustom: {
        icon: 'chevron-left',
        click: () => {
          this.calendarComponent.getApi().prev();

        }
      }
    },
    defaultAllDayEventDuration: 45,
    //defaultAllDay: false,
    weekNumberCalculation: 'ISO',
    initialEvents: [],
    events: [],
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventClick: this.handleDateClick.bind(this),
    select: this.handleEventClick.bind(this),
    eventTimeFormat: { hour: 'numeric', minute: '2-digit' },
    eventMouseEnter: this.over.bind(this),
    eventMouseLeave: this.desover.bind(this),

  };
  over(arg: any) {
    console.log("Mouseover called eventMouseEnter");
    //console.log(arg.event['_def'])
    console.log(arg.event['_def'].extendedProps)


    this.mtsModalInfo.clinicName = arg.event['_def'].extendedProps.clinicName;
    console.log(arg.event['_def'].extendedProps.clinicName)

    this.mtsModalInfo.date = arg.event['_def'].extendedProps.date;
    console.log(arg.event['_def'].extendedProps.date)


    this.mtsModalInfo.patientAge = arg.event['_def'].extendedProps.patientAge;
    console.log(arg.event['_def'].extendedProps.patientAge)

    this.mtsModalInfo.patientFullName = arg.event['_def'].extendedProps.patientFullName;
    console.log(arg.event['_def'].extendedProps.patientFullName)


    this.mtsModalInfo.patientPhoto = arg.event['_def'].extendedProps.patientPhoto;
    console.log(arg.event['_def'].extendedProps.patientPhoto)


    this.mtsModalInfo.reason = arg.event['_def'].extendedProps.reasonTratment;
    console.log(arg.event['_def'].extendedProps.reasonTratment)


    this.mtsModalInfo.specialistFullName = arg.event['_def'].extendedProps.specialistFullName;
    console.log(arg.event['_def'].extendedProps.specialistFullName)



    this.mtsModalInfo.specialistType = arg.event['_def'].extendedProps.specialistType;
    console.log(arg.event['_def'].extendedProps.specialistType)




    /* this.modalService.open(this.modalInfo).result.then(
      r => { 

      }
    ); */
  }

  desover(arg: any) {
    console.log("Mouseover called eventMouseLeave");
    console.log(arg.event['_def'])
    //this.modalService.dismissAll();
  }

  ngOnInit(): void {
    if (this.userService.userLogged != null) {
      this.userLogged = this.userService.userLogged;
    } else {
      this.userLogged = this.userService.getUserLocalStorage()
    }

    this.getRoleUserAndData();

    this.formMts = this.fb.group({
      id: ['', Validators.required],
      idx: ['', Validators.required],
      patientId: ['', Validators.required],
      specialistId: ['', Validators.required],
      treatmentId: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
    });


  }


  public handleDateClick(arg: any) {
    this.textCreateUpdateModal = 'Update '
    this.observableForm.unsubscribe();
    this.showButtonsForm = false;
    this.isUpdateMts = true;

    console.log('arg.event.extendedProps.idx ' + arg.event.extendedProps.idx)


    //set form
    let _date = new Date(arg.event.extendedProps.date)
    var _hour = _date.getHours().toString()
    var _minute = _date.getMinutes().toString()
    if (_hour.length === 1) _hour = '0' + _date.getHours().toString();
    if (_minute.length === 1) _minute = '0' + _date.getMinutes().toString()



    this.formMts.controls['id'].setValue(arg.event.id);
    this.formMts.controls['idx'].setValue(arg.event.extendedProps.idx);
    this.formMts.controls['date'].setValue(formatDate(_date, 'yyyy-MM-dd', 'en'));
    this.formMts.controls['time'].setValue(_hour + ':' + _minute);
    this.formMts.controls['patientId'].setValue(arg.event.extendedProps.patientId);
    this.formMts.controls['specialistId'].setValue(arg.event.extendedProps.specialistId);
    this.formMts.controls['treatmentId'].setValue(arg.event.extendedProps.treatmentId);

    console.log('this.formMts.controls[id]' + this.formMts.controls['id'].value)
    console.log('this.formMts.controls[idx]' + this.formMts.controls['idx'].value)

    //detect change in mts
    let __date = formatDate(_date, 'yyyy-MM-dd', 'en');
    let _time = _hour + ':' + _minute;
    let _patientId = arg.event.extendedProps.patientId;
    let _specialistId = arg.event.extendedProps.specialistId;
    let _treatmentId = arg.event.extendedProps.treatmentId;

    this.observableForm = this.formMts.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        if (this.formMts.controls['date'].value != formatDate(_date, 'yyyy-MM-dd', 'en') ||
          this.formMts.controls['time'].value != _time ||
          this.formMts.controls['patientId'].value != _patientId ||
          this.formMts.controls['specialistId'].value != _specialistId ||
          this.formMts.controls['treatmentId'].value != _treatmentId) {
          this.showButtonsForm = true;
        } else {
          this.showButtonsForm = false;
        }
      }
    );


    this.modalService.open(this.modalCreateEdit).result.then(

      r => {
        if (r === '1') {
          //send request
          console.log('confirma la modificacion')
          console.log(this.formMts.value)
          const dtoUpdate = new MtsCreateUpdateDto
          dtoUpdate.date = this.formMts.controls['date'].value + 'T' + this.formMts.controls['time'].value + ':00'; //for backend format time
          dtoUpdate.patientId = this.formMts.controls['patientId'].value
          dtoUpdate.specialistId = this.formMts.controls['specialistId'].value
          dtoUpdate.treatmentId = this.formMts.controls['treatmentId'].value
          console.log(dtoUpdate)
          this.mtsService.update(dtoUpdate, arg.event.id).pipe(takeUntil(this.destroy$)).subscribe(
            (res: MtsDto) => {
              console.log(res)
              //TODO: updatear el calendario y el array
              this.medicalSheets[arg.event.extendedProps.idx] = res
              this.calendarComponent.getApi().getEventById(arg.event.id).remove();
              this.loadEventMtsInCalendar(res);
              this.toast.success('Updated Medical Sheet', 'Successfully');
            }
          );



        } else {
          console.log('cancelar la modificacion')
          this.formMts.reset();
        }

      }, error => {
        console.log(error); //no es un error, se ha cerrado el modal porque se ha borrado la mts!
      }
    );

  }

  public handleEventClick(arg: any) {

    if (this.treatments.length>0) {
      this.textCreateUpdateModal = 'Create '
      this.showButtonsForm = true;
      this.isUpdateMts = false;
  
      console.log(arg.start)
  
      let _date = new Date(arg.start)
  
      this.formMts.controls['date'].setValue(formatDate(_date, 'yyyy-MM-dd', 'en'));
      this.formMts.controls['time'].setValue('17:00');
      this.formMts.controls['specialistId'].setValue(this.userLogged.id);
  
      if (this.roleUser === 3) {
        this.formMts.controls['specialistId'].disabled;
      }
      this.formMts.controls['patientId'].setValue(this.patients[0].id);
  
      this.formMts.controls['treatmentId'].setValue(this.treatments[0].id);
  
      this.modalService.open(this.modalCreateEdit).result.then(
  
        r => {
          if (r === '1') {
            console.log('confirma la creacion')
            console.log(this.formMts.value)
            const dtoCreate = new MtsCreateUpdateDto
            dtoCreate.date = this.formMts.controls['date'].value + 'T' + this.formMts.controls['time'].value + ':00'; //for backend format time
            dtoCreate.patientId = this.formMts.controls['patientId'].value
            dtoCreate.specialistId = this.formMts.controls['specialistId'].value
            dtoCreate.treatmentId = this.formMts.controls['treatmentId'].value
            console.log(dtoCreate)
            this.mtsService.create(dtoCreate).pipe(takeUntil(this.destroy$)).subscribe(
              (res: MtsDto) => {
                console.log(res)
                //TODO: updatear el calendario
                this.medicalSheets.push(res);
                //TODO:  y el array
                this.loadEventMtsInCalendar(res);
                this.toast.success('Created Medical Sheet', 'Successfully');
  
              }
            );
          } else {
            console.log('cancelar la creacion')
            this.formMts.reset();
  
          }
        }, error => {
          console.log(error);
        }
      );
    } else {
      this.toast.info('You need to insert treatments to be able to insert a medical technical sheet')
    }



  }

  public checkShowCalendar(event: any) {
    console.log(event)
    if (event) {
      this.loadEventsMtsInCalendar(this.medicalSheets)
      setTimeout(() => {
        console.log('fin contador')
      }, 3000);

    }
    else {

    }

  }

  private loadEventsMtsInCalendar(medicalSheets: MtsDto[]) {
    medicalSheets.forEach((mts, index) => {
      this.calendarComponent.getApi().addEvent({
        id: mts.id.toString(),
        groupId: mts.clinicId.toString(),
        title: `h Cita con ${mts.patientFullName}`,
        date: mts.date.toString(),/* 
        start: mts.date.toString(),
        end:  mts.date.toString(), */

        eventColor: '#1E1E83',
        eventBackgroundColor: '#26E86F',
        backgroundColor: '#ED1317',
        editable: true,
        extendedProps: {
          date: mts.date.toString(),
          patientId: mts.patientId,
          patientFullName: mts.patientFullName,
          patientAge: mts.patientAge,
          patientPhone: mts.patientPhone,
          patientPhoto: mts.patientPhoto,

          specialistId: mts.specialistId,
          specialistFullName: mts.specialistFullName,
          specialistType: mts.specialistType,

          treatmentId: mts.treatmentId,
          reasonTratment: mts.reason,

          clinicId: mts.clinicId,
          clinicName: mts.clinicName,

          idx: index.toString()
        }

      })
      console.log(index)
    });
  }

  private loadEventMtsInCalendar(mts: MtsDto) {
    this.calendarComponent.getApi().addEvent({
      id: mts.id.toString(),
      groupId: mts.clinicId.toString(),
      title: `h Cita con ${mts.patientFullName}`,
      date: mts.date.toString(),/* 
      start: mts.date.toString(),
      end:  mts.date.toString(), */

      eventColor: '#1E1E83',
      eventBackgroundColor: '#26E86F',
      backgroundColor: '#ED1317',
      editable: true,
      extendedProps: {
        date: mts.date.toString(),
        patientId: mts.patientId,
        patientFullName: mts.patientFullName,
        patientAge: mts.patientAge,
        patientPhone: mts.patientPhone,
        patientPhoto: mts.patientPhoto,

        specialistId: mts.specialistId,
        specialistFullName: mts.specialistFullName,
        specialistType: mts.specialistType,

        treatmentId: mts.treatmentId,
        reasonTratment: mts.reason,

        clinicId: mts.clinicId,
        clinicName: mts.clinicName,

        idx: this.medicalSheets.length - 1
      }

    })
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
          this.getAllTreatments();


        } else if (res === 2) {
          //admin / user
          this.getAllMtsByClinic();
          this.getAllPAtientsByClinic();
          this.getAllSpecialistsByClinic();
          this.getTreatmentsByClinicId();


        } else if (res === 3) {
          //admin / user
          this.getAllMtsBySpecialist();
          this.getAllPAtientsByClinic();
          this.getAllTreatmentsBySpecialist();
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
        this.loadEventsMtsInCalendar(this.medicalSheets);
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
          this.loadEventsMtsInCalendar(this.medicalSheets);
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
          this.loadEventsMtsInCalendar(this.medicalSheets);
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

  private getAllTreatments() {
    this.treatmentService.getAllTreatments().pipe(takeUntil(this.destroy$)).subscribe(
      (res: TreatmentDto[]) => {
        this.treatments = res;
        console.log(res)
      }
    );
  }

  private getTreatmentsByClinicId() {
    this.treatmentService.getAllTreatmentsByClinicId(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto[]) => {
          this.treatments = res;
          console.log(res)
        }
      );
  }

  private getAllTreatmentsBySpecialist() {
    this.treatmentService.getAllTreatmentsBySpecialistId(this.userLogged.id)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto[]) => {
          this.treatments = res;
          console.log(res)
        }
      );
  }

  public deleteMts() {
    let id = this.formMts.controls['id'].value
    let idx = this.formMts.controls['idx'].value
    console.log('id ' + id)
    console.log('idx: ' + idx)

    this.mtsService.detele(id).pipe(takeUntil(this.destroy$)).subscribe(
      () => {
        this.calendarComponent.getApi().getEventById(id.toString()).remove();
        this.medicalSheets.splice(idx, 1);
        this.modalService.dismissAll(); //cerramos el modal de update
        this.toast.success('Delete medical sheet', 'Successfully')

      }
    );
  }

  public deleteMtsTable(id: number, idx: number) {
    this.mtsService.detele(id).pipe(takeUntil(this.destroy$)).subscribe(
      () => {
        this.calendarComponent.getApi().getEventById(id.toString()).remove();
        this.medicalSheets.splice(idx, 1);
        this.toast.success('Delete medical sheet', 'Successfully')
      }
    );
  }



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
