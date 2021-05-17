import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


import { TreatmentDto } from '../models/dto/treatment/TreatmentDto';
import { CreateUpdateTreatmentDto } from '../models/dto/treatment/CreateUpdateTreatmentDto';



@Injectable({
  providedIn: 'root'
})

export class TreatmentService {

  public base_url = environment.BASE_URL;

  constructor(private htttClient: HttpClient) { }

  //SUPERADMIN
  getAllTreatments() {
    return this.htttClient.get(this.base_url + '/treatment/');
  }

  //ADMIN
  getAllTreatmentsByClinicId(clinicId: number) {
    return this.htttClient.get(this.base_url + '/treatment/clinic/' + clinicId);
  }

  //ADMIN
  getAllTreatmentsBySpecialistId(specialistId: number) {
    return this.htttClient.get(this.base_url + '/treatment/specialist/' + specialistId);
  }

  
  insertTreatment(treatment:CreateUpdateTreatmentDto) {
      return this.htttClient.post(this.base_url + '/treatment/', treatment);
  }

  updateTreatment(treatment:CreateUpdateTreatmentDto, treatmentId:number) {
    return this.htttClient.put(this.base_url + '/treatment/'+ treatmentId, treatment);
  }

  deleteTreatment(treatmentId:number) {
    return this.htttClient.delete(this.base_url + '/treatment/deactivate/' + treatmentId);
  }

}
