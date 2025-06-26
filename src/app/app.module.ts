//BEGIN LICENSE BLOCK 
//Interneuron Terminus

//Copyright(C) 2025  Interneuron Limited

//This program is free software: you can redistribute it and/or modify
//it under the terms of the GNU General Public License as published by
//the Free Software Foundation, either version 3 of the License, or
//(at your option) any later version.

//This program is distributed in the hope that it will be useful,
//but WITHOUT ANY WARRANTY; without even the implied warranty of
//MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

//See the
//GNU General Public License for more details.

//You should have received a copy of the GNU General Public License
//along with this program.If not, see<http://www.gnu.org/licenses/>.
//END LICENSE BLOCK 
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injector, DoBootstrap, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from "@angular/common";

import { AppComponent } from './app.component';
import { FakeDataContractComponent } from './fake-data-contract/fake-data-contract.component';

import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerModule } from "ngx-spinner";
import {
  BsDatepickerConfig,
  BsDatepickerModule,
  // DatepickerModule,
} from "ngx-bootstrap/datepicker";
import { ModalModule, BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CKEditorModule  } from '@ckeditor/ckeditor5-angular';
import {NgToggleModule} from '@nth-cloud/ng-toggle';


import { ViewerComponent } from './viewer/viewer.component';
import { ListDischargeSummaryComponent } from './list-discharge-summary/list-discharge-summary.component';
import { EditDischargeSummaryComponent } from './edit-discharge-summary/edit-discharge-summary.component';
import { DischargePlanNotesComponent } from './discharge-plan-notes/discharge-plan-notes.component';
import { DischargePlanNotesHistoryViewerComponent } from './discharge-plan-notes-history-viewer/discharge-plan-notes-history-viewer.component';
import { NewDischargeSummaryComponent } from './new-discharge-summary/new-discharge-summary.component';
import { DischargeSummaryBannerComponent } from './discharge-summary-banner/discharge-summary-banner.component';
import { IndividualRequirementsComponent } from './individual-requirements/individual-requirements.component';
import { SafeGaurdingComponent } from './safe-gaurding/safe-gaurding.component';
import { AllergiesComponent } from './allergies/allergies.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';
import { ProcedureComponent } from './procedure/procedure.component';
import { ViewDischargeSummaryComponent } from './view-discharge-summary/view-discharge-summary.component';
import { ClinicianDeclarationComponent } from './clinician-declaration/clinician-declaration.component';
import { PharmacyReviewDeclarationComponent } from './pharmacy-review-declaration/pharmacy-review-declaration.component';
import { DischargePaperworkTtaDeclarationComponent } from './discharge-paperwork-tta-declaration/discharge-paperwork-tta-declaration.component';
import { PharmacyNotesComponent } from './pharmacy-notes/pharmacy-notes.component';
import { ViewPharmacyDetailsComponent } from './view-pharmacy-details/view-pharmacy-details.component';
import { ReadyForDischargeComponent } from './ready-for-discharge/ready-for-discharge.component';
import { CompleteDischargeSummaryComponent } from './complete-discharge-summary/complete-discharge-summary.component';
import { CompleteDischargeSummaryDetailsComponent } from './complete-discharge-summary-details/complete-discharge-summary-details.component';
import { SocialWorkerComponent } from './social-worker/social-worker.component';
import { DischargeClinicalSummaryNotesComponent } from './discharge-clinical-summary-notes/discharge-clinical-summary-notes.component';
import { DischargeInvestigationResultsNotesComponent } from './discharge-investigation-results-notes/discharge-investigation-results-notes.component';
import { ImportDataViewerComponent } from './import-data-viewer/import-data-viewer.component';
import { DischargeClinicalSummaryNotesHistoryViewerComponent } from './discharge-clinical-summary-notes-history-viewer/discharge-clinical-summary-notes-history-viewer.component';
import { DischargeInvestigationResultsNotesHistoryViewerComponent } from './discharge-investigation-results-notes-history-viewer/discharge-investigation-results-notes-history-viewer.component';
import { PharmacyNotesHistoryViewerComponent } from './pharmacy-notes-history-viewer/pharmacy-notes-history-viewer.component';
import { ImportClinicalSummaryNotesComponent } from './import-clinical-summary-notes/import-clinical-summary-notes.component';
import { ImportInvestigationResultsComponent } from './import-investigation-results/import-investigation-results.component';
import { ImportDischargePlanComponent } from './import-discharge-plan/import-discharge-plan.component';
import { ImportPharmacyNotesComponent } from './import-pharmacy-notes/import-pharmacy-notes.component';
import { MedicationsMedicalDevicesComponent } from './medications-medical-devices/medications-medical-devices.component';
import { IndividualRequirementsHistoryViewerComponent } from './individual-requirements-history-viewer/individual-requirements-history-viewer.component';
import { SocialWorkerHistoryViewerComponent } from './social-worker-history-viewer/social-worker-history-viewer.component';
import { SafeGaurdingHistoryViewerComponent } from './safe-gaurding-history-viewer/safe-gaurding-history-viewer.component';
import { PrintDischargeSummaryHtmlComponent } from './print-discharge-summary-html/print-discharge-summary-html.component';
import { PrintDischargeSummaryComponent } from './print-discharge-summary/print-discharge-summary.component';
import { PrintDischargePrescriptionComponent } from './print-discharge-prescription/print-discharge-prescription.component';
import { PrintMedicationComponent } from './print-medication/print-medication.component';
import { ExpectedDischargeDateComponent } from './expected-discharge-date/expected-discharge-date.component';
import { TableModule } from 'primeng/table';
import { DischargeVteNotesComponent } from './discharge-vte-notes/discharge-vte-notes.component';
import { DischargeVteNotesHistoryViewerComponent } from './discharge-vte-notes-history-viewer/discharge-vte-notes-history-viewer.component';
import { NgxExtendedPdfViewerModule, pdfDefaultOptions } from 'ngx-extended-pdf-viewer';
import { ModalExpectedDischargeDateComponent } from './modal-expected-discharge-date/modal-expected-discharge-date.component';
import { ModalClinicalSummaryNotesComponent } from './modal-clinical-summary-notes/modal-clinical-summary-notes.component';
import { ModalVteNotesComponent } from './modal-vte-notes/modal-vte-notes.component';
import { ModalInvestigationResultsNotesComponent } from './modal-investigation-results-notes/modal-investigation-results-notes.component';
import { ModalDischargePlanComponent } from './modal-discharge-plan/modal-discharge-plan.component';
import { ModalPharmacyNotesComponent } from './modal-pharmacy-notes/modal-pharmacy-notes.component';
import { ModalIndividualRequirementsComponent } from './modal-individual-requirements/modal-individual-requirements.component';
import { ModalSocialWorkerComponent } from './modal-social-worker/modal-social-worker.component';
import { ModalSafeGuardingComponent } from './modal-safe-guarding/modal-safe-guarding.component';


@NgModule({ declarations: [
        AppComponent,
        FakeDataContractComponent,
        ViewerComponent,
        ListDischargeSummaryComponent,
        EditDischargeSummaryComponent,
        DischargePlanNotesComponent,
        DischargePlanNotesHistoryViewerComponent,
        NewDischargeSummaryComponent,
        DischargeSummaryBannerComponent,
        IndividualRequirementsComponent,
        SafeGaurdingComponent,
        AllergiesComponent,
        DiagnosisComponent,
        ProcedureComponent,
        ViewDischargeSummaryComponent,
        ClinicianDeclarationComponent,
        PharmacyReviewDeclarationComponent,
        DischargePaperworkTtaDeclarationComponent,
        PharmacyNotesComponent,
        ViewPharmacyDetailsComponent,
        ReadyForDischargeComponent,
        CompleteDischargeSummaryComponent,
        CompleteDischargeSummaryDetailsComponent,
        SocialWorkerComponent,
        DischargeClinicalSummaryNotesComponent,
        DischargeInvestigationResultsNotesComponent,
        ImportDataViewerComponent,
        DischargeClinicalSummaryNotesHistoryViewerComponent,
        DischargeInvestigationResultsNotesHistoryViewerComponent,
        PharmacyNotesHistoryViewerComponent,
        ImportClinicalSummaryNotesComponent,
        ImportInvestigationResultsComponent,
        ImportDischargePlanComponent,
        ImportPharmacyNotesComponent,
        MedicationsMedicalDevicesComponent,
        IndividualRequirementsHistoryViewerComponent,
        SocialWorkerHistoryViewerComponent,
        SafeGaurdingHistoryViewerComponent,
        PrintDischargeSummaryHtmlComponent,
        PrintDischargeSummaryComponent,
        PrintDischargePrescriptionComponent,
        PrintMedicationComponent,
        ExpectedDischargeDateComponent,
        DischargeVteNotesComponent,
        DischargeVteNotesHistoryViewerComponent,
        ModalExpectedDischargeDateComponent,
        ModalClinicalSummaryNotesComponent,
        ModalVteNotesComponent,
        ModalInvestigationResultsNotesComponent,
        ModalDischargePlanComponent,
        ModalPharmacyNotesComponent,
        ModalIndividualRequirementsComponent,
        ModalSocialWorkerComponent,
        ModalSafeGuardingComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [],
     imports: [BrowserModule,
        DataTablesModule,
        FormsModule,
        NgxSpinnerModule,
        BrowserAnimationsModule,
        FontAwesomeModule,
        CKEditorModule,
        BsDatepickerModule.forRoot(),
        CommonModule,
        NgToggleModule,
        TableModule,
        ModalModule.forRoot(),
        NgxExtendedPdfViewerModule], providers: [
        BsModalRef,
        BsModalService,
        BsDatepickerConfig,
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule implements DoBootstrap {
  constructor(private injector: Injector) {
    pdfDefaultOptions.assetsFolder = "assets/ngx-extended-pdf-viewer";
  }

  ngDoBootstrap() {

    const el = createCustomElement(AppComponent, { injector: this.injector });

    customElements.define('app-discharge-summary', el);  // "customelement-selector" is the dom selector that will be used in parent app to render this component
  }
}
