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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-complete-discharge-summary',
  templateUrl: './complete-discharge-summary.component.html',
  styleUrls: ['./complete-discharge-summary.component.css']
})
export class CompleteDischargeSummaryComponent implements OnInit, OnDestroy {

  completedData: any;
  completedBy: string;
  completedDateTime: string;
  selectedView: string;
  printing = false;
  isLoading = false;
  
  @Output() viewChange: EventEmitter<any> = new EventEmitter();

  @Input() set notesData(data : any){
    this.completedData = data;
    if(this.completedData != undefined)
    {
      this.completedBy = this.completedData[0].dischargedeclarationcompletedby;
      this.completedDateTime = this.completedData[0].dischargedeclarationcompletedtimestamp
    }
    else{
      this.completedData = [];
    }
    
  };

  constructor() { }

  ngOnInit(): void {
  }

  printDischargeSummary()
  {
    this.printing = true;
    this.isLoading = true; 
  }

  destroyRecordsTemplate() {
    this.isLoading = false
    this.printing = false;
  }

  ngOnDestroy(): void {
  }

}
