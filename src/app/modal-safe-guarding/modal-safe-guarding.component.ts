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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { SafeGaurdingHistoryViewerService } from '../safe-gaurding-history-viewer/safe-gaurding-history-viewer.service';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';

@Component({
  selector: 'app-modal-safe-guarding',
  templateUrl: './modal-safe-guarding.component.html',
  styleUrls: ['./modal-safe-guarding.component.css']
})
export class ModalSafeGuardingComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  public Editor = ClassicEditor;
  showRiskToSelfButtons: boolean = false;
  showRiskToOthersButtons: boolean = false;
  showRiskFromOthersButtons: boolean = false;
  // safeGaurdingData: any;
  hassafeguardingconcerns: boolean;
  safegaurdingriskfromothers: string = '';
  safegaurdingrisktoothers: string = '';
  safegaurdingrisktoself: string = '';
  showEditor:boolean = false;

  showErrorMessage1: boolean = false;
  showErrorMessage2: boolean = false;
  showErrorMessage3: boolean = false;
  importFromSafeGuarding: boolean = false;
  flag: boolean = false;
  flagRiskToOthers: boolean = false;
  flagRiskFromOthers: boolean = false;
  flagRiskToSelf: boolean = false;

  risktoselfcreatedby: string;
  risktoselftimestamp: any;
  risktootherscreatedby: string;
  risktootherstimestamp: any;
  riskfromotherscreatedby: string;
  riskfromotherstimestamp: any;

  isDisabled: boolean = false;
  isDischargeSummaryCompleted : boolean = false;
  clinicianHasSigned: boolean = false;

  isPatientDischarged:boolean = true;
  dischargeSummaryId: string;
  showDischargeSummaryMessage: boolean = false;
  dischargeSummaryCompletedBy: string;
  dischargeSummaryCompletedTimestamp: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() safeGaurdingData: any;

  checkIsDisabled() {
    // if(this.safeGaurdingData) {
    //   if((this.safeGaurdingData[0].dischargesummarycompleted) || !(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)) {
    //     this.isDischargeSummaryCompleted = true;
    //     this.isDisabled = true;
    //     this.isPatientDischarged = true;
    //   }
    //   else {
    //     this.isDischargeSummaryCompleted = false;
    //     this.isDisabled = false;
    //     this.isPatientDischarged = false;
    //   }
    // }

    if((sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) && !(this.safeGaurdingData && this.safeGaurdingData.length > 0 && this.safeGaurdingData[0].dischargesummarycompleted))
    {
      this.isDischargeSummaryCompleted = false;
        this.isDisabled = false;
        this.isPatientDischarged = false;
    }
    else{
      if(this.safeGaurdingData && this.safeGaurdingData.length > 0 && this.safeGaurdingData[0].dischargesummarycompleted)
      {
        this.isDischargeSummaryCompleted = true;
        this.isDisabled = true;
        this.isPatientDischarged = true;
      }
      else{
        this.isDischargeSummaryCompleted = false;
        this.isDisabled = false;
        this.isPatientDischarged = false;
      }
    }
    // if(!this.appService.isClinician) {
    //   this.isDisabled = true;
    // }
  }

  initializeData()
  {
    if(this.safeGaurdingData[0]) {
      if(!this.isEmpty(this.safeGaurdingData[0]))
      {
          this.safegaurdingrisktoself = this.safeGaurdingData[0].safegaurdingrisktoself;
          this.safegaurdingrisktoothers = this.safeGaurdingData[0].safegaurdingrisktoothers;
          this.safegaurdingriskfromothers = this.safeGaurdingData[0].safegaurdingriskfromothers;
          this.hassafeguardingconcerns = this.safeGaurdingData[0].hassafeguardingconcerns;
          if(this.hassafeguardingconcerns)
          {
            this.importFromSafeGuarding = this.safeGaurdingData[0].hassafeguardingconcerns;
            this.showEditor = true;
          }

          if((this.safeGaurdingData[0].riskstoselfcreatedby != '' || this.safeGaurdingData[0].riskstoselfcreatedby != null) && (this.safeGaurdingData[0].riskstoselfcreatedtimestamp != '' || this.safeGaurdingData[0].riskstoselfcreatedtimestamp != null))
          {
            this.risktoselfcreatedby = this.safeGaurdingData[0].riskstoselfcreatedby;
            this.risktoselftimestamp = this.safeGaurdingData[0].riskstoselftimestamp;
          }

          if((this.safeGaurdingData[0].riskstootherscreatedby != '' || this.safeGaurdingData[0].riskstootherscreatedby != null) && (this.safeGaurdingData[0].riskstoothertimestamp != '' || this.safeGaurdingData[0].riskstoothertimestamp != null))
          {
            this.risktootherscreatedby = this.safeGaurdingData[0].riskstoothercreatedby;
            this.risktootherstimestamp = this.safeGaurdingData[0].riskstoothertimestamp;
          }

          if((this.safeGaurdingData[0].risksfromothercreatedby != '' || this.safeGaurdingData[0].risksfromothercreatedby != null) && (this.safeGaurdingData[0].risksfromotherstimestamp != '' || this.safeGaurdingData[0].risksfromotherstimestamp != null))
          {
            this.riskfromotherscreatedby = this.safeGaurdingData[0].risksfromothercreatedby;
            this.riskfromotherstimestamp = this.safeGaurdingData[0].risksfromotherstimestamp;
          }
      }
      else{
        this.safeGaurdingData = '';
        this.importFromSafeGuarding = false;
      }
    }
  }

  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public subjects: SubjectsService,
    private activeModal: NgbActiveModal,
    public safeGaurdingHistoryViewerService:SafeGaurdingHistoryViewerService,) { 
    this.Editor.defaultConfig = {
      toolbar: {
        items: [
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          '|',
          'bulletedList',
          'numberedList',
          '|',
          'undo',
          'redo'
        ]
      },
      language: 'en'
    };

    this.subjects.refreshAllComponents.subscribe(() => {
      this.getDischargeSummaryData(false);


    });
  }

  ngOnInit(): void {
    this.dischargeSummaryId = this.safeGaurdingData[0].dischargesummary_id;
    // if((sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) && !(this.isDischargeSummaryCompleted))
    // {
    //   this.isPatientDischarged = false;
    //   this.isDisabled = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    //   this.isDisabled = true;
    // }
    this.subjects.safeGaurdingRiskToSelfValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage1 = true;
      }
      else{
        this.showErrorMessage1 = false;
      }
    })

    this.subjects.safeGaurdingRiskToOthersValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage2 = true;
      }
      else{
        this.showErrorMessage2 = false;
      }
    })

    this.subjects.safeGaurdingRiskFromOthersValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage3 = true;
      }
      else{
        this.showErrorMessage3 = false;
      }
    })
    this.checkIsDisabled();
    this.getLatestSafeGuarding()
  }

  getDischargeSummaryData(Save: boolean)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            if(this.safegaurdingrisktoself == null && this.safegaurdingrisktoothers == null && this.safegaurdingriskfromothers == null || Save)
            {
              this.safeGaurdingData = response;
              this.clinicianHasSigned = this.safeGaurdingData[0].completedbyclinician;
              //this.checkIsDisabled();
            }




            if(Save) {
              this.saveSafeGaurding();
            }
          }

        })
      );
  }

  getLatestSafeGuarding()
  {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id='+this.dischargeSummaryId)
        .subscribe((response) => {
            this.safegaurdingrisktoself = JSON.parse(response).safegaurdingrisktoself;
            this.safegaurdingrisktoothers = JSON.parse(response).safegaurdingrisktoothers;
            this.safegaurdingriskfromothers = JSON.parse(response).safegaurdingriskfromothers;
            this.hassafeguardingconcerns = JSON.parse(response).hassafeguardingconcerns;
            if(JSON.parse(response).dischargesummarycompleted)
            {
              this.showDischargeSummaryMessage = true;
              this.dischargeSummaryCompletedBy = JSON.parse(response).dischargedeclarationcompletedby;
              this.dischargeSummaryCompletedTimestamp = JSON.parse(response).dischargedeclarationcompletedtimestamp
            }
            else{
              this.showDischargeSummaryMessage = false;
            }
        }));
  }

  saveRiskToSelf()
  {
    // if(this.safeGaurdingData[0].safegaurdingrisktoself != this.safegaurdingrisktoself)
    // {
    //   this.flagRiskToSelf = true;
    // }
    // else{
    //   this.flagRiskToSelf = false;
    // }
    this.safeGaurdingData[0].safegaurdingrisktoself = this.safegaurdingrisktoself?this.safegaurdingrisktoself.trim(): null;
    this.safeGaurdingData[0].riskstoselfcreatedby = this.appService.loggedInUserName;
    this.safeGaurdingData[0].riskstoselftimestamp = this.appService.getDateTimeinISOFormat(new Date());
    // if(this.flagRiskToSelf)
    // {
    //   this.getDischargeSummaryData(true);
    // }
    // this.saveSafeGaurding();

  }

  saveRiskToOthers()
  {
    // if(this.safeGaurdingData[0].safegaurdingrisktoothers != this.safegaurdingrisktoothers)
    // {
    //   this.flagRiskToOthers = true;
    // }
    // else{
    //   this.flagRiskToOthers = false;
    // }
    this.safeGaurdingData[0].safegaurdingrisktoothers = this.safegaurdingrisktoothers?this.safegaurdingrisktoothers.trim(): null;
    this.safeGaurdingData[0].riskstoothercreatedby = this.appService.loggedInUserName;
    this.safeGaurdingData[0].riskstoothertimestamp = this.appService.getDateTimeinISOFormat(new Date());
    // if(this.flagRiskToOthers)
    // {
    //   this.getDischargeSummaryData(true);
    // }
    // this.saveSafeGaurding();
  }

  saveRiskFromOthers()
  {
    // if(this.safeGaurdingData[0].safegaurdingriskfromothers != this.safegaurdingriskfromothers)
    // {
    //   this.flagRiskFromOthers = true;
    // }
    // else{
    //   this.flagRiskFromOthers = false;
    // }
    this.safeGaurdingData[0].safegaurdingriskfromothers = this.safegaurdingriskfromothers?this.safegaurdingriskfromothers.trim(): null;
    this.safeGaurdingData[0].risksfromothercreatedby = this.appService.loggedInUserName;
    this.safeGaurdingData[0].risksfromotherstimestamp = this.appService.getDateTimeinISOFormat(new Date());

    // this.saveSafeGaurding();
    // if(this.flagRiskFromOthers)
    // {
    //   // this.getDischargeSummaryData(true);

    // }
  }

  async saveSafeGaurding()
  {
    let latestHasSafeGuardingConcerns = this.hassafeguardingconcerns;
    let latestSafegaurdingRiskToSelf = this.safegaurdingrisktoself;
    let latestsafegaurdingRiskToOthers = this.safegaurdingrisktoothers;
    let latestSafegaurdingRiskFromOthers = this.safegaurdingriskfromothers;
    this.getLatestSafeGuarding();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {
      }
      else {
        if(this.safeGaurdingData != undefined ||  this.safeGaurdingData != null ||  this.safeGaurdingData != '')
        {
          if(this.safeGaurdingData.length > 0)
          {
            if(latestHasSafeGuardingConcerns)
            {
              if(!latestSafegaurdingRiskToSelf || latestSafegaurdingRiskToSelf == '' || latestSafegaurdingRiskToSelf == null)
              {
                this.subjects.safeGaurdingRiskToSelfValidation.next(true);
              }
              else{
                this.subjects.safeGaurdingRiskToSelfValidation.next(false);
              }
                // if(!this.hassafeguardingconcerns)
                // {
                //   this.saveData();
                // }
                // if(this.flagRiskToSelf)
                // {
                //   this.saveData();
                // }



              if(!latestsafegaurdingRiskToOthers || latestsafegaurdingRiskToOthers == '' || latestsafegaurdingRiskToOthers == null)
              {
                this.subjects.safeGaurdingRiskToOthersValidation.next(true);
              }
              else{
                this.subjects.safeGaurdingRiskToOthersValidation.next(false);
              }

                // if(!this.hassafeguardingconcerns)
                // {
                //   this.saveData();
                // }
                // if(this.flagRiskToOthers)
                // {
                //   this.saveData();
                // }


              if(!latestSafegaurdingRiskFromOthers || latestSafegaurdingRiskFromOthers == '' || latestSafegaurdingRiskFromOthers == null)
              {
                this.subjects.safeGaurdingRiskFromOthersValidation.next(true);
              }
              else{
                this.subjects.safeGaurdingRiskFromOthersValidation.next(false);
              }


                // if(!this.hassafeguardingconcerns)
                // {
                //   this.saveData();
                // }
                // if(this.flagRiskFromOthers)
                // {
                //   this.saveData();
                // }

                this.saveData(latestHasSafeGuardingConcerns);

            }
            else{
                this.saveData(latestHasSafeGuardingConcerns);
            }
          }
        }
      }
    }, 1000);
    
  }

  saveData(latestHasSafeGuardingConcerns)
  {
    // if(!this.hassafeguardingconcerns)
    // {
    //   this.safeGaurdingData[0].riskstoselfcreatedby = null;
    //   this.safeGaurdingData[0].riskstoselftimestamp = null;
    //   this.safeGaurdingData[0].riskstoothercreatedby = null;
    //   this.safeGaurdingData[0].riskstoothertimestamp = null;
    //   this.safeGaurdingData[0].risksfromothercreatedby = null;
    //   this.safeGaurdingData[0].risksfromotherstimestamp = null;
    // }
    this.safeGaurdingData[0].riskstoselfcreatedby = this.appService.loggedInUserName;
    this.safeGaurdingData[0].riskstoselftimestamp = this.appService.getDateTimeinISOFormat(new Date());
    this.safeGaurdingData[0].riskstoothercreatedby = this.appService.loggedInUserName;
    this.safeGaurdingData[0].riskstoothertimestamp = this.appService.getDateTimeinISOFormat(new Date());
    this.safeGaurdingData[0].risksfromothercreatedby = this.appService.loggedInUserName;
    this.safeGaurdingData[0].risksfromotherstimestamp = this.appService.getDateTimeinISOFormat(new Date());
    this.safeGaurdingData[0].hassafeguardingconcerns = latestHasSafeGuardingConcerns;
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.safeGaurdingData[0])
        .subscribe((response) => {

          this.showRiskFromOthersButtons = false;
          this.showRiskToOthersButtons = false;
          this.showRiskToSelfButtons = false;
          this.flagRiskFromOthers = false;
          this.flagRiskToOthers = false;
          this.flagRiskToSelf = false;
          this.subjects.clinicalSummaryRecordChanged.next("Safegauarding");
          this.initializeData();
          this.activeModal.dismiss();

        })
      )
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

  async viewHistory(status) {
    if(!this.isPatientDischarged){
      var response = false;
      await this.safeGaurdingHistoryViewerService.confirm(this.safeGaurdingData[0].dischargesummary_id, status,'','Import')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }
  }

  reloadPage()
  {
    // location.reload();
    this.showDischargeSummaryMessage = false;
    this.activeModal.dismiss();
    this.subjects.viewChange.next('List Discharge Summary')
  }

  public dismiss() {
    this.showDischargeSummaryMessage = false;
    this.getLatestSafeGuarding();
    setTimeout(() => {
      if(!this.safegaurdingrisktoself || this.safegaurdingrisktoself == '' || this.safegaurdingrisktoself == null)
      {
        this.subjects.safeGaurdingRiskToSelfValidation.next(true);
      }
      else{
        this.subjects.safeGaurdingRiskToSelfValidation.next(false);
      }
  
      if(!this.safegaurdingrisktoothers || this.safegaurdingrisktoothers == '' || this.safegaurdingrisktoothers == null)
      {
        this.subjects.safeGaurdingRiskToOthersValidation.next(true);
      }
      else{
        this.subjects.safeGaurdingRiskToOthersValidation.next(false);
      }
  
      if(!this.safegaurdingriskfromothers || this.safegaurdingriskfromothers == '' || this.safegaurdingriskfromothers == null)
      {
        this.subjects.safeGaurdingRiskFromOthersValidation.next(true);
      }
      else{
        this.subjects.safeGaurdingRiskFromOthersValidation.next(false);
      }
      this.subjects.clinicalSummaryRecordChanged.next("Safegauarding");
      this.activeModal.dismiss();
    }, 500);
   
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
