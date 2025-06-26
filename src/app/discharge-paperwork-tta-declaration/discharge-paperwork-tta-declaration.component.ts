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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-discharge-paperwork-tta-declaration',
  templateUrl: './discharge-paperwork-tta-declaration.component.html',
  styleUrls: ['./discharge-paperwork-tta-declaration.component.css']
})
export class DischargePaperworkTtaDeclarationComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  paperWorkData: any;
  selectedView: string;
  dischargedeclarationdocumentationcompleted: boolean;
  dischargedeclarationtpodemptiedandsupplied: boolean;
  dischargedeclarationttacheckedandgiven: boolean;
  printing = false;
  isLoading = false;

  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  @Input() set notesData(data : any){
    
    this.paperWorkData = data;
    if(this.paperWorkData != undefined)
    {
        this.dischargedeclarationtpodemptiedandsupplied = data[0].dischargedeclarationtpodemptiedandsupplied;
        this.dischargedeclarationdocumentationcompleted = data[0].dischargedeclarationdocumentationcompleted;
        this.dischargedeclarationttacheckedandgiven = data[0].dischargedeclarationttacheckedandgiven;
    }
    else{
      this.paperWorkData = [];
    }
    
  };

  constructor(public appService: AppService,
    public apiRequest: ApirequestService) { }

  ngOnInit(): void {
  }

  getDischargeSummaryData()
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            this.paperWorkData = response;
            this.saveDischargePaperWork();
          }

        })
      );
  }

  saveDischargePaperWork()
  {
    this.paperWorkData[0].dischargedeclarationtpodemptiedandsupplied = this.dischargedeclarationtpodemptiedandsupplied;
    this.paperWorkData[0].dischargedeclarationdocumentationcompleted = this.dischargedeclarationdocumentationcompleted;
    this.paperWorkData[0].dischargedeclarationttacheckedandgiven = this.dischargedeclarationttacheckedandgiven;
    this.paperWorkData[0].dischargesummarycompleted = true;
    this.paperWorkData[0].dischargedeclarationcompletedtimestamp = this.appService.getDateTimeinISOFormat(new Date());
    this.paperWorkData[0].dischargedeclarationcompletedby = this.appService.loggedInUserName;

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.paperWorkData[0])
        .subscribe((response) => {
          this.changeView();
        })
      )
  }

  changeView()
  {
    this.selectedView = 'Complete Discharge Summary';
    this.viewChange.emit(this.selectedView); 
  }

  print()
  {
    this.printing = true;
    this.isLoading = true; 
  }

  destroyRecordsTemplate() {
    this.isLoading = false
    this.printing = false;
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
  
  ngOnDestroy(): void {    
    this.subscriptions.unsubscribe();
  } 

}
