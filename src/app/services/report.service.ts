import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { CreateUpdateReportDto } from '../models/dto/report/CreateUpdateReportDto';



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

  create(report: CreateUpdateReportDto) {
    return this.htttClient.post(this.base_url + '/report/', report);
  }

  update(report: CreateUpdateReportDto, id:number) {
    return this.htttClient.put(this.base_url + '/report/'+ id, report);
  }
}
