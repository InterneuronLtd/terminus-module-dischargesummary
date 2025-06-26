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
import { DischargeVteNotesHistoryViewerService } from '../discharge-vte-notes-history-viewer/discharge-vte-notes-history-viewer.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-modal-vte-notes',
  templateUrl: './modal-vte-notes.component.html',
  styleUrls: ['./modal-vte-notes.component.css']
})
export class ModalVteNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  vtenotes: any = '';
  // vteNotesData: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() vteNotesData: any;

  public Editor = ClassicEditor;

  createdby: string;
  createddatetime: any;
  isPatientDischarged: boolean = true;
  isDisabled: boolean = false;
  showErrorMessage: boolean = false;

  clinicianHasSigned: boolean = false;
  dischargeSummaryId: string;
  showDischargeSummaryMessage: boolean = false;
  dischargeSummaryCompletedBy: string;
  dischargeSummaryCompletedTimestamp: any;

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public vteNotesHistoryViewerService: DischargeVteNotesHistoryViewerService,
    public subjects: SubjectsService,
    private activeModal: NgbActiveModal,) { 
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
    this.dischargeSummaryId = this.vteNotesData[0].dischargesummary_id;
    // if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    // {
    //   this.isPatientDischarged = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    // }

    this.subjects.vteNotesValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
    this.checkIsDisabled();
    this.getLatestVTENotes()
  }

  initializeData()
  {
    if(this.vteNotesData[0]) {
      if(!this.isEmpty(this.vteNotesData[0]))
      {

        if(this.vteNotesData[0].vtenotes != null || this.vteNotesData[0].vtenotes != '')
        {
          this.vtenotes = this.vteNotesData[0].vtenotes;
        }

        if((this.vteNotesData[0].vtenotescreatedby != '' || this.vteNotesData[0].vtenotescreatedby != null) && (this.vteNotesData[0].vtenotestimestamp != '' || this.vteNotesData[0].vtenotestimestamp != null))
        {
          // this.showCancelSaveButtons = false;
          this.createdby = this.vteNotesData[0].vtenotescreatedby;
          this.createddatetime = this.vteNotesData[0].vtenotestimestamp;
        }
      }
      else{
        this.vtenotes = '';
      }

    }

  }

  checkIsDisabled() {
    if(this.vteNotesData) {
      if(this.vteNotesData[0].completedbyclinician && this.vteNotesData[0].completedbypharmacy) {
        this.isDisabled = true;
      }
      else {
        this.isDisabled = false;
      }
    }

    if(!this.appService.isClinician && !this.appService.isPharmacist) {
      this.isDisabled = true;
    }

    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      this.isPatientDischarged = false;
    }
    else{
      if(this.vteNotesData && this.vteNotesData.length > 0 && this.vteNotesData[0].dischargesummarycompleted)
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

  getDischargeSummaryData(Save: boolean)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createVTENotesFilter())
        .subscribe((response) => {
          if(response)
          {
            if(this.vtenotes == null || !Save)
            {
              this.vteNotesData = response;
              this.clinicianHasSigned = this.vteNotesData[0].completedbyclinician;
            }


            // if(Save) {
            //   this.saveVTE();
            // }
          }

        })
      );
  }

  async getLatestVTENotes()
  {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id='+this.dischargeSummaryId)
        .subscribe((response) => {
            this.vtenotes = JSON.parse(response).vtenotes;
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

  async saveVTE()
  {
    let latestVTENotes = this.vtenotes;
    this.getLatestVTENotes();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {}
      else {
        if(!latestVTENotes)
        {
          this.subjects.vteNotesValidation.next(true);
        }
        else if(latestVTENotes == '')
        {
          this.subjects.vteNotesValidation.next(true);
        }
        else{
          this.subjects.vteNotesValidation.next(false);
        }


          this.vteNotesData[0].vtenotes = latestVTENotes ? latestVTENotes.trim() : null;
          this.vteNotesData[0].vtenotescreatedby = this.appService.loggedInUserName;
          this.vteNotesData[0].vtenotestimestamp = this.appService.getDateTimeinISOFormat(new Date());
            this.subscriptions.add(
              this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.vteNotesData[0])
                .subscribe((response) => {
                  if(response)
                  {
                    // this.showCancelSaveButtons = false;
                    this.subjects.clinicalSummaryRecordChanged.next("VTE Notes");
                    this.initializeData();
                    this.activeModal.dismiss();
                  }

                })
              );
      }
    }, 1000);
    

  }

  createVTENotesFilter()
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

  reloadPage()
  {
    // location.reload();
    this.showDischargeSummaryMessage = false;
    this.activeModal.dismiss();
    this.subjects.viewChange.next('List Discharge Summary')
  }

  async viewHistory() {
    if(!this.isPatientDischarged){
      var response = false;
      await this.vteNotesHistoryViewerService.confirm(this.vteNotesData[0].dischargesummary_id, 'VTE Notes History','','Import')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }
  }

  public dismiss() {
    this.showDischargeSummaryMessage = false;
    this.getLatestVTENotes();
    setTimeout(() => {
      if(!this.vtenotes)
      {
        this.subjects.vteNotesValidation.next(true);
      }
      else if(this.vtenotes == '')
      {
        this.subjects.vteNotesValidation.next(true);
      }
      else{
        this.subjects.vteNotesValidation.next(false);
      }
      this.subjects.clinicalSummaryRecordChanged.next("VTE Notes");
      this.activeModal.dismiss();
    }, 500);
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
