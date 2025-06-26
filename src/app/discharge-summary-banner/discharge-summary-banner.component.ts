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
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AppService } from "../services/app.service";
import { SubjectsService } from "../services/subjects.service";
import { ApirequestService } from "../services/apirequest.service";
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';

@Component({
  selector: 'app-discharge-summary-banner',
  templateUrl: './discharge-summary-banner.component.html',
  styleUrls: ['./discharge-summary-banner.component.css']
})
export class DischargeSummaryBannerComponent implements OnInit, OnDestroy {

  public familyName: string;
  public firstName: string;
  public age: number;
  public leadConsultant: string;
  public specialty: string;
  public ward: string;
  public admitdatetime: string;
  public gender: string;
  public bannerLabel: string;
  public personId: string;
  public encounterId: string;
  public dischargeSummaryDetails: any;
  public dischargedatetime: string;
  public showEncounterDetails: boolean = false;
  public isexpecteddateofdischarge: boolean = false;
  public nhsPatient: string;

  subscriptions: Subscription = new Subscription();

  @Input() set personDetails(value: any) {
    this.personId = value.person_id;
    this.encounterId = value.encounter_id;
    this.getPatientDetails();
    this.getEncounterDetails();
  };

  constructor(private subjects: SubjectsService, public appService: AppService, private apiRequest: ApirequestService) {
    this.subjects.personIdChange.subscribe(() => {
      this.getPatientDetails();
    });

    this.subjects.encounterChange.subscribe(() => {
      this.getEncounterDetails();
      this.bannerLabel = this.appService.bannerLabel;
    });

    this.subjects.refreshAllComponents.subscribe(() => {
      this.getDischargeSummaryDetails();
      this.bannerLabel = this.appService.bannerLabel;
    });
  }

  getPatientDetails(){
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=core&synapseentityname=person&id=' + this.appService.personId)
      .subscribe((response) => {
        var personDetails = JSON.parse(response);

        this.familyName = personDetails.familyname;
        this.firstName = personDetails.firstname;
        this.age = moment(personDetails != null ?  moment(): '', moment.ISO_8601).diff(moment(personDetails.dateofbirth, moment.ISO_8601), "years");
        this.gender = personDetails.gendercode;
      })
    )
  }

  getEncounterDetails(){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_encounterdetails',this.createDischargeSummaryListFilter())
      .subscribe((response) => {
        var encounterDetails = response;
        encounterDetails.forEach(element => {
          this.admitdatetime = element.admitdatetime;
          this.leadConsultant = element.consultingdoctortext;
          this.dischargedatetime = element.dischargedatetime;
          this.specialty = element.specialtytext;
          this.ward = element.assignedpatientlocationpointofcare;
          this.isexpecteddateofdischarge = element.isexpecteddateofdischarge;
          this.showEncounterDetails = true;
          this.nhsPatient = element.patienttypetext;
        });
      })
    )
  }


  getDischargeSummaryDetails(){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createFilter())
        .subscribe((response) => {
          if(response)
          {
            this.dischargeSummaryDetails = response[0];
          }

        })
      );
  }

  createFilter()
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

  createDischargeSummaryListFilter()
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

  ngOnInit(): void {
    this.getDischargeSummaryDetails();
    this.bannerLabel = this.appService.bannerLabel;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    //this.appService.reset();
  }

}
