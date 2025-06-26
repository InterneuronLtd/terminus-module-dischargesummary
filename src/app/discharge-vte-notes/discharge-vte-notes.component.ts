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
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import * as ClassicEditor from 'src/assets/stylekit/ds-ckeditor.js';
import { Person } from '../models/entities/core-person.model';
import { DischargeVteNotesHistoryViewerService } from '../discharge-vte-notes-history-viewer/discharge-vte-notes-history-viewer.service';
import { AppService } from '../services/app.service';
import { ApirequestService } from '../services/apirequest.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { SubjectsService } from '../services/subjects.service';
import { ModalVteNotesService } from '../modal-vte-notes/modal-vte-notes.service';


@Component({
  selector: 'app-discharge-vte-notes',
  templateUrl: './discharge-vte-notes.component.html',
  styleUrls: ['./discharge-vte-notes.component.css']
})
export class DischargeVteNotesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  showCancelSaveButtons: boolean = false;
  personId: string;
  vtenotes: any;
  vteNotesData: any;
  showErrorMessage: boolean = false;

  //Date Picker Models
  model: any;
  bsConfig: any;
  maxDateValue: Date = new Date();

  createdby: string;
  createddatetime: any;
  isPatientDischarged: boolean = true;
  isDisabled: boolean = false;

  clinicianHasSigned: boolean = false;

  public Editor = ClassicEditor;

  @Input() set personData(value: Person) {
  };

  @Input() set notesData(data : any){
    this.vteNotesData = data;
    this.clinicianHasSigned = this.vteNotesData[0].completedbyclinician;
    this.initializeData();
    this.checkIsDisabled();

  };

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public vteNotesHistoryViewerService: DischargeVteNotesHistoryViewerService,
    public subjects: SubjectsService,
    public modalVTENotesService: ModalVteNotesService) {
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

    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      this.isPatientDischarged = false;
    }
    else{
      this.isPatientDischarged = true;
    }

    this.subjects.vteNotesValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
          this.showCancelSaveButtons = false;
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


            if(Save) {
              this.saveVTE();
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
    this.vtenotes = this.vteNotesData[0].vtenotes;
    this.showCancelSaveButtons = false;
  }

  async saveVTE()
  {

    if(this.vtenotes == '')
    {
      this.subjects.vteNotesValidation.next(true);
    }
    else{
      this.subjects.vteNotesValidation.next(false);
    }


      this.vteNotesData[0].vtenotes = this.vtenotes ? this.vtenotes.trim() : null;
      this.vteNotesData[0].vtenotescreatedby = this.vtenotes ? this.appService.loggedInUserName : null;
      this.vteNotesData[0].vtenotestimestamp = this.vtenotes ? this.appService.getDateTimeinISOFormat(new Date()) : null;
        this.subscriptions.add(
          this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.vteNotesData[0])
            .subscribe((response) => {
              if(response)
              {
                this.showCancelSaveButtons = false;
                this.subjects.clinicalSummaryRecordChanged.next("VTE Notes");
                this.initializeData();
              }

            })
          );

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

  async openEditVTENotesDialog()
  {
    var response = false;
    await this.modalVTENotesService.confirm(this.vteNotesData, 'Clinical Summary Notes History','','Import')
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

}
