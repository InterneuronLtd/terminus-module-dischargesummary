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
import { SubjectsService } from '../services/subjects.service';

@Component({
  selector: 'app-clinician-declaration',
  templateUrl: './clinician-declaration.component.html',
  styleUrls: ['./clinician-declaration.component.css']
})
export class ClinicianDeclarationComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  clinicianData: any;
  cliniciandeclarationcompleted: boolean;
  cliniciandeclarationprintedandsigned: boolean;
  selectedView: string;
  disableClinicianButton: boolean = false;

  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  @Input() set notesData(data : any){
    this.clinicianData = data;
    if(this.clinicianData != undefined)
    {
        this.disableClinicianButton = data[0].cliniciandeclarationcompleted;
        this.cliniciandeclarationcompleted = data[0].cliniciandeclarationcompleted;
        this.cliniciandeclarationprintedandsigned = data[0].cliniciandeclarationprintedandsigned;
    }
    else{
      this.clinicianData = [];
    }
    
  };

  constructor(public appService: AppService,
    public apiRequest: ApirequestService,
    public subject: SubjectsService) { }

  ngOnInit(): void {
  }

  getDischargeSummaryData()
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            this.clinicianData = response;
            this.saveClinicianDeclaration();
          }

        })
      );
  }

  saveClinicianDeclaration()
  {
    // if(this.clinicianData[0].importfromcliniclsummary)
    // {
      if((this.clinicianData[0].clinicalsummarynotes != '' && this.clinicianData[0].clinicalsummarynotes != null) && (this.clinicianData[0].dischargeplan != '' && this.clinicianData[0].dischargeplan != null) && (this.clinicianData[0].investigationresults != '' && this.clinicianData[0].investigationresults != null))
      {
        this.saveClinicianData();
      }
      else{
        if(this.clinicianData[0].clinicalsummarynotes == '' || this.clinicianData[0].clinicalsummarynotes == null)
        {
          this.subject.clinicalSummaryNotesValidation.next(true);
        }
        
        if(this.clinicianData[0].dischargeplan == '' || this.clinicianData[0].dischargeplan == null)
        {
          this.subject.dischargePlanValidation.next(true);
        }
        
        if(this.clinicianData[0].investigationresults == '' || this.clinicianData[0].investigationresults == '')
        {
          this.subject.investigationResultsValidation.next(true);
        }
      }
      
    // }
    // else{
        
    // }

    // if(this.clinicianData[0].importfromepma)
    // {
      if(this.clinicianData[0].expecteddateofdischarge != '' && this.clinicianData[0].expecteddateofdischarge != null)
      {
        this.saveClinicianData();
      }
      else{
        if(this.clinicianData[0].expecteddateofdischarge == '' || this.clinicianData[0].expecteddateofdischarge == null)
        {
          this.subject.expectedDischargeDateValidation.next(true);
        }
      }
      
    // }
    // else{
    //     this.saveClinicianData();
    // }

    // if(this.clinicianData[0].importfromepma)
    // {
      // if(this.clinicianData[0].pharmacynotes != '' && this.clinicianData[0].pharmacynotes != null)
      // {
      //   this.saveClinicianData();
      // }
      // else{
      //   if(this.clinicianData[0].pharmacynotes == '' || this.clinicianData[0].pharmacynotes == null)
      //   {
      //     this.subject.epmaValidation.next(true);
      //   }
      // }
      
    // }
    // else{
    //     this.saveClinicianData();
    // }

    if(this.clinicianData[0].isthereallocatedsocialworker)
    {
      if(this.clinicianData[0].allocatedsocialworkerdetails != '' && this.clinicianData[0].allocatedsocialworkerdetails != null)
      {
        this.saveClinicianData();
      }
      else{
        if(this.clinicianData[0].allocatedsocialworkerdetails == '' || this.clinicianData[0].allocatedsocialworkerdetails == null)
        {
          this.subject.socialWorkerValidation.next(true);
        }
      }
    }
    else{
      this.saveClinicianData();
    }

    if(this.clinicianData[0].hassafeguardingconcerns)
    {
      if(this.clinicianData[0].safegaurdingrisktoself != '' && this.clinicianData[0].safegaurdingrisktoself != null && this.clinicianData[0].safegaurdingrisktoothers != '' && this.clinicianData[0].safegaurdingrisktoothers != null && this.clinicianData[0].safegaurdingriskfromothers != '' && this.clinicianData[0].safegaurdingriskfromothers != null)
      {
        this.saveClinicianData();
      }
      else{
        if(this.clinicianData[0].safegaurdingrisktoself == '' || this.clinicianData[0].safegaurdingrisktoself == null)
        {
          this.subject.safeGaurdingRiskToSelfValidation.next(true);
        }
        
        if(this.clinicianData[0].safegaurdingrisktoothers == '' || this.clinicianData[0].safegaurdingrisktoothers == null)
        {
          this.subject.safeGaurdingRiskToOthersValidation.next(true);
        }
        
        if(this.clinicianData[0].safegaurdingriskfromothers == '' || this.clinicianData[0].safegaurdingriskfromothers == null)
        {
          this.subject.safeGaurdingRiskFromOthersValidation.next(true);
        }
      }
    }

    if(this.clinicianData[0].patienthasindividualrequirements)
    {
      if(this.clinicianData[0].individualrequirements != '' && this.clinicianData[0].individualrequirements != null)
      {
        this.saveClinicianData();
      }
      else{
        if(this.clinicianData[0].individualrequirements == '' || this.clinicianData[0].individualrequirements == null)
        {
          this.subject.individualRequirementsValidation.next(true);
        }
      }
    }
    else{
      this.saveClinicianData();
    }
      
  }

  saveClinicianData()
  {
    if(this.checkClinicalSummaryData() && this.checkSocialWorkerData() && this.checkSafeGaurdingData() && this.checkIndividualRequirementsData() && this.checkExpectedDischargeDateData())
    {
      if(!this.clinicianData[0].completedbyclinician)
      {
        this.clinicianData[0].cliniciandeclarationcompleted = this.cliniciandeclarationcompleted;
        this.clinicianData[0].cliniciandeclarationprintedandsigned = this.cliniciandeclarationprintedandsigned;
        this.clinicianData[0].completedbyclinician = true;
        this.clinicianData[0].cliniciandeclarationcompletedby = this.appService.loggedInUserName;
        this.clinicianData[0].cliniciandeclarationcompletedtimestamp = this.appService.getDateTimeinISOFormat(new Date());
      
        this.subscriptions.add(
          this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary',this.clinicianData[0])
            .subscribe((response) => {
                this.changeView();
            })
          )
      }
      
    }
    
  }

  checkClinicalSummaryData() : Boolean
  {

    // if(this.clinicianData[0].importfromcliniclsummary)
    // {
      if((this.clinicianData[0].clinicalsummarynotes != '' && this.clinicianData[0].clinicalsummarynotes != null) && (this.clinicianData[0].dischargeplan != '' && this.clinicianData[0].dischargeplan != null) && (this.clinicianData[0].investigationresults != '' && this.clinicianData[0].investigationresults != null))
      {
        return true;
      }
      else{
        if(this.clinicianData[0].clinicalsummarynotes == '' || this.clinicianData[0].clinicalsummarynotes == null)
        {
          return false;
        }
        
        if(this.clinicianData[0].dischargeplan == '' || this.clinicianData[0].dischargeplan == null)
        {
          return false;
        }
        
        if(this.clinicianData[0].investigationresults == '' || this.clinicianData[0].investigationresults == null)
        {
          return false;
        }
      }
    // }

    return true;

  }

  checkExpectedDischargeDateData() : Boolean
  {
    // if(this.clinicianData[0].expecteddateofdischarge)
    // {
      if(this.clinicianData[0].expecteddateofdischarge != '' && this.clinicianData[0].expecteddateofdischarge != null)
      {
        return true;
      }
      else{
        if(this.clinicianData[0].expecteddateofdischarge == '' || this.clinicianData[0].expecteddateofdischarge == null)
        {
          return false;
        }
      }
    // }

    return true;
  }

  // checkPharmacyData() : Boolean
  // {
  //   if(this.clinicianData[0].importfromepma)
  //   {
  //     if(this.clinicianData[0].pharmacynotes != '' && this.clinicianData[0].pharmacynotes != null)
  //     {
  //       return true;
  //     }
  //     else{
  //       if(this.clinicianData[0].pharmacynotes == '' || this.clinicianData[0].pharmacynotes == null)
  //       {
  //         return false;
  //       }
  //     }
  //   }

  //   return true;
  // }

  checkSocialWorkerData() : Boolean
  {
    if(this.clinicianData[0].isthereallocatedsocialworker)
    {
      if(this.clinicianData[0].allocatedsocialworkerdetails != '' && this.clinicianData[0].allocatedsocialworkerdetails != null)
      {
        return true;
      }
      else{
        if(this.clinicianData[0].allocatedsocialworkerdetails == '' || this.clinicianData[0].allocatedsocialworkerdetails == null)
        {
          return false;
        }
      }
    }
    
    return true;
  }

  checkSafeGaurdingData() : Boolean {
    if(this.clinicianData[0].hassafeguardingconcerns)
    {
      if(this.clinicianData[0].safegaurdingrisktoself != '' && this.clinicianData[0].safegaurdingrisktoself != null && this.clinicianData[0].safegaurdingrisktoothers != '' && this.clinicianData[0].safegaurdingrisktoothers != null && this.clinicianData[0].safegaurdingriskfromothers != '' && this.clinicianData[0].safegaurdingriskfromothers != null)
      {
        return true;
      }
      else{
        if(this.clinicianData[0].safegaurdingrisktoself == '' || this.clinicianData[0].safegaurdingrisktoself == null)
        {
          return false;
        }
        
        if(this.clinicianData[0].safegaurdingrisktoothers == '' || this.clinicianData[0].safegaurdingrisktoothers == null)
        {
          return false;
        }
        
        if(this.clinicianData[0].safegaurdingriskfromothers == '' || this.clinicianData[0].safegaurdingriskfromothers == null)
        {
          return false;
        }
      }
    }

    return true;
  }

  checkIndividualRequirementsData() : Boolean
  {
    if(this.clinicianData[0].patienthasindividualrequirements)
    {
      if(this.clinicianData[0].individualrequirements != '' && this.clinicianData[0].individualrequirements != null)
      {
        return true;
      }
      else{
        if(this.clinicianData[0].individualrequirements == '' || this.clinicianData[0].individualrequirements == null)
        {
          return false;
        }
      }
    }
    
    return true;
  }

  changeView()
  {
    this.selectedView = 'View Discharge Summary';
    this.viewChange.emit(this.selectedView); 
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
