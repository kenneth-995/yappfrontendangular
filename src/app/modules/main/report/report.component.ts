import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { Subject } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from '../../../services/user.service';
import { User } from 'src/app/models/entities/user-model';

import { ReportService } from '../../../services/report.service';
import { TreatmentService } from '../../../services/treatment.service';
import { TreatmentDto } from '../../../models/dto/treatment/TreatmentDto';

import { ReportDto } from '../../../models/dto/report/ReportDto';
import { CreateReportDto } from '../../../models/dto/report/CreateReportDto';
import { UpdateReportDto } from '../../../models/dto/report/UpdateReportDto';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  @ViewChild("update", { static: false }) update: TemplateRef<any>;
  @ViewChild("create", { static: false }) create: TemplateRef<any>;
  @ViewChild("modalDelete", { static: false }) modalDelete: TemplateRef<any>;

  private destroy$ = new Subject();

  public userLogged: User;
  public roleUser: number;

  public reports: ReportDto[] = [];
  public treatments: TreatmentDto[] = [];

  public createForm: FormGroup;
  public updateForm: FormGroup;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private reportService: ReportService,
    private treatmentService: TreatmentService) { }

  ngOnInit(): void {

  }

  getData() {

  }


  getAllReports() {

  }

  getAllReportsByClinic() {
    
  }

  getAllReportsBySpecialist() {
    
  }


  getAllTreatments() {

  }

  getAllTreatmentsByClinic() {
    
  }

  getAllTreatmentsBySpecialist() {
    
  }


  createReport() {

  }

  updateReport() {
    
  }

  deleteReport() {
    
  }

}
