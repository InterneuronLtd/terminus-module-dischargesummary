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
import { DischargeSummaryPrescription, MedicationsSummary } from '../models/entities/core-discharge-summary-prescription.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { DischargePrescription } from '../models/entities/dischargesummarypresciption.model';
import * as moment from 'moment';
import { MedicationsHelper } from '../services/MedicationHelper.service';
@Component({
  selector: 'app-print-discharge-summary-html',
  templateUrl: './print-discharge-summary-html.component.html',
  styleUrls: ['./print-discharge-summary-html.component.css']
})
export class PrintDischargeSummaryHtmlComponent implements OnInit, OnDestroy {

  public patientName: string;
  public preferredName: string;
  public dob: string;
  public age: number;
  public gender: string;
  public nhsNumber: string;
  public hospitalNumber: string;
  public address: string;
  public addressLine1: string;
  public addressLine2: string;
  public addressLine3: string;
  public addressLine4: string;
  public email: string;
  public personalNumber: string;
  public individualRequirements: string;
  public risksToSelf: string;
  public risksToOthers: string;
  public risksFromOthers: string;

  public gpPractice: string;
  public gpPrefix: string;
  public gpFirstName: string;
  public gpFamilyName: string;
  public gpFacilityName: string;
  public gpAddressLine1: string;
  public gpAddressLine2: string;
  public gpAddressLine3: string;
  public gpPostCode: string;
  public gpCode: string;

  public referralType: string;
  public effectiveDate: Date;
  public processedDate: Date;
  public ubrn: string;
  public referralFromName: string;
  public referralFromAddressLine1: string;
  public referralFromAddressLine2: string;
  public referralFromAddressCity: string;
  public referralFromState: string;
  public referralFromPostCode: string;
  public referralFromSpecialtyNational: string;
  public referralFromSpecialtyLocal: string;
  public referralToName: string;
  public referralToAddressLine1: string;
  public referralToAddressLine2: string;
  public referralToAddressCity: string;
  public referralToState: string;
  public referralToPostCode: string;

  public admitdatetime: string;
  public consultant: string;
  public specialty: string;
  public dischargedatetime: string;
  public clinicalSummaryNotes: string;
  public vteNotes: string;
  public investigationResultNotes: string;
  public pharmacyNotes: string;
  public dischargePlanNotes: string;
  public socialWorkerDetails: string;
  public isExpectedDateOfDischarge: boolean;
  public clinicianDeclarationCompleteBy: string;
  public pharmacyDeclarationCompleteBy: string;
  public dischargeDeclarationCompleteBy: string;
  public clinicianDeclarationCompleteDate: string;
  public pharmacyDeclarationCompleteDate: string;
  public dischargeDeclarationCompleteDate: string;
  public patientDetails: any;
  public dischargesummary_id: string;
  firstname: string;
  familyname: string;

  diagnosisList: any = [];
  procedureList: any = [];
  allergyIntoleranceList: any [];
  isDataReady = false;

  public dischargesummaryprescription: DischargeSummaryPrescription[] = [];

  public dischargePrescription: DischargePrescription[] = [];

  subscriptions: Subscription = new Subscription();

  public patientLeaveSummary: boolean = false;

  public nhsPatient: string;

  public wardDisplay: string;

  @Input() set isPatientLeaveSummary(value: boolean){
    this.patientLeaveSummary = value;
  }

  @Output() destroyComponent: EventEmitter<any> = new EventEmitter();

  constructor(public appService: AppService, public apiRequest: ApirequestService, public subjects: SubjectsService) { 
    // this.subjects.personIdChange.subscribe(() => {
    //   this.gpPractise();
    //   this.personDemographice();
    //   this.getDiagnosisList();
    //   this.getProcedureList();
    //   this.getAllergiesList();
    // });

    // this.subjects.encounterChange.subscribe(() => {
    //   this.refererDetails();
    //   this.dischargeSummaryDetails();
    //   this.admissionDetails();
    //   this.getMeds();
    // });
  }

  ngOnInit(): void {
    this.gpPractise(() => {
      this.personDemographice(() => {
        this.getDiagnosisList(() => {
          this.getProcedureList(() => {
            this.getAllergiesList(() => {
              this.refererDetails(() => {
                this.dischargeSummaryDetails(() => {
                  this.admissionDetails(() => {
                    this.getMeds(() => {
                      this.isDataReady = true;
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  personDemographice(cb: () => any)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_persondetails',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            let dsPersonDetails: any;
            dsPersonDetails = response;
            this.patientDetails = dsPersonDetails
            dsPersonDetails.forEach(element => {
              this.patientName = element.name;
              this.preferredName = element.preferredname;
              this.dob = element.dob;
              this.gender = element.gender;
              this.nhsNumber = element.nhsnumber;
              this.hospitalNumber = element.hospitalnumber;
              this.address = element.address;
              // console.log('address',this.address.split(','));
              let splitAddress = this.address.split(',');
              this.addressLine1 = splitAddress[0];
              this.addressLine2 = splitAddress[1];
              this.addressLine3 = splitAddress[2];
              this.addressLine4 = splitAddress[3];
              this.email = element.email;
              this.personalNumber = element.personalnumber;
              this.firstname = element.firstname;
              this.familyname = element.familyname;
              this.age = moment(dsPersonDetails != null ?  moment(): '', moment.ISO_8601).diff(moment(element.dateofbirth, moment.ISO_8601), "years");
              this.patientDetails[0].age = this.age;
            });
          }
          cb();
        })
      );  
  }

  gpPractise(cb: () => any)
  {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + '/GetObject?synapsenamespace=extended&synapseentityname=person&id=' + this.appService.personId)
        .subscribe((response) => {
          if(response)
          {
            let gpResponse = JSON.parse(response);
            this.gpFacilityName = gpResponse.organisationname;
            this.gpCode = gpResponse.pcpnationalcode;
            this.gpFamilyName = gpResponse.pcpfamilyname;
            this.gpFirstName = gpResponse.pcpgivenname;
            this.gpPrefix = gpResponse.pcpprefix;
            this.gpAddressLine1 = gpResponse.pcpaddressline1;
            this.gpAddressLine2 = gpResponse.pcpaddressline2;
            this.gpAddressLine3 = gpResponse.pcpaddressline3;
            this.gpPostCode = gpResponse.pcpaddresspostcode;
          }
          cb();
        })
      );
  }

  refererDetails(cb: () => any)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_referraldetails',this.createDischargeSummaryListFilter())
        .subscribe((response) => {
          if(response.length > 0)
          {
            this.referralType = response[0].referraltype;
            this.effectiveDate = response[0].effectivedate;
            this.processedDate = response[0].processeddate;
            this.ubrn = response[0].ubrn;
            this.referralFromName = response[0].referralfromname;
            this.referralFromAddressLine1 = response[0].referralfromaddressline1;
            this.referralFromAddressLine2 = response[0].referralfromaddressline2;
            this.referralFromAddressCity = response[0].referralfromaddresscity;
            this.referralFromState = response[0].referralfromstate;
            this.referralFromPostCode = response[0].referralfrompostcode;
            this.referralFromSpecialtyNational = response[0].referralfromspecialtynational;
            this.referralFromSpecialtyLocal = response[0].referralfromspecialtylocal;
            this.referralToName = response[0].referraltoname;
            this.referralToAddressLine1 = response[0].referraltoaddressline1;
            this.referralToAddressLine2 = response[0].referraltoaddressline2;
            this.referralToAddressCity = response[0].referraltoaddresscity;
            this.referralToState = response[0].referraltostate;
            this.referralToPostCode = response[0].referraltopostcode;
          }
          cb();
        })
      );
  }

  dischargeSummaryDetails(cb: () => any)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createDischargeSummaryListFilter())
        .subscribe((response) => {
          if(response)
          {
            let dsResponse: any;
            dsResponse = response;
            if(dsResponse.length > 0)
            {
              this.dischargesummary_id = dsResponse[0].dischargesummary_id;
              this.individualRequirements = dsResponse[0].individualrequirements;
              this.risksToSelf = dsResponse[0].safegaurdingrisktoself;
              this.risksToOthers = dsResponse[0].safegaurdingrisktoothers;
              this.risksFromOthers = dsResponse[0].safegaurdingriskfromothers;
              this.clinicalSummaryNotes = dsResponse[0].clinicalsummarynotes;
              this.vteNotes = dsResponse[0].vtenotes;
              this.investigationResultNotes = dsResponse[0].investigationresults;
              this.pharmacyNotes = dsResponse[0].pharmacynotes;
              this.dischargePlanNotes = dsResponse[0].dischargeplan;
              this.socialWorkerDetails = dsResponse[0].allocatedsocialworkerdetails;
              this.clinicianDeclarationCompleteBy = dsResponse[0].cliniciandeclarationcompletedby;
              this.pharmacyDeclarationCompleteBy = dsResponse[0].pharmacydeclarationcompletedby;
              this.dischargeDeclarationCompleteBy = dsResponse[0].dischargedeclarationcompletedby;
              this.clinicianDeclarationCompleteDate = dsResponse[0].cliniciandeclarationcompletedtimestamp;
              this.pharmacyDeclarationCompleteDate = dsResponse[0].pharmacydeclarationcompletedtimestamp;
              this.dischargeDeclarationCompleteDate = dsResponse[0].dischargedeclarationcompletedtimestamp;
            }
            
          }
          cb();
        })
      );
  }

  admissionDetails(cb: () => any)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_encounterdetails',this.createDischargeSummaryListFilter())
        .subscribe((response) => {
          if(response)
          {
            let dsEncounterDetails: any;
            dsEncounterDetails = response;
            dsEncounterDetails.forEach(element => {
              this.admitdatetime = element.admitdatetime;
              this.consultant = element.consultingdoctortext;
              this.dischargedatetime = element.dischargedatetime;
              this.isExpectedDateOfDischarge = element.isexpecteddateofdischarge;
              this.specialty = element.specialtytext;
              this.nhsPatient = element.patienttypetext;
              this.wardDisplay = element.warddisplay;
            });
          }  
          cb();
        })
      );
  }

  getDiagnosisList(cb: () => any)
  {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetDiagnoses/'+this.appService.personId)
      .subscribe((response) => {
        if(response.length > 0)
        {
          this.diagnosisList = JSON.parse(response);
        }
        cb();
      })
    )
  }

  getProcedureList(cb: () => any)
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_getproceduresforencounter',this.createDischargeSummaryProcedureListFilter())
      .subscribe((response) => {
        if(response.length > 0)
        {
          this.procedureList = response;
        }
        cb();
      })
    )
  }

  getAllergiesList(cb: () => any)
  {
    let getAllergyListForPersonURI = this.appService.baseURI +  "/GetBaseViewListByAttribute/terminus_personallergylist?synapseattributename=person_id&attributevalue=" + this.appService.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC";
  
    this.subscriptions.add(
      this.apiRequest.getRequest(getAllergyListForPersonURI)
      .subscribe((response) => {
          let allergies = JSON.parse(response);
          this.allergyIntoleranceList = allergies.filter(x => x.clinicalstatusvalue == 'Active' || x.clinicalstatusvalue == 'Resolved');
          this.allergyIntoleranceList.forEach((element,index) => {
          this.allergyIntoleranceList[index].reactionconcepts = JSON.parse(element.reactionconcepts);
        });
        cb();
      })
    )
  }

  getMeds(cb: () => any){

    let ms = new MedicationsHelper(this.apiRequest, this.appService, this.appService.encounterId);

    ms.GetSummary((data:[]) => {

      this.dischargesummaryprescription = [];

      data.forEach(summary => {
        if(Array.isArray(summary['prescriptions']) && Array.from(summary['prescriptions']).length > 0){
          
          let dsp: DischargeSummaryPrescription = new DischargeSummaryPrescription();
          dsp.category = summary['catagory'];
          dsp.medicationssummaries = [];

          Array.from(summary['prescriptions']).forEach(prescription => {
            let medSum: MedicationsSummary = new MedicationsSummary();

            medSum.checkedby = '';
            medSum.comments = prescription['__medicationsummary']['comments'];
            medSum.dispensedby = '';
            medSum.dose = prescription['__medicationsummary']['displaydose'];
            medSum.gptocontinue = '';
            medSum.iscontrolleddrug = prescription['__medicationsummary']['iscontrolleddrug'];
            medSum.medicationid = prescription['__medicationsummary']['medicationid'];
            medSum.name = prescription['__medicationsummary']['displayname'];
            medSum.pod = '';
            medSum.prescriptionid = prescription['__medicationsummary']['prescriptionid'];
            medSum.quantity = prescription['__medicationsummary']['displayquantity'];
            medSum.quantitysupplied = '';
            medSum.route = prescription['__medicationsummary']['displayroute'];
            medSum.status = prescription['__medicationsummary']['displaystatus'];
            medSum.supplyondischarge = '';
            medSum.dischargesummaryprescription_id = '';
            medSum.person_id = prescription['person_id'];
            medSum.encounter_id = prescription['encounter_id'];
            medSum.supplyrequired = prescription['__medicationsummary']['supplyRequired'];
            medSum.requestordermessage = prescription['__medicationsummary']['requestOrderMessage'];
            medSum.requestedquantity = prescription['__medicationsummary']['requestedQuantity'];
            medSum.requestedquantityunits = prescription['__medicationsummary']['requestedQuantityUnits'];
            medSum.supplyrequiredreason = prescription['__medicationsummary']['supplyRequiredReason'];
            medSum.printingrequired = prescription['__medicationsummary']['printingrequired'];
            medSum.protocoldose = prescription['__medicationsummary']['protocolDose'];
            medSum.prescriptionenddate =prescription['__medicationsummary']['prescriptionenddate'];
            medSum.protocolmessage = prescription['__medicationsummary']['protocolmessage'];
            medSum.indication = prescription['__medicationsummary']['indication'];

            dsp.medicationssummaries.push(medSum);
          });

          this.dischargesummaryprescription.push(dsp);
        }
      });
      cb();
   });

    // this.subscriptions.add(
    //   this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummaryprescription', this.createDischargeSummaryListFilter())
    //     .subscribe((response) => {
    //       if(response.length > 0)
    //       {
    //         let dp = response;

    //         for(let i=0; i < dp.length; i++){
    //           let dsp: DischargeSummaryPrescription = new DischargeSummaryPrescription();
              
    //           dsp.category = dp[i].category;
    //           dsp.medicationssummaries = [];
  
    //           let medSum: MedicationsSummary = new MedicationsSummary();
  
    //           medSum.checkedby = dp[i].checkedby;
    //           medSum.comments = dp[i].comments;
    //           medSum.dispensedby = dp[i].dispensedby;
    //           medSum.dose = dp[i].dose;
    //           medSum.gptocontinue = dp[i].gptocontinue;
    //           medSum.iscontrolleddrug = dp[i].iscontrolleddrug;
    //           medSum.medicationid = dp[i].medicationid;
    //           medSum.name = dp[i].name;
    //           medSum.pod = dp[i].pod;
    //           medSum.prescriptionid = dp[i].prescriptionid;
    //           medSum.quantity = dp[i].quantity;
    //           medSum.quantitysupplied = dp[i].quantitysupplied;
    //           medSum.route = dp[i].route;
    //           medSum.status = dp[i].status;
    //           medSum.supplyondischarge = dp[i].supplyondischarge;
    //           medSum.supplyrequired = dp[i].supplyrequired;
    //           medSum.requestordermessage = dp[i].requestordermessage;
    //           medSum.requestedquantity = dp[i].requestedquantity;
    //           medSum.requestedquantityunits = dp[i].requestedquantityunits;
    //           medSum.supplyrequiredreason = dp[i].supplyrequiredreason;
    //           medSum.printingrequired = dp[i].printingrequired;
    //           medSum.protocoldose = (dp[i].protocoldose != '' ? JSON.parse(dp[i].protocoldose) : '');
    //           medSum.prescriptionenddate = dp[i].prescriptionenddate;
    //           medSum.protocolmessage = dp[i].protocolmessage;
    //           medSum.indication = dp[i].indication;
              
    //           dsp.medicationssummaries.push(medSum);

    //           if(this.dischargesummaryprescription.length > 0){
    //             if(this.checkIfCategoryFound(this.dischargesummaryprescription, dp[i].category)){
    //               for(let j=0; j < this.dischargesummaryprescription.length; j++){
    //                 if(this.dischargesummaryprescription[j].category == dp[i].category){
    //                   this.dischargesummaryprescription[j].medicationssummaries.push(medSum);
    //                 }
    //               }
    //             }
    //             else{
    //               this.dischargesummaryprescription.push(dsp);
    //             }
    //           }
    //           else{
    //             this.dischargesummaryprescription.push(dsp);
    //           }
    //         }
    //       }
    //     })
    // )
  }

  checkIfCategoryFound(arr, category) {
    const found = arr.some(el => el.category == category);
    if (found) return true;
    return false;
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

  createClinicalSummaryNotesFilter()
  {
    let condition = "";
    let pm = new filterParams();
    condition = "person_id = @person_id";
    pm.filterparams.push(new filterparam("person_id", this.appService.personId));
    
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

  createDischargeSummaryProcedureListFilter()
  {
    let condition = "";
    let pm = new filterParams();
    condition = "person_id = @person_id AND CAST(proceduredate AS date) BETWEEN CAST(@admissiondate AS date) AND CAST(@dischargedate AS date)";
    let splitDate = sessionStorage.getItem('admissionDate').split('/');
    let newAdmissionDate = splitDate[2]+'-'+splitDate[1]+'-'+splitDate[0];
    let dischargeDate;
    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      dischargeDate = new Date();
    }
    else{
      let splitDischargeDate = sessionStorage.getItem('dischargeDate').split('/');
      dischargeDate = splitDischargeDate[2]+'-'+splitDischargeDate[1]+'-'+splitDischargeDate[0];
    }
    // let dischargeDate = (sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) ? new Date() : new Date(sessionStorage.getItem('dischargeDate'));
    pm.filterparams.push(new filterparam("person_id", this.appService.personId));
    pm.filterparams.push(new filterparam("admissiondate", this.appService.getDateTimeinISOFormat(new Date(newAdmissionDate))));
    pm.filterparams.push(new filterparam("dischargedate", this.appService.getDateTimeinISOFormat(new Date(dischargeDate))));
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

  pdfDownloaded() {
    this.destroyComponent.emit('true');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
