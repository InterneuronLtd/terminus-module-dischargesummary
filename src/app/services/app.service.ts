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
import { Injectable } from '@angular/core';
import { Encounter } from '../models/encounter.model';
import {jwtDecode} from 'jwt-decode';
import { action } from '../models/filter.model';
import * as moment from 'moment';
import { SubjectsService } from './subjects.service';
import { Subject } from 'rxjs';
import { DoseType } from './enum';
import { PRNMaxDose } from './formhelper';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  personAgeInDays: number;

  isAppDataReady: boolean;
  showdrugChart: boolean;
  showDischargeSummaryNotes: boolean = true;

  constructor(private subject: SubjectsService) { }

  public batchIndex = 0;
  public linkedBatchArray = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  public enableLogging = true;
  public appConfig: any;
  public buffertimeAmber: number;
  public bufferAdministered: number;
  public apiService: any;
  public baseURI: string;
  public carerecorduri: string;
  public personId: string;
  public clinicalsummaryId: string;
  public encounterId: string;
  public encounter: Encounter;
  public isCurrentEncouner: boolean = false;
  public events: any = [];
  public VtmUnits: any[];
  public fishbonedata: any;
  public bannerLabel: string;

  public openAdditionalAdministration: boolean = false;

  public roleActions: action[] = [];
  public loggedInUserName: string;
  public personAgeAtAdmission: number;
  public personDOB: Date;
  public currentEWSScale: string;
  public isWeightCaptured: boolean = false;
  public isWeightCapturedForToday: boolean = false;
  public refWeightValue: number;
  public refWeightRecordedOn: string;
  public isHeightCaptured: boolean = false;
  public refHeightValue: number;
  public bodySurfaceArea: number;
  public loggedInUserRoles: Array<string> = [];
  public contexts: object;
  public currentPersonName: string;
  public terminologyURI: string;
  public displayWarnings: boolean = true;
  public isClinician: boolean = false;
  public isPharmacist: boolean = false;
  public isNurse: boolean = false;
  public hospitalNumberTypeCode:string = null;
  public dischageDrugDisplayTTAName: boolean = false;
  public dischageDrugDisplayTTAName_print: boolean = false;

  public gender: string;
  reset(): void {
    this.personId = null;
    this.clinicalsummaryId = null;
    this.encounterId = null;
    this.contexts = null;
    this.encounter = null;
    this.isCurrentEncouner = false;
    this.apiService = null;
    this.baseURI = null;
    this.carerecorduri = null,
    this.loggedInUserName = null;
    this.enableLogging = true;
    this.roleActions = [];
    this.personDOB = null;
    this.personAgeAtAdmission = null;
    this.currentEWSScale = null;
    this.baseURI = null;
    this.fishbonedata = null;

    this.isWeightCaptured = false;
    this.isHeightCaptured = false;
    this.isWeightCapturedForToday = false;
    this.events = null;;
    this.VtmUnits = [];
    this.openAdditionalAdministration = false;
    this.roleActions = [];
    this.personAgeAtAdmission = null;
    this.personDOB = null;
    this.currentEWSScale = null;
    this.refWeightValue = null;
    this.refWeightRecordedOn = null;
    this.isHeightCaptured = false;
    this.refHeightValue = null;
    this.bodySurfaceArea = null;
    this.isAppDataReady = false;
    this.batchIndex = 0;
    this.loggedInUserRoles = [];
    this.gender = null;

    this.currentPersonName = null;
    this.buffertimeAmber = null;
    this.displayWarnings = true;
    this.bannerLabel = null;
    this.hospitalNumberTypeCode = null;
  }

  decodeAccessToken(token: string): any {
    try {
      return jwtDecode(token);
    }
    catch (Error) {
      this.logToConsole(`Error: ${Error}`);
      return null;
    }
  }


  public AuthoriseAction(action: string): boolean {
    return this.roleActions.filter(x => x.actionname.toLowerCase().trim() == action.toLowerCase().trim()).length > 0;
  }

  public getDateTimeinISOFormat(date: Date): string {

    var time = date;
    var hours = time.getHours();
    var s = time.getSeconds();
    var m = time.getMilliseconds()
    var minutes = time.getMinutes();
    date.setHours(hours);
    date.setMinutes(minutes);
    //date.setSeconds(s);
    //date.setMilliseconds(m);
    //this.appService.logToConsole(date);
    let year = date.getFullYear();
    let month = (date.getMonth() + 1);
    let dt = date.getDate();
    let hrs = date.getHours();
    let mins = date.getMinutes();
    let secs = date.getSeconds();
    let msecs = date.getMilliseconds();
    let returndate = (year + "-" + (month < 10 ? "0" + month : month) + "-" + (dt < 10 ? "0" + dt : dt) + "T" + (hrs < 10 ? "0" + hrs : hrs) + ":" + (mins < 10 ? "0" + mins : mins) + ":" + (secs < 10 ? "0" + secs : secs) + "." + (msecs < 10 ? "00" + msecs : (msecs < 100 ? "0" + msecs : msecs)));
    //this.appService.logToConsole(returndate);
    return returndate;
  }

  setPatientAgeAtAdmission() {
    this.personAgeAtAdmission = moment(this.encounter != null ? this.encounter.admitdatetime : '', moment.ISO_8601).diff(moment(this.personDOB, moment.ISO_8601), "years");
    this.personAgeInDays = moment(this.encounter != null ? this.encounter.admitdatetime : '', moment.ISO_8601).diff(moment(this.personDOB, moment.ISO_8601), "days");

  }

  logToConsole(msg: any) {
    if (this.enableLogging) {
      //console.log(msg);
    }
  }

  distinct(value: string, index: number, self: string) {
    return self.indexOf(value) === index;
  }

  GetPRNMaxDoseDisplayString(prnmaxdose: string) {
    const prnMaxDoseObj = <PRNMaxDose>JSON.parse(prnmaxdose)
    if (prnMaxDoseObj) {
      if (prnMaxDoseObj.type == DoseType.units) {
        return prnMaxDoseObj.maxdenominator + " " + prnMaxDoseObj.d_units;
      }
      else if (prnMaxDoseObj.type == "numeratoronlystrength" || prnMaxDoseObj.type == DoseType.strength) {
        return prnMaxDoseObj.maxnumerator + " " + prnMaxDoseObj.n_units + "/" + prnMaxDoseObj.maxdenominator + " " + prnMaxDoseObj.d_units;
      }
      else if (prnMaxDoseObj.type == "na") {
        return prnMaxDoseObj.maxtimes + " doses";
      }
    }
  }


}


