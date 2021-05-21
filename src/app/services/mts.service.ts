import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { MtsDto } from '../models/dto/mts/MtsDto';
import { MtsCreateUpdateDto } from '../models/dto/mts/MtsCreateUpdateDto';


@Injectable({
  providedIn: 'root'
})
export class MtsService {
  public base_url = environment.BASE_URL;

  constructor(private htttClient: HttpClient) { }

  getAllMts() {
    return this.htttClient.get<MtsDto[]>(this.base_url + '/medicalsheet/');
  }

  getAllMtsByClinic(id:number) {
    return this.htttClient.get<MtsDto[]>(this.base_url + '/medicalsheet/clinic/'+ id);
  }

  getAllMtsBySpecialist(id:number) {
    return this.htttClient.get<MtsDto[]>(this.base_url + '/medicalsheet/specialist/'+ id);
  }

  update(mts: MtsCreateUpdateDto, id:number) {
    return this.htttClient.put(this.base_url + '/medicalsheet/'+ id, mts);
  }

  create(mts: MtsCreateUpdateDto) {
    return this.htttClient.post(this.base_url + '/medicalsheet/', mts);
  }

  detele(id: number) {
    return this.htttClient.delete(this.base_url + '/medicalsheet/deactivate/' + id);
  }
}

