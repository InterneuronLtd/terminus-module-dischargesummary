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
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Person } from '../models/entities/core-person.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { GlobalService } from '../services/global.service';
import { SubjectsService } from '../services/subjects.service';
import { DischargePlanNotesHistoryViewerService } from '../discharge-plan-notes-history-viewer/discharge-plan-notes-history-viewer.service';
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';
import { ImportDataViewerService } from '../import-data-viewer/import-data-viewer.service';
import { ImportDischargePlanService } from '../import-discharge-plan/import-discharge-plan.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ModalDischargePlanService } from '../modal-discharge-plan/modal-discharge-plan.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-discharge-plan-notes',
  templateUrl: './discharge-plan-notes.component.html',
  styleUrls: ['./discharge-plan-notes.component.css']
})
export class DischargePlanNotesComponent implements OnInit, OnDestroy {


  subscriptions: Subscription = new Subscription();

  public Editor = ClassicEditor;

  refreshingList: boolean;
  saving: boolean = false;

  selectedClinicalSummaryView: string;

  getDischargePlanURI: string;
  dischargePlan: any;
  dischargePlanNotes: any = '';
  personId: string;
  dischargeplan: any;
  dischargePlanData: any;

  showCancelSaveButtons: boolean = false;
  showErrorMessage: boolean = false;
  importFromClinicalSummary: boolean;

  dischargeplancreatedby: string;
  dischargeplantimestamp: any;
  isPatientDischarged: boolean = true;

  isDisabled: boolean = false;
  clinicianHasSigned: boolean = false;

  dischargeSummaryId: string;
  showDischargeSummaryMessage: boolean = false;
  dischargeSummaryCompletedBy: string;
  dischargeSummaryCompletedTimestamp: any;

  postDischargePlanNotesURI: string = this.appService.carerecorduri + "/ClinicalSummary/PostDischargePlan/";

  @ViewChild('dischargeSummaryCompleted', { static: false }) private dischargeSummaryCompleted;
  @Input() set personData(value: Person) {
  };

  @Input() set notesData(data : any){
    this.dischargePlanData = data;
    this.clinicianHasSigned = this.dischargePlanData[0].completedbyclinician;
    this.initializeData();
    this.checkIsDisabled();
  };

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
          this.showCancelSaveButtons = false;
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

  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    public globalService: GlobalService,
    private subjects: SubjectsService,
    public importDataViewerService: ImportDataViewerService,
    public dischargePlanNotesHistoryViewerService: DischargePlanNotesHistoryViewerService,
    public importDischargePlanService: ImportDischargePlanService,
    public modalDischargePlanService: ModalDischargePlanService,
    private modalService: NgbModal) {
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
    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      this.isPatientDischarged = false;
    }
    else{
      this.isPatientDischarged = true;
    }

    this.subjects.dischargePlanValidation.subscribe(resp => {
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
            if(this.dischargeplan == null || !Save)
            {
              this.dischargePlanData = response;
              this.clinicianHasSigned = this.dischargePlanData[0].completedbyclinician;
            }


            if(Save) {
              this.saveDischargePlan();
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
    this.dischargeplan = this.dischargePlanData[0].dischargeplan;
    this.showCancelSaveButtons = false;
  }

  async saveDischargePlan()
  {
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
      this.dischargePlanData[0].dischargeplan = this.dischargeplan?this.dischargeplan.trim():null;
      this.dischargePlanData[0].dischargeplancreatedby = this.dischargeplan?this.appService.loggedInUserName:null;
      this.dischargePlanData[0].dischargeplantimestamp = this.dischargeplan?this.appService.getDateTimeinISOFormat(new Date()):null;
      await this.subscriptions.add(
        this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.dischargePlanData[0])
          .subscribe((response) => {

            this.showCancelSaveButtons = false;
            this.subjects.clinicalSummaryRecordChanged.next("Discharge Plan");
            this.initializeData();

          })
        )


  }

  async viewHistory() {
    if(!this.isPatientDischarged){
      var response = false;
      await this.dischargePlanNotesHistoryViewerService.confirm(this.dischargePlanData[0].dischargesummary_id, 'Discharge Plan History','','Import')
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
    this.getLatestDischargePlan();
    setTimeout(() => {
      if(this.showDischargeSummaryMessage)
      {
      }
      else{
        if(!this.isPatientDischarged){
          var response = false;
          this.importDischargePlanService.confirm(this.appService.personId, 'Import Clinical Summary Notes','','lg')
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

  async getLatestDischargePlan()
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

  async openEditDischargePlanDialog()
  {
    var response = false;
    await this.modalDischargePlanService.confirm(this.dischargePlanData, 'Clinical Summary Notes History','','Import')
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
