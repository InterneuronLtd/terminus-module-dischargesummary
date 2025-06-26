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
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ApirequestService } from '../services/apirequest.service';
import { Person } from '../models/entities/core-person.model';
import { GlobalService } from '../services/global.service';
import { DischargeInvestigationResultsNotesHistoryViewerService } from '../discharge-investigation-results-notes-history-viewer/discharge-investigation-results-notes-history-viewer.service';
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';
import { ImportInvestigationResultsService } from '../import-investigation-results/import-investigation-results.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ModalInvestigationResultsNotesService } from '../modal-investigation-results-notes/modal-investigation-results-notes.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-discharge-investigation-results-notes',
  templateUrl: './discharge-investigation-results-notes.component.html',
  styleUrls: ['./discharge-investigation-results-notes.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DischargeInvestigationResultsNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  public Editor = ClassicEditor;

  selectedClinicalSummaryView: string;
  clinicalSummaryList: any;
  refreshingList: boolean;


  epmaPrescription: any[];
  showCancelSaveButtons: boolean = false;

  @ViewChild('canvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;

  private ctx: CanvasRenderingContext2D;

  getLabResultsURI: string;
  getSepsisChartResultsURI: string;
  getInvestigationURI: string;
  investigationNotes: any = '';
  personId: string;

  investigationResultNotes: any;
  medicationSetText:boolean = false;
  observationSetText: boolean = false;

  investigationResultsData: any;
  investigationresults: any;

  showErrorMessage: boolean = false;
  importFromClinicalSummary: boolean;

  createdby: string;
  createddatetime: any;
  isPatientDischarged: boolean = true;

  isDisabled: boolean = false;
  clinicianHasSigned: boolean = false;

  dischargeSummaryId: string;
  showDischargeSummaryMessage: boolean = false;
  dischargeSummaryCompletedBy: string;
  dischargeSummaryCompletedTimestamp: any;

  postInvestigationResultsNotesURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostInvestigation/";

  @ViewChild('dischargeSummaryCompleted', { static: false }) private dischargeSummaryCompleted;
  @Input() set personData(value: Person) {
    // console.log('++++++++',value);
    // this.saving = false;
    // this.personId = value.person_id;
    // this.selectedClinicalSummaryView = "list clinical summary";
    // this.refreshingList = false;
    // this.getInvestigationURI = this.appService.carerecorduri + '/ClinicalSummary/GetInvestigation/';
    // this.initialiseFunctions();
  };

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


  }


  @Input() set notesData(data : any){
    // console.log('data123',data);
    this.investigationResultsData = data;
    this.clinicianHasSigned = this.investigationResultsData[0].completedbyclinician;
    this.initializeData();
    this.checkIsDisabled();
  };

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
          this.showCancelSaveButtons = false;
          this.createdby = this.investigationResultsData[0].investigationresultscreatedby;
          this.createddatetime = this.investigationResultsData[0].investigationresultstimestamp;
        }
      }
      else{
        this.investigationresults = '';
      }
    }
  }

  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    private subjects: SubjectsService,
    public globalService: GlobalService,
    public importInvestigationResultsService: ImportInvestigationResultsService,
    public investigationResultsNotesHistoryViewerService: DischargeInvestigationResultsNotesHistoryViewerService,
    public modalInvestigationResultsNotesService: ModalInvestigationResultsNotesService,
    private modalService: NgbModal) {

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
    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      this.isPatientDischarged = false;
    }
    else{
      this.isPatientDischarged = true;
    }
    this.subjects.investigationResultsValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
  }

  async initialiseFunctions()
  {
    setTimeout(() => {
      this.getInvestigation();
    }, 1000);
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
            if(Save) {
              this.saveInvestigationResultsNotes();
            }
          }

        })
      );
  }







  async getInvestigation()
  {
    this.investigationResultNotes = '';

    await this.subscriptions.add(
      this.apiRequest.getRequest(this.getInvestigationURI+this.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          this.investigationNotes = '';
        }
        else{
          this.investigationResultNotes= JSON.parse(response)[0];
          this.investigationNotes = JSON.parse(response)[0].clinicalinvestigationnotes;
        }

      })
    )
  }

  showButtons()
  {
    this.showCancelSaveButtons = true;
  }

  dismiss()
  {
    this.investigationresults = this.investigationResultsData[0].investigationresults;
    this.showCancelSaveButtons = false;
  }

  async saveInvestigationResultsNotes()
  {

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
      this.investigationResultsData[0].investigationresults = this.investigationresults?this.investigationresults.trim():null;
      this.investigationResultsData[0].investigationresultscreatedby = this.investigationresults?this.appService.loggedInUserName:null;
      this.investigationResultsData[0].investigationresultstimestamp = this.investigationresults?this.appService.getDateTimeinISOFormat(new Date()):null;
        await this.subscriptions.add(
          this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.investigationResultsData[0])
            .subscribe((response) => {
              this.showCancelSaveButtons = false;
              this.subjects.clinicalSummaryRecordChanged.next("Investigation Results");
              this.initializeData();
            })
          )


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

  async importData()
  {
    this.getLatestInvestigationResultsNotes();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {
      }
      else{
        if(!this.isPatientDischarged){
          var response = false;
          this.importInvestigationResultsService.confirm(this.appService.personId, 'Import Clinical Summary Notes','','lg')
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

  async getLatestInvestigationResultsNotes()
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

  async openEditInvestigationResultsNotesDialog()
  {
    var response = false;
    await this.modalInvestigationResultsNotesService.confirm(this.investigationResultsData, 'Clinical Summary Notes History','','Import')
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
