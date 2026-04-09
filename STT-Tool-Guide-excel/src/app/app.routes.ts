import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { PrerequisiteLayoutComponent } from './layouts/prerequisite-layout/prerequisite-layout';
import { CommandPageComponent } from './components/command-page/command-page';
import { HomeComponent } from './components/home/home';
import { ExcelPrerequisitesComponent } from './components/excel-prerequisites/excel-prerequisites';
import { HtmlPrerequisitesComponent } from './components/html-prerequisites/html-prerequisites';
import { LocatorPrerequisitesComponent } from './components/locator-prerequisites/locator-prerequisites';
import { LocatorConfigPrerequisitesComponent } from './components/locator-config-prerequisites/locator-config-prerequisites';
import { TestingPropertiesComponent } from './components/testing-properties/testing-properties';
import { UserProfilePropertiesComponent } from './components/user-profile-properties/user-profile-properties';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
      },
      {
        path: 'cmd/:id',
        component: CommandPageComponent,
      },
    ],
  },
  {
    path: 'prerequisites',
    component: PrerequisiteLayoutComponent,
    children: [
      {
        path: 'excel',
        component: ExcelPrerequisitesComponent,
      },
      {
        path: 'html',
        component: HtmlPrerequisitesComponent,
      },
      {
        path: 'locators',
        component: LocatorPrerequisitesComponent,
      },
      {
        path: 'locator-config',
        component: LocatorConfigPrerequisitesComponent,
      },
      {
        path: 'testing-properties',
        component: TestingPropertiesComponent,
      },
      {
        path: 'user-profile',
        component: UserProfilePropertiesComponent,
      },
      {
        path: '',
        redirectTo: 'excel',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
