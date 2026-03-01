import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonService } from '../../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import * as Global from 'src/app/global-constants';

import { ConfirmationDialogService } from 'src/app/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.css']
})
export class AppointmentsComponent implements OnInit {
  Global = Global;
  @ViewChild('new_popover') public new_popover: NgbPopover;
  showPopup:any=false;
  appointments: any = [];
  totalCount: number = 10;
  offset: any = 0;
  itemsPerPage: any = 100;
  select_customer: any = '';
  direction: any = '';
  p: number = 1;
  currentValue: any = {};
  @ViewChild('content', { static: false }) private content: any;

  constructor(private confirmationDialogService: ConfirmationDialogService, private modalService: NgbModal, private router: Router, private commonservice: CommonService, private spinner: NgxSpinnerService) { }

  closeResult = '';

  selected_customer: any;

  ngOnInit(): void {
    this.commonservice.setDuration.next('');
    this.commonservice.newCustomer.subscribe(customer => {
      if (customer.id != '' && typeof customer.id != 'undefined') {
        this.p = 1;
        this.offset = 0;
        this.select_customer = customer.id;
        this.currentweekAppointments();
        this.selected_customer = customer;
        window.scroll(0, 0);


      }
    });
    this.commonservice.afterAppointment.subscribe(customer_id => {

      if (customer_id != '' && typeof customer_id != 'undefined') {
        this.appointments = [];
        this.p = 1;
        this.offset = 0;
        this.select_customer = customer_id;
        this.currentweekAppointments();
        this.modalService.dismissAll();
        window.scroll(0, 0);


      }
    });
    this.commonservice.newAppointment.subscribe(data => {
      if (data != '' && typeof data != 'undefined') {

        this.p = 1;
        this.offset = 0;
        this.currentweekAppointments();
        this.modalService.dismissAll();
        window.scroll(0, 0);
      }
    });



  }
  open(content: any) {
    let body = this.selected_customer;
    body.customer_notes = body['notes'];
    delete body['notes'];
    this.commonservice.presentCustomer.next(this.selected_customer);
    this.commonservice.setNav.next(2);
    this.commonservice.customerTab.next(false);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

    }, (reason) => {
      this.commonservice.customerTab.next(true);
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
  currentweekAppointments() {
    if (this.select_customer != '') {

      this.spinner.show('syncSpinner');
      let body = { customer_id: this.select_customer, start: this.offset };
      this.commonservice.postData(body, "appointment/dashboard").subscribe(res => {
        this.spinner.hide('syncSpinner');
        if (res.status) {
          this.appointments = res.data.appointments;
          this.totalCount = res.data.totalCount;
        }
      },
        err => {
          this.spinner.hide('syncSpinner');
          if (err.status == 401) {
            this.router.navigate(['/unauthorized']);
          }
          this.commonservice.showError(err.message, "Dashboard")

        });


    }
  }


  getPage(page) {
    this.offset = (page - 1) * this.itemsPerPage;
    this.currentweekAppointments();
  }
  setDate(search_date) {

    let start_date = moment(search_date).format('YYYY-MM-DD');
    let selectedMoment = new Date(search_date);
    window.localStorage.setItem('selectedMoment', start_date);
    this.router.navigateByUrl("calender");

  }
  editEvent() {
    this.spinner.show('syncSpinner');

    let body = { id: this.currentValue.id };

    this.commonservice.postData(body, "viewAppointment").subscribe(res => {

      this.spinner.hide('syncSpinner');

      if (res.status) {
        let currentDataSet = res.data;
        let dt = moment(currentDataSet.start_time);
        let year = parseInt(dt.format('YYYY'));
        let mm = parseInt(dt.format('MM'));
        let dd = parseInt(dt.format('DD'));
        let hh = parseInt(dt.format('HH'));
        let ii = parseInt(dt.format('mm'));
        let ss = parseInt(dt.format('ss'));

        currentDataSet.start_time = new Date(year, (mm - 1), dd, hh, ii, ss);




        this.commonservice.setDuration.next(currentDataSet);
        this.commonservice.setNav.next(2);
        this.modalService.open(this.content, { size: 'lg', backdrop : 'static',keyboard : false }).result.then((result) => {

        }, (reason) => {

        });
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
  copyEvent() {
    this.spinner.show('syncSpinner');

    let body = { id: this.currentValue.id };

    this.commonservice.postData(body, "viewAppointment").subscribe(res => {

      this.spinner.hide('syncSpinner');

      if (res.status) {
        let currentDataSet = res.data;
        let dt = moment(currentDataSet.start_time);
        let year = parseInt(dt.format('YYYY'));
        let mm = parseInt(dt.format('MM'));
        let dd = parseInt(dt.format('DD'));
        let hh = parseInt(dt.format('HH'));
        let ii = parseInt(dt.format('mm'));
        let ss = parseInt(dt.format('ss'));

        currentDataSet.start_time = new Date(year, (mm - 1), dd, hh, ii, ss);


        currentDataSet.select_staff_id = currentDataSet.staff_id;
        currentDataSet.start_time = new Date(currentDataSet.start_time);
        currentDataSet.id = "";
        currentDataSet.staff_id = "";
        currentDataSet.is_duplicate = true;
        this.commonservice.setDuration.next(currentDataSet);
        this.commonservice.setNav.next(2);
        this.modalService.open(this.content, { size: 'lg', backdrop : 'static',keyboard : false }).result.then((result) => {

        }, (reason) => {

        });
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
  deleteEvent() {


    this.confirmationDialogService.confirm('Please confirm..', 'Do you really want to Remove this... ?')

      .then((confirmed) => {

        if (confirmed) {

          this.spinner.show('syncSpinner');

          let body = { id: this.currentValue.id };

          this.commonservice.postData(body, "appointment/delete").subscribe(res => {

            this.spinner.hide('syncSpinner');

            if (res.status) {

              this.commonservice.showError(res.message, "Calender");
              this.p = 1;
              this.offset = 0;
              this.currentweekAppointments();

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


      })

      .catch(() => console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)'));
  }
  closePopup()
  {
    this.showPopup=false;

  }
  enCoded(str:any){
    return btoa(str);
  }
  addFovorite(popupData:any)
  {
    let body={'appoinment_id': popupData?.id};
    this.commonservice.postData(body, "add-favourite").subscribe(
      (res) => {
        this.spinner.hide('syncSpinner');

        if (res.status) {
          this.currentValue.favourite_dtls.is_favourite=!(+this.currentValue.favourite_dtls.is_favourite);

        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Calender");
      }
      );
  }
}
