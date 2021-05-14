import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { Subject } from 'rxjs';
import { PatientDto } from '../models/dto/patient/PatientDto';
import { CreatePatientDto } from '../models/dto/patient/CreatePatientDto';


@Injectable({
  providedIn: 'root'
})
export class PatientService {
  public base_url = environment.BASE_URL;

  constructor(private htttClient: HttpClient) { }

  getAllPatients() {
    return this.htttClient.get(this.base_url+'/patient/');
  }

  getPatientsByClinic(id:number) {
    return this.htttClient.get(this.base_url+'/patient/clinic/'+id);
  }

  deletePatient(id: number) {
    return this.htttClient.delete(this.base_url+'/patient/'+id);
  }

  updatePatient(p: PatientDto) {
    return this.htttClient.put(this.base_url+'/patient/'+p.id, p);
  }

  createPatient(p: CreatePatientDto) {
    return this.htttClient.post(this.base_url+'/patient/', p);
  }

}
