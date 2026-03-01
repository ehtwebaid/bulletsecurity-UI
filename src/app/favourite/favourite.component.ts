import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CommonService } from '../service/common.service';
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from 'moment';
import * as Global from 'src/app/global-constants';
import Swal from 'sweetalert2';

import { ConfirmationDialogService } from 'src/app/confirmation-dialog/confirmation-dialog.service';
@Component({
  selector: 'app-favourite',
  templateUrl: './favourite.component.html',
  styleUrls: ['./favourite.component.css']
})
export class FavouriteComponent implements OnInit {
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
    this.p = 1;
        this.offset = 0;
        this.currentweekAppointments();
        window.scroll(0, 0);

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


      this.spinner.show('syncSpinner');
      let body = {start: this.offset };
      this.commonservice.postData(body, "my-favourite").subscribe(res => {
        this.spinner.hide('syncSpinner');
        if (res.status) {
          this.appointments = res.data.appointments;
          this.totalCount = res.data.totalCount;
          //document.write(JSON.stringify(this.appointments));
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


        if (currentDataSet.time_in) {
          let dt_time_in = currentDataSet.time_in.split(":");

          let hh_time_in = parseInt(dt_time_in[0]);
          let ii_time_in = parseInt(dt_time_in[1]);
          let ss_time_in = parseInt(dt_time_in[2]);
          currentDataSet.time_in = new Date(year, (mm - 1), dd, hh_time_in, ii_time_in, ss_time_in);

        }
        if (currentDataSet.time_out) {
          let dt_time_out = currentDataSet.time_out.split(":");

          let hh_time_out = parseInt(dt_time_out[0]);
          let ii_time_out = parseInt(dt_time_out[1]);
          let ss_time_out = parseInt(dt_time_out[2]);
          currentDataSet.time_out = new Date(year, (mm - 1), dd, hh_time_out, ii_time_out, ss_time_out);
        }


        this.commonservice.setDuration.next(currentDataSet);
        this.commonservice.setNav.next(2);
        this.modalService.open(this.content, { size: 'lg' }).result.then((result) => {

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


        if (currentDataSet.time_in) {
          let dt_time_in = currentDataSet.time_in.split(":");

          let hh_time_in = parseInt(dt_time_in[0]);
          let ii_time_in = parseInt(dt_time_in[1]);
          let ss_time_in = parseInt(dt_time_in[2]);
          currentDataSet.time_in = new Date(year, (mm - 1), dd, hh_time_in, ii_time_in, ss_time_in);

        }
        if (currentDataSet.time_out) {
          let dt_time_out = currentDataSet.time_out.split(":");

          let hh_time_out = parseInt(dt_time_out[0]);
          let ii_time_out = parseInt(dt_time_out[1]);
          let ss_time_out = parseInt(dt_time_out[2]);
          currentDataSet.time_out = new Date(year, (mm - 1), dd, hh_time_out, ii_time_out, ss_time_out);
        }



        currentDataSet.select_staff_id = currentDataSet.staff_id;
        currentDataSet.start_time = new Date(currentDataSet.start_time);
        currentDataSet.id = "";
        currentDataSet.staff_id = "";
        currentDataSet.is_duplicate = true;
        this.commonservice.setDuration.next(currentDataSet);
        this.commonservice.setNav.next(2);
        this.modalService.open(this.content, { size: 'lg' }).result.then((result) => {

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
  async deleteEvent() {

    await Swal.fire({
      title: 'Please confirm..',
      text: 'Do you really want to Remove this... ?',
      icon: 'info',
      showCancelButton: true,
      showCloseButton: true,

    }).then(async (result) => {

      if (result.value) {
       this.deleteAction();

      } else if (result.dismiss === Swal.DismissReason.cancel) {

        console.log("Cancel");

      }

    })
  }
  deleteAction(){
        this.spinner.show('syncSpinner');

          let body = { appoinment_id: this.currentValue.id };

          this.commonservice.postData(body, "add-favourite").subscribe(res => {

            this.spinner.hide('syncSpinner');

            if (res.status) {

              this.commonservice.showError(res.message, "Favourite");
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


  closePopup()
  {
    this.showPopup=false;

  }
  enCoded(str:any){
    return btoa(str);
  }

}
