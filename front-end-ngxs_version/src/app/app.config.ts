// src/app/app.config.ts
import { ApplicationConfig, importProvidersFrom, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// NGXS 3.x (Angular 17)
import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
// optional: only if you installed it; otherwise omit this import & module
// import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

// States
import { AuthState } from './state/auth/auth.state';
import { PatientState } from './state/patients/patient.state';
import { DoctorState } from './state/doctors/doctor.state';
import { VisitState } from './state/visits/visit.state';
import { FeeState } from './state/fees/fee.state';
import { ActivityLogState } from './state/activity/activity.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    // register NGXS using importProvidersFrom for v3.x
    importProvidersFrom(
      NgxsModule.forRoot([AuthState, PatientState, DoctorState, VisitState, FeeState, ActivityLogState]),
      NgxsLoggerPluginModule.forRoot({ disabled: !isDevMode() }),
      NgxsStoragePluginModule.forRoot({ key: ['auth'] }),
      // NgxsReduxDevtoolsPluginModule.forRoot({ disabled: !isDevMode() })
    )
  ]
};
