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
import { PharmacyNotesHistoryViewerService } from '../pharmacy-notes-history-viewer/pharmacy-notes-history-viewer.service';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-modal-pharmacy-notes',
  templateUrl: './modal-pharmacy-notes.component.html',
  styleUrls: ['./modal-pharmacy-notes.component.css']
})
export class ModalPharmacyNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  pharmacynotes: string = '';
  dischargeSummaryId: string;
  // pharmacyNotesData: any;

  public Editor = ClassicEditor;

  pharmacynotescreatedby: string;
  pharmacynotestimestamp: any;
  showErrorMessage: boolean = false;
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
  @Input() pharmacyNotesData: any;

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public pharmacyNotesHistoryViewerService: PharmacyNotesHistoryViewerService,
    public subjects: SubjectsService,
    private activeModal: NgbActiveModal,) { 
      this.subjects.importPharmacyNotes.subscribe((resp : any) => {
        if(resp)
        {
          this.pharmacynotes = resp;
        }
      })

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
    this.dischargeSummaryId = this.pharmacyNotesData[0].dischargesummary_id;
    // if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    // {
    //   this.isPatientDischarged = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    // }
    this.subjects.epmaValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
    this.checkIsDisabled();
    this.getLatestPharmacyNotes()
  }

  checkIsDisabled() {
    if(!this.appService.isPharmacist) {
      this.isDisabled = true;
    }

    if(this.appService.isPharmacist){
      if(this.pharmacyNotesData){
        if(this.pharmacyNotesData[0].completedbypharmacy) {
          this.isDisabled = true;
        }
        else
        {
          this.isDisabled = false;
        }
      }
    }

    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
      {
        this.isPatientDischarged = false;
      }
      else{
        if(this.pharmacyNotesData && this.pharmacyNotesData.length > 0 && this.pharmacyNotesData[0].dischargesummarycompleted)
        {
          this.isPatientDischarged = true;
        }
        else{
          this.isPatientDischarged = false;
        }
      }
  }

  initializeData()
  {
    if(this.pharmacyNotesData != undefined)
    {
      if(this.pharmacyNotesData[0].pharmacynotes != null || this.pharmacyNotesData[0].pharmacynotes != '')
      {
        this.pharmacynotes = this.pharmacyNotesData[0].pharmacynotes;
      }
      if((this.pharmacyNotesData[0].pharmacynotescreatedby != '' || this.pharmacyNotesData[0].pharmacynotescreatedby != null) && (this.pharmacyNotesData[0].pharmacynotescreatedtimestamp != '' || this.pharmacyNotesData[0].pharmacynotescreatedtimestamp != null))
      {
        this.pharmacynotescreatedby = this.pharmacyNotesData[0].pharmacynotescreatedby;
        this.pharmacynotestimestamp = this.pharmacyNotesData[0].pharmacynotestimestamp;
      }
    }
    else{
      this.pharmacynotes = '';
    }
  }

  getDischargeSummaryData(Save: boolean)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {


            // if(this.pharmacynotes == null || !Save)
            // {
              this.pharmacyNotesData = response;
              this.clinicianHasSigned = this.pharmacyNotesData[0].completedbyclinician;
            // }



            console.log("Completed by pharmacist");
            this.checkIsDisabled();

            // if(Save) {
            //   this.savePhrmacyNotes();
            // }
          }

        })
      );
  }

  async getLatestPharmacyNotes()
  {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id='+this.dischargeSummaryId)
        .subscribe((response) => {
            this.pharmacynotes = JSON.parse(response).pharmacynotes;
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

  async savePhrmacyNotes()
  {
    let latestPharmacyNotes = this.pharmacynotes
    this.getLatestPharmacyNotes();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {}
      else {
        if(!latestPharmacyNotes)
        {
          this.subjects.epmaValidation.next(true);
        }
        else if(latestPharmacyNotes == '')
        {
          this.subjects.epmaValidation.next(true);
        }
        else{
          this.subjects.epmaValidation.next(false);
        }
        this.pharmacyNotesData[0].pharmacynotes = latestPharmacyNotes?latestPharmacyNotes.trim():null;
        this.pharmacyNotesData[0].pharmacynotescreatedby = this.appService.loggedInUserName;
        this.pharmacyNotesData[0].pharmacynotestimestamp = this.appService.getDateTimeinISOFormat(new Date());

        // if(this.clinicalSummaryNotes)
        // {
          this.subscriptions.add(
            this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.pharmacyNotesData[0])
              .subscribe((response) => {
                if(response)
                {
                  // this.showCancelSaveButtons = false;
                  this.subjects.clinicalSummaryRecordChanged.next("Pharmacy Notes");
                  this.initializeData();
                  this.activeModal.dismiss();
                }

              })
            );
      }
    }, 1000);
    
    // }
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
      await this.pharmacyNotesHistoryViewerService.confirm(this.pharmacyNotesData[0].dischargesummary_id, 'Clinical Summary Notes History','','Import')
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
    this.getLatestPharmacyNotes()
    setTimeout(() => {
      if(!this.pharmacynotes)
      {
        this.subjects.epmaValidation.next(true);
      }
      else if(this.pharmacynotes == '')
      {
        this.subjects.epmaValidation.next(true);
      }
      else{
        this.subjects.epmaValidation.next(false);
      }
      this.subjects.clinicalSummaryRecordChanged.next("Pharmacy Notes");
      this.activeModal.dismiss();
    }, 500);
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
