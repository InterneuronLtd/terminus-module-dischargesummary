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
import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { DischargeSummaryBannerComponent } from '../discharge-summary-banner/discharge-summary-banner.component';
import { CoreDischargeSummary } from '../models/entities/core-discharge-summary.model';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { MedsOnDischarge } from '../models/medsondischarge.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-edit-discharge-summary',
  templateUrl: './edit-discharge-summary.component.html',
  styleUrls: ['./edit-discharge-summary.component.css']
})
export class EditDischargeSummaryComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  selectedSummaryView: string;
  selectedView: string;
  personId: string;
  clinicalSummary: any;
  personData: any;
  notesData: any;
  encounterId: string;
  personDetails: any;
  dischargeSummary: CoreDischargeSummary;
  disabledMarkAsClinicianButton: boolean = false;
  editDischargeSummary: string = 'edit discharge summary';



  public importFromClinicalSummary: boolean = false;
  public importFromEPMA: boolean = false;
  public patientHasIndividualRequirements: boolean = false;
  public hasSafeGuardingConcerns: boolean = false;
  public isThereAllocatedSocialWorker: boolean = false;
  public clinicalSummaryNotes: string = '';
  public dischargePlanNotes: string = '';
  public investigationNotes: string = '';
  public pharmacyNotes: string = '';

  public isPatientLeaveSummary: boolean = false;

  isDischarginClinicianValidationPassed: boolean = false;
  isDischarginClinicianValidationEDD: boolean = false;
  isDischarginClinicianValidationClinicalSummaryNotes: boolean = false;
  isDischarginClinicianValidationVTENotes: boolean = false;
  isDischarginClinicianValidationInvestigationResults: boolean = false;
  isDischarginClinicianValidationDischargePlan: boolean = false;
  validationIndividualRequirements: boolean = false;
  validationSafeGaurdingRiskToSelf: boolean = false;
  validationSafeGaurdingRiskToOthers: boolean = false;
  validationSafeGaurdingRiskFromOthers: boolean = false;
  validationSocialWorker: boolean = false;
  isDischarginClinicianValidationDigitallySigned: boolean = false;
  dischargeClincianHasSaved: boolean = false;

  isPharmacyReviewValidationPassed: boolean = false;
  isPharmacyValidationDigitallySigned: boolean = false;
  validationPharmacyNotes: boolean = false;
  pharmacyHasSaved: boolean = false;

  isNurseReviewValidationPassed: boolean = false;
  isNurseValidationDigitallySigned: boolean = false;
  nurseHasSaved: boolean = false;

  isPrint: boolean = false;

  isControlledDrug: boolean = false;

  isLoading: boolean = false;

  dischargeSummaryPrescriptionId: string;

  printing: boolean = false;

  isPatientDischarged: boolean = false;

  isDisabled: boolean = false;

  mod: MedsOnDischarge;

  showResetWarning: boolean = false;
  clinicianLastSavedBy: string;
  clinicianLastSavedTimestamp: any;

  showDischargeSummaryMessage: boolean = false;
  dischargeSummaryCompletedBy: string;
  dischargeSummaryCompletedTimestamp: any;

  @Output() viewChange: EventEmitter<any> = new EventEmitter();
  @Output() destroyTemplate: EventEmitter<any> = new EventEmitter();

  @Input() set person(value: any) {
    this.personDetails = value;
    this.personId = value.person_id;
    this.encounterId = this.appService.encounterId;
    this.getDischargeSummaryByEncounter(true, true);

    // this.getNotesData();
  };

  constructor(private cd: ChangeDetectorRef, public appService: AppService, public apiRequest: ApirequestService, private subjects: SubjectsService,  private modalService: NgbModal, public subject: SubjectsService) {
    this.subjects.refreshData.subscribe(() => {

      this.getDischargeSummaryByEncounter(false, true);

      // this.getNotesData();
    });

    this.subjects.clinicalSummaryRecordChanged.subscribe((val: any) => {

      this.getDischargeSummaryByEncounter(false, true);

    });

    this.subjects.isPrinitingCompleted.subscribe(() => {
      this.isLoading = false;
      this.printing = false;
      this.isPrint = false;
      $("#pause").css({ 'bottom' : 'initial'});
      // window.scrollBy(0, window.innerHeight);
      // this.destroyRecordsTemplate();

    });
    

    this.subjects.viewChange.subscribe((val: any) => {
      this.viewChange.emit(val)
    });

   }


  CheckDischargePrescriptionStatus() {
    let reset: boolean = false;

      if(this.mod && this.dischargeSummary) {

        if(this.dischargeSummary.cliniciandeclarationcompletedtimestamp != null)
        {
          if(Date.parse(this.mod.modifiedon) > Date.parse(this.dischargeSummary.cliniciandeclarationcompletedtimestamp)) {
            this.ResetDueToDischargePrescription();
          }
        }
        // else{
        //   this.ResetDueToDischargePrescription();
        // }

      }

  }


  @ViewChild('resetModalContent', { static: false }) private resetModalContent;

  ResetDueToDischargePrescription() {
    this.clinicianLastSavedBy = this.dischargeSummary.cliniciandeclarationcompletedby;
    this.clinicianLastSavedTimestamp = this.dischargeSummary.cliniciandeclarationcompletedtimestamp;

    this.showResetWarning = true;
    if(this.dischargeSummary.cliniciandeclarationcompletedtimestamp != null)
    {
      this.resetClinicianDeclaration();
    }
  }



  ngOnInit(): void {
    //this.appService.bannerLabel = "Discharge Summary Created";
  //  this.getDischargeSummaryByEncounter(true);
   // this.getNotesData();
  //  if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
  //  {
  //    this.isPatientDischarged = false;
  //    this.isDisabled = false;
  //  }
  //  else{
  //    this.isPatientDischarged = true;
  //    this.isDisabled = true;
  //  }
  }

  printDischargeSummary(isPatientLeaveSummary?: boolean )
  {
    if(isPatientLeaveSummary){
      this.isPatientLeaveSummary = true;
    }
    else{
      this.isPatientLeaveSummary = false;
    }
    // window.scrollTo(0, 0);
    this.printing = true;
    this.isLoading = true;
  }



  print(isControlledDrug?: boolean, dischargeSummaryPrescriptionId?:string){
    if(isControlledDrug){
      this.isControlledDrug = true;
      this.dischargeSummaryPrescriptionId = dischargeSummaryPrescriptionId;
      this.isPrint = true;
      this.isLoading = true;
    }
    else{
      this.isControlledDrug = false;
      this.dischargeSummaryPrescriptionId = '';
      this.isPrint = true;
      this.isLoading = true;
    }
  }



  destroyRecordsTemplate() {
      this.isLoading = false;
      this.printing = false;
      this.isPrint = false;
      this.cd.detectChanges();
  }

  pdfDownloaded() {
    
    this.destroyTemplate.emit('true');
    this.isLoading = false;
    this.printing = false;
    this.isPrint = false;
    this.cd.detectChanges();
  }


  getDischargePrescriptionByEncounter(){

     this.subscriptions.add(
       this.apiRequest.getRequest(this.appService.baseURI + '/GetListByAttribute?synapsenamespace=local&synapseentityname=epma_medsondischarge&synapseattributename=encounterid&attributevalue=' + this.encounterId)
         .subscribe((response) => {
           if(response)
           {


             let dpeArray: any = JSON.parse(response);

             if(!dpeArray) {
              return;
             }

             let dpe: any = dpeArray[0];

             if(!dpe) {
              return;
             }


             this.mod = dpe;

             this.CheckDischargePrescriptionStatus();

           }

         })
       );
   }

  createClinicalSummaryNotesFilter()
  {
    let condition = "";
    let pm = new filterParams();
    condition = "person_id = @person_id AND encounter_id = @encounter_id";
    pm.filterparams.push(new filterparam("person_id", this.appService.personId));
    pm.filterparams.push(new filterparam("encounter_id", this.appService.encounterId));
    let f = new filters();
    f.filters.push(new filter(condition));


    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY 1 DESC");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }

  listView()
  {
    this.selectedView = 'List Discharge Summary';
    this.viewChange.emit(this.selectedView);
  }

  getNotification(evt) {
    // Do something with the notification (evt) sent by the child!
      this.selectedView = evt;
      this.viewChange.emit(this.selectedView);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getNotesData(){

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            this.notesData = response;

            if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
            {
              this.isPatientDischarged = false;
              this.isDisabled = false;
            }
            else{
              this.isPatientDischarged = true;
              if(this.notesData[0].dischargesummarycompleted){
                this.isDisabled = true;
              }
              else{
                this.isDisabled = false;
              }
              
            }

          }

        })
      );
  }


  getDischargeSummaryByEncounter(createIfNotExists: boolean, getMedicationsOnDischarge: boolean){


    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
        .subscribe((response) => {
          if(response)
          {

              this.dischargeSummary = JSON.parse(response);

              if(createIfNotExists && typeof this.dischargeSummary.encounter_id == undefined || typeof this.dischargeSummary.encounter_id == "undefined") {
                this.createDischargeSummary();
              }
              else {
                this.getNotesData();

                this.GetBannerLabel();

                if(!this.dischargeSummary.completedbyclinician && !this.dischargeSummary.completedbypharmacy && !this.dischargeSummary.dischargesummarycompleted) {
                  this.CheckDischargingClinicianValidation();
                }
                else if(this.dischargeSummary.completedbyclinician && !this.dischargeSummary.completedbypharmacy && !this.dischargeSummary.dischargesummarycompleted) {
                  this.CheckPharmacyValidation();
                }
                else if(this.dischargeSummary.completedbyclinician && this.dischargeSummary.completedbypharmacy && !this.dischargeSummary.dischargesummarycompleted) {
                  this.CheckNurseValidation();
                }

                if(getMedicationsOnDischarge) {
                  this.getDischargePrescriptionByEncounter();
                }


              }




          }

        })
      );
  }



  open(content) {

    this.modalService.open(content, {size: 'dialog-centered', backdrop: 'static'}).result.then((result) => {
    }, (reason) => {
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

  GetBannerLabel() {

    var ds = this.dischargeSummary;

            var bannerLabel = "";
            if(!ds.dischargesummarycreated  && !ds.completedbyclinician && !ds.completedbypharmacy && !ds.dischargesummarycompleted ) {
              bannerLabel = "New"
            }
            else if(ds.dischargesummarycreated  && !ds.completedbyclinician && !ds.completedbypharmacy && !ds.dischargesummarycompleted ) {
              bannerLabel = "Discharge Summary Created"
            }
            else if(ds.dischargesummarycreated  && ds.completedbyclinician && !ds.completedbypharmacy && !ds.dischargesummarycompleted ) {
              bannerLabel = "For Review By Pharmacy"
            }
            else if(ds.dischargesummarycreated  && ds.completedbyclinician && ds.completedbypharmacy && !ds.dischargesummarycompleted ) {
              bannerLabel = "Ready For Discharge"
            }
            else if(ds.dischargesummarycreated  && ds.completedbyclinician && ds.completedbypharmacy && ds.dischargesummarycompleted ) {
              bannerLabel = "Discharge Summary Complete"
            }
            else
            {
              bannerLabel = "New"
            }
      this.appService.bannerLabel = bannerLabel;
      //this.subjects.refreshAllComponents.next();
  }


  createDischargeSummary(){

    this.getPharmacyNotes();

    // this.getClinicalSummaryNotes();

    // this.getEPMAPharmacyNotes();

    // this.postDischargeSummary();

}



  getClinicalSummaryNotes(){
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryNote/' + this.personId)
        .subscribe((response) => {
          if(response == '[]')
          {
            this.clinicalSummaryNotes = '';
          }
          else{
            this.clinicalSummaryNotes = JSON.parse(response)[0].notes;
          }
          this.getDischargePlanNotes();
        })
    )
  }

  getDischargePlanNotes(){
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetDischargePlan/' + this.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          this.dischargePlanNotes = '';
        }
        else{
          this.dischargePlanNotes = JSON.parse(response)[0].dischargeplannotes;
        }
        this.getInvestigationResultNotes();
      })
    )
  }

  getInvestigationResultNotes(){
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetInvestigation/' + this.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          this.investigationNotes = '';
        }
        else{
          this.investigationNotes = JSON.parse(response)[0].clinicalinvestigationnotes;
        }
        this.postDischargeSummary();
      })
    )
  }

  getPharmacyNotes(){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/local/epma_dischargesummarry', this.createPharmacyNotesFilter())
      .subscribe((response) => {
          if(response.length == 0)
          {
            this.pharmacyNotes = '';
          }
          else{
            this.pharmacyNotes = response[0].notes;
          }
          this.getClinicalSummaryNotes();
      })
    )
  }

  getEPMAPharmacyNotes(){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/local/epma_dischargesummarry', this.createPharmacyNotesFilter())
      .subscribe((response) => {
          if(response.length == 0)
          {
            this.pharmacyNotes = '';
          }
          else{
            this.pharmacyNotes = response[0].notes;
          }
          this.postDischargeSummary();
      })
    )
  }



  postDischargeSummary(){
    let dischargeSummary = {
      dischargesummary_id:  this.encounterId,
      person_id: this.appService.personId,
      encounter_id: this.encounterId,
      dischargesummarycreated: true,
      dischargesummarycreatedtimestamp: this.appService.getDateTimeinISOFormat(new Date()),
      importfromcliniclsummary: this.importFromClinicalSummary,
      importfromepma: this.importFromEPMA,
      patienthasindividualrequirements: this.patientHasIndividualRequirements,
      hassafeguardingconcerns: this.hasSafeGuardingConcerns,
      clinicalsummarynotes: this.clinicalSummaryNotes,
      dischargeplan: this.dischargePlanNotes,
      investigationresults: this.investigationNotes,
      individualrequirements: null,
      safegaurdingrisktoself: null,
      safegaurdingrisktoothers: null,
      safegaurdingriskfromothers: null,
      pharmacynotes: this.pharmacyNotes,
      cliniciandeclarationprintedandsigned: false,
      cliniciandeclarationcompleted: false,
      cliniciandeclarationcompletedby: null,
      cliniciandeclarationcompletedtimestamp: null,
      pharmacydeclarationreviewed: false,
      pharmacydeclarationcompletedby: null,
      pharmacydeclarationcompletedtimestamp: null,
      dischargesummarycreatedby: this.appService.loggedInUserName,
      dischargedeclarationdocumentationcompleted: false,
      dischargedeclarationttacheckedandgiven: false,
      dischargedeclarationtpodemptiedandsupplied: false,
      dischargedeclarationcompletedby: null,
      dischargedeclarationcompletedtimestamp: null,
      completedbyclinician: false,
      completedbypharmacy: false,
      dischargesummarycompleted: false,
      isthereallocatedsocialworker: this.isThereAllocatedSocialWorker,
      allocatedsocialworkerdetails: null,
      expecteddateofdischarge: null,
      clinicalsummarynotescreatedby: this.clinicalSummaryNotes != '' ? this.appService.loggedInUserName : null,
      clinicalsummarynotestimestamp: this.clinicalSummaryNotes != '' ? this.appService.getDateTimeinISOFormat(new Date()) : null,
      investigationresultscreatedby: this.investigationNotes != '' ? this.appService.loggedInUserName : null,
      investigationresultstimestamp: this.investigationNotes != '' ? this.appService.getDateTimeinISOFormat(new Date()) : null,
      dischargeplancreatedby: this.dischargePlanNotes != '' ? this.appService.loggedInUserName : null,
      dischargeplantimestamp: this.dischargePlanNotes != '' ? this.appService.getDateTimeinISOFormat(new Date()) : null,
      individualrequirementscreatedby: null,
      individualrequirementstimestamp: null,
      riskstoselfcreatedby: null,
      riskstoselftimestamp: null,
      riskstoothercreatedby: null,
      riskstoothertimestamp: null,
      risksfromothercreatedby: null,
      risksfromotherstimestamp: null,
      socialworkercreatedby: null,
      socialworkertimestamp: null,
      pharmacynotescreatedby: this.pharmacyNotes != '' ? this.appService.loggedInUserName : null,
      pharmacynotestimestamp: this.pharmacyNotes != '' ? this.appService.getDateTimeinISOFormat(new Date()) : null,
      vtenotes: null,
      vtenotescreatedby: null,
      vtenotestimestamp: null
    }


    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary', dischargeSummary)
        .subscribe((response) => {
          if(response)
          {
            this.getDischargeSummaryByEncounter(false, false);
            this.getNotesData();
            // this.selectedView = 'Edit Discharge Summary';
            // this.viewChange.emit(this.selectedView);
          }
        })
      )
  }

  createPharmacyNotesFilter()
  {
    let condition = "";
    let pm = new filterParams();
    condition = "person_id = @person_id AND encounterid = @encounter_id";
    pm.filterparams.push(new filterparam("person_id", this.appService.personId));
    pm.filterparams.push(new filterparam("encounter_id", this.appService.encounterId));
    let f = new filters();
    f.filters.push(new filter(condition));


    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY 1 DESC");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }

  closeAllModals() {
    this.modalService.dismissAll();
  }

    // -- Clinician
    @ViewChild('clinicianValidationModalContent', { static: false }) private clinicianValidationModalContent;
    @ViewChild('resetClinicianDeclarationModalContent', { static: false }) private resetClinicianDeclarationModalContent;
    @ViewChild('dischargeSummaryCompleted', { static: false }) private dischargeSummaryCompleted;

    saveClinicianConfirmation()
    {
      this.CheckDischargingClinicianValidation();
        //Hold the latest value
        var cliniciandeclarationprintedandsigned = this.dischargeSummary.cliniciandeclarationprintedandsigned;
        //Get the latest data
        this.subscriptions.add(
          this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
            .subscribe((response) => {
              if(response)
              {

                this.dischargeSummary.cliniciandeclarationprintedandsigned = cliniciandeclarationprintedandsigned;

                this.subscriptions.add(
                  this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargeSummary)
                    .subscribe((response) => {

                    })
                  )


              }

            })
          );



      }

      CheckReadyForClinicianSigning(){
        this.showResetWarning = false;
        this.dischargeClincianHasSaved = true;
        this.CheckDischargingClinicianValidation();
        if(!this.isDischarginClinicianValidationPassed) {
          this.open(this.clinicianValidationModalContent);
          this.clinicanShowValidationErrors();
        }
        else {
          this.digitallySignClinician();
        }
      }


      clinicanShowValidationErrors() {

        if(!this.appService.isClinician) {

        }
        else {
          if(!this.dischargeSummary.expecteddateofdischarge) {
            this.subject.expectedDischargeDateValidation.next(true);
          }
          else {
            this.subject.expectedDischargeDateValidation.next(false);
          }

          if(!this.dischargeSummary.clinicalsummarynotes) {
            this.subject.clinicalSummaryNotesValidation.next(true);
          }
          else if(this.dischargeSummary.clinicalsummarynotes == "") {
            this.subject.clinicalSummaryNotesValidation.next(true);
          }
          else {
            this.subject.clinicalSummaryNotesValidation.next(false);
          }

          if(!this.dischargeSummary.vtenotes) {
            this.subject.vteNotesValidation.next(true);
          }
          else if(this.dischargeSummary.vtenotes == "") {
            this.subject.vteNotesValidation.next(true);
          }
          else {
            this.subject.vteNotesValidation.next(false);
          }

          if(!this.dischargeSummary.investigationresults) {
            this.subject.investigationResultsValidation.next(true);
          }
          else if(this.dischargeSummary.investigationresults == "") {
            this.subject.investigationResultsValidation.next(true);
          }
          else {
            this.subject.investigationResultsValidation.next(false);
          }

          if(!this.dischargeSummary.dischargeplan) {
            this.subject.dischargePlanValidation.next(true);
          }
          else if(this.dischargeSummary.dischargeplan == "") {
            this.subject.dischargePlanValidation.next(true);
          }
          else {
                 this.subject.dischargePlanValidation.next(false);
          }


          if(this.dischargeSummary.patienthasindividualrequirements && !this.dischargeSummary.individualrequirements) {
            this.subject.individualRequirementsValidation.next(true);
          }
          else if(this.dischargeSummary.patienthasindividualrequirements && this.dischargeSummary.individualrequirements == "") {
            this.subject.individualRequirementsValidation.next(true);
          }
          else {
            this.subject.individualRequirementsValidation.next(false);
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingriskfromothers) {
            this.subject.safeGaurdingRiskFromOthersValidation.next(true);
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingriskfromothers == "") {
            this.subject.safeGaurdingRiskFromOthersValidation.next(true);
          }
          else {
            this.subject.safeGaurdingRiskFromOthersValidation.next(false);
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoothers) {
            this.subject.safeGaurdingRiskToOthersValidation.next(true);
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoothers == "") {
            this.subject.safeGaurdingRiskToOthersValidation.next(true);
          }
          else {
            this.subject.safeGaurdingRiskToOthersValidation.next(false);
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoself) {
            this.subject.safeGaurdingRiskToSelfValidation.next(true);
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoself == "") {
            this.subject.safeGaurdingRiskToSelfValidation.next(true);
          }
          else {
            this.subject.safeGaurdingRiskToSelfValidation.next(false);
          }

          if(this.dischargeSummary.isthereallocatedsocialworker && !this.dischargeSummary.allocatedsocialworkerdetails) {
            this.subject.socialWorkerValidation.next(true);
          }
          else if(this.dischargeSummary.isthereallocatedsocialworker && this.dischargeSummary.allocatedsocialworkerdetails == "") {
            this.subject.socialWorkerValidation.next(true);
          }
          else {
            this.subject.socialWorkerValidation.next(false);
          }



        }

      }

      CheckDischargingClinicianValidation() {

        if(!this.appService.isClinician) {

        }
        else {
          if(!this.dischargeSummary.expecteddateofdischarge) {
            this.isDischarginClinicianValidationEDD = false;
          }
          else {
            this.isDischarginClinicianValidationEDD = true;
          }

          if(!this.dischargeSummary.clinicalsummarynotes) {
            this.isDischarginClinicianValidationClinicalSummaryNotes = false;
          }
          else if(this.dischargeSummary.clinicalsummarynotes == "") {
            this.isDischarginClinicianValidationClinicalSummaryNotes = false;
          }
          else {
            this.isDischarginClinicianValidationClinicalSummaryNotes = true;
          }

          if(!this.dischargeSummary.vtenotes) {
            this.isDischarginClinicianValidationVTENotes = false;
          }
          else if(this.dischargeSummary.vtenotes == "") {
            this.isDischarginClinicianValidationVTENotes = false;
          }
          else {
            this.isDischarginClinicianValidationVTENotes = true;
          }

          if(!this.dischargeSummary.investigationresults) {
            this.isDischarginClinicianValidationInvestigationResults = false;
          }
          else if(this.dischargeSummary.investigationresults == "") {
            this.isDischarginClinicianValidationInvestigationResults = false;
          }
          else {
            this.isDischarginClinicianValidationInvestigationResults = true;
          }

          if(!this.dischargeSummary.dischargeplan) {
            this.isDischarginClinicianValidationDischargePlan = false;
          }
          else if(this.dischargeSummary.dischargeplan == "") {
            this.isDischarginClinicianValidationDischargePlan = false;
          }
          else {
            this.isDischarginClinicianValidationDischargePlan = true;
          }


          if(this.dischargeSummary.patienthasindividualrequirements && !this.dischargeSummary.individualrequirements) {
            this.validationIndividualRequirements = false;
          }
          else if(this.dischargeSummary.patienthasindividualrequirements && this.dischargeSummary.individualrequirements == "") {
            this.validationIndividualRequirements = false;
          }
          else {
            this.validationIndividualRequirements = true;
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingriskfromothers) {
            this.validationSafeGaurdingRiskFromOthers = false;
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingriskfromothers == "") {
            this.validationSafeGaurdingRiskFromOthers = false;
          }
          else {
            this.validationSafeGaurdingRiskFromOthers = true;
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoothers) {
            this.validationSafeGaurdingRiskToOthers = false;
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoothers == "") {
            this.validationSafeGaurdingRiskToOthers = false;
          }
          else {
            this.validationSafeGaurdingRiskToOthers = true;
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoself) {
            this.validationSafeGaurdingRiskToSelf = false;
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoself == "") {
            this.validationSafeGaurdingRiskToSelf = false;
          }
          else {
            this.validationSafeGaurdingRiskToSelf = true;
          }

          if(this.dischargeSummary.isthereallocatedsocialworker && !this.dischargeSummary.allocatedsocialworkerdetails) {
            this.validationSocialWorker = false;
          }
          else if(this.dischargeSummary.isthereallocatedsocialworker && this.dischargeSummary.allocatedsocialworkerdetails == "") {
            this.validationSocialWorker = false;
          }
          else {
            this.validationSocialWorker = true;
          }

          if(this.dischargeSummary.cliniciandeclarationprintedandsigned) {
            this.isDischarginClinicianValidationDigitallySigned = true;
          }
          else {
            this.isDischarginClinicianValidationDigitallySigned = false;
          }
      //     validationIndividualRequirements: boolean = false;
      // validationSafeGaurdingRiskToSelf: boolean = false;
      // validationSafeGaurdingRiskToOthers: boolean = false;
      // validationSafeGaurdingRiskFromOthers: boolean = false;
      // validationSocialWorker: boolean = false;


          this.isDischarginClinicianValidationPassed = this.isDischarginClinicianValidationEDD
          && this.isDischarginClinicianValidationClinicalSummaryNotes
          && this.isDischarginClinicianValidationVTENotes
          && this.isDischarginClinicianValidationInvestigationResults
          && this.isDischarginClinicianValidationDischargePlan
          && this.isDischarginClinicianValidationDigitallySigned
          && this.validationIndividualRequirements
          && this.validationSafeGaurdingRiskFromOthers
          && this.validationSafeGaurdingRiskToOthers
          && this.validationSafeGaurdingRiskToSelf
          && this.validationSocialWorker;
          // if(!this.isDischarginClinicianValidationPassed) {
          //   this.open(this.clinicianValidationModalContent);
          // }

        }

      }

      digitallySignClinician()
      {

          //Get the latest data
          this.subscriptions.add(
            this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
              .subscribe((response) => {
                if(response)
                {
                  var latestDischargeSummaryData = JSON.parse(response);
                  if(JSON.parse(response).dischargesummarycompleted)
                  {
                    this.showDischargeSummaryMessage = true;
                    this.dischargeSummaryCompletedBy = JSON.parse(response).dischargedeclarationcompletedby;
                    this.dischargeSummaryCompletedTimestamp = JSON.parse(response).dischargedeclarationcompletedtimestamp;
                    this.open(this.dischargeSummaryCompleted);
                  }
                  else{
                    this.showDischargeSummaryMessage = false;

                    this.dischargeSummary.completedbyclinician = true;
                    this.dischargeSummary.cliniciandeclarationcompletedby = this.appService.loggedInUserName;
                    this.dischargeSummary.cliniciandeclarationcompletedtimestamp = this.appService.getDateTimeinISOFormat(new Date());

                    latestDischargeSummaryData.completedbyclinician = true;
                    latestDischargeSummaryData.cliniciandeclarationcompletedby = this.appService.loggedInUserName;
                    latestDischargeSummaryData.cliniciandeclarationcompletedtimestamp = this.appService.getDateTimeinISOFormat(new Date());

                    this.subscriptions.add(
                      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',latestDischargeSummaryData)
                        .subscribe((response) => {
                          this.getDischargeSummaryByEncounter(false, false);
                          this.getNotesData();
                          this.GetBannerLabel();
                          this.subjects.refreshAllComponents.next(true);
                          this.CheckPharmacyValidation();
                          // this.pharmacyHasSaved = false;
                          // this.nurseHasSaved = false;
                        })
                      )
                  }

                }

              })
            );



      }

      resetClinicianDeclaration() {

         //Get the latest data
         this.subscriptions.add(
          this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
            .subscribe((response) => {
              if(response)
              {
                // if(JSON.parse(response).dischargesummarycompleted)
                //   {
                //     this.showDischargeSummaryMessage = true;
                //     this.dischargeSummaryCompletedBy = JSON.parse(response).dischargedeclarationcompletedby;
                //     this.dischargeSummaryCompletedTimestamp = JSON.parse(response).dischargedeclarationcompletedtimestamp;
                //     this.open(this.dischargeSummaryCompleted);
                //   }
                //   else{
                //     this.showDischargeSummaryMessage = false;  

                    this.dischargeSummary.cliniciandeclarationprintedandsigned = false;
                    this.dischargeSummary.cliniciandeclarationcompleted = false;
                    this.dischargeSummary.completedbyclinician = false;
                    this.dischargeSummary.cliniciandeclarationcompletedby = null;
                    this.dischargeSummary.cliniciandeclarationcompletedtimestamp = null;

                    this.dischargeSummary.pharmacydeclarationreviewed = false;
                    this.dischargeSummary.completedbypharmacy = false;
                    this.dischargeSummary.pharmacydeclarationcompletedby = null;
                    this.dischargeSummary.pharmacydeclarationcompletedtimestamp = null;

                    this.dischargeSummary.dischargedeclarationdocumentationcompleted = false;
                    this.dischargeSummary.dischargedeclarationtpodemptiedandsupplied = false;
                    this.dischargeSummary.dischargedeclarationttacheckedandgiven = false;
                    this.dischargeSummary.dischargesummarycompleted = false;
                    this.dischargeSummary.dischargedeclarationcompletedby = null;
                    this.dischargeSummary.dischargedeclarationcompletedtimestamp = null;


                    this.subscriptions.add(
                      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargeSummary)
                        .subscribe((response) => {
                          this.getDischargeSummaryByEncounter(false, false);
                          this.getNotesData();
                          this.closeAllModals();
                          this.GetBannerLabel();
                          this.deleteDischargeSummaryPDF();
                          this.subjects.refreshAllComponents.next(true);
                          this.CheckDischargingClinicianValidation();
                          this.dischargeClincianHasSaved = false;
                        })
                      )
                  // }

                


              }

            })
          );
      }

      openConfirmResetClinicianDeclaration() {
        this.open(this.resetClinicianDeclarationModalContent);
      }

      // -- Pharmacy
      @ViewChild('pharmacyValidationModalContent', { static: false }) private pharmacyValidationModalContent;
      @ViewChild('resetPharmacyDeclarationModalContent', { static: false }) private resetPharmacyDeclarationModalContent;

      savePharmacyConfirmation()
      {
        this.CheckPharmacyValidation();
          //Hold the latest value
          var pharmacydeclarationreviewed = this.dischargeSummary.pharmacydeclarationreviewed;
          //Get the latest data
          this.subscriptions.add(
            this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
              .subscribe((response) => {
                if(response)
                {

                  this.dischargeSummary.pharmacydeclarationreviewed = pharmacydeclarationreviewed;

                  this.subscriptions.add(
                    this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargeSummary)
                      .subscribe((response) => {

                      })
                    )


                }

              })
            );



        }

      CheckReadyForPharmacySigning(){
        this.pharmacyHasSaved = true;
        this.CheckPharmacyValidation();
        if(!this.isPharmacyReviewValidationPassed) {
          this.open(this.pharmacyValidationModalContent);
          this.pharmacyShowValidationErrors();
        }
        else {
          this.digitallySignPharmacy();
        }
      }


      pharmacyShowValidationErrors() {

        if(!this.appService.isPharmacist) {

        }
        else {
          if(!this.dischargeSummary.expecteddateofdischarge) {
            this.subject.expectedDischargeDateValidation.next(true);
          }
          else {
            this.subject.expectedDischargeDateValidation.next(false);
          }

          if(!this.dischargeSummary.vtenotes) {
            this.subject.vteNotesValidation.next(true);
          }
          else if(this.dischargeSummary.vtenotes == "") {
            this.subject.vteNotesValidation.next(true);
          }
          else {
            this.subject.vteNotesValidation.next(false);
          }

          if(!this.dischargeSummary.pharmacynotes) {
            this.subject.epmaValidation.next(true);
          }
          else if(this.dischargeSummary.pharmacynotes == "") {
            this.subject.epmaValidation.next(true);
          }
          else {
            this.subject.epmaValidation.next(false);
          }

          if(this.dischargeSummary.patienthasindividualrequirements && !this.dischargeSummary.individualrequirements) {
            this.subject.individualRequirementsValidation.next(true);
          }
          else if(this.dischargeSummary.patienthasindividualrequirements && this.dischargeSummary.individualrequirements == "") {
            this.subject.individualRequirementsValidation.next(true);
          }
          else {
            this.subject.individualRequirementsValidation.next(false);
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingriskfromothers) {
            this.subject.safeGaurdingRiskFromOthersValidation.next(true);
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingriskfromothers == "") {
            this.subject.safeGaurdingRiskFromOthersValidation.next(true);
          }
          else {
            this.subject.safeGaurdingRiskFromOthersValidation.next(false);
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoothers) {
            this.subject.safeGaurdingRiskToOthersValidation.next(true);
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoothers == "") {
            this.subject.safeGaurdingRiskToOthersValidation.next(true);
          }
          else {
            this.subject.safeGaurdingRiskToOthersValidation.next(false);
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoself) {
            this.subject.safeGaurdingRiskToSelfValidation.next(true);
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoself == "") {
            this.subject.safeGaurdingRiskToSelfValidation.next(true);
          }
          else {
            this.subject.safeGaurdingRiskToSelfValidation.next(false);
          }

          if(this.dischargeSummary.isthereallocatedsocialworker && !this.dischargeSummary.allocatedsocialworkerdetails) {
            this.subject.socialWorkerValidation.next(true);
          }
          else if(this.dischargeSummary.isthereallocatedsocialworker && this.dischargeSummary.allocatedsocialworkerdetails == "") {
            this.subject.socialWorkerValidation.next(true);
          }
          else {
            this.subject.socialWorkerValidation.next(false);
          }

          if(!this.dischargeSummary.pharmacynotes) {
            this.subjects.epmaValidation.next(true);
          }
          else if(this.dischargeSummary.pharmacynotes == "") {
            this.subjects.epmaValidation.next(true);
          }
          else {
            this.subjects.epmaValidation.next(false);
          }




        }

      }

      CheckPharmacyValidation() {

        if(!this.appService.isPharmacist) {

        }
        else {
          if(!this.dischargeSummary.expecteddateofdischarge) {
            this.isDischarginClinicianValidationEDD = false;
          }
          else {
            this.isDischarginClinicianValidationEDD = true;
          }

          if(!this.dischargeSummary.vtenotes) {
            this.isDischarginClinicianValidationVTENotes = false;
          }
          else if(this.dischargeSummary.vtenotes == "") {
            this.isDischarginClinicianValidationVTENotes = false;
          }
          else {
            this.isDischarginClinicianValidationVTENotes = true;
          }

          if(!this.dischargeSummary.pharmacynotes) {
            this.validationPharmacyNotes = false;
          }
          else if(this.dischargeSummary.pharmacynotes == "") {
            this.validationPharmacyNotes = false;
          }
          else {
            this.validationPharmacyNotes = true;
          }

          if(this.dischargeSummary.patienthasindividualrequirements && !this.dischargeSummary.individualrequirements) {
            this.validationIndividualRequirements = false;
          }
          else if(this.dischargeSummary.patienthasindividualrequirements && this.dischargeSummary.individualrequirements == "") {
            this.validationIndividualRequirements = false;
          }
          else {
            this.validationIndividualRequirements = true;
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingriskfromothers) {
            this.validationSafeGaurdingRiskFromOthers = false;
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingriskfromothers == "") {
            this.validationSafeGaurdingRiskFromOthers = false;
          }
          else {
            this.validationSafeGaurdingRiskFromOthers = true;
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoothers) {
            this.validationSafeGaurdingRiskToOthers = false;
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoothers == "") {
            this.validationSafeGaurdingRiskToOthers = false;
          }
          else {
            this.validationSafeGaurdingRiskToOthers = true;
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoself) {
            this.validationSafeGaurdingRiskToSelf = false;
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoself == "") {
            this.validationSafeGaurdingRiskToSelf = false;
          }
          else {
            this.validationSafeGaurdingRiskToSelf = true;
          }

          if(this.dischargeSummary.isthereallocatedsocialworker && !this.dischargeSummary.allocatedsocialworkerdetails) {
            this.validationSocialWorker = false;
          }
          else if(this.dischargeSummary.isthereallocatedsocialworker && this.dischargeSummary.allocatedsocialworkerdetails == "") {
            this.validationSocialWorker = false;
          }
          else {
            this.validationSocialWorker = true;
          }

          if(this.dischargeSummary.pharmacydeclarationreviewed) {
            this.isPharmacyValidationDigitallySigned = true;
          }
          else {
            this.isPharmacyValidationDigitallySigned = false;
          }
      //     validationIndividualRequirements: boolean = false;
      // validationSafeGaurdingRiskToSelf: boolean = false;
      // validationSafeGaurdingRiskToOthers: boolean = false;
      // validationSafeGaurdingRiskFromOthers: boolean = false;
      // validationSocialWorker: boolean = false;


          this.isPharmacyReviewValidationPassed = this.isDischarginClinicianValidationEDD
          && this.isDischarginClinicianValidationVTENotes
          && this.isPharmacyValidationDigitallySigned
          && this.validationIndividualRequirements
          && this.validationSafeGaurdingRiskFromOthers
          && this.validationSafeGaurdingRiskToOthers
          && this.validationSafeGaurdingRiskToSelf
          && this.validationSocialWorker
          && this.validationPharmacyNotes;
          // if(!this.isDischarginClinicianValidationPassed) {
          //   this.open(this.clinicianValidationModalContent);
          // }

        }

      }

      digitallySignPharmacy()
      {



          //Get the latest data
          this.subscriptions.add(
            this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
              .subscribe((response) => {
                if(response)
                {
                  console.log('JSON.parse(response)',JSON.parse(response));
                  if(JSON.parse(response).dischargesummarycompleted)
                  {
                    this.showDischargeSummaryMessage = true;
                    this.dischargeSummaryCompletedBy = JSON.parse(response).dischargedeclarationcompletedby;
                    this.dischargeSummaryCompletedTimestamp = JSON.parse(response).dischargedeclarationcompletedtimestamp;
                    this.open(this.dischargeSummaryCompleted);
                  }
                  else{
                    this.showDischargeSummaryMessage = false;

                    this.dischargeSummary.completedbypharmacy = true;
                    this.dischargeSummary.pharmacydeclarationcompletedby = this.appService.loggedInUserName;
                    this.dischargeSummary.pharmacydeclarationcompletedtimestamp = this.appService.getDateTimeinISOFormat(new Date());

                    this.subscriptions.add(
                      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargeSummary)
                        .subscribe((response) => {
                          this.getDischargeSummaryByEncounter(false, false);
                          this.getNotesData();
                          this.GetBannerLabel();
                          this.subjects.refreshAllComponents.next(true);
                          this.CheckNurseValidation();
                          // this.nurseHasSaved = false;

                        })
                      )
                  }

                }

              })
            );



        }



        resetPharmacyDeclaration() {

           //Get the latest data
           this.subscriptions.add(
            this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
              .subscribe((response) => {
                if(response)
                {

                  // if(JSON.parse(response).dischargesummarycompleted)
                  // {
                  //   this.showDischargeSummaryMessage = true;
                  //   this.dischargeSummaryCompletedBy = JSON.parse(response).dischargedeclarationcompletedby;
                  //   this.dischargeSummaryCompletedTimestamp = JSON.parse(response).dischargedeclarationcompletedtimestamp
                  // }
                  // else{
                  //   this.showDischargeSummaryMessage = false;

                    this.dischargeSummary.pharmacydeclarationreviewed = false;
                    this.dischargeSummary.completedbypharmacy = false;
                    this.dischargeSummary.pharmacydeclarationcompletedby = null;
                    this.dischargeSummary.pharmacydeclarationcompletedtimestamp = null;

                    this.dischargeSummary.dischargedeclarationdocumentationcompleted = false;
                    this.dischargeSummary.dischargedeclarationtpodemptiedandsupplied = false;
                    this.dischargeSummary.dischargedeclarationttacheckedandgiven = false;
                    this.dischargeSummary.dischargesummarycompleted = false;
                    this.dischargeSummary.dischargedeclarationcompletedby = null;
                    this.dischargeSummary.dischargedeclarationcompletedtimestamp = null;


                    this.subscriptions.add(
                      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargeSummary)
                        .subscribe((response) => {
                          this.getDischargeSummaryByEncounter(false, false);
                          this.getNotesData();
                          this.closeAllModals();
                          this.GetBannerLabel();
                          this.deleteDischargeSummaryPDF();
                          this.subjects.refreshAllComponents.next(true);
                          this.CheckPharmacyValidation();
                          this.pharmacyHasSaved = false;

                        })
                      )
                  // }

                  // this.dischargeSummary.cliniciandeclarationprintedandsigned = false;
                  // this.dischargeSummary.cliniciandeclarationcompleted = false;
                  // this.dischargeSummary.completedbyclinician = false;
                  // this.dischargeSummary.cliniciandeclarationcompletedby = null;
                  // this.dischargeSummary.cliniciandeclarationcompletedtimestamp = null;

                  


                }

              })
            );
        }

        openConfirmResetPharmacyDeclaration() {
          this.open(this.resetPharmacyDeclarationModalContent);
        }

        // -- Nurse
      @ViewChild('nurseValidationModalContent', { static: false }) private nurseValidationModalContent;
      @ViewChild('resetNurseDeclarationModalContent', { static: false }) private resetNurseDeclarationModalContent;

      saveNurseConfirmation()
      {
        this.CheckPharmacyValidation();
          //Hold the latest value
          var dischargedeclarationdocumentationcompleted = this.dischargeSummary.dischargedeclarationdocumentationcompleted;
          //Get the latest data
          this.subscriptions.add(
            this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
              .subscribe((response) => {
                if(response)
                {

                  this.dischargeSummary.dischargedeclarationdocumentationcompleted = dischargedeclarationdocumentationcompleted;

                  this.subscriptions.add(
                    this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargeSummary)
                      .subscribe((response) => {

                      })
                    )


                }

              })
            );



        }

      CheckReadyForNurseSigning(){
        this.nurseHasSaved = true;
        this.CheckNurseValidation();
        if(!this.isNurseReviewValidationPassed) {
          this.open(this.nurseValidationModalContent);
          this.nurseShowValidationErrors();
        }
        else {
          this.digitallySignNurse();
        }
      }


      nurseShowValidationErrors() {

        if(!this.appService.isNurse) {

        }
        else {
          if(!this.dischargeSummary.expecteddateofdischarge) {
            this.subject.expectedDischargeDateValidation.next(true);
          }
          else {
            this.subject.expectedDischargeDateValidation.next(false);
          }

          // if(!this.dischargeSummary.pharmacynotes) {
          //   this.subject.epmaValidation.next(true);
          // }
          // else if(this.dischargeSummary.pharmacynotes == "") {
          //   this.subject.epmaValidation.next(true);
          // }
          // else {
          //   this.subject.epmaValidation.next(false);
          // }

          if(this.dischargeSummary.patienthasindividualrequirements && !this.dischargeSummary.individualrequirements) {
            this.subject.individualRequirementsValidation.next(true);
          }
          else if(this.dischargeSummary.patienthasindividualrequirements && this.dischargeSummary.individualrequirements == "") {
            this.subject.individualRequirementsValidation.next(true);
          }
          else {
            this.subject.individualRequirementsValidation.next(false);
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingriskfromothers) {
            this.subject.safeGaurdingRiskFromOthersValidation.next(true);
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingriskfromothers == "") {
            this.subject.safeGaurdingRiskFromOthersValidation.next(true);
          }
          else {
            this.subject.safeGaurdingRiskFromOthersValidation.next(false);
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoothers) {
            this.subject.safeGaurdingRiskToOthersValidation.next(true);
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoothers == "") {
            this.subject.safeGaurdingRiskToOthersValidation.next(true);
          }
          else {
            this.subject.safeGaurdingRiskToOthersValidation.next(false);
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoself) {
            this.subject.safeGaurdingRiskToSelfValidation.next(true);
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoself == "") {
            this.subject.safeGaurdingRiskToSelfValidation.next(true);
          }
          else {
            this.subject.safeGaurdingRiskToSelfValidation.next(false);
          }

          if(this.dischargeSummary.isthereallocatedsocialworker && !this.dischargeSummary.allocatedsocialworkerdetails) {
            this.subject.socialWorkerValidation.next(true);
          }
          else if(this.dischargeSummary.isthereallocatedsocialworker && this.dischargeSummary.allocatedsocialworkerdetails == "") {
            this.subject.socialWorkerValidation.next(true);
          }
          else {
            this.subject.socialWorkerValidation.next(false);
          }






        }

      }

      CheckNurseValidation() {

        if(!this.appService.isNurse) {

        }
        else {
          if(!this.dischargeSummary.expecteddateofdischarge) {
            this.isDischarginClinicianValidationEDD = false;
          }
          else {
            this.isDischarginClinicianValidationEDD = true;
          }

          if(!this.dischargeSummary.pharmacynotes) {
            this.validationPharmacyNotes = false;
          }
          else if(this.dischargeSummary.pharmacynotes == "") {
            this.validationPharmacyNotes = false;
          }
          else {
            this.validationPharmacyNotes = true;
          }

          if(this.dischargeSummary.patienthasindividualrequirements && !this.dischargeSummary.individualrequirements) {
            this.validationIndividualRequirements = false;
          }
          else if(this.dischargeSummary.patienthasindividualrequirements && this.dischargeSummary.individualrequirements == "") {
            this.validationIndividualRequirements = false;
          }
          else {
            this.validationIndividualRequirements = true;
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingriskfromothers) {
            this.validationSafeGaurdingRiskFromOthers = false;
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingriskfromothers == "") {
            this.validationSafeGaurdingRiskFromOthers = false;
          }
          else {
            this.validationSafeGaurdingRiskFromOthers = true;
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoothers) {
            this.validationSafeGaurdingRiskToOthers = false;
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoothers == "") {
            this.validationSafeGaurdingRiskToOthers = false;
          }
          else {
            this.validationSafeGaurdingRiskToOthers = true;
          }

          if(this.dischargeSummary.hassafeguardingconcerns && !this.dischargeSummary.safegaurdingrisktoself) {
            this.validationSafeGaurdingRiskToSelf = false;
          }
          else if(this.dischargeSummary.hassafeguardingconcerns && this.dischargeSummary.safegaurdingrisktoself == "") {
            this.validationSafeGaurdingRiskToSelf = false;
          }
          else {
            this.validationSafeGaurdingRiskToSelf = true;
          }

          if(this.dischargeSummary.isthereallocatedsocialworker && !this.dischargeSummary.allocatedsocialworkerdetails) {
            this.validationSocialWorker = false;
          }
          else if(this.dischargeSummary.isthereallocatedsocialworker && this.dischargeSummary.allocatedsocialworkerdetails == "") {
            this.validationSocialWorker = false;
          }
          else {
            this.validationSocialWorker = true;
          }

          if(this.dischargeSummary.dischargedeclarationdocumentationcompleted) {
            this.isNurseValidationDigitallySigned = true;
          }
          else {
            this.isNurseValidationDigitallySigned = false;
          }
      //     validationIndividualRequirements: boolean = false;
      // validationSafeGaurdingRiskToSelf: boolean = false;
      // validationSafeGaurdingRiskToOthers: boolean = false;
      // validationSafeGaurdingRiskFromOthers: boolean = false;
      // validationSocialWorker: boolean = false;


          this.isNurseReviewValidationPassed = this.isDischarginClinicianValidationEDD
          && this.isNurseValidationDigitallySigned
          && this.validationIndividualRequirements
          && this.validationSafeGaurdingRiskFromOthers
          && this.validationSafeGaurdingRiskToOthers
          && this.validationSafeGaurdingRiskToSelf
          && this.validationSocialWorker
          && this.validationPharmacyNotes;
          // if(!this.isDischarginClinicianValidationPassed) {
          //   this.open(this.clinicianValidationModalContent);
          // }

        }

      }

      digitallySignNurse()
      {



          //Get the latest data
          this.subscriptions.add(
            this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
              .subscribe((response) => {
                if(response)
                {

                  if(JSON.parse(response).dischargesummarycompleted)
                  {
                    this.showDischargeSummaryMessage = true;
                    this.dischargeSummaryCompletedBy = JSON.parse(response).dischargedeclarationcompletedby;
                    this.dischargeSummaryCompletedTimestamp = JSON.parse(response).dischargedeclarationcompletedtimestamp;
                    this.open(this.dischargeSummaryCompleted);
                  }
                  else{
                    this.showDischargeSummaryMessage = false;

                    this.dischargeSummary.dischargesummarycompleted = true;
                    this.dischargeSummary.dischargedeclarationcompletedby = this.appService.loggedInUserName;
                    this.dischargeSummary.dischargedeclarationcompletedtimestamp = this.appService.getDateTimeinISOFormat(new Date());

                    this.subscriptions.add(
                      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargeSummary)
                        .subscribe((response) => {
                          this.getDischargeSummaryByEncounter(false, false);
                          this.getNotesData();
                          this.GetBannerLabel();
                          this.subjects.refreshAllComponents.next(true);
                        })
                      )
                  }

                  this.printDischargeSummary();
                }

              })
            );



        }



        resetNurseDeclaration() {

           //Get the latest data
           this.subscriptions.add(
            this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.encounterId)
              .subscribe((response) => {
                if(response)
                {

                  // if(JSON.parse(response).dischargesummarycompleted)
                  // {
                  //   this.showDischargeSummaryMessage = true;
                  //   this.dischargeSummaryCompletedBy = JSON.parse(response).dischargedeclarationcompletedby;
                  //   this.dischargeSummaryCompletedTimestamp = JSON.parse(response).dischargedeclarationcompletedtimestamp
                  // }
                  // else{
                  //   this.showDischargeSummaryMessage = false;

                    this.dischargeSummary.dischargedeclarationdocumentationcompleted = false;
                    this.dischargeSummary.dischargedeclarationtpodemptiedandsupplied = false;
                    this.dischargeSummary.dischargedeclarationttacheckedandgiven = false;
                    this.dischargeSummary.dischargesummarycompleted = false;
                    this.dischargeSummary.dischargedeclarationcompletedby = null;
                    this.dischargeSummary.dischargedeclarationcompletedtimestamp = null;


                    this.subscriptions.add(
                      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargeSummary)
                        .subscribe((response) => {
                          this.getDischargeSummaryByEncounter(false, false);
                          this.getNotesData();
                          this.closeAllModals();
                          this.GetBannerLabel();
                          this.deleteDischargeSummaryPDF();
                          this.subjects.refreshAllComponents.next(true);
                          this.CheckNurseValidation();
                          this.nurseHasSaved = false;
                        })
                      )
                  // }
                  // this.dischargeSummary.cliniciandeclarationprintedandsigned = false;
                  // this.dischargeSummary.cliniciandeclarationcompleted = false;
                  // this.dischargeSummary.completedbyclinician = false;
                  // this.dischargeSummary.cliniciandeclarationcompletedby = null;
                  // this.dischargeSummary.cliniciandeclarationcompletedtimestamp = null;

                  // this.dischargeSummary.pharmacydeclarationreviewed = false;
                  // this.dischargeSummary.completedbypharmacy = false;
                  // this.dischargeSummary.pharmacydeclarationcompletedby = null;
                  // this.dischargeSummary.pharmacydeclarationcompletedtimestamp = null;

                }

              })
            );
        }

        openConfirmResetNurseDeclaration() {
          this.open(this.resetNurseDeclarationModalContent);
        }


        reloadPage()
        {
          this.showDischargeSummaryMessage = false;
          // location.reload();
          this.closeAllModals();
          this.subjects.viewChange.next('List Discharge Summary')
        }

        deleteDischargeSummaryPDF(){
          this.subscriptions.add(
            this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/patientleavesummary', this.createPatientLeaveSummaryFilter())
              .subscribe((response: any) => {
                if (response.length > 0) {
                  this.apiRequest.deleteRequest(this.appService.baseURI + '/DeleteObject?synapsenamespace=core&synapseentityname=patientleavesummary&id=' + response[0].patientleavesummary_id)
                  .subscribe(() => {
                    console.log("Discharge Summary PDF deleted");
                  })
                }
              }
            )
          );
        }

        createPatientLeaveSummaryFilter()
        {
          let condition = "";
          let pm = new filterParams();
      
          condition = "dischargesummary_id = @dischargesummary_id AND ispatientleavesummary = false";
      
          pm.filterparams.push(new filterparam("dischargesummary_id", this.encounterId));
      
          let f = new filters();
          f.filters.push(new filter(condition));
      
          let select = new selectstatement("SELECT *");
      
          let orderby = new orderbystatement("ORDER BY 1 DESC");
      
          let body = [];
          body.push(f);
          body.push(pm);
          body.push(select);
          body.push(orderby);
      
          return JSON.stringify(body);
        }
}
