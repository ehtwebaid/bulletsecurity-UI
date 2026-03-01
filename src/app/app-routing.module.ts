import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
import { CalenderComponent } from './calender/calender.component';
import { CustomersComponent } from './customers/customers.component';
import { SettingsComponent } from './settings/settings.component';
import { AccountSettingComponent } from './settings/account-setting/account-setting.component';
import { TermComponent } from './term/term.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { AccountPreferencesComponent } from './settings/account-setting/account-preferences/account-preferences.component';
import { StaffSettingComponent } from './settings/staff-setting/staff-setting.component';
import { ServicesSettingComponent } from './settings/services-setting/services-setting.component';
import { CompanyDetailsComponent } from './settings/account-setting/company-details/company-details.component';
import { BasicReportingComponent } from './settings/account-setting/basic-reporting/basic-reporting.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { FavouriteComponent } from './favourite/favourite.component';
import { SupportComponent } from './support/support.component';
import { LogComponent } from './settings/log/log.component';
const routes: Routes = [
  {path: '', component:LoginComponent},
  {path: 'forgot-password', component:ForgotPasswordComponent},
  {path: 'term', component:TermComponent},
  {path: 'reset-password/:id', component:ResetPasswordComponent},
  {path: 'privacy', component:PrivacyComponent},
  {path: 'support', component:SupportComponent},

  {path: 'unauthorized', component: UnauthorizedComponent},
  {
      path: '',
      component: LayoutComponent,
      children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'calender', component: CalenderComponent },
      { path: 'calender/:search_date', component: CalenderComponent },

      { path: 'customers', component: CustomersComponent },
      { path: 'customers/:id', component: CustomersComponent },

      { path: 'customers/:option', component: CustomersComponent },
      {path: 'change-password', component:ChangePasswordComponent},
      {path: 'favourite', component:FavouriteComponent},

      { path: 'setting', component: SettingsComponent,
        children:[
        {path: 'account-setting', component: AccountSettingComponent,
          children:[
            {path: 'account-preferences', component: AccountPreferencesComponent},
            {path: 'company-details', component: CompanyDetailsComponent},
            {path: 'basic-reporting', component: BasicReportingComponent}
          ]},
        {path: 'staff-setting', component: StaffSettingComponent},
        {path: 'staff-setting/:option', component: StaffSettingComponent},
        {path: 'services-setting', component: ServicesSettingComponent},
        {path: 'log', component: LogComponent},
        {path: 'services-setting/:option', component: ServicesSettingComponent}

      ]

      }

      ]

  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
