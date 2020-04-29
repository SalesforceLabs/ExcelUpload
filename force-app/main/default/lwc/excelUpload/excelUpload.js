/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable no-console */
/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }] */

import { LightningElement, track, api } from 'lwc';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { readAsBinaryString } from './readFile';
import SHEETJS_ZIP from '@salesforce/resourceUrl/sheetjs'

export default class ExcelUpload extends LightningElement {    
    // Id of currently displayed record (component is only for display on record pages)
    @api recordId;  
    @api objectApiName;

    // Title and Label displayed in UI
    @api title;
    @api label;

    // Configuration of record fields and the corresponding Excel cell adresses
    // up to 10 fields are supported; fields may be left blank
    @api field1;
    @api address1;
    @api field2;
    @api address2;
    @api field3;
    @api address3;
    @api field4;
    @api address4;
    @api field5;
    @api address5;            
    @api field6;
    @api address6;
    @api field7;
    @api address7;        
    @api field8;
    @api address8;
    @api field9;
    @api address9;
    @api field10;
    @api address10;

    // state management to display spinners and the modal used while uploading the component
    @track ready = false;
    @track error = false;    

    @track uploading = false;
    @track uploadStep = 0;
    @track uploadMessage = '';
    @track uploadDone = false;
    @track uploadError = false;

    get loading() { return !this.ready && !this.error; }

    constructor() {
        super();

        loadScript(this, SHEETJS_ZIP + '/xlsx.full.min.js')
        .then(() => {
            if(!window.XLSX) {
                throw new Error('Error loading SheetJS library (XLSX undefined)');                
            }
            this.ready = true;
        })
        .catch(error => {
            this.error = error;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Excel Upload: Error loading SheetJS',
                    message: error.message,
                    variant: 'error'
                })
            );
        });
    }

    // The promise chain for upload a new file will
    // 1. read the file, 2. parse it and extract the Excel cells and 
    // update the record, 3. upload the file to the record as "attachment"
    // (ContentVersion to be more precise), and 4. shortly wait to display
    // the modal before letting it disappear
    uploadFile(evt) {
        const recordId = this.recordId;               
        let file;
        
        Promise.resolve(evt.target.files)        
        .then( files => {
            this.uploading = true;
            this.uploadStep = "1";
            this.uploadMessage = 'Reading File';
            this.uploadDone = false;
            this.uploadError = false;

            if(files.length !== 1) {
                throw new Error("Error accessing file -- " + 
                    (files.length === 0 ? 
                        'No file received' : 
                        'Multiple files received'
                    ));
            }        
 
            file = files[0];
            return readAsBinaryString(file);
        })                
        .then( blob => {
            this.uploadStep = "2";
            this.uploadMessage = 'Extracting Data';

            let workbook = window.XLSX.read(blob, {type: 'binary'});    

            if(!workbook || !workbook.Workbook) { throw new Error("Cannot read Excel File (incorrect file format?)"); }
            if(workbook.SheetNames.length < 1) { throw new Error("Excel file does not contain any sheets"); }            

            const record = {
                Id: recordId
            };
            
            for(let i=1; i<=10; i++) {
                const field = this["field"+i];
                let address = this["address"+i];

                if(field && field !== 'NONE') {
                    let sheetName = workbook.SheetNames[0];                    
                    if(address.indexOf("!") >= 0) {
                        let parts = address.split("!");
                        sheetName = parts[0]; 
                        address = parts[1];
                    }

                    let sheet = workbook.Sheets[sheetName];
                    if(!sheet) { 
                        throw new Error(`Sheet '${sheetName} not found for Excel Address ${i} (value: '${this["address"+i]}')`); 
                    }

                    let cell = sheet[address];
                    if(!cell) {
                        throw new Error(`Cell with address ${address} not found for Excel Address ${i} (value: '${this["address"+i]}')`);
                    }
                    
                    record[field] = cell.v;
                }
            }

            this.uploadStep = "3";
            this.uploadMessage = 'Updating Record';

            return updateRecord({fields: record}).then( () => blob );                        
        })
        .then( blob => {            
            this.uploadStep = "4";
            this.uploadMessage = 'Uploading File';

            const cv = {
                Title: file.name,
                PathOnClient: file.name,
                VersionData: window.btoa(blob),          
                FirstPublishLocationId: recordId
            };
            
            return createRecord({apiName: "ContentVersion", fields: cv})     
        })
        .then( _cv => {
            // Unfortunately, the last step won't get a check mark -- 
            // the base component <lightning-progress-indicator> is missing this functionality        
            this.uploadMessage = "Done";  
            this.uploadDone = true;       
            return new Promise(function(resolve, _reject){ 
                // eslint-disable-next-line @lwc/lwc/no-async-operation
                window.setTimeout(resolve, 1000); 
            });             
        })
        .then( () => {
            this.closeModal();

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Excel Upload: Success',
                    message: 'Current record has been updated successfully and the Excel file uploaded',
                    variant: 'success'
                })
            );             
        })
        .catch( err => {
            this.uploadError = true;
            this.uploadMessage = "Error: " + err.message;
        });
    }

    closeModal() {
        this.uploading = false;
        this.uploadStep = 0;
        this.uploadMessage = '';
        this.uploadDone = false;
        this.uploadError = false;       
    }
}