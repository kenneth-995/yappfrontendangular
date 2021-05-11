import { Component, OnInit } from '@angular/core';

import { PatientService } from '../../../services/patient.service';
import { PatientDto } from '../../../models/dto/PatientDto';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  
  public patients: PatientDto[];

  constructor(private patientService: PatientService) { }

  ngOnInit(): void {
    this.patientService.getPatientsByClinic(5).subscribe(
      (res: PatientDto[])=> {
        console.log(res)
        this.patients = res;
        this.patients.forEach(p=> console.log(p));
      }
    )
  }

}
