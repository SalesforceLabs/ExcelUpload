# Excel Upload Lightning Web Component

Extract values from an Excel sheet to record fields while uploading

## Description

A Lightning Component that allows you to upload an Excel File to a record (e.g., Account, 
Opportunity, Custom Object), extracts certain cells (e.g., A1) from it, and sets them as 
field values in the record detail (e.g., Opportunity.Amount).

## Highlights

* Extract/parse values from a complex excel into a Salesforce record, while uploading the 
  Excel sheet as an attachment to the record
* Build you regular Salesforce processes (e.g., approvals) on the record and reduce the 
  e-mailing around those Excel files
* Combine the flexibility of Excel sheets with well-structured Salesforce processes

## Details

Use this component when you need to extract/parse values from an Excel File. It has been 
used mainly in approval processes, where users submit a complex Excel sheet as attachment
to the to be approved record and certain header or otherwise important values should be 
taken over from that Excel Sheet.

# License

See LICENSE file in this repository.  

This component uses the [SheetJS Community Edition library](https://github.com/SheetJS/sheetjs),
which is licensed under the Apache License 2.0.  See the LICENSE file in 
force-app/main/default/staticresources/sheetjs.
