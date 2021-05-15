import { Component, OnInit, OnDestroy, ViewChild, TemplateRef  } from '@angular/core';
import { Subject } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';

import { User } from 'src/app/models/entities/user-model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-profile-user',
  templateUrl: './profile-user.component.html',
  styleUrls: ['./profile-user.component.css']
})
export class ProfileUserComponent implements OnInit {
  @ViewChild("modalDeactivate", { static: false }) modalDeactivate: TemplateRef<any>;
  
  private destroy$ = new Subject();
  public userLogged: User;
  public roleUser: number;

  public profileForm = this.formBuilder.group({
    name: ['', Validators.required],
    surnames: ['', Validators.required],
    phone: ['', Validators.required],
    specialistType: [''],
    collegiateNumber: ['', Validators.maxLength(9)],
    isAdminRole: [true, Validators.required],
    active: [true, Validators.required]
  })

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,) { }

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
        this.setFormValues()
      }
    );
  }

  saveProfile() {

    //check colegiate number
    let collegiateNumber = this.profileForm.controls['collegiateNumber'].value;
    if (collegiateNumber.length > 9) {
      this.toast.error('The collegiate number too large, maximum 9 digits', 'Error')
      return;
    }
    
    if (Number.isNaN(parseInt(collegiateNumber))) {
      this.toast.error('The collegiate number cannot contain letters', 'Error')
      return;
    }


    if (!this.profileForm.valid) {
        this.toast.error('The fields marked with * are required', 'Error')
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
              console.log('yes delete acount')
            }
              
          }
        );
      
    }
    
    this.userService.updateUserProfile(this.profileForm.value, this.userLogged.id).pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        console.log(res)
      },
      (error) => {
        this.toast.error('In request', 'Error')
      }
    );

    
    //SEND REQUEST
  }

  public setFormValues() {
    this.profileForm.controls['name'].setValue(this.userLogged.name);
    this.profileForm.controls['surnames'].setValue(this.userLogged.surnames);
    this.profileForm.controls['phone'].setValue(this.userLogged.phone);
    this.profileForm.controls['specialistType'].setValue(this.userLogged.specialistType);
    this.profileForm.controls['collegiateNumber'].setValue(this.userLogged.collegiateNumber);
    this.profileForm.controls['isAdminRole'].setValue(this.roleUser ===1 || this.roleUser ===2);
  }

}
