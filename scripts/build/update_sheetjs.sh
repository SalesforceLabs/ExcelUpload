#!/bin/bash
set -euo pipefail

# Find project root directory (starting from this script's directory)
# and then decend down to the sheetjs static resource
cd `dirname "$0"`
while [[ ! -d ".sfdx" ]]; do
    cd ..
done
cd force-app/main/default/staticresources/sheetjs

rm LICENSE*
rm xlsx.full.min*

wget https://github.com/SheetJS/sheetjs/raw/master/dist/LICENSE
wget https://github.com/SheetJS/sheetjs/raw/master/dist/xlsx.full.min.js
wget https://github.com/SheetJS/sheetjs/raw/master/dist/xlsx.full.min.map

echo 'window.XLSX=(typeof exports!=="undefined"?exports:XLSX);' >> xlsx.full.min.js