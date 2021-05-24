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
import { CreateUpdateReportDto } from '../../../models/dto/report/CreateUpdateReportDto';


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
  public isReports: boolean = false;
  
  public treatments: TreatmentDto[] = [];
  public isTreatments: boolean = false;

  public updateCreateForm: FormGroup;

  public createUpdateTreatmentDto: TreatmentDto = new TreatmentDto;

  public observableupdateCreateForm: Subscription = new Subscription();

  public showButtonsForm: boolean = false;


  public textModal: string = '';

  public textPlaceholderNgSelect: string = 'Find by patient name'; 
  

  public textErrorMaxLengthDiagnosis: string = '';
  public textErrorMaxLengthObjectives: string = ''; 


  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private reportService: ReportService,
    private treatmentService: TreatmentService) { }

  ngOnInit(): void {

    console.log('hello report component ngOnInit()')
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
    if (this.treatments.length>0) {
      this.textModal = 'Create ';
    console.log('open modal Create')

    //set values form
    this.inicializeNewFormReport();

    this.modalService.open(this.updateCreate).result.then(

      r => {
        if (r === '1') { //confirm create    
          //this.createReport(this.updateCreateForm.value); //create report without ngSelect(without treatmentObject)
          this.createReportWithNgSelect();
        } else {
          //dimiss create
        }
      }
    );
    } else {
      this.toast.info('To add a report, you need to have a registered treatment', 'Info')
    }
    
  }

  inicializeNewFormReport() {
    this.observableupdateCreateForm.unsubscribe();
    this.showButtonsForm = false;
    this.updateCreateForm.reset();
    this.updateCreateForm.controls['date'].setValue('');
    this.updateCreateForm.controls['objectives'].setValue('');
    this.updateCreateForm.controls['diagnosis'].setValue('');
    //this.updateCreateForm.controls['treatmentId'].setValue('Select treatment');

    this.observableupdateCreateForm = this.updateCreateForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(
      (field) => {
        console.log('inicializeNewFormReport subscriber')

        if (this.updateCreateForm.controls['treatmentId'].value != null) {
          this.textPlaceholderNgSelect = '';
        } else {
          this.textPlaceholderNgSelect = 'Find by patient name';
        }



        let textDiagnosis = this.updateCreateForm.controls['diagnosis'].value
        if (textDiagnosis.length >255 ) {
          this.textErrorMaxLengthDiagnosis = 'diagnosis can be max 255 characters long.';
        } else {
          this.textErrorMaxLengthDiagnosis = '';
        } 
        
        let textErrorMaxLengthObjectives = this.updateCreateForm.controls['objectives'].value
        if (textErrorMaxLengthObjectives.length >255 ) {
          this.textErrorMaxLengthObjectives = 'objectives can be max 255 characters long.';
        } else {
          this.textErrorMaxLengthObjectives = '';
        } 


        if (this.updateCreateForm.valid &&
          this.updateCreateForm.controls['diagnosis'].value != '' &&
          this.updateCreateForm.controls['objectives'].value != '' &&
          this.updateCreateForm.controls['date'].value != '' &&
          this.updateCreateForm.controls['treatmentId'].value != null 
          /* && this.updateCreateForm.controls['treatmentId'].value != 0 */) {

          this.showButtonsForm = true;
        }
        else {
          this.showButtonsForm = false;
        }
        console.log('this.updateCreateForm.controls[treatmentId].value')
        console.log(this.updateCreateForm.controls['treatmentId'].value)
        console.log('this.updateCreateForm.value')
        console.log(this.updateCreateForm.value)
      }
    );

  }

  openModalEdit(reportDto: ReportDto, idx: number) {
    console.log('open modal update')
    this.textModal = 'Update ';
    this.inicializeFormWithReport(reportDto, idx);
    this.modalService.open(this.updateCreate).result.then(
      r => {
        if (r === '1') {
          console.log('SAVE')
          this.updateReport(this.updateCreateForm.value, reportDto.id, idx);
        } else {
          console.log('CANCEL')
        }
      }
    );
  }

  inicializeFormWithReport(r: ReportDto, idx: number) {
    this.observableupdateCreateForm.unsubscribe();
    this.updateCreateForm.reset();
    this.showButtonsForm = false;

    //for chech is value changes, show button save
    let _diagnosis = r.diagnosis;
    let _objectives = r.objectives;
    let _date = r.date;
    let _treatmentId = r.treatmentId;

    this.updateCreateForm.controls['diagnosis'].setValue(r.diagnosis);
    this.updateCreateForm.controls['objectives'].setValue(r.objectives);
    this.updateCreateForm.controls['date'].setValue(r.date);
    this.updateCreateForm.controls['treatmentId'].setValue(r.specialistFullName);


    this.observableupdateCreateForm = this.updateCreateForm.valueChanges.subscribe(
      (field) => {
        console.log('inicializeFormWithTreatment subscriber')

        if (this.updateCreateForm.valid && (
            _diagnosis != this.updateCreateForm.controls['diagnosis'].value ||
            _objectives != this.updateCreateForm.controls['objectives'].value ||
            _date != this.updateCreateForm.controls['date'].value ||
            _treatmentId != this.updateCreateForm.controls['treatmentId'].value)
          ) {
          this.showButtonsForm = true;
        } else {
          this.showButtonsForm = false;
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
        this.isReports = this.reports.length>0;
      }
    );
  }
  //ADMIN
  getAllReportsByClinic() {
    this.reportService.getReportsByClinicId(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: ReportDto[]) => {
          this.reports = res;
          this.isReports = this.reports.length>0;
        }
      );

  }

  //USER
  getAllReportsBySpecialist() {
    this.reportService.getReportsBySpecialistId(this.userLogged.id)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: ReportDto[]) => {
          this.reports = res;
          if(this.reports.length>0) this.isTreatments = true;
          this.isReports = this.reports.length>0;
        }
      );
  }

  //USER
  createReport(createReport: CreateUpdateReportDto) {
    this.reportService.create(createReport).pipe(takeUntil(this.destroy$)).subscribe(
      (res: ReportDto) => {
        this.reports.push(res)
        this.isReports = res != null;
        this.toast.success('Create report', 'Successfully');
      }
    );
  }

  //USER
  createReportWithNgSelect() {
    var reportSelected : TreatmentDto = this.updateCreateForm.controls['treatmentId'].value
    
    var formToSend : CreateUpdateReportDto = new CreateUpdateReportDto;
    formToSend.diagnosis = this.updateCreateForm.controls['diagnosis'].value
    formToSend.objectives = this.updateCreateForm.controls['objectives'].value
    formToSend.date = this.updateCreateForm.controls['date'].value

    formToSend.treatmentId = reportSelected.id;

    console.log('formToSend')
    console.log(formToSend)

    this.reportService.create(formToSend).pipe(takeUntil(this.destroy$)).subscribe(
      (res: ReportDto) => {
        this.reports.push(res)
        console.log(res)
        this.isReports =res != null;
        this.toast.success('Create report', 'Successfully')
      }
    );
  }

  //USER
  updateReport(updateReport: CreateUpdateReportDto, id:number, idx:number) {
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

  //ADMIN
  deleteReport(id: number, idx:number) {
    this.reportService.delete(id).pipe(takeUntil(this.destroy$)).subscribe(
      (res) => {
        this.reports.splice(idx, 1);
        this.isReports = this.reports.length>0;
        this.toast.success('Report deleted', 'Successfully');
      }
    );
  }

  //SUPERADMIN
  getAllTreatments() {
    this.treatmentService.getAllTreatments().pipe(takeUntil(this.destroy$)).subscribe(
      (res: TreatmentDto[]) => {
        this.treatments = res;
        if (this.treatments.length>0) this.isTreatments = true;
      }
    );
  }

  //ADMIN
  getAllTreatmentsByClinic() {
    this.treatmentService.getAllTreatmentsByClinicId(this.userLogged.clinicId)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto[]) => {
          this.treatments = res;
          if (this.treatments.length>0) this.isTreatments = true;
        }
      );
  }

  //USER
  getAllTreatmentsBySpecialist() {
    this.treatmentService.getAllTreatmentsBySpecialistId(this.userLogged.id)
      .pipe(takeUntil(this.destroy$)).subscribe(
        (res: TreatmentDto[]) => {
          this.treatments = res;
          if (this.treatments.length>0) this.isTreatments = true;
        }
      );
  }

  customSearchFn(term: string, item: TreatmentDto) {
    term = term.toLowerCase();
    return item.patientFullName.toLowerCase().indexOf(term) > -1 || item.patientFullName.toLowerCase() === term;
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
