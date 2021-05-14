import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from '../../../services/user.service';
import { PatientService } from '../../../services/patient.service';
import { ClinicService } from '../../../services/clinic.service';
import { UploadFileService } from '../../../services/upload-file.service';
import { PatientDto } from '../../../models/dto/PatientDto';
import { CreatePatientDto } from '../../../models/dto/CreatePatientDto';
import { ClinicDto } from '../../../models/dto/ClinicDto'
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

  public userLogged : User;

  public patients: PatientDto[];

  public clinics: ClinicDto[];

  public patientToUpdate: PatientDto = new PatientDto();
  public patientToCreate: CreatePatientDto = new CreatePatientDto();

  public file: File
  //public imageSrc: string;

  public roleUser: number;

  public uploadForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private patientService: PatientService,
    private clinicService: ClinicService,
    private uploadFileService: UploadFileService,
    private toast: ToastrService,
    private modalService: NgbModal) {

    this.uploadForm = this.fb.group({
      file: null
    })
  }

  ngOnInit(): void {

    if (this.userService.getUserLogged != null) {
      console.log('this.userService.userLogged')
      console.log(this.userService.userLogged)
      this.userLogged = this.userService.userLogged;

      console.log('this.userLogged')
      console.log(this.userLogged)


      this.getRoleUserAndPatients()

    } else {
      console.log('[errorPatientComponent] user==null!');
    }


  }

  private getRoleUserAndPatients() {

    
    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {

        if (res === 1) {
          //superadmin
          this.patientService.getAllPatients().subscribe(
            (res: PatientDto[]) => {
              this.patients = res;
            }
          );
          
          this.clinicService.getAllClinics().subscribe(
            (ress: ClinicDto[])=> {
              this.clinics = ress as ClinicDto[];
            }
          );


        } else if (res === 2 || res === 3) {
          //admin / user
          this.patientService.getPatientsByClinic(this.userService.userLogged.clinicId).subscribe(
            (res: PatientDto[]) => {
              this.patients = res;
            }
          );
        } else {
          console.log('[errorPatientComponent] get role user !=1 !=2 =!3');
        }

        this.roleUser = res as number;
      }, error => {
        this.toast.error(JSON.stringify(error));
      });
  }

  public deletePatient(id: number) {
    this.modalService.open(this.modalDelete).result.then(
      r => {
        if (r === 'Si') {
          this.patientService.deletePatient(id).subscribe(
            (res: any) => {
              this.patients.forEach(
                (item, index) => {
                  if (item.id === id)
                    this.patients.splice(index, 1);
                    this.toast.error('Deleted patient', 'Successfully');
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

          this.patientService.updatePatient(this.patientToUpdate).subscribe(
            (res: PatientDto) => {
              this.patients[index] = res;
            },
            (error) => {
              this.toast.error(error.error['message'], 'Error');
            }
          );

          
        } else {
          this.patients[index] = JSON.parse(aux);
          console.log('no editar')
        }
      }, error => {
        console.log(error);
      }
    );
  }

  createPatient() {
    let newPatient = new CreatePatientDto
    newPatient.id = null;
    newPatient.name = 'new patient'
    newPatient.surname = 'new surname'
    newPatient.reason = 'new reason'
    newPatient.phoneNumber = '650190003'
    newPatient.email = 'email@email.com'
    newPatient.dateOfBirth = '2000-10-10'
    newPatient.homeAddress = 'calle lalala'
    newPatient.schoolName = 'Salvador Espriu'
    newPatient.course = '4 ESO'
    newPatient.paymentType = 'payment Type'
    newPatient.active = true;
    newPatient.clinicId = 4

    this.modalService.open(this.modalCreate).result.then(
      
      r => {
        if (r === '0') {
          this.patientService.createPatient(newPatient).subscribe(
            res => {
              console.log(res)
              console.log('helloooooo')
              this.patients.push(res as PatientDto);
            }
          );
          

          
        } else {
          
          console.log('cancelar')
        }
      }, error => {
        console.log(error);
      }
    );
  }
  


  // Submit Form File
  submitForm() {
    //console.log(this.uploadForm.get('file').value)
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
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      this.uploadForm.get('file').setValue(file)
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
