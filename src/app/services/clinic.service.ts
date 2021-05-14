import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  public base_url = environment.BASE_URL;

  constructor(private htttClient: HttpClient) { }

  getAllClinics() {
    return this.htttClient.get(this.base_url+ '/clinic/');
  }
}
