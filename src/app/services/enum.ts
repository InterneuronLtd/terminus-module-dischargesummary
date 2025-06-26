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
export enum DoseType {
    ["units"] = "units",
    ["strength"] = "strength",
    ["descriptive"] = "descriptive",
  }
  
  export enum FrequencyType {
    ["stat"] = "stat",
    ["mor"] = "mor",
    ["mid"] = "mid",
    ["eve"] = "eve",
    ["night"] = "night",
    ["x"] = "x",
    ["h"] = "h"
  }
  
  export enum IntervalType {
    ["standard"] = "standard",
    ["variable"] = "variable",
    ["protocol"] = "protocol"
  }
  
  export enum InfusionType {
    ["ci"] = "ci",
    ["bolus"] = "bolus",
    ["rate"] = "rate"
  }
  
  export enum DoseForm {
    ["Discrete"] = "1",
    ["Continuous"] = "2",
    ["NA"] = "3",
  }
  
  export enum PrescriptionDuration {
    ["hours"] = "hours",
    ["days"] = "days",
    ["weeks"] = "weeks",
    ["months"] = "months",
    ["untilcancelled"] = "until cancelled",
    ["enddate"] = "end date"
  }
  export enum DaysOfWeek {
    ["mon"] = "Monday",
    ["tue"] = "Tuesday",
    ["wed"] = "Wednesday",
    ["thu"] = "Thursday",
    ["fri"] = "Friday",
    ["sat"] = "Saturday",
    ["sun"] = "Sunday"
  }
  
  export enum ChosenDays {
    ["all"] = "all",
    ["chosen"] = "chosen",
    ["skip"] = "skip",
  }
  
  export enum FormContext {
    ["moa"] = "moa",
    ["mod"] = "mod",
    ["ip"] = "ip",
    ["op"] = "op"
  
  }
  
  export enum PrescriptionContext {
    ["Inpatient"] = "Inpatient",
    ["Outpatient"] = "Outpatient",
    ["Orderset"] = "Orderset",
    ["Admission"] = "Admission",
    ["Discharge"] = "Discharge"
  }
  
  
  
  
  export enum ReconciliationListActions {
    ["start"] = "start",
    ["edit"] = "edit",
    ["complete"] = "complete",
    ["notes"] = "notes",
    ["resetcompletestatus"] = "resetcompletestatus"
  }
  
  
  export enum PrescriptionStatus {
    ["active"] = "active",
    ["modified"] = "modified",
    ["suspended"] = "suspended",
    ["restarted"] = "restarted",
    ["stopped"] = "stopped",
    ["cancelled"] = "cancelled",
  }
  
  export enum SupplyRequestStatus {
    ["Incomplete"] = "Incomplete",
    ["Pending"] = "Pending",
    ["Approved"] = "Approved",
    ["Rejected"] = "Rejected",
    ["Fulfilled"] = "Dispensed",
  
  }
  
  
  export enum SummaryCatagory {
    ["New"] = "New",
    ["Changed"] = "Changed",
    ["Unchanged"] = "Unchanged",
    ["Stopped"] = "Stopped",
    ["Suspended"] = "Suspended",
  
  }
  
  