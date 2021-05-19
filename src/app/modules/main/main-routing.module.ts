import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileUserComponent } from '../profile-user/profile-user.component';
import { ClinicComponent } from './clinic/clinic.component';
import { ClinicsComponent } from './clinics/clinics.component';
import { HomeComponent } from './home/home.component';
import { PatientsComponent } from './patients/patients.component';
import { ReportComponent } from './report/report.component';
import { TreatmentComponent } from './treatment/treatment.component';

const routes: Routes = [

  {path: '', component: HomeComponent, pathMatch: 'full'},

  {path: 'patients', component: PatientsComponent, pathMatch: 'full'},

  {path: 'profile', component: ProfileUserComponent, pathMatch: 'full'},

  {path: 'treatments', component: TreatmentComponent, pathMatch: 'full'},

  {path: 'reports', component: ReportComponent, pathMatch: 'full'},

  {path: 'clinic', component: ClinicComponent, pathMatch: 'full'},

  {path: 'clinics', component: ClinicsComponent, pathMatch: 'full'},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
