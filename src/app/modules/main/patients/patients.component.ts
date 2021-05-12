import { Component, OnInit } from '@angular/core';

import { UserService } from '../../../services/user.service';
import { PatientService } from '../../../services/patient.service';
import { PatientDto } from '../../../models/dto/PatientDto';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.css']
})
export class PatientsComponent implements OnInit {
  private destroy$ = new Subject();

  public patients: PatientDto[];

  constructor(private userService: UserService,
     private patientService: PatientService) { }

  /* ngOnInit(): void {
    this.patientService.getPatientsByClinic(5).subscribe(
      (res: PatientDto[])=> {
        console.log(res)
        this.patients = res;
        this.patients.forEach(p=> console.log(p));
      }
    )
  } */

  ngOnInit(): void {
    console.log(this.userService.getUserLogged)
  }

}
