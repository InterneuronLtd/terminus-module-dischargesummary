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
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';
import { IndividualRequirementsHistoryViewerService } from '../individual-requirements-history-viewer/individual-requirements-history-viewer.service';
import { ModalIndividualRequirementsService } from '../modal-individual-requirements/modal-individual-requirements.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-individual-requirements',
  templateUrl: './individual-requirements.component.html',
  styleUrls: ['./individual-requirements.component.css']
})
export class IndividualRequirementsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  public Editor = ClassicEditor;
  showCancelSaveButtons: boolean = false;
  individualRequirementsData: any;
  individualrequirements: string;
  patienthasindividualrequirements: boolean;
  showEditor:boolean = false;

  showErrorMessage: boolean = false;
  importFromIndividualRequirements: boolean;

  individualrequirementscreatedby: string;
  individualrequirementstimestamp: any;
  flag: boolean = false;
  isPatientDischarged: boolean = true;

  isDisabled: boolean = false;
  isDischargeSummaryCompleted: boolean = false;
  clinicianHasSigned: boolean = false;

  @Input() set notesData(data : any){
    this.individualRequirementsData = data;
    this.clinicianHasSigned = this.individualRequirementsData[0].completedbyclinician;
    this.initializeData();
    this.checkIsDisabled();
  };

  checkIsDisabled() {
    // if(this.individualRequirementsData) {
    //   if((this.individualRequirementsData[0].dischargesummarycompleted) || !(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)) {
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

    if((sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) && !(this.individualRequirementsData && this.individualRequirementsData.length > 0 && this.individualRequirementsData[0].dischargesummarycompleted))
    {
      this.isDischargeSummaryCompleted = false;
      this.isDisabled = false;
      this.isPatientDischarged = false;
    }
    else{
      if(this.individualRequirementsData && this.individualRequirementsData.length > 0 && this.individualRequirementsData[0].dischargesummarycompleted)
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
    if(this.individualRequirementsData[0]) {
      if(!this.isEmpty(this.individualRequirementsData[0]))
      {
        // if(data[0].clinicalsummarynotes != null || data[0].clinicalsummarynotes != '')
        // {
          this.individualrequirements = this.individualRequirementsData[0].individualrequirements;
          this.patienthasindividualrequirements = this.individualRequirementsData[0].patienthasindividualrequirements
          if(this.individualRequirementsData[0].patienthasindividualrequirements)
          {
            this.importFromIndividualRequirements = this.individualRequirementsData[0].patienthasindividualrequirements;
            this.showEditor = true;
          }
        // }

        if((this.individualRequirementsData[0].individualrequirementscreatedby != '' || this.individualRequirementsData[0].individualrequirementscreatedby != null) && (this.individualRequirementsData[0].individualrequirementstimestamp != '' || this.individualRequirementsData[0].individualrequirementstimestamp != null))
        {
          this.individualrequirementscreatedby = this.individualRequirementsData[0].individualrequirementscreatedby;
          this.individualrequirementstimestamp = this.individualRequirementsData[0].individualrequirementstimestamp;
        }
      }
      else{
        this.individualrequirements = '';
        this.importFromIndividualRequirements = false;
      }
    }
  }

  isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public subjects: SubjectsService,
    public individualRequirementsHistoryViewerService: IndividualRequirementsHistoryViewerService,
    public modalIndividualRequirementsService: ModalIndividualRequirementsService) {
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

    // if((sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) && !(this.isDischargeSummaryCompleted))
    // {
    //   this.isPatientDischarged = false;
    //   this.isDisabled = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    //   this.isDisabled = true;
    // }

    this.subjects.individualRequirementsValidation.subscribe(resp => {
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
            if(this.individualrequirements == null || !Save)
            {
              this.individualRequirementsData = response;
              this.clinicianHasSigned = this.individualRequirementsData[0].completedbyclinician;
            }


            if(Save) {
              this.saveIndividualRequirements();
            }
          }

        })
      );
  }

  showEditorControl()
  {
    if(this.patienthasindividualrequirements)
    {
      this.showEditor = true;
    }
    else{
      this.showEditor = false;
      this.individualrequirements = '';
      if(this.individualRequirementsData != undefined || this.individualRequirementsData != null)
      {
        if(this.individualRequirementsData.length > 0)
        {
          this.individualRequirementsData[0].individualrequirements = '';
        }
      }
    }

    if(this.individualRequirementsData != undefined && this.individualRequirementsData != null && this.individualRequirementsData != '')
    {
      if(this.individualRequirementsData[0].patienthasindividualrequirements == this.patienthasindividualrequirements)
      {
        this.flag = false;
      }
      else{
        this.flag = true;
      }
      if(this.individualRequirementsData.length > 0)
      {
        this.individualRequirementsData[0].patienthasindividualrequirements = this.patienthasindividualrequirements;

      }
    }
    if(this.flag)
    {
      this.saveIndividualRequirements();
    }
  }

  showButtons()
  {
    this.showCancelSaveButtons = true;
  }

  async viewHistory() {
    if(!this.isPatientDischarged){
      var response = false;
      await this.individualRequirementsHistoryViewerService.confirm(this.individualRequirementsData[0].dischargesummary_id, 'Clinical Summary Notes History','','Import')
      .then((confirmed) => response = confirmed)
      .catch(() => response = false);
      if(!response) {
        return;
      }
    }
  }

  dismiss()
  {
    this.individualrequirements = this.individualRequirementsData[0].individualrequirements;
    this.showCancelSaveButtons = false;
  }

  async saveIndividualRequirements()
  {
    if(this.individualRequirementsData != undefined ||  this.individualRequirementsData != null)
    {
      if(this.individualRequirementsData[0].patienthasindividualrequirements && (this.individualrequirements == '' || this.individualrequirements == null || !this.individualrequirements))
      {
        this.subjects.individualRequirementsValidation.next(true);
      }
      else{
          this.subjects.individualRequirementsValidation.next(false);
      }

      if(!this.patienthasindividualrequirements)
          {
            this.saveData();
          }
          if(!this.individualrequirements || this.individualrequirements.trim() != '')
          {
            this.saveData();
          }
    }

  }

  saveData()
  {
    this.individualRequirementsData[0].individualrequirements = this.individualrequirements?this.individualrequirements.trim():null;
    this.individualRequirementsData[0].patienthasindividualrequirements = this.patienthasindividualrequirements;
    this.individualRequirementsData[0].individualrequirementscreatedby = this.individualrequirements?this.appService.loggedInUserName:null;
    this.individualRequirementsData[0].individualrequirementstimestamp = this.individualrequirements?this.appService.getDateTimeinISOFormat(new Date()):null;

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.individualRequirementsData[0])
        .subscribe((response) => {

          this.showCancelSaveButtons = false;
          this.subjects.clinicalSummaryRecordChanged.next("Individual Requirements");
          this.initializeData();

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

  async openEditIndividualRequirementsDialog()
  {
    var response = false;
    await this.modalIndividualRequirementsService.confirm(this.individualRequirementsData, 'Clinical Summary Notes History','','Import')
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
