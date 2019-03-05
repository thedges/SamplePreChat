({
    /**
     * Event which fires the function to start a chat request (by accessing the chat API component).
     * 
     * @param cmp - The component for this state.
     */
    onStartButtonClick: function(cmp) {
        
        var prechatFieldComponents = cmp.find("prechatField");
        var apiNamesMap = this.createAPINamesMap(cmp.find("prechatAPI").getPrechatFields());
        var fields;
        
        console.log('prechatFieldComponents=' + JSON.stringify(prechatFieldComponents));
        console.log('apiNamesMap=' + JSON.stringify(apiNamesMap));
        
        // Make an array of field objects for the library.
        fields = this.createFieldsArray(apiNamesMap, prechatFieldComponents);
        console.log('fields=' + JSON.stringify(fields));
        
        fields = this.populatePrechatParamValues(cmp);
        
        console.log('fields.2=' + JSON.stringify(fields));
        
        // If the prechat fields pass validation, start a chat.
        if(cmp.find("prechatAPI").validateFields(fields).valid) {
            cmp.find("prechatAPI").startChat(fields);
        } else {
            console.warn("Prechat fields did not pass validation!");
        }
    },
    populatePrechatParamValues : function(cmp)
    {
        var prechatParamMap = cmp.get("v.prechatParamMap");
        var fieldCmps = cmp.find("prechatField");
        var apiNamesMap = this.createAPINamesMap(cmp.find("prechatAPI").getPrechatFields());
        
        if(fieldCmps.length) {
            console.log('1');
            fieldCmps.forEach(function(fieldCmp) {
                var key = apiNamesMap[fieldCmp.get("v.label")];
                if (key in prechatParamMap)
                {
                    prechatParamMap[key].value = fieldCmp.get("v.value"); 
                }
                /*
                console.log('2');
                for (var i=0; i < fields.length; i++)
            {
                console.log('3');
                console.log('fieldCmp.name=' + fieldCmp.get("v.name"));
                console.log('field.name=' + fields[i].name);
                if (fieldCmp.get("v.name") == fields[i].name)
                {
                    console.log('4');
                    fields[i].value = fieldCmp.get("v.value");
                    console.log('5');
                }
                console.log('6');
            }
            */
            });
        }
        console.log('2');
        var tmpResp = [];
        for (var property in prechatParamMap) 
        {
            console.log('property=' + property);
            if (prechatParamMap.hasOwnProperty(property)) {
                tmpResp.push(prechatParamMap[property]);
            }
        }
        
        return tmpResp;
    },
    
    /**
     * Create an array of field objects to start a chat from an array of prechat fields.
     * 
     * @param fields - Array of prechat field Objects.
     * @returns An array of field objects.
     */
    createFieldsArray: function(apiNames, fieldCmps) {
        if(fieldCmps.length) {
            return fieldCmps.map(function(fieldCmp) {
                return {
                    label: fieldCmp.get("v.label"),
                    value: fieldCmp.get("v.value"),
                    name: apiNames[fieldCmp.get("v.label")]
                };
            }.bind(this));
        } else {
            return [];
        }
    },
    createParamMap: function(fields) {
        var tmpMap = {};
        
        if(fields.length) {
            fields.forEach(function(field) {
                console.log('field.name=' + field.name);
                tmpMap[field.name] = 
                    {
                    label: field.label,
                    value: '',
                    name: field.name
                };
            });
        } 
        
        console.log('tmpMap=' + JSON.stringify(tmpMap));
        return tmpMap;
    },
    
    /**
     * Create map of field label to field API name from the pre-chat fields array.
     * 
     * @param fields - Array of prechat field Objects.
     * @returns An array of field objects.
     */
    createAPINamesMap: function(fields) {
        var values = {};
        
        fields.forEach(function(field) {
            values[field.label] = field.name;
        });
        
        return values;
    },
    
    /**
     * Create an array in the format $A.createComponents expects.
     * 
     * Example:
     * [["componentType", {attributeName: "attributeValue", ...}]]
     * 
     * @param prechatFields - Array of prechat field Objects.
     * @returns Array that can be passed to $A.createComponents
     */
    getPrechatFieldAttributesArray: function(prechatFields) {
        // $A.createComponents first parameter is an array of arrays. Each array contains the type of component being created, and an Object defining the attributes.
        var prechatFieldsInfoArray = [];
        
        // For each field, prepare the type and attributes to pass to $A.createComponents.
        prechatFields.forEach(function(field) {
            if (field.name != 'Latitude__c' &&
                field.name != 'Longitude__c' &&
                field.name != 'Full_Address__c' &&
                field.name != 'Street__c' &&
                field.name != 'City__c' &&
                field.name != 'State__c' &&
                field.name != 'Zip__c')
            {
                console.log('field=' + JSON.stringify(field));
                var componentName = (field.type === "inputSplitName") ? "inputText" : field.type;
                var componentInfoArray = ["ui:" + componentName];
                var attributes = {
                    "aura:id": "prechatField",
                    required: field.required,
                    label: field.label,
                    disabled: field.readOnly,
                    maxlength: field.maxLength,
                    class: field.className,
                    value: field.value
                };
                
                // Special handling for options for an input:select (picklist) component.
                if(field.type === "inputSelect" && field.picklistOptions) attributes.options = field.picklistOptions;
                
                // Append the attributes Object containing the required attributes to render this prechat field.
                componentInfoArray.push(attributes);
                
                // Append this componentInfoArray to the fieldAttributesArray.
                prechatFieldsInfoArray.push(componentInfoArray);
            }
        });
        
        console.log(JSON.stringify(prechatFieldsInfoArray));
        
        return prechatFieldsInfoArray;
    },
    reverseGeocodeEsri: function(component, lat, lng) {
        console.log('reverseGeocodeEsri invoked...');
        var action = component.get("c.reverseGeocodeEsri");
        action.setParams({
            "lat": lat,
            "lng": lng
        });
        
        action.setCallback(this, function(a) {
            console.log('resp=' + a.getReturnValue());
            
            var resp = JSON.parse(a.getReturnValue());
            
            if (!resp.hasOwnProperty('error')) {
                var p = component.get('v.prechatParamMap');
                
                
                var fullAddr = '';
                if (resp.address.Address != null) fullAddr += resp.address.Address;
                if (resp.address.City != null) fullAddr += ', ' + resp.address.City;
                if (resp.address.Region != null) fullAddr += ', ' + resp.address.Region;
                if (resp.address.Postal != null) fullAddr += ' ' + resp.address.Postal;
                
                if (p.hasOwnProperty('Full_Address__c')) 
                {
                    p['Full_Address__c'].value = fullAddr;
                }
                
                
                if (p.hasOwnProperty('Street__c')) 
                {
                    p['Street__c'].value = resp.address.Address;
                }
                
                if (p.hasOwnProperty('City__c')) 
                {
                    p['City__c'].value = resp.address.City;
                }
                
                if (p.hasOwnProperty('State__c')) 
                {
                    p['State__c'].value = resp.address.Region;
                }
                
                if (p.hasOwnProperty('Zip__c')) 
                {
                    p['Zip__c'].value = resp.address.Postal;
                }
            }
            
            component.set("v.buttonVariant", "brand");
        });
        
        $A.enqueueAction(action);
    }
})