import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

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
    username: ['superadmin', Validators.required],
    password: ['password', Validators.required]
  })



  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,) { }

  ngOnInit(): void {}


  login() {
    console.log(this.loginForm.value)
    if (true) {
      /* this.userService.login(this.loginForm.value).subscribe(
        res => {
          localStorage.setItem('accessToken', res["accessToken"]);
          localStorage.setItem('id', res["id"]);
        }
      ) */

      this.userService.login(this.loginForm.value).pipe(
        takeUntil(this.destroy$),
        map((resLogin) => {
          localStorage.setItem('accessToken', resLogin["accessToken"]);
          localStorage.setItem('id', resLogin["id"]);
          this.userId = resLogin["id"];
        }),
        concatMap(() => this.userService.getUserById(this.userId))
      ).subscribe(ress => {
        //let user = ress as User;
        //this.userService.userLogged.next(user);
        console.log(ress)
        this.router.navigateByUrl('/home');

        },
        (error) => {
          //this.toastr.error(JSON.stringify(error.error.detail));
        }
      );
      
    }
  }

}
