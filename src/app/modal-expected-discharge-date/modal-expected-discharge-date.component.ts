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

@Component({
  selector: 'app-modal-expected-discharge-date',
  templateUrl: './modal-expected-discharge-date.component.html',
  styleUrls: ['./modal-expected-discharge-date.component.css']
})
export class ModalExpectedDischargeDateComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  clinicalSummaryChange: Subscription = new Subscription();

  personId: string;
  expectedDischargeDate: any;
  expecteddateofdischarge: any;
  eddstring: any;
  showErrorMessage: boolean = false;

   //Date Picker Models
   model: any;
   bsConfig: any;
   maxDateValue: Date = new Date();
   isPatientDischarged: boolean = true;
 
   isDisabled: boolean = false;
   clinicianHasSigned: boolean = false;
   dischargeSummaryId: string;
   showDischargeSummaryMessage: boolean = false;
   dischargeSummaryCompletedBy: string;
   dischargeSummaryCompletedTimestamp: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() expectedDischargeDateData: any;

  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }

  formatDate(date) {
    try {
    return [
      this.padTo2Digits(date.getDate()),
      this.padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/');
    }
    catch(err){
      return(date);
    }
  }

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public subjects: SubjectsService,
    private activeModal: NgbActiveModal,) { 
      
      
      this.subjects.refreshAllComponents.subscribe(() => {
        this.getDischargeSummaryData(false,'');
        this.checkIsDisabled();

      });
    }

    checkIsDisabled() {
      // if(this.expectedDischargeDateData) {
      //   if(this.expectedDischargeDateData[0].dischargesummarycompleted) {
      //     this.isDisabled = true;
      //   }
      //   else {
      //     this.isDisabled = false;
      //   }
      // }

      if((sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) && !(this.expectedDischargeDateData && this.expectedDischargeDateData.length > 0 && this.expectedDischargeDateData[0].dischargesummarycompleted))
      {
        this.isPatientDischarged = false;
        this.isDisabled = false;
      }
      else{
        if(this.expectedDischargeDateData && this.expectedDischargeDateData.length > 0 && this.expectedDischargeDateData[0].dischargesummarycompleted)
        {
          this.isPatientDischarged = true;
          this.isDisabled = true;
        }
        else{
          this.isPatientDischarged = false;
          this.isDisabled = false;
        }
      }
    }

  ngOnInit(): void {
    this.dischargeSummaryId = this.expectedDischargeDateData[0].dischargesummary_id;
    // if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    // {
    //   this.isPatientDischarged = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    // }
    this.subjects.expectedDischargeDateValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
    // this.initializeData();
    this.checkIsDisabled();
    this.getLatestExpectedDischargeDate()
  }

  initializeData()
  {

    if(this.expectedDischargeDateData[0]) {
      if(!this.isEmpty(this.expectedDischargeDateData[0]))
      {
        if(this.expectedDischargeDateData[0].expecteddateofdischarge)
        {
          this.expecteddateofdischarge = new Date(this.expectedDischargeDateData[0].expecteddateofdischarge);
          this.eddstring = this.formatDate(this.expecteddateofdischarge);
        }
        else{
          this.expecteddateofdischarge = null;
        }
      }
    else{
        this.expecteddateofdischarge = null;
      }
    }
  }

  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  // async viewHistory() {
  //   var response = false;
  //   await this.clinicalSummaryNotesHistoryViewerService.confirm(this.summaryNotes.clinicalsummarynotes_id, 'Clinical Summary Notes History','','Import')
  //   .then((confirmed) => response = confirmed)
  //   .catch(() => response = false);
  //   if(!response) {
  //     return;
  //   }

  // }

  getDischargeSummaryData(Save: boolean,event)
  {
    if(event)
    {
      event.preventDefault()
    }
    
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            if(this.expectedDischargeDateData == null || !Save)
            {
              this.expectedDischargeDateData = response;
              this.expectedDischargeDateData[0].expecteddateofdischarge = this.expecteddateofdischarge;
              this.clinicianHasSigned = this.expectedDischargeDateData[0].completedbyclinician;
            }


            if(Save) {
              this.saveClinicalSummary();
            }
          }

        })
      );
  }

  async saveClinicalSummary()
  {
    let latestExpectedDateOfDischarge = this.expecteddateofdischarge
    this.getLatestExpectedDischargeDate();
    
    setTimeout(() => {
      // console.log('this.showDischargeSummaryMessage 2',this.showDischargeSummaryMessage);

      if(this.showDischargeSummaryMessage)
      {
        // console.log('true');
      }
      else {
        // console.log('false');
        if(!latestExpectedDateOfDischarge)
        {
          this.subjects.expectedDischargeDateValidation.next(true);
        }
        else{
          this.subjects.expectedDischargeDateValidation.next(false);
        }

        this.expectedDischargeDateData[0].expecteddateofdischarge = latestExpectedDateOfDischarge?this.appService.getDateTimeinISOFormat(latestExpectedDateOfDischarge):null;
        // console.log('this.expectedDischargeDateData',this.expectedDischargeDateData[0]);
        this.subscriptions.add(
          this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.expectedDischargeDateData[0])
            .subscribe((response) => {
              if(response)
              {
                this.subjects.clinicalSummaryRecordChanged.next("EDD");
                this.initializeData();
                this.activeModal.dismiss();
              }

            })
          );
      }
    }, 1000);
    
  }

  async getLatestExpectedDischargeDate()
  {
    await this.subscriptions.add(
    this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id='+this.dischargeSummaryId)
      .subscribe((response) => {
        if(JSON.parse(response).dischargesummarycompleted)
        {
          this.showDischargeSummaryMessage = true;
          this.dischargeSummaryCompletedBy = JSON.parse(response).dischargedeclarationcompletedby;
          this.dischargeSummaryCompletedTimestamp = JSON.parse(response).dischargedeclarationcompletedtimestamp
        }
        else{
          this.showDischargeSummaryMessage = false;
        }
        if(JSON.parse(response).expecteddateofdischarge != null)
        {
          this.expecteddateofdischarge = new Date(JSON.parse(response).expecteddateofdischarge);
        }
        else{
          this.expecteddateofdischarge = null;
        }
        this.eddstring = this.formatDate(this.expecteddateofdischarge);
      }));
  }

  reloadPage()
  {
    // location.reload();
    this.showDischargeSummaryMessage = false;
    this.activeModal.dismiss();
    this.subjects.viewChange.next('List Discharge Summary')
  }

  getExpectedDischargeDate(date)
  {
    this.expecteddateofdischarge = date;
  }

  public dismiss() {
    this.showDischargeSummaryMessage = false;
    this.subjects.clinicalSummaryRecordChanged.next("EDD");
    this.activeModal.dismiss();
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
