import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule,HttpClient } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgxPaginationModule} from 'ngx-pagination'; // <-- import the module

import { FullCalendarModule,FullCalendarComponent } from '@fullcalendar/angular'; // must go before plugins
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import resourceDayGridPlugin from '@fullcalendar/resource-daygrid';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';

import interactionPlugin from '@fullcalendar/interaction'; // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSpinnerModule } from "ngx-spinner";
import { OwlDateTimeModule, OwlNativeDateTimeModule,OWL_DATE_TIME_FORMATS,OWL_MOMENT_DATE_TIME_ADAPTER_OPTIONS } from '@danielmoncada/angular-datetime-picker';

import { Ng2SearchPipeModule } from 'ng2-search-filter';

import { NgScrollbarModule } from 'ngx-scrollbar';

import { CommonService } from './service/common.service';
import { SeoService } from './service/seo.service';
import { ConfirmationDialogService } from './confirmation-dialog/confirmation-dialog.service';

import { NumericinputDirective } from './directive/numericinput.directive';
import { DecimalinputDirective } from './directive/decimalinput.directive'
import { InfiniteScrollModule } from "ngx-infinite-scroll";



import { HeaderComponent } from './header/header.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LayoutComponent } from './layout/layout.component';
import { FooterComponent } from './footer/footer.component';
import { CalenderComponent } from './calender/calender.component';
import { AppointmentDetailsComponent } from './dashboard/appointment-details/appointment-details.component';
import { CustomersComponent } from './customers/customers.component';
import { AppointmentsComponent } from './customers/appointments/appointments.component';
import { NotesComponent } from './customers/notes/notes.component';
import { StatsComponent } from './customers/stats/stats.component';
import { SettingsComponent } from './settings/settings.component';
import { AccountSettingComponent } from './settings/account-setting/account-setting.component';
import { TermComponent } from './term/term.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AccountPreferencesComponent } from './settings/account-setting/account-preferences/account-preferences.component';
import { StaffSettingComponent } from './settings/staff-setting/staff-setting.component';
import { StaffDetailsComponent } from './settings/staff-setting/staff-details/staff-details.component';
import { StaffServicesComponent } from './settings/staff-setting/staff-services/staff-services.component';
import { CommonappointmentComponent } from './commonappointment/commonappointment.component';
import { StaffWorkingHoursComponent } from './settings/staff-setting/staff-working-hours/staff-working-hours.component';
import { ServicesSettingComponent } from './settings/services-setting/services-setting.component';
import { CompanyDetailsComponent } from './settings/account-setting/company-details/company-details.component';
import { BasicReportingComponent } from './settings/account-setting/basic-reporting/basic-reporting.component';
import {NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { AngularFileUploaderModule } from "angular-file-uploader";
import { DatePipe,UpperCasePipe  } from '@angular/common';
import { QuillModule } from 'ngx-quill'
 import BlotFormatter from 'quill-blot-formatter/dist/BlotFormatter';
 import momentTimezonePlugin from '@fullcalendar/moment-timezone'
 import Quill from 'quill';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { DecodeHtmlStringPipe } from './pipe/decode-html-string.pipe';
 Quill.register('modules/blotFormatter', BlotFormatter);
 import * as Emoji from "quill-emoji";
 Quill.register("modules/emoji", Emoji);
 import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { FavouriteComponent } from './favourite/favourite.component';
import { SupportComponent } from './support/support.component';
import { PhoneFormatDirective } from './directive/phone-format.directive';
import { LogComponent } from './settings/log/log.component';
import { StripHtmlPipe } from './pipe/strip-html.pipe';

let toolbar=[
  ['bold', 'italic', 'underline'],
  ['blockquote'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'size': [] }],  // custom dropdown
  [{ 'align': [] }],
  ['image'] ,
  ['emoji']                        // link and image, video

]


FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  timeGridPlugin,
  resourceDayGridPlugin,resourceTimelinePlugin,resourceTimeGridPlugin,momentTimezonePlugin

]);

export const MY_NATIVE_FORMATS = {

    fullPickerInput: { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'},
    datePickerInput: {month: 'short', day: 'numeric',year:'numeric'},
    timePickerInput: {hour: 'numeric', minute: 'numeric'},
    monthYearLabel: {year: 'numeric', month: 'short'},
    dateA11yLabel: {year: 'numeric', month: 'long', day: 'numeric'},
    monthYearA11yLabel: {year: 'numeric', month: 'long'},

};


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    ForgotPasswordComponent,
    DashboardComponent,
    SidebarComponent,
    LayoutComponent,
    FooterComponent,
    CalenderComponent,
    AppointmentDetailsComponent,
    CustomersComponent,
    AppointmentsComponent,
    NotesComponent,
    StatsComponent,
    SettingsComponent,
    AccountSettingComponent,
    TermComponent,
    PrivacyComponent,
    UnauthorizedComponent,
    NumericinputDirective,
    DecimalinputDirective,
    AccountPreferencesComponent,
    StaffSettingComponent,
    StaffDetailsComponent,
    StaffServicesComponent,
    CommonappointmentComponent,
    StaffWorkingHoursComponent,
    ServicesSettingComponent,
    CompanyDetailsComponent,
    BasicReportingComponent,
    ChangePasswordComponent,
    ResetPasswordComponent,
    DecodeHtmlStringPipe,
    FavouriteComponent,
    SupportComponent,
    PhoneFormatDirective,
    LogComponent,
    StripHtmlPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    ReactiveFormsModule,
    NgSelectModule,
    ToastrModule.forRoot(),
    NgxSkeletonLoaderModule,
    HttpClientModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    FullCalendarModule,
    FormsModule,
    AutocompleteLibModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgxPaginationModule,
    InfiniteScrollModule,
    NgScrollbarModule,Ng2SearchPipeModule,AngularFileUploaderModule,FullCalendarModule,QuillModule.forRoot({
      modules: {
       
        "emoji-toolbar": true,
        "emoji-textarea": true,
        "emoji-shortname": true,
        syntax: false,
        blotFormatter: {
          // empty object for default behaviour.
        },
        toolbar:toolbar,
        

      }
    })
  ],
  providers: [FullCalendarComponent,CommonService,SeoService,ConfirmationDialogService,{provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS,},NgbPopover,DatePipe,UpperCasePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
