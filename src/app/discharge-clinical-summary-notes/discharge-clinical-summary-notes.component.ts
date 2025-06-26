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
import { DischargeClinicalSummaryNotesHistoryViewerService } from '../discharge-clinical-summary-notes-history-viewer/discharge-clinical-summary-notes-history-viewer.service';
import { AppService } from '../services/app.service';
import { ApirequestService } from '../services/apirequest.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { SubjectsService } from '../services/subjects.service';
import { ImportClinicalSummaryNotesService } from '../import-clinical-summary-notes/import-clinical-summary-notes.service';
import { ModalClinicalSummaryNotesService } from '../modal-clinical-summary-notes/modal-clinical-summary-notes.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-discharge-clinical-summary-notes',
  templateUrl: './discharge-clinical-summary-notes.component.html',
  styleUrls: ['./discharge-clinical-summary-notes.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DischargeClinicalSummaryNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  showCancelSaveButtons: boolean = false;
  personId: string;
  getClinicalSummaryNotesURI: string;
  clinicalsummarynotes: any = '';
  clinicalNotesData: any;
  showErrorMessage: boolean = false;
  importFromClinicalSummary: boolean;

  //Date Picker Models
  model: any;
  bsConfig: any;
  maxDateValue: Date = new Date();

  createdby: string;
  createddatetime: any;
  isPatientDischarged: boolean = true;
  isDisabled: boolean = false;

  clinicianHasSigned: boolean = false;

  dischargeSummaryId: string;
  showDischargeSummaryMessage: boolean = false;
  dischargeSummaryCompletedBy: string;
  dischargeSummaryCompletedTimestamp: any;

  public Editor = ClassicEditor;

  @ViewChild('dischargeSummaryCompleted', { static: false }) private dischargeSummaryCompleted;
  @Input() set personData(value: Person) {
  };

  @Input() set notesData(data : any){
    this.clinicalNotesData = data;
    this.clinicianHasSigned = this.clinicalNotesData[0].completedbyclinician;
    this.initializeData();
    this.checkIsDisabled();

  };

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
          this.showCancelSaveButtons = false;
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
  }


  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public importClinicalSummaryNotesService: ImportClinicalSummaryNotesService,
    public clinicalSummaryNotesHistoryViewerService: DischargeClinicalSummaryNotesHistoryViewerService,
    public subjects: SubjectsService,
    public modalClinicalSummaryNotesService: ModalClinicalSummaryNotesService,
    private modalService: NgbModal) {
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
    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      this.isPatientDischarged = false;
    }
    else{
      this.isPatientDischarged = true;
    }
    this.subjects.clinicalSummaryNotesValidation.subscribe(resp => {
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
            if(this.clinicalsummarynotes == null || !Save)
            {
              this.clinicalNotesData = response;
              this.clinicianHasSigned = this.clinicalNotesData[0].completedbyclinician;
            }


            if(Save) {
              this.saveClinicalSummary();
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
    this.clinicalsummarynotes = this.clinicalNotesData[0].clinicalsummarynotes;
    this.showCancelSaveButtons = false;
  }

  async saveClinicalSummary()
  {

    if(this.clinicalsummarynotes == '')
    {
      this.subjects.clinicalSummaryNotesValidation.next(true);
    }
    else{
      this.subjects.clinicalSummaryNotesValidation.next(false);
    }


      this.clinicalNotesData[0].clinicalsummarynotes = this.clinicalsummarynotes?this.clinicalsummarynotes.trim():null;
      this.clinicalNotesData[0].clinicalsummarynotescreatedby = this.clinicalsummarynotes?this.appService.loggedInUserName:null;
      this.clinicalNotesData[0].clinicalsummarynotestimestamp = this.clinicalsummarynotes?this.appService.getDateTimeinISOFormat(new Date()):null;
        this.subscriptions.add(
          this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.clinicalNotesData[0])
            .subscribe((response) => {
              if(response)
              {
                this.showCancelSaveButtons = false;
                this.subjects.clinicalSummaryRecordChanged.next("Clinical Summary Note");
                this.initializeData();
              }

            })
          );


    // }
    // else{
    //   this.showErrorMessage = true;
    //   this.showCancelSaveButtons = false;
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
      await this.clinicalSummaryNotesHistoryViewerService.confirm(this.clinicalNotesData[0].dischargesummary_id, 'Clinical Summary Notes History','','Import')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }
  }

  async importData()
  {
    this.getLatestClinicalSummaryNotes();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {
      }
      else{
        if(!this.isPatientDischarged){
          var response = false;
          this.importClinicalSummaryNotesService.confirm(this.appService.personId, 'Import Clinical Summary Notes','','lg')
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
    }, 1000);
    
  }

  async getLatestClinicalSummaryNotes()
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

  async openEditClinicalSummaryNotesDialog()
  {
    var response = false;
    await this.modalClinicalSummaryNotesService.confirm(this.clinicalNotesData, 'Clinical Summary Notes History','','Import')
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
