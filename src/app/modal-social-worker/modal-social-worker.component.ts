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
import { Subscription } from 'rxjs';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { SocialWorkerHistoryViewerService } from '../social-worker-history-viewer/social-worker-history-viewer.service';
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-social-worker',
  templateUrl: './modal-social-worker.component.html',
  styleUrls: ['./modal-social-worker.component.css']
})
export class ModalSocialWorkerComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  public Editor = ClassicEditor;
  showCancelSaveButtons: boolean = false;
  // socialWorkerData: any;
  allocatedsocialworkerdetails: string;
  isthereallocatedsocialworker: boolean;
  showEditor:boolean = false;

  showErrorMessage: boolean = false;
  importFromSocialWorker: boolean;

  socialworkercreatedby: string;
  socialworkertimestamp: any;

  flag: boolean = false;
  isPatientDischarged:boolean = true;

  isDisabled: boolean = false;
  isDischargeSummaryCompleted : boolean = false;
  clinicianHasSigned: boolean = false;
  dischargeSummaryId: string;
  showDischargeSummaryMessage: boolean = false;
  dischargeSummaryCompletedBy: string;
  dischargeSummaryCompletedTimestamp: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() socialWorkerData: any;

  checkIsDisabled() {
    // if(this.socialWorkerData) {
    //   if((this.socialWorkerData[0].dischargesummarycompleted) || !(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)) {
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

    // if(!this.appService.isClinician) {
    //   this.isDisabled = true;
    // }

    if((sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) && !(this.socialWorkerData && this.socialWorkerData.length > 0 && this.socialWorkerData[0].dischargesummarycompleted))
    {
      this.isDischargeSummaryCompleted = false;
      this.isDisabled = false;
      this.isPatientDischarged = false;
    }
    else{
      if(this.socialWorkerData && this.socialWorkerData.length > 0 && this.socialWorkerData[0].dischargesummarycompleted)
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
  }

  initializeData()
  {
    if(this.socialWorkerData[0]) {
      if(!this.isEmpty(this.socialWorkerData[0]))
      {
        if(this.socialWorkerData[0].isthereallocatedsocialworker)
        {
          this.importFromSocialWorker = this.socialWorkerData[0].isthereallocatedsocialworker;
          this.showEditor = true;
        }

        if((this.socialWorkerData[0].socialworkercreatedby != '' || this.socialWorkerData[0].socialworkercreatedby != null) && (this.socialWorkerData[0].socialworkercreatedtimestamp != '' || this.socialWorkerData[0].socialworkercreatedtimestamp != null))
        {
          this.socialworkercreatedby = this.socialWorkerData[0].socialworkercreatedby;
          this.socialworkertimestamp = this.socialWorkerData[0].socialworkertimestamp;
        }

        this.allocatedsocialworkerdetails = this.socialWorkerData[0].allocatedsocialworkerdetails;
        this.isthereallocatedsocialworker = this.socialWorkerData[0].isthereallocatedsocialworker;
      }
      else{
        this.allocatedsocialworkerdetails = '';
        this.importFromSocialWorker = false;
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
    public socialWorkerHistoryViewerService: SocialWorkerHistoryViewerService,) { 
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
      this.checkIsDisabled();

    });
  }

  ngOnInit(): void {
    this.dischargeSummaryId = this.socialWorkerData[0].dischargesummary_id;
    // if((sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) && !(this.isDischargeSummaryCompleted))
    // {
    //   this.isPatientDischarged = false;
    //   this.isDisabled = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    //   this.isDisabled = true;
    // }
    this.subjects.socialWorkerValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
    this.checkIsDisabled();
    this.getLatestSocialWorker()
  }

  getDischargeSummaryData(Save: boolean)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            if(this.allocatedsocialworkerdetails == null || Save)
            {
              this.socialWorkerData = response;
              this.clinicianHasSigned = this.socialWorkerData[0].completedbyclinician;
            }
            if(Save) {
              this.saveSocialWorker();
            }

          }

        })
      );
  }

  async getLatestSocialWorker()
  {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id='+this.dischargeSummaryId)
        .subscribe((response) => {
            this.allocatedsocialworkerdetails = JSON.parse(response).allocatedsocialworkerdetails;
            this.isthereallocatedsocialworker = JSON.parse(response).isthereallocatedsocialworker;
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

  async saveSocialWorker()
  {
    let latestSocialWorker = this.allocatedsocialworkerdetails;
    let latestIsReallocatedSocialWorker = this.isthereallocatedsocialworker;
    this.getLatestSocialWorker();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {
      }
      else {
        if(this.socialWorkerData != undefined ||  this.socialWorkerData != null)
        {
          if(latestIsReallocatedSocialWorker && (!latestSocialWorker || latestSocialWorker == '' || latestSocialWorker == null))
          {
            this.subjects.socialWorkerValidation.next(true);
          }
          else{
            this.subjects.socialWorkerValidation.next(false);
          }

              // if(!this.isthereallocatedsocialworker)
              // {
              //   this.saveData();
              // }
              // if(this.allocatedsocialworkerdetails.trim() != '')
              // {
                this.saveData(latestSocialWorker, latestIsReallocatedSocialWorker);
              //}


          // }
          }
      }
    }, 1000);
    

  }

  saveData(latestSocialWorker, latestIsReallocatedSocialWorker)
  {
    this.socialWorkerData[0].socialworkercreatedby = this.appService.loggedInUserName;
    this.socialWorkerData[0].socialworkertimestamp = this.appService.getDateTimeinISOFormat(new Date());
    this.socialWorkerData[0].allocatedsocialworkerdetails = latestSocialWorker?latestSocialWorker.trim():null;
    this.socialWorkerData[0].isthereallocatedsocialworker = latestIsReallocatedSocialWorker;

    // if(this.clinicalSummaryNotes)
    // {
      this.subscriptions.add(
        this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.socialWorkerData[0])
          .subscribe((response) => {

            // this.showCancelSaveButtons = false;
            this.subjects.clinicalSummaryRecordChanged.next("Social Worker");
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

  async viewHistory() {
    if(!this.isPatientDischarged){
      var response = false;
      await this.socialWorkerHistoryViewerService.confirm(this.socialWorkerData[0].dischargesummary_id, 'Clinical Summary Notes History','','Import')
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
    this.getLatestSocialWorker();
    setTimeout(() => {
      if(this.isthereallocatedsocialworker && (!this.allocatedsocialworkerdetails || this.allocatedsocialworkerdetails == '' || this.allocatedsocialworkerdetails == null))
      {
        this.subjects.socialWorkerValidation.next(true);
      }
      else{
          this.subjects.socialWorkerValidation.next(false);
      }
      this.subjects.clinicalSummaryRecordChanged.next("Social Worker");
      this.activeModal.dismiss();
    }, 500);
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
