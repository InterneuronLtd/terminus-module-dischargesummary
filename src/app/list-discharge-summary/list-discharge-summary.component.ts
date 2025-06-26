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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef } from '@angular/core';
import { firstValueFrom, Subscription } from 'rxjs';
import { Person } from '../models/entities/core-person.model';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-list-discharge-summary',
  templateUrl: './list-discharge-summary.component.html',
  styleUrls: ['./list-discharge-summary.component.css']
})
export class ListDischargeSummaryComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  personId: string;

  bsConfig: any;
  refreshingList: boolean;
  selectedClinicalSummaryView: string;
  saving: boolean = false;

  dischargeSummaryList: any;

  getAllergyListForPersonURI: string;

  contextData: any;

  selectedView: string;

  isDisabled: boolean = false;

  isPdfGenerated: boolean = false;

  modalRef?: BsModalRef;

  patientLeaveSummary: any;

  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  @Input() set person(value: Person) {
    this.personId = value.person_id;
    this.selectedClinicalSummaryView = "list clinical summary";

    this.initialiseData();

  };

  constructor(private apiRequest: ApirequestService,
    public appService: AppService,
    public subjects: SubjectsService,
    private modalService: BsModalService) { }

  ngOnInit(): void {
  }

  initialiseData() {
    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_dischargesummarylist',this.createDischargeSummaryListFilter())
        .subscribe((response) => {
          if(response)
          {
            this.dischargeSummaryList = response;
            if(this.dischargeSummaryList.length > 0)
            {
              this.dischargeSummaryList.forEach(element => {
                if(element.cliniciancompleted)
                {
                  let dischargeSummaryCompleteData = [];
                  dischargeSummaryCompleteData = element.cliniciancompleted.split(' @ ');
                  if(dischargeSummaryCompleteData.length > 0)
                  {
                    element.dateCompleted = dischargeSummaryCompleteData[0];
                    element.completedBy = dischargeSummaryCompleteData[1];
                  }
                }


              });
            }
          }

        })
      );

  }

  createDischargeSummaryListFilter() {

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

  loadStatusView(admissionDate, dischargeDate, status, personId, encounterId)
  {

    this.appService.personId = personId;
    this.appService.encounterId = encounterId;
    sessionStorage.setItem('admissionDate', admissionDate);
    sessionStorage.setItem('dischargeDate', dischargeDate);

    if(status == 'New')
    {
      this.selectedView = 'New Discharge Summary';
    }
    else if(status == 'Discharge Summary Created')
    {
      this.selectedView = 'Edit Discharge Summary';
    }
    else if(status == 'For Review By Pharmacy')
    {
      this.selectedView = 'View Discharge Summary';
    }
    else if(status == 'Ready For Discharge')
    {
      this.selectedView = 'Ready For Discharge';
    }
    else if(status == 'Discharge Summary Complete')
    {
      this.selectedView = 'Complete Discharge Summary';
    }

    this.viewChange.emit(this.selectedView);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  viewPDF(patientleavesummary_id: string, template: TemplateRef<any>){
    this.apiRequest.getRequest(this.appService.baseURI + "/GetObject/core/patientleavesummary/" + patientleavesummary_id).subscribe(
      (response) => {
        if(response){
          this.patientLeaveSummary = JSON.parse(response);
          this.isPdfGenerated = true;
          let config = {
            backdrop: true,
            ignoreBackdropClick: true,
            class: 'modal-xl'
          };
          this.modalRef = this.modalService.show(template, config);
        }
      }
    )

  }

  async downloadPdf() {
    const byteCharacters = atob(this.patientLeaveSummary.pdfblob);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: "application/pdf"});

    let hospitalNumber = await this.getPersonHospitalNumber(this.appService.personId);

    saveAs(blob, hospitalNumber + ' ' + 'Leave_Summary' + ".pdf");
  }

  async getPersonHospitalNumber(personId: string) {
    let response = await firstValueFrom(this.apiRequest.getRequest(this.appService.baseURI + "/GetListByAttribute/core/personidentifier/person_id/" + this.appService.personId));

    if(response)
    {
      let personIdentifiers = JSON.parse(response);
      let hospitalNo = personIdentifiers.find(x => x.idtypecode == this.appService.hospitalNumberTypeCode);
      return hospitalNo.idnumber;
    }
        
  }

}
