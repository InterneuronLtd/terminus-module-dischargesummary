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
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-safe-gaurding-history-viewer',
  templateUrl: './safe-gaurding-history-viewer.component.html',
  styleUrls: ['./safe-gaurding-history-viewer.component.css']
})
export class SafeGaurdingHistoryViewerComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  historyView: string;
  getSafeGaurdingHistoryListURI: string;
  safeGaurdingRiskFromOthersHistoryList = [];
  safeGaurdingRiskToOthersHistoryList = [];
  safeGaurdingRiskToSelfHistoryList = [];
  safeGaurding: any;

  @Input() status: string;
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

    this.getSafeGaurdingHistoryListURI = this.appService.baseURI + '/GetObjectHistory?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.dischargeSummaryId;
    
    this.GetSafeGaurdingHistory();
  }

  async GetSafeGaurdingHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getSafeGaurdingHistoryListURI)
       .subscribe((response) => {
          var resp = JSON.parse(response);
          let safeGaurding = resp.reverse();
          safeGaurding.forEach(element => {
            if(this.status == 'RiskToSelf')
            {
              if(element.riskstoselfcreatedby != null)
              {
                if(!this.checkIfRiskToSelfFound(this.safeGaurdingRiskToSelfHistoryList,element.riskstoselfcreatedby,element.riskstoselftimestamp, element.safegaurdingrisktoself))
                {
                  this.safeGaurdingRiskToSelfHistoryList.push({
                    'safegaurdingcreatedby':element.riskstoselfcreatedby,
                    'safegaurdingtimestamp':element.riskstoselftimestamp,
                    'safegaurding':element.safegaurdingrisktoself
                  })
                }
                
              }
            }
            else if(this.status == 'RiskToOthers')
            {
              if(element.riskstoothercreatedby != null)
              {
                if(!this.checkIfRiskToOthersFound(this.safeGaurdingRiskToOthersHistoryList,element.riskstoothercreatedby,element.riskstoothertimestamp, element.safegaurdingrisktoothers))
                {
                  this.safeGaurdingRiskToOthersHistoryList.push({
                    'safegaurdingcreatedby':element.riskstoothercreatedby,
                    'safegaurdingtimestamp':element.riskstoothertimestamp,
                    'safegaurding':element.safegaurdingrisktoothers
                  })
                }
                
              }
            }
            else if(this.status == 'RiskFromOthers')
            {
              if(element.risksfromothercreatedby != null)
              {
                if(!this.checkIfRiskFromOthersFound(this.safeGaurdingRiskFromOthersHistoryList,element.risksfromothercreatedby,element.risksfromotherstimestamp, element.safegaurdingriskfromothers))
                {
                  this.safeGaurdingRiskFromOthersHistoryList.push({
                    'safegaurdingcreatedby':element.risksfromothercreatedby,
                    'safegaurdingtimestamp':element.risksfromotherstimestamp,
                    'safegaurding':element.safegaurdingriskfromothers
                  })
                }
                
              }
            }
            
          });
          this.spinner.hide("form-history-spinner");
       })
     )
  }

  checkIfRiskToSelfFound(arr, riskstoselfcreatedby, riskstoselftimestamp, safegaurdingrisktoself) {
    const found = arr.some(el => el.safegaurdingcreatedby == riskstoselfcreatedby && 
      el.safegaurdingtimestamp == riskstoselftimestamp && 
      el.safegaurding == safegaurdingrisktoself);
    if (found) return true;
    return false;
  }

  checkIfRiskToOthersFound(arr, riskstoothercreatedby, riskstoothertimestamp, safegaurdingrisktoothers) {
    const found = arr.some(el => el.safegaurdingcreatedby == riskstoothercreatedby && 
      el.safegaurdingtimestamp == riskstoothertimestamp && 
      el.safegaurding == safegaurdingrisktoothers);
    if (found) return true;
    return false;
  }

  checkIfRiskFromOthersFound(arr, risksfromothercreatedby, risksfromotherstimestamp, safegaurdingriskfromothers) {
    const found = arr.some(el => el.safegaurdingcreatedby == risksfromothercreatedby && 
      el.safegaurdingtimestamp == risksfromotherstimestamp && 
      el.safegaurding == safegaurdingriskfromothers);
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
    this.safeGaurding = obj;
    this.historyView = 'form';
  }

  ngOnDestroy(): void {    
    this.subscriptions.unsubscribe();
  } 

}
