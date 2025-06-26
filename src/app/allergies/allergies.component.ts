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
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-allergies',
  templateUrl: './allergies.component.html',
  styleUrls: ['./allergies.component.css']
})
export class AllergiesComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  getAllergyListForPersonURI: string; 
  config: string;

  allergyIntoleranceList: any;
  isPatientDischarged: boolean = true;

  dischargeSummaryData: any

  @Input() set notesData(data : any){
    this.dischargeSummaryData = data;
    
    if((sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) && !(this.dischargeSummaryData && this.dischargeSummaryData.length > 0 && this.dischargeSummaryData[0].dischargesummarycompleted))
    {
      this.isPatientDischarged = false;
    }
    else{
      if(this.dischargeSummaryData && this.dischargeSummaryData.length > 0 && this.dischargeSummaryData[0].dischargesummarycompleted)
      {
        this.isPatientDischarged = true;
      }
      else{
        this.isPatientDischarged = false;
      }
    }
  };

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public subjects: SubjectsService) { 
      this.subjects.refreshModuleData.subscribe((onlyrefresh) => {
        if (onlyrefresh == true)
        {
          this.getAllergiesList();
        }
        else
        {}
          //this.OpenBannerWarnings();
      });
    }

  ngOnInit(): void {
    // if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    // {
    //   this.isPatientDischarged = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    // }
    
    this.getAllergiesList();
  }

  getAllergiesList()
  {
    this.getAllergyListForPersonURI = this.appService.baseURI +  "/GetBaseViewListByAttribute/terminus_personallergylist?synapseattributename=person_id&attributevalue=" + this.appService.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC";
  
    this.subscriptions.add(
      this.apiRequest.getRequest(this.getAllergyListForPersonURI)
      .subscribe((response) => {
        let allergies = JSON.parse(response);
        this.allergyIntoleranceList = allergies.filter(x => x.clinicalstatusvalue == 'Active' || x.clinicalstatusvalue == 'Resolved');
        this.allergyIntoleranceList.forEach((element,index) => {
         this.allergyIntoleranceList[index].reactionconcepts = JSON.parse(element.reactionconcepts);
        });
      })
    )
  }

  resolveModule(moduleName) {
    let config = this.appService.appConfig.AppSettings.Modules;
    let module = config.find(x => x.module == moduleName);
    if(module)
    {
      this.subjects.frameworkEvent.next("LOAD_SECONDARY_MODULE_" + module['domelement']);
    }
    
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
