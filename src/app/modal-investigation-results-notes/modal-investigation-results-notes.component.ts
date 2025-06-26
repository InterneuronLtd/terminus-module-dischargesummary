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
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';
import { DischargeInvestigationResultsNotesHistoryViewerService } from '../discharge-investigation-results-notes-history-viewer/discharge-investigation-results-notes-history-viewer.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-modal-investigation-results-notes',
  templateUrl: './modal-investigation-results-notes.component.html',
  styleUrls: ['./modal-investigation-results-notes.component.css']
})
export class ModalInvestigationResultsNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() investigationResultsData: any;

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

  // investigationResultsData: any;
  investigationresults: any = '';

  showErrorMessage: boolean = false;
  importFromClinicalSummary: boolean;

  checkIsDisabled() {
    if(this.investigationResultsData) {
      if(this.investigationResultsData[0].completedbyclinician) {
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
        if(this.investigationResultsData && this.investigationResultsData.length > 0 && this.investigationResultsData[0].dischargesummarycompleted)
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
    public investigationResultsNotesHistoryViewerService: DischargeInvestigationResultsNotesHistoryViewerService) { 
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


    this.subjects.personIdChange.subscribe( () => {
      if(!this.appService.personId) {
        return;
      }
    })

    this.subjects.importInvestigationresults.subscribe(resp => {
      if(resp)
      {
        this.investigationresults = resp;
      }
    })
    }

  ngOnInit(): void {
    this.dischargeSummaryId = this.investigationResultsData[0].dischargesummary_id;
    // if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    // {
    //   this.isPatientDischarged = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    // }
    this.subjects.investigationResultsValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
    this.checkIsDisabled();
    this.getLatestInvestigationResultsNotes()
  }

  initializeData()
  {

    if(this.investigationResultsData[0]) {
      if(!this.isEmpty(this.investigationResultsData[0]))
      {
       if(this.investigationResultsData[0].importfromcliniclsummary)
        {
          this.importFromClinicalSummary = this.investigationResultsData[0].importfromcliniclsummary;
        }

        if(this.investigationResultsData[0].clinicalsummarynotes != null || this.investigationResultsData[0].clinicalsummarynotes != '')
        {
          this.investigationresults = this.investigationResultsData[0].investigationresults;
        }

        if((this.investigationResultsData[0].investigationresultscreatedby != '' || this.investigationResultsData[0].investigationresultscreatedby != null) && (this.investigationResultsData[0].investigationresultstimestamp != '' || this.investigationResultsData[0].investigationresultstimestamp != null))
        {
          // this.showCancelSaveButtons = false;
          this.createdby = this.investigationResultsData[0].investigationresultscreatedby;
          this.createddatetime = this.investigationResultsData[0].investigationresultstimestamp;
        }
      }
      else{
        this.investigationresults = '';
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
            if(this.investigationresults == null || !Save)
            {
              this.investigationResultsData = response;
              this.clinicianHasSigned = this.investigationResultsData[0].completedbyclinician;
            }
            // if(Save) {
            //   this.saveInvestigationResultsNotes();
            // }
          }

        })
      );
  }

  async getLatestInvestigationResultsNotes()
  {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id='+this.dischargeSummaryId)
        .subscribe((response) => {
            this.investigationresults = JSON.parse(response).investigationresults;
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

  async saveInvestigationResultsNotes()
  {
    let latestInvestigationResultsNotes = this.investigationresults
    this.getLatestInvestigationResultsNotes();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {}
      else {
        if(!latestInvestigationResultsNotes)
        {
          this.subjects.investigationResultsValidation.next(true);
        }
        else if(latestInvestigationResultsNotes == '')
        {
          this.subjects.investigationResultsValidation.next(true);
        }
        else{
          this.subjects.investigationResultsValidation.next(false);
        }
        this.investigationResultsData[0].investigationresults = latestInvestigationResultsNotes?latestInvestigationResultsNotes.trim():null;
        this.investigationResultsData[0].investigationresultscreatedby = this.appService.loggedInUserName;
        this.investigationResultsData[0].investigationresultstimestamp = this.appService.getDateTimeinISOFormat(new Date());
          this.subscriptions.add(
            this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.investigationResultsData[0])
              .subscribe((response) => {
                // this.showCancelSaveButtons = false;
                this.subjects.clinicalSummaryRecordChanged.next("Investigation Results");
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
      await this.investigationResultsNotesHistoryViewerService.confirm(this.investigationResultsData[0].dischargesummary_id, 'Clinical Summary Notes History','','Import')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
      else {
      // await this.getSelectedFormWithContext();
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
    this.getLatestInvestigationResultsNotes()
    setTimeout(() => {
      if(!this.investigationresults)
      {
        this.subjects.investigationResultsValidation.next(true);
      }
      else if(this.investigationresults == '')
      {
        this.subjects.investigationResultsValidation.next(true);
      }
      else{
        this.subjects.investigationResultsValidation.next(false);
      }
      this.subjects.clinicalSummaryRecordChanged.next("Investigation Results");
      this.activeModal.dismiss();
    }, 500);
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
