import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {

  meetings: any = [];
  staffs: any = [];
  logs: any = [];
  searchForm: FormGroup;
  page_no:any=0;
  rowsTotal:any='';
  itemsPerPage:any=150;
  p: number;
  offset: any = 0;
  limit: any = 10;
  loadItem: boolean = false;
  search_key: any = "";
  clickclientSubject: Subject<void> = new Subject<void>();
  selected_customer: any = "";
  clients: any = [];
  cutomer_services:any=[];
  constructor(private router: Router, private commonservice: CommonService, private formBuilder: FormBuilder, private spinner: NgxSpinnerService, public upperCasePipe: UpperCasePipe, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.Loading();
    this.searchForm = this.formBuilder.group({
      staff_id: [null],
      customer_id: [null],
      code: [""],
      start_date: [''],
      end_date: [''],
      customerservice_id:[null]
    });
    this.clickclientSubject.pipe(
      debounceTime(1000) // Debounce time of 300ms
    ).subscribe(() => {
      this.offset = 0;
      this.limit = 10;
      this.selected_customer = "";
      this.initCustomers();
    });
  }
  async fetchStaffs() {

    let body = { ignore_delete: 1 }
    await this.commonservice.postDataAsync(body, "listStaff").then(res => {
      if (res.status) {
        this.staffs = res.data;
      }
    },
      err => {
        this.spinner.hide('syncSpinner');
        if (err.status == 401) {
          this.router.navigate(['/unauthorized']);
        }
        this.commonservice.showError(err.message, "Basic Reporting")

      });
  }
  async fetchLog() {

    if(this.searchForm.value?.start_date && this.searchForm.value?.end_date)
    {
      this.searchForm.value.start_date=moment(this.searchForm.value?.start_date).format('YYYY-MM-DD');
      this.searchForm.value.end_date=moment(this.searchForm.value?.end_date).format('YYYY-MM-DD');
    }
    let body = {...{page_no: this.page_no,itemsPerPage:this.itemsPerPage},...this.searchForm.value};
    this.spinner.show('syncSpinner');
    await this.commonservice.postDataAsync(body, "viewLog").then(res => {
      this.spinner.hide('syncSpinner');
      if (res.status) {

        this.logs = res.data.data;
        this.rowsTotal=res.rowsTotal;


      }
    },
      err => {
        this.spinner.hide('syncSpinner');
        if (err.status == 401) {
          this.router.navigate(['/unauthorized']);
        }
        this.commonservice.showError(err.message, "Calender")

      });
  }
  async Loading() {
    this.spinner.show('syncSpinner');
    await this.fetchStaffs();
    await this.fetchLog();
    this.fetchServices();
    this.spinner.hide('syncSpinner');
  }

  getPage(page:any) {
    this.page_no = (page-1)*this.itemsPerPage;
    this.Search();
  }

  async Search() {
    this.page_no=0;
    this.fetchLog();
  }

  async filterData() {
    this.spinner.show('syncSpinner');
    await this.Search();
    this.spinner.hide('syncSpinner');
  }
  async initCustomers() {
    this.loadItem = true;
    let body = {
      name: this.search_key,
      offset: this.offset,
      limit: this.limit,
      id: this.selected_customer,
    };
    await this.commonservice.postDataAsync(body, "dailyCustomers").then(
      (res) => {
        this.loadItem = false;
        if (res.status) {
          if (this.offset == 0) {
            this.clients = res.data.data;
          } else {
            res.data.data.forEach((item) => {
              this.clients.push(item);
            });
          }

        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Dashboard");
      }
    );
  }
  async allCustomers(ev: any = "") {
    this.search_key = ev.term;
    this.clickclientSubject.next();
  }
  resetOffset() {
    this.offset += this.limit;
    this.initCustomers();
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.clickclientSubject.unsubscribe();
  }

  async fetchServices() {
    this.commonservice.postDataAsync("", "service/listing").then(
      (res) => {
        if (res.status) {
          this.cutomer_services = res.data.data;

        }
      },
      (err) => {
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Calender");
      }
    );
  }


}
