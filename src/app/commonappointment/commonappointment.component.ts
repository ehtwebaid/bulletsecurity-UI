import { Component, OnInit,ElementRef,ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NgxSpinnerService } from "ngx-spinner";
@Component({
  selector: 'app-commonappointment',
  templateUrl: './commonappointment.component.html',
  styleUrls: ['./commonappointment.component.css']
})
export class CommonappointmentComponent implements OnInit {
  
  
  constructor(private router: Router) { }

  ngOnInit(): void {
  }
  
  


}
