import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-staff-services',
  templateUrl: './staff-services.component.html',
  styleUrls: ['./staff-services.component.css']
})
export class StaffServicesComponent implements OnInit {

  constructor(private router: Router,private commonservice: CommonService,private formBuilder: FormBuilder, private spinner: NgxSpinnerService) { }
  select_staff:any;
  services:any=[];
  ngOnInit(): void {
    this.commonservice.viewStaff.subscribe(body => {
    this.select_staff=body;
    this.fetchServices();
    })
  }
 fetchServices()
 {
     this.spinner.show('syncSpinner');

      let body={staff_id:this.select_staff.id};

      this.commonservice.postData(body, "weeklyService").subscribe(res => {

      this.spinner.hide('syncSpinner');


      if (res.status) {

      this.services=res.data.appointments;

      }

      },
        err => {
            this.spinner.hide('syncSpinner');
            if(err.status==401)
            {
             this.router.navigate(['/unauthorized']);
            }
            this.commonservice.showError(err.message, "Staff")

        });
 }
}
