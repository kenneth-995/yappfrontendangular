import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
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

  public loginForm = this.formBuilder.group({
    username: ['kenneth', Validators.required],
    password: ['kenneth', Validators.required]
  })



  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,) { }

  ngOnInit(): void { }

  createUser() {

  }

  login() {

    console.log(this.loginForm.value)

    this.userService.login(this.loginForm.value)
    .subscribe(res => {
      console.log(res);
    }, (err) => {
      console.log(err);
    })
  }

}
