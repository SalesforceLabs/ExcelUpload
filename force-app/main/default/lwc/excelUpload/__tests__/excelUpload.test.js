/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/

import { createElement } from 'lwc';
import ExcelUpload from 'c/excelUpload';
import { updateRecord } from 'lightning/uiRecordApi';

jest.mock(
    'lightning/platformResourceLoader',
    () => {
        return {
            loadScript(_context, path) {
                return new Promise((resolve, _reject) => {
                    require('../../../staticresources/' + path);
                    resolve();
                });
            }
        };
    },
    { virtual: true }
);

// eslint-disable-next-line no-extend-native
Promise.prototype.flushPromises = function() {
    return this.then( () => { return new Promise(resolve => window.setImmediate(resolve)); } );
}

// eslint-disable-next-line no-extend-native
Promise.prototype.flushPromisesUntil = function(maxTries, fn) {    
    return this.then( () => {
        if(maxTries <= 0) {
            throw new Error(`Max number of tries in flushPromisesUntil reached`);
        }
        else if(fn()) {
            return new Promise(resolve => { window.setImmediate(resolve) });
        }
        else {
            //return new Promise(resolve => { window.setImmediate(resolve) }).then( () => flushPromisesUntil(maxTries-1, fn) );
            return (new Promise(resolve => { window.setImmediate(resolve) })).flushPromisesUntil(maxTries-1, fn);
        }        
    });
}

/*
function flushPromisesUntil(maxTries, fn) {    
    if(maxTries <= 0) {
        throw new Error(`Max number of tries in flushPromisesUntil reached`);
    }
    else if(fn()) {
        return new Promise(resolve => { window.setImmediate(resolve) });
    }
    else {
        return new Promise(resolve => { window.setImmediate(resolve) }).then( () => flushPromisesUntil(maxTries-1, fn) );
    }    
}
*/

describe('c-excel-upload', () => {
    const TITLE = "Upload Excel File";
    const LABEL = "Excel File";
    
    let element;

    beforeEach(() => {
        element = createElement('c-excel-upload', {
            is: ExcelUpload
        });
        document.body.appendChild(element);

        element.title = TITLE;
        element.label = LABEL;        
    });

    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    describe('without static resources', () => {
        // override mock to fail loading of XSLX library
        jest.mock( 'lightning/platformResourceLoader', () => {
            return {
                loadScript() {
                    return new Promise((resolve, reject) => { reject('Could not load script'); });
                }
            };},
            { virtual: true }   
        );

        test('Failure to load XSLX', () => {
            return Promise.resolve()
            .flushPromises()
            .then( () => {
                const card = element.shadowRoot.querySelector('lightning-card');           
                // an error message should be displayed
                const errorMsg = card.querySelector('.slds-text-color_error');
                expect(errorMsg).toBeDefined();
                // and there should not be an upload wiget
                const input = card.querySelector('lightning-input[type="file"]');
                expect(input).toBeNull();
            });
        })
    });

    test('Custom title and label and display of upload widget', () => {
        return Promise.resolve()
        .then( () => {
            const card = element.shadowRoot.querySelector('lightning-card');            
            expect(card.title).toEqual(TITLE);            
            const input = card.querySelector("lightning-input");            
            expect(input.label).toEqual(LABEL);
        });
    });
    
    test('Error when upload file is given empty FileList', () => {   
        return Promise.resolve()
        .then( () => {   
            const card = element.shadowRoot.querySelector('lightning-card'); 
            const input = card.querySelector('lightning-input');
            expect(input).toBeTruthy();
            input.files = [];
            expect(input).toBeTruthy();            
            input.dispatchEvent(new CustomEvent('change'), { target: input } );   
        })
        .flushPromises()
        .then( () => {      
            // Card is still there                  
            const card = element.shadowRoot.querySelector('lightning-card');
            expect(card).toBeTruthy();
            // Modal is open
            const modal = element.shadowRoot.querySelector('.slds-modal');
            expect(modal).toBeTruthy();
            expect(modal.textContent).toMatch(/No file received/);
            // and shows error
            const icon = modal.querySelector('lightning-icon');
            expect(icon).toBeTruthy();
            expect(icon.title).toBe("Error");
            // and has a close buttons
            const closeBtn = modal.querySelector('lightning-button-icon[title="Close"]');
            expect(closeBtn).toBeTruthy();
            const footerBtn = modal.querySelector('lightning-button[title="Ok"]');
            expect(footerBtn).toBeTruthy();
            // click the button in the upper right (next test clicks the one in the footer)
            closeBtn.dispatchEvent(new CustomEvent('click'));            
        })
        .flushPromises()
        .then( () => {
            // Card is still there                  
            const card = element.shadowRoot.querySelector('lightning-card');
            expect(card).toBeTruthy();
            // Modal is gone
            const modal = element.shadowRoot.querySelector('.slds-modal');
            expect(modal).toBeFalsy();
        });
    });

    test('Error when upload file is given multiple files in FileList', () => {   
        return Promise.resolve()
        .then( () => {   
            const card = element.shadowRoot.querySelector('lightning-card'); 
            const input = card.querySelector('lightning-input');
            expect(input).toBeTruthy();
            input.files = [ new Blob(), new Blob() ];            
            input.dispatchEvent(new CustomEvent('change'), { target: input } );                           
        })
        .flushPromises()  
        .then( () => {      
            // Card is still there                  
            const card = element.shadowRoot.querySelector('lightning-card');
            expect(card).toBeTruthy();
            // Modal is open
            const modal = element.shadowRoot.querySelector('.slds-modal');
            expect(modal).toBeTruthy();
            expect(modal.textContent).toMatch(/Multiple files received/);
            // and shows error
            const icon = modal.querySelector('lightning-icon');
            expect(icon).toBeTruthy();
            expect(icon.title).toBe("Error");
            // and has a close buttons
            const closeBtn = modal.querySelector('lightning-button-icon[title="Close"]');
            expect(closeBtn).toBeTruthy();
            const footerBtn = modal.querySelector('lightning-button[title="Ok"]');
            expect(footerBtn).toBeTruthy();
            // click the button in the footer (previous test clicks the one in the upper right)
            footerBtn.dispatchEvent(new CustomEvent('click'));            
        })
        .flushPromises()
        .then( () => {
            // Card is still there                  
            const card = element.shadowRoot.querySelector('lightning-card');
            expect(card).toBeTruthy();
            // Modal is gone
            const modal = element.shadowRoot.querySelector('.slds-modal');
            expect(modal).toBeFalsy();
        });
    });

    test('Attempt to upload empty file', () => {
        return Promise.resolve()
        .then( () => {
            const card = element.shadowRoot.querySelector('lightning-card'); 
            const input = card.querySelector('lightning-input');
            expect(input).toBeTruthy();                        

            const file = new Blob();
            file.lastModifed = Date.now();
            file.lastModifedDate = new Date();
            file.name = "empty.xlsx";            
            input.files = [ file ];   
            input.dispatchEvent(new CustomEvent('change'), { target: input } );             
        })
        .flushPromises()
        .then( () => {
            const modal = element.shadowRoot.querySelector('.slds-modal');
            expect(modal).toBeTruthy();        
 
            expect(modal.textContent).toMatch(/Reading File/);  
        })
        .flushPromisesUntil(3, () => {            
            const modal = element.shadowRoot.querySelector('.slds-modal');                
            return modal.textContent.match(/Error/);
        })          
        .then( () => {
            const modal = element.shadowRoot.querySelector('.slds-modal');
            expect(modal).toBeTruthy();                        
            const closeBtn = modal.querySelector('lightning-button-icon[title="Close"]');
            expect(closeBtn).toBeTruthy();
            const footerBtn = modal.querySelector('lightning-button[title="Ok"]');
            expect(footerBtn).toBeTruthy();
        });
    });

    test('Upload good file', () => {
        return Promise.resolve()
        .then( () => {
            element.recordId = "00X123456789012345678";
            // field1 skipped intentionally, things should work if fields are left blank
            element.field2 = "field2__c";
            element.address2 = "First!B2";
            element.field3 = "field3__c";
            element.address3 = "Second!B2";
            // field4 skipped intentionally
            element.field5 = "field5__c";
            element.address5 = "Third!AA10";
            // field6 and field7 skipped intentionally
            element.field8 = "field8__c";
            element.address8 = "C1";
            element.field9 = "field9__c";
            element.address9 = "C2";
            element.field10 = "field10__c";
            element.address10 = "A1";


            const card = element.shadowRoot.querySelector('lightning-card'); 
            const input = card.querySelector('lightning-input');
            expect(input).toBeTruthy();
            
            const fs = require('fs');            
            jest.dontMock('fs');
            const fileBuffer = fs.readFileSync('./test-data/test.xlsx');  
            const array = new Uint8Array(fileBuffer);
                        
            const file = new Blob([array.buffer]);

            expect(array.length).toEqual(file.size);

            file.lastModifed = Date.now();
            file.lastModifedDate = new Date();
            file.name = "test.xlsx";  
                  
            input.files = [ file ];   
            input.dispatchEvent(new CustomEvent('change'), { target: input } );                
        })
        .flushPromises()
        .then( () => {
            const modal = element.shadowRoot.querySelector('.slds-modal');
            expect(modal).toBeTruthy();        
 
            expect(modal.textContent).toMatch(/Reading File/);
        })        
        .flushPromisesUntil(5, () => {
            const modal = element.shadowRoot.querySelector('.slds-modal');                
            return modal.textContent.match(/Done/);
        })
        .then( () => {
            expect(updateRecord).toHaveBeenCalled();
            expect(updateRecord.mock.calls[0]).toEqual([
                { 
                    fields: {
                        "Id": "00X123456789012345678",              
                        "field2__c": "B2",
                        "field3__c": 42,
                        "field5__c": "AA10",
                        "field8__c": "C1",
                        "field9__c": "C2",
                        "field10__c": "A1"                                  
                    }
                }
            ]);

        });    
    });
});