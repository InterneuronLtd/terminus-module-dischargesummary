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
  selector: 'app-pharmacy-review-declaration',
  templateUrl: './pharmacy-review-declaration.component.html',
  styleUrls: ['./pharmacy-review-declaration.component.css']
})
export class PharmacyReviewDeclarationComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  pharmacydeclarationreviewed: boolean;
  pharmacyData: any;
  selectedView: string;
  printing = false;
  isLoading = false;
  
  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  @Input() set notesData(data : any){
    
    this.pharmacyData = data;
    if(this.pharmacyData != undefined)
    {
        this.pharmacydeclarationreviewed = data[0].pharmacydeclarationreviewed;
    }
    else{
      this.pharmacyData = [];
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
            this.pharmacyData = response;
            this.savePharmacyReview();
          }

        })
      );
  }

  savePharmacyReview()
  {
    this.pharmacyData[0].pharmacydeclarationreviewed = this.pharmacydeclarationreviewed;
    this.pharmacyData[0].completedbypharmacy = true;
    this.pharmacyData[0].pharmacydeclarationcompletedtimestamp = this.appService.getDateTimeinISOFormat(new Date());
    this.pharmacyData[0].pharmacydeclarationcompletedby = this.appService.loggedInUserName;

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.pharmacyData[0])
        .subscribe((response) => {
          this.changeView();
        })
      )
  }

  changeView()
  {
    this.selectedView = 'Ready For Discharge';
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
