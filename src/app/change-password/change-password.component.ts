import { Component, OnInit,ViewChild, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import {NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import{ webURL,apiURL } from 'src/app/global-constants';
import { ConfirmedValidator } from 'src/app/confirmed.validator';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  authForm:any= FormGroup;

  IsSubmitted: boolean=false;

  constructor(private router: Router,private commonservice: CommonService,private spinner: NgxSpinnerService,private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.authForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required, Validators.minLength(6)]],
    },
    {

      validator: ConfirmedValidator('password', 'password_confirmation')

    }

    );
  }
  onSubmit():void{

    this.IsSubmitted=true;

     if (this.authForm.status == "VALID") {

         this.spinner.show('syncSpinner');



          this.commonservice.postData(this.authForm.value, "changePassword").subscribe(res => {

          this.spinner.hide('syncSpinner');


          if (res.status) {

          this.commonservice.showSuccess(res.message, "Password");

          this.IsSubmitted=false;
          this.authForm.reset();
          }
          else{
            let errors=res.error;

            for (let error of errors)
            {
             this.commonservice.showError(error, "Password")
            }
           }
          },
            err => {
                this.spinner.hide('syncSpinner');
                if(err.status==401)
                {
                 this.router.navigate(['/unauthorized']);
                }
                this.commonservice.showError(err.message, "Password")

            });

     }


    }
}
