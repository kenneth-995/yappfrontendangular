import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { User } from '../../../../models/entities/user-model';
import { UserService } from '../../../../services/user.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public formSubmited = false;
  public destroy$ = new Subject();

  public userId:number;

  public loginForm = this.formBuilder.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  })



  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private toastr: ToastrService) { }

  ngOnInit(): void {}


  login() {
    console.log()
    if (this.loginForm.valid) {

      this.userService.login(this.loginForm.value).pipe(
        takeUntil(this.destroy$),
        map((resLogin) => {
          localStorage.setItem('accessToken', resLogin["accessToken"]);
          //localStorage.setItem('id', resLogin["id"]);
          localStorage.setItem('username', resLogin["username"]);
          this.userId = resLogin["id"];
        }),
        concatMap(() => this.userService.getUserById(this.userId))
      ).subscribe((ress: User) => {
        this.userService.setUserLogged(ress)
        this.userService.userLogged = ress as User;
        console.log(ress)

        this.userService.saveUserLocalStorage(ress)

        this.router.navigateByUrl('/home');

        },
        (error) => {
          console.log('error')
          console.log(error.error)
          this.toastr.error('Bad credentials', 'Error');
        }
      );
      
    } else {
      this.toastr.error(JSON.stringify({"error":"username or password cannot be empty"}));
    }
  }



}
