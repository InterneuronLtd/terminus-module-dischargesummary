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
  selector: 'app-pharmacy-notes-history-viewer',
  templateUrl: './pharmacy-notes-history-viewer.component.html',
  styleUrls: ['./pharmacy-notes-history-viewer.component.css']
})
export class PharmacyNotesHistoryViewerComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  historyView: string;
  getPharmacyNotesHistoryListURI: string;
  pharmacyNotesHistoryList = [];
  pharmacyNotes: any;

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

    this.getPharmacyNotesHistoryListURI = this.appService.baseURI + '/GetObjectHistory?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.dischargeSummaryId;
    
    this.GetPharmacyNotesHistory();
  }

  async GetPharmacyNotesHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getPharmacyNotesHistoryListURI)
       .subscribe((response) => {
          var resp = JSON.parse(response);
          let pharmacyNotes = resp.reverse();
          pharmacyNotes.forEach(element => {
            if(element.pharmacynotescreatedby != null && element.pharmacynotes != null)
            {
              if(!this.checkIfClinicalSummaryNotesFound(this.pharmacyNotesHistoryList,element.pharmacynotescreatedby,element.pharmacynotestimestamp, element.pharmacynotes))
              {
                if(element.pharmacynotes != ""){
                  this.pharmacyNotesHistoryList.push({
                    'pharmacynotescreatedby':element.pharmacynotescreatedby,
                    'pharmacynotestimestamp':element.pharmacynotestimestamp,
                    'pharmacynotes':element.pharmacynotes
                  })
                }
              }
            }
          });
          this.spinner.hide("form-history-spinner");
       })
     )
  }

  checkIfClinicalSummaryNotesFound(arr, pharmacynotescreatedby, pharmacynotestimestamp, pharmacynotes) {
    const found = arr.some(el => el.pharmacynotescreatedby == pharmacynotescreatedby && 
      el.pharmacynotestimestamp == pharmacynotestimestamp && 
      el.pharmacynotes == pharmacynotes);
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
    this.pharmacyNotes = obj;
    this.historyView = 'form';
  }

  ngOnDestroy(): void {    
    this.subscriptions.unsubscribe();
  } 

}
