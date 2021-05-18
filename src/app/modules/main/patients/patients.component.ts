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
import { UploadFileService } from '../../../services/upload-file.service';
import { PatientDto } from '../../../models/dto/patient/PatientDto';
import { CreatePatientDto } from '../../../models/dto/patient/CreatePatientDto';
import { ClinicDto } from '../../../models/dto/clinic/ClinicDto'
import { User } from 'src/app/models/entities/user-model';


@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  @ViewChild("modalDelete", { static: false }) modalDelete: TemplateRef<any>;
  @ViewChild("modalEdit", { static: false }) modalEdit: TemplateRef<any>;
  @ViewChild("modalCreate", { static: false }) modalCreate: TemplateRef<any>;

  private destroy$ = new Subject();

  public userLogged: User;

  public patients: PatientDto[] = [];
  public patientsAux: PatientDto[] = [];

  public clinics: ClinicDto[];

  public patientToUpdate: PatientDto = new PatientDto();
  public patientToCreate: CreatePatientDto = new CreatePatientDto();

  public file: File

  public roleUser: number;

  public uploadPhotoForm: FormGroup;

  public createPatientForm: FormGroup;
  public observableupdateCreateForm: Subscription = new Subscription();

  public imageSrc: string;
  public todayDate = '2020-07-22';

  public showButtonsForm: boolean = false;

  public textCreateUpdateModal: string;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private patientService: PatientService,
    private clinicService: ClinicService,
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
      reason: ['',Validators.required],
      email: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      homeAddress: ['', Validators.required],
      schoolName: ['', Validators.required],
      course: ['', Validators.required],
      paymentType: ['', Validators.required],
      clinicId: ['', Validators.required],
    });

  }

  public submitFormCreate() {
    console.log('send form!!!')
  }

  private inicializeFormCreate() {
    this.observableupdateCreateForm.unsubscribe();
    this.showButtonsForm = false;
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
    //??
    this.createPatientForm.controls['clinicId'].setValue(0);

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
            this.createPatientForm.controls['paymentType'].value != '' && this.createPatientForm.controls['paymentType'].value != null 
          ) {

          this.showButtonsForm = true;
        }
        else {
          this.showButtonsForm = false;
        }
      }
    );

  }

  ///////////////////////////////////////
  ///////////D O I N G///////////////////
  ///////////////////////////////////////
  public openModalCreatePatientNew() {
    console.log('OPEN MODAL CREATE')
    this.inicializeFormCreate();
    this.modalService.open(this.modalCreate).result.then(

      r => {
        if (r === '1') {
          console.log('confirma la creacion del paciente')

        } else {
          console.log('cancelar la creacion del paciente')
          //this.patientToCreate = new CreatePatientDto
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
          this.patientService.getAllPatients().pipe(takeUntil(this.destroy$)).subscribe(
            (patientsRes: PatientDto[]) => {
              this.patients = patientsRes;
              this.patientsAux = patientsRes;
            }
          );

          this.clinicService.getAllClinics().pipe(takeUntil(this.destroy$)).subscribe(
            (clinics: ClinicDto[]) => {
              this.clinics = clinics as ClinicDto[];
            }
          );


        } else if (res === 2 || res === 3) {
          //admin / user
          this.patientService.getPatientsByClinic(this.userLogged.clinicId)
            .pipe(takeUntil(this.destroy$)).subscribe(
              (patientsRes: PatientDto[]) => {
                this.patients = patientsRes;
                this.patientsAux = patientsRes;
              }
            );
        } else {
          this.router.navigateByUrl('/home');
          console.log('[errorPatientComponent] get role user !=1 !=2 =!3');
        }


      }, error => {
        this.toast.error(JSON.stringify(error));
      });
  }

  public deletePatient(id: number) {
    this.modalService.open(this.modalDelete).result.then(
      r => {
        if (r === 'Si') {
          this.patientService.deletePatient(id).pipe(takeUntil(this.destroy$)).subscribe(
            (res: any) => {
              this.patients.forEach(
                (item, index) => {
                  if (item.id === id) {
                    this.patients.splice(index, 1);
                    this.toast.success('Deleted patient', 'Successfully');
                  }  
                }
              );

                this.patientsAux.forEach(
                  (item, index) => {
                    if (item.id === id) this.patientsAux.splice(index, 1);
                  }
                )
            },
            (error) => {
              this.toast.error(error.error['message'], 'Error');
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

  public editPatient(patient: PatientDto, index: number) {

    let auxPatient = JSON.stringify(this.patients[index])


    this.patientToUpdate = this.patients[index];

    this.modalService.open(this.modalEdit).result.then(
      r => {
        if (r === '0') {

          console.log('response === 0')


          this.patientService.updatePatient(this.patientToUpdate).pipe(takeUntil(this.destroy$)).subscribe(
            (res: PatientDto) => {
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

            this.uploadFileService.uploadFilePatient(formData, this.patientToUpdate.id).pipe(takeUntil(this.destroy$)).subscribe(
              (resPhotoUrl) => {
                this.patients[index].urlPhoto = resPhotoUrl['url'];
                //this.toast.success('Update patient', 'Successfully');
                this.uploadPhotoForm.reset();
                this.imageSrc = ''

              },
              (error) => {
                console.log(error)
                this.toast.error('Error updating photo, try again', 'Error');
              }
            );

          } else { console.log('no se cambia la foto archivo') }



        } else {
          let patient = new PatientDto;
          patient = JSON.parse(auxPatient)
          console.log(patient)
          this.patients[index] = JSON.parse(auxPatient);
          this.imageSrc = ''
          console.log('no editar')
        }


      }, error => {
        console.log(error);
      }

      


    ); //modal
  }

  openModalCreatePatient() {
    this.showButtonsForm = true

    this.patientToCreate.dateOfBirth = new Date("2020-05-16");

    this.modalService.open(this.modalCreate).result.then(

      r => {
        if (r === '0') {

          if (this.checkPatientForm(this.patientToCreate)) {
            let newPatient = new CreatePatientDto
            newPatient.id = 0;
            newPatient.name = this.patientToCreate.name
            newPatient.surname = this.patientToCreate.surname
            newPatient.reason = this.patientToCreate.reason
            newPatient.phoneNumber = this.patientToCreate.phoneNumber
            newPatient.email = this.patientToCreate.email
            newPatient.dateOfBirth = this.patientToCreate.dateOfBirth
            newPatient.homeAddress = this.patientToCreate.homeAddress
            newPatient.schoolName = this.patientToCreate.schoolName
            newPatient.course = this.patientToCreate.course
            newPatient.paymentType = this.patientToCreate.paymentType
            newPatient.active = true;

            if (this.roleUser != 1)
              newPatient.clinicId = this.userLogged.clinicId
            else
              newPatient.clinicId = this.patientToCreate.clinicId//superadmin elige la clinica


            this.patientService.createPatient(newPatient).pipe(takeUntil(this.destroy$)).subscribe(
              resPatient => {
                this.patients.push(resPatient as PatientDto);
                //this.patientsAux.push(resPatient as PatientDto);
                this.toast.success('Create patient', 'Successfully');
                this.patientToCreate = new CreatePatientDto
              }
            );
          } else {
            this.toast.error('All fields is required', 'Error')
          }

        } else {
          console.log('cancelar la creacion del paciente')
          //this.patientToCreate = new CreatePatientDto
        }
      }, error => {
        console.log(error);
      }
    );
  }


  public findByName(param: string) {

    if (param.length === 0) {
      if (this.roleUser != 1) {
        this.patientService.getPatientsByClinic(this.userLogged.clinicId).pipe(takeUntil(this.destroy$)).subscribe(
          (res: PatientDto[]) => {
            this.patients = res
          }
        );
      } else {
        this.patientService.getAllPatients().pipe(takeUntil(this.destroy$)).pipe(takeUntil(this.destroy$)).subscribe(
          (res: PatientDto[]) => {
            this.patients = res
          }
        );
      }

    } else {

      this.patients.forEach(
        (p, index) => {
          if (!p.name.concat(' ').concat(p.surname).toUpperCase().includes(param.toUpperCase())) {
            this.patients.splice(index, 1);
          }
        })
    }

  }


  // Submit Form File
  uploadPhoto() {
    var formData: any = new FormData();
    formData.append("file", this.uploadPhotoForm.get('file').value);
    this.uploadFileService.uploadFilePatient(formData, this.patientToUpdate.id).subscribe(
      res => {
        console.log(res)
        this.patientToUpdate.urlPhoto = res['url']


        //BACKEND: org.apache.tomcat.util.http.fileupload.impl.SizeLimitExceededException: the request was rejected because its size (26099757) exceeds the configured maximum (10485760)
      })


  }

  onFileChange(event) {
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

  checkPatientForm(patient: CreatePatientDto): boolean {
    return patient.name != null && patient.name != '' && 
    patient.surname != null && patient.surname != '' &&
      patient.phoneNumber != null && patient.phoneNumber != '' &&
      patient.email != null && patient.email != '' &&
      patient.dateOfBirth != null && patient.dateOfBirth.toString() != '' &&
       patient.homeAddress != null && patient.homeAddress != '' &&
      patient.schoolName != null && patient.schoolName != '' &&
      patient.course != null && patient.course != '' &&
      patient.paymentType != null && patient.paymentType != '';

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
