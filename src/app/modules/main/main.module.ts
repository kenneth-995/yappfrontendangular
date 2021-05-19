import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '../shared/shared.module';
import { PatientsComponent } from './patients/patients.component';
import { MtsComponent } from './mts/mts.component';
import { TreatmentComponent } from './treatment/treatment.component';
import { ReportComponent } from './report/report.component';
import { ClinicsComponent } from './clinics/clinics.component';




@NgModule({
  declarations: [HomeComponent, PatientsComponent, MtsComponent, TreatmentComponent, ReportComponent, ClinicsComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule
  ]
})
export class MainModule { }
