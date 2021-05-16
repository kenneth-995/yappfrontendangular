import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
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
  public isCreated : boolean = true;

  public changeForm: boolean = false;

  public textModal: string = '';

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
      reason: [Validators.required],
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

  public createTreatment() {
    this.isCreated = true;
    this.textModal = 'Create'
    
    console.log('createTreatment()')
    //SET ALL FIELDS FORM TREATMENT
    this.inicializeForm();

    //VALIDATE FORM
    this.modalService.open(this.updateCreate).result.then(
      r => {
        if(r === '1') {
          // CONFIRM CREATE

          //VALIDAR MANUALMENTE EL FORMULARIO, NO SE VALIDA BIEN
          if (this.createUpdateForm.valid) {
            console.log('form valid, senr request')
          } else {
            console.log('form invalid, show toast')
          }
          console.log('CREATE')
          this.changeForm = false;

        } else {
          // ABORT CREATE
          console.log('ABORT CREATE')
          this.changeForm = false;
        }
        
        console.log(this.createUpdateForm.value)
      }

    );
  }

  public editTreatment(t: TreatmentDto, id: number) {
    console.log('UPDATETreatment()')
    this.isCreated = false;
    this.textModal = 'Update'
    
    //SET ALL FIELDS FORM BY SELECTED TREATMENT
    this.inicializeFormWithTreatment(t);

    //VALIDATE FORM
    this.modalService.open(this.updateCreate).result.then(
      r => {
        if(r === '1') {
          // CONFIRM UPDATE
          if (this.createUpdateForm.valid) {
            console.log('form valid, senr request')
          } else {
            console.log('form invalid, show toast')
          }

          console.log('CONFIRM EDITED')
          this.changeForm = false;

        } else {
          // ABORT UPDATE
          console.log('ABORT EDITED')
          this.changeForm = false;
        }
        
        console.log(this.createUpdateForm.value)
      }

    );
  }

  public deleteTreatment(id: number) {
    console.log('deleteTreatment()')
    this.modalService.open(this.modalDelete).result.then(
      r => {
        if (r === '1') { //si
          console.log('borrar')
          this.treatmentService.deleteTreatment(id).pipe(takeUntil(this.destroy$)).subscribe(
            () => {
              //delete in array frontend
              this.treatments.forEach(
                (item, index) => {
                  if (item.id === id) {
                    this.treatments.splice(index, 1);
                    this.toast.success('Deleted treatment', 'Successfully');
                  }   
              });
              //delete in array aux frontend
              this.treatmentsAux.forEach(
                (item, index) => {
                  if (item.id === id) this.treatmentsAux.splice(index, 1);
              });
            }
          );


        } else { console.log('no borrar') }
      }, error => {
        console.log(error);
      }
    );
  }

  inicializeForm() {
    this.createUpdateForm.controls['reason'].setValue(null);
    this.createUpdateForm.controls['sessionsFinished'].setValue(0);
    this.createUpdateForm.controls['startDate'].setValue(null);
    this.createUpdateForm.controls['active'].setValue(true);

    if (this.roleUser === 3) {
      this.createUpdateForm.controls['userId'].setValue(this.userLogged.id);
    } else {

    }
    this.createUpdateForm.controls['patientId'].setValue(0);

    this.createUpdateForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        console.log(field)
        this.changeForm = true;
      }
    );
    

  }

  inicializeFormWithTreatment(treatment: TreatmentDto) {
    this.createUpdateForm.controls['reason'].setValue(treatment.reason);
    this.createUpdateForm.controls['sessionsFinished'].setValue(treatment.sessionsFinished);
    this.createUpdateForm.controls['startDate'].setValue(treatment.startDate);
    this.createUpdateForm.controls['active'].setValue(true);
    this.createUpdateForm.controls['patientId'].setValue(treatment.patientId);
    this.createUpdateForm.controls['userId'].setValue(treatment.specialistId);

    this.createUpdateForm.valueChanges.subscribe(
      (field) => {
        console.log(field)
        this.changeForm = true;
      }
    );
  }

  checkFormTreatment():boolean {

    return null;
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
