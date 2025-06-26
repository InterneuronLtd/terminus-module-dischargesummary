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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-import-investigation-results',
  templateUrl: './import-investigation-results.component.html',
  styleUrls: ['./import-investigation-results.component.css']
})
export class ImportInvestigationResultsComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  
  public investigationResults: string;
  public notesData: any;

  constructor(private activeModal: NgbActiveModal, public appService: AppService, public apiRequest: ApirequestService, private subjects:SubjectsService) { }

  ngOnInit(): void {
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  importInvestigationResults(){
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetInvestigation/' + this.appService.personId)
        .subscribe((response) => {
          if(response == '[]')
          {
            this.investigationResults = '';
            this.dismiss();
          }
          else{
            this.investigationResults = JSON.parse(response)[0].clinicalinvestigationnotes;
            this.getDischargeSummary(); 
          }
        })
    );
  }

  getDischargeSummary(){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            this.notesData = response;
            this.notesData[0].investigationresults = this.investigationResults;
            // this.subjects.importInvestigationresults.next(this.notesData[0].investigationresults);
            this.notesData[0].investigationresultscreatedby = this.appService.loggedInUserName;
            this.notesData[0].investigationresultstimestamp = this.appService.getDateTimeinISOFormat(new Date());
            this.postDischargeSummary();
          }
          
        })
      );
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

  postDischargeSummary(){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary', this.notesData[0])
        .subscribe((response) => {
          if(response)
          {
            if(response[0].investigationresults == '' || response[0].investigationresults == null)
            {
              this.subjects.investigationResultsValidation.next(true);
            }
            else{
              this.subjects.investigationResultsValidation.next(false);
            }
            this.subjects.refreshData.next(true);
            this.subjects.importInvestigationresults.next('');
            this.dismiss();
          }
        })
      )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
