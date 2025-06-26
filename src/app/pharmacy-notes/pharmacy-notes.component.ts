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
import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';
import { Person } from '../models/entities/core-person.model';
import { AppService } from '../services/app.service';
import { ApirequestService } from '../services/apirequest.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ImportPharmacyNotesService } from '../import-pharmacy-notes/import-pharmacy-notes.service';
import { PharmacyNotesHistoryViewerService } from '../pharmacy-notes-history-viewer/pharmacy-notes-history-viewer.service';
import { SubjectsService } from '../services/subjects.service';
import { ModalPharmacyNotesService } from '../modal-pharmacy-notes/modal-pharmacy-notes.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pharmacy-notes',
  templateUrl: './pharmacy-notes.component.html',
  styleUrls: ['./pharmacy-notes.component.css']
})
export class PharmacyNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  showCancelSaveButtons: boolean = false;
  personId: string;
  getClinicalSummaryNotesURI: string;
  pharmacynotes: string = '';
  pharmacyNotesData: any;

  public Editor = ClassicEditor;

  pharmacynotescreatedby: string;
  pharmacynotestimestamp: any;
  showErrorMessage: boolean = false;
  isPatientDischarged: boolean = true;

  isDisabled: boolean = false;
  clinicianHasSigned: boolean = false;

  dischargeSummaryId: string;
  showDischargeSummaryMessage: boolean = false;
  dischargeSummaryCompletedBy: string;
  dischargeSummaryCompletedTimestamp: any;

  @ViewChild('dischargeSummaryCompleted', { static: false }) private dischargeSummaryCompleted;
  @Input() set personData(value: Person) {
  };

  @Input() set notesData(data : any){
    this.pharmacyNotesData = data;
    this.initializeData();
    this.checkIsDisabled();
  };

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

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public pharmacyNotesHistoryViewerService: PharmacyNotesHistoryViewerService,
    public importPharmacyNotesService: ImportPharmacyNotesService,
    public subjects: SubjectsService,
    public modalPharmacyNotesService: ModalPharmacyNotesService,
    private modalService: NgbModal) {
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
    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      this.isPatientDischarged = false;
    }
    else{
      this.isPatientDischarged = true;
    }
    this.subjects.epmaValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
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

            if(Save) {
              this.savePhrmacyNotes();
            }
          }

        })
      );
  }

  showButtons()
  {
    this.showCancelSaveButtons = true;
  }

  dismiss()
  {
    this.pharmacynotes = this.pharmacyNotesData[0].pharmacynotes;
    this.showCancelSaveButtons = false;
  }

  async savePhrmacyNotes()
  {
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
    this.pharmacyNotesData[0].pharmacynotes = this.pharmacynotes?this.pharmacynotes.trim():null;
    this.pharmacyNotesData[0].pharmacynotescreatedby = this.pharmacynotes?this.appService.loggedInUserName:null;
    this.pharmacyNotesData[0].pharmacynotestimestamp = this.pharmacynotes?this.appService.getDateTimeinISOFormat(new Date()):null;

    // if(this.clinicalSummaryNotes)
    // {
      this.subscriptions.add(
        this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.pharmacyNotesData[0])
          .subscribe((response) => {
            if(response)
            {
              this.showCancelSaveButtons = false;
              this.subjects.clinicalSummaryRecordChanged.next("Pharmacy Notes");
              this.initializeData();
            }

          })
        );
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

  async importData()
  {
    this.getLatestPharmacyNotes();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {
      }
      else{
        if(!this.isPatientDischarged){
          var response = false;
          this.importPharmacyNotesService.confirm(this.appService.personId, 'Import Pharmacy Notes','','lg')
          .then((confirmed) => response = confirmed)
          .catch(() => response = false);
          if(!response) {
            return;
          }
        }
      }
    }, 1000);
    
  }

  async getLatestPharmacyNotes()
  {
    await this.subscriptions.add(
    this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=dischargesummary&id='+this.dischargeSummaryId)
      .subscribe((response) => {
          if(JSON.parse(response).dischargesummarycompleted)
          {
            this.showDischargeSummaryMessage = true;
            this.dischargeSummaryCompletedBy = JSON.parse(response).dischargedeclarationcompletedby;
            this.dischargeSummaryCompletedTimestamp = JSON.parse(response).dischargedeclarationcompletedtimestamp;
            this.open(this.dischargeSummaryCompleted);
          }
          else{
            this.showDischargeSummaryMessage = false;
          }
      }));
  }

  open(content) {

    this.modalService.open(content, {size: 'dialog-centered', backdrop: 'static'}).result.then((result) => {
    }, (reason) => {
    });

  }

  reloadPage()
  {
    location.reload();
  }

  async openEditPharmacyNotesDialog()
  {
    var response = false;
    await this.modalPharmacyNotesService.confirm(this.pharmacyNotesData, 'Clinical Summary Notes History','','Import')
    .then((confirmed) => response = confirmed)
    .catch(() => response = false);
    if(!response) {
      return;
    }
    else {
    // await this.getSelectedFormWithContext();
    }
    // }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
