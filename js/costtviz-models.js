eventType = new enums.Enum('LAB', 'SURGERY', 'RADIOLOGY', 'JOURNAL', 'COMMENT');

function Event(patient, type, description, age, expectFromMinute, expectationUncertainty, data, attachments) {
	this.patient = patient;
	this.type = type;
	this.description = description;
	this.age = age; // Relative to simulation start (0)
	this.expectFromMinute = expectFromMinute;
	this.expectationUncertainty = expectationUncertainty;
	this.data = data;
	this.attachments = attachments;
	

	this.print = function(index, sensitivityLevel) {
		var boxId = this.patient.getRoom() + '-' + index;
    	var html = '<li class="event ' + this.getTypeClass(sensitivityLevel) + this.getAgeClass() + '" id="' + boxId + '">' 
    			+ '<div class="event_heading" id="' + boxId + 'head">' + this.printHeading(sensitivityLevel) + '</div>'
    			+ '<div class="event_text" id="' + boxId + 'text">' + this.printData() + '</div></li>';
	   	return html;
	};

	this.printHeading = function(sensitivityLevel) {
		var html;
		if (sensitivityLevel >= 1)
			html = '<div class="time_label faded">' + this.getAgeText(this.getAge()) + '</div>' + this.description;
		else
			html = '<div class="time_label">' + this.getAgeText(this.getAge()) + '</div>';
		return html;
	};
	
	
	this.printData = function() {
		var html = '';
		
		if (this.data) {
			
			if (this.type == eventType.LAB) {
			    $.each(this.data, function(i, sample) {
					html += '<div class="lab_label">' + sample[0] + '</div><div class="sparkline"><!-- ' + sample[1] + ' --></div>';		    	
			   	});
			}
			
			else if (this.type == eventType.RADIOLOGY) {
				var description = this.data;
				
				if (this.attachments) {
					var roomId = this.patient.getRoom();
					
				    $.each(this.attachments, function(i, resource) {
				    	if (i == 0)
							html += '<a class="lightbox ' + roomId + 'rad" href="res/' + resource + '">' + description +'<br/>'
									+ '<img src="res/' + resource + '" class="radiology_thumb" /></a>';
				    	else
				    		html += '<a class="lightbox ' + roomId + 'rad" href="res/' + resource + '" />';		    	
				   	});				
				}
				else
					html += description;
			}

			else if (this.type == eventType.JOURNAL || this.type == eventType.SURGERY) {
				html += this.data;
				
				if (this.attachments) {
					var roomId = this.patient.getRoom();
					
				    $.each(this.attachments, function(i, resource) {
				    	if (i == 0)
							html += '<p style="text-align: right; margin-bottom: 0;"><a class="lightbox ' + roomId + 'jou" href="res/' + resource + '">Read full note..</a></p>';
				    	else
				    		html += '<a class="lightbox ' + roomId + 'jou" href="res/' + resource + '" />';		    	
				   	});				
				}				
			}
			
			else
				html = this.data;
		}
		else
			html = '<span class="gray">Info not available..</span>';
		return html;
	};
	
	
	this.printAsUpcoming = function(index, sensitivityLevel) {
		var boxId = this.patient.getRoom() + '-' + index;
    	var html = '<li class="event ' + this.getTypeClass(sensitivityLevel) + ' future" id="' + boxId + '">' 
    			+ '<div class="event_heading" id="' + boxId + 'head">' + this.printUpcomingHeading(sensitivityLevel) + '</div></li>';
	   	return html;
	};
	
	
	this.printUpcomingHeading = function(sensitivityLevel) {
		var html;
		if (sensitivityLevel >= 1) {
			html = '<div class="time_label faded">' + this.getFutureText(-this.getAge(), this.expectationUncertainty) 
				+ '</div>' + this.description;
		}
		else
			html = '<div class="time_label">' + this.getFutureText(-this.getAge(), this.expectationUncertainty) + '</div>';
		return html;		
	};
	
	
	this.getTypeClass = function(sensitivityLevel) {
		var className = '';
		switch (this.type) {
			case eventType.LAB : className = 'lab'; break;
			case eventType.SURGERY : className = 'surgery'; break;
			case eventType.RADIOLOGY : className = 'radiology'; break;
			case eventType.JOURNAL : className = 'journal'; break;
			case eventType.COMMENT : className = 'comment'; break;
			default : className = 'lab';
		};
		if (sensitivityLevel == 0)
			className = 'icon ' + className;
		return className;
	};
	
	this.getAge = function() {
		return this.age + minutesOffset;
	};

	this.getAgeClass = function() {
		if (this.getAge() > 60)
			return ' old';
		else if (this.getAge() > 30)
			return ' medium';
		else 
			return '';			
	};
	
	
	this.getFutureText = function(minutesIntoFuture, expectedUncertainty) {
		var start = new Date();
		start.setMinutes(start.getMinutes() - minutesIntoFuture);
	    var age = new Date().getTime() - start.getTime();
	    var ageNumber, ageRemainder, ageWords;

	    if (age < 3600000 && ((expectedUncertainty*6000)-age < 3600000)) {

		    if (age < 100000) {
		    	if (expectedUncertainty < 5)
		    		ageWords = 'expected now';
		    	else
		    		ageWords = 'in ' + expectedUncertainty + ' min';
		    }
		    
		    else if (age > 2700000) {
		        ageWords = 'app. 1 hour';
		    }
		    
		    else {
		    	
			    if (age < 300000) {
			    	if (expectedUncertainty < 5)
			        ageWords = '5';
			    }
		
			    else if (age < 900000)
			        ageWords = '15';
			    
			    else
			    	ageWords = '30';
			    
			    ageWords = 'app. ' + ageWords + ' min';
		    }
	    }
	    else { //if(age < 86400000) 
	        // less than one day old
	    	if (this.expectationUncertainty < 10) {
		        ageNumber = Math.floor(age / 3600000);
		        ageWords = jsFormatQty(ageNumber, 'hour', 'hours');
		        if (this.expectationUncertainty > 0)
		        	ageWords = 'app. ' + ageWords;
		        ageRemainder = Math.floor((age - ageNumber * 3600000) / 60000);
		        
		        if (ageNumber == 1 && ageRemainder >= 15)
		        	ageWords = "app. 1.5 hours";
		        else if (ageNumber < 0)
		        	ageWords = '';
	    	}
	    	else
	    		ageWords = '';
	    }
	    
	    return ageWords;
	};
	

	this.getAgeText = function(ageMinutes) {
		var start = new Date();
		start.setMinutes(start.getMinutes() - ageMinutes);
	    var age = new Date().getTime() - start.getTime();
	    var ageNumber, ageRemainder, ageWords;
	    
	    if (age < 3600000) {
	        // less than one hour old
	        ageNumber = Math.floor(age / 60000);
	        ageWords = ageNumber + ' min';
	    } 
	    else { 
	    	
	    	if (age > 86400000) { 
	    		// more than one day old
	    		if (age > 172800000)
	    			ageWords = Math.round(age/86400000) + ' days';
	    		else
	    			ageWords = "yesterday";
	    	}
	    	else {
		        ageNumber = Math.floor(age / 3600000);
		        ageWords = jsFormatQty(ageNumber, 'hour', 'hours');
		        ageRemainder = Math.floor((age - ageNumber * 3600000) / 60000);
		        if (ageNumber == 1 && ageRemainder >= 15)
		        		ageWords = "1.5 hours";
	    	}
	    }
	    return ageWords;
	};
}



function Patient(name, semiProtectedName, initials, birthDate, birthYear, roomNumber) {
	this.name = name;
	this.semiProtectedName = semiProtectedName;
	this.initials = initials;
	this.birthDate = birthDate;
	this.birthYear = birthYear;
	this.roomNumber = roomNumber;
	
	this.getId = function(level) {
		var id;
		if (level <= 0)
			id = '&nbsp;';
		else if (level == 1)
			id = this.roomNumber; //this.getInitials() + " " + this.getBirthYear();
		else if (level == 2)
			id = this.name + '<br/>' + this.birthDate; 
		return id;
	};
	
	this.getInitials = function() {
		return this.initials;
	};
	this.getBirthYear = function() {
		return this.birthYear.substr(2,2);
	};
	this.getSemiProtectedName = function() {
		return this.semiProtectedName;
	};
	this.getRoom = function() {
		return this.roomNumber;
	};
}