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
      headers: new HttpHeaders({ "Content-Type": "multipart/form-data; boundary=<calculated when request is sent>" })
    }

    const url = this.base_url + '/patient/updatephoto/'+id

    return this.htttClient.put(url, formFile, header);
  }

}
