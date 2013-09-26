function jsFormatQty(qty, singular, plural) {
    return String(qty).replace(/\d{1,3}(?=(\d{3})+(?!\d))/g, '$&,') + '\u00a0' + (qty == 1 ? singular : plural);
}

function EventQueue(patient) {
	this.items = [];
	this.patient = patient;
	
	this.getAll = function() {
		return this.items;
	};
	
	this.get = function(index) {
		return this.items[index];
	};

	this.enqueue = function(event) {
		if (this.items.length > 20)
		  this.remove();

	    this.add(event);
	};
	
	this.add = function(event) {
		this.items.push(event);
	};
		
	this.remove = function() {
		this.items.shift();
	};
	
	this.printAll = function(sensitivityLevel) {
		var ul_items = [];
	    $.each(this.items, function(i, event) {
	    	ul_items.push(event.print(i, sensitivityLevel));
	   	});
	    return ul_items.reverse().join('');
	};
	
	
	this.printPatient = function(sensitivityLevel) {
		sensitivityLevel = sensitivityLevel ? 1 : 0;
		return '<div class="patient_label">' + this.patient.getId(sensitivityLevel) + '</div>';
	};
}



function UpcomingQueue() {
	this.items = [];
	
	this.getAll = function() {
		return this.items;
	};
	
	this.fetchNew = function() {
		var readyItems = [];
		var newItemList = [];
	    $.each(this.items, function(i, event) {
	    	
	    	if (event.age > -minutesOffset)
	    		readyItems.push(event);
	    	else
	    		newItemList.push(event);
	    });
	    this.items = newItemList;
	    return readyItems;
	};
	
		
	this.add = function(event) {
		this.items.push(event);
	};
	
	
	this.printExpected = function(sensitivityLevel) {
		var lab = [];
		var rad = [];
		var jou = [];
		var sur = [];
		var com = [];
		var ul_items = [];

	    $.each(this.items, function(i, event) {	
	    	if (event.expectFromMinute != null && event.expectFromMinute <= minutesOffset) {
	    		switch (event.type){
		    		case eventType.LAB : lab.push(event); break;
		    		case eventType.RADIOLOGY : rad.push(event); break;
		    		case eventType.SURGERY : jou.push(event); break;
		    		case eventType.JOURNAL : sur.push(event); break;
		    		case eventType.COMMENT : com.push(event); break;
	    		}
	    	}
	   	});
	    
	    if (lab.length > 0) {
	    	var clone = $.extend({}, lab[0]);
	    	var desc = '';
	    	var avgUntil = -clone.age - minutesOffset;
		    $.each(lab, function(i, event) {
		    	desc += i > 0 ? ', ' : '';
		    	desc += event.description;
		    	avgUntil = (avgUntil + (-event.age - minutesOffset)) / 2;
		    });
		    
		    clone.description = desc;
		    clone.age = -avgUntil;
		    ul_items.push(clone.printAsUpcoming(1, sensitivityLevel));
	    }
	    
	    if (rad.length > 0) {
	    	var clone = $.extend({}, rad[0]);
	    	var desc = '';
		    $.each(rad, function(i, event) {
		    	desc += i > 0 ? ', ' : '';
		    	desc += event.description;
		    });
		    clone.description = desc;
		    ul_items.push(clone.printAsUpcoming(1, sensitivityLevel));
	    }
	    
	    if (sur.length > 0) {
	    	var desc = '';
		    $.each(sur, function(i, event) {
		    	desc += i > 0 ? ', ' : '';
		    	desc += event.description;
		    });
		    var event = sur[0];
		    //event.description = desc;
		    ul_items.push(event.printAsUpcoming(1, sensitivityLevel));
	    }
	    
	    if (jou.length > 0) {
	    	var desc = '';
		    $.each(jou, function(i, event) {
		    	desc += i > 0 ? ', ' : '';
		    	desc += event.description;
		    });
		    var event = jou[0];
		    //event.description = desc;
		    ul_items.push(event.printAsUpcoming(1, sensitivityLevel));
	    }
	    
	    //ul_items.push(event.printAsUpcoming(i, level));
	    return ul_items.reverse().join('');
	};
}
