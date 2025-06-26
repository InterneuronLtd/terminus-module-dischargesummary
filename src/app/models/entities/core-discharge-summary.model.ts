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
import { EntityBase } from './entity-base.model'

export class CoreDischargeSummary //extends EntityBase
{
  // _row_id: string;
  // _sequenceid: number;
  // _contextkey: string;
  // _createdtimestamp: Date;
  // _createddate: Date;
  // _createdsource: string;
  // _createdmessageid: string;
  // _createdby: string;
  // _recordstatus: number;
  // _timezonename: string;
  // _timezoneoffset: number;
  // _tenant: string;
  dischargesummary_id: string;
  person_id: string;
  encounter_id: string;
  dischargesummarycreated: boolean;
  dischargesummarycreatedtimestamp: any;
  importfromcliniclsummary: boolean;
  importfromepma: boolean;
  patienthasindividualrequirements: boolean;
  hassafeguardingconcerns: string;
  clinicalsummarynotes: string;
  dischargeplan: string;
  investigationresults: string;
  individualrequirements: string;
  safegaurdingrisktoself: string;
  safegaurdingrisktoothers: string;
  safegaurdingriskfromothers: string;
  pharmacynotes: string;
  cliniciandeclarationprintedandsigned: boolean;
  cliniciandeclarationcompleted: boolean;
  cliniciandeclarationcompletedby: string;
  cliniciandeclarationcompletedtimestamp: any;
  pharmacydeclarationreviewed: boolean;
  pharmacydeclarationcompletedby: string;
  pharmacydeclarationcompletedtimestamp: any;
  dischargesummarycreatedby: string;
  dischargedeclarationdocumentationcompleted: boolean;
  dischargedeclarationttacheckedandgiven: boolean;
  dischargedeclarationcompletedby: string;
  dischargedeclarationcompletedtimestamp: any;
  completedbyclinician: boolean;
  completedbypharmacy: boolean;
  dischargesummarycompleted: boolean;
  isthereallocatedsocialworker: boolean;
  allocatedsocialworkerdetails: string;
  expecteddateofdischarge: any;
  clinicalsummarynotescreatedby: string;
  clinicalsummarynotestimestamp: any;
  investigationresultscreatedby: string;
  investigationresultstimestamp: Date;
  dischargeplancreatedby: string;
  dischargeplantimestamp: string;
  individualrequirementscreatedby: string;
  individualrequirementstimestamp: any;
  riskstoselfcreatedby: string;
  riskstoselftimestamp: any;
  riskstoothercreatedby: string;
  riskstoothertimestamp: any;
  risksfromothercreatedby: string;
  risksfromotherstimestamp: any;
  socialworkercreatedby: string;
  socialworkertimestamp: any;
  pharmacynotescreatedby: string;
  pharmacynotestimestamp: any;
  dischargedeclarationtpodemptiedandsupplied: boolean;
  vtenotes: string;
  vtenotescreatedby: string;
  vtenotestimestamp: any;
}
