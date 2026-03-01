import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.css']
})
export class CompanyDetailsComponent implements OnInit {
  editDetails:boolean = false;
  companyForm: FormGroup;
  IsSubmitted:boolean=false;
  companyDetail:any={};
  constructor(private router: Router,private commonservice: CommonService,private formBuilder: FormBuilder, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
  this.companyForm = this.formBuilder.group({
      id: [''],
      company_name: ['', Validators.required],
      industry: ['', Validators.required],
      phone_no: ['', Validators.required],
      currency: ['', Validators.required],
      country: ['', Validators.required],
    });
    this.spinner.show('syncSpinner');
    this.commonservice.postData("", "viewcompanySetting").subscribe(res => {
    this.spinner.hide('syncSpinner');
    if (res.status) {
    this.companyDetail= res.data;
    this.companyForm.patchValue(this.companyDetail);
   }
   else {
     let errors = res.error;
     for (let error of errors) {
       this.commonservice.showError(error, "Company Details")
     }
     this.commonservice.showWarning(res.message, "Company Details")
   }
 },
   err => {
      this.spinner.hide('syncSpinner');
      this.commonservice.showError(err.message, "Company Details")

   });



  }

  editDetailsBtn()
  {
    this.editDetails = !this.editDetails;
  }
  SubmitData()
  {
     this.IsSubmitted=true;
    if (this.companyForm.status == "VALID") {
    this.spinner.show('syncSpinner');
    this.commonservice.postData(this.companyForm.value, "editcompanySetting").subscribe(res => {
    this.spinner.hide('syncSpinner');
    if (res.status) {
     this.commonservice.showSuccess(res.message, "Company Details")
     this.IsSubmitted = false;
     this.companyDetail=this.companyForm.value;


   }
   else {
     let errors = res.error;
     for (let error of errors) {
       this.commonservice.showError(error, "Company Details")
     }
     this.commonservice.showWarning(res.message, "Company Details")
   }
 },
   err => {
      this.spinner.hide('syncSpinner');
      this.commonservice.showError(err.message, "Company Details")

   });



    }




  }
}
