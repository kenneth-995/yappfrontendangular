import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';

import { MainRoutingModule } from './main-routing.module';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '../shared/shared.module';
import { PatientsComponent } from './patients/patients.component';
import { MtsComponent } from './mts/mts.component';
import { TreatmentComponent } from './treatment/treatment.component';
import { ReportComponent } from './report/report.component';
import { ClinicsComponent } from './clinics/clinics.component';
import { ClinicComponent } from './clinic/clinic.component';
import { SpecialistsComponent } from './specialists/specialists.component';


FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin
]);

@NgModule({
  declarations: [HomeComponent, PatientsComponent, MtsComponent, TreatmentComponent, ReportComponent, ClinicsComponent, ClinicComponent, SpecialistsComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule,
    FullCalendarModule
  ]
})
export class MainModule { }
