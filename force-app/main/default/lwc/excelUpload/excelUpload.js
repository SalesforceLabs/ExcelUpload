import { LightningElement, track, api } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import SHEETJS_ZIP from '@salesforce/resourceUrl/sheetjs'

export default class ExcelUpload extends LightningElement {    
    @api
    title = '';

    @api
    label = '';
    
    constructor() {
        super();

        loadScript(this, SHEETJS_ZIP + '/xlsx.full.min.js')
        .then(() => {
            console.log("XLSX = ");
            console.log(XLSX);
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading SheetJS',
                    message: error.message,
                    variant: 'error'
                })
            );
        });
    }

    uploadFile(evt) {
        console.log(evt);
    }
}