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
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from '../services/app.service';
import { SubjectsService } from '../services/subjects.service';
import { ApirequestService } from '../services/apirequest.service';
import { NgxSpinnerService } from "ngx-spinner";
import { GlobalService } from '../services/global.service';
import { Person } from '../models/entities/core-person.model';
import { Procedure } from '../models/entities/procedure.model';
import { DataTableDirective } from 'angular-datatables';
import { filter, filterparam, filterParams, filters, orderbystatement, selectstatement } from '../models/filter.model';

@Component({
  selector: 'app-procedure',
  templateUrl: './procedure.component.html',
  styleUrls: ['./procedure.component.css']
})
export class ProcedureComponent implements OnInit, OnDestroy {

  tempProcedure: Subscription = new Subscription();
  subscriptions: Subscription = new Subscription();

  dtOptions: any = {};
  // dtTrigger: Subject<any> = new Subject();

  clinicalSummaryList: any;
  selectedClinicalSummaryView: string;
  saving: boolean = false;
  bsConfig: any;
  refreshingList: boolean;

  getProcedureListURI: string;
  deleteProcedureURI: string;

  procedureList: any = [];
  contextData: any;
  personId: any;
  procedureStatusList: any;
  procedure : Procedure;
  isPatientDischarged: boolean = true;

  dischargeSummaryData: any;

  getProcedureStatusListURI: string = this.appService.carerecorduri + '/ClinicalSummary/GetClinicalSummaryStatuses/ProcedureStatus';

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
    public globalService: GlobalService,
    ) {
      this.subjects.personIdChange.subscribe( () => {
        if(!this.appService.personId) {
        return;
        }
      })

      this.subjects.refreshModuleData.subscribe((onlyrefresh) => {
        if (onlyrefresh == true)
        {
          this.getProcedureList();
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

    // this.dtTrigger.next();

    this.globalService.contextChange.subscribe(value => {
      if(value)
      {
        this.contextData = value;
      }
    });

    this.tempProcedure = this.globalService.listProcedureChange.subscribe(value => {
      this.initialiseFunctions();

    });
  }

  async initialiseFunctions()
  {
      this.getProcedureList();
  }


  async getProcedureList()
  {
    await this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/GetBaseViewListByPost/dischargesummary_getproceduresforencounter', this.createDischargeSummaryProcedureListFilter())
      .subscribe((response) => {
        this.procedureList = response;
      })
    )
  }

  createDischargeSummaryProcedureListFilter()
  {
    let condition = "";
    let pm = new filterParams();
    condition = "person_id = @person_id AND CAST(proceduredate AS date) BETWEEN CAST(@admissiondate AS date) AND CAST(@dischargedate AS date)";
    let splitDate = sessionStorage.getItem('admissionDate').split('/');
    let newAdmissionDate = splitDate[2]+'-'+splitDate[1]+'-'+splitDate[0];
    let dischargeDate;
    if(sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1)
    {
      dischargeDate = new Date();
    }
    else{
      let splitDischargeDate = sessionStorage.getItem('dischargeDate').split('/');
      dischargeDate = splitDischargeDate[2]+'-'+splitDischargeDate[1]+'-'+splitDischargeDate[0];
    }
    // let dischargeDate = (sessionStorage.getItem('dischargeDate') == 'Current' || sessionStorage.getItem('dischargeDate').indexOf('Expected') > -1) ? new Date() : new Date(sessionStorage.getItem('dischargeDate'));
    pm.filterparams.push(new filterparam("person_id", this.appService.personId));
    pm.filterparams.push(new filterparam("admissiondate", this.appService.getDateTimeinISOFormat(new Date(newAdmissionDate))));
    pm.filterparams.push(new filterparam("dischargedate", this.appService.getDateTimeinISOFormat(new Date(dischargeDate))));
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
    if(!!this.tempProcedure) {
      this.tempProcedure.unsubscribe();
    }
  }

}
