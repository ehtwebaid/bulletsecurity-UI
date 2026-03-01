import { Component, OnInit,ViewChild, AfterViewInit  } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import {NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../../service/common.service';
import { ConfirmationDialogService } from 'src/app/confirmation-dialog/confirmation-dialog.service';

import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-services-setting',
  templateUrl: './services-setting.component.html',
  styleUrls: ['./services-setting.component.css']
})
export class ServicesSettingComponent implements OnInit {
  customerTbaactive = 1;
  serviceAdd:boolean = false;
  services:any=[];
  serviceForm:any= FormGroup;
  IsSubmitted:boolean=false;

  constructor(private router: Router,private commonservice: CommonService,private spinner: NgxSpinnerService,private modalService: NgbModal,private formBuilder: FormBuilder,private activatedRoute: ActivatedRoute,private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit(): void {


  this.serviceForm = this.formBuilder.group({
      id: [''],
      minutes: ['', Validators.required],
      name:['', Validators.required],
      description: [''],
      color: ['#3788D8',Validators.required],
      border_color: ['#75b8ad',Validators.required],


    });
   this.fetchService();


  }

  addService()
  {
    this.serviceAdd = true;
  }

  addServiceClose()
  {
    this.serviceAdd = false;
  }

  onSubmit()
  {
      this.IsSubmitted=true;

      if (this.serviceForm.status == "VALID") {

      this.spinner.show('syncSpinner');

      this.commonservice.postData(this.serviceForm.value, "service/add").subscribe(res => {

      this.spinner.hide('syncSpinner');


      if (res.status) {

      this.commonservice.showSuccess(res.message, "Service");

      this.fetchService();

      this.serviceForm.reset();

      this.IsSubmitted=false;

      this.serviceForm.patchValue({color:'#3788D8'});



      }
      else{
        let errors=res.error;

        for (let error of errors)
        {
         this.commonservice.showError(error, "Service")
        }
       }
      },
        err => {
            this.spinner.hide('syncSpinner');
            if(err.status==401)
            {
             this.router.navigate(['/unauthorized']);
            }
            this.commonservice.showError(err.message, "Service")

        });

 }

 }
 fetchService()
 {
    this.spinner.show('syncSpinner');
    this.commonservice.postData("", "service/listing").subscribe(res => {
    this.spinner.hide('syncSpinner');
    if (res.status) {
    this.services=res.data.data;
     this.serviceAdd=false;
     let is_addService=window.localStorage.getItem('is_addService');
    if(is_addService!=null)
    {
      this.serviceAdd=true;
      window.localStorage.removeItem("is_addService");
    }
    }
    },
    err => {
        this.spinner.hide('syncSpinner');
        if(err.status==401)
        {
         this.router.navigate(['/unauthorized']);
        }
        this.commonservice.showError(err.message, "Calender")

    });
 }
 editServive(item)
 {
     this.serviceForm.patchValue(item);
     this.serviceAdd=true;
 }
 deleteServive(id:any='',index:any='')
 {
     event.stopPropagation();
    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to Remove this... ?')

     .then((confirmed) => {

     if(confirmed) {

      this.spinner.show('syncSpinner');

      let body={id:id};

     this.commonservice.postData(body, "service/delete").subscribe(res => {

      this.spinner.hide('syncSpinner');

      if (res.status) {

      this.commonservice.showError(res.message, "Service")
      this.services.splice(index, 1);

      }
      },
      err => {
          this.spinner.hide('syncSpinner');
          if(err.status==401)
          {
           this.router.navigate(['/unauthorized']);
          }
          this.commonservice.showError(err.message, "Service")

      });


     }


     })

     .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
 }

}
