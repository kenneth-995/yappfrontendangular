import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { User } from 'src/app/models/entities/user-model';
import { UserService } from '../../services/user.service';

import { UploadFileService } from '../../services/upload-file.service';

@Component({
  selector: 'app-profile-user',
  templateUrl: './profile-user.component.html',
  styleUrls: ['./profile-user.component.css']
})
export class ProfileUserComponent implements OnInit {
  @ViewChild("modalDeactivate", { static: false }) modalDeactivate: TemplateRef<any>;
  @ViewChild("updatePassword", { static: false }) updatePassword: TemplateRef<any>;

  public fileForm: FormGroup;

  private destroy$ = new Subject();
  public userLogged: User;
  public roleUser: number;

  public previewImageStr: string;

  public changeProfileForm: boolean = false;
  public disablefInput: boolean = true;

  public profileForm = this.formBuilder.group({
    name: ['', Validators.required],
    surnames: ['', Validators.required],
    phone: ['', Validators.required],
    specialistType: [''],
    collegiateNumber: [1, Validators.maxLength(9)],
    isAdminRole: [true, Validators.required],
    active: [true, Validators.required]
  });

  public updatePasswordForm = this.formBuilder.group({
    oldPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword2: ['', [Validators.required, Validators.minLength(6)]],
  });


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private uploadFileService: UploadFileService) { }

  ngOnInit(): void {
    if (this.userService.userLogged != null) {
      this.userLogged = this.userService.userLogged;
    } else {
      this.userLogged = this.userService.getUserLocalStorage()
    }

    //console.log('[profileUser]')
    //console.log(this.userLogged)

    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {
        this.roleUser = res;
        this.setFormProfileValues()
      }
    );

    this.fileForm = this.formBuilder.group({
      file: null
    })



  }

  saveProfile() {

    console.log(this.profileForm.valid)

    if (this.profileForm.valid) {
      //check colegiate number
      let collegiateNumber = this.profileForm.controls['collegiateNumber'].value;
      if (collegiateNumber.length > 9) {
        this.toast.error('The collegiate number too large, maximum 9 digits', 'Error')
        return;
      }

      //TODO: not work!
      const checkNumber: number = parseInt(this.profileForm.controls['collegiateNumber'].value)
      if (Number.isNaN(checkNumber)) {
        this.toast.error('The collegiate number cannot contain letters', 'Error')
        return;
      }





      //OPEN MODAL WARNING DELETE ACOUNT
      if (!this.profileForm.controls['active'].value) {

        this.modalService.open(this.modalDeactivate).result.then(
          r => {
            if (r === '0') {
              console.log('no delete acount')
              this.profileForm.controls['active'].setValue(true);
              return;
            }
            else {
              //SEND REQUEST
              //IF CONFIRM 'YES' SEND REQUEST AND REDIRECT TO LOGIN AND SET LOCALSTORAGE
              this.userService.logout();
              console.log('yes delete acount')
            }

          }
        );

      }


      this.userService.updateUserProfile(this.profileForm.value, this.userLogged.id).pipe(
        takeUntil(this.destroy$)).subscribe(
          (res: User) => {
            console.log(res)
            this.userService.setUserLogged(res)
            this.userLogged = res;
            this.setFormProfileValues();
            this.toast.success('Profile updated', 'Successfuly')


            this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
              (res: number) => {
                this.roleUser = res;
              }
            );
          },
          (error) => {
            this.toast.error('In request', 'Error')
            console.log(this.profileForm.value)
          }
        );

    } else {
      this.toast.error('The fields marked with * are required', 'Error')
    }
  }

  public openModalPassword() {
    this.modalService.open(this.updatePassword).result.then(
      r => {
        if (r === '1') {
          console.log('CHANGE')
          console.log(this.updatePasswordForm.value)
          if (this.updatePasswordForm.valid) { 

            const psw1 = this.updatePasswordForm.controls['newPassword'].value;
            const psw2 = this.updatePasswordForm.controls['newPassword2'].value;

            if (this.matchTwoPasswords(psw1, psw2)) {
              console.log('MATCH')  
              //SEND REQUEST

              this.userService.updatePasswd(this.updatePasswordForm.value, this.userLogged.id)
              .pipe(takeUntil(this.destroy$)).subscribe(
                (res) => {
                  console.log(res)
                  this.toast.success('The password has been changed', 'Successfully')
                },
                (error) => {
                  this.toast.error('Please verify password', 'Your password is not correct')
                }
              );


            } else {
              console.log('NO MATCH')
              this.toast.error('The new password does not match', 'Error change password')
            }
            

            


          } else {
            console.log('form no valid')
            this.toast.error('Please verify passwords', 'Error change password')

          }
          return;
        }
        else {
          console.log('NO CHANGE PASSWORD')
        }

      }
    );

    this.updatePasswordForm.controls['oldPassword'].setValue('');
    this.updatePasswordForm.controls['newPassword'].setValue('');
    this.updatePasswordForm.controls['newPassword2'].setValue('');



  }

  public setFormProfileValues() {

    this.profileForm.controls['name'].setValue(this.userLogged.name);
    this.profileForm.controls['surnames'].setValue(this.userLogged.surnames);
    this.profileForm.controls['phone'].setValue(this.userLogged.phone);
    this.profileForm.controls['specialistType'].setValue(this.userLogged.specialistType);
    this.profileForm.controls['collegiateNumber'].setValue(this.userLogged.collegiateNumber);
    this.profileForm.controls['isAdminRole'].setValue(this.roleUser === 1 || this.roleUser === 2);

    this.profileForm.valueChanges.subscribe(
      (field) => {
        console.log(field)
        this.changeProfileForm = true;
      }
    );

    this.changeProfileForm = false;
  }

  public uploadPhoto() {
    var formData: any = new FormData();
    formData.append("file", this.fileForm.get('file').value);

    this.uploadFileService.uploadFileUser(formData, this.userLogged.id).pipe(takeUntil(this.destroy$)).subscribe(
      res => {
        console.log(res)
        console.log(this.userLogged)
        this.userLogged.photoUrl = res['url']
        this.userService.userLogged.photoUrl = res['url']
        this.toast.success('Photo updated', 'Successfuly')
      }
    );

  }

  onFileChange(event) {
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      this.fileForm.get('file').setValue(file)


      reader.readAsDataURL(file);
      reader.onload = () => {
        this.previewImageStr = reader.result as string;
      };


    }
  }

  cancelUploadPhoto() {
    this.previewImageStr = null;
  }

  matchTwoPasswords(psw1: string, psw2: string):boolean {
    return psw1 === psw2;
  }

}
