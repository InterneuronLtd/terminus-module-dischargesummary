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
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {jsPDF} from 'jspdf';
import html2canvas from 'html2canvas';
import * as html2pdf from 'html2pdf.js'
import * as moment from 'moment';
import { SubjectsService } from '../services/subjects.service';
import { ApirequestService } from '../services/apirequest.service';
import { AppService } from '../services/app.service';
import { Guid } from 'guid-typescript';
import { firstValueFrom, Subscription } from 'rxjs';
import { filter, filterParams, filterparam, filters, orderbystatement, selectstatement } from '../models/filter.model';
declare global {
  interface Window { html2canvas: any; }
}

window.html2canvas = html2canvas;
@Component({
  selector: 'app-print-discharge-summary',
  templateUrl: './print-discharge-summary.component.html',
  styleUrls: ['./print-discharge-summary.component.css']
})
export class PrintDischargeSummaryComponent implements OnInit, AfterViewInit, OnDestroy {

  subscriptions: Subscription = new Subscription();

  isPatientLeaveSummary: boolean = false;
  dischargesummary_id: string;
  expectedDischargeDateTime: string;
  allergies: any;
  allergiesString: string = '';

  @Input() customTemplate: TemplateRef<any>;
  @Input() view: any = 'p';
  @Input() dimensions: any = [800,650];
  @Input() measuringUnit: any = 'pt';
  @Input() patientDetails: any;
  @Input() allergyIntoleranceList: any;

  @Input() set patientLeaveSummary(value: boolean){
    this.isPatientLeaveSummary = value;
  }

  @Input() set dischargeSummaryId(value: string){
    this.dischargesummary_id = value;
  }

  @Input() set dischargedatetime(value: string){
    this.expectedDischargeDateTime = value;
  }

  @ViewChild('dischargeSummaryElement')
  dischargeSummaryElement: ElementRef;
  @Output() destroyComponent: EventEmitter<any> = new EventEmitter();
  @Output() getRecordedNotes: EventEmitter<any> = new EventEmitter();

 constructor(public subjects: SubjectsService, public apiRequest: ApirequestService, public appService: AppService) {
    if (!this.customTemplate) {
      this.getRecordedNotes.emit('');
    }
   }

  ngOnInit(): void {
    this.allergies = this.allergyIntoleranceList.filter(x => x.clinicalstatusvalue == 'Active');
    let string = '';
    this.allergies.forEach(function(element, idx, array) {
      if (idx === array.length - 1){ 
        string += element.causativeagentdescription;
      }
      else{
        string += element.causativeagentdescription + ', ';
      }
    });
    this.allergiesString = string;
   }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createPdf();
    }, 1000);
  }

  createPdf() {

    var element = this.dischargeSummaryElement.nativeElement;
    var opt = {
      margin:       [70,0,50,0],
      filename:     'myfile.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' },
      pagebreak:    { avoid: ['tr','div'] }
    };

    html2pdf().from(element).set(opt).toPdf().get('pdf').then(async (pdf) => {
      var totalPages = pdf.internal.getNumberOfPages();
      let currTime = moment(moment()).format('HH:mm');
      for (let i = 1; i <= totalPages; i++) {
        
        pdf.setPage(i);
        // set header to every page
        if(i > 1)
        {
          pdf.setFont(undefined,'bold');
          let splitDOB = this.patientDetails[0].dob.split('/');
          let patientDOB = splitDOB[1] + '/' + splitDOB[0] + '/' + splitDOB[2];

          pdf.text(' ' + this.patientDetails[0].name + ', ' +  moment(patientDOB).format("DD MMM YYYY") + ', ' + this.patientDetails[0].age + ', ' + this.patientDetails[0].gender + ', ' + this.patientDetails[0].hospitalnumber + ', ' + this.patientDetails[0].nhsnumber + ', ' + this.patientDetails[0].address,30,30,null,null);
          pdf.text(' ' + this.allergiesString, 30,45,{ maxWidth: 500 },null,null);
        }

       // set footer to every page
        pdf.setFont(undefined,'normal');
        pdf.setFontSize(10);
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        let date =dd + '/' + mm + '/' + yyyy;
        pdf.text('Royal National Orthopaedic Hospital Trust, Brockley Hill, Stanmore, Middlesex HA7 4LP. Tel: 020 8954 2300', 50,810,null,null);
        pdf.text('Page '+ String(i) + ' of ' + totalPages + ' Date/Time: ' + date+ ' ' + currTime,200,830,null,null);
      }

      this.subjects.isPrinitingCompleted.next(true);
      window.open(<any>pdf.output('bloburl'), '_blank');

      if(this.isPatientLeaveSummary){
        this.savePDF(pdf, this.isPatientLeaveSummary)
      }
      else{
            this.subscriptions.add(
              await firstValueFrom(this.apiRequest.postRequest(this.appService.baseURI + '/GetListByPost/core/patientleavesummary', this.createPatientLeaveSummaryFilter()))
                .then((response: any) => {
                  if (response.length == 0) {
                    this.savePDF(pdf, false);
                  }

                }
                )
            );
          }
      this.destroyComponent.emit('destroy');
    })

    // Old monolithic-style usage:
    // html2pdf(element, opt);

    // let pdf = new jsPDF('p', 'pt', [800,650]);
    //   pdf.html(this.dischargeSummaryElement.nativeElement, {
    //     margin: [40,0,30,0],
    //     callback: (pdf) => {
    //       const pageCount = pdf.getNumberOfPages();
    //       let currTime = moment(moment()).format('HH:mm');
    //       for(var i = 1; i <= pageCount; i++)
    //       {
    //         pdf.setPage(i);
    //         if(i > 1)
    //         {
    //           pdf.setFont(undefined,'bold');
    //           let splitDOB = this.patientDetails[0].dob.split('/');
    //           let patientDOB = splitDOB[1] + '/' + splitDOB[0] + '/' + splitDOB[2];

    //           pdf.text('Name: ' + this.patientDetails[0].name + ' DOB: ' +  moment(patientDOB).format("DD MMM YYYY") + ' Age: ' + this.patientDetails[0].age + ' Gender: ' + ((this.patientDetails[0].gender == 'Male')?'M':'F') + ' Hospital Number: ' + this.patientDetails[0].hospitalnumber + ' NHS Number: ' + this.patientDetails[0].nhsnumber,50,30,null,null);
    //         }
            
    //         pdf.setFont(undefined,'normal');
    //         var today = new Date();
    //         var dd = String(today.getDate()).padStart(2, '0');
    //         var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    //         var yyyy = today.getFullYear();

    //         let date =dd + '/' + mm + '/' + yyyy;
    //         pdf.text('Page '+ String(i) + ' of ' + pageCount + ' Date/Time: ' + date+ ' ' + currTime,250,780,null,null);
    //       }
          
    //       window.open(<any>pdf.output('bloburl'), '_blank');
    //       this.destroyComponent.emit('destroy');
    //     },
    //   });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getBase64Pdf(pdfBlob: Blob) {
    return new Promise<string>((resolve) => {
        var reader = new FileReader();
        reader.readAsDataURL(pdfBlob); 
        reader.onloadend = function() {
            resolve(reader.result.toString());
        };
    });
  }

  createPatientLeaveSummaryFilter()
  {
    let condition = "";
    let pm = new filterParams();

    condition = "dischargesummary_id = @dischargesummary_id AND ispatientleavesummary = false";

    pm.filterparams.push(new filterparam("dischargesummary_id", this.dischargesummary_id));

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

  async savePDF(pdf: any, isPatientLeaveSummary: boolean){
    let base64Pdf = await this.getBase64Pdf(new Blob([pdf.output('blob')], { type: 'application/pdf' }));
    let splitExpectedDate = this.expectedDischargeDateTime.split('/');
    let edd = new Date(splitExpectedDate[2] + '-' + splitExpectedDate[1] + '-' + splitExpectedDate[0]);
    let patientLeaveSummary = {
      patientleavesummary_id: String(Guid.create()),
      dischargesummary_id: this.dischargesummary_id,
      pdfblob: base64Pdf.split(',')[1],
      expecteddateofdischarge: this.appService.getDateTimeinISOFormat(edd),
      ispatientleavesummary: isPatientLeaveSummary
    };

    this.subscriptions.add(
      this.apiRequest.postRequest(this.appService.baseURI + '/PostObject/core/patientleavesummary', patientLeaveSummary).subscribe(()=>{
        console.log('pdf saved');
      })
    );
  }

}
