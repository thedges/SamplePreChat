({
    /**
     * On initialization of this component, set the prechatFields attribute and render prechat fields.
     * 
     * @param cmp - The component for this state.
     * @param evt - The Aura event.
     * @param hlp - The helper for this state.
     */
	onInit: function(cmp, evt, hlp) {
        var self = this;
        
        // Get prechat fields defined in setup using the prechatAPI component.
		var prechatFields = cmp.find("prechatAPI").getPrechatFields();

        // Get prechat field types and attributes to be rendered.
        var prechatFieldComponentsArray = hlp.getPrechatFieldAttributesArray(prechatFields);
        
        console.log('prechatFields=' + JSON.stringify(prechatFields));
        console.log('prechatFieldComponentsArray=' + JSON.stringify(prechatFieldComponentsArray));
        
        var prechatParamMap = hlp.createParamMap(prechatFields);
        cmp.set('v.prechatParamMap', prechatParamMap);
        
        console.log('prechatParamMap=' + JSON.stringify(prechatParamMap));
        
        navigator.geolocation.getCurrentPosition($A.getCallback(function(location) {
          cmp.set("v.currLat", location.coords.latitude);
          cmp.set("v.currLng", location.coords.longitude);
          
          var p = cmp.get('v.prechatParamMap');
          if (p.hasOwnProperty('Latitude__c')) 
          {
            p['Latitude__c'].value = location.coords.latitude.toString();
          }
            
          if (p.hasOwnProperty('Longitude__c')) 
          {
            p['Longitude__c'].value = location.coords.longitude.toString();
          }
            
          hlp.reverseGeocodeEsri(cmp, location.coords.latitude, location.coords.longitude);
        }));
        
        // Make asynchronous Aura call to create prechat field components.
        $A.createComponents(
            prechatFieldComponentsArray,
            function(components, status, errorMessage) {
                if(status === "SUCCESS") {
                    cmp.set("v.prechatFieldComponents", components);
                }
            }
        );
    },
    
    /**
     * Event which fires when start button is clicked in prechat.
     * 
     * @param cmp - The component for this state.
     * @param evt - The Aura event.
     * @param hlp - The helper for this state.
     */
    handleStartButtonClick: function(cmp, evt, hlp) {
        hlp.onStartButtonClick(cmp);
    }
})