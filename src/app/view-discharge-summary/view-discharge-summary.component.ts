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
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { DischargePrescription } from '../models/entities/dischargesummarypresciption.model';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { DischargeSummaryPrescription, MedicationsSummary } from '../models/entities/core-discharge-summary-prescription.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MedicationsHelper } from '../services/MedicationHelper.service';
import { UpsertTransactionManager } from '../services/upsert-transaction-manager.service';
import { Guid } from 'guid-typescript';


@Component({
  selector: 'app-view-discharge-summary',
  templateUrl: './view-discharge-summary.component.html',
  styleUrls: ['./view-discharge-summary.component.css']
})
export class ViewDischargeSummaryComponent implements OnInit, OnDestroy {

public patientName: string;
public preferredName: string;
public dob: string;
public gender: string;
public nhsNumber: string;
public hospitalNumber: string;
public address: string;
public email: string;
public personalNumber: string;
public individualRequirements: string;
public risksToSelf: string;
public risksToOthers: string;
public risksFromOthers: string;

public admitdatetime: string;
public consultant: string;
public specialty: string;
public dischargedatetime: string;
public clinicalSummaryNotes: string;
public investigationResultNotes: string;
public pharmacyNotes: string;
public dischargePlanNotes: string;
public socialWorkerDetails: string;
public isExpectedDateOfDischarge: boolean;

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

public clinicianDeclarationCompleteBy: string;
public pharmacyDeclarationCompleteBy: string;
public dischargeDeclarationCompleteBy: string;
public clinicianDeclarationCompleteDate: string;
public pharmacyDeclarationCompleteDate: string;
public dischargeDeclarationCompleteDate: string;
public dischargeSummaryCompleted: boolean;

public selectedView: string;

public viewDischargeSummary: string = 'view discharge summary';

diagnosisList: any = [];
procedureList: any = [];
allergyIntoleranceList: any [];

personData: any;
notesData: any;

public dischargesummaryprescription: DischargeSummaryPrescription[] = [];

public dischargePrescription: DischargePrescription[] = [];

public isPrint: boolean = false;

public isControlledDrug: boolean = false;

public isLoading: boolean = false;

public dischargeSummaryPrescriptionId: string;

public summary: any[] = [];

public dischargeSummaryId: string;

subscriptions: Subscription = new Subscription();

isPatientDischarged: boolean = true;

@Output() viewChange: EventEmitter<any> = new EventEmitter();

constructor(private subjects: SubjectsService, public appService: AppService, public apiRequest: ApirequestService, private modalService: NgbModal) {
  this.subjects.refreshModuleData.subscribe((onlyrefresh) => {
    if (onlyrefresh == true)
    {
      this.getDiagnosisList();
      this.getProcedureList();
      this.getAllergiesList();
    }
    else
    {}
      //this.OpenBannerWarnings();
  });


  this.getDiagnosisList();
  this.getProcedureList();
  this.getAllergiesList();
  //this.getMeds();

  this.subjects.importClinicalSummaryNotes.subscribe((resp) => {
    this.getNotesData();
  })

  this.subjects.importDischargePlan.subscribe((resp) => {
    this.getNotesData();
  })

  this.subjects.importInvestigationresults.subscribe((resp) => {
    this.getNotesData();
  })

  this.subjects.importPharmacyNotes.subscribe((resp) => {
    this.getNotesData();
  })
}


@ViewChild('pharmacyModalContent') pharmacyModalContent : any;
openModalEditPharmacyNotes(pharmacyModalContent) {
  this.modalService.open(this.pharmacyModalContent, {size: 'lg', ariaLabelledBy: 'modal-modalEditPharmacyNotes-title', backdrop: 'static'}).result.then((result) => {
  }, (reason) => {
  });
}

@ViewChild('individualRequirementsModalContent') individualRequirementsModalContent : any;
openModalEditIndividualRequiements(individualRequirementsModalContent) {
  this.modalService.open(this.individualRequirementsModalContent, {size: 'lg', ariaLabelledBy: 'modal-modalEditIndividualRequirements-title', backdrop: 'static'}).result.then((result) => {
  }, (reason) => {
  });
}

@ViewChild('safeguardingModalContent') safeguardingModalContent : any;
openModalEditSafeguarding(safeguardingModalContent) {
  this.modalService.open(this.safeguardingModalContent, {size: 'lg', ariaLabelledBy: 'modal-modalEditSafeguarding-title', backdrop: 'static'}).result.then((result) => {
  }, (reason) => {
  });
}

@ViewChild('socialWorkerModalContent') socialWorkerModalContent : any;
openModalEditSocialWorker(socialWorkerModalContent) {
  this.modalService.open(this.socialWorkerModalContent, {size: 'lg', ariaLabelledBy: 'modal-modalEditSocialWorker-title', backdrop: 'static'}).result.then((result) => {
  }, (reason) => {
  });
}

@ViewChild('eddModalContent') eddModalContent : any;
openModalEditEDD(eddModalContent) {
  this.modalService.open(this.eddModalContent, {size: 'lg', ariaLabelledBy: 'modal-modalEditEDD-title', backdrop: 'static'}).result.then((result) => {
  }, (reason) => {
  });
}

@ViewChild('dischargePlanModalContent') dischargePlanModalContent : any;
openModalEditDischargePlan(dischargePlanModalContent) {
  this.modalService.open(this.dischargePlanModalContent, {size: 'lg', ariaLabelledBy: 'modal-modalEditDischargePlan-title', backdrop: 'static'}).result.then((result) => {
  }, (reason) => {
  });
}

@ViewChild('clinicalSummaryModalContent') clinicalSummaryModalContent : any;
openModalEditClinicalSummary(clinicalSummaryModalContent) {
  this.modalService.open(this.clinicalSummaryModalContent, {size: 'lg', ariaLabelledBy: 'modal-modalEditDischargePlan-title', backdrop: 'static'}).result.then((result) => {
  }, (reason) => {
  });
}

@ViewChild('investigationResultsModalContent') investigationResultsModalContent : any;
openModalEditInvestigationResults(investigationResultsModalContent) {
  this.modalService.open(this.investigationResultsModalContent, {size: 'lg', ariaLabelledBy: 'modal-modalEditDischargePlan-title', backdrop: 'static'}).result.then((result) => {
  }, (reason) => {
  });
}



closeEditModalAndRefreshData() {
  this.getDischargeSummaryDetails();
  this.getAdmissionData();
  this.modalService.dismissAll();
}

  ngOnInit(): void {
    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      this.isPatientDischarged = false;
    }
    else{
      this.isPatientDischarged = true;
    }

    this.getDischargeSummaryDetails();
    this.getPASData();
    this.getGPData();
    this.getReferralData();
    this.getAdmissionData();
    this.getNotesData();
    this.insertMeds();
    this.getAllergiesList();
    this.getProcedureList()
    this.getDiagnosisList();

  }

  getPASData()
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_persondetails',this.createClinicalSummaryNotesFilter())
        .subscribe((response) => {
          if(response)
          {
            let dsPersonDetails: any;
            dsPersonDetails = response;
            dsPersonDetails.forEach(element => {
              this.patientName = element.name;
              this.preferredName = element.preferredname;
              this.dob = element.dob;
              this.gender = element.gender;
              this.nhsNumber = element.nhsnumber;
              this.hospitalNumber = element.hospitalnumber;
              this.address = element.address;
              this.email = element.email;
              this.personalNumber = element.personalnumber;
            });
          }
        })
      );
  }

  getGPData()
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
        })
      );

  }

  getReferralData()
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
        })
      );
  }

  getAdmissionData()
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
            });
          }
        })
      );
  }

  getDischargeSummaryDetails() {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createDischargeSummaryListFilter())
        .subscribe((response) => {
          if(response)
          {
            let dsResponse: any;
            dsResponse = response;
            this.individualRequirements = dsResponse[0].individualrequirements
            this.risksToSelf = dsResponse[0].safegaurdingrisktoself;
            this.risksToOthers = dsResponse[0].safegaurdingrisktoothers;
            this.risksFromOthers = dsResponse[0].safegaurdingriskfromothers;
            this.clinicalSummaryNotes = dsResponse[0].clinicalsummarynotes;
            this.investigationResultNotes = dsResponse[0].investigationresults;
            this.pharmacyNotes = dsResponse[0].pharmacynotes;
            // console.log('pharmacyNotes',this.pharmacyNotes);
            this.dischargePlanNotes = dsResponse[0].dischargeplan;
            this.socialWorkerDetails = dsResponse[0].allocatedsocialworkerdetails;

            this.clinicianDeclarationCompleteBy = dsResponse[0].cliniciandeclarationcompletedby;
            this.pharmacyDeclarationCompleteBy = dsResponse[0].pharmacydeclarationcompletedby;
            this.dischargeDeclarationCompleteBy = dsResponse[0].dischargedeclarationcompletedby;
            this.clinicianDeclarationCompleteDate = dsResponse[0].cliniciandeclarationcompletedtimestamp;
            this.pharmacyDeclarationCompleteDate = dsResponse[0].pharmacydeclarationcompletedtimestamp;
            this.dischargeDeclarationCompleteDate = dsResponse[0].dischargedeclarationcompletedtimestamp;
            this.dischargeSummaryCompleted = dsResponse[0].dischargesummarycompleted;
          }
        })
      );
  }

  getNotesData() {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummary',this.createDischargeSummaryListFilter())
        .subscribe((response) => {
          if(response)
          {
            this.notesData = response;
          }

        })
      );
  }

  getDiagnosisList()
  {
    this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetDiagnoses/'+this.appService.personId)
      .subscribe((response) => {
        if(response.length > 0)
        {
          this.diagnosisList = JSON.parse(response);
        }

      })
    )
  }

  getProcedureList()
  {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_getproceduresforencounter', this.createDischargeSummaryProcedureListFilter())
      .subscribe((response) => {
        if(response.length > 0)
        {
          this.procedureList = response;
        }
      })
    )
  }

  getAllergiesList()
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
      })
    )
  }

  getMeds(){
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummaryprescription', this.createMedsFilter())
        .subscribe((response) => {
          if(response.length > 0)
          {
            let dp = response;

            this.dischargesummaryprescription = [];

            for(let i=0; i < dp.length; i++){
              let dsp: DischargeSummaryPrescription = new DischargeSummaryPrescription();
              
              dsp.category = dp[i].category;
              dsp.medicationssummaries = [];
  
              let medSum: MedicationsSummary = new MedicationsSummary();
  
              medSum.checkedby = dp[i].checkedby;
              medSum.comments = dp[i].comments;
              medSum.dispensedby = dp[i].dispensedby;
              medSum.dose = dp[i].dose;
              medSum.gptocontinue = dp[i].gptocontinue;
              medSum.iscontrolleddrug = dp[i].iscontrolleddrug;
              medSum.medicationid = dp[i].medicationid;
              medSum.name = dp[i].name;
              medSum.pod = dp[i].pod;
              medSum.prescriptionid = dp[i].prescriptionid;
              medSum.quantity = dp[i].quantity;
              medSum.quantitysupplied = dp[i].quantitysupplied;
              medSum.route = dp[i].route;
              medSum.status = dp[i].status;
              medSum.supplyondischarge = dp[i].supplyondischarge;
              medSum.dischargesummaryprescription_id = dp[i].dischargesummaryprescription_id;
              medSum.person_id = dp[i].person_id;
              medSum.encounter_id = dp[i].encounter_id;
              
              dsp.medicationssummaries.push(medSum);

              if(this.dischargesummaryprescription.length > 0){
                if(this.checkIfCategoryFound(this.dischargesummaryprescription, dp[i].category)){
                  for(let j=0; j < this.dischargesummaryprescription.length; j++){
                    if(this.dischargesummaryprescription[j].category == dp[i].category){
                      this.dischargesummaryprescription[j].medicationssummaries.push(medSum);
                    }
                  }
                }
                else{
                  this.dischargesummaryprescription.push(dsp);
                }
              }
              else{
                this.dischargesummaryprescription.push(dsp);
              }
            }
          }
          else{
            this.dischargesummaryprescription = [];
          }
        })
    )
  }

  checkIfCategoryFound(arr, category) {
    const found = arr.some(el => el.category == category);
    if (found) return true;
    return false;
  }

  resolveModule(moduleName) {
    let config = this.appService.appConfig.AppSettings.Modules;
    let module = config.find(x => x.module == moduleName);
    if(module)
    {
      this.subjects.frameworkEvent.next("LOAD_SECONDARY_MODULE_" + module['domelement']);
    }

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
    //  (sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) ? new Date() : new Date(sessionStorage.getItem('dischargeDate'));
    // console.log('dischargeDate',dischargeDate);
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

  editView()
  {
    this.selectedView = 'Edit Discharge Summary';
    this.viewChange.emit(this.selectedView);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  print(isControlledDrug?: boolean, dischargeSummaryPrescriptionId?:string){
    if(isControlledDrug){
      this.isControlledDrug = true;
      this.dischargeSummaryPrescriptionId = dischargeSummaryPrescriptionId;
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

  destroyRecordsTemplate() {
    this.isPrint = false;
    this.isLoading = false;
  }

  insertMeds(){
    let ms = new MedicationsHelper(this.apiRequest, this.appService, this.appService.encounterId);

    var upsertManager = new UpsertTransactionManager();
    upsertManager.beginTran(this.appService.baseURI, this.apiRequest);

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/dischargesummaryprescription', this.createMedsFilter())
        .subscribe((response) => {
          if(response.length > 0)
          {
            this.dischargePrescription = response;

            ms.GetSummary((data:[]) => {
              this.summary = data;

              this.dischargePrescription.forEach(dp => {
                let category = this.summary.filter(x => x['catagory'] == dp.category);
                
                category.forEach(cat =>{
                  if(this.arrayLength(cat['prescriptions']) > 0){
                    let len = this.arrayLength(cat['prescriptions']);
                    //console.log(cat['prescriptions']);
                    for(let j = 0; j < len; j++){
                      if(!cat['prescriptions'].some(x => x['__medicationsummary']['prescriptionid'] == dp.prescriptionid && x['__medicationsummary']['medicationid'] == dp.medicationid)){
                        upsertManager.addEntity('core', 'dischargesummaryprescription', { "dischargesummaryprescription_id": dp.dischargesummaryprescription_id }, "del");
                      }
                    }
                  }
                  else{
                    upsertManager.addEntity('core', 'dischargesummaryprescription', { "dischargesummaryprescription_id": dp.dischargesummaryprescription_id }, "del");
                  }
                })

              })

              this.summary.forEach(sum => {
                if(this.arrayLength(sum['prescriptions']) > 0){
                  let len = this.arrayLength(sum['prescriptions']);
                  for(let j = 0; j < len; j++){
                    let dp: DischargePrescription[] = [];
                    dp = this.dischargePrescription.filter(x => x.medicationid == sum['prescriptions'][j]['__medicationsummary']['medicationid'] 
                                                                && x.prescriptionid == sum['prescriptions'][j]['__medicationsummary']['prescriptionid']
                                                                && x.category == sum['catagory']);
                    if(dp.length > 0){
                      upsertManager.addEntity('core', 'dischargesummaryprescription', JSON.parse(JSON.stringify(dp[0])));
                    }
                    else
                    {
                      let pres = {
                        dischargesummaryprescription_id: String(Guid.create()),
                        person_id: this.appService.personId,
                        encounter_id: this.appService.encounterId,
                        dischargesummary_id: this.dischargeSummaryId,
                        category: sum['catagory'],
                        dose: sum['prescriptions'][j]['__medicationsummary']['displaydose'],
                        name: sum['prescriptions'][j]['__medicationsummary']['displayname'],
                        quantity: sum['prescriptions'][j]['__medicationsummary']['displayquantity'],
                        route: sum['prescriptions'][j]['__medicationsummary']['displayroute'],
                        status: sum['prescriptions'][j]['__medicationsummary']['displaystatus'],
                        iscontrolleddrug: sum['prescriptions'][j]['__medicationsummary']['iscontrolleddrug'],
                        comments: sum['prescriptions'][j]['__medicationsummary']['comments'],
                        supplyondischarge: '',
                        quantitysupplied: '',
                        dispensedby: '',
                        checkedby: '',
                        gptocontinue: '',
                        pod: '',
                        prescriptionid: sum['prescriptions'][j]['__medicationsummary']['prescriptionid'],
                        medicationid: sum['prescriptions'][j]['__medicationsummary']['medicationid']
                      };
                      upsertManager.addEntity('core', 'dischargesummaryprescription', JSON.parse(JSON.stringify(pres)));
                    }
                  }
                }
              })
              upsertManager.save((resp) => {
                this.getMeds();
                upsertManager.destroy();
              },
                (error) => {
                  upsertManager.destroy();
                }
              );
            });
          }
          else
          {
            this.dischargePrescription = [];
            
            ms.GetSummary((data:[]) => {
              for(let index = 0; index < data.length; index++){
                if(this.arrayLength(data[index]['prescriptions']) > 0){
                  let len = this.arrayLength(data[index]['prescriptions']);
                  for(let j = 0; j < len; j++){
                    let dp = {
                      dischargesummaryprescription_id: String(Guid.create()),
                      person_id: this.appService.personId,
                      encounter_id: this.appService.encounterId,
                      dischargesummary_id: this.dischargeSummaryId,
                      category: data[index]['catagory'],
                      dose: data[index]['prescriptions'][j]['__medicationsummary']['displaydose'],
                      name: data[index]['prescriptions'][j]['__medicationsummary']['displayname'],
                      quantity: data[index]['prescriptions'][j]['__medicationsummary']['displayquantity'],
                      route: data[index]['prescriptions'][j]['__medicationsummary']['displayroute'],
                      status: data[index]['prescriptions'][j]['__medicationsummary']['displaystatus'],
                      iscontrolleddrug: data[index]['prescriptions'][j]['__medicationsummary']['iscontrolleddrug'],
                      comments: data[index]['prescriptions'][j]['__medicationsummary']['comments'],
                      supplyondischarge: '',
                      quantitysupplied: '',
                      dispensedby: '',
                      checkedby: '',
                      gptocontinue: '',
                      pod: '',
                      prescriptionid: data[index]['prescriptions'][j]['__medicationsummary']['prescriptionid'],
                      medicationid: data[index]['prescriptions'][j]['__medicationsummary']['medicationid']
                    };
                    upsertManager.addEntity('core', 'dischargesummaryprescription', JSON.parse(JSON.stringify(dp)));
                  }
                }
                // else
                // {
                //   let dp = {
                //     dischargesummaryprescription_id: String(Guid.create()),
                //     person_id: this.appservice.personId,
                //     encounter_id: this.appservice.encounterId,
                //     dischargesummary_id: this.dischargeSummaryId,
                //     category: data[index]['catagory'],
                //     dose: null,
                //     name: null,
                //     quantity: null,
                //     route: null,
                //     status: null,
                //     iscontrolleddrug: null,
                //     comments: null,
                //     supplyondischarge: null,
                //     quantitysupplied: null,
                //     dispensedby: null,
                //     checkedby: null,
                //     gptocontinue: null,
                //     pod: null,
                //     prescriptionid: null,
                //     medicationid: null
                //   }
                //   upsertManager.addEntity('core', 'dischargesummaryprescription', JSON.parse(JSON.stringify(dp)));
                // }
              }
              upsertManager.save((resp) => {
                this.getMeds();
                upsertManager.destroy();
              },
                (error) => {
                  upsertManager.destroy();
                }
              );
            });
          }
        })
      )
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

  createMedsFilter()
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

}
