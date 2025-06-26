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
import { Person } from '../models/entities/core-person.model';
import { AppService } from '../services/app.service';
import { ApirequestService } from '../services/apirequest.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { SubjectsService } from '../services/subjects.service';
import { ModalExpectedDischargeDateService } from '../modal-expected-discharge-date/modal-expected-discharge-date.service';

@Component({
  selector: 'app-expected-discharge-date',
  templateUrl: './expected-discharge-date.component.html',
  styleUrls: ['./expected-discharge-date.component.css']
})
export class ExpectedDischargeDateComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  clinicalSummaryChange: Subscription = new Subscription();

  personId: string;
  expectedDischargeDateData: any;
  expecteddateofdischarge: any;
  eddstring: any;
  showErrorMessage: boolean = false;

   padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }

  formatDate(date) {
    try {
    return [
      this.padTo2Digits(date.getDate()),
      this.padTo2Digits(date.getMonth() + 1),
      date.getFullYear(),
    ].join('/');
    }
    catch(err){
      return(date);
    }
  }


  //Date Picker Models
  model: any;
  bsConfig: any;
  maxDateValue: Date = new Date();
  isPatientDischarged: boolean = true;

  isDisabled: boolean = false;
  clinicianHasSigned: boolean = false;

  @Input() set personData(value: Person) {
  };

  @Input() set notesData(data : any){
    this.expectedDischargeDateData = data;
    this.clinicianHasSigned = this.expectedDischargeDateData[0].completedbyclinician;
    this.initializeData();
    this.checkIsDisabled();
  };

  checkIsDisabled() {
    if(this.expectedDischargeDateData) {
      if(this.expectedDischargeDateData[0].dischargesummarycompleted) {
        this.isDisabled = true;
      }
      else {
        this.isDisabled = false;
      }
    }

    // if(!this.appService.isClinician) {
    //   this.isDisabled = true;
    // }
  }

  initializeData()
  {

    if(this.expectedDischargeDateData[0]) {
      if(!this.isEmpty(this.expectedDischargeDateData[0]))
      {
        //if(this.expectedDischargeDateData[0].expecteddateofdischarge != null && this.expectedDischargeDateData[0].expecteddateofdischarge != '')
        if(this.expectedDischargeDateData[0].expecteddateofdischarge)
        {
          //this.expecteddateofdischarge = null;
          this.expecteddateofdischarge = new Date(this.expectedDischargeDateData[0].expecteddateofdischarge);
          this.eddstring = this.formatDate(this.expecteddateofdischarge);
          //this.saveClinicalSummary();
        }
        else{
          this.expecteddateofdischarge = null;
        }
      }
    else{
        this.expecteddateofdischarge = null;
      }
    }
  }

 isEmpty(obj: any) {
    return Object.keys(obj).length === 0;
  }

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public subjects: SubjectsService,
    public modalExpectedDischargeDateService:ModalExpectedDischargeDateService) {

      this.subjects.refreshAllComponents.subscribe(() => {
        this.getDischargeSummaryData(false,'');
        this.checkIsDisabled();

      });

  }

  ngOnInit(): void {
    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      this.isPatientDischarged = false;
    }
    else{
      this.isPatientDischarged = true;
    }
    this.subjects.expectedDischargeDateValidation.subscribe(resp => {
      if(resp)
      {
        this.showErrorMessage = true;
      }
      else{
        this.showErrorMessage = false;
      }
    })
  }

  getDischargeSummaryData(Save: boolean,event)
  {
    if(event)
    {
      event.preventDefault()
    }
    
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            if(this.expectedDischargeDateData == null || !Save)
            {
              this.expectedDischargeDateData = response;
              this.expectedDischargeDateData[0].expecteddateofdischarge = this.expecteddateofdischarge;
              this.clinicianHasSigned = this.expectedDischargeDateData[0].completedbyclinician;
            }


            if(Save) {
              this.saveClinicalSummary();
            }
          }

        })
      );
  }

  getExpectedDischargeDate(date)
  {
    this.expecteddateofdischarge = date;
    this.saveClinicalSummary();
  }

  async saveClinicalSummary()
  {
    if(!this.expecteddateofdischarge)
    {
      this.subjects.expectedDischargeDateValidation.next(true);
    }
    else{
      this.subjects.expectedDischargeDateValidation.next(false);
    }

      this.expectedDischargeDateData[0].expecteddateofdischarge = this.expecteddateofdischarge?this.appService.getDateTimeinISOFormat(this.expecteddateofdischarge):null;

      this.subscriptions.add(
        this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.expectedDischargeDateData[0])
          .subscribe((response) => {
            if(response)
            {
              this.subjects.clinicalSummaryRecordChanged.next("EDD");
              this.initializeData();
            }

          })
        );


  }

  async openEditExpectedDischargeDateDialog()
  {
    var response = false;
    await this.modalExpectedDischargeDateService.confirm(this.expectedDischargeDateData, 'Clinical Summary Notes History','','Import')
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
