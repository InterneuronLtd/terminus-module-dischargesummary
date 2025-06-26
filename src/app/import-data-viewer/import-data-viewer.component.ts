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
  selector: 'app-import-data-viewer',
  templateUrl: './import-data-viewer.component.html',
  styleUrls: ['./import-data-viewer.component.css']
})
export class ImportDataViewerComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  historyView: string;
  getClinicalSummaryNotesHistoryListURI: string;
  clinicalSummaryNotesHistoryList: any;
  clinicalSummaryNotes: any;

  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string;
  @Input() btnCancelText: string;
  @Input() clinicalSummaryNotesId: string;

  constructor(public appService: AppService,
    private activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

  public dismiss() {
    this.activeModal.dismiss();
  }

  backToList() {
    this.historyView = 'list';
  }

  viewHistoryForm(obj: any) {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

}
