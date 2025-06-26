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
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { DischargeSummaryPrescription, MedicationsSummary } from '../models/entities/core-discharge-summary-prescription.model';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { MedicationsHelper } from '../services/MedicationHelper.service';

@Component({
  selector: 'app-print-discharge-prescription',
  templateUrl: './print-discharge-prescription.component.html',
  styleUrls: ['./print-discharge-prescription.component.css']
})
export class PrintDischargePrescriptionComponent implements OnInit, OnDestroy {

patientName: string;
hospitalNumber: string;
nhsNumber: string;
gender: string;
dob: string;
age: number;
address: string;
leadConsultant: string;
specialty: string;
encounterStatus: string;
admitDatetime: string;
dischargeDatetime: string;
obsDate: string;
obsValue: string;
isControlDrug: boolean;
isexpecteddateofdischarge: boolean = false;
firstname: string;
familyname: string;
dischargeSumPrescriptionId
patientDetails: any;
nhsPatient: string;
wardDisplay: string;
isDataReady = false;
public dischargesummaryprescription: DischargeSummaryPrescription[] = [];

allergyIntoleranceList: any;

subscriptions: Subscription = new Subscription();

@Input() set isControlledDrug(value:boolean){
  this.isControlDrug = value;
}

@Input() set dischargeSummaryPrescriptionId(value:string){
  if(value != undefined || value != null || value != ''){
    this.dischargeSumPrescriptionId = value;
  }
}

@Output() destroyComponent: EventEmitter<any> = new EventEmitter();

  constructor(private subjects: SubjectsService,public appService: AppService, private apiRequest: ApirequestService) { 
    // this.subjects.personIdChange.subscribe(() => {
    //   this.getPatientDetails();
    //   this.getAllergies();
    // });

    // this.subjects.encounterChange.subscribe(() => {
    //   this.getEncounterDetails();
    //   this.getMeds();
    //   this.getWeight();
    // });
  }

  ngOnInit(): void {
    this.getPatientDetails(() => {
      this.getAllergies(() => {
        this.getEncounterDetails(() => {
          this.getMeds(() => {
            this.getWeight(()=>{
              this.isDataReady = true;
            });
          });
        });
      });
    });
  }

  getPatientDetails(cb: () => any){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_persondetails',this.createPersonDetailsFilter())
      .subscribe((response) => {
        var personDetails = response;
        this.patientDetails = personDetails;
        personDetails.forEach(element => {
          this.patientName = element.name;
          this.hospitalNumber = element.hospitalnumber;
          this.nhsNumber = element.nhsnumber;
          this.gender = element.gender;
          this.dob = element.dob;
          this.age = moment(personDetails != null ?  moment(): '', moment.ISO_8601).diff(moment(element.dateofbirth, moment.ISO_8601), "years");
          this.patientDetails[0].age = this.age;
          this.firstname = element.firstname;
          this.familyname = element.familyname;
          this.address = element.address;
        })
        cb();
      })
    )
  }

  getEncounterDetails(cb: () => any){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_encounterdetails',this.createEncounterDetailsFilter())
      .subscribe((response) => {
        var encounterDetails = response;
        encounterDetails.forEach(element => {
          this.admitDatetime = element.admitdatetime;
          this.leadConsultant = element.consultingdoctortext;
          this.dischargeDatetime = element.dischargedatetime;
          this.specialty = element.specialtytext;
          this.isexpecteddateofdischarge = element.isexpecteddateofdischarge;
          this.nhsPatient = element.patienttypetext;
          this.wardDisplay = element.warddisplay;
        });
        cb();
      })
    )
  }

  createEncounterDetailsFilter()
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

  createPersonDetailsFilter()
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

  checkIfCategoryFound(arr, category) {
    const found = arr.some(el => el.category == category);
    if (found) return true;
    return false;
  }

  getMeds(cb: () => any){

    let ms = new MedicationsHelper(this.apiRequest, this.appService, this.appService.encounterId);

    ms.GetSummary((data:[]) => {

      this.dischargesummaryprescription = [];

      data.forEach(summary => {
        if(Array.isArray(summary['prescriptions']) && Array.from(summary['prescriptions']).length > 0){
          
          if(summary['catagory'] != 'Suspended' && summary['catagory'] != 'Stopped'){

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
              if(this.appService.dischageDrugDisplayTTAName_print && prescription['__medicationsummary']['supplyMedication']){
                medSum.name = prescription['__medicationsummary']['supplyMedication'];
                medSum.quantity = prescription['__medicationsummary']['requestquantity'];
              }
              else{
                medSum.name = prescription['__medicationsummary']['displayname'];
                medSum.quantity = prescription['__medicationsummary']['displayquantity'];
              }
             
              medSum.pod = '';
              medSum.prescriptionid = prescription['__medicationsummary']['prescriptionid'];
            
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
              medSum.supplyMedication = prescription['__medicationsummary']['supplyMedication'];
              dsp.medicationssummaries.push(medSum);
            
            });

            this.dischargesummaryprescription.push(dsp);
          }
        }
      });

      if(this.isControlDrug){
        let CDDSprescriptions: DischargeSummaryPrescription[] = [];

        this.dischargesummaryprescription.forEach(ds => {
          ds.medicationssummaries.forEach(ms => {
              if(ms.printingrequired){
                let controlledDrugPrescription: DischargeSummaryPrescription = new DischargeSummaryPrescription();
                controlledDrugPrescription.category = ds.category;
                controlledDrugPrescription.medicationssummaries = [];
                controlledDrugPrescription.medicationssummaries.push(ms);
                CDDSprescriptions.push(controlledDrugPrescription);
              }            
          });
          
        });
        this.dischargesummaryprescription = [];
        this.dischargesummaryprescription = CDDSprescriptions;
      }
      cb();
   });


    // this.subscriptions.add(
    //   this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummaryprescription', this.createEncounterDetailsFilter())
    //     .subscribe((response) => {
    //       if(response.length > 0)
    //       {
    //         let dp = response;

    //         dp = dp.filter(x => x.category != 'Suspended' && x.category != 'Stopped');

    //         // if(this.isControlDrug && (this.dischargeSumPrescriptionId != undefined || this.dischargeSumPrescriptionId != null || this.dischargeSumPrescriptionId != '')){
    //         //   dp = dp.filter(x => x.iscontrolleddrug == true && x.dischargesummaryprescription_id == this.dischargeSumPrescriptionId);
    //         // }

    //         if(this.isControlDrug){
    //           dp = dp.filter(x => x.printingrequired == true);
    //         }

    //         this.dischargesummaryprescription = [];

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
    //       else{
    //         this.dischargesummaryprescription = [];
    //       }
    //     })
    // )
  }

  getAllergies(cb: () => any){
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI +  "/GetBaseViewListByAttribute/terminus_personallergylist?synapseattributename=person_id&attributevalue=" + this.appService.personId + "&orderby=clinicalstatusvalue ASC, causativeagentcodesystem DESC, _sequenceid DESC")
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

  getWeight(cb:()=>any){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + "/GetBaseViewListByPost/fluidbalance_getweightobservations", this.createWeightFilter())
        .subscribe((response) => {
          if (response.length > 0) {
            if (response[0].value != "" || response[0].value != null){
              this.obsValue = response[0].value;
              this.obsDate = response[0].observationeventdatetime;
            }
            else{
              this.obsValue = null;
              this.obsDate = null;
            } 
          }
          else{
            this.obsValue = null;
            this.obsDate = null;
          }
          cb();
        })
    );
  }

  createWeightFilter() {
    let condition = "person_id = @person_id and encounter_id = @encounter_id";
    let f = new filters()
    f.filters.push(new filter(condition));

    let pm = new filterParams();
    pm.filterparams.push(new filterparam("person_id", this.appService.personId));
    pm.filterparams.push(new filterparam("encounter_id", this.appService.encounterId));

    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY observationeventdatetime desc");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    //this.appService.reset();
  }

  pdfDownloaded() {
    this.destroyComponent.emit('true');
  }
}
