import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { concatMap, map, take, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  public destroy$ = new Subject();

  public formSubmited = false;

  public registerForm: FormGroup;
  public observableForm: Subscription = new Subscription();

  public msgEmail = '';
  public msgPsswd = '';
  public messageForm = 'all fields is required'
  public showButtonsForm: boolean = false;

  public formValid: boolean = false;
  public psswdValid: boolean = false;
  public emailValid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toast: ToastrService) { }

  ngOnInit(): void {

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      password2: ['', Validators.required],
      name: ['', Validators.required],
      surnames: ['', Validators.required],
      phone: ['', Validators.required],
      collegiateNumber: ['', Validators.required],
      specialistType: ['', Validators.required],
      nameClinic: ['', Validators.required],
      addressClinic: ['', Validators.required],
      phoneNumberClinic: ['', Validators.required],
      emailClinic: ['', Validators.required]
      /* username: ['kenneth', Validators.required],
      email: ['kenneth.ferre@gmail.com', Validators.required],
      password: ['password', Validators.required],
      password2: ['passwordd', Validators.required],
      name: ['kenneth', Validators.required],
      surnames: ['griñan ferre', Validators.required],
      phone: ['650190003', Validators.required],
      collegiateNumber: ['1234567', Validators.required],
      specialistType: ['Psychologist', Validators.required],
      nameClinic: ['Super Clinic', Validators.required],
      addressClinic: ['C/Moli de la torre', Validators.required],
      phoneNumberClinic: ['650190006', Validators.required],
      emailClinic: ['kenneth.ferre@gmail.com', Validators.required] */
    });

    this.inicializeForm();
  }

  inicializeForm() {
    this.observableForm.unsubscribe();
    let _password, _password2;


    this.observableForm = this.registerForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        _password = this.registerForm.controls['password'].value;
        _password2 = this.registerForm.controls['password2'].value;
        if (_password != null && _password === _password2 && _password.length >= 6) {
          this.msgPsswd = ''
          this.psswdValid=true;

        } else {
          this.msgPsswd = 'invalid passwords'
          this.psswdValid = false

        }

        if (this.isValidEmail(this.registerForm.controls['email'].value)) {
          this.msgEmail = ''
          this.emailValid = true;
        } else {
          this.msgEmail = 'invalid email'
          this.emailValid = false;
        }

        if (this.emailValid && this.psswdValid &&
          this.registerForm.controls['username'].value != '' &&
          this.registerForm.controls['name'].value != '' &&
          this.registerForm.controls['surnames'].value != '' &&
          this.registerForm.controls['phone'].value != '' &&
          this.registerForm.controls['collegiateNumber'].value != '' &&
          this.registerForm.controls['specialistType'].value != '' &&
          this.registerForm.controls['nameClinic'].value != '' &&
          this.registerForm.controls['addressClinic'].value != '' &&
          this.registerForm.controls['phoneNumberClinic'].value != '' &&
          this.registerForm.controls['emailClinic'].value != '') {

          this.showButtonsForm = true;
          this.messageForm = '';
          this.msgPsswd = ''
          this.msgEmail = ''
        } else {
          this.messageForm = 'all fields is required'
          this.showButtonsForm = false;
          console.log('aaaaaa')
        }


      }

    );

  }

  isValidEmail(value): boolean {
    return /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,5}$/.test(value);
  }

  public submitFormRegister() {
    console.log('hello world!')
      this.userService.createSpecialistAdmin(this.registerForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (res) => {
            this.toast.success(res['message'], 'Successfully')
            this.router.navigateByUrl('/login')
        },
        
        (error) => {
          this.toast.warning('Something went wrong, try to register again', 'Registration could not be completed')
        }
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
