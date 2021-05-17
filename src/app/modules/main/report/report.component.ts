import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { pipe, Subject, Subscription } from 'rxjs';
import { concatMap, map, take, takeUntil } from 'rxjs/operators';
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
import { textChangeRangeIsUnchanged } from 'typescript';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  @ViewChild("updateCreate", { static: false }) updateCreate: TemplateRef<any>;
  @ViewChild("create", { static: false }) create: TemplateRef<any>;
  @ViewChild("modalDelete", { static: false }) modalDelete: TemplateRef<any>;

  private destroy$ = new Subject();

  public userLogged: User;
  public roleUser: number;

  public reports: ReportDto[] = [];
  public treatments: TreatmentDto[] = [];

  public updateCreateForm: FormGroup;

  public observableupdateCreateForm: Subscription = new Subscription();

  public showButtonsForm: boolean = false;


  public textModal: string = '';

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private reportService: ReportService,
    private treatmentService: TreatmentService) { }

  ngOnInit(): void {


    console.log('hello treatments component ngOnInit()')
    if (this.userService.userLogged != null) {
      this.userLogged = this.userService.userLogged;
    } else {
      this.userLogged = this.userService.getUserLocalStorage()
    }

    this.getData();

    this.updateCreateForm = this.formBuilder.group({
      diagnosis: ['', Validators.required],
      objectives: ['', Validators.required],
      date: ['', Validators.required],
      treatmentId: [Validators.required]
    });




    
  }

  getData() {

    this.userService.getUserRole().pipe(takeUntil(this.destroy$)).subscribe(
      (res: number) => {
        this.roleUser = res;
        if (res === 1) {
          console.log('role superadmin')
          this.getAllReports();
          this.getAllTreatments();

        } else if (res === 2) {
          console.log('role admin')
          this.getAllReportsByClinic();
          this.getAllTreatmentsByClinic();

        } else if (res === 3) {
          console.log('role user')
          this.getAllReportsBySpecialist();
          this.getAllTreatmentsBySpecialist();
          //set form only this in select and disabled input
          //this.specialists.push(this.userLogged)

        } else {
          this.router.navigateByUrl('/login');
          this.userService.logout();
          console.log('[ReportsComponent error] get role user !=1 !=2 =!3');
        }
      }
    );

  }



  openModalCreate() {
      this.textModal = 'Create ';
      console.log('open modal Create')

      //set values form
      this.inicializeNewFormReport();

      this.modalService.open(this.updateCreate).result.then(

        r => {
          if (r ==='1') {
            console.log('SAVE')
            this.createReport(this.updateCreateForm.value);
          } else {
            console.log('CANCEL')
          }
        }
      );
  }

  inicializeNewFormReport() {
    this.showButtonsForm = false;

    this.observableupdateCreateForm.unsubscribe();
    this.updateCreateForm.reset();
    this.updateCreateForm.controls['date'].setValue('');
    this.updateCreateForm.controls['objectives'].setValue('');
    this.updateCreateForm.controls['diagnosis'].setValue('');

    this.observableupdateCreateForm = this.updateCreateForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        console.log('inicializeNewFormReport subscriber')
        if (this.updateCreateForm.controls['diagnosis'].value != '' &&
            this.updateCreateForm.controls['objectives'].value != '' &&
            this.updateCreateForm.controls['date'].value != '' &&
            this.updateCreateForm.controls['treatmentId'].value != 0) {
          
            this.showButtonsForm = true;
        }
        else {
          this.showButtonsForm = false;
        }
      }
    );

  }

  inicializeFormWithReport(r: ReportDto, idx: number) {
    this.observableupdateCreateForm.unsubscribe();
    this.updateCreateForm.reset();
    this.showButtonsForm = false;

    let _diagnosis = r.diagnosis;
    let _objectives = r.objectives;
    let _date = r.date;
    let _treatmentId = r.treatmentId;
    console.log(r)

    this.updateCreateForm.controls['diagnosis'].setValue(r.diagnosis);
    this.updateCreateForm.controls['objectives'].setValue(r.objectives);
    this.updateCreateForm.controls['date'].setValue(r.date);
    this.updateCreateForm.controls['treatmentId'].setValue(r.treatmentId);


    this.observableupdateCreateForm = this.updateCreateForm.valueChanges.subscribe(
      (field) => {
        console.log('inicializeFormWithTreatment subscriber')

        if (this.updateCreateForm.valid &&
          _diagnosis != this.updateCreateForm.controls['diagnosis'].value ||
          _objectives != this.updateCreateForm.controls['objectives'].value ||
          _date != this.updateCreateForm.controls['date'].value ||
          _treatmentId != this.updateCreateForm.controls['treatmentId'].value ) {
          this.showButtonsForm = true;
        } else {
          this.showButtonsForm = false;
        }

      }
    );


  }

  openModalEdit(reportDto: ReportDto, idx: number) {
    console.log('open modal update')
    this.textModal = 'Update ';
    this.inicializeFormWithReport(reportDto, idx);
    this.modalService.open(this.updateCreate).result.then(
      r => {
        if (r ==='1') {
          console.log('SAVE')
          this.updateReport(this.updateCreateForm.value, reportDto.id, idx);
        } else {
          console.log('CANCEL')
        }
      }
    );
  }

  openModalDelete(id: number, idx: number) {
    this.modalService.open(this.modalDelete).result.then(
      r => {
        if (r === '1') { 
          console.log('DELETE REPORT')
          this.deleteReport(id, idx);
        } else {
          console.log('NO DELETE REPORT')
        }
      }, (errorModal) => {
        console.log(errorModal);
      }
    )
  }


  //SUPERADMIN
  getAllReports() {
    this.reportService.getAllReports().pipe(takeUntil(this.destroy$)).subscribe(
      (res: ReportDto[]) => {
        this.reports = res;
      }
    );
  }
  //ADMIN
  getAllReportsByClinic() {
    this.reportService.getReportsByClinicId(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: ReportDto[]) => {
          this.reports = res;
        }
      );

  }

  //USER
  getAllReportsBySpecialist() {
    this.reportService.getReportsBySpecialistId(this.userLogged.id)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: ReportDto[]) => {
          this.reports = res;
        }
      );
  }

  createReport(createReport: CreateReportDto) {
    this.reportService.create(createReport).pipe(takeUntil(this.destroy$)).subscribe(
      (res: ReportDto) => {
        this.reports.push(res)
        console.log(res)
        this.toast.success('Create report', 'Successfully')
        //this.updateCreateForm.reset(); // no hace falta, se resetea cada vez que se abre el modal
      }
    );
  }

  updateReport(updateReport: CreateReportDto, id:number, idx:number) {
    this.reportService.update(updateReport, id).pipe(takeUntil(this.destroy$)).subscribe(
      (res: ReportDto) => {
        //this.reports.push(res)
        console.log(res)
        this.reports[idx] = res;
        this.toast.success('Update report', 'Successfully')
        //this.updateCreateForm.reset(); // no hace falta, se resetea cada vez que se abre el modal
      }
    );
  }

  deleteReport(id: number, idx:number) {
    this.reportService.delete(id).pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.reports.splice(idx, 1);
        this.toast.success('Report deleted', 'Successfully');
      }
    );
  }


  getAllTreatments() {
    this.treatmentService.getAllTreatments().pipe(takeUntil(this.destroy$)).subscribe(
      (res: TreatmentDto[]) => {
        this.treatments = res;
        console.log('TreatmentDto[]');
        console.log(res);
      }
    );
  }

  getAllTreatmentsByClinic() {
    this.treatmentService.getAllTreatmentsByClinicId(this.userLogged.clinicId)
    .pipe(takeUntil(this.destroy$)).subscribe(
      (res: TreatmentDto[]) => {
        this.treatments = res;
        console.log('TreatmentDto[]');
        console.log(res);
      }
    );
  }

  getAllTreatmentsBySpecialist() {
    this.treatmentService.getAllTreatmentsBySpecialistId(this.userLogged.id)
    .pipe(takeUntil(this.destroy$)).subscribe(
      (res: TreatmentDto[]) => {
        this.treatments = res;
        console.log('TreatmentDto[]');
        console.log(res);
      }
    );
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
