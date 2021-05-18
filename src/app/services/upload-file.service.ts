import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadFileService {

  public base_url = environment.BASE_URL;

  constructor(private htttClient: HttpClient) { }



  public uploadFilePatient(formFile, id: number) {

    const header = {
      headers: new HttpHeaders({ "Content-Type": "multipart/form-data;" })
    }

    const url = this.base_url + '/patient/updatephoto/'+id

    return this.htttClient.put<any>(url, formFile, header);
  }

  public uploadFileUser(formFile, id: number) {

    const header = {
      headers: new HttpHeaders({ "Content-Type": "multipart/form-data;" })
    }

    const url = this.base_url + '/auth/updatephoto/'+id

    return this.htttClient.put<any>(url, formFile, header);
  }

  public uploadFileClinic(formFile, id: number) {

    const header = {
      headers: new HttpHeaders({ "Content-Type": "multipart/form-data;" })
    }

    const url = this.base_url + '/clinic/updatephoto/'+id

    return this.htttClient.post<any>(url, formFile, header);
  }

}
