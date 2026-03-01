import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  closeResult = '';

  Navactive = 1;

  appointments:any;

  week_start:any;

  week_end:any;

  clients:any=[];

  selectedCustomer:any='';

  keyword = 'name';

  formatter:any;

  clientForm:any=FormGroup;

  constructor(private modalService: NgbModal,private router: Router,private commonservice: CommonService,
  private formBuilder: FormBuilder, private spinner: NgxSpinnerService) { }


  ngOnInit(): void {

   this.clientForm =  this.formBuilder.group({
   client: [''],
   })

  this.currentweekAppointments();
  this.commonservice.newAppointment.subscribe(appointment => {
  if(appointment!='')
  {
     this.currentweekAppointments();
     this.modalService.dismissAll();
  }

  });
  }

  open(content: any) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  currentweekAppointments()
  {
     this.spinner.show('syncSpinner');
     this.commonservice.postData("", "appointment/dashboard").subscribe(res => {
    this.spinner.hide('syncSpinner');
    if (res.status) {

    this.appointments=res.data.appointments;

    this.week_start=res.data.week_start;

    this.week_end=res.data.week_end;

    }
  },
    err => {
        this.spinner.hide('syncSpinner');
        if(err.status==401)
        {
         this.router.navigate(['/unauthorized']);
        }
        this.commonservice.showError(err.message, "Dashboard")

    });
  }

}
