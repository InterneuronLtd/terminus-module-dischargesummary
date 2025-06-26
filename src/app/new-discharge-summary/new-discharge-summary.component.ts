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
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { AppService } from "../services/app.service";
import { ApirequestService } from "../services/apirequest.service";
import { Subscription } from 'rxjs';
import { Guid } from 'guid-typescript';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';

@Component({
  selector: 'app-new-discharge-summary',
  templateUrl: './new-discharge-summary.component.html',
  styleUrls: ['./new-discharge-summary.component.css']
})
export class NewDischargeSummaryComponent implements OnInit, OnDestroy {
 
  public importFromClinicalSummary: boolean = false;
  public importFromEPMA: boolean = false;
  public patientHasIndividualRequirements: boolean = false;
  public hasSafeGuardingConcerns: boolean = false;
  public isThereAllocatedSocialWorker: boolean = false;
  public clinicalSummaryNotes: string = '';
  public dischargePlanNotes: string = '';
  public investigationNotes: string = '';
  public pharmacyNotes: string = '';
  public personId: string;
  public selectedView: string;
  public encounterId: any;
  public personDetails: any;

  subscriptions: Subscription = new Subscription();

  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  @Input() set person(value: any) {
    this.personId = value.person_id;
    this.encounterId = value.encounter_id;
    this.personDetails = value;
  };

  constructor(public appService: AppService, private apiRequest: ApirequestService)
  { 
    
  }

  ngOnInit(): void {
    this.importFromClinicalSummary = true;
    this.importFromEPMA = true;
    this.appService.bannerLabel = "New Discharge Summary";
  }

  getClinicalSummaryNotes(){
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryNote/' + this.personId)
        .subscribe((response) => {
          if(response == '[]')
          {
            this.clinicalSummaryNotes = '';
          }
          else{
            this.clinicalSummaryNotes = JSON.parse(response)[0].notes;
          }
          this.getDischargePlanNotes();       
        })
    )
  }

  getDischargePlanNotes(){
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetDischargePlan/' + this.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          this.dischargePlanNotes = '';
        }
        else{
          this.dischargePlanNotes = JSON.parse(response)[0].dischargeplannotes;
        }
        this.getInvestigationResultNotes();
      })
    )
  }

  getInvestigationResultNotes(){
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetInvestigation/' + this.personId)
      .subscribe((response) => {
        if(response == '[]')
        {
          this.investigationNotes = '';
        }
        else{
          this.investigationNotes = JSON.parse(response)[0].clinicalinvestigationnotes;
        }
        this.postDischargeSummary();
      })
    )
  }

  getPharmacyNotes(){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/local/epma_dischargesummarry', this.createPharmacyNotesFilter())
      .subscribe((response) => {
          if(response.length == 0)
          {
            this.pharmacyNotes = '';
          }
          else{
            this.pharmacyNotes = response[0].notes;
          }
          this.getClinicalSummaryNotes();
      })
    )
  }

  getEPMAPharmacyNotes(){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/local/epma_dischargesummarry', this.createPharmacyNotesFilter())
      .subscribe((response) => {
          if(response.length == 0)
          {
            this.pharmacyNotes = '';
          }
          else{
            this.pharmacyNotes = response[0].notes;
          }
          this.postDischargeSummary();
      })
    )
  }

  createDischargeSummary(){
    if(this.importFromEPMA && this.importFromClinicalSummary){
      this.getPharmacyNotes();
    }
    else if(this.importFromClinicalSummary){
      this.getClinicalSummaryNotes();
    }
    else if(this.importFromEPMA){
      this.getEPMAPharmacyNotes();
    }
    else{
      this.postDischargeSummary();
    }
  }

  postDischargeSummary(){
    let dischargeSummary = {
      dischargesummary_id:  String(Guid.create()), 
      person_id: this.appService.personId,
      encounter_id: this.appService.encounterId,
      dischargesummarycreated: true,
      dischargesummarycreatedtimestamp: this.appService.getDateTimeinISOFormat(new Date()),
      importfromcliniclsummary: this.importFromClinicalSummary,
      importfromepma: this.importFromEPMA,
      patienthasindividualrequirements: this.patientHasIndividualRequirements,
      hassafeguardingconcerns: this.hasSafeGuardingConcerns,
      clinicalsummarynotes: this.clinicalSummaryNotes,
      dischargeplan: this.dischargePlanNotes,
      investigationresults: this.investigationNotes,
      individualrequirements: null,
      safegaurdingrisktoself: null,
      safegaurdingrisktoothers: null,
      safegaurdingriskfromothers: null,
      pharmacynotes: this.pharmacyNotes,
      cliniciandeclarationprintedandsigned: false,
      cliniciandeclarationcompleted: false,
      cliniciandeclarationcompletedby: null,
      cliniciandeclarationcompletedtimestamp: null,
      pharmacydeclarationreviewed: false,
      pharmacydeclarationcompletedby: null,
      pharmacydeclarationcompletedtimestamp: null,
      dischargesummarycreatedby: this.appService.loggedInUserName,
      dischargedeclarationdocumentationcompleted: false,
      dischargedeclarationttacheckedandgiven: false,
      dischargedeclarationtpodemptiedandsupplied: false,
      dischargedeclarationcompletedby: null,
      dischargedeclarationcompletedtimestamp: null,
      completedbyclinician: false,
      completedbypharmacy: false,
      dischargesummarycompleted: false,
      isthereallocatedsocialworker: this.isThereAllocatedSocialWorker,
      allocatedsocialworkerdetails: null,
      expecteddateofdischarge: null,
      clinicalsummarynotescreatedby: this.clinicalSummaryNotes != '' ? this.appService.loggedInUserName : null,
      clinicalsummarynotestimestamp: this.clinicalSummaryNotes != '' ? this.appService.getDateTimeinISOFormat(new Date()) : null,
      investigationresultscreatedby: this.investigationNotes != '' ? this.appService.loggedInUserName : null,
      investigationresultstimestamp: this.investigationNotes != '' ? this.appService.getDateTimeinISOFormat(new Date()) : null,
      dischargeplancreatedby: this.dischargePlanNotes != '' ? this.appService.loggedInUserName : null,
      dischargeplantimestamp: this.dischargePlanNotes != '' ? this.appService.getDateTimeinISOFormat(new Date()) : null,
      individualrequirementscreatedby: null,
      individualrequirementstimestamp: null,
      riskstoselfcreatedby: null,
      riskstoselftimestamp: null,
      riskstoothercreatedby: null,
      riskstoothertimestamp: null,
      risksfromothercreatedby: null,
      risksfromotherstimestamp: null,
      socialworkercreatedby: null,
      socialworkertimestamp: null,
      pharmacynotescreatedby: this.pharmacyNotes != '' ? this.appService.loggedInUserName : null,
      pharmacynotestimestamp: this.pharmacyNotes != '' ? this.appService.getDateTimeinISOFormat(new Date()) : null
    }

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummary', dischargeSummary)
        .subscribe((response) => {
          if(response)
          {
            this.selectedView = 'Edit Discharge Summary';
            this.viewChange.emit(this.selectedView);
          }
        })
      )
  }

  createPharmacyNotesFilter()
  {
    let condition = "";
    let pm = new filterParams();
    condition = "person_id = @person_id AND encounterid = @encounter_id";
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

  listView()
  {
    this.selectedView = 'List Discharge Summary';
    this.viewChange.emit(this.selectedView);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
