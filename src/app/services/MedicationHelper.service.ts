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
import { Inject, Injectable } from '@angular/core';
import {jwtDecode} from 'jwt-decode';
import { Prescription, Medicationsummary, Posology, Dose, Medication, Medicationcodes, Medicationingredients, MetaPrescriptionstatus, MetaPrescriptionduration, MetaPrescriptionadditionalcondition, PrescriptionSource, MetaPrescriptioncontext, PrescriptionEvent, PrescriptionMedicaitonSupply, Epma_Dischargesummarry, DSMedSupplyRequiredStatus, SupplyRequest, ProtocalDose, Indication } from "src/app/models/EPMA"
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ApirequestService } from './apirequest.service';
import { AppService } from './app.service';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { PrescriptionContext, PrescriptionStatus, SummaryCatagory } from './enum';
import { isArray } from 'ngx-bootstrap/chronos';

@Injectable()
export class MedicationsHelper {

  subscriptions = new Subscription();
  arrrPescriptionMOA: Array<Prescription>;
  arrrPescriptionMOAUnchange: Array<Prescription>;
  arrrPescriptionMOAChange: Array<Prescription>;
  arrrPescriptionMOAStoped: Array<Prescription>;
  arrrPescriptionMOASuspended: Array<Prescription>;
  arrrPescriptionMOD: Array<Prescription>;
  arrrPescriptionMODUnchange: Array<Prescription>;
  arrrPescriptionMODChange: Array<Prescription>;
  arrrPescriptionMODNew: Array<Prescription>;
  dischargesummarrystatus: boolean = null;
  supplyRequests: SupplyRequest[];
  Dischargesummarry: Epma_Dischargesummarry;
  supplyRequiredStatus: DSMedSupplyRequiredStatus[];

  constructor(public apiRequest: ApirequestService, public appService: AppService, @Inject(String) public encounter_id: string) {

  }
  private getAllPrescription(cb: () => any) {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + "/GetBaseViewListByPost/epma_prescriptiondetail", this.createPrescriptionFilter())
        .subscribe((response) => {
          this.Prescription = [];
          for (let prescription of response) {
            if (prescription.correlationid) {
              prescription.__posology = JSON.parse(prescription.__posology);
              prescription.__routes = JSON.parse(prescription.__routes).sort((x, y) => y.isdefault - x.isdefault);
              prescription.__medications = JSON.parse(prescription.__medications);
              this.GeneratePrescripcriptionSummary(prescription);
              this.Prescription.push(<Prescription>prescription);
            }
          }
          cb();
        })
    )
  }

  private getCompleteStatus(cb: () => any) {
    this.Dischargesummarry = new Epma_Dischargesummarry();
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + "/GetListByAttribute?synapsenamespace=local&synapseentityname=epma_dischargesummarry&synapseattributename=encounterid&attributevalue=" + this.encounter_id)
        .subscribe((response) => {

          if (JSON.parse(response).length > 0) {
            this.Dischargesummarry = JSON.parse(response)[0];

          }
          cb();
        })
    )
  }

  GeneratePrescripcriptionSummary(prescription: Prescription) {
    let medicationsummary = new Medicationsummary()
    medicationsummary.medicationid = prescription.__medications.find(x => x.isprimary == true).medication_id
    medicationsummary.prescriptionid = prescription.prescription_id;
    medicationsummary.iscontrolleddrug = prescription.__medications.find(x => x.isprimary == true).iscontrolled
    medicationsummary.displayname = ""
    medicationsummary.comments = prescription.comments
    medicationsummary.printingrequired = prescription.printingrequired
    let ingredientName = prescription.__medications.find(x => x.isprimary).__ingredients.length > 0 ? " (" + prescription.__medications.find(x => x.isprimary).__ingredients[0].name + ")" : " (ingredient not defined)";
    medicationsummary.displayname = prescription.__medications.find(x => x.isprimary).name + ingredientName;
    let prescriptionenddate = this.GetCurrentPosology(prescription).prescriptionenddate;
    medicationsummary.prescriptionenddate = prescriptionenddate;

    if (this.GetCurrentPosology(prescription).frequency == 'protocol' || this.GetCurrentPosology(prescription).frequency == 'variable') {
      medicationsummary.protocolDose = this.GetVariableProtocalDose(prescription);
      medicationsummary.protocolmessage = this.getProtocolMessage(prescription);
    }


    //console.log('__protocolDose',medicationsummary.protocolDose);

    //map supplyrequired status and reason
    let ds = this.supplyRequiredStatus.find(ds => ds.prescription_id == prescription.prescription_id);
    if (ds) {
      medicationsummary.supplyRequired = ds.status;
      medicationsummary.supplyRequiredReason = ds.reason + ' - ' + ((ds.otherreason != undefined || ds.otherreason != null || ds.otherreason != '' )? ds.otherreason : '');
      // if ((medicationsummary.supplyRequiredReason ?? "").toLowerCase().includes("not required")) {
      //   medicationsummary.supplyRequiredReason = ds.otherreason;
      // }
    }
    //map supplyrequest requested quantity and units
    //get the latest supplyrequest for the prescription (supplyRequests is a sorted array so latest one will be at the top)

    let supplyObject = this.supplyRequests.find(s => s.prescription_id == prescription.prescription_id);
    if (supplyObject) {
      medicationsummary.supplyMedication = supplyObject.selectedproductname;
      medicationsummary.requestedQuantity = supplyObject.requestquantity;
      medicationsummary.requestedQuantityUnits = supplyObject.requestedquantityunits;
      medicationsummary.requestOrderMessage = supplyObject.ordermessage;
    }

    medicationsummary.displaydose = this.getDoseName(prescription);
    medicationsummary.displayroute = prescription.__routes.sort((x, y) => Number(y.isdefault) - Number(x.isdefault)).map(m => m.route).join(",")

    medicationsummary.requestquantity = "TOTAL QUANTITY : "
    if (this.appService.dischageDrugDisplayTTAName_print && supplyObject) {
      if (this.GetCurrentPosology(prescription).totalquantity) {
        medicationsummary.requestquantity = medicationsummary.requestquantity + " " + supplyObject.requestquantity + " (" + this.numberToEnglish(supplyObject.requestquantity) + ")"
        if (this.GetCurrentPosology(prescription).dosetype == 'units') {
          medicationsummary.requestquantity = medicationsummary.requestquantity + " " + this.GetCurrentPosology(prescription).__dose[0].doseunit
        }
        if (this.GetCurrentPosology(prescription).dosetype == 'strength') {
          medicationsummary.requestquantity = medicationsummary.requestquantity + " " + this.GetCurrentPosology(prescription).__dose[0].strengthdenominatorunit
        }
      }
    }
    medicationsummary.displayquantity = "TOTAL QUANTITY : "
      if (this.GetCurrentPosology(prescription).totalquantity) {
        medicationsummary.displayquantity = medicationsummary.displayquantity + " " + this.GetCurrentPosology(prescription).totalquantity + " (" + this.numberToEnglish(this.GetCurrentPosology(prescription).totalquantity) + ")"
        if (this.GetCurrentPosology(prescription).dosetype == 'units') {
          let doseunit= this.GetCurrentPosology(prescription).totalquantity > 1 ? this.GetCurrentPosology(prescription).__dose[0].doseunit +"(s)": this.GetCurrentPosology(prescription).__dose[0].doseunit 
          medicationsummary.displayquantity = medicationsummary.displayquantity + " " + doseunit;
        }
        if (this.GetCurrentPosology(prescription).dosetype == 'strength') {
          medicationsummary.displayquantity = medicationsummary.displayquantity + " " + this.GetCurrentPosology(prescription).__dose[0].strengthdenominatorunit
        }
      }
  
    if (this.GetCurrentPosology(prescription).totalquantitytext) {
      medicationsummary.displayquantity = medicationsummary.displayquantity + " " + this.GetCurrentPosology(prescription).totalquantitytext
    }
    medicationsummary.displaystatus = null;
    medicationsummary.indication = this.GetIndication(prescription);
    prescription.__medicationsummary = medicationsummary;

  }

  numberToEnglish(n, custom_join_character?) {

    var string = n.toString(),
      units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words;

    var and = custom_join_character || '';

    /* Is number zero? */
    if (parseInt(string) === 0) {
      return 'zero';
    }

    /* Array of units as words */
    units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

    /* Array of tens as words */
    tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    /* Array of scales as words */
    scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while (start > 0) {
      end = start;
      chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if (chunksLen > scales.length) {
      return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for (i = 0; i < chunksLen; i++) {

      chunk = parseInt(chunks[i]);

      if (chunk) {

        /* Split chunk into array of individual integers */
        ints = chunks[i].split('').reverse().map(parseFloat);

        /* If tens integer is 1, i.e. 10, then add 10 to units integer */
        if (ints[1] === 1) {
          ints[0] += 10;
        }

        /* Add scale word if chunk is not zero and array item exists */
        if ((word = scales[i])) {
          words.push(word);
        }

        /* Add unit word if array item exists */
        if ((word = units[ints[0]])) {
          words.push(word);
        }

        /* Add tens word if array item exists */
        if ((word = tens[ints[1]])) {
          words.push(word);
        }

        /* Add 'and' string after units or tens integer if: */
        if (ints[0] || ints[1]) {

          /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
          if (ints[2] || !i && chunksLen) {
            words.push(and);
          }

        }

        /* Add hundreds word if array item exists */
        if ((word = units[ints[2]])) {
          words.push(word + ' hundred');
        }

      }

    }

    return words.reverse().join(' ').trim();

  }

  getDoseName(prescription: Prescription) {
    let DoseName = "";
    if (this.GetCurrentPosology(prescription).dosetype == "units") {
      if (this.GetCurrentPosology(prescription).frequency == '' || this.GetCurrentPosology(prescription).frequency == 'x' || this.GetCurrentPosology(prescription).frequency == 'h' || this.GetCurrentPosology(prescription).frequency == 'm' || this.GetCurrentPosology(prescription).frequency == 'stat' || this.GetCurrentPosology(prescription).frequency == 'mor' || this.GetCurrentPosology(prescription).frequency == 'mid' || this.GetCurrentPosology(prescription).frequency == 'eve' || this.GetCurrentPosology(prescription).frequency == 'night') {
        if (this.GetCurrentPosology(prescription).__dose.length > 0 && !this.GetCurrentPosology(prescription).__dose[0].dosestrength) {
          if (this.GetCurrentPosology(prescription).__dose[0].dosesize == null) {
            DoseName = "dose not defined";
          }
          else {
            DoseName = DoseName + this.GetCurrentPosology(prescription).__dose[0].dosesize + " " + this.GetCurrentPosology(prescription).__dose[0].doseunit
          }
          if (this.GetCurrentPosology(prescription).__dose[0].dosesizerangemax) {
            DoseName = DoseName + "-" + this.GetCurrentPosology(prescription).__dose[0].dosesizerangemax + " " + this.GetCurrentPosology(prescription).__dose[0].doseunit
          }
        }
        if (this.GetCurrentPosology(prescription).__dose.length > 0 && this.GetCurrentPosology(prescription).__dose[0].dosestrength) {
          DoseName = DoseName + this.GetCurrentPosology(prescription).__dose[0].dosestrength + " " + this.GetCurrentPosology(prescription).__dose[0].dosestrengthunits
          if (this.GetCurrentPosology(prescription).__dose[0].dosesizerangemax) {
            DoseName = DoseName + "-" + this.GetCurrentPosology(prescription).__dose[0].dosestrengthrangemax + " " + this.GetCurrentPosology(prescription).__dose[0].dosestrengthunits
          }
        }

      }
      if (this.GetCurrentPosology(prescription).frequency == "variable") {
        DoseName = DoseName + " Variable"
      }
      if (this.GetCurrentPosology(prescription).frequency == "protocol") {
        DoseName = DoseName + " Protocol"
      }
    }
    if (this.GetCurrentPosology(prescription).dosetype == "strength") {
      if (this.GetCurrentPosology(prescription).frequency == '' || this.GetCurrentPosology(prescription).frequency == 'x' || this.GetCurrentPosology(prescription).frequency == 'h' || this.GetCurrentPosology(prescription).frequency == 'm' || this.GetCurrentPosology(prescription).frequency == 'stat' || this.GetCurrentPosology(prescription).frequency == 'mor' || this.GetCurrentPosology(prescription).frequency == 'mid' || this.GetCurrentPosology(prescription).frequency == 'eve' || this.GetCurrentPosology(prescription).frequency == 'night') {
        if (this.GetCurrentPosology(prescription).__dose.length > 0) {
          DoseName = DoseName + this.GetCurrentPosology(prescription).__dose[0].strengthneumerator + " " + this.GetCurrentPosology(prescription).__dose[0].strengthneumeratorunit
          DoseName = DoseName + "/" + this.GetCurrentPosology(prescription).__dose[0].strengthdenominator + " " + this.GetCurrentPosology(prescription).__dose[0].strengthdenominatorunit
        }
        if (this.GetCurrentPosology(prescription).__dose.length > 0 && this.GetCurrentPosology(prescription).__dose[0].dosestrength) {
          DoseName = DoseName + this.GetCurrentPosology(prescription).__dose[0].dosestrength + " " + this.GetCurrentPosology(prescription).__dose[0].dosestrengthunits
          if (this.GetCurrentPosology(prescription).__dose[0].dosesizerangemax) {
            DoseName = DoseName + "-" + this.GetCurrentPosology(prescription).__dose[0].dosestrengthrangemax + " " + this.GetCurrentPosology(prescription).__dose[0].dosestrengthunits
          }
        }

      }
      if (this.GetCurrentPosology(prescription).frequency == "variable") {
        DoseName = DoseName + " Variable"
      }
      if (this.GetCurrentPosology(prescription).frequency == "protocol") {
        DoseName = DoseName + " Protocol"
      }
    }

    if (this.GetCurrentPosology(prescription).dosetype == "descriptive") {
      if (this.GetCurrentPosology(prescription).__dose.length > 0) {
        DoseName = DoseName + this.GetCurrentPosology(prescription).__dose[0].descriptivedose
      }
    }

    if (this.GetCurrentPosology(prescription).frequency == "mor") {
      DoseName = DoseName + " - Morning"
    }
    if (this.GetCurrentPosology(prescription).frequency == "mid") {
      DoseName = DoseName + " - Noon"
    }
    if (this.GetCurrentPosology(prescription).frequency == "eve") {
      DoseName = DoseName + " - Evening"
    }
    if (this.GetCurrentPosology(prescription).frequency == "night") {
      DoseName = DoseName + " - Night"
    }
    if (this.GetCurrentPosology(prescription).frequency == "stat") {
      DoseName = DoseName + " - Stat. dose"
    }
    if (this.GetCurrentPosology(prescription).frequency == "x") {
      DoseName = DoseName + " - " + this.GetCurrentPosology(prescription).frequencysize + " " + "time(s) per day"
    }
    if (this.GetCurrentPosology(prescription).frequency == "h") {
      DoseName = DoseName + " - Every " + this.GetCurrentPosology(prescription).frequencysize + " " + "hour(s)"
    }
    if (this.GetCurrentPosology(prescription).frequency == "m") {
      DoseName = DoseName + " - Every " + this.GetCurrentPosology(prescription).frequencysize + " " + "min(s)"
    }

    if (this.GetCurrentPosology(prescription).daysofweek && this.GetCurrentPosology(prescription).daysofweek.length > 2) {
      DoseName = DoseName + " " + JSON.parse(this.GetCurrentPosology(prescription).daysofweek).join(", ")
    }
    if (this.GetCurrentPosology(prescription).dosingdaysfrequencysize && this.GetCurrentPosology(prescription).dosingdaysfrequencysize > 0) {
      DoseName = DoseName + " - Every " + this.GetCurrentPosology(prescription).dosingdaysfrequencysize + "" +
        this.GetCurrentPosology(prescription).dosingdaysfrequency
    }
    var condition = this.MetaPrescriptionadditionalcondition.find(x => x.prescriptionadditionalconditions_id == prescription.prescriptionadditionalconditions_id);

    if (condition) {
      DoseName = DoseName + " " + this.MetaPrescriptionadditionalcondition.find(x => x.prescriptionadditionalconditions_id == prescription.prescriptionadditionalconditions_id).additionalcondition;
    }

    if (this.GetCurrentPosology(prescription).doctorsorder) {
      DoseName = DoseName + " - Prescriber to confirm"
    }

    if (this.GetCurrentPosology(prescription).prn) {
      DoseName = DoseName + " - When needed"
      let prnmaxdosestring = this.GetCurrentPosology(prescription).prnmaxdose;
      if (prnmaxdosestring) {
        DoseName = DoseName + "(Max " + this.appService.GetPRNMaxDoseDisplayString(prnmaxdosestring) + " per day)";
        // DoseName = DoseName + "(Max" + this.GetCurrentPosology(prescription).maxnumofdosesperday + " " + this.GetCurrentPosology(prescription).__dose[0].doseunit + " per day)"
      }
    }

    return DoseName;
  }
  GetDischargeSummaryMessage(prescription: Prescription, sumstatus: any) {
    // discharge summary comment
    let dischargeSummaryComment = "";
    let dischargeSummarystatus = "";

    let prescription_stop_statusid = this.MetaPrescriptionstatus.find(x => x.status == PrescriptionStatus.stopped || x.status == PrescriptionStatus.cancelled).prescriptionstatus_id;
    let prescription_cancel_statusid = this.MetaPrescriptionstatus.find(x => x.status == PrescriptionStatus.cancelled).prescriptionstatus_id;
    let prescription_suspend_statusid = this.MetaPrescriptionstatus.find(x => x.status == PrescriptionStatus.suspended).prescriptionstatus_id;
    let primaryMedication = prescription.__medications.find(x => x.isprimary)
    let allPrescription = this.Prescription.filter(x => x.__medications.find(x => x.isprimary).__codes[0].code == primaryMedication.__codes[0].code && x.prescriptioncontext_id != this.MetaPrescriptioncontext.find(y => y.context == PrescriptionContext.Discharge).prescriptioncontext_id);
    if (sumstatus == PrescriptionStatus.stopped) {
      let allStop = allPrescription.filter(x => x.prescriptionstatus_id == prescription_stop_statusid || x.prescriptionstatus_id == prescription_cancel_statusid).slice().sort((b, a) => (moment(a.lastmodifiedon) > moment(b.lastmodifiedon)) ? 1 : ((moment(b.lastmodifiedon) > moment(a.lastmodifiedon)) ? -1 : 0));
      if (allStop && allStop.length > 0) {
        let comment = this.prescriptionEvent.find(e => e.prescriptionid == allStop[0].prescription_id);
        if (comment) {
          dischargeSummaryComment = comment.comments;
          dischargeSummarystatus = PrescriptionStatus.stopped;
        }
      }
    }
    if (sumstatus == PrescriptionStatus.suspended) {
      let addedToChart = allPrescription.filter(x => x.prescriptioncontext_id == this.MetaPrescriptioncontext.find(y => y.context == PrescriptionContext.Inpatient).prescriptioncontext_id).slice().sort((b, a) => (moment(a.lastmodifiedon) > moment(b.lastmodifiedon)) ? 1 : ((moment(b.lastmodifiedon) > moment(a.lastmodifiedon)) ? -1 : 0));;
      if (addedToChart && addedToChart.length == 0)// this drug was not added to drug chart as inpatient medication
      {
        dischargeSummaryComment = "Medicine suspended on admission";
        dischargeSummarystatus = PrescriptionStatus.suspended;
      }
      else {
        let allActive = allPrescription.filter(x => x.prescriptioncontext_id == this.MetaPrescriptioncontext.find(y => y.context == PrescriptionContext.Inpatient).prescriptioncontext_id && x.prescriptionstatus_id != prescription_suspend_statusid && x.prescriptionstatus_id != prescription_stop_statusid && x.prescriptionstatus_id != prescription_cancel_statusid).slice().sort((b, a) => (moment(a.lastmodifiedon) > moment(b.lastmodifiedon)) ? 1 : ((moment(b.lastmodifiedon) > moment(a.lastmodifiedon)) ? -1 : 0));;
        if (allActive && allActive.length > 0) // added to drug chart as inpatient medicaiton but, not to discharge prescription
        {
          dischargeSummaryComment = "Medicine suspended on discharge";
          dischargeSummarystatus = PrescriptionStatus.suspended;
        } else {
          let allSuspend = allPrescription.filter(x => x.prescriptionstatus_id == prescription_suspend_statusid).slice().sort((b, a) => (moment(a.lastmodifiedon) > moment(b.lastmodifiedon)) ? 1 : ((moment(b.lastmodifiedon) > moment(a.lastmodifiedon)) ? -1 : 0));;
          if (allSuspend && allSuspend.length > 0) // added to drug chart and manually suspended
          {
            let comment = this.prescriptionEvent.find(e => e.prescriptionid == allSuspend[0].prescription_id);
            if (comment) {
              dischargeSummaryComment = comment.comments;
              dischargeSummarystatus = PrescriptionStatus.suspended;
            }
          }
        }
      }
    }

    return "(" + dischargeSummarystatus + "): " + dischargeSummaryComment;

  }

  private getDSMedSupplyRequest(cb: () => any) {

    this.subscriptions.add(this.apiRequest.getRequest(this.appService.baseURI + "/GetListByAttribute?synapsenamespace=local&synapseentityname=epma_dsmedsupplyrequiredstatus&synapseattributename=encounter_id&attributevalue=" + this.encounter_id).subscribe(
      (response) => {
        this.supplyRequiredStatus = JSON.parse(response);
        cb();
      }
    ));
  }
  private getAllPrescriptionMeta(cb: () => any) {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.baseURI + "/GetBaseViewList/epma_prescriptionmeta")
        .subscribe((response) => {

          this.MetaPrescriptionstatus = [];
          this.MetaPrescriptionDuration = [];
          this.MetaPrescriptionadditionalcondition = [];
          this.MetaPrescriptionSource = [];
          this.MetaPrescriptioncontext = [];

          for (let meta of JSON.parse(response)) {
            switch (meta.field) {

              case "prescriptionstatus": this.MetaPrescriptionstatus = JSON.parse(meta.data);
                break;
              case "prescriptionduration": this.MetaPrescriptionDuration = JSON.parse(meta.data);
                break;
              case "prescriptionadditionalconditions": this.MetaPrescriptionadditionalcondition = JSON.parse(meta.data);
                break;
              case "prescriptionsource": this.MetaPrescriptionSource = JSON.parse(meta.data);
                break;
              case "prescriptioncontext": this.MetaPrescriptioncontext = JSON.parse(meta.data);

            }
          }
          cb();
        })
    )
  }


  private createPrescriptionFilter() {
    let condition = "encounter_id = @encounter_id";
    let f = new filters()
    f.filters.push(new filter(condition));

    let pm = new filterParams();

    pm.filterparams.push(new filterparam("encounter_id", this.encounter_id));

    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY prescription_id desc");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }

  ngOnDestroy(): void {
    this.arrrPescriptionMOA = null;
    this.arrrPescriptionMOAUnchange = null;
    this.arrrPescriptionMOAChange = null;
    this.arrrPescriptionMOAStoped = null;
    this.arrrPescriptionMOASuspended = null;
    this.arrrPescriptionMOD = null;
    this.arrrPescriptionMODUnchange = null;
    this.arrrPescriptionMODChange = null;
    this.arrrPescriptionMODNew = null;
    this.dischargesummarrystatus = null;
    this.subscriptions.unsubscribe();
    this.reset();
  }


  public MetaPrescriptionstatus: Array<MetaPrescriptionstatus>;

  public MetaPrescriptioncontext: Array<MetaPrescriptioncontext>;
  public Prescription: Array<Prescription>;

  public MetaPrescriptionDuration: Array<MetaPrescriptionduration>;



  public MetaPrescriptionadditionalcondition: Array<MetaPrescriptionadditionalcondition>;


  public MetaPrescriptionSource: Array<PrescriptionSource>;







  public prescriptionEvent: Array<PrescriptionEvent> = [];
  public PrescriptionMedicaitonSupply: Array<PrescriptionMedicaitonSupply> = [];

  reset(): void {

    if (this.Prescription)
      this.Prescription.forEach(p => {
        p.__posology.forEach(pos => {
          pos.__dose = null;
          pos = null;
        });

        p.__medications.forEach(m => {
          m.__codes.forEach(c => {
            c = null;
          });
          m.__ingredients.forEach(i => {
            i = null;
          });
          m = null;
        });
        p.__medications = null;
        p.__routes.forEach(r => {
          r = null
        });
        p.__routes = null;
        p.__editingprescription = null;
        p.__editingreviewstatus = null;
        p.__initialreminder = null;

      });

    this.MetaPrescriptionstatus = [];

    this.Prescription = [];


    this.MetaPrescriptionDuration = [];
    // this.Medicationcodes = [];

    this.MetaPrescriptionadditionalcondition = [];

    this.MetaPrescriptionSource = [];


    this.prescriptionEvent = [];

    this.PrescriptionMedicaitonSupply = [];
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


  logToConsole(msg: any) {

  }




  GetCurrentPosology(p: Prescription, pos_id: string = null) {
    if (pos_id) {
      return p.__posology.find(p => p.posology_id == pos_id);
    }
    else
      return p.__posology.find(p => p.iscurrent == true);
  }


  private generatePrescriptionobjects() {

    this.arrrPescriptionMOAChange = []
    this.arrrPescriptionMODChange = []
    this.arrrPescriptionMOAUnchange = []
    this.arrrPescriptionMODUnchange = []
    this.arrrPescriptionMOAStoped = []
    this.arrrPescriptionMOASuspended = []
    this.arrrPescriptionMODNew = [];
    let arrModAllReadyMatch = [];

    this.arrrPescriptionMOA = this.Prescription.filter(x => x.prescriptioncontext_id == this.MetaPrescriptioncontext.find(y => y.context == PrescriptionContext.Admission).prescriptioncontext_id);
    this.arrrPescriptionMOD = this.Prescription.filter(x => x.prescriptioncontext_id == this.MetaPrescriptioncontext.find(y => y.context == PrescriptionContext.Discharge).prescriptioncontext_id);
    this.arrrPescriptionMOA.sort((a, b) => (a.__medications.find(x => x.isprimary).name > b.__medications.find(x => x.isprimary).name) ? 1 : ((b.__medications.find(x => x.isprimary).name > a.__medications.find(x => x.isprimary).name) ? -1 : 0));
    this.arrrPescriptionMOD.sort((a, b) => (a.__medications.find(x => x.isprimary).name > b.__medications.find(x => x.isprimary).name) ? 1 : ((b.__medications.find(x => x.isprimary).name > a.__medications.find(x => x.isprimary).name) ? -1 : 0));
    for (let prescription of this.arrrPescriptionMOA) {
      //Match MOA MOD
      let formularycode = prescription.__medications.find(x => x.isprimary).__codes.find(y => y.terminology == "formulary").code;
      let MODmatched = this.arrrPescriptionMOD.filter(x => x.__medications.find(y => y.isprimary == true).__codes.find(z => z.terminology == "formulary" && z.code == formularycode))

      //Match MOA ANd Active Appservice Prescrip

      for (let match of arrModAllReadyMatch) {
        MODmatched = MODmatched.filter(x => x.prescription_id != match.prescription_id)
      }

      if (MODmatched.length == 1) {


        if (this.CheckPrescriptionChange(prescription, MODmatched[0])) {
          this.arrrPescriptionMOAChange.push(prescription);
          this.arrrPescriptionMODChange.push(MODmatched[0]);
          arrModAllReadyMatch.push(MODmatched[0])
        }
        else {
          this.arrrPescriptionMOAUnchange.push(prescription);
          this.arrrPescriptionMODUnchange.push(MODmatched[0]);
          arrModAllReadyMatch.push(MODmatched[0])
        }
      }
      else if (MODmatched.length > 1) {
        let foundModsame = false;
        for (let prescriptionobject of MODmatched) {
          if (!this.CheckPrescriptionChange(prescription, prescriptionobject)) {
            // mod it will be added to new at 211 line
            foundModsame = true;
            arrModAllReadyMatch.push(prescriptionobject)
            this.arrrPescriptionMOAUnchange.push(prescription);
            this.arrrPescriptionMODUnchange.push(prescriptionobject);
            break;
          }
        }

        ////

        if (foundModsame == false) {
          arrModAllReadyMatch.push(MODmatched[0])
          this.arrrPescriptionMOAChange.push(prescription);
          this.arrrPescriptionMODChange.push(MODmatched[0]);
        }

        ///
      }
      else {

        this.checkIfStoporsespend(prescription);
      }
    }

    for (let prescription of this.arrrPescriptionMOD) {
      if (!(this.arrrPescriptionMODChange.find(x => x.prescription_id == prescription.prescription_id) || this.arrrPescriptionMODUnchange.find(x => x.prescription_id == prescription.prescription_id)))
        this.arrrPescriptionMODNew.push(prescription);
    }

    let ms = Array<MedicationSummary>()
    let uc = new MedicationSummary();
    uc.catagory = SummaryCatagory.Unchanged;
    uc.prescriptions = this.arrrPescriptionMODUnchange
    ms.push(uc);

    let ch = new MedicationSummary();
    ch.catagory = SummaryCatagory.Changed;
    ch.prescriptions = this.arrrPescriptionMODChange
    ms.push(ch);

    let st = new MedicationSummary();
    st.catagory = SummaryCatagory.Stopped;
    st.prescriptions = this.arrrPescriptionMOAStoped
    ms.push(st);

    let sp = new MedicationSummary();
    sp.catagory = SummaryCatagory.Suspended;
    sp.prescriptions = this.arrrPescriptionMOASuspended
    ms.push(sp);

    let nw = new MedicationSummary();
    nw.catagory = SummaryCatagory.New
    nw.prescriptions = this.arrrPescriptionMODNew
    ms.push(nw);

    return ms;
  }

  private checkIfStoporsespend(prescription: Prescription) {
    let formularycode = prescription.__medications.find(x => x.isprimary).__codes.find(y => y.terminology == "formulary").code;
    let Activematched = this.Prescription.filter(x => x.prescription_id != prescription.prescription_id &&
      x.__medications.find(y => y.__codes.find(z => z.terminology == "formulary" && z.code == formularycode)));
    if (Activematched.length == 0) {
      if (prescription.prescriptionstatus_id == this.MetaPrescriptionstatus.find(x => x.status == PrescriptionStatus.stopped).prescriptionstatus_id) {
        prescription.__medicationsummary.displaystatus = this.GetDischargeSummaryMessage(prescription, PrescriptionStatus.stopped)
        this.arrrPescriptionMOAStoped.push(prescription);
      }
      else {
        prescription.__medicationsummary.displaystatus = this.GetDischargeSummaryMessage(prescription, PrescriptionStatus.suspended)
        this.arrrPescriptionMOASuspended.push(prescription);
      }

    }
    else if (Activematched.length > 0) {
      let IsPrescriptionContinued = false
      for (let prescriptionobj of Activematched) {
        if (prescriptionobj.prescriptionstatus_id == this.MetaPrescriptionstatus.find(x => x.status == PrescriptionStatus.cancelled).prescriptionstatus_id) {
          continue;
        }
        if (prescriptionobj.prescriptionstatus_id != this.MetaPrescriptionstatus.find(x => x.status == PrescriptionStatus.stopped).prescriptionstatus_id) {
          IsPrescriptionContinued = true;
        }
      }
      if (!IsPrescriptionContinued) {
        prescription.__medicationsummary.displaystatus = this.GetDischargeSummaryMessage(prescription, PrescriptionStatus.stopped)
        this.arrrPescriptionMOAStoped.push(prescription);
      }
      else {
        prescription.__medicationsummary.displaystatus = this.GetDischargeSummaryMessage(prescription, PrescriptionStatus.suspended)
        this.arrrPescriptionMOASuspended.push(prescription);
      }

    }

  }
  private CheckPrescriptionChange(MOA: Prescription, MOD: Prescription) {

    if (MOA.__posology[0].prn != MOD.__posology[0].prn) {
      return true;
    }



    if (MOA.__routes.length != MOD.__routes.length) {
      return true;

    }
    else {
      if (MOA.__routes && MOA.__routes.length != 0 && MOA.__routes.find(x => x.isdefault == true).route != MOD.__routes.find(x => x.isdefault == true).route) {
        return true;
      }
    }

    for (let rout of MOA.__routes) {
      if (!MOD.__routes.find(x => x.route == rout.route)) {
        return true;
      }
    }

    if (MOA.__posology[0].frequency != MOD.__posology[0].frequency) {
      return true;
    }

    if (MOA.__posology[0].frequencysize != MOD.__posology[0].frequencysize) {
      return true;
    }
    if (MOA.__posology[0].__dose.length != MOD.__posology[0].__dose.length) {
      return true;
    }
    let i = 0;
    for (let dose of MOA.__posology[0].__dose) {

      if (dose.dosesize != MOD.__posology[0].__dose[i].dosesize) {
        return true;
      }
      if (dose.strengthneumerator != MOD.__posology[0].__dose[i].strengthneumerator) {
        return true;
      }
      if (dose.strengthdenominator != MOD.__posology[0].__dose[i].strengthdenominator) {
        return true;
      }

      i++;
    }

    if (MOA.__posology[0].daysofweek != MOD.__posology[0].daysofweek) {
      return true;
    }

    if (MOA.prescriptionadditionalconditions_id != MOD.prescriptionadditionalconditions_id) {
      return true;
    }

    return false;
  }

  GetSummary(cb: (data) => any) {
    this.getAllPrescriptionMeta(() => {
      this.getDSMedSupplyRequest(() => {
        this.getSupplyRequestDetails(() => {
          this.getAllPrescription(() => {
            let retdata = this.generatePrescriptionobjects();
            cb(retdata);
            // console.log("discharge prescriptions:")
            // console.log(retdata)
          })
        })
      })
    });
    //console.log("Exit");


  }

  GetSummarystatus(cb: (data) => any, refreshStatus = false) {
    if (refreshStatus || this.dischargesummarrystatus == null) {
      this.getCompleteStatus(() => {

        cb(this.Dischargesummarry.iscomplete);

      });

    }
    else {
      cb(this.Dischargesummarry.iscomplete);
    }
  }

  getSupplyRequestDetails(cb: Function): void {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI +
        "/GetListByPost?synapsenamespace=local&synapseentityname=epma_supplyrequest",
        this.createSupplyRequestFilter())
        .subscribe((response: SupplyRequest[]) => {
          this.supplyRequests = response;
          if (this.supplyRequests.length > 0) {
            this.supplyRequests.sort((a, b) => new Date(b.requestedon).getTime() - new Date(a.requestedon).getTime());
          }
          cb();
        }))
  }

  private createSupplyRequestFilter() {
    let condition = "encounterid = @encounter_id";
    let f = new filters()
    f.filters.push(new filter(condition));

    let pm = new filterParams();
    pm.filterparams.push(new filterparam("encounter_id", this.encounter_id));

    let select = new selectstatement("SELECT *");

    let orderby = new orderbystatement("ORDER BY lastmodifiedon DESC");

    let body = [];
    body.push(f);
    body.push(pm);
    body.push(select);
    body.push(orderby);

    return JSON.stringify(body);
  }


  GetVariableProtocalDose(prescription: Prescription) {
    let protocalDose: ProtocalDose[] = [];
    let currentPosology = this.GetCurrentPosology(prescription);
    let doseList = currentPosology.__dose;
    doseList.forEach((dose, index) => {
      let d: ProtocalDose = new ProtocalDose();
      if (doseList.indexOf(dose) == 0 || moment(dose.dosestartdatetime).format('YYYYMMDD') != moment(doseList[index - 1].dosestartdatetime).format('YYYYMMDD')) {
        d.isShowDate = true;
      }
      else {
        d.isShowDate = false;
      }
      if (currentPosology.dosetype == 'units') {
        if (currentPosology.infusiontypeid) {
          d.date = dose.dosestartdatetime;
          d.text = dose.infusionrate + ' ' + currentPosology.infusionrateunits;
          protocalDose.push(d)
        }
        if (!currentPosology.infusiontypeid && dose.dosesize) {
          d.date = dose.dosestartdatetime;
          d.text = dose.dosesize + ((dose.dosesizerangemax) ? '-' + dose.dosesizerangemax : '') + dose.doseunit;
          protocalDose.push(d)
        }
      }
      if (currentPosology.dosetype == 'strength') {
        if (currentPosology.infusiontypeid) {
          d.date = dose.dosestartdatetime;
          d.text = dose.infusionrate + ' ' + ((currentPosology.infusionrateunits) ? currentPosology.infusionrateunits : 'ml/h');
          protocalDose.push(d)
        }
        if (!currentPosology.infusiontypeid && dose.strengthneumerator) {
          d.date = dose.dosestartdatetime;
          if (!(currentPosology.frequency == 'protocol' && !dose.strengthdenominator && !dose.strengthneumerator)) {
            d.text = dose.strengthneumerator + dose.strengthneumeratorunit + '/' + dose.strengthdenominator + dose.strengthdenominatorunit;
          }
          protocalDose.push(d)
        }
      }
      if (currentPosology.dosetype == 'descriptive') {
        d.date = dose.dosestartdatetime;
        d.text = dose.descriptivedose;
        protocalDose.push(d)
      }
    });
    return protocalDose;
  }

  getProtocolMessage(prescription: Prescription) {
    let posology = this.GetCurrentPosology(prescription);
    if (posology.repeatlastday == true && posology.repeatlastdayuntil == null) {
      return "Last day of the protocol repeated until cancelled";
    }
    else if (posology.repeatlastday == true && posology.repeatlastdayuntil != null) {
      return "Last day of the protocol repeated until the " + moment(posology.repeatlastdayuntil).format("Do MMM YYYY");
    }
    else if (+posology.repeatprotocoltimes > 0) {
      return "Repeated " + posology.repeatprotocoltimes + " time(s) until the " + (posology.prescriptionenddate == null ? "cancelled" : moment(posology.prescriptionenddate).format("Do MMM YYYY"));
    }
    else {
      return null;
    }
  }

  GetIndication(p: Prescription) {
    if (p.indication && p.indication.indexOf("indication") != -1 && p.indication.indexOf("code") != -1) {
      let ind = <Indication>JSON.parse(p.indication);
      if (ind.code == "other")
        return ind.indication + " - " + p.otherindications;
      else
        return ind.indication;
    }
    else
      return p.indication
  }

}
export class MedicationSummary {

  prescriptions: Array<Prescription>;
  catagory: string;
  constructor() {
    this.prescriptions = []
  }
}

