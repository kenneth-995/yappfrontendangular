import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { Subject } from 'rxjs';

import { UserLoginDto } from '../models/dto/UserLoginDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public base_url = environment.BASE_URL;

  constructor(private htttClient: HttpClient) { }

  login(formData: UserLoginDto) {
    return this.htttClient.post(this.base_url+'/auth/login', formData);
  }

  getUserById(userId: number) {
    return this.htttClient.get(this.base_url+'/user/'+userId );
  }


}
