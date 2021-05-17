import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../../../services/user.service';
import { User } from 'src/app/models/entities/user-model';

import { TreatmentService } from '../../../services/treatment.service';
import { TreatmentDto } from '../../../models/dto/treatment/TreatmentDto';
import { CreateUpdateTreatmentDto } from '../../../models/dto/treatment/CreateUpdateTreatmentDto';

import { PatientService } from '../../../services/patient.service';
import { PatientDto } from '../../../models/dto/patient/PatientDto';


@Component({
  selector: 'app-treatment',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.css']
})
export class TreatmentComponent implements OnInit {
  @ViewChild("updateCreate", { static: false }) updateCreate: TemplateRef<any>;
  @ViewChild("modalDelete", { static: false }) modalDelete: TemplateRef<any>;
  private destroy$ = new Subject();

  public userLogged: User;
  public roleUser: number;

  public treatments: TreatmentDto[] = [];
  public treatmentsAux: TreatmentDto[] = [];

  public patients: PatientDto[] = [];

  public specialists: User[] = [];

  public createUpdateForm: FormGroup;

  public showButtonsForm: boolean = false;

  public textModal: string = '';


  public observableCreateUpdateForm: Subscription = new Subscription();

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private treatmentService: TreatmentService,
    private patientService: PatientService,) { }


  ngOnInit(): void {
    console.log('hello treatments component ngOnInit()')
    if (this.userService.userLogged != null) {
      this.userLogged = this.userService.userLogged;
    } else {
      this.userLogged = this.userService.getUserLocalStorage()
    }

    this.getData();

    this.createUpdateForm = this.formBuilder.group({
      reason: ['', Validators.required],
      sessionsFinished: [Validators.required],
      startDate: [Validators.required],
      active: [Validators.required],
      patientId: [Validators.required],
      userId: [Validators.required],
    });


  }

  getData() {
    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {
        this.roleUser = res;
        if (res === 1) {
          console.log('role superadmin')
          this.getAllTreatments();
          this.getAllUsers();
          this.getAllPatients();

        } else if (res === 2) {
          console.log('role admin')
          this.getTreatmentsByClinicId();
          this.getUsersByClinicId();
          this.getAllPatientsByClinicId();

        } else if (res === 3) {
          console.log('role user')
          this.getAllTreatmentsBySpecialist();
          this.getAllPatientsByClinicId();
          //no get all users! only user logged!!
          this.specialists.push(this.userLogged)

        } else {
          this.router.navigateByUrl('/login');
          this.userService.logout();
          console.log('[TreatmentComponent error] get role user !=1 !=2 =!3');
        }
      }
    );
  }


  getAllTreatments() {
    this.treatmentService.getAllTreatments().pipe(takeUntil(this.destroy$)).subscribe(
      (res: TreatmentDto[]) => {
        this.treatments = res;
        this.treatmentsAux = res;
        console.log(res)
      }
    );
  }


  getTreatmentsByClinicId() {
    this.treatmentService.getAllTreatmentsByClinicId(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto[]) => {
          this.treatments = res;
          this.treatmentsAux = res;
          console.log(res)
        }
      );
  }


  getAllTreatmentsBySpecialist() {
    this.treatmentService.getAllTreatmentsBySpecialistId(this.userLogged.id)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto[]) => {
          this.treatments = res;
          this.treatmentsAux = res;
          console.log(res)
        }
      );
  }


  getAllUsers() {
    this.userService.getAllUsers().pipe(takeUntil(this.destroy$)).subscribe(
      (res: User[]) => {
        this.specialists = res;
        console.log(res)
      }
    );
  }


  getUsersByClinicId() {
    this.userService.getAllUsersByClinicId(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: User[]) => {
          this.specialists = res;
          console.log(res)
        }
      );
  }


  getAllPatients() {
    this.patientService.getAllPatients().pipe(takeUntil(this.destroy$)).subscribe(
      (patientsRes: PatientDto[]) => {
        console.log(patientsRes)
        this.patients = patientsRes;
      }
    );
  }


  getAllPatientsByClinicId() {
    this.patientService.getPatientsByClinic(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (patientsRes: PatientDto[]) => {
          console.log(patientsRes)
          this.patients = patientsRes;
        }
      );
  }

  public openModalCreate() {
    this.textModal = 'Create'

    console.log('openModalCreate()')
    //SET ALL FIELDS FORM TREATMENT
    this.inicializeNewFormTreatment();



    //VALIDATE FORM
    this.modalService.open(this.updateCreate).result.then(
      r => {
        if (r === '1') {
          // CONFIRM CREATE


          if (this.createUpdateForm.valid) {
            this.createTreatment(this.createUpdateForm.value)
          } else {
            this.openModalCreate(); //todo: no eliminar los datos que ya ha introducido!
            this.toast.warning('All fields is required', 'Warning')
          }

        } else {
          this.createUpdateForm.reset();
          console.log('ABORT CREATE')
          this.showButtonsForm = false;
        }

      }

    );
  }

  public openModalEdit(t: TreatmentDto, idx: number) {
    console.log('UPDATETreatment()')
    console.log('treatmentId: ' + idx)
    this.textModal = 'Update'

    //SET ALL FIELDS FORM BY SELECTED TREATMENT
    this.inicializeFormWithTreatment(t);

    //VALIDATE FORM
    this.modalService.open(this.updateCreate).result.then(
      r => {
        if (r === '1') {
          // CONFIRM UPDATE
          if (this.createUpdateForm.valid) {

            this.updateTreatment(this.createUpdateForm.value, t.id, idx);

          } else {
            this.toast.warning('All fields is required', 'Warning')
          }

          this.showButtonsForm = false;

        } else {
          // ABORT UPDATE
          console.log('ABORT EDITED')
          //TODO: not work hide buttons 'edit' 'cancel'
          this.showButtonsForm = false;
          this.createUpdateForm.reset();
        }
        this.showButtonsForm = false;
        console.log(this.createUpdateForm.value)
      }

    );
  }

  inicializeNewFormTreatment() {
    this.observableCreateUpdateForm.unsubscribe();
    this.createUpdateForm.reset();

    this.createUpdateForm.controls['sessionsFinished'].setValue(0);

    this.createUpdateForm.controls['userId'].setValue(this.userLogged.id);
    this.createUpdateForm.controls['startDate'].setValue('');

    if (this.roleUser === 3) {
      this.createUpdateForm.controls['userId'].disable();
    } 

    


    this.observableCreateUpdateForm = this.createUpdateForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        console.log('inicializeNewFormTreatment subscriber')
        if (this.createUpdateForm.controls['reason'].value != '' &&
            this.createUpdateForm.controls['startDate'].value != '' &&
            this.createUpdateForm.controls['userId'].value != 0 &&
            this.createUpdateForm.controls['patientId'].value != 0) {
          
            this.showButtonsForm = true;
        }
        else {
          this.showButtonsForm = false;
        }
        
      }
    );


  }

  inicializeFormWithTreatment(treatment: TreatmentDto) {
    this.observableCreateUpdateForm.unsubscribe();
    //TODO: not work hide buttons 'edit' 'cancel'
    this.showButtonsForm = false;

    this.createUpdateForm.reset();

    let _reason = treatment.reason;
    let _sessionsFinished = treatment.sessionsFinished;
    let _startDate = treatment.startDate;
    let _active = true;
    let _patientId = treatment.patientId;
    let _specialistId = treatment.specialistId;


    this.createUpdateForm.controls['reason'].setValue(treatment.reason);
    this.createUpdateForm.controls['sessionsFinished'].setValue(treatment.sessionsFinished);
    this.createUpdateForm.controls['startDate'].setValue(treatment.startDate);
    this.createUpdateForm.controls['active'].setValue(true);
    console.log('treatment.patientId')
    console.log(treatment.patientId)
    this.createUpdateForm.controls['patientId'].setValue(treatment.patientId);

    this.createUpdateForm.controls['userId'].setValue(treatment.specialistId);
    console.log('treatment.specialistId')
    console.log(treatment.specialistId)

    if (this.roleUser === 3) {
      this.createUpdateForm.controls['userId'].disable();
    }
    

    //instanciar 
    this.observableCreateUpdateForm =  this.createUpdateForm.valueChanges.subscribe(
      (field) => {
        console.log('inicializeFormWithTreatment subscriber')
        /* if (this.createUpdateForm.valid) this.showButtonsForm = true;
        else this.showButtonsForm = false; */
        if (this.createUpdateForm.valid &&
          _reason != this.createUpdateForm.controls['reason'].value ||
          _sessionsFinished != this.createUpdateForm.controls['sessionsFinished'].value ||
          _startDate != this.createUpdateForm.controls['startDate'].value ||
          _active != this.createUpdateForm.controls['active'].value ||
          _patientId != this.createUpdateForm.controls['patientId'].value ||
          _specialistId != this.createUpdateForm.controls['userId'].value) {
          this.showButtonsForm = true;
        } else {
          this.showButtonsForm = false;
        }

      }
    );
  }


  createTreatment(form: CreateUpdateTreatmentDto) {
    //pipe() es para encadenar operadores observables 
    //subscribe() para activar los observables y escuchar los valores emitidos.
    this.treatmentService.insertTreatment(form)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto) => {
          console.log(res)
          this.treatments.push(res);
          this.toast.success('Create Treatment ', 'Successfuly')
        }
      );
  }

  updateTreatment(form: CreateUpdateTreatmentDto, id: number, idx: number) {
    this.treatmentService.updateTreatment(form, id)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto) => {
          this.treatments[idx] = res // update treatment in frontend
          this.toast.success('Update treatment', 'Successfully')
        }
      );
  }


  public openModalDelete(treatment: TreatmentDto, idx: number) {

    this.modalService.open(this.modalDelete).result.then(
      r => {
        if (r === '1') { //si
          //console.log('confirmacion borrar')
          this.treatmentService.deleteTreatment(treatment.id).pipe(takeUntil(this.destroy$)).subscribe(
            (res) => {
              //delete in array frontend
              //console.log(res)
              this.treatments.splice(idx, 1);
              console.log('this.treatments')
              console.log(this.treatments)
              console.log('treatmentsAux')
              console.log(this.treatmentsAux)
              this.toast.success('Treatment deleted', 'Successfully');
              //this.treatmentsAux.splice(idx, 1)


            }
          );


        } else { console.log('desconfirmacion borrar') }
      }, error => {
        console.log(error);
      }
    );
  }




  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
