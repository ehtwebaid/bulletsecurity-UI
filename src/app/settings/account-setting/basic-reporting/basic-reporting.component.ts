import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { UpperCasePipe, DatePipe } from '@angular/common';
@Component({
  selector: 'app-basic-reporting',
  templateUrl: './basic-reporting.component.html',
  styleUrls: ['./basic-reporting.component.css']
})
export class BasicReportingComponent implements OnInit {

  meetings: any = [];
  staffs: any = [];
  services: any = [];
  searchForm: FormGroup;
  page_no:any=0;
  rowsTotal:any='';
  itemsPerPage:any=150;
  p: number;
  constructor(private router: Router, private commonservice: CommonService, private formBuilder: FormBuilder, private spinner: NgxSpinnerService, public upperCasePipe: UpperCasePipe, private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.Loading();
    this.searchForm = this.formBuilder.group({
      staff_id: [null],
      customerservice_id: [null],
      start_date: [''],
      end_date: [''],

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
  async fetchServices() {
    let body = { ignore_delete: 1 };
    await this.commonservice.postDataAsync(body, "service/listing").then(res => {

      if (res.status) {

        this.services = res.data.data;

      }
    },
      err => {
        if (err.status == 401) {
          this.router.navigate(['/unauthorized']);
        }
        this.commonservice.showError(err.message, "Calender")

      });
  }
  async Loading() {
    this.spinner.show('syncSpinner');
    await this.fetchStaffs();
    await this.fetchServices();
    await this.Search();
    this.spinner.hide('syncSpinner');
  }

  getPage(page:any) {
    this.page_no = (page-1)*this.itemsPerPage;
    this.Search();
  }

  async Search() {
    if (this.searchForm.value.start_date != '' && this.searchForm.value.end_date != '') {
      this.searchForm.value.start_date = moment(this.searchForm.value.start_date).format('YYYY-MM-DD');
      this.searchForm.value.end_date = moment(this.searchForm.value.end_date).format('YYYY-MM-DD');
    }
    await this.commonservice.postDataAsync({...this.searchForm.value,...{page_no: this.page_no, itemsPerPage: this.itemsPerPage}}, "monthlyReport").then(res => {
      if (res.status) {
        this.meetings = res.data;
        this.rowsTotal=res.rowsTotal;

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

  async filterData() {
    this.spinner.show('syncSpinner');
    await this.Search();
    this.spinner.hide('syncSpinner');
  }

  exportExcel() {
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('ProductData');
    worksheet.columns = [
      { header: 'SL', key: 'sl', width: 10 },
      { header: 'Appt. Date', key: 'appt_date', width: 32 },
      { header: 'Appt. Time', key: 'appt_time', width: 32 },
      { header: 'Service/Class', key: 'service_class', width: 32 },
      { header: 'Staff', key: 'staff', width: 32 },
      { header: 'Customer', key: 'customer', width: 32 },
      { header: 'Phone', key: 'phone', width: 32 },
      { header: 'Booking ID', key: 'booking_id', width: 32 },
      { header: 'Job Notes', key: 'job_notes', width: 32 },
      { header: 'Project Manager', key: 'project_manger', width: 32 },
      { header: 'Extra Material', key: 'extra_material', width: 32 },
      { header: 'Work Done', key: 'work_done', width: 32 },
      { header: 'Time In', key: 'time_in', width: 32 },
      { header: 'Time Out', key: 'time_out', width: 32 },
      { header: 'Last Action', key: 'last_action', width: 32 },
      { header: 'Last Action BY', key: 'last_action_by', width: 32 },



    ];
    let sl_no = 1;

    this.meetings.forEach(data => {
      let appt_date = this.datePipe.transform(data.start_time, 'MMM d, y');
      let appt_time = this.datePipe.transform(data.start_time, 'h:mm') + "-" + this.datePipe.transform(data.end_time, 'h:mm a');
      let service_class = data.service != null ? data.service.name : 'N/A';
      let customer = data.customer != null ? data.customer.name : 'N/A';
      let staff = data.staff.name;
      let booking_id = data.code;
      let phone = data.customer != null ? data.customer.mobile : 'N/A';
      let status = this.upperCasePipe.transform(data.current_status);
      let notes = data.notes ? this.upperCasePipe.transform(data.notes) : 'N/A';
      let project_manager = data.project_manager ? this.upperCasePipe.transform(data.project_manager) : 'N/A';
      let extra_material = data.extra_materials ? this.upperCasePipe.transform(data.extra_materials) : 'N/A';
      let work_done = data.current_status == 'C' ? 'Complete' : 'Incomplete';
      let time_in = data.time_in ? data.time_in : 'N/A';
      let time_out = data.time_out ? data.time_out : 'N/A';

      let row = {
        sl: sl_no, appt_date: appt_date, appt_time: appt_time, service_class: service_class, staff: staff, customer: customer,
        phone: phone, booking_id: booking_id, job_notes: notes, project_manger: project_manager, extra_material: extra_material,
        work_done: work_done, time_in: time_in, time_out: time_out,last_action:data.last_action,last_action_by:data.last_action_by
      };
      worksheet.addRow(row, "n");
      sl_no++;
    });

    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, 'appointment.xlsx');
    })
  }



}
