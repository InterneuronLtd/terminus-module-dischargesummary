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
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DischargePlanNotesHistoryViewerComponent } from './discharge-plan-notes-history-viewer.component';

@Injectable({
  providedIn: 'root'
})
export class DischargePlanNotesHistoryViewerService {

  constructor(private modalService: NgbModal) { }

  formBuilderFormId: string;


  public confirm(
    dischargeSummaryId: string,
    title: string,
    message: string = '',
    btnOkText: string = 'Yes',
    btnCancelText: string = 'No',
    dialogSize: 'sm'|'lg' = 'lg',
    ): Promise<boolean> {

    const modalRef = this.modalService.open(DischargePlanNotesHistoryViewerComponent, { size: dialogSize, centered: true, windowClass: 'custom-class' });

    modalRef.componentInstance.title = title;
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.btnOkText = btnOkText;
    modalRef.componentInstance.btnCancelText = btnCancelText;
    modalRef.componentInstance.dischargeSummaryId = dischargeSummaryId;

    return modalRef.result;

  }
}
