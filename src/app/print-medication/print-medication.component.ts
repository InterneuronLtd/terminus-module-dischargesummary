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
import html2canvas from 'html2canvas';
import {jsPDF} from 'jspdf';
import * as moment from 'moment';
import * as html2pdf from 'html2pdf.js'
import { SubjectsService } from '../services/subjects.service';

declare global {
  interface Window { html2canvas: any; }
}

window.html2canvas = html2canvas;

@Component({
  selector: 'app-print-medication',
  templateUrl: './print-medication.component.html',
  styleUrls: ['./print-medication.component.css']
})

export class PrintMedicationComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() customTemplate: TemplateRef<any>;
  @Input() view: any = 'p';
  @Input() dimensions: any = [800,650];
  @Input() measuringUnit: any = 'pt';
  @Input() patientDetails: any;

  @ViewChild('dischargeSummaryPrescriptionElement')
  dischargeSummaryPrescriptionElement: ElementRef;

  @Output() destroyComponent: EventEmitter<any> = new EventEmitter();
  @Output() getRecordedNotes: EventEmitter<any> = new EventEmitter();

  constructor(public subjects: SubjectsService) {
    if (!this.customTemplate) {
      this.getRecordedNotes.emit('');
    }
   }

  ngOnInit(): void {
    //console.log('print medication');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createPdf();
    }, 1000);
  }

  createPdf() {
    var element = this.dischargeSummaryPrescriptionElement.nativeElement;
    var opt = {
      margin:       [50,0,40,0],
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'pt', format: [800,650], orientation: 'portrait' },
      pagebreak:    { avoid: ['tr','div'] }
    };

    html2pdf().from(element).set(opt).toPdf().get('pdf').then((pdf) => {
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

          pdf.text('Name: ' + this.patientDetails[0].name + ' DOB: ' +  moment(patientDOB).format("DD MMM YYYY") + ' Age: ' + this.patientDetails[0].age + ' Gender: ' + ((this.patientDetails[0].gender == 'Male')?'M':'F') + ' Hospital Number: ' + this.patientDetails[0].hospitalnumber + ' NHS Number: ' + this.patientDetails[0].nhsnumber,40,30,null,null);
          pdf.text('Address: ' + this.patientDetails[0].address, 40,45,null,null);
        }

       // set footer to every page
        pdf.setFont(undefined,'normal');
        pdf.setFontSize(10);
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        let date =dd + '/' + mm + '/' + yyyy;
        pdf.text('Prescriber to print name, sign & date:________________________' ,30,770,null,null);
        pdf.text('Royal National Orthopaedic Hospital, Brockley Hill,', 340, 770, null, null);
        pdf.text('Page '+ String(i) + ' of ' + totalPages + ' Date/Time: ' + date+ ' ' + currTime,30,790,null,null);
        pdf.text('Stanmore, Middlesex HA7 4LP Tel: 020 8954 2300', 340, 790, null, null);
      }

      this.subjects.isPrinitingCompleted.next(true);
      window.open(<any>pdf.output('bloburl'), '_blank');
      this.destroyComponent.emit('destroy');
     
    })
    // let pdf = new jsPDF('p', 'pt', [800,650]);
    // pdf.html(this.dischargeSummaryPrescriptionElement.nativeElement, {
    //   margin: [30,0,30,0],
    //   callback: (pdf) => {
    //     const pageCount = pdf.getNumberOfPages();
    //       let currTime = moment(moment()).format('HH:mm');
    //       for(var i = 1; i <= pageCount; i++)
    //       {
    //         pdf.setPage(i);
    //         if(i > 1)
    //         {
    //           pdf.setFont(undefined,'bold');
    //           let splitDOB = this.patientDetails[0].dob.split('/');
    //           let patientDOB = splitDOB[1] + '/' + splitDOB[0] + '/' + splitDOB[2];
              
    //           pdf.text('Name: ' + this.patientDetails[0].name + ' DOB: ' + moment(patientDOB).format("DD MMM YYYY") + ' Age: ' + this.patientDetails[0].age + ' Gender: ' + ((this.patientDetails[0].gender == 'Male')?'M':'F') + ' Hospital Number: ' + this.patientDetails[0].hospitalnumber + ' NHS Number: ' + this.patientDetails[0].nhsnumber,50,30,null,null);
    //         }
            
    //         pdf.setFont(undefined,'normal');
    //         var today = new Date();
    //         var dd = String(today.getDate()).padStart(2, '0');
    //         var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    //         var yyyy = today.getFullYear();

    //         let date =dd + '/' + mm + '/' + yyyy;
    //         pdf.text('Page '+ String(i) + ' of ' + pageCount + ' Date/Time: ' + date+ ' ' + currTime,250,780,null,null);
    //       }
    //     window.open(<any>pdf.output('bloburl'), '_blank');
    //     this.destroyComponent.emit('destroy');
    //   }
    // });
  }
  

  ngOnDestroy(): void {
  }
  
}