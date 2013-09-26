function createEvents(stage) {
	minutesOffset += 10;
	for (var i = 101; i <= 108; i++) {
		var room = rooms[i];
		var patient = room[0];
		var events = room[1];
		var queue = room[2];
		newItems = queue.fetchNew();
		
		$.each(newItems, function(i, event) {
			events.enqueue(event);
		});
		rooms[i] = [patient,events,queue];
	}

	refreshTimelines(0);
	resetControls();

	$('#digiclock').jdigiclock({
		minutesOffset : minutesOffset
	});
	
	//$('#clock').coolclock({
	//	minutesOffset : minutesOffset
	//});
}


function refreshTimelines(sensitivityLevel) {
	var level = sensitivityLevel;
	var html1f = f1.printExpected(level);
	var html2f = f2.printExpected(level);
	var html3f = f3.printExpected(level);
	var html4f = f4.printExpected(level);
	var html5f = f5.printExpected(level);
	var html6f = f6.printExpected(level);
	var html7f = f7.printExpected(level);
	var html8f = f8.printExpected(level);

	var html1p = e1.printPatient(level);
	var html2p = e2.printPatient(level);
	var html3p = e3.printPatient(level);
	var html4p = e4.printPatient(level);
	var html5p = e5.printPatient(level);
	var html6p = e6.printPatient(level);
	var html7p = e7.printPatient(level);
	var html8p = e8.printPatient(level);

	var html1e = e1.printAll(level);
	var html2e = e2.printAll(level);
	var html3e = e3.printAll(level);
	var html4e = e4.printAll(level);
	var html5e = e5.printAll(level);
	var html6e = e6.printAll(level);
	var html7e = e7.printAll(level);
	var html8e = e8.printAll(level);

	$('ul#f101').html(html1f);
	$('ul#f102').html(html2f);
	$('ul#f103').html(html3f);
	$('ul#f104').html(html4f);
	$('ul#f105').html(html5f);
	$('ul#f106').html(html6f);
	$('ul#f107').html(html7f);
	$('ul#f108').html(html8f);

	$('div#p101').html(html1p);
	$('div#p102').html(html2p);
	$('div#p103').html(html3p);
	$('div#p104').html(html4p);
	$('div#p105').html(html5p);
	$('div#p106').html(html6p);
	$('div#p107').html(html7p);
	$('div#p108').html(html8p);

	$('ul#e101').html(html1e);
	$('ul#e102').html(html2e);
	$('ul#e103').html(html3e);
	$('ul#e104').html(html4e);
	$('ul#e105').html(html5e);
	$('ul#e106').html(html6e);
	$('ul#e107').html(html7e);
	$('ul#e108').html(html8e);

	registerListeners();

	$('div.sparkline').sparkline('html', {width : 176, height : 65, spotRadius : 5, spotColor : '#ff0000', minSpotColor : false, 
			maxSpotColor : false, lineWidth : 3, lineColor : '#777', barColor : 'red', chartRangeMin : 0, fillColor : '#fef8f8' });
	
	for (var i = 101; i <= 108; i++) {
		$(".lightbox." + i + 'rad').colorbox({ rel: i + 'rad', transition:"none", width:"70%", height:"70%", current: "Viser {current} av {total}" });
		$(".lightbox." + i + 'jou').colorbox({ rel: i + 'jou', transition:"none", width:"50%", height:"95%", current: "Viser {current} av {total}" });
	}
	
	$('div.event_text').hide();
}


function registerListeners() {
	var sensitivity = parseInt($('#auth').attr('value'));

	if (sensitivity >= 2) {
		$('#logon_label').html("Logged on");
		
		$('.event_heading').click(function() {
			var box = $(this).next('.event_text');
			box.slideToggle(200);
			
			if ($(this).parent().hasClass('old')) {
				$(this).parent().addClass('old-temp');
				$(this).parent().removeClass('old');
			}
			else if ($(this).parent().hasClass('medium')) {
				$(this).parent().addClass('medium-temp');
				$(this).parent().removeClass('medium');
			}
			else if ($(this).parent().hasClass('old-temp')) {
				$(this).parent().addClass('old');
				$(this).parent().removeClass('old-temp');
			}
			else if ($(this).parent().hasClass('medium-temp')) {
				$(this).parent().addClass('medium');
				$(this).parent().removeClass('medium-temp');
			}
		});

		$('div.patient').mousedown(function(event) {
			event.preventDefault();
			var roomId = $(this).parent().attr('id');
			var room = rooms[roomId];
			var patient = room[0];
			$(this).html('<div class="patient_label">' + patient.getId(2) + '</div>');
		}).mouseup(function() {
			var roomId = $(this).parent().attr('id');
			var room = rooms[roomId];
			var patient = room[0];
			$(this).html('<div class="patient_label">' + patient.getId(1) + '</div>');
		});
	} 
	
	else if (sensitivity == 1) {
		$('#logon_label').html("Identified as");
		$('.event_heading').click(function() { 

			if (!$(this).parent().hasClass('future')) {
			
				var openId = $("#open_id").attr('value');
				
				if (openId != $(this).attr('id'))
					$(this).next('.event_text').html('<div class="warning">Enter PIN code for more details..</div>');
				
				$(this).next('.event_text').slideToggle(200);
					$('#reveal_pinpanel').hide();
	
				if (openId != $(this).attr('id')) {
					if (openId.length > 0)
						$("#" + openId).next('.event_text').slideToggle(100);
						
					$("#open_id").attr('value', $(this).attr('id'));
	
					if (!$(this).parent().hasClass('future'))
						$("#pincode_panel").show();
				}
				else
					$("#open_id").attr('value', '');
			}
				
		});
	} 
	else
		resetControls();
}


function resetControls() {
	$('#auth').attr('value', 0);
	$("#pincode_panel").hide();
	$('#reveal_pinpanel').show();
	$('#login_smartcard').show();
	$("#open_id").attr('value', '');
	$('div.patient').unbind('mousedown mouseup');
}


function enterPin(digit) {
	var entered = parseInt($('#pin').attr('value')) + 1;
	if (entered == 4) {
		$('#auth').attr('value', 2);
		refreshTimelines(2);
		$("#pincode_panel").hide();
		$('#pin').attr('value', 0);
		var openId = $("#open_id").attr('value');
		if (openId.length > 0) {
			$("#open_id").attr('value', '');
			$("#" + openId).next('.event_text').slideToggle(100);
			
			if ($("#" + openId).parent().hasClass('old')) {
				$("#" + openId).parent().addClass('old-temp');
				$("#" + openId).parent().removeClass('old');
			}
			else if ($("#" + openId).parent().hasClass('medium')) {
				$("#" + openId).parent().addClass('medium-temp');
				$("#" + openId).parent().removeClass('medium');
			}
		}
	} 
	
	else
		$('#pin').attr('value', entered);
}

function sendMessage(eventId) {
	var event = events.get(eventId);
	alert('Details for ' + event.patient.name + ': "' + event.description
			+ '" has been sent via SMS!');
	var html = event.printInfo(1, eventId);
	$('#label' + eventId).html(html);
	$('#label' + eventId + ' .text_label').css('color', '#444');
	$('#send' + eventId).html('');
}
