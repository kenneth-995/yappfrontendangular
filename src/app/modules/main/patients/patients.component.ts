import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { pipe, Subject, Subscription } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../../../services/user.service';
import { PatientService } from '../../../services/patient.service';
import { ClinicService } from '../../../services/clinic.service';
import { TreatmentService } from '../../../services/treatment.service';
import { UploadFileService } from '../../../services/upload-file.service';

import { PatientDto } from '../../../models/dto/patient/PatientDto';
import { CreatePatientDto } from '../../../models/dto/patient/CreatePatientDto';
import { ClinicDto } from '../../../models/dto/clinic/ClinicDto'
import { User } from 'src/app/models/entities/user-model';
import { TreatmentDto } from 'src/app/models/dto/treatment/TreatmentDto';


@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  @ViewChild("modalDelete", { static: false }) modalDelete: TemplateRef<any>;
  @ViewChild("modalCreateEdit", { static: false }) modalCreateEdit: TemplateRef<any>;

  private destroy$ = new Subject();

  public userLogged: User;

  public patients: PatientDto[] = [];
  public patientsAux: PatientDto[] = [];
  public isPatients: boolean = false;

  public clinics: ClinicDto[] = [];
  public clinicIdParamSearch: number = 0; //[(ngModel)]
  public specialistIdParamSearch: number = 0; //[(ngModel)]
  public treatments: TreatmentDto[] = [];

  public specialists: User[] = [];

  public patientToUpdate: PatientDto = new PatientDto();
  public patientToCreate: CreatePatientDto = new CreatePatientDto();

  public file: File

  public roleUser: number;

  public uploadPhotoForm: FormGroup;
  public observableuploadPhotoForm: Subscription = new Subscription();

  public createPatientForm: FormGroup;
  public observableupdateCreateForm: Subscription = new Subscription();

  public imageSrc: string;

  public showButtonsForm: boolean = false;

  public textCreateUpdateModal: string;
  public isCreated: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private patientService: PatientService,
    private clinicService: ClinicService,
    private treatmentService: TreatmentService,
    private uploadFileService: UploadFileService) {

  }

  ngOnInit(): void {

    if (this.userService.userLogged != null) {
      this.userLogged = this.userService.userLogged;
    } else {
      console.log('[errorPatientComponent] user==null!');
      console.log(this.userService.userLogged) //null
      this.userLogged = this.userService.getUserLocalStorage()
      /* console.log(this.userService.getUserLocalStorage())
      console.log(this.userLogged) */
    }
    this.getRoleUserAndPatientsAndClinics()

    this.uploadPhotoForm = this.fb.group({
      file: null
    })

    this.createPatientForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      reason: ['', Validators.required],
      email: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      urlPhoto: [''],
      homeAddress: ['', Validators.required],
      schoolName: ['', Validators.required],
      course: ['', Validators.required],
      paymentType: ['', Validators.required],
      clinicId: ['', Validators.required],
    });

  }

  private inicializeFormCreate() {
    this.textCreateUpdateModal = 'Create ';
    this.observableupdateCreateForm.unsubscribe();
    this.showButtonsForm = false;
    this.isCreated = true;
    this.createPatientForm.reset();
    //set form
    this.createPatientForm.controls['name'].setValue('');
    this.createPatientForm.controls['surname'].setValue('');
    this.createPatientForm.controls['phoneNumber'].setValue('');
    this.createPatientForm.controls['reason'].setValue('');
    this.createPatientForm.controls['email'].setValue('');
    this.createPatientForm.controls['dateOfBirth'].setValue('');
    this.createPatientForm.controls['homeAddress'].setValue('');
    this.createPatientForm.controls['schoolName'].setValue('');
    this.createPatientForm.controls['course'].setValue('');
    this.createPatientForm.controls['paymentType'].setValue('');
    if (this.roleUser != 1) {
      this.createPatientForm.controls['clinicId'].setValue(this.userLogged.clinicId);
    } else {
      this.createPatientForm.controls['clinicId'].setValue(this.clinics[0].id);
    }

    this.observableupdateCreateForm = this.createPatientForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        console.log('createPatientForm subscriber')
        if (
          this.createPatientForm.valid &&
          this.createPatientForm.controls['name'].value != '' && this.createPatientForm.controls['name'].value != null &&
          this.createPatientForm.controls['surname'].value != '' && this.createPatientForm.controls['surname'].value != null &&
          this.createPatientForm.controls['phoneNumber'].value != '' && this.createPatientForm.controls['phoneNumber'].value != null &&
          this.createPatientForm.controls['reason'].value != '' && this.createPatientForm.controls['reason'].value != null &&
          this.createPatientForm.controls['email'].value != '' && this.createPatientForm.controls['email'].value != null &&
          this.createPatientForm.controls['dateOfBirth'].value != '' && this.createPatientForm.controls['dateOfBirth'].value != null &&
          this.createPatientForm.controls['homeAddress'].value != '' && this.createPatientForm.controls['homeAddress'].value != null &&
          this.createPatientForm.controls['schoolName'].value != '' && this.createPatientForm.controls['schoolName'].value != null &&
          this.createPatientForm.controls['course'].value != '' && this.createPatientForm.controls['course'].value != null &&
          this.createPatientForm.controls['paymentType'].value != '' && this.createPatientForm.controls['paymentType'].value != null &&
          this.createPatientForm.controls['clinicId'].value != 0 && this.createPatientForm.controls['clinicId'].value != null
        ) {

          this.showButtonsForm = true;
        }
        else {
          this.showButtonsForm = false;
        }
      }
    );

  }

  private inicializeFormEdit(patient: PatientDto, index: number) {
    this.observableupdateCreateForm.unsubscribe();
    this.observableuploadPhotoForm.unsubscribe();
    this.isCreated = false;
    this.showButtonsForm = false;
    this.createPatientForm.reset();
    this.textCreateUpdateModal = 'Update ';
    this.imageSrc = patient.urlPhoto;
    //set form
    this.createPatientForm.controls['name'].setValue(patient.name);
    this.createPatientForm.controls['surname'].setValue(patient.surname);
    this.createPatientForm.controls['phoneNumber'].setValue(patient.phoneNumber);
    this.createPatientForm.controls['reason'].setValue(patient.reason);
    this.createPatientForm.controls['email'].setValue(patient.email);
    this.createPatientForm.controls['dateOfBirth'].setValue(patient.dateOfBirth);
    this.createPatientForm.controls['homeAddress'].setValue(patient.homeAddress);
    this.createPatientForm.controls['schoolName'].setValue(patient.schoolName);
    this.createPatientForm.controls['course'].setValue(patient.course);
    this.createPatientForm.controls['paymentType'].setValue(patient.paymentType);
    this.createPatientForm.controls['clinicId'].setValue(patient.clinicId);
    this.createPatientForm.controls['urlPhoto'].setValue(patient.urlPhoto);

    //detect change in patient
    let _name = patient.name;
    let _surname = patient.surname;
    let _phoneNumber = patient.phoneNumber;
    let _reason = patient.reason;
    let _email = patient.email;
    let _dateOfBirth = patient.dateOfBirth;
    let _homeAddress = patient.homeAddress;
    let _schoolName = patient.schoolName;
    let _course = patient.course;
    let _paymentType = patient.paymentType;
    let _clinicId = patient.clinicId;

    this.observableupdateCreateForm = this.createPatientForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        console.log('createPatientForm subscriber')
        if (
          this.createPatientForm.valid && (
            this.createPatientForm.controls['name'].value != _name ||
            this.createPatientForm.controls['surname'].value != _surname ||
            this.createPatientForm.controls['phoneNumber'].value != _phoneNumber ||
            this.createPatientForm.controls['reason'].value != _reason ||
            this.createPatientForm.controls['email'].value != _email ||
            this.createPatientForm.controls['dateOfBirth'].value != _dateOfBirth ||
            this.createPatientForm.controls['homeAddress'].value != _homeAddress ||
            this.createPatientForm.controls['schoolName'].value != _schoolName ||
            this.createPatientForm.controls['course'].value != _course ||
            this.createPatientForm.controls['paymentType'].value != _paymentType ||
            (this.createPatientForm.controls['clinicId'].value != 0 && this.createPatientForm.controls['clinicId'].value != _clinicId))
        ) {
          console.log(this.uploadPhotoForm.get('file').value)
          console.log('form valid')
          console.log(this.createPatientForm.value)
          this.showButtonsForm = true;
        }
        else {
          console.log('form novalid')
          console.log(this.createPatientForm.value)
          this.showButtonsForm = false;
        }
      }
    );

    this.observableuploadPhotoForm = this.uploadPhotoForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        if (this.uploadPhotoForm.get('file').value != null) this.showButtonsForm = true;
        else this.showButtonsForm = false;

      }
    );
  }

  public openModalCreatePatientNew() {
    console.log('OPEN MODAL CREATE')
    this.inicializeFormCreate();
    this.modalService.open(this.modalCreateEdit).result.then(

      r => {
        if (r === '1') {

          console.log('confirma la creacion del paciente')
          console.log('this.createPatientForm.value')
          console.log(this.createPatientForm.value)
          this.createNewPatient(this.createPatientForm.value);

        } else {
          console.log('cancelar la creacion del paciente')
          this.createPatientForm.reset();
          this.uploadPhotoForm.reset();
          //this.patientToCreate = new CreatePatientDto
        }
      }, error => {
        console.log(error);
      }
    );
  }

  public openModalEditPatient(patient: PatientDto, index: number) {
    console.log('OPEN MODAL EDITED')
    this.inicializeFormEdit(patient, index);

    this.modalService.open(this.modalCreateEdit).result.then(

      r => {
        if (r === '1') {

          console.log('confirma la creacion del paciente')
          console.log('this.createPatientForm.value')
          console.log(this.createPatientForm.value)
          //this.editPatient(this.createPatientForm.value, index);

          this.patientService.updatePatient(this.createPatientForm.value, patient.id).pipe(takeUntil(this.destroy$)).subscribe(
            (res: PatientDto) => {
              console.log('res update patient')
              console.log(res)
              this.patients[index] = res;
              this.toast.success('Update patient', 'Successfully');
            }, error => {
              this.toast.error("Can't Update patient, try again", "Error")
            }
          );


          const archivo: File = this.uploadPhotoForm.get('file').value;
          if (archivo != null) {

            var formData: any = new FormData();
            formData.append("file", this.uploadPhotoForm.get('file').value);

            this.uploadFileService.uploadFilePatient(formData, patient.id).pipe(takeUntil(this.destroy$)).subscribe(
              (resPhotoUrl) => {
                this.patients[index].urlPhoto = resPhotoUrl['url'];
                //this.toast.success('Update patient', 'Successfully');
                this.uploadPhotoForm.reset();
                this.imageSrc = ''
                console.log('res resPhotoUrl patient')
                console.log(resPhotoUrl)

              },
              (error) => {
                console.log(error)
                this.toast.error('Error updating photo, try again', 'Error');
              }
            );

          } else { console.log('no se cambia la foto archivo') }





        } else {
          console.log('cancelar la creacion del paciente')
          /* this.uploadPhotoForm.reset();
          this.imageSrc = '' */


        }
      }, error => {
        console.log(error);
      }
    );
  }

  private getRoleUserAndPatientsAndClinics() {


    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {
        this.roleUser = res;

        if (res === 1) {
          //superadmin
          this.getAllPatients();

          this.getAllClinics();

          this.getAllTreatments();
          this.getAllSpecialists();

        } else if (res === 2 || res === 3) {
          //admin / user
          this.getAllPatientsByClinic();
          this.getTreatmentsByClinicId();
          this.getAllSpecialistsByClinic();

        } else {
          this.router.navigateByUrl('/home');
          console.log('[errorPatientComponent] get role user !=1 !=2 =!3 not posible');
        }


      }, (error) => { //error request
        this.toast.error(JSON.stringify(error));
      });
  }

  public deletePatient(id: number, idx: number) {
    this.modalService.open(this.modalDelete).result.then(
      r => {
        if (r === 'Si') {
          this.patientService.deletePatient(id).pipe(takeUntil(this.destroy$)).subscribe(
            (res: any) => {
              /* this.patients.forEach(
                (item, index) => {
                  if (item.id === id) {
                    console.log('patients')
                    console.log(item) */
              this.patients.splice(idx, 1);
              this.toast.success('The patient could not be deleted', 'Try again');
              this.isPatients = this.patients.length > 0;
              /* }  
            }
          ); */
            },
            (error) => {
              this.toast.warning(error.error['message'], 'Info');
              //this.toast.warning(error.error['message'], 'Error');
            }
          );//subscribe
        } else {
          console.log('no borrar')
        }
      }, error => {
        console.log(error);
      }
    );

  }

  public createNewPatient(newPatient) {
    this.patientService.createPatient(newPatient).pipe(takeUntil(this.destroy$)).subscribe(
      resPatient => {
        this.patients.push(resPatient as PatientDto);
        //this.patientsAux.push(resPatient as PatientDto);
        this.toast.success('Create patient', 'Successfully');
        this.patientToCreate = new CreatePatientDto
        this.createPatientForm.reset();
        this.isPatients = resPatient != null;
      }
    );
  }

  public findByParams(name: string, min: number, max: number) {
    this.patients = this.patientsAux;

    if (name) {
      console.log('name')
      this.patients = this.patients.filter(patient => patient.name.concat(patient.surname).toLowerCase().includes(name.toLowerCase()));
      this.patients.sort((a, b) => (a.name > b.name ? -1 : 1));
    }

    if (min && min >= 0 && min <= 100) {
      console.log('min')
      this.patients = this.patients.filter(patient => patient.age >= min);
      this.patients.sort((a, b) => (a.age > b.age ? -1 : 1));
    }

    if (max && max >= 0 && max <= 100) {
      console.log('max')
      this.patients = this.patients.filter(patient => patient.age <= max);
      this.patients.sort((a, b) => (a.age > b.age ? -1 : 1));
    }

    if (this.clinicIdParamSearch != 0) {
      console.log(this.patients)
      this.patients = this.patients.filter(patient => patient.clinicId == this.clinicIdParamSearch);
      console.log(this.patients)
      //this.patients.sort((a, b) => (a.name > b.name ? -1 : 1));
      console.log(this.clinicIdParamSearch)
    }

    if (this.specialistIdParamSearch != 0) {

      //FILTER TREATMENTS BY SPECIALIST
      const treatmentsBySpecialist = this.treatments.filter(t => t.specialistId == this.specialistIdParamSearch)

      const patientsFiltered : PatientDto[] = [];

      //FILTER PATIENTS BY TREATMENTS
      this.patients.forEach(p => {
        treatmentsBySpecialist.forEach(t => {
          if (t.patientId == p.id) patientsFiltered.push(p)
        });
      });
      //SET PATIENTS 
      this.patients = patientsFiltered;
    }

    this.isPatients = this.patients.length > 0
  }

  private getAllSpecialists() {
    this.userService.getAllUsers().pipe(takeUntil(this.destroy$)).subscribe(
      (res: User[]) => {
        this.specialists = res;
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

  private getAllPatients() {
    this.patientService.getAllPatients().pipe(takeUntil(this.destroy$)).subscribe(
      (patientsRes: PatientDto[]) => {
        this.patients = patientsRes;
        this.patientsAux = patientsRes;
        if (this.patients.length > 0) this.isPatients = true;
      }
    );
  }

  private getAllPatientsByClinic() {
    this.patientService.getPatientsByClinic(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (patientsRes: PatientDto[]) => {
          this.patients = patientsRes;
          this.patientsAux = patientsRes;
          if (this.patients.length > 0) this.isPatients = true;
        }
      );
  }

  private getAllClinics() {
    this.clinicService.getAllClinics().pipe(takeUntil(this.destroy$)).subscribe(
      (clinics: ClinicDto[]) => {
        this.clinics = clinics;
      }
    );
  }

  private getAllTreatments() {
    this.treatmentService.getAllTreatments().pipe(takeUntil(this.destroy$)).subscribe(
      (res: TreatmentDto[]) => {
        this.treatments = res;
      }
    );
  }

  private getTreatmentsByClinicId() {
    this.treatmentService.getAllTreatmentsByClinicId(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto[]) => {
          this.treatments = res;
        }
      );
  }

  private getAllTreatmentsBySpecialist() {
    this.treatmentService.getAllTreatmentsBySpecialistId(this.userLogged.id)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto[]) => {
          this.treatments = res;
        }
      );
  }

  // Submit Form File
  public uploadPhoto() {
    var formData: any = new FormData();
    formData.append("file", this.uploadPhotoForm.get('file').value);
    this.uploadFileService.uploadFilePatient(formData, this.patientToUpdate.id).subscribe(
      res => {
        console.log(res)
        this.patientToUpdate.urlPhoto = res['url']


        //BACKEND: org.apache.tomcat.util.http.fileupload.impl.SizeLimitExceededException: the request was rejected because its size (26099757) exceeds the configured maximum (10485760)
      })


  }

  //set form photo
  public onFileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      this.uploadPhotoForm.get('file').setValue(file)


      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imageSrc = reader.result as string;
      };


    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
