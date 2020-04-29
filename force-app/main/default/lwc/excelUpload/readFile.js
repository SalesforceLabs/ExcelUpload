/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// wrapper around FileReader to work nicely in Promise chain
function readAsBinaryString(file) {
    return new Promise(function(resolve, reject){
        var reader = new FileReader();
        reader.onload = function() {            
            resolve(reader.result);
        }
        reader.onerror = function() {
            reject(reader.error);
        }
        reader.onabort = function() {
            reject(new Error('Upload aborted.'));
        }
        reader.readAsBinaryString(file);
    });
}

export { readAsBinaryString };