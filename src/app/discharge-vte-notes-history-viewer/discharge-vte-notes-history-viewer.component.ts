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
import { Component, Input, OnDestroy, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';

@Component({
  selector: 'app-discharge-vte-notes-history-viewer',
  templateUrl: './discharge-vte-notes-history-viewer.component.html',
  styleUrls: ['./discharge-vte-notes-history-viewer.component.css']
})
export class DischargeVteNotesHistoryViewerComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  // public Editor = ClassicEditor;

  historyView: string;
  getVTENotesHistoryListURI: string;
  vteNotesHistoryList = [];
  vteNotes: any;

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

    this.getVTENotesHistoryListURI = this.appService.baseURI + '/GetObjectHistory?synapsenamespace=core&synapseentityname=dischargesummary&id=' + this.dischargeSummaryId;
    
    this.GetVTENotesHistory();
  }

  async GetVTENotesHistory() {
    this.spinner.show("form-history-spinner");
      await this.subscriptions.add(
       this.apiRequest.getRequest(this.getVTENotesHistoryListURI)
       .subscribe((response) => {
          var resp = JSON.parse(response);
          let vteNotes = resp.reverse();
          vteNotes.forEach(element => {
            if(element.vtenotescreatedby != null)
            {
              if(!this.checkIfVTENotesFound(this.vteNotesHistoryList,element.vtenotescreatedby,element.vtenotestimestamp, element.vtenotes))
              {
                this.vteNotesHistoryList.push({
                  'vtenotescreatedby':element.vtenotescreatedby,
                  'vtenotestimestamp':element.vtenotestimestamp,
                  'vtenotes':element.vtenotes,
                })
              }
              
            }
          });
          this.spinner.hide("form-history-spinner");
       })
     )
  }

  checkIfVTENotesFound(arr, vtenotescreatedby, vtenotestimestamp, vtenotes) {
    const found = arr.some(el => el.vtenotescreatedby == vtenotescreatedby && 
      el.vtenotestimestamp == vtenotestimestamp && 
      el.vtenotes == vtenotes);
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
    this.vteNotes = obj;
    this.historyView = 'form';
  }

  ngOnDestroy(): void {    
    this.subscriptions.unsubscribe();
  } 


}
