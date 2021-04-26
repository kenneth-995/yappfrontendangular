import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

import { UserLoginDto } from '../models/dto/UserLoginDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private htttClient: HttpClient) { }

  login(formData: UserLoginDto) {

    let headers = {'Content-Type':'application/json'};
    // 'Access-Control-Allow-Origin:': '*'

    return this.htttClient.post('http://localhost:5000/login', formData)

    //return this.htttClient.get('http://localhost:5000/api/family/')

    
  }


}
