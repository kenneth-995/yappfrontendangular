import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { pipe, Subject, Subscription } from 'rxjs';
import { concatMap, map, takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { UserService } from 'src/app/services/user.service';
import { ClinicService } from 'src/app/services/clinic.service';
import { UploadFileService } from 'src/app/services/upload-file.service';

import { ClinicDto } from 'src/app/models/dto/clinic/ClinicDto'
import { UpdateCreateClinicDto } from 'src/app/models/dto/clinic/UpdateCreateClinicDto'

import { User } from 'src/app/models/entities/user-model';

@Component({
  selector: 'app-clinic',
  templateUrl: './clinic.component.html',
  styleUrls: ['./clinic.component.css']
})
export class ClinicComponent implements OnInit {
  @ViewChild("modalDelete", { static: false }) modalDelete: TemplateRef<any>;
  @ViewChild("modalEdit", { static: false }) modalEdit: TemplateRef<any>;

  private destroy$ = new Subject();

  public userLogged: User;
  public roleUser: number;

  public clinic: ClinicDto;

  public file: File
  
  public uploadPhotoForm: FormGroup;
  public observableuploadPhotoForm: Subscription = new Subscription();

  public updateForm: FormGroup;
  public observableupdateForm: Subscription = new Subscription();

  public imageSrc: string;

  public showButtonsForm: boolean = false;


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toast: ToastrService,
    private modalService: NgbModal,
    private userService: UserService,
    private clinicService: ClinicService,
    private uploadFileService: UploadFileService) { }

  ngOnInit(): void {
  }

}
