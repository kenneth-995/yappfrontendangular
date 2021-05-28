import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { pipe, Subject, Subscription } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from 'src/app/services/user.service';
import { ClinicService } from 'src/app/services/clinic.service';
import { UploadFileService } from 'src/app/services/upload-file.service';

import { ClinicDto } from 'src/app/models/dto/clinic/ClinicDto'
import { UpdateCreateClinicDto } from 'src/app/models/dto/clinic/UpdateCreateClinicDto'

import { User } from 'src/app/models/entities/user-model';

@Component({
  selector: 'app-clinic',
  templateUrl: './clinics.component.html',
  styleUrls: ['./clinics.component.css']
})
export class ClinicsComponent implements OnInit {
  @ViewChild("modalDelete", { static: false }) modalDelete: TemplateRef<any>;
  @ViewChild("modalCreateEdit", { static: false }) modalCreateEdit: TemplateRef<any>;

  private destroy$ = new Subject();

  public userLogged: User;
  public roleUser: number;

  public clinics: ClinicDto[];

  public file: File
  
  public uploadPhotoForm: FormGroup;
  public observableuploadPhotoForm: Subscription = new Subscription();

  public createUpdateForm: FormGroup;
  public observablecreateUpdateForm: Subscription = new Subscription();

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
    private clinicService: ClinicService,
    private uploadFileService: UploadFileService) {

  }

  ngOnInit(): void {

    if (this.userService.userLogged != null) {
      this.userLogged = this.userService.userLogged;
    } else {
      console.log('[errorPatientComponent] user==null!');
      console.log(this.userService.userLogged) //null if refresh browser
      this.userLogged = this.userService.getUserLocalStorage()
    }

    this.getData();
    

    this.uploadPhotoForm = this.fb.group({
      file: null
    })

    this.createUpdateForm = this.fb.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      address: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['',Validators.required],
    });
  }

  getData() {

    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {
        this.roleUser = res;
        if (res === 1) {
          console.log('role superadmin')
          this.getAllClinics();

        } else if (res === 2 ||res === 3) {
          console.log('role admin or user no deveria estar aqui')
          //this.getClinic();

        } else {
          this.router.navigateByUrl('/login');
          this.userService.logout();
          console.log('[ClinicComponent error] get role user !=1 !=2 =!3');
        }
      }
    );

  }

  private inicializeFormCreate() {
    this.textCreateUpdateModal = 'Create ';
    this.observablecreateUpdateForm.unsubscribe();
    this.showButtonsForm = false;
    this.isCreated = true;
    this.createUpdateForm.reset();
    //set form
    this.createUpdateForm.controls['id'].setValue(0);
    this.createUpdateForm.controls['name'].setValue('');
    this.createUpdateForm.controls['address'].setValue('');
    this.createUpdateForm.controls['phoneNumber'].setValue('');
    this.createUpdateForm.controls['email'].setValue('');
        

    this.observablecreateUpdateForm = this.createUpdateForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        console.log('createPatientForm subscriber')
        if (
            this.createUpdateForm.valid &&
            this.createUpdateForm.controls['name'].value != '' && this.createUpdateForm.controls['name'].value != null &&
            this.createUpdateForm.controls['address'].value != '' && this.createUpdateForm.controls['address'].value != null &&
            this.createUpdateForm.controls['phoneNumber'].value != '' && this.createUpdateForm.controls['phoneNumber'].value != null &&
            this.createUpdateForm.controls['email'].value != '' && this.createUpdateForm.controls['email'].value != null 
          ) {

          this.showButtonsForm = true;
        }
        else {
          this.showButtonsForm = false;
        }
      }
    );
  }

  private inicializeFormEdit(clinic: ClinicDto, index: number){
    this.observableuploadPhotoForm.unsubscribe();
    this.observablecreateUpdateForm.unsubscribe();

    this.isCreated = false;
    this.showButtonsForm = false;
    this.createUpdateForm.reset();
    this.uploadPhotoForm.reset();
    this.textCreateUpdateModal = 'Update ';
    this.imageSrc = clinic.photo;


    //set form data
    this.createUpdateForm.controls['id'].setValue(clinic.id);
    this.createUpdateForm.controls['name'].setValue(clinic.name);
    this.createUpdateForm.controls['address'].setValue(clinic.address);
    this.createUpdateForm.controls['phoneNumber'].setValue(clinic.phoneNumber);
    this.createUpdateForm.controls['email'].setValue(clinic.email);
    

    //detect change in patient
    let _name= clinic.name;
    let _address= clinic.address;
    let _phoneNumber= clinic.phoneNumber;
    let _email= clinic.email;


    this.observablecreateUpdateForm = this.createUpdateForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        console.log('createClinicFormFOTO subscriber')
        if (
            this.createUpdateForm.controls['name'].value != _name || 
            this.createUpdateForm.controls['address'].value != _address || 
            this.createUpdateForm.controls['phoneNumber'].value != _phoneNumber || 
            this.createUpdateForm.controls['email'].value != _email /* || 
            (this.uploadPhotoForm.get('file').value != null) */
          ) {
            console.log( this.uploadPhotoForm.get('file').value)
            console.log('form valid')
            console.log(this.uploadPhotoForm.value)
            this.showButtonsForm = true;
        }
        else {
          console.log('form novalid')
            console.log(this.uploadPhotoForm.value)
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

  public openModalCreateClinic() {
    this.inicializeFormCreate();
    this.modalService.open(this.modalCreateEdit).result.then(
      r => {
        if (r === '1') {
          console.log('CONFIRM CREATE')
          this.createClinic(this.createUpdateForm.value);
        } else {
          console.log('CANCEL CREATE')
        }
      }
    );


  }

  public openModalEditClinic(clinic:ClinicDto, idx:number) {
    //INICIALIZE FORM
    this.inicializeFormEdit(clinic, idx);
    console.log(clinic)
    //OPEN MODAL
    this.modalService.open(this.modalCreateEdit).result.then(
      r => {
        if (r === '1') {
          console.log('CONFIRM EDITED')
          this.updateClinic(this.createUpdateForm.value, idx);

          if (this.uploadPhotoForm.get('file').value != null) {
            this.updatePhotoClinic(clinic, idx);
          }

        } else {
          console.log('CANCEL EDITED')
        }
      }
    );
  }

  public openModalDeleteClinic(id:number, idx:number) {
    this.modalService.open(this.modalDelete).result.then(
      r => {
        if (r === '1') {
          console.log('CONFIRM DELETE')
          this.deteleClinic(id, idx)
        } else {
          console.log('DISCARD DELETE')
        }
      }
    );
  }

  private getAllClinics() {
    this.clinicService.getAllClinics().pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.clinics = res;
      }
    );
  }

  private updateClinic(clinic: UpdateCreateClinicDto, idx:number) {
    console.log(clinic)
    this.clinicService.updateClinic(clinic, clinic.id).pipe(takeUntil(this.destroy$)).subscribe(
      (res:ClinicDto) => {
        this.clinics[idx] = res;
        this.toast.success('Updated clinic', 'Successfully')
      }
    );
  }

  private updatePhotoClinic(clinic:ClinicDto, idx:number) {
    var formData: any = new FormData();
    formData.append("file", this.uploadPhotoForm.get('file').value);
    this.uploadFileService.uploadFileClinic(formData, clinic.id).subscribe(
      res => {
        console.log(res)
        this.clinics[idx].photo = res['url']
      });

  }

  private createClinic(clinic: UpdateCreateClinicDto) {
    this.clinicService.createClinic(clinic).pipe(takeUntil(this.destroy$)).subscribe(
      (res:ClinicDto) => {
        this.clinics.push(res);
        this.toast.success('Created clinic', 'Successfully')
      }
    );
  }

  private deteleClinic(id:number, idx:number) {
    console.log('id: '+id + ' idx: ' + idx)
    this.clinicService.deleteClinic(id).pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.clinics.splice(idx, 1);
        this.toast.success('Delete clinic', 'Successfully');
      }
    );
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


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
