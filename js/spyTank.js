jQuery(function($) {
    var gamepad = new Gamepad(),
        stController = {
            "right" : document.querySelector( '#st-controller-right' ),
            "left"  : document.querySelector( '#st-controller-left' ),  
        } 
        commands = {
            "right" : {
                stop     : 0,
                forward  : 1,
                backward : 2,
                last     : 0
            },
            "left" : {
                stop     : 3,
                forward  : 4,
                backward : 5,
                last     : 3
            }
        };

    gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
        console.log( 'Connected', device );
        $('#connect-notice').hide();
    });

    gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
        console.log('Disconnected', device);
        
        if (gamepad.count() == 0) {
            $('#connect-notice').show();
        }
    });

    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
        // dropping x axis movements
        if ( e.axis === 'LEFT_STICK_X' || e.axis === 'RIGHT_STICK_X' ) {
            return;
        }

        var roundedValue = Math.round( e.value * 10 ),
            speed = Math.abs( roundedValue ),
            sticky = ( e.axis === 'LEFT_STICK_Y' ) ? 'left' : 'right',
            action,
            command,
            url;
    
        if ( roundedValue < -5 ) {
            action = 'forward';
        } else if ( roundedValue > 5 ) {
            action = 'backward';
        } else {
            action = 'stop';
        }

        command = commands[ sticky ][ action ];
        if ( command !== commands[ sticky ].last ) {
            commands[ sticky ].last = command;

            url = 'http://192.168.1.100/wifi_car_control.cgi?param=' + speed + '&command=' + command;
            stController[ sticky ].src = url;
        }

        // Data visualization
        e.gamepad.axes.forEach( function( axe, i ) {
            var rounded = Math.round( axe * 10 );
            $( '#rounded-axis-' + i ).text( rounded );
        });
    });

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
        $('#log-' + e.gamepad.index).append('<li>' + e.control + ' down</li>');
    });
    
    gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
        $('#log-' + e.gamepad.index).append('<li>' + e.control + ' up</li>');
    });

    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
        $('#log-' + e.gamepad.index).append('<li>' + e.axis + ' changed to ' + e.value + '</li>');
    });

    if (!gamepad.init()) {
        alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
    }
});