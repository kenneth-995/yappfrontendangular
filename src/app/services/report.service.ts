import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { CreateReportDto } from '../models/dto/report/CreateReportDto';
import { UpdateReportDto } from '../models/dto/report/UpdateReportDto';


@Injectable({
  providedIn: 'root'
})
export class ReportService {
  public base_url = environment.BASE_URL;

  constructor(private htttClient: HttpClient) { }

  getAllReports() {
    return this.htttClient.get(this.base_url + '/report/');
  }

  getReportsByClinicId(clinicId: number) {
    return this.htttClient.get(this.base_url + '/report/clinic/'+ clinicId);
  }

  getReportsBySpecialistId(specialistId: number) {
    return this.htttClient.get(this.base_url + '/report/specialist/'+ specialistId);
  }

  delete(id:number) {
    return this.htttClient.delete(this.base_url + '/report/deactivate/'+ id);
  }

  create(report: CreateReportDto) {
    return this.htttClient.post(this.base_url + '/report/', report);
  }

  update(report: UpdateReportDto, id:number) {
    return this.htttClient.put(this.base_url + '/report/'+ id, report);
  }
}
