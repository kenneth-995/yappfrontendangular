import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

import { UserService } from '../../../services/user.service';
import { PatientService } from '../../../services/patient.service';
import { ClinicService } from '../../../services/clinic.service';
import { UploadFileService } from '../../../services/upload-file.service';
import { PatientDto } from '../../../models/dto/patient/PatientDto';
import { CreatePatientDto } from '../../../models/dto/patient/CreatePatientDto';
import { ClinicDto } from '../../../models/dto/clinic/ClinicDto'
import { FormBuilder, FormGroup } from '@angular/forms';
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

  public patients: PatientDto[];
  public patientsAux: PatientDto[];

  public clinics: ClinicDto[];

  public patientToUpdate: PatientDto = new PatientDto();
  public patientToCreate: CreatePatientDto = new CreatePatientDto();

  public file: File

  public roleUser: number;

  public uploadForm: FormGroup;

  public imageSrc: string;

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
      console.log(this.userService.userLogged)
      this.userLogged = this.userService.getUserLocalStorage()
      console.log(this.userService.getUserLocalStorage())
      console.log(this.userLogged)
    }
    this.getRoleUserAndPatientsAndClinics()

    this.uploadForm = this.fb.group({
      file: null
    })

  }

  private getRoleUserAndPatientsAndClinics() {


    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {
        this.roleUser = res;

        if (res === 1) {
          //superadmin
          this.patientService.getAllPatients().pipe(takeUntil(this.destroy$)).subscribe(
            (patients: PatientDto[]) => {
              this.patients = patients;
              this.patientsAux = patients;
            }
          );
          //TODO: encadenar las 2 llamadas
          this.clinicService.getAllClinics().pipe(takeUntil(this.destroy$)).subscribe(
            (clinics: ClinicDto[]) => {
              this.clinics = clinics as ClinicDto[];
            }
          );


        } else if (res === 2 || res === 3) {
          //admin / user
          this.patientService.getPatientsByClinic(this.userLogged.clinicId)
            .pipe(takeUntil(this.destroy$)).subscribe(
              (patients: PatientDto[]) => {
                this.patients = patients;
                this.patientsAux = patients;
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
                  if (item.id === id)
                    this.patients.splice(index, 1);
                  this.toast.success('Deleted patient', 'Successfully');
                })
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

    //this.imageSrc = patient.urlPhoto;
    let aux = JSON.stringify(this.patients[index])


    this.patientToUpdate = this.patients[index];

    this.modalService.open(this.modalEdit).result.then(
      r => {
        if (r === '0') {

          var formData: any = new FormData();
          formData.append("file", this.uploadForm.get('file').value);

          this.patientService.updatePatient(this.patientToUpdate).pipe(
            takeUntil(this.destroy$),
            map((res: PatientDto) => {
              this.patients[index] = res;
            }),
            concatMap(() => this.uploadFileService.uploadFilePatient(formData, this.patientToUpdate.id))
          ).subscribe((resPhotoUrl) => {
            this.patients[index].urlPhoto = resPhotoUrl['url'];
          },
            (error) => {
              console.log('error')
              console.log(error.error)
              this.toast.error('Error updating patient, try again', 'Error');
            })


          /* this.patientService.updatePatient(this.patientToUpdate).subscribe(
            (res: PatientDto) => {
              this.patients[index] = res;
            },
            (error) => {
              this.toast.error(error.error['message'], 'Error');
            }
          );

          var formData: any = new FormData();
          formData.append("file", this.uploadForm.get('file').value);
          this.uploadFileService.uploadFilePatient(formData, this.patientToUpdate.id).subscribe(
            res => {
              console.log(res)
              this.patientToUpdate.urlPhoto = res['url']
            }) */

        } else {
          let patient = new PatientDto;
          patient = JSON.parse(aux)
          console.log(patient)
          this.patients[index] = JSON.parse(aux);
          this.imageSrc = ''
          console.log('no editar')
        }
      }, error => {
        console.log(error);
      }
    );
  }

  createPatient() {


    this.modalService.open(this.modalCreate).result.then(

      r => {
        if (r === '0') {
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
          //superadmin elige la clinica
          if (this.roleUser != 1)
            newPatient.clinicId = this.userLogged.clinicId
          else
            newPatient.clinicId = this.patientToCreate.clinicId


          this.patientService.createPatient(newPatient).subscribe(
            res => {
              console.log(res)
              console.log('helloooooo')
              this.patients.push(res as PatientDto);
            }
          );
          this.patientToCreate = new CreatePatientDto



        } else {

          console.log('cancelar')
        }
      }, error => {
        console.log(error);
      }
    );
  }


  public findByName(param: string) {
    if (param.length === 0) {
      return this.patients = this.patientsAux;
    }
    if (this.roleUser != 1)
      this.patientService.getPatientsByNameByClinic(this.userLogged.clinicId, param).subscribe(
        (res: PatientDto[]) => {
          this.patients = res
        }
      );
    else {
      this.patientService.getAllPatientsByName(param).subscribe(
        (res: PatientDto[]) => {
          this.patients = res
        }
      );

    }


  }


  // Submit Form File
  uploadPhoto() {
    var formData: any = new FormData();
    formData.append("file", this.uploadForm.get('file').value);
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
      this.uploadForm.get('file').setValue(file)


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
