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