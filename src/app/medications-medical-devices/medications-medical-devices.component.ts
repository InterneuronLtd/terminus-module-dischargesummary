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
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { MedicationsHelper } from '../services/MedicationHelper.service';
import { DischargeSummaryPrescription, MedicationsSummary } from '../models/entities/core-discharge-summary-prescription.model';
import { Guid } from 'guid-typescript';
import { Subscription } from 'rxjs';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { UpsertTransactionManager } from '../services/upsert-transaction-manager.service';
import { DischargePrescription } from '../models/entities/dischargesummarypresciption.model';
import { SubjectsService } from '../services/subjects.service';


@Component({
  selector: 'app-medications-medical-devices',
  templateUrl: './medications-medical-devices.component.html',
  styleUrls: ['./medications-medical-devices.component.css']
})
export class MedicationsMedicalDevicesComponent implements OnInit, OnDestroy{

  public status: boolean;

  public summary: any[] = [];

  public dischargeSummaryId: string;

  public dischargesummaryprescription: DischargeSummaryPrescription[] = [];

  public dischargePrescription: DischargePrescription[] = [];

  public frmComponent: string;

  subscriptions: Subscription = new Subscription();

  public isPrint: boolean = false;

  public isControlledDrug: boolean = false;

  public isLoading: boolean = false;

  public dischargeSummaryPrescriptionId: string;

  @Input() set notesData(data : any){
    if(data != undefined && data != null && data != ''){
      this.dischargeSummaryId = data[0].dischargesummary_id
    }
  };

  @Input() set fromComponent(data : any){
    if(data != undefined && data != null && data != ''){
      this.frmComponent = data;
    }
  };

  @Output() destroyTemplate: EventEmitter<any> = new EventEmitter();

  constructor(private apirequest:ApirequestService,public appservice:AppService, public subjects: SubjectsService) {
    this.subjects.isPrinitingCompleted.subscribe(() => {
      this.isLoading = false;
      this.isPrint = false;
      $("#pause").css({ 'bottom' : 'initial'});
      // this.destroyRecordsTemplate();
    });
  }

  ngOnInit(): void {
    // if(this.frmComponent == 'edit discharge summary'){
    //   this.insertMeds();
    // }

    // if(this.frmComponent == 'view discharge summary'){
    //   this.getMeds();
    // }

    //this.insertMeds();
    this.getMeds();
  }

  arrayLength(array) {

    if (!Array.isArray(array)) {
        return 0;
    }

    if (array.length == 0) {
        return 0;
    }

    return array.length;
  }

  // saveMeds(){
  //   for(let i = 0; i < this.dischargesummaryprescription.length; i++){
  //     for(let j = 0; j < this.dischargesummaryprescription[i].medicationssummaries.length; j++){
  //       let dsp = {
  //         dischargesummaryprescription_id: String(Guid.create()),
  //         person_id: this.appservice.personId,
  //         encounter_id: this.appservice.encounterId,
  //         dischargesummary_id: this.dischargeSummaryId,
  //         category: this.dischargesummaryprescription[i].category,
  //         dose: this.dischargesummaryprescription[i].medicationssummaries[j].dose,
	//         name: this.dischargesummaryprescription[i].medicationssummaries[j].name,
	//         quantity: this.dischargesummaryprescription[i].medicationssummaries[j].quantity,
	//         route: this.dischargesummaryprescription[i].medicationssummaries[j].route,
	//         status: this.dischargesummaryprescription[i].medicationssummaries[j].status,
	//         iscontrolleddrug: this.dischargesummaryprescription[i].medicationssummaries[j].iscontrolleddrug,
	//         comments: this.dischargesummaryprescription[i].medicationssummaries[j].comments,
	//         supplyondischarge: this.dischargesummaryprescription[i].medicationssummaries[j].supplyondischarge,
	//         quantitysupplied: this.dischargesummaryprescription[i].medicationssummaries[j].quantitysupplied,
	//         dispensedby: this.dischargesummaryprescription[i].medicationssummaries[j].dispensedby,
	//         checkedby: this.dischargesummaryprescription[i].medicationssummaries[j].checkedby,
	//         gptocontinue: this.dischargesummaryprescription[i].medicationssummaries[j].gptocontinue,
  //         pod: this.dischargesummaryprescription[i].medicationssummaries[j].pod,
	//         prescriptionid: this.dischargesummaryprescription[i].medicationssummaries[j].prescriptionid,
	//         medicationid: this.dischargesummaryprescription[i].medicationssummaries[j].medicationid,
  //         supplyrequired: this.dischargesummaryprescription[i].medicationssummaries[j].supplyrequired
  //       };

  //       this.subscriptions.add(
  //         this.apirequest.postRequest(this.appservice.baseURI + '/PostObject?synapsenamespace=core&synapseentityname=dischargesummaryprescription', dsp)
  //           .subscribe((response) => {
  //             if(response)
  //             {

  //             }
  //           })
  //         )
  //     }
  //   }

  // }

  // insertMeds(){
  //   let ms = new MedicationsHelper(this.apirequest, this.appservice, this.appservice.encounterId);

  //   var upsertManager = new UpsertTransactionManager();
  //   upsertManager.beginTran(this.appservice.baseURI, this.apirequest);

  //   this.subscriptions.add(
  //     this.apirequest.postRequest(this.appservice.baseURI + '/GetListByPost/core/dischargesummaryprescription', this.createMedsFilter())
  //       .subscribe((response) => {
  //         if(response.length > 0)
  //         {
  //           this.dischargePrescription = response;

  //           ms.GetSummary((data:[]) => {
  //             this.summary = data;

  //             this.dischargePrescription.forEach(dp => {
  //               let category = this.summary.filter(x => x['catagory'] == dp.category);

  //               category.forEach(cat =>{
  //                 if(this.arrayLength(cat['prescriptions']) > 0){
  //                   let len = this.arrayLength(cat['prescriptions']);
  //                   for(let j = 0; j < len; j++){
  //                     if(!cat['prescriptions'].some(x => x['__medicationsummary']['prescriptionid'] == dp.prescriptionid && x['__medicationsummary']['medicationid'] == dp.medicationid)){
  //                       upsertManager.addEntity('core', 'dischargesummaryprescription', { "dischargesummaryprescription_id": dp.dischargesummaryprescription_id }, "del");
  //                     }
  //                   }
  //                 }
  //                 else{
  //                   upsertManager.addEntity('core', 'dischargesummaryprescription', { "dischargesummaryprescription_id": dp.dischargesummaryprescription_id }, "del");
  //                 }
  //               })

  //             })

  //             this.summary.forEach(sum => {
  //               if(this.arrayLength(sum['prescriptions']) > 0){
  //                 let len = this.arrayLength(sum['prescriptions']);
  //                 for(let j = 0; j < len; j++){
  //                   let dp: DischargePrescription[] = [];
  //                   dp = this.dischargePrescription.filter(x => x.medicationid == sum['prescriptions'][j]['__medicationsummary']['medicationid']
  //                                                               && x.prescriptionid == sum['prescriptions'][j]['__medicationsummary']['prescriptionid']
  //                                                               && x.category == sum['catagory']);

                    
  //                   if(dp.length > 0){
  //                     upsertManager.addEntity('core', 'dischargesummaryprescription', { "dischargesummaryprescription_id": dp[0].dischargesummaryprescription_id }, "del");
  //                     //upsertManager.addEntity('core', 'dischargesummaryprescription', JSON.parse(JSON.stringify(dp[0])));
  //                   }
  //                   // else
  //                   // {
  //                     let pres = {
  //                       dischargesummaryprescription_id: String(Guid.create()),
  //                       person_id: this.appservice.personId,
  //                       encounter_id: this.appservice.encounterId,
  //                       dischargesummary_id: this.dischargeSummaryId,
  //                       category: sum['catagory'],
  //                       dose: sum['prescriptions'][j]['__medicationsummary']['displaydose'],
  //                       name: sum['prescriptions'][j]['__medicationsummary']['displayname'],
  //                       quantity: sum['prescriptions'][j]['__medicationsummary']['displayquantity'],
  //                       route: sum['prescriptions'][j]['__medicationsummary']['displayroute'],
  //                       status: sum['prescriptions'][j]['__medicationsummary']['displaystatus'],
  //                       iscontrolleddrug: sum['prescriptions'][j]['__medicationsummary']['iscontrolleddrug'],
  //                       comments: sum['prescriptions'][j]['__medicationsummary']['comments'],
  //                       supplyondischarge: '',
  //                       quantitysupplied: '',
  //                       dispensedby: '',
  //                       checkedby: '',
  //                       gptocontinue: '',
  //                       pod: '',
  //                       prescriptionid: sum['prescriptions'][j]['__medicationsummary']['prescriptionid'],
  //                       medicationid: sum['prescriptions'][j]['__medicationsummary']['medicationid'],
  //                       supplyrequired: sum['prescriptions'][j]['__medicationsummary']['supplyRequired'],
  //                       requestordermessage: sum['prescriptions'][j]['__medicationsummary']['requestOrderMessage'],
  //                       requestedquantity: sum['prescriptions'][j]['__medicationsummary']['requestedQuantity'],
  //                       requestedquantityunits: sum['prescriptions'][j]['__medicationsummary']['requestedQuantityUnits'],
  //                       supplyrequiredreason: sum['prescriptions'][j]['__medicationsummary']['supplyRequiredReason'],
  //                       printingrequired: sum['prescriptions'][j]['__medicationsummary']['printingrequired'],
  //                       protocoldose: (sum['prescriptions'][j]['__medicationsummary']['protocolDose'].length > 0 ? JSON.stringify(sum['prescriptions'][j]['__medicationsummary']['protocolDose']) : ''),
  //                       prescriptionenddate: sum['prescriptions'][j]['__posology'].find(p => p.iscurrent == true).prescriptionenddate,
  //                       protocolmessage: (sum['prescriptions'][j]['__medicationsummary']['protocolmessage'] != null) ? sum['prescriptions'][j]['__medicationsummary']['protocolmessage'] : '',
  //                       indication: sum['prescriptions'][j]['__medicationsummary']['indication']
  //                     };
  //                     upsertManager.addEntity('core', 'dischargesummaryprescription', JSON.parse(JSON.stringify(pres)));
  //                   //}
  //                 }
  //               }
  //             })
  //             upsertManager.save((resp) => {
  //               this.getMeds();
  //               upsertManager.destroy();
  //             },
  //               (error) => {
  //                 upsertManager.destroy();
  //               }
  //             );
  //           });
  //         }
  //         else
  //         {
  //           this.dischargePrescription = [];
  //           let prescriptionenddate;

  //           ms.GetSummary((data:[]) => {
  //             for(let index = 0; index < data.length; index++){
  //               if(this.arrayLength(data[index]['prescriptions']) > 0){
  //                 let len = this.arrayLength(data[index]['prescriptions']);
  //                 for(let j = 0; j < len; j++){
  //                   let posologylen = this.arrayLength(data[index]['prescriptions'][j]['__posology']);
  //                   for(let k = 0; k < posologylen; k++)
  //                   {
  //                     if(data[index]['prescriptions'][j]['__posology'][k]['iscurrent'])
  //                     {
  //                       prescriptionenddate = data[index]['prescriptions'][j]['__posology'][k]['prescriptionenddate'];
  //                     }
  //                   }
  //                   let dp = {
  //                     dischargesummaryprescription_id: String(Guid.create()),
  //                     person_id: this.appservice.personId,
  //                     encounter_id: this.appservice.encounterId,
  //                     dischargesummary_id: this.dischargeSummaryId,
  //                     category: data[index]['catagory'],
  //                     dose: data[index]['prescriptions'][j]['__medicationsummary']['displaydose'],
  //                     name: data[index]['prescriptions'][j]['__medicationsummary']['displayname'],
  //                     quantity: data[index]['prescriptions'][j]['__medicationsummary']['displayquantity'],
  //                     route: data[index]['prescriptions'][j]['__medicationsummary']['displayroute'],
  //                     status: data[index]['prescriptions'][j]['__medicationsummary']['displaystatus'],
  //                     iscontrolleddrug: data[index]['prescriptions'][j]['__medicationsummary']['iscontrolleddrug'],
  //                     comments: data[index]['prescriptions'][j]['__medicationsummary']['comments'],
  //                     supplyondischarge: '',
  //                     quantitysupplied: '',
  //                     dispensedby: '',
  //                     checkedby: '',
  //                     gptocontinue: '',
  //                     pod: '',
  //                     prescriptionid: data[index]['prescriptions'][j]['__medicationsummary']['prescriptionid'],
  //                     medicationid: data[index]['prescriptions'][j]['__medicationsummary']['medicationid'],
  //                     supplyrequired: data[index]['prescriptions'][j]['__medicationsummary']['supplyRequired'],
  //                     requestordermessage: data[index]['prescriptions'][j]['__medicationsummary']['requestOrderMessage'],
  //                     requestedquantity: data[index]['prescriptions'][j]['__medicationsummary']['requestedQuantity'],
  //                     requestedquantityunits: data[index]['prescriptions'][j]['__medicationsummary']['requestedQuantityUnits'],
  //                     supplyrequiredreason: data[index]['prescriptions'][j]['__medicationsummary']['supplyRequiredReason'],
  //                     printingrequired: data[index]['prescriptions'][j]['__medicationsummary']['printingrequired'],
  //                     protocoldose: (this.arrayLength(data[index]['prescriptions'][j]['__medicationsummary']['protocolDose']) > 0 ? JSON.stringify(data[index]['prescriptions'][j]['__medicationsummary']['protocolDose']) : ''),
  //                     prescriptionenddate: prescriptionenddate,
  //                     protocolmessage: (data[index]['prescriptions'][j]['__medicationsummary']['protocolmessage'] != null) ? data[index]['prescriptions'][j]['__medicationsummary']['protocolmessage'] : '',
  //                     indication: data[index]['prescriptions'][j]['__medicationsummary']['indication']
  //                   };
  //                   upsertManager.addEntity('core', 'dischargesummaryprescription', JSON.parse(JSON.stringify(dp)));
  //                 }
  //               }
  //               // else
  //               // {
  //               //   let dp = {
  //               //     dischargesummaryprescription_id: String(Guid.create()),
  //               //     person_id: this.appservice.personId,
  //               //     encounter_id: this.appservice.encounterId,
  //               //     dischargesummary_id: this.dischargeSummaryId,
  //               //     category: data[index]['catagory'],
  //               //     dose: null,
  //               //     name: null,
  //               //     quantity: null,
  //               //     route: null,
  //               //     status: null,
  //               //     iscontrolleddrug: null,
  //               //     comments: null,
  //               //     supplyondischarge: null,
  //               //     quantitysupplied: null,
  //               //     dispensedby: null,
  //               //     checkedby: null,
  //               //     gptocontinue: null,
  //               //     pod: null,
  //               //     prescriptionid: null,
  //               //     medicationid: null
  //               //   }
  //               //   upsertManager.addEntity('core', 'dischargesummaryprescription', JSON.parse(JSON.stringify(dp)));
  //               // }
  //             }
  //             upsertManager.save((resp) => {
  //               this.getMeds();
  //               upsertManager.destroy();
  //             },
  //               (error) => {
  //                 upsertManager.destroy();
  //               }
  //             );
  //           });
  //         }
  //       })
  //     )


  // }

  createMedsFilter()
  {
    let condition = "";
    let pm = new filterParams();
    condition = "person_id = @person_id AND encounter_id = @encounter_id";
    pm.filterparams.push(new filterparam("person_id", this.appservice.personId));
    pm.filterparams.push(new filterparam("encounter_id", this.appservice.encounterId));
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

  getMeds(){
    let ms = new MedicationsHelper(this.apirequest, this.appservice, this.appservice.encounterId);

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
            medSum.supplyMedication =  prescription['__medicationsummary']['supplyMedication'];
            dsp.medicationssummaries.push(medSum);
          });

          this.dischargesummaryprescription.push(dsp);
        }
      });
   });

    // this.subscriptions.add(
    //   this.apirequest.postRequest(this.appservice.baseURI + '/GetListByPost/core/dischargesummaryprescription', this.createMedsFilter())
    //     .subscribe((response) => {
    //       if(response.length > 0)
    //       {
    //         let dp = response;

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
    //           medSum.dischargesummaryprescription_id = dp[i].dischargesummaryprescription_id;
    //           medSum.person_id = dp[i].person_id;
    //           medSum.encounter_id = dp[i].encounter_id;
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
    //       else{
    //         this.dischargesummaryprescription = [];
    //       }
    //     })
    // )
  }

  print(isControlledDrug?: boolean, dischargeSummaryPrescriptionId?:string){
    if(isControlledDrug){
      this.isControlledDrug = true;
      if(dischargeSummaryPrescriptionId){
        this.dischargeSummaryPrescriptionId = dischargeSummaryPrescriptionId;
      }
      else{
        this.dischargeSummaryPrescriptionId = '';
      }
      this.isPrint = true;
      this.isLoading = true;
    }
    else{
      this.isControlledDrug = false;
      this.dischargeSummaryPrescriptionId = '';
      this.isPrint = true;
      this.isLoading = true;
    }
  }

  // destroyRecordsTemplate() {
  //   this.isPrint = false;
  //   this.isLoading = false;
  // }

  pdfDownloaded() {
    // this.isPrint = false;
    // this.isLoading = false;
    this.destroyTemplate.emit('true');
  }

  // refresh(){
  //   this.insertMeds();
  // }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
