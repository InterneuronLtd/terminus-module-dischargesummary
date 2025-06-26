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
  selector: 'app-social-worker-history-viewer',
  templateUrl: './social-worker-history-viewer.component.html',
  styleUrls: ['./social-worker-history-viewer.component.css']
})
export class SocialWorkerHistoryViewerComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  historyView: string;
  getSocialWorkerHistoryListURI: string;
  socialWorkerHistoryList = [];
  socialWorker: any;

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

    this.getSocialWorkerHistoryListURI = this.appService.baseURI + '/GetObjectHistory?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.dischargeSummaryId;
    
    this.GetSocialWorkerHistory();
  }

  async GetSocialWorkerHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getSocialWorkerHistoryListURI)
       .subscribe((response) => {
          var resp = JSON.parse(response);
          let socialWorker = resp.reverse();
          socialWorker.forEach(element => {
            if(element.socialworkercreatedby != null)
            {
              if(!this.checkIfClinicalSummaryNotesFound(this.socialWorkerHistoryList,element.socialworkercreatedby,element.socialworkertimestamp, element.allocatedsocialworkerdetails))
              {
                this.socialWorkerHistoryList.push({
                  'socialworkercreatedby':element.socialworkercreatedby,
                  'socialworkertimestamp':element.socialworkertimestamp,
                  'allocatedsocialworkerdetails':element.allocatedsocialworkerdetails
                })
              }
              
            }
            
          });
          this.spinner.hide("form-history-spinner");
       })
     )
  }

  checkIfClinicalSummaryNotesFound(arr, socialworkercreatedby, socialworkertimestamp, allocatedsocialworkerdetails) {
    const found = arr.some(el => el.socialworkercreatedby == socialworkercreatedby && 
      el.socialworkertimestamp == socialworkertimestamp && 
      el.allocatedsocialworkerdetails == allocatedsocialworkerdetails);
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
    this.socialWorker = obj;
    this.historyView = 'form';
  }

  ngOnDestroy(): void {    
    this.subscriptions.unsubscribe();
  } 

}
