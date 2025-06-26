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
import { Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ApirequestService } from '../services/apirequest.service';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalService } from '../services/global.service';
import { Person } from '../models/entities/core-person.model';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css']
})
export class DiagnosisComponent implements OnInit, OnDestroy {

  subscriptions: Subscription = new Subscription();
  tempDiagnosis: Subscription = new Subscription();
  listDiagnosisUpdate: Subscription = new Subscription();

  dtOptions:any = {};
  // dtTrigger: Subject<any> = new Subject();  

  clinicalSummaryList: any;
  selectedClinicalSummaryView: string;
  saving: boolean = false;
  bsConfig: any;
  refreshingList: boolean;

  getDiagnosisListURI: string;
  deleteDiagnosisURI: string;

  diagnosisList: any = [];
  contextData: any;
  personId: string;
  isPatientDischarged: boolean = true;
  dischargeSummaryData: any;

  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;

  @Input() set personData(value: Person) {
  };

  @Input() set notesData(data : any){
    this.dischargeSummaryData = data;
    
    if((sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) && !(this.dischargeSummaryData && this.dischargeSummaryData.length > 0 && this.dischargeSummaryData[0].dischargesummarycompleted))
    {
      this.isPatientDischarged = false;
    }
    else{
      if(this.dischargeSummaryData && this.dischargeSummaryData.length > 0 && this.dischargeSummaryData[0].dischargesummarycompleted)
      {
        this.isPatientDischarged = true;
      }
      else{
        this.isPatientDischarged = false;
      }
    }
  };

  constructor(private apiRequest: ApirequestService,
    public appService: AppService, 
    private subjects: SubjectsService,
    public spinner: NgxSpinnerService,
    // private addDiagnosisService: AddDiagnosisService,
    public globalService: GlobalService,
    // public confirmationDialogService: ConfirmationDialogService,
    // public diagnosisHistoryViewerService: DiagnosisHistoryViewerService
    ) {
      this.subjects.personIdChange.subscribe( () => {
        if(!this.appService.personId) {
        return;
        }
      })

      this.subjects.encounterChange.subscribe( () => {
        if(!this.appService.encounterId) {
        return;
        }
      })

      this.subjects.refreshModuleData.subscribe((onlyrefresh) => {
        if (onlyrefresh == true)
        {
          this.getDiagnosisList();
        }
        else
        {}
          //this.OpenBannerWarnings();
      });
     }

  ngOnInit(): void {
    // if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    // {
    //   this.isPatientDischarged = false;
    // }
    // else{
    //   this.isPatientDischarged = true;
    // }

    this.dtOptions = {
      paging: false,
      searching: true,
      dom: "-s"
    };

    this.globalService.contextChange.subscribe(value => {
      if(value)
      {
        this.contextData = value;
      }
    });

    this.tempDiagnosis = this.globalService.listDiagnosisChange.subscribe(value => {
      this.initialiseFunctions();
      
    });

  }

  async initialiseFunctions()
  {
    // await this.getClinicalStatusList();
    // setTimeout(() => {
      this.getDiagnosisList();
    // }, 1000);
    
  }

  async getDiagnosisList()
  {
    await this.subscriptions.add(
      this.apiRequest.getRequest(this.appService.carerecorduri + '/ClinicalSummary/GetDiagnoses/'+this.appService.personId)
      .subscribe((response) => {
        if(response.length > 0)
        {
          this.diagnosisList = JSON.parse(response);

          this.refreshingList = false;
        }
        
      })
    )
  }

  resolveModule(moduleName) {
    let config = this.appService.appConfig.AppSettings.Modules;
    let module = config.find(x => x.module == moduleName);
    if(module)
    {
      this.subjects.frameworkEvent.next("LOAD_SECONDARY_MODULE_" + module['domelement']);
    }
    
  }

  ngOnDestroy(): void {    
    // this.dtTrigger.unsubscribe();    
    this.subscriptions.unsubscribe();
    if(!!this.tempDiagnosis) {
      this.tempDiagnosis.unsubscribe();
    }
  }    

}
