import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { ClinicDto } from '../models/dto/clinic/ClinicDto';
import { UpdateCreateClinicDto } from '../models/dto/clinic/UpdateCreateClinicDto';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {
  public base_url = environment.BASE_URL;

  constructor(private htttClient: HttpClient) { }

  getAllClinics() {
    return this.htttClient.get<ClinicDto[]>(this.base_url+ '/clinic/');
  }

  getClinic(id:number) {
    return this.htttClient.get<ClinicDto>(this.base_url+ '/clinic/'+id);
  }

  createClinic (clinic: UpdateCreateClinicDto) {
    return this.htttClient.post(this.base_url+ '/clinic/', clinic);
  }

  updateClinic (clinic: UpdateCreateClinicDto, id:number) {
    return this.htttClient.put(this.base_url+ '/clinic/'+id, clinic);
  }

  deleteClinic(id:number) {
    return this.htttClient.delete(this.base_url+ '/clinic/deactivate/'+id);
  }
}
