@isTest
public class FieldPicklistTest {
    @isTest
    public static void testWithAccount() {
        VisualEditor.DesignTimePageContext dtpc = new VisualEditor.DesignTimePageContext();
        dtpc.pageType = 'RecordPage';
        dtpc.entityName = 'Account';
        
        FieldPicklist fp = new FieldPicklist(dtpc);
        VisualEditor.DataRow defaultValue = fp.getDefaultValue();
        System.assertNotEquals(null, defaultValue); 
        System.assertEquals('--- None ---', defaultValue.getLabel());
        System.assertEquals('NONE', defaultValue.getValue());
        
        VisualEditor.DynamicPickListRows rows = fp.getValues();
        System.assert(rows.size() > 10, 'Something is wrong, not all fields delivered from Account object');
    }
    
    @isTest
    public static void testNonRecordPage() {
        VisualEditor.DesignTimePageContext dtpc = new VisualEditor.DesignTimePageContext();
        dtpc.pageType = 'HomePage';
        
        FieldPicklist fp = new FieldPicklist(dtpc);
        System.assertNotEquals(null, fp.getDefaultValue());        
        System.assertNotEquals(null, fp.getValues());               
    }
}