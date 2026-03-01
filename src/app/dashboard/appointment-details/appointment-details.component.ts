import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { CommonService } from "../../service/common.service";
import { NgxSpinnerService } from "ngx-spinner";
import * as moment from "moment";
import Quill from "quill";
import BlotFormatter from "quill-blot-formatter/dist/BlotFormatter";
import { VideoHandler, ImageHandler, Options } from "ngx-quill-upload";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { apiURL, siteUrl } from "src/app/global-constants";
import { ConfirmationDialogService } from "src/app/confirmation-dialog/confirmation-dialog.service";
import Swal from 'sweetalert2';
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

Quill.register("modules/blotFormatter", BlotFormatter);
Quill.register("modules/imageHandler", ImageHandler);

@Component({
  selector: "app-appointment-details",
  templateUrl: "./appointment-details.component.html",
  styleUrls: ["./appointment-details.component.css"],
})
export class AppointmentDetailsComponent implements OnInit {
  filtersLoaded: Promise<boolean>;
  appointmentForm: any = FormGroup;
  basicForm: any = FormGroup;
  IsSubmitted: any = false;

  staffs: any = [];

  cutomer_services: any = [];

  stepMinute: any;

  minDate: any = new Date();

  service_name: any = "";

  btn_disable: boolean = false;

  keyword = "name";

  formatter: any;

  clients: any = [];

  showCustomer: boolean = true;

  is_duplicate: boolean = false;

  custom_durations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  show_customer: boolean = true;
  next_appointment: boolean = false;
  customer_link: any = '';
  recurring_types: any = [
    { key: "N", value: "Does Not Repeat" },
    { key: "D", value: "Every Working Day" },
    { key: "C", value: "Custom" },
  ];

  custom_recurring_types = [
    { key: "D", value: "Day" },
    { key: "W", value: "Week" },
    { key: "M", value: "Month" },
  ];

  offset: any = 0;

  limit: any = 10;

  loadItem: boolean = false;

  search_key: any = "";

  addTag: boolean = false;

  selected_customer: any = "";

  is_recurring: boolean = false;
  clickSubject: Subject<void> = new Subject<void>();
  toolbar = [
    ["bold", "italic", "underline"],
    ["blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ size: [] }], // custom dropdown
    [{ align: [] }],
    ["image", "link"],
    ["emoji"],
    // link and image, video
  ];
  modules: any = {};

  constructor(
    private router: Router,
    private commonservice: CommonService,

    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private http: HttpClient,
    private confirmationDialogService: ConfirmationDialogService
  ) {



  }

  ngOnInit(): void {
    this.Loading();
    this.appointmentForm.get("custom_duration");
    this.clickSubject.pipe(
      debounceTime(1000) // Debounce time of 300ms
    ).subscribe(() => {
      this.offset = 0;
      this.limit = 10;
      this.selected_customer = "";
      this.initCustomers();
    });



  }
  postsubmitData() {
    this.spinner.show('syncSpinner');

    this.appointmentForm.value.start_time = moment(
      this.appointmentForm.value.start_time
    ).format("YYYY-MM-DD HH:mm:ss");

    let selectedMoment = this.appointmentForm.value.start_time;
    this.appointmentForm.value.is_favourite = this.appointmentForm.value.is_favourite ? 1 : 0
    this.appointmentForm.value.customer_id = !this.appointmentForm.value?.customer_id ? 0 : this.appointmentForm.value?.customer_id;
    this.commonservice
      .postData(this.appointmentForm.value, "appointment/add")
      .subscribe(
        (res) => {
          this.spinner.hide('syncSpinner');

          if (res.status) {
            this.commonservice.showSuccess(res.message, "Book Appointment");
            let customer_id = "";
            if (this.appointmentForm.value.customer_id != null) {
              customer_id = this.appointmentForm.value.customer_id;
            }

            this.appointmentForm.reset();

            this.IsSubmitted = false;

            this.appointmentForm.patchValue({ staff_id: null, is_repeat: 0 });

            this.commonservice.newAppointment.next(res.data);

            if (customer_id != "") {
              this.commonservice.afterAppointment.next(customer_id);
            }

            this.service_name = "";

            this.commonservice.setDuration.next("");

            this.commonservice.setNav.next(1);
          } else {
            let errors = res.error;

            for (let error of errors) {
              this.commonservice.showError(error, "Book Appointment");
            }
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
  async submitData() {
    this.IsSubmitted = true;

    if (this.appointmentForm.status == "VALID") {


      if (this.is_recurring && this.next_appointment) {
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
            this.appointmentForm.patchValue({ bulk_update: true });
            await this.postsubmitData();

          }
          else if (result.dismiss === Swal.DismissReason.cancel) {
            this.appointmentForm.patchValue({ bulk_update: false });
            await this.postsubmitData();
          }
          else if (result.dismiss === Swal.DismissReason.close) {
            this.commonservice.setDuration.next("");
            this.commonservice.setNav.next(1);
          }



        });
      } else {
        this.postsubmitData();
      }
    } else {
      setTimeout(() => {
        this.scrollToError();
      }, 400);
    }
  }
  async fetchStaffs() {
    let body = {};
    if (!this.is_duplicate) {
      //body={staff_id:this.appointmentForm.value.staff_id};
    }
    this.commonservice.postDataAsync(body, "dailyStaff").then(
      (res) => {
        if (res.status) {
          this.staffs = res.data;

          if (this.appointmentForm.value.staff_id) {
            let index = this.staffs.findIndex(item => item.id === parseInt(this.appointmentForm.value.staff_id));
            if (index != -1) {
              this.setEstimate(this.staffs[index]);
            }

          }
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

  async fetchServices() {
    this.commonservice.postDataAsync("", "service/listing").then(
      (res) => {
        if (res.status) {
          this.cutomer_services = res.data.data;

          if (
            this.appointmentForm.value.id == "" ||
            this.appointmentForm.value.id == null
          ) {
            let result = this.cutomer_services.find(
              (item) =>
                item.minutes === this.appointmentForm.value.duration.toString()
            );

            if (typeof result != "undefined") {
              this.appointmentForm.patchValue({
                customerservice_id: result.id,
              });
            } else {
              this.appointmentForm.patchValue({ customerservice_id: "" });
            }
          }
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
  selectService(customerservice_id: any): void {
    let item = this.cutomer_services.find(
      (res) => res.id === parseInt(customerservice_id)
    );
    //if(this.service_name=='')
    //{
    this.appointmentForm.patchValue({
      service_name: item.name,
      duration: item.minutes,
    });
    //}
  }
  selectCustomer(item: any = ""): void {
    let filterStaff = this.staffs.find(staff => staff.id == this.appointmentForm.value?.staff_id);
    let body = {
      name: item?.name ?? null,
      primary_contact_name: "",
      mobile: "",
      alternate_name: "",
      alternate_mobile: "",
      address: "",
      customer_notes: "",
      customer_link: ""
    };
    this.appointmentForm.patchValue(body);
    if (filterStaff) {
      if (!filterStaff?.require_estimate) {
        this.appointmentForm.get("estimate").clearValidators();

      }
    }
    else {
      this.appointmentForm.get("estimate").clearValidators();
    }
    if (!item) {
      this.appointmentForm.get("customer_link").clearValidators();

    }
    else {
      this.appointmentForm.patchValue(item);
      this.customer_link = item?.customer_link;
      this.appointmentForm.get("customer_link").setValidators([Validators.required]);
    }
    this.appointmentForm.get("customer_link").updateValueAndValidity();
    this.appointmentForm.get("estimate").updateValueAndValidity();


  }

  changeRecurring() {
    if (this.appointmentForm.value.is_repeat == "N") {
      this.appointmentForm.get("no_term").clearValidators();
    } else {
      this.appointmentForm.get("no_term").setValidators([Validators.required]);
    }
    if (this.appointmentForm.value.is_repeat != "C") {
      this.appointmentForm.patchValue({
        custom_type: "",
        custom_duration: "",
      });
      this.appointmentForm.get("custom_type").clearValidators();
      this.appointmentForm.get("custom_duration").clearValidators();
    } else {
      this.appointmentForm
        .get("custom_type")
        .setValidators([Validators.required]);
      this.appointmentForm
        .get("custom_duration")
        .setValidators([Validators.required]);
    }
    this.appointmentForm.get("custom_type").updateValueAndValidity();
    this.appointmentForm.get("custom_duration").updateValueAndValidity();
    this.changerecurringOpt();
  }
  public myFilter = (d: Date): boolean => {
    const day = d.getDay();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6;
  };
  async Loading() {
    this.spinner.show('syncSpinner');
    await this.initForm();
    await this.fetchServices();
    await this.fetchStaffs();
    await this.fetchSetting();
    //await this.allCustomers();
    this.modules = {
      syntax: false,
      "emoji-toolbar": true,
      "emoji-textarea": true,
      "emoji-shortname": true,
      blotFormatter: {
        // empty object for default behaviour.
      },
      toolbar: this.toolbar,
      imageHandler: {
        upload: (file) => {
          return new Promise((resolve, reject) => {
            if (
              file.type === "image/jpeg" ||
              file.type === "image/png" ||
              file.type === "image/jpg"
            ) {
              // File types supported for image
              if (file.size < 3000000) {
                // Customize file size as per requirement

                // Sample API Call
                const uploadData = new FormData();
                uploadData.append("file", file, file.name);
                let webservice_path = apiURL;
                return this.http
                  .post(webservice_path + "file-upload", uploadData)
                  .toPromise()
                  .then((result) => {
                    let resp: any = result;
                    return resolve(resp.url); // RETURN IMAGE URL from response
                  })
                  .catch((error) => {
                    reject("Upload failed");
                    // Handle error control
                    console.error("Error:", error);
                  });
              } else {
                reject("Size too large");
                // Handle Image size large logic
              }
            } else {
              reject("Unsupported type");
              // Handle Unsupported type logic
            }
          });
        },
        accepts: ["png", "jpg", "jpeg", "jfif"], // Extensions to allow for images (Optional) | Default - ['jpg', 'jpeg', 'png']
      } as Options,
    };
    this.spinner.hide('syncSpinner');

    this.filtersLoaded = Promise.resolve(true);
  }

  async fetchSetting() {
    this.commonservice.postDataAsync("", "setting/view").then(
      (res) => {
        if (res.status) {
          this.stepMinute = res.data.timepicker_interval;
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
  async initForm() {
    this.commonservice.presentCustomer.subscribe((client) => {
      let userDetails = JSON.parse(window.localStorage.getItem("userDetails"));
      this.appointmentForm = this.formBuilder.group({
        id: [""],
        staff_id: ["", Validators.required],
        staff_id_sub: [null],
        customer_id: [null],
        customerservice_id: [""],
        service_name: [""],
        duration: ["", Validators.required],
        start_time: ["", Validators.required],
        is_repeat: ["N"],
        custom_type: [""],
        custom_duration: [""],
        no_term: [""],
        notes: [""],
        current_status: ["P"],
        extra_materials: [""],
        summary: [""],
        name: [""],
        primary_contact_name: [""],
        mobile: [""],
        alternate_name: [""],
        alternate_mobile: [""],
        address: [""],
        customer_notes: [""],
        estimate: ["", Validators.required],
        project_manager: [""],
        time_in: [""],
        time_out: [""],
        bulk_update: [false],
        customer_link: [""],
        is_favourite: [null],
      });
      this.appointmentForm.patchValue(client);
      this.customer_link = client?.customer_link;
      this.appointmentForm.patchValue({
        customer_id: client.id,
        customer_link: this.customer_link
      });

      this.is_recurring = client?.is_recurring || false;
      if (typeof client.id != "undefined" && client.id != "") {
        this.selectCustomer = client.id;
        this.initCustomers();
      }
      this.appointmentForm.patchValue({ id: "" });

      if (this.appointmentForm.value.staff_id == "") {
        this.appointmentForm.patchValue({ staff_id: null });
      }

      this.commonservice.setDuration.subscribe((body) => {
        if (body != "") {
          if (body.is_repeat != "N" && typeof body.is_repeat != "undefined") {
            this.appointmentForm
              .get("no_term")
              .setValidators([Validators.required]);
            this.appointmentForm.get("no_term").updateValueAndValidity();
          }

          let current_date = new Date();

          if (current_date > body.start_time) {
            this.btn_disable = true;
          }
          this.service_name = body.service_name;
          if (body.staff_id != "" && body.staff_id != null) {
            body.staff_id = parseInt(body.staff_id);
          } else {
            body.staff_id = null;
          }
          if (body.is_duplicate) {
            this.is_duplicate = body.is_duplicate;

            body.staff_id = parseInt(body.select_staff_id);
          }
          body.is_favourite = +body.favourite_dtls?.is_favourite;
          this.appointmentForm.patchValue(body);
          this.is_recurring = body.is_recurring;
          this.next_appointment = body.next_appointment;
          this.selected_customer = body.customer_id;
          this.customer_link = body?.customer_link;

          if ((body.project_manager == "" || body.project_manager == null) && (body.id == '' || body.id == undefined || body.id == null)) {
            this.appointmentForm.patchValue({
              project_manager: userDetails.name,
            });
          }

          this.changerecurringOpt();
          if (
            typeof this.selected_customer != "undefined" &&
            this.selected_customer != ""
          ) {
            this.initCustomers();
          }
        }
      });
    });
  }
  async allCustomers(ev: any = "") {
    this.search_key = ev.term;
    this.clickSubject.next();
  }
  selectEvent(item: any) {
    // do something with selected item
  }

  onChangeSearch(val: string) {
    // fetch remote data from here
    // And reassign the 'data' which is binded to 'data' property.
  }

  onFocused(e: any) {
    // do something when input is focused
  }
  changerecurringOpt() {
    this.recurring_types = [
      { key: "N", value: "Does Not Repeat" },
      { key: "D", value: "Every Working Day" },
      {
        key: moment(this.appointmentForm.value.start_time).format("dddd"),
        value:
          "Weekly on " +
          moment(this.appointmentForm.value.start_time).format("dddd"),
      },
      {
        key: moment(this.appointmentForm.value.start_time).format("DD"),
        value:
          "Monthly on " +
          moment(this.appointmentForm.value.start_time).format("Do"),
      },
      { key: "C", value: "Custom" },
    ];
  }

  changeDate() {
    if (!this.is_recurring) {
      let is_repeat = this.appointmentForm.value.is_repeat;

      if (is_repeat == "D" || is_repeat == "C" || is_repeat == "N") {
      } else {
        this.appointmentForm.patchValue({ is_repeat: "N" });
      }
    }
  }

  scrollTo(el: Element): void {
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
  scrollToError(): void {
    const firstElementWithError = document.querySelector(".parsley-error");
    this.scrollTo(firstElementWithError);
  }

  resetOffset() {
    this.offset += this.limit;
    this.initCustomers();
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
          if (this.clients.length > 0) {
            this.addTag = true;
          } else {
            this.addTag = true;
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
  changeStatus(event: any) {
    if (event.target.checked) {
      this.appointmentForm.patchValue({ current_status: "C" });
    } else {
      this.appointmentForm.patchValue({ current_status: "P" });
    }
  }
  setEstimate(event: any) {
    console.log(event);
    if (event.require_estimate) {
      this.appointmentForm
        .get("estimate")
        .setValidators([Validators.required]);
    }
    else {
      //if (!this.appointmentForm?.value?.customer_id) {
        this.appointmentForm.get("estimate").clearValidators();

      //}

    }
    this.appointmentForm.get("estimate").updateValueAndValidity();

  }

  IsFavorite() {
    let is_favourite = this.appointmentForm.value?.is_favourite ? null : 1;
    this.appointmentForm.patchValue({ is_favourite: is_favourite });
    console.log(this.appointmentForm.value);
  }
}
