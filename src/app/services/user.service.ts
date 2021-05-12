import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, BehaviorSubject } from 'rxjs';

import { environment } from 'src/environments/environment';


import { User } from '../models/entities/user-model';
import { UserLoginDto } from '../models/dto/UserLoginDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  //public userLogged: BehaviorSubject<User>
  public userLogged: User;
  public base_url = environment.BASE_URL;

  

  constructor(private htttClient: HttpClient, private router: Router) { }

  login(formData: UserLoginDto) {
    return this.htttClient.post(this.base_url+'/auth/login', formData);
  }

  logout() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("id")
    this.router.navigateByUrl('/');
  }

  
  public getUserById(userId: number) {
    return this.htttClient.get(this.base_url+'/user/'+userId );
  }

  public getAllUsers() {
    return this.htttClient.get(this.base_url + '/user/');
  }

  public getUserRole() {
    return this.htttClient.get(this.base_url+'/auth/roleuser');
  }

  get getUserLogged() {
    return this.userLogged;
  }

  public setUserLogged(user: User) {
      this.userLogged = user;
  }



}
