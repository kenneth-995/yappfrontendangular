import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Subject } from 'rxjs';

import { UserLoginDto } from '../models/dto/UserLoginDto';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private htttClient: HttpClient) { }

  login(formData: UserLoginDto) {

    //let headers = {'Content-Type':'application/json'};
    // 'Access-Control-Allow-Origin:': '*'

    let headers = new Headers();
    headers.append('Accept', 'application/json')
    // creating base64 encoded String from user name and password
    var base64Credential: string = btoa( formData.username+ ':' + formData.password);
    headers.append("Authorization", "Basic " + base64Credential);


    const headerDict = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Authorization': "Basic " + base64Credential,
    }
    

    
    const requestOptions = {                                                                                                                                                                                 
      headers: new HttpHeaders(headerDict), 
    };

    return this.htttClient.get('http://localhost:5000/login', requestOptions);

    //return this.htttClient.get('http://localhost:5000/api/family/')

    
  }


}
