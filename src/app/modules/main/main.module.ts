import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '../shared/shared.module';
import { PatientsComponent } from './patients/patients.component';
import { MtsComponent } from './mts/mts.component';




@NgModule({
  declarations: [HomeComponent, PatientsComponent, MtsComponent],
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule
  ]
})
export class MainModule { }
