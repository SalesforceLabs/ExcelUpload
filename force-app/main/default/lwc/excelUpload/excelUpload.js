import { LightningElement, track, api, wire } from 'lwc';
import { getRecord, createRecord, updateRecord } from 'lightning/uiRecordApi';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { readAsBinaryString } from './readFile';
import SHEETJS_ZIP from '@salesforce/resourceUrl/sheetjs'

/*
TODO:
- Add close button / x when error state
- improve error messages (mainly when parsing Excel file)
- add test classes (jest)
- i18n? (Custom Labels etc.)
*/

export default class ExcelUpload extends LightningElement {    
    @api recordId;  
    @api objectApiName;

    @api title;
    @api label;

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

        console.log(`field1 = ${this.field1}, address1 = ${this.address1}`);

        loadScript(this, SHEETJS_ZIP + '/xlsx.full.min.js')
        .then(() => {
            if(!XLSX) {
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

    uploadFile(evt) {
        const recordId = this.recordId;
        console.log("recordId = " + recordId);        
        
        if(evt.target.files.length != 1) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Excel Upload: Error accessing file',
                    message: evt.target.files.length == 0 ? 'No file received' : 'Multiple files received',
                    variant: 'error'
                })
            ); 
            return;
        }        
        const file = evt.target.files[0];
        console.log(file);    

        this.uploading = true;
        this.uploadStep = "1";
        this.uploadMessage = 'Reading File';
        this.uploadDone = false;
        this.uploadError = false;
        readAsBinaryString(file)
        .then( blob => {
            this.uploadStep = "2";
            this.uploadMessage = 'Extracting Data';

            var workbook = XLSX.read(blob, {type: 'binary'});                
            
            const record = {
                Id: this.recordId
            };
            
            for(let i=1; i<=10; i++) {
                const field = this["field"+i];
                const address = this["address"+i];

                if(field && field != 'NONE') {
                    let sheet = workbook.SheetNames[0];
                    if(address.indexOf("!") >= 0) {
                        var parts = address.split("!");
                        sheet = parts[0]; 
                        address = parts[1];
                    }
                    let cell = workbook.Sheets[sheet][address];
                    record[field] = cell.v;
                }
            }

            this.uploadStep = "3";
            this.uploadMessage = 'Updating Record';

            return updateRecord({fields: record}).then( () => blob );                        
        })
        .then( blob => {            
            console.log("recordId = " + recordId);
            console.log("this.recordId = " + this.recordId);
            this.uploadStep = "4";
            this.uploadMessage = 'Uploading File';
            console.log("modal changed");

            const cv = {
                Title: file.name,
                PathOnClient: file.name,
                VersionData: window.btoa(blob),          
                FirstPublishLocationId: recordId
            };

            console.log("Trying to create ContentVersion");
            return createRecord({apiName: "ContentVersion", fields: cv})     
        })
        .then( cv => {
            console.log("Successfully created ContentVersion");
            console.log(cv);

            //Unfortunately, the last step won't get a check mark... base component is missing this functionality...
            //this.uploadStep = "done";
            this.uploadMessage = "Done";  
            this.uploadDone = true;       
            return new Promise(function(resolve, _reject){ window.setTimeout(resolve, 1000); });             
        })
        .then( () => {
            this.uploading = false;

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Excel Upload: Success',
                    message: 'Current record has been updated successfully and the Excel file uploaded',
                    variant: 'success'
                })
            );             
        })
        .catch( err => {
            console.log("Error");
            console.log(err);
            this.uploadError = true;
            this.uploadMessage = "Error: " + err.message;
        });
    }
}