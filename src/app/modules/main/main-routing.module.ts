import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileUserComponent } from '../profile-user/profile-user.component';
import { HomeComponent } from './home/home.component';
import { PatientsComponent } from './patients/patients.component';

const routes: Routes = [

  {path: '', component: HomeComponent, pathMatch: 'full'},

  {path: 'patients', component: PatientsComponent, pathMatch: 'full'},

  {path: 'profile', component: ProfileUserComponent, pathMatch: 'full'},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
