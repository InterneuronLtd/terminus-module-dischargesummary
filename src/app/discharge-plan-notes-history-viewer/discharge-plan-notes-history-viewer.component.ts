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
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-discharge-plan-notes-history-viewer',
  templateUrl: './discharge-plan-notes-history-viewer.component.html',
  styleUrls: ['./discharge-plan-notes-history-viewer.component.css'],
})
export class DischargePlanNotesHistoryViewerComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  historyView: string;
  getDischargePlanHistoryListURI: string;
  dischargePlanHistoryList = [];
  dischargePlan: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() dischargeSummaryId: string;

  constructor(private apiRequest: ApirequestService, 
    public appService: AppService,
    private spinner: NgxSpinnerService,
    private activeModal: NgbActiveModal) { }

  ngOnInit(): void {

    this.historyView = 'list';

    this.getDischargePlanHistoryListURI = this.appService.baseURI + '/GetObjectHistory?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.dischargeSummaryId;
    
    this.GetDischargeHistory();
  }

  async GetDischargeHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getDischargePlanHistoryListURI)
       .subscribe((response) => {
        var resp = JSON.parse(response);
         let dischargePlan = resp.reverse();
         dischargePlan.forEach(element => {
          if(element.dischargeplancreatedby != null)
          {
            if(!this.checkIfClinicalSummaryNotesFound(this.dischargePlanHistoryList,element.dischargeplancreatedby,element.dischargeplantimestamp, element.dischargeplan))
            {
              this.dischargePlanHistoryList.push({
                'dischargeplancreatedby':element.dischargeplancreatedby,
                'dischargeplantimestamp':element.dischargeplantimestamp,
                'dischargeplan':element.dischargeplan
              })
            }
            
          }
          
        });
         this.spinner.hide("form-history-spinner");
       })
     )
  }

  checkIfClinicalSummaryNotesFound(arr, dischargeplancreatedby, dischargeplantimestamp, dischargeplan) {
    const found = arr.some(el => el.dischargeplancreatedby == dischargeplancreatedby && 
      el.dischargeplantimestamp == dischargeplantimestamp && 
      el.dischargeplan == dischargeplan);
    if (found) return true;
    return false;
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  backToList() {
    this.historyView = 'list';
  }

  viewHistoryForm(obj: any) {
    this.dischargePlan = obj;
    this.historyView = 'form';
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
