import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { LoginService } from '../../../../services/login.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public form_submited = false;
  public destroy$ = new Subject();



  constructor(
    private router: Router,
    private loginService: LoginService,) { }

  ngOnInit(): void { }

  login() {
    console.log('login()')
  }

}
