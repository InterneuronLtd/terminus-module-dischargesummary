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
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';
import { DischargePlanNotesHistoryViewerService } from '../discharge-plan-notes-history-viewer/discharge-plan-notes-history-viewer.service';

@Component({
  selector: 'app-modal-discharge-plan',
  templateUrl: './modal-discharge-plan.component.html',
  styleUrls: ['./modal-discharge-plan.component.css']
})
export class ModalDischargePlanComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  public Editor = ClassicEditor;

  dischargeplan: any = '';
  dischargeSummaryId: string;

  showErrorMessage: boolean = false;
  importFromClinicalSummary: boolean;

  dischargeplancreatedby: string;
  dischargeplantimestamp: any;
  isPatientDischarged: boolean = true;

  isDisabled: boolean = false;
  clinicianHasSigned: boolean = false;

  showDischargeSummaryMessage: boolean = false;
  dischargeSummaryCompletedBy: string;
  dischargeSummaryCompletedTimestamp: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() dischargePlanData: any;

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public subjects: SubjectsService,
    private activeModal: NgbActiveModal,
    public dischargePlanNotesHistoryViewerService: DischargePlanNotesHistoryViewerService,) {
      this.subjects.encounterChange.subscribe( () => {
        if(!this.appService.encounterId) {
        return;
        }
      });

      this.subjects.importDischargePlan.subscribe(resp => {
        if(resp)
        {
          this.dischargeplan = resp;
        }
      });

      this.subjects.refreshAllComponents.subscribe(() => {
        this.getDischargeSummaryData(false);
        this.checkIsDisabled();

      });

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
     }

  ngOnInit(): void {
    this.dischargeSummaryId = this.dischargePlanData[0].dischargesummary_id;
    // if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    // {
    //   this.isPatientDischarged = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    // }

    this.subjects.dischargePlanValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
    this.checkIsDisabled();
    this.getLatestDischargePlan()
  }

  initializeData()
  {
    if(this.dischargePlanData[0]) {
      if(!this.isEmpty(this.dischargePlanData[0]))
      {
        if(this.dischargePlanData[0].importfromcliniclsummary)
        {
          this.importFromClinicalSummary = this.dischargePlanData[0].importfromcliniclsummary;
        }

        if(this.dischargePlanData.clinicalsummarynotes != null || this.dischargePlanData.clinicalsummarynotes != '')
        {
          this.dischargeplan = this.dischargePlanData[0].dischargeplan;
        }

        if((this.dischargePlanData[0].dischargeplancreatedby != '' || this.dischargePlanData[0].dischargeplancreatedby != null) && (this.dischargePlanData[0].dischargeplancreatedtimestamp != '' || this.dischargePlanData[0].dischargeplancreatedtimestamp != null))
        {
          // this.showCancelSaveButtons = false;
          this.dischargeplancreatedby = this.dischargePlanData[0].dischargeplancreatedby;
          this.dischargeplantimestamp = this.dischargePlanData[0].dischargeplantimestamp;
        }
      }
      else{
        this.dischargeplan = '';
        this.importFromClinicalSummary = false;
      }
    }
  }

  getDischargeSummaryData(Save: boolean)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            if(this.dischargeplan == null || !Save)
            {
              this.dischargePlanData = response;
              this.clinicianHasSigned = this.dischargePlanData[0].completedbyclinician;
            }


            // if(Save) {
            //   this.saveDischargePlan();
            // }
          }

        })
      );
  }

  checkIsDisabled() {
    if(this.dischargePlanData) {
      if(this.dischargePlanData[0].completedbyclinician) {
        this.isDisabled = true;
      }
      else {
        this.isDisabled = false;
      }
    }

    if(!this.appService.isClinician) {
      this.isDisabled = true;
    }

    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
      {
        this.isPatientDischarged = false;
      }
      else{
        if(this.dischargePlanData && this.dischargePlanData.length > 0 && this.dischargePlanData[0].dischargesummarycompleted)
        {
          this.isPatientDischarged = true;
        }
        else{
          this.isPatientDischarged = false;
        }
      }
  }

  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  async getLatestDischargePlan()
  {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id='+this.dischargeSummaryId)
        .subscribe((response) => {
            this.dischargeplan = JSON.parse(response).dischargeplan;
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

  async saveDischargePlan()
  {
    let latestDischargePlan = this.dischargeplan
    this.getLatestDischargePlan();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {}
      else {
        if(!latestDischargePlan)
        {
          this.subjects.dischargePlanValidation.next(true);
        }
        else if(latestDischargePlan == '')
        {
          this.subjects.dischargePlanValidation.next(true);
        }
        else{
          this.subjects.dischargePlanValidation.next(false);
        }
          this.dischargePlanData[0].dischargeplan = latestDischargePlan?latestDischargePlan.trim():null;
          this.dischargePlanData[0].dischargeplancreatedby = this.appService.loggedInUserName;
          this.dischargePlanData[0].dischargeplantimestamp = this.appService.getDateTimeinISOFormat(new Date());
          this.subscriptions.add(
            this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargePlanData[0])
              .subscribe((response) => {

                // this.showCancelSaveButtons = false;
                this.subjects.clinicalSummaryRecordChanged.next("Discharge Plan");
                this.initializeData();
                this.activeModal.dismiss();

              })
            )
      }
    }, 1000);
    


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

  async viewHistory() {
    if(!this.isPatientDischarged){
      var response = false;
      await this.dischargePlanNotesHistoryViewerService.confirm(this.dischargePlanData[0].dischargesummary_id, 'Clinical Summary Notes History','','Import')
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
    this.getLatestDischargePlan();
    setTimeout(() => {
      if(!this.dischargeplan)
      {
        this.subjects.dischargePlanValidation.next(true);
      }
      else if(this.dischargeplan == '')
      {
        this.subjects.dischargePlanValidation.next(true);
      }
      else{
        this.subjects.dischargePlanValidation.next(false);
      }
      this.subjects.clinicalSummaryRecordChanged.next("Discharge Plan");
      this.activeModal.dismiss();
    }, 500);
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
