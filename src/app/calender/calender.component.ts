import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { CalendarOptions, FullCalendarComponent } from "@fullcalendar/angular"; // useful for typechecking
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { Router, ActivatedRoute } from "@angular/router";
import { CommonService } from "../service/common.service";
import { ConfirmationDialogService } from "../confirmation-dialog/confirmation-dialog.service";
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from "moment";
import Pusher from "src/assets/js/pusher.min";
import { PUSHER_KEY, PUSHER_CLUSTER } from "src/app/global-constants";
import * as Global from "src/app/global-constants";
import Swal from 'sweetalert2';
import { ReverbWsService } from "../service/reverb-ws.service";
declare var $: any;
@Component({
  selector: "app-calender",
  templateUrl: "./calender.component.html",
  styleUrls: ["./calender.component.css"],
})
export class CalenderComponent implements OnInit {
  Global = Global;
  innerWidth: any = window.innerWidth;
  userDetails: any;
  selectedStaff: any = "";
  selectedMoment: any = "";
  calHeading: any = "";
  calSetting: any;
  initialView: any = "";
  staff_id: any = "";
  staffs: any = [];
  events: any;
  start_date: any = "";
  index: any = 0;
  service_name: any = "";
  reschedule_id: any = "";
  popupData: any = {};
  showPopup: boolean = false;
  is_recurring_apt: boolean = false;
  bulk_delete: boolean = false;
  next_appointment: boolean = false;
  updatedAppointments: any;
  calendermodes: any = [
    { text: "Monthly", value: "dayGridMonth" },
    { text: "Weekly", value: "timeGridWeek" },
    { text: "Daily", value: "resourceTimeGrid" },
  ];

  datepicker_open: boolean = false;
  appointmentDtl: any;
  contentHeight: any = (window.innerHeight * 84) / 100;
  calendarOptions: CalendarOptions = {
    schedulerLicenseKey: "0091685131-fcs-1639845459",
    datesAboveResources: false,
    editable: false,
    selectable: false,
    headerToolbar: false,
    allDaySlot: false,
    displayEventTime: false,
    eventOverlap: true,
    contentHeight: this.contentHeight,
    nowIndicator: true,
    dayHeaderFormat: {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
    slotLabelFormat: {
      hour: "numeric",
      minute: "2-digit",
      omitZeroMinute: true,
    },
    initialDate: moment().format("YYYY-MM-DD"),
    longPressDelay: 1,
    eventLongPressDelay: 1,
    selectLongPressDelay: 1,

    //timeZone: 'Pacific/Pitcairn',
    events: [],
    resourceOrder: "sort_order",
    eventResize: this.updateEvent.bind(this),
    eventDrop: this.updateEvent.bind(this),
    select: this.addEvent.bind(this),
    eventClick: this.openPopup.bind(this),
  };
  @ViewChild("calendar") calendarComponent: FullCalendarComponent;
  @ViewChild("appointModal", { static: false }) private appointModal: any;

  constructor(
    private router: Router,
    private commonservice: CommonService,
    private spinner: NgxSpinnerService,
    private modalService: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private activatedRoute: ActivatedRoute,
    private reverb: ReverbWsService
  ) { }
  ngOnInit(): void {
    sessionStorage.setItem('staff_id', this.staff_id);
    this.spinner.show('syncSpinner');
    this.commonservice.presentCustomer.next("");
    this.userDetails = JSON.parse(window.localStorage.getItem("userDetails"));
    this.commonservice.postData("", "setting/basicsetting").subscribe(
      (res) => {
        if (res.status) {
          this.calSetting = res.data;
          this.calendarOptions.slotDuration = "00:15";
          this.calendarOptions.slotLabelInterval = this.calSetting.slotDuration;
          this.calendarOptions.slotMinTime = "00:00:00";
          this.calendarOptions.firstDay = this.calSetting.firstDay;
          this.calendarOptions.initialView = this.calSetting.default_mode;
          this.calendarOptions.scrollTime = this.calSetting.slotMinTime;
          //this.calendarOptions.slotMaxTime=this.calSetting.end_hour;
          this.calendarOptions.weekends = true;

          this.calendarOptions.dayHeaderFormat = {
            weekday: 'long'
          };

          this.calendarOptions.businessHours = {
            startTime: this.calSetting.slotMinTime,
            endTime: this.calSetting.end_hour,
          };
          this.calendarOptions.editable = true;
          this.calendarOptions.selectable = true;
          if (parseInt(this.innerWidth) <= 667) {
            this.staff_id = this.userDetails.id;
          }

          this.initialView = this.calSetting.default_mode;

          //this.fetchStaffs();
          if (window.localStorage.getItem("selectedMoment") == null) {
            setTimeout(() => {
              this.fetchAppointments();
            }, 1600);
          } else {
            let selectedMoment_new = window.localStorage
              .getItem("selectedMoment")
              .split("-");
            this.selectedMoment = new Date(
              parseInt(selectedMoment_new[0]),
              parseInt(selectedMoment_new[1]) - 1,
              parseInt(selectedMoment_new[2])
            );
            setTimeout(() => {
              this.gotoData();
            }, 1600);

            //this.gotoData();
          }
        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');
        if (err.status == 401) {
          window.localStorage.clear();
          this.commonservice.showError("Please Login First", "Calender");
          this.router.navigate(["/"]);
        }
      }
    );
    //Pusher.logToConsole = true;

    let self_current = this;

    // SUBSCRIBE TO CHANNEL

     this.reverb.listenPublic('updateCalendar', '.updateCalendarData', (resp: any) => {

  if (!resp?.type) {
    if (
      !sessionStorage.getItem('staff_id') ||
      sessionStorage.getItem('staff_id') == resp?.data?.staff_id
    ) {
      this.refreshCalender(resp);
    }
  }
});

    this.commonservice.newAppointment.subscribe((data) => {
      if (data != "") {
        let selectDate = moment(this.selectedMoment).format("YYYY-MM-DD");
        let returnDate = moment(data.appointmentDtl.start_time).format(
          "YYYY-MM-DD"
        );
        //this.selectedMoment = new Date(data.appointmentDtl.start_time);
        const calendarApi = this.calendarComponent.getApi();
        this.modalService.dismissAll();
        this.commonservice.newAppointment.next("");
      }
    });
    this.commonservice.clearSchedule.subscribe((elem) => {
      if (elem) {
        this.reschedule_id = "";
        this.commonservice.clearSchedule.next(false);
      }
    });
  }

  nextAppointment(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.next(); // call a method on the Calendar object
    const currentDate = calendarApi.getDate();
    this.start_date = moment(currentDate).format("YYYY-MM-DD");
    window.localStorage.setItem("selectedMoment", this.start_date);
    this.selectedMoment = new Date(currentDate);

    this.fetchAppointments();
  }

  prevAppointment(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.prev();
    const currentDate = calendarApi.getDate();
    this.start_date = moment(currentDate).format("YYYY-MM-DD");
    window.localStorage.setItem("selectedMoment", this.start_date);
    this.selectedMoment = new Date(currentDate);

    this.fetchAppointments();
  }

  todayAppointment(): void {
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.today(); // call a method on the Calendar object
    const currentDate = calendarApi.getDate();
    this.start_date = moment(currentDate).format("YYYY-MM-DD");
    this.selectedMoment = new Date(currentDate);
    window.localStorage.setItem("selectedMoment", this.start_date);

    this.fetchAppointments();
  }

  fetchStaffs(): void {
    this.spinner.show('syncSpinner');;
    this.commonservice.postData("", "dailyStaff").subscribe(
      (res) => {

        this.spinner.hide('syncSpinner');;
        if (res.status) {
          this.staffs = res.data;
          this.calendarOptions.resources = this.staffs;
        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');;
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Calender");
      }
    );
  }

  fetchAppointments() {
    this.spinner.show('syncSpinner');;
    let body = {
      start_date: this.start_date,
      staff_id: this.staff_id,
      default_mode: this.initialView,
    };
    this.commonservice.postData(body, "appointment/listing").subscribe(
      (res) => {
        if (res.status) {
          this.staffs = res.data.staffs;
          this.datepicker_open = false;
          if (this.selectedStaff == "") {
            if (parseInt(this.innerWidth) <= 667) {
              this.selectedStaff = {
                id: this.userDetails.id,
                title: this.userDetails.name,
              };
              this.calendarOptions.resources = [this.selectedStaff];
            } else {
              this.calendarOptions.resources = this.staffs;
            }
          } else {
            this.calendarOptions.resources = [this.selectedStaff];
          }

          this.fetchbusinessHours();
          this.events = res.data.events;

          const calendarApi = this.calendarComponent.getApi();

          setTimeout(() => {
            if (calendarApi != null) {
              calendarApi.removeAllEventSources();
              calendarApi.addEventSource(this.events); //obligatory
              calendarApi.refetchEvents();
              this.updateTitle();
              this.calHeading = res.data.heading;
              this.spinner.hide('syncSpinner');;
            }
          }, 1600);
        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');;
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Calender");
      }
    );
  }

  changecalMode() {
    const calendarApi = this.calendarComponent.getApi();
    if (this.initialView == 'dayGridMonth') {
      this.calendarOptions.weekends = false;
    }
    else {
      this.calendarOptions.weekends = true;
    }
    calendarApi.changeView(this.initialView); // call a method on the Calendar object
    const currentDate = calendarApi.getDate();
    if (window.localStorage.getItem("selectedMoment") == null) {
      this.start_date = "";
      this.fetchAppointments();
    } else {
      let selectedMoment_new = window.localStorage
        .getItem("selectedMoment")
        .split("-");
      this.selectedMoment = new Date(
        parseInt(selectedMoment_new[0]),
        parseInt(selectedMoment_new[1]) - 1,
        parseInt(selectedMoment_new[2])
      );
      this.gotoData();
    }
  }
  updateTitle() {
    let loggedUser = this.userDetails;

    $(".appointment-details-not-open").removeClass(
      "appointment-details-not-open"
    );
    $(".appointment-details-moda-active").removeClass(
      "appointment-details-moda-active"
    );
    $(".has-popup-open").removeClass("has-popup-open");
    $(".no-eventtimegrid").removeClass("no-eventtimegrid");
    let current = this;
    this.events.forEach((currentValue: any) => {
      //document.write(JSON.stringify(currentValue));
      //alert(currentValue?.appointmentDtl.name);
      let total_slot =
        parseInt(currentValue?.appointmentDtl?.meeting_length) / 15;

      let desc = currentValue.description.replace(/(<([^>]+)>)/gi, "");
      let max_height = total_slot * 12;
      let event_title = "";
      if (currentValue.title != "") {
        event_title += "<p><span>" + currentValue.title + "</span></p>";
      }
      if (desc != "") {
        event_title += "<p><span>" + desc + "</span></p>";
      }
      if (this.initialView == 'dayGridMonth') {
        let custName = currentValue?.appointmentDtl?.name?.substr(0, 40) ?? "N/A";
        event_title = "<p><span>" + custName + "</span></p>";
      }
      $(".myclass" + currentValue.id)
        .find(".fc-event-title")
        .html(event_title);
      $(".myclass" + currentValue.id).css({
        color: currentValue.border_color + "!important",
      });

      let event_tooltip =
        $($.parseHTML(currentValue.title)).text() +
        $($.parseHTML(currentValue.description)).text();

      $(".myclass" + currentValue.id)
        .find(".fc-event-title")
        .attr("title", event_tooltip);
      $(".myclass" + currentValue.id)
        .find(".fc-event-title")
        .css({
          overflow: "hidden",
          "text-overflow": "ellipsis",
          display: "block",
          "max-height": "" + max_height + "px",
          "-webkit-line-clamp": "1",
        });

      $(".myclass" + currentValue.id)
        .find(".fc-event-title-container")
        .css({ position: "relative" });
    });
  }

  async updateEvent(event: any) {
    let dayName = moment(event.event.start).format("dddd");
    let resourceId = event.event._def.resourceIds;
    let body: any = {
      start_time: moment(event.event.start).format("YYYY-MM-DD HH:mm:ss"),
      end_time: moment(event.event.end).format("YYYY-MM-DD HH:mm:ss"),
      id: event.event.id,
      staff_id: resourceId[0],
    };
    if (event.event.extendedProps.appointmentDtl.is_recurring && event.event.extendedProps.appointmentDtl.next_appointment) {

      await Swal.fire({
        title: 'Please confirm..',
        text: 'JUST this  appointment or ALL FUTURE appointments... ?',
        icon: 'info',
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'All future appoinments',
        cancelButtonText: 'Only this appoinment'
      }).then(async (result) => {

        if (result.value) {
          body.bulk_update = true;
          this.dragdropEvent(body);

        } else if (result.dismiss === Swal.DismissReason.cancel) {
          body.bulk_update = false;
          this.dragdropEvent(body);


        }
        else if (result.dismiss === Swal.DismissReason.close) {
          event.revert();
        }
      })
    }
    else {
      this.dragdropEvent(body);
    }

  }
  async dragdropEvent(body) {
    await this.spinner.show('syncSpinner');;

    await this.commonservice.postData(body, "appointment/edit").subscribe(
      (res) => {
        this.spinner.hide('syncSpinner');;
        if (res.status) {
          this.commonservice.showSuccess(res.message, "Calender");
        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');;
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Calender");
      }
    );
  }
  addEvent(event: any) {
    $(".appointment-details").fadeOut();

    let start = moment(event.startStr);

    let end = moment(event.endStr);

    let duration = end.diff(start, "minutes");

    let service_name = duration + " Mins Meeting";

    let weekend = moment(event.start).format("ddd");
    // if(seconds<MinTime_seconds || seconds>=EndHour_seconds)
    // {
    //   this.commonservice.showError("Not Allowed", "Calender")

    // }
    // else if(seconds<startTime_seconds || seconds>=endTime_seconds)
    // {
    //   this.commonservice.showError("Not Allowed", "Calender")

    // }
    // else{
    if (this.reschedule_id == "") {
      let body = {
        duration: duration,
        start_time: new Date(event.start),
        service_name: service_name,
        staff_id:
          typeof event.resource != "undefined"
            ? event.resource.id
            : this.staff_id,
      };

      this.commonservice.setDuration.next(body);

      this.modalService.open(this.appointModal, { size: "lg", backdrop: 'static', keyboard: false }).result.then(
        (result) => { },
        (reason) => { }
      );
    } else {
      let body = {
        id: this.reschedule_id,
        start_time: moment(event.start).format("YYYY-MM-DD HH:mm:ss"),
        is_recurring: this.is_recurring_apt,
        staff_id:
          typeof event.resource != "undefined"
            ? event.resource.id
            : this.staff_id,
      };
      this.submitReschdule(body);
    }
    //}
  }
  reschdule(reschedule_id, is_recurring: any = false, next_appointment: any = false) {
    this.reschedule_id = reschedule_id;
    this.is_recurring_apt = is_recurring;
    this.next_appointment = next_appointment;
    this.commonservice.showReschedule(
      "Select a slot to reschedule",
      "Calender"
    );

    $("#popup_id" + this.reschedule_id + " .close_btn").trigger("click");
  }
  async submitReschdule(body) {
    body.bulk_update = false;
    if (this.is_recurring_apt && this.next_appointment) {
      await Swal.fire({
        title: 'Please confirm..',
        text: 'JUST this  appointment or ALL FUTURE appointments... ?',
        icon: 'info',
        showCancelButton: true,
        showCloseButton: true,
        confirmButtonText: 'All future appoinments',
        cancelButtonText: 'Only this appoinment'
      }).then(async (result) => {
        if (result.value) {
          body.bulk_update = true;
          this.reshcduleAction(body);
        }
        else if (result.dismiss === Swal.DismissReason.cancel) {
          body.bulk_update = false;
          this.reshcduleAction(body);
        }
        else if (result.dismiss === Swal.DismissReason.close) {
          this.reschedule_id = "";
          this.commonservice.clearToast();
        }
      })
    }
    else {
      this.reshcduleAction(body);

    }


  }
  async reshcduleAction(body) {
    await this.spinner.show('syncSpinner');;
    await this.commonservice.postData(body, "reSchedule").subscribe(
      (res) => {
        this.spinner.hide('syncSpinner');;
        if (res.status) {
          this.commonservice.showSuccess(res.message, "Calender");
          this.reschedule_id = "";
          this.commonservice.clearToast();
        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');;
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Calender");
      }
    );
  }
  gotoData() {
    const calendarApi = this.calendarComponent.getApi();
    this.start_date = moment(this.selectedMoment).format("YYYY-MM-DD");
    if (calendarApi != null) {
      calendarApi.gotoDate(this.start_date); // call a method on the Calendar object

      window.localStorage.setItem("selectedMoment", this.start_date);

      this.datepicker_open = false;

      this.fetchAppointments();
    }
  }

  openPopup(arg: any) {
    this.appointmentDtl = arg.event.extendedProps.appointmentDtl;
    if (this.appointmentDtl) {
      this.popupData = arg.event.extendedProps;
      this.showPopup = true;

      setTimeout(() => {
        $("#popup-info td img").css({ 'cursor': 'pointer' });                     //<<<---using ()=> syntax

        $("#popup-info td img").click(function () {
          window.open($(this).attr("src"), '_blank');

        })
      }, 1500);
    }


  }
  async deleteEvent() {

    this.bulk_delete = false;
    let alert_text;
    if (this.appointmentDtl.is_recurring && this.appointmentDtl.next_appointment) {
      alert_text = "JUST this  appointment or ALL FUTURE appointments...";
    }
    else {
      alert_text = "Do you really want to Remove this... ?";
    }
    await Swal.fire({
      title: 'Please confirm..',
      text: alert_text,
      icon: 'info',
      showCancelButton: (this.appointmentDtl.is_recurring && this.appointmentDtl.next_appointment),
      showCloseButton: true,
      showConfirmButton: true,
      showDenyButton: false,
      denyButtonText: 'Cancel',
      confirmButtonText: (this.appointmentDtl.is_recurring && this.appointmentDtl.next_appointment) ? 'All future appoinments' : 'Yes',
      cancelButtonText: 'Only this appoinment',
      customClass: {
        actions: 'my-actions',
        cancelButton: 'order-2 ',
        confirmButton: 'order-1',
        denyButton: 'order-3',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (this.appointmentDtl.is_recurring) {
          this.bulk_delete = true;
        }
        this.deleteAction();
      }

      else if (result.isDismissed) {
        if (result.dismiss === Swal.DismissReason.cancel) {
          this.bulk_delete = false;
          this.deleteAction();
        }
      }
    })

  }
  async deleteAction() {
    await this.spinner.show('syncSpinner');;

    let body = { id: this.appointmentDtl.id, bulk_delete: this.bulk_delete };

    await this.commonservice
      .postData(body, "appointment/delete")
      .subscribe(
        (res) => {
          this.spinner.hide('syncSpinner');;

          if (res.status) {

            this.commonservice.showError(res.message, "Calender");
            this.updatedAppointments = res.data;
          }
        },
        (err) => {
          this.spinner.hide('syncSpinner');;
          if (err.status == 401) {
            this.router.navigate(["/unauthorized"]);
          }
          this.commonservice.showError(err.message, "Calender");
        }
      );
  }

  editEvent() {
    this.spinner.show('syncSpinner');;

    let body = { id: this.appointmentDtl.id };

    this.commonservice.postData(body, "viewAppointment").subscribe(
      (res) => {
        this.spinner.hide('syncSpinner');;

        if (res.status) {
          let currentDataSet = res.data;
          let dt = moment(currentDataSet.start_time);
          let year = parseInt(dt.format("YYYY"));
          let mm = parseInt(dt.format("MM"));
          let dd = parseInt(dt.format("DD"));
          let hh = parseInt(dt.format("HH"));
          let ii = parseInt(dt.format("mm"));
          let ss = parseInt(dt.format("ss"));
          currentDataSet.start_time = new Date(year, mm - 1, dd, hh, ii, ss);

          this.commonservice.setDuration.next(currentDataSet);
          this.commonservice.setNav.next(2);
          this.modalService.open(this.appointModal, { size: "lg", backdrop: 'static', keyboard: false }).result.then(
            (result) => { },
            (reason) => { }
          );
        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');;
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Calender");
      }
    );
  }
  copyEvent() {
    this.spinner.show('syncSpinner');;

    let body = { id: this.appointmentDtl.id };

    this.commonservice.postData(body, "viewAppointment").subscribe(
      (res) => {
        this.spinner.hide('syncSpinner');;

        if (res.status) {
          let currentDataSet = res.data;
          currentDataSet.select_staff_id = currentDataSet.staff_id;
          let dt = moment(currentDataSet.start_time);
          let year = parseInt(dt.format("YYYY"));
          let mm = parseInt(dt.format("MM"));
          let dd = parseInt(dt.format("DD"));
          let hh = parseInt(dt.format("HH"));
          let ii = parseInt(dt.format("mm"));
          let ss = parseInt(dt.format("ss"));

          currentDataSet.start_time = new Date(year, mm - 1, dd, hh, ii, ss);

          if (currentDataSet.time_in) {
            let dt_time_in = currentDataSet.time_in.split(":");

            let hh_time_in = parseInt(dt_time_in[0]);
            let ii_time_in = parseInt(dt_time_in[1]);
            let ss_time_in = parseInt(dt_time_in[2]);
            currentDataSet.time_in = new Date(
              year,
              mm - 1,
              dd,
              hh_time_in,
              ii_time_in,
              ss_time_in
            );
          }
          if (currentDataSet.time_out) {
            let dt_time_out = currentDataSet.time_out.split(":");

            let hh_time_out = parseInt(dt_time_out[0]);
            let ii_time_out = parseInt(dt_time_out[1]);
            let ss_time_out = parseInt(dt_time_out[2]);
            currentDataSet.time_out = new Date(
              year,
              mm - 1,
              dd,
              hh_time_out,
              ii_time_out,
              ss_time_out
            );
          }

          currentDataSet.id = "";
          currentDataSet.staff_id = "";
          currentDataSet.is_duplicate = true;
          currentDataSet.is_recurring = false;
          this.commonservice.setDuration.next(currentDataSet);
          this.commonservice.setNav.next(2);
          this.modalService.open(this.appointModal, { size: "lg", backdrop: 'static', keyboard: false }).result.then(
            (result) => { },
            (reason) => { }
          );
        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');;
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Calender");
      }
    );
  }

  async filterStaff(staff: any) {
    this.selectedStaff = this.staffs.find((item) => item.id === staff);
    sessionStorage.setItem('staff_id', staff);

    //  if(this.calSetting.default_mode=='resourceTimeGrid')
    //  {
    if (staff == "") {
      this.selectedStaff = "";
      this.calendarOptions.businessHours = {
        startTime: this.calSetting.slotMinTime,
        endTime: this.calSetting.end_hour,
      };
    }

    if (window.localStorage.getItem("selectedMoment") == null) {
      this.fetchAppointments();
    } else {
      let selectedMoment_new = window.localStorage
        .getItem("selectedMoment")
        .split("-");
      this.selectedMoment = new Date(
        parseInt(selectedMoment_new[0]),
        parseInt(selectedMoment_new[1]) - 1,
        parseInt(selectedMoment_new[2])
      );

      this.gotoData();
    }
    //}
  }

  openmeetingModal() {
    this.modalService.open(this.appointModal, { size: "lg", backdrop: 'static', keyboard: false }).result.then(
      (result) => { },
      (reason) => { }
    );
  }
  redirectCustomer() {
    window.localStorage.setItem("openPopuop", "1");
    this.router.navigateByUrl("customers");
  }
  redirectStaff() {
    window.localStorage.setItem("openPopuop", "1");
    this.router.navigateByUrl("setting/staff-setting/add");
  }

  redirectService() {
    window.localStorage.setItem("is_addService", "1");
    this.router.navigateByUrl("setting/services-setting");
  }
  refreshCalender(res) {
    if (res.status) {
      let ev = res.data;
      let index = this.events.findIndex((item) => item.id === parseInt(ev.id));
      if (index != -1) {
        this.events.splice(index, 1);
        if (res.data.appointments) {
          res.data.appointments.forEach(element => {
            let index = (this.events.findIndex((x: any) => x.id == element));

            if (index != -1) {
              this.events[index].staff_name = res.data?.staff_name;

            }
          });
        }

      }
      if (!res.is_del) {
        this.spinner.show('syncSpinner');;

        let body = { id: ev.id, date: ev.date };
        this.commonservice.postData(body, "currentAppointment").subscribe(
          (res) => {
            this.spinner.hide('syncSpinner');;

            if (res.status) {
              this.events.push(res.data);
              res.data.appointments.forEach(element => {
                let index = (this.events.findIndex((x: any) => x.id == element));

                if (index != -1) {
                  this.events[index].staff_name = res.data?.staff_name;

                }
              });
              const calendarApi = this.calendarComponent.getApi();
              if (calendarApi != null) {
                calendarApi.removeAllEventSources();
                calendarApi.addEventSource(this.events); //obligatory
                calendarApi.refetchEvents();
                this.updateTitle();
              }
            }
          },
          (err) => {
            this.spinner.hide('syncSpinner');;
            if (err.status == 401) {
              this.router.navigate(["/unauthorized"]);
            }
            this.commonservice.showError(err.message, "Calender");
          }
        );
      }

      else {

        const calendarApi = this.calendarComponent.getApi();
        if(calendarApi)
        {
             calendarApi.removeAllEventSources();
             calendarApi.addEventSource(this.events); //obligatory
             calendarApi.refetchEvents();
             this.updateTitle();
        }


      }
    }
  }
  fetchbusinessHours() {
    if (this.initialView == "timeGridWeek") {
      let body = { user_id: this.selectedStaff.id };
      this.commonservice.postDataAsync(body, "business-hour").then(
        (res) => {
          if (res.status) {
            this.calendarOptions.businessHours = res.data;
          }
        },
        (err) => {
          this.spinner.hide('syncSpinner');;
          if (err.status == 401) {
            this.router.navigate(["/unauthorized"]);
          }
          this.commonservice.showError(err.message, "Calender");
        }
      );
    } else {
      this.calendarOptions.businessHours = {
        startTime: this.calSetting.slotMinTime,
        endTime: this.calSetting.end_hour,
      };
    }
  }

  addFovorite(popupData: any) {
    this.spinner.show('syncSpinner');;
    let body = { 'appoinment_id': popupData?.appointmentDtl?.id };
    this.commonservice.postData(body, "add-favourite").subscribe(
      (res) => {
        this.spinner.hide('syncSpinner');;

        if (res.status) {

          this.popupData.favourite_dtls.is_favourite = !(+this.popupData.favourite_dtls.is_favourite);

        }
      },
      (err) => {
        this.spinner.hide('syncSpinner');;
        if (err.status == 401) {
          this.router.navigate(["/unauthorized"]);
        }
        this.commonservice.showError(err.message, "Calender");
      }
    );
  }
}
