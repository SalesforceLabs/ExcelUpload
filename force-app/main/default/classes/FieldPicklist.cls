global class FieldPicklist extends VisualEditor.DynamicPickList {
    VisualEditor.DesignTimePageContext context;
	VisualEditor.DataRow none;
    
    global FieldPicklist(VisualEditor.DesignTimePageContext context) {
       	this.context = context;
        this.none = new VisualEditor.DataRow('--- None ---', 'NONE');    
    }
    
    global override VisualEditor.DynamicPickListRows getValues() {
        if(context.pageType != 'RecordPage' || context.entityName == null) {
            return new VisualEditor.DynamicPickListRows();
        }
        
        Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
		Schema.SObjectType sot = gd.get(context.entityName);
        Schema.DescribeSObjectResult describe = sot.getDescribe();
        Map<String, Schema.SObjectField> fieldMap = describe.fields.getMap();

		VisualEditor.DynamicPickListRows  values = new VisualEditor.DynamicPickListRows();		
		values.addRow(this.none);

        for(String field: fieldMap.keySet()) {
            String label = fieldMap.get(field).getDescribe().getLabel();
            String properFieldName = fieldMap.get(field).getDescribe().getName(); 
        	VisualEditor.DataRow value = new VisualEditor.DataRow(label, properFieldName);    
            values.addRow(value);
        }        

        return values;
    }

    global override VisualEditor.DataRow getDefaultValue(){
    	return this.none;
    }
}