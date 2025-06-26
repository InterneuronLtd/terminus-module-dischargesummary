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
import { DischargeClinicalSummaryNotesHistoryViewerService } from '../discharge-clinical-summary-notes-history-viewer/discharge-clinical-summary-notes-history-viewer.service';

@Component({
  selector: 'app-modal-clinical-summary-notes',
  templateUrl: './modal-clinical-summary-notes.component.html',
  styleUrls: ['./modal-clinical-summary-notes.component.css']
})
export class ModalClinicalSummaryNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  getClinicalSummaryNotesURI: string;
  clinicalsummarynotes: any = '';
  // clinicalNotesData: any;
  showErrorMessage: boolean = false;
  importFromClinicalSummary: boolean;

  public Editor = ClassicEditor;

  createdby: string;
  createddatetime: any;
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
  @Input() clinicalNotesData: any;

  checkIsDisabled() {
    if(this.clinicalNotesData) {
      if(this.clinicalNotesData[0].completedbyclinician) {
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
        if(this.clinicalNotesData && this.clinicalNotesData.length > 0 && this.clinicalNotesData[0].dischargesummarycompleted)
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

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public subjects: SubjectsService,
    private activeModal: NgbActiveModal,
    public clinicalSummaryNotesHistoryViewerService: DischargeClinicalSummaryNotesHistoryViewerService,) { 
      this.subjects.importClinicalSummaryNotes.subscribe(resp => {
        if(resp)
        {
          this.clinicalsummarynotes = resp;
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
    this.dischargeSummaryId = this.clinicalNotesData[0].dischargesummary_id;
    // if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    // {
    //   this.isPatientDischarged = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    // }
    this.subjects.clinicalSummaryNotesValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
    this.checkIsDisabled();
    this.getLatestClinicalSummaryNotes()
  }

  initializeData()
  {


    if(this.clinicalNotesData[0]) {
      if(!this.isEmpty(this.clinicalNotesData[0]))
      {

        if(this.clinicalNotesData[0].importfromcliniclsummary)
        {
          this.importFromClinicalSummary = this.clinicalNotesData[0].importfromcliniclsummary;
        }

        if(this.clinicalNotesData[0].clinicalsummarynotes != null || this.clinicalNotesData[0].clinicalsummarynotes != '')
        {
          this.clinicalsummarynotes = this.clinicalNotesData[0].clinicalsummarynotes;
        }

        if((this.clinicalNotesData[0].clinicalsummarynotescreatedby != '' || this.clinicalNotesData[0].clinicalsummarynotescreatedby != null) && (this.clinicalNotesData[0].clinicalsummarynotestimestamp != '' || this.clinicalNotesData[0].clinicalsummarynotestimestamp != null))
        {
          // this.showCancelSaveButtons = false;
          this.createdby = this.clinicalNotesData[0].clinicalsummarynotescreatedby;
          this.createddatetime = this.clinicalNotesData[0].clinicalsummarynotestimestamp;
        }
      }
      else{
        this.clinicalsummarynotes = '';
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
            if(this.clinicalsummarynotes == null || !Save)
            {
              this.clinicalNotesData = response;
              this.clinicianHasSigned = this.clinicalNotesData[0].completedbyclinician;
            }


            // if(Save) {
            //   this.saveClinicalSummary();
            // }
          }

        })
      );
  }

  async getLatestClinicalSummaryNotes()
  {
    await this.subscriptions.add(
    this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id='+this.dischargeSummaryId)
      .subscribe((response) => {
          this.clinicalsummarynotes = JSON.parse(response).clinicalsummarynotes;
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

  async saveClinicalSummary()
  {
    let latestClinicalSummaryNotes = this.clinicalsummarynotes;
    this.getLatestClinicalSummaryNotes();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {}
      else {
        if(!latestClinicalSummaryNotes)
        {
          this.subjects.clinicalSummaryNotesValidation.next(true);
        }
        else if(latestClinicalSummaryNotes == '')
        {
          this.subjects.clinicalSummaryNotesValidation.next(true);
        }
        else{
          this.subjects.clinicalSummaryNotesValidation.next(false);
        }


        this.clinicalNotesData[0].clinicalsummarynotes = latestClinicalSummaryNotes?latestClinicalSummaryNotes.trim():null;
        this.clinicalNotesData[0].clinicalsummarynotescreatedby = this.appService.loggedInUserName;
        this.clinicalNotesData[0].clinicalsummarynotestimestamp = this.appService.getDateTimeinISOFormat(new Date());
          this.subscriptions.add(
            this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.clinicalNotesData[0])
              .subscribe((response) => {
                if(response)
                {
                  // this.showCancelSaveButtons = false;
                  this.subjects.clinicalSummaryRecordChanged.next("Clinical Summary Note");
                  this.initializeData();
                  this.activeModal.dismiss();
                }

              })
            );
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
      await this.clinicalSummaryNotesHistoryViewerService.confirm(this.clinicalNotesData[0].dischargesummary_id, 'Clinical Summary Notes History','','Import')
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
    this.getLatestClinicalSummaryNotes();
    setTimeout(() => {
      if(!this.clinicalsummarynotes)
      {
        this.subjects.clinicalSummaryNotesValidation.next(true);
      }
      else if(this.clinicalsummarynotes == '')
      {
        this.subjects.clinicalSummaryNotesValidation.next(true);
      }
      else{
        this.subjects.clinicalSummaryNotesValidation.next(false);
      }
      this.subjects.clinicalSummaryRecordChanged.next("Clinical Summary Note");
      // this.initializeData();
      this.activeModal.dismiss();
    }, 500);
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
