
/** Global namespace object to house the entire widget. */
var BINARYCLOCK = BINARYCLOCK || {};

/**
 * Starts the clock. The time begins updating
 * per second, and the widget reflects changes.
 */
BINARYCLOCK.start = function () {

  "use strict";

  // a flag to identify when clock is drawn for the first time
  BINARYCLOCK.newDisplay = true;

  // get initial time readings
  BINARYCLOCK.hours   = BINARYCLOCK.getCurrentTime('h');
  BINARYCLOCK.minutes = BINARYCLOCK.getCurrentTime('m');

  // update clock at second intervals
  if (typeof BINARYCLOCK.blockIntervalID === 'number') {
    window.clearInterval(BINARYCLOCK.blockIntervalID);
  }
  BINARYCLOCK.blockIntervalID = window.setInterval(function () {
    BINARYCLOCK._update();
  }, 1000);
};

/**
 * Gets the current time.
 * @param unit  Accepts 'h', 'm', or 's' as a parameter. If no
 *              parameter is given, or if none of the above three
 *              are recognized, the local time string is returned.
 */
BINARYCLOCK.getCurrentTime = function (unit) {

  "use strict";

  var currentTime = new Date();

  switch (unit) {
    case 'h':
      return currentTime.getHours();
    case 'm':
      return currentTime.getMinutes();
    case 's':
      return currentTime.getSeconds();
    default:
      return currentTime.toLocaleTimeString();
  }
};

/** Color combinations for blocks. */
BINARYCLOCK.colorPalettes = [
  [ '#e2ddb7', '#d97036', '#b8b690' ],   // beige | orange | olive
  [ '#aabebf', '#c79a95', '#d6c79e' ],   // turquoise | pink | yellow
  [ '#ac5251', '#6a6869', '#cba990' ],   // red | charcoal | beige
  [ '#ed9c6f', '#eddbc3', '#c5b4aa' ],   // orange | beige | plum
  [ '#7f695c', '#ef9a25', '#bfbe62' ],   // brown | orange | lime
  [ '#bbc183', '#9a3231', '#949460' ],   // light green | crimson | dark green
  [ '#206536', '#76ad2e', '#badc61' ]    // dark green | green | light green
];

/**
 * Registers default values for UI options.
 */
BINARYCLOCK.options = {
  titleDisplay:         true,
  numbersOnBlocks:      false,
  mode:                 'day',
  layout:               'horizontal',
  panel:                { init: null },
  tab:                  { display: true },
  timeDigits:           { display: false },
  selectedColorPalette: BINARYCLOCK.colorPalettes[0]
};

/**
 * Draws the clock widget onto the screen, based
 * on the setting at BINARYCLOCK.options.layout.
 * 
 * Horizontal layout is drawn by default.
 */
BINARYCLOCK.drawClock = function () {

  "use strict";

  var layout = BINARYCLOCK.options.layout,
      horizontalOffset,
      verticalOffset,
      svgElem,
      column,
      group,
      row;

  if ($('#clockWidget').has('svg').length > 0) {
    $('#clockWidget svg').remove();
  }

  svgElem = d3.select('#clockWidget').append('svg:svg');

  svgElem
    .attr('height', 400)
    .attr('width', 600);

  // configure offsets
  if (layout === 'horizontal') {
    verticalOffset   = 50;
    horizontalOffset = 0;
  } else {
    // vertical blocks are drawn from
    // bottom to top, so start at bottom
    verticalOffset   = 330;
    horizontalOffset = 100;
  }

  // iterate through hour, minute and second rows, creating six blocks for each row.
  // each block is a <g> (group) element which contains a <rect> and <text> element.
  if (layout === 'horizontal') {
    for (row = 2; row >= 0; row -= 1) {
      for (column = 5; column >= 0; column -= 1) {
        group = svgElem.append('g');
        group.append('svg:rect')
          .attr('fill', BINARYCLOCK.options.selectedColorPalette[row])
          .attr('stroke', BINARYCLOCK.options.selectedColorPalette[row])
          .attr('stroke-width', 3)
          .attr('x', horizontalOffset + 15)
          .attr('y', verticalOffset + 34)
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('width', 70)
          .attr('height', 30)
          .attr('fill-opacity', "0.1")
          .attr('stroke-opacity', "1.0");
        group.append('text')
          .attr('x', horizontalOffset + 21)
          .attr('y', verticalOffset + 56);

        horizontalOffset += 100;  // shift right 100px
      }
      verticalOffset += 100;      // shift down 100px
      horizontalOffset = 0;       // reset horizontal offset
    }
  } else {  // assume layout is vertical
    for (row = 2; row >= 0; row -= 1) {
      for (column = 5; column >= 0; column -= 1) {
        group = svgElem.append('g');
        group.append('svg:rect')
          .attr('fill', BINARYCLOCK.options.selectedColorPalette[row])
          .attr('stroke', BINARYCLOCK.options.selectedColorPalette[row])
          .attr('stroke-width', 3)
          .attr('x', horizontalOffset + 15)
          .attr('y', verticalOffset + 34)
          .attr('rx', 8)
          .attr('ry', 8)
          .attr('width', 70)
          .attr('height', 30)
          .attr('fill-opacity', "0.1")
          .attr('stroke-opacity', "1.0");
        group.append('text')
          .attr('x', horizontalOffset + 21)
          .attr('y', verticalOffset + 56);

        verticalOffset -= 70;   // shift up 70px
      }
      horizontalOffset += 150;  // shift right 150px
      verticalOffset = 330;     // reset vertical offset
    }
  }
};

/**
 * Toggles between night and day modes.
 * This method switches the setting at BINARYCLOCK.options.mode,
 * then updates the UI to reflect that setting.
 */
BINARYCLOCK.toggleMode = function () {

  "use strict";

  var mode = BINARYCLOCK.options.mode;

  // helper function
  // if no style attribute is provided,
  // defaults to 'background-color'
  function toggleColor(element, color, attribute) {
    if (typeof attribute === 'undefined') {
      attribute = 'background-color';
    }

    d3.select(element)
      .transition()
      .duration(800)
      .style(attribute, color);
  }

  if (mode === 'day') {
    BINARYCLOCK.options.mode = 'night';

    // turn screen dark
    $('body').attr('id', 'night');

    // darken panel background
    toggleColor('#optionTab rect', '#434237', 'fill');

    // switch button image
    $('#moon').fadeOut('fast', function () {
      $('#sun').fadeIn('slow');

      // darken horizontal rule
      $('#optionControls hr').css('background-color', '#a19d77');

      // lighten button text
      $('#optionControls button .ui-button-text').css('color', '#aaa');

      // darken buttons
      $('#optionControls button').css('background-color', '#424236');
      $('#optionControls button').css('border', '1px solid #a19d77');

      // darken background for onhover event
      $('#optionControls button').hover(
        function () {   // handlerIn
          $(this).css('background-color', '#323226');
        },
        function () {   // handlerOut
          $(this).css('background-color', '#424236');
        }
      );

      // lighten label text
      $('#optionControls > div > span').css('color', '#aaa');
    });
  } else {
    BINARYCLOCK.options.mode = 'day';

    // turn screen light
    $('body').attr('id', 'day');

    // lighten panel background
    toggleColor('#optionTab rect', '#f1eedc', 'fill');

    // switch button image
    $('#sun').fadeOut('fast', function () {
      $('#moon').fadeIn('slow');

      // lighten horizontal rule
      $('#optionControls hr').css('background-color', '#e1ddb7');

      // darken button text
      $('#optionControls button .ui-button-text').css('color', '#6c6c6b');

      // lighten buttons
      $('#optionControls button').css('background-color', '#f3f1e4');
      $('#optionControls button').css('border', '1px solid #e1ddb7');

      // lighten background for onhover event
      $('#optionControls button').hover(
        function () {   // handlerIn
          $(this).css('background-color', '#faf7f0');
        },
        function () {   // handlerOut
          $(this).css('background-color', '#f3f1e4');
        }
      );

      // darken label text
      $('#optionControls > div > span').css('color', '#6c6c6b');
    });
  }
};

/**
 * Toggles between horizontal and vertical layouts.
 * This method toggles the setting at BINARYCLOCK.options.layout,
 * then updates the UI to reflect that setting.
 */
BINARYCLOCK.toggleLayout = function () {

  "use strict";

  var layout     = BINARYCLOCK.options.layout,
      timeDigits = BINARYCLOCK.options.timeDigits,
      rectElems  = d3.selectAll('#clockWidget rect'),
      textElems  = d3.selectAll('#clockWidget text'),
      horizontalOffset,
      verticalOffset,
      i;

  // temporarily stop clock widget - necessary because d3 is not
  // able to handle both transitions simultaneously, i.e. fading
  // blocks in and out while moving them to a new position
  window.clearInterval(BINARYCLOCK.blockIntervalID);

  if (layout === 'horizontal') {
    BINARYCLOCK.options.layout = 'vertical';
    verticalOffset   = 330;
    horizontalOffset = 100;

    for (i = 0; i < rectElems[0].length; i += 1) {
      d3.select(rectElems[0][i])
        .transition()
        .duration(1000)
        .attr('x', horizontalOffset + 15)
        .attr('y', verticalOffset + 34);
      d3.select(textElems[0][i])
        .transition()
        .duration(1500)
        .attr('x', horizontalOffset + 21)
        .attr('y', verticalOffset + 56);

      verticalOffset -= 70;       // shift up 70px

      if ((i + 1) % 6 === 0) {
        verticalOffset = 330;     // reset vertical offset
        horizontalOffset += 150;  // shift right 150px
      }
    }
  } else {
    BINARYCLOCK.options.layout = 'horizontal';
    verticalOffset   = 50;
    horizontalOffset = 0;

    for (i = 0; i < rectElems[0].length; i += 1) {
      d3.select(rectElems[0][i])
        .transition()
        .duration(1000)
        .attr('x', horizontalOffset + 15)
        .attr('y', verticalOffset + 34);
      d3.select(textElems[0][i])
        .transition()
        .duration(1500)
        .attr('x', horizontalOffset + 21)
        .attr('y', verticalOffset + 56);

      horizontalOffset += 100;  // shift right 100px

      if ((i + 1) % 6 === 0) {
        verticalOffset += 100;  // shift down 100px
        horizontalOffset = 0;   // reset horizontal offset
      }
    }
  }

  // restart clock widget
  // a 1 second delay is introduced so that blocks
  // begin updating after the transition finishes
  window.setTimeout(function () {
    BINARYCLOCK.start();
  }, 1000);

  // if time digits are shown, restart them so
  // they display according to updated layout
  if (timeDigits.display === true) {
    layout = BINARYCLOCK.options.layout;
    if ( (layout === 'horizontal' && $(window).width() < 1125) ||
         (layout === 'vertical' && $(window).height() < 545) ) {
      $('#timeDisplay').fadeOut(function () {
        if (layout === 'horizontal') {
          $('#timeDisplay').empty();
          $('#timeDisplay').removeClass('vertical');
          $('#timeDisplay').addClass('horizontal');
          $('#timeDisplay').append('<div id="h"><span class="label">h</span><span class="horizontal time"></span></div>');
          $('#timeDisplay').append('<div id="m"><span class="label">m</span><span class="horizontal time"></span></div>');
          $('#timeDisplay').append('<div id="s"><span class="label">s</span><span class="horizontal time"></span></div>');
        } else {
          $('#timeDisplay').empty();
          $('#timeDisplay').removeClass('horizontal');
          $('#timeDisplay').addClass('vertical');
          $('#timeDisplay').append('<div id="h"><span class="time"></span></div>');
          $('#timeDisplay').append('<div id="m"><span class="time"></span></div>');
          $('#timeDisplay').append('<div id="s"><span class="time"></span></div>');
        }
      });
    } else {
      timeDigits.stop();
      window.setTimeout(timeDigits.start, 1000);
    }
  }

  // check display in case options can't be
  // displayed after the layout is toggled
  // (applies to title display)
  BINARYCLOCK.checkDisplay();
};

/**
 * Initializes the options tab, i.e. creates an '#optionTab' <svg>
 * element.  The '#optionTab' is nested inside the '#optionPanel'
 * and comprises a <rect> and <text> grouping.
 *
 * In the DOM, '#optionTab' is a sibling element of '#optionControls'
 * and must appear before it.
 */
BINARYCLOCK.options.tab.init = function () {

  "use strict";

  var svgElem  = d3.select('#optionPanel').insert('svg:svg', '#optionControls'),
      group    = svgElem.append('g').style('display', 'none'),
      rectElem = group.append('svg:rect'),
      textElem = group.append('text');

  svgElem
    .attr('id', 'optionTab');
  rectElem
    .attr('x', 92)
    .attr('y', 232)
    .attr('rx', 8)
    .attr('ry', 8)
    .attr('width', 94)
    .attr('height', 50);
  textElem
    .attr('x', 101)
    .attr('y', 258)
    .text('options');

  // 1 second delay synchronizes tab display
  // with blocks upon initial time reading
  window.setTimeout(function () {
    $(group[0]).fadeIn();
  }, 1000);
};

/**
 * Defines hover functionality for options tab and panel.
 * There are four noteworthy points:
 * 
 *   1. When user hovers over option tab, the option panel displays
 *   2. When user hovers outside of option panel, the panel disappears and the tab reappears
 *   3. When the option panel is not displayed and the cursor is still, the tab disappears
 *   4. When the user moves the cursor and the option tab is hidden, the tab reappears
 */
BINARYCLOCK.options.tab.hoverFunctionality = function () {

  "use strict";

  var timer;

  // hide tab and display panel
  $('#optionTab > g > rect')
    .mouseenter(function () {
      if ( $(this).attr('width') === '94' &&
           $('#optionControls').css('display') === 'none' ) {

        window.clearTimeout(timer);  // in case tab is about to disappear
        d3.select('#optionTab rect')
          .transition()
          .duration(800)
          .attr('width', 275)
          .attr('height', 275)
          .attr('fill-opacity', '0.9')
          .attr('x', 0)
          .attr('y', 20)
          .attr('rx', 13)
          .attr('ry', 13);
        $('#optionTab text')
          .fadeOut('slow');
        $('#optionControls')
          .delay(800)
          .fadeIn();
      }
    });

  // hide panel and redisplay tab
  $('#optionControls')
    .mouseleave(function () {
      if ( $('#optionTab > g > rect').attr('width') === '275' ) {
        $('#optionControls')
          .fadeOut('fast', function () {
            $('#optionTab text')
              .fadeIn('slow');
            d3.select('#optionTab rect')
              .transition()
              .duration(800)
              .attr('width', 94)
              .attr('height', 50)
              .attr('fill-opacity', '1')
              .attr('x', 92)
              .attr('y', 230)
              .attr('rx', 8)
              .attr('ry', 8);
          });

        // hide tab after user hovers outside option panel
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          if ( $('#optionControls').css('display') === 'none' ) {
            $('#optionTab').stop().animate({'opacity': 0});
          }
        }, 4000);
      }
    });

  // display tab if mouse moves; set timer to hide when still
  $(document).mousemove(function () {

    if ( $('#optionControls').css('display') === 'none' ) {  // if panel isn't displayed

      // set timer when mouse moves for first time on new page
      if (typeof timer === 'undefined') {
        timer = window.setTimeout(function () {
          $('#optionTab').stop().animate({'opacity': 0});
        }, 4000);
      }

      if ( $('#optionTab').css('opacity') === '0' ) {  // if tab isn't displayed
        $('#optionTab').animate({'opacity': 1});       // display it

        window.clearTimeout(timer);
        timer = window.setTimeout(function () {        // reset timer to hide tab in 4s
          $('#optionTab').stop().animate({'opacity': 0});
        }, 4000);
      }
    }
  });
};

/**
 * Initializes the option panel.  It first injects option elements
 * into the page DOM, then creates UI functionality for all options.
 */
BINARYCLOCK.options.panel.init = function () {

  "use strict";

  var timeDigits = BINARYCLOCK.options.timeDigits,
      titleDisplay,

      // strings for setting up option elements in DOM
      titleString, timeDisplayString, numbersOnBlocksString, hrString, modeString, layoutString, controlStrings;

  titleString           = '<div><span id="titleBtnLabel">hide</span><button id="titleBtn">title</button></div>';
  timeDisplayString     = '<div><span id="timeDisplayBtnLabel">show</span><button id="timeDisplayBtn">time display</button></div>';
  numbersOnBlocksString = '<div><span id="blockNumberBtnLabel">show</span><button id="blockNumberBtn">numbers on blocks</button></div>';
  hrString              = '<hr>';
  modeString            = '<div id="mode">' +
                            '<span id="modeLabel">make nighttime</span>' +
                            '<button id="sun"><img src="resources/img/sun.png" height="41" width="41" alt="sun icon"></button>' +
                            '<button id="moon"><img src="resources/img/moon.png" height="42" width="39" alt="moon icon"></button>' +
                          '</div>';
  layoutString          = '<div id="layout">' +
                            '<span id="layoutLabel">make vertical</span>' +
                            '<button id="vertical"><img src="resources/img/vertical-icon.png" height="36" width="34" alt="vertical layout"></button>' +
                            '<button id="horizontal"><img src="resources/img/horizontal-icon.png" height="25" width="60" alt="horizontal layout"></button>' +
                          '</div>';

  controlStrings = titleString + timeDisplayString + numbersOnBlocksString + hrString + modeString + layoutString;

  $('#optionPanel').append('<div id="optionControls">');
  $('#optionControls').append(controlStrings);

  // toggle title
  $('#titleBtn').click(function () {
    titleDisplay = BINARYCLOCK.options.titleDisplay;
    if (titleDisplay === false) {
      BINARYCLOCK.options.titleDisplay = true;
      if ($(window).height() > 590 && $(window).width() > 650) {
        $('h1').fadeIn();
        $('#titleBtnLabel').fadeOut('fast', function () {
          $(this).text('hide').fadeIn();
        });
      }
    } else {
      BINARYCLOCK.options.titleDisplay = false;
      if ($(window).height() > 590 && $(window).width() > 650) {
        $('h1').fadeOut();
        $('#titleBtnLabel').fadeOut('fast', function () {
          $(this).text('show').fadeIn();
        });
      }
    }
  });

  // toggle time display
  $('#timeDisplayBtn').click(function () {
    if (timeDigits.display === false) {
      timeDigits.start();

      // restart clock so that blocks are synchronized with digits
      window.clearInterval(BINARYCLOCK.blockIntervalID);
      BINARYCLOCK.start();

      $('#timeDisplayBtnLabel').fadeOut('fast', function () {
        $(this).text('hide').fadeIn();
      });
    } else {
      timeDigits.stop();
      $('#timeDisplayBtnLabel').fadeOut('fast', function () {
        $(this).text('show').fadeIn();
      });
    }
  });

  // toggle numbers on blocks
  $('#blockNumberBtn').click(function () {
    if (BINARYCLOCK.options.numbersOnBlocks === false) {
      BINARYCLOCK.options.numbersOnBlocks = true;
      BINARYCLOCK.newDisplay = true;
      $('#blockNumberBtnLabel').fadeOut('fast', function () {
        $(this).text('hide').fadeIn();
      });
    } else {
      BINARYCLOCK.options.numbersOnBlocks = false;
      $('#clockWidget text').fadeOut();
      $('#blockNumberBtnLabel').fadeOut('fast', function () {
        $(this).text('show').fadeIn();
      });
    }
  });

  // toggle nighttime -> daytime
  $('#sun').click(function () {
    BINARYCLOCK.toggleMode();

    // switch label
    $('#modeLabel').fadeOut('fast', function () {
      $(this).text('make nighttime').fadeIn();
    });
  });

  // toggle daytime -> nighttime
  $('#moon').click(function () {
    BINARYCLOCK.toggleMode();

    // switch label
    $('#modeLabel').fadeOut('fast', function () {
      $(this).text('make daytime').fadeIn();
    });
  });

  // toggle horizontal layout
  $('#horizontal').click(function () {
    BINARYCLOCK.toggleLayout();

    // change button and label in option panel
    $(this).fadeOut('fast', function () {
      $('#vertical').fadeIn();
    });
    $('#layoutLabel').fadeOut('fast', function () {
      $(this).text('make vertical').fadeIn();
    });
  });

  // toggle vertical layout
  $('#vertical').click(function () {
    BINARYCLOCK.toggleLayout();

    // change button and label in option panel
    $(this).fadeOut('fast', function () {
      $('#horizontal').fadeIn();
    });
    $('#layoutLabel').fadeOut('fast', function () {
      $(this).text('make horizontal').fadeIn();
    });
  });

  // render jQuery buttons in option panel
  $('button').button();
};

/**
 * Activates regular updates to hour, minute, second digits
 * and displays digits in UI.
 * 
 * (For time digit display UI option.)
 */
BINARYCLOCK.options.timeDigits.start = function () {

  "use strict";

  var timeDigits = BINARYCLOCK.options.timeDigits,
      layout     = BINARYCLOCK.options.layout,
      triggerTimeUnitDisplay,
      timeUnits;

  timeDigits.display = true;

  triggerTimeUnitDisplay = function () {
    BINARYCLOCK.timeIntervalID = window.setInterval(function () {

      var timeReading,
          timeSelection;

      // iterate through the div elements, displaying time for each unit
      $.each(timeUnits, function (idx) {

        window.setTimeout(function () {  // a slight (150 ms) delay
                                         // is introduced, so digits
          switch (idx) {                 // are synchronized with blocks,
            case 0:                      // which fade in and out
              timeReading = BINARYCLOCK.hours;
              timeSelection = $('#h span.time');
              break;
            case 1:
              timeReading = BINARYCLOCK.minutes;
              timeSelection = $('#m span.time');
              break;
            case 2:
              timeReading = BINARYCLOCK.seconds;
              timeSelection = $('#s span.time');
              break;
          }

          if (timeReading.toString().length < 2) {
            timeReading = '0' + timeReading;
          }

          if (timeSelection.text() === '' ||          // required for start, when no text is displayed
              timeSelection.text() != timeReading) {  // implicit typecasting

            timeSelection.text(timeReading);
          }
        }, 150);  // end setTimeout
      });
    }, 1000);     // end setInterval
  };

  // set up DOM elements depending on layout
  if (layout === 'horizontal') {
    $('#timeDisplay').removeClass('vertical');
    $('#timeDisplay').addClass('horizontal');
    $('#timeDisplay').append('<div id="h"><span class="label">h</span><span class="horizontal time"></span></div>');
    $('#timeDisplay').append('<div id="m"><span class="label">m</span><span class="horizontal time"></span></div>');
    $('#timeDisplay').append('<div id="s"><span class="label">s</span><span class="horizontal time"></span></div>');

    // fade in after ~1 second so digits have a chance to update
    window.setTimeout(function () {
      $('#timeDisplay').css('opacity', 0);
      $('#timeDisplay').css('display', 'block');
      $('#timeDisplay').animate({opacity: 1});
    }, 1100);

  } else {
    $('#timeDisplay').removeClass('horizontal');
    $('#timeDisplay').addClass('vertical');
    $('#timeDisplay').append('<div id="h"><span class="time"></span></div>');
    $('#timeDisplay').append('<div id="m"><span class="time"></span></div>');
    $('#timeDisplay').append('<div id="s"><span class="time"></span></div>');

    // fade in after ~1 second so digits have a chance to update
    window.setTimeout(function () {
      // workaround: jQuery's animate does not work on (display: -webkit-box)
      $('#timeDisplay').css('opacity', 0);
      $('#timeDisplay').css('display', '-webkit-box');
      $('#timeDisplay').animate({opacity: 1});
    }, 1100);
  }

  // get a handle on DOM elements for hour, minute, second units
  timeUnits = $.makeArray($('#timeDisplay').children('div'));
  triggerTimeUnitDisplay();
};

/**
 * Stops regular updates to hour, minute, second digits.
 * (For time digit display UI option.)
 */
BINARYCLOCK.options.timeDigits.stop = function () {

  "use strict";

  BINARYCLOCK.options.timeDigits.display = false;
  window.clearInterval(BINARYCLOCK.timeIntervalID);

  $('#timeDisplay').fadeOut('fast', function () {
    $('#timeDisplay').empty();
  });
};

/**
 * Handles display & placement of UI components.
 *
 *   ‣ hides options tab if window width is less than 700px
 *   ‣ hides time digit display if:
 *       window height is less than 545px (vertical layout)
 *       window width is less than 1125px (horizontal layout)
 *   ‣ hides title if:
 *       window width is less than 522px or height is less than 630px (vertical layout)
 *       window width is less than 650px or height is less than 590px (horizontal layout)
 */
BINARYCLOCK.checkDisplay = function () {

  "use strict";

  var width         = $(window).width(),
      height        = $(window).height(),
      layout        = BINARYCLOCK.options.layout,
      timeDigits    = BINARYCLOCK.options.timeDigits,
      tabDisplay    = BINARYCLOCK.options.tab.display,
      titleDisplay  = BINARYCLOCK.options.titleDisplay;

  // hide title if not enough vertical or horizontal space
  if ( (layout === 'horizontal' && (height < 590 || width < 650)) ||
       (layout === 'vertical' && (height < 630 || width < 522)) ) {
    if (titleDisplay === true) {
      $('h1').fadeOut();
    }
    // if title button isn't already disabled...
    if ($('#titleBtn').button('option', 'disabled') !== true) {
      // disable it
      $('#titleBtn').button('option', 'disabled', true);
      // fade button label
      $('#titleBtnLabel').css('opacity', '0.9');
    }
  } else {
    if (titleDisplay === true &&
        $('h1').css('display') === 'none') {
      $('h1').fadeIn();
    }
    // if title button is still disabled...
    if ($('#titleBtn').button('option', 'disabled') !== false) {
      // activate it
      $('#titleBtn').button('option', 'disabled', false);
      // fade in button label
      $('#titleBtnLabel').css('opacity', '1');
    }
  }

  // hide time digits if there is not enough space to display them
  if ( (layout === 'horizontal' && width < 1125) ||
       (layout === 'vertical' && height < 545) ) {
    $('#timeDisplay').fadeOut();
    // if button in option panel isn't already deactivated...
    if ($('#timeDisplayBtn').button('option', 'disabled') !== true) {
      // deactivate it
      $('#timeDisplayBtn').button('option', 'disabled', true);
      // fade button label
      $('#timeDisplayBtnLabel').css('opacity', '0.9');
    }
  } else {
    if (timeDigits.display === true && $('#timeDisplay').css('display') === 'none') {
      // check if time digit display is correct for layout
      // use case: user can toggle layout triggering time digits to disappear.
      //           if window is resized so that digits appear, they must be
      //           reformatted according to the new layout.
      if ( layout === 'horizontal' ) {
        $('#timeDisplay').css('opacity', 0);
        $('#timeDisplay').css('display', 'block');
        $('#timeDisplay').animate({opacity: 1});
      } else {
        $('#timeDisplay').css('opacity', 0);
        $('#timeDisplay').css('display', '-webkit-box');
        $('#timeDisplay').animate({opacity: 1});
      }
    }
    // if button in option panel isn't already activated...
    if ($('#timeDisplayBtn').button('option', 'disabled') !== false) {
      // activate it
      $('#timeDisplayBtn').button('option', 'disabled', false);
      // unfade button label
      $('#timeDisplayBtnLabel').css('opacity', '1');
    }
  }

  // hide options tab if not enough space
  // to the right of the clock widget
  if (width < 700) {
    if (BINARYCLOCK.options.tab.display === true) {
      $('#optionTab').fadeOut();
      if ($('#optionControls').css('display') === 'block') {
        $('#optionControls').fadeOut('fast', function () {
          // if the panel is displayed when the hide action
          // takes place, revert tab to default state
          window.setTimeout(function () {
            $('#optionTab rect')
              .attr('width', 94)
              .attr('height', 50)
              .attr('fill-opacity', '1')
              .attr('x', 103)
              .attr('y', 257)
              .attr('rx', 8)
              .attr('ry', 8);
            $('#optionTab text').css('display', 'block');
          }, 500);
        });
      }
    }
  } else if (tabDisplay === true && $('#optionTab').css('display') === 'none') {
    $('#optionTab').fadeIn();
  }
};

/**
 * Initializes the widget (draws the clock and option panel in the UI)
 * and defines functionality that is bound to UI components.
 *
 * This method assumes that the page's DOM has already been set up,
 * and is self-invoking.
 */
BINARYCLOCK.init = (function () {

  "use strict";

  var drawClock          = BINARYCLOCK.drawClock,                       // draws the clock widget onto the screen
      checkDisplay       = BINARYCLOCK.checkDisplay,                    // handles display & placement of UI components
      prepareOptionsTab  = BINARYCLOCK.options.tab.init,                // sets up options tab
      prepareOptionPanel = BINARYCLOCK.options.panel.init,              // sets up option panel and UI functionality for options
      hoverFunctionality = BINARYCLOCK.options.tab.hoverFunctionality;  // defines hover functionality for options tab

  /**
   * The private update method is called repeatedly by a
   * setInterval call within the BINARYCLOCK's start method.
   * It updates the widget display so that it accurately
   * represents the current time.
   */
  BINARYCLOCK._update = function () {

    var column, row;

    // update seconds reading
    BINARYCLOCK.seconds = BINARYCLOCK.getCurrentTime('s');

    /**
     * Updates the display for an individual block.
     * Given the column and row (assumes horizontal layout)
     * it checks if the block is 'active', i.e. if it
     * is rendered as solid based on the current time.
     *
     * This method contains the following auxiliary functions:
     *   ‣ fade          (displays or hides blocks)     
     *   ‣ checkBlock    (checks whether block is active)
     *   ‣ toggleNumber  (displays or hides digits on blocks (for 'numbers on blocks' option))
     *
     * @param row     The row index (0 - 2). There are 3 rows from
     *                top to bottom: hour, minute, and second.
     * @param column  The specified column of the grid, whereby each
     *                column represents a quantity of 1, 2, 4, 8, etc.
     */
    function updateBlock(row, column) {

      var timeReading,  // the reading for hours, minutes or seconds, depending on the given row
          groupElements = d3.select('#clockWidget').selectAll('g');  // gets all 18 <g> elements

      /**
       * Fades a block in or out.
       *
       * @param toggle  Accepts 'in' or 'out' as parameters.
       * @param row     The row index.
       * @param column  The column index.       
       */
      function fade(toggle, row, column) {

        var fillOpacity, rectElement;

        // get <rect> element based on given column and row
        rectElement = d3.select(groupElements[0][(row * 6) + column])
                        .select('rect');

        // if toggle !== 'in' assume 'out'
        if (toggle === 'in') {
          fillOpacity = '1.0';
        } else {
          fillOpacity = '0.1';
        }

        rectElement
          .transition()
          .duration(400)
          .attr('fill-opacity', fillOpacity);
      }

      /**
       * The checkBlock function implements the algorithm
       * that determines whether, given the current time,
       * a block should be activated (i.e. filled in) based
       * on its position.
       *
       * @param timeReading  The reading for hours, minutes or seconds.
       * @param column       The column index.
       * @returns Boolean    Returns true if the block should
       *                     be activated, false otherwise.
       */
      function checkBlock(timeReading, column) {

        var exp = Math.pow(2, column),
            inc;

        for (inc = 0; inc < exp; inc += 1) {
          if ( timeReading % (exp * 2) === (inc + exp) ) {
            return true;
          }
        }

        return false;
      }

      /**
       * Toggles the display of a number on a block.
       * This coincides with the 'numbers on blocks' UI option.
       *
       * @param toggle  Accepts 'show' or 'hide' as valid parameters.
       * @param row     The row index.
       * @param column  The column index.       
       */
      function toggleNumber(toggle, row, column) {

        var exp, textElement;

        // get <text> element based on given column and row
        textElement = $(groupElements[0][(row * 6) + column]).find('text');

        if (toggle === 'show') {
          exp = Math.pow(2, column);
          textElement
            .text(exp)
            .fadeIn();
        } else {
          textElement
            .fadeOut('fast')
            .text('');
        }
      }

      switch (row) {
        case 0:
          timeReading = BINARYCLOCK.hours;
          break;
        case 1:
          timeReading = BINARYCLOCK.minutes;
          break;
        case 2:
          timeReading = BINARYCLOCK.seconds;
          break;
      }

      if (checkBlock(timeReading, column)) {
        fade('in', row, column);
        if (BINARYCLOCK.options.numbersOnBlocks) {
          toggleNumber('show', row, column);
        }
      } else {
        fade('out', row, column);
        if (BINARYCLOCK.options.numbersOnBlocks) {
          toggleNumber('hide', row, column);
        }
      }
    }  // end updateBlock

    if (BINARYCLOCK.newDisplay) {

      BINARYCLOCK.newDisplay = false;

      for (row = 2; row >= 0; row -= 1) {
        for (column = 5; column >= 0; column -= 1) {
          updateBlock(row, column);
        }
      }
    } else {
      // iterate through second blocks
      for (column = 5; column >= 0; column -= 1) {
        updateBlock(2, column);
      }

      // iterate through minute blocks if seconds reading is 0
      if (BINARYCLOCK.seconds === 0) {
        // update minute reading
        BINARYCLOCK.minutes = BINARYCLOCK.getCurrentTime('m');
        for (column = 5; column >= 0; column -= 1) {
          updateBlock(1, column);
        }

        // iterate through hour blocks if minutes reading is 0
        if (BINARYCLOCK.minutes === 0) {
          // update hour reading
          BINARYCLOCK.hours = BINARYCLOCK.getCurrentTime('h');
          for (column = 5; column >= 0; column -= 1) {
            updateBlock(0, column);
          }
        }
      }
    }
  };  // end BINARYCLOCK._update

  // bind clock display rules to window resize event
  $(window).resize(checkDisplay);

  // stop the clock from updating if the window is not in focus
  $(window).blur(function () {
    window.clearInterval(BINARYCLOCK.blockIntervalID);
    BINARYCLOCK.blockIntervalID = undefined;

    if (BINARYCLOCK.options.timeDigits.display === true) {
      window.clearInterval(BINARYCLOCK.timeIntervalID);
      BINARYCLOCK.timeIntervalID = undefined;
    }
  });

  // start updating clock if the window becomes in focus
  $(window).focus(function () {
    BINARYCLOCK.start();

    if (BINARYCLOCK.options.timeDigits.display === true) {
      $('#timeDisplay').empty();
      BINARYCLOCK.options.timeDigits.start();
    }
  });

  drawClock();
  prepareOptionsTab();
  prepareOptionPanel();
  hoverFunctionality();
  checkDisplay();

  // all is set up, now start the clock
  BINARYCLOCK.start();
}());
