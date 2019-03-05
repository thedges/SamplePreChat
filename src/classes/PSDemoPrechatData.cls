global class PSDemoPrechatData 
{
    
    public class PrechatOutput{
        @InvocableVariable(required=true)
        public String sFirstName;
        @InvocableVariable(required=true)
        public String sLastName;
        @InvocableVariable(required=true)
        public String sEmail;
        @InvocableVariable
        public String fullChatAddress;
        @InvocableVariable
        public String fullMailingAddress;
        @InvocableVariable
        public String sNextTrash;
        @InvocableVariable
        public String sNextRecycle;
        @InvocableVariable
        public String sCartNumber;
        @InvocableVariable
        public String sCartSize;
        @InvocableVariable
        public String sTrashDay;
        @InvocableVariable
        public String sCaseId;
        @InvocableVariable
        public String sContactId;
        @InvocableVariable
        public boolean Reminders;
    }
    
    public class PrechatInput{
        @InvocableVariable(required=true)
        public String sChatKey;
    }
    
    @InvocableMethod(label='Get SnapIns Prechat Data')
    public static List<PrechatOutput> getSnapInsPrechatData(List<PrechatInput>
                                                            inputParameters)
    {
        String sChatKey = inputParameters[0].sChatKey;
        String sCaseId = null;
        String sContactId = null;
        List<PrechatOutput> outputParameters = new List<PrechatOutput>();
        PrechatOutput outputParameter = new PrechatOutput();
        if (sChatKey != null && sChatKey != '')
        {
            List<LiveChatTranscript> transcripts = [SELECT Id, CaseId, ContactId 
                                                    FROM LiveChatTranscript 
                                                    WHERE ChatKey = :sChatKey];
            
            if (transcripts.size()>0)
            {
                sCaseId = transcripts[0].CaseId;
                sContactId = transcripts[0].ContactId;
            }
            
        }
        if (sCaseId != null && sCaseId != '')
        {
            List<Case> cases = [SELECT Id, Latitude__c, Longitude__c, Full_Address__c, Street__c, City__c, State__c, Zip__c 
                                FROM Case 
                                WHERE Id = :sCaseId];
            if (cases.size()>0)
            {
                outputParameter.fullChatAddress = cases[0].Full_Address__c;
                outputParameter.sCaseId = cases[0].Id;
            }
            
        }
        if (sContactId != null && sContactId != '')
        {
            List<Contact> contacts = [SELECT Id, FirstName, LastName, Email, 
                                      Trash_Schedule__r.Next_Trash_Pickup__c, 
                                      Trash_Schedule__r.Next_Recycle_Pickup__c,
                                      Trash_Cart_Number__c, Trash_Cart_Size__c, 
                                      MailingStreet, MailingCity, MailingState, MailingPostalCode, 
                                      Trash_Schedule__r.Day_of_Week__c, Trash_Reminders__c
                                      FROM Contact WHERE Id = :sContactId];
            if (contacts.size()>0)
            {
                outputParameter.sFirstName = contacts[0].FirstName;
                outputParameter.sLastName = contacts[0].LastName;
                outputParameter.sEmail = contacts[0].Email;
                outputParameter.fullMailingAddress = contacts[0].MailingStreet +' ' +contacts[0].MailingCity+', '+contacts[0].MailingState +' ' +contacts[0].MailingPostalCode;
                outputParameter.sNextTrash = contacts[0].Trash_Schedule__r.Next_Trash_Pickup__c.format();
                outputParameter.sNextRecycle=contacts[0].Trash_Schedule__r.Next_Recycle_Pickup__c.format();
                outputParameter.sCartNumber = contacts[0].Trash_Cart_Number__c;
                outputParameter.sCartSize = contacts[0].Trash_Cart_Size__c;
                outputParameter.sTrashDay = contacts[0].Trash_Schedule__r.Day_of_Week__c;
                outputParameter.sContactId = contacts[0].Id;
                outputParameter.Reminders = contacts[0].Trash_Reminders__c;
                
            }
        }
        outputParameters.add(outputParameter);
        return outputParameters;
    }
}