require(['jquery'], function ($) {
  $(function () {


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




/** UI STUFF **/


/** Color combination for blocks. */
BINARYCLOCK.colorPalette = [ '#e2ddb7', '#d97036', '#b8b690' ];	 // beige | orange | olive

/**
 * Registers default values for UI options.
 */
BINARYCLOCK.options = {
  titleDisplay:    true,
  numbersOnBlocks: false,
  mode:            'day',
  layout:          'horizontal',
  panel:           { init: null },
  tab:             { display: true },
  timeDigits:      { display: false }
};

/**
 * Draws the clock widget onto the screen,
 * based on BINARYCLOCK.options.layout.
 * (Horizontal layout drawn by default.)
 */
BINARYCLOCK.drawClock = function () {

  "use strict";

  var layout = BINARYCLOCK.options.layout,
      clockWidget = $('#clockWidget'),
      hOffset = 0, vOffset = 50,
      hSpace = 13, vSpace = 34,
      column, row,
      block, span;

  // iterate through hour, minute and second rows, creating six blocks for each row.
  // each block is a <div> containing a <span> for optional number text.
  for (row = 2; row >= 0; row -= 1) {
    for (column = 5; column >= 0; column -= 1) {
      span = $(document.createElement('span'));

      block = $(document.createElement('div'))
        .addClass('block')
        .addClass('row' + row)
        .css('position', 'absolute')
        .css('left', hOffset + hSpace)
        .css('top', vOffset + vSpace)
        .append(span);

      clockWidget.append(block);

      hOffset += 100;  // shift right 100px
    }
    vOffset += 100;    // shift down 100px
    hOffset = 0;       // reset horizontal offset
  }
};

/**
 * Toggles between night and day modes.
 * This method switches the setting at BINARYCLOCK.options.mode,
 * then updates the UI to reflect that setting.
 */
BINARYCLOCK.toggleMode = function () {

  "use strict";

  var mode = BINARYCLOCK.options.mode,
      controls = $('#controls'),
      moonButton = $('button#moon'),
      sunButton = $('button#sun'),
      labelText;

  // update option panel
  if (mode === 'day') {
    labelText = 'make daytime';

    controls.removeClass('light')
            .addClass('dark');

    moonButton.fadeOut('fast', function () {
      sunButton.fadeIn();
    });
  } else {
    labelText = 'make nighttime';

    controls.removeClass('dark')
            .addClass('light');

    sunButton.fadeOut('fast', function () {
      moonButton.fadeIn();
    });
	}
	$('div#mode span').fadeOut('fast', function () {
    $(this).text(labelText).fadeIn();
  });

  if (mode === 'day') {
    BINARYCLOCK.options.mode = 'night';
    $('html').prop('id', 'night');
  } else {
    BINARYCLOCK.options.mode = 'day';
    $('html').prop('id', 'day');
  }
};

/**
 * Toggles between horizontal and vertical layouts.
 * This method toggles the setting at BINARYCLOCK.options.layout,
 * then updates the UI to reflect that setting.
 */
BINARYCLOCK.toggleLayout = function () {

  "use strict";

  var layout        = BINARYCLOCK.options.layout,
      timeDigits    = BINARYCLOCK.options.timeDigits,
      timeDisplay   = $('#timeDisplay'),
      blocks        = $('#clockWidget div'),
      layoutElem    = $('#layout'),
      horizontalBtn = $('button#horizontal'),
      verticalBtn   = $('button#vertical'),

      hBaseOffset = 13,
      vBaseOffset = 14,
      hOffset = (layout === 'horizontal') ? 113 : hBaseOffset,
      vOffset = (layout === 'horizontal') ? vBaseOffset : 84,

      timeDigitTemplate,
      labelText,
      len,
      i;

  // update option panel
  if (layout === 'horizontal') {
    labelText = 'make horizontal';

    verticalBtn.fadeOut('fast', function () {
      layoutElem.removeClass('horizontal')
                .addClass('vertical');
      horizontalBtn.fadeIn();
    });
  } else {
    labelText = 'make vertical';

    horizontalBtn.fadeOut('fast', function () {
      layoutElem.removeClass('vertical')
                .addClass('horizontal');
      verticalBtn.fadeIn();
    });
  }
  $('#layout span').fadeOut('fast', function () {
    $(this).text(labelText).fadeIn();
  });

  // clear interval + reset after transition finishes
  // necessary to keep blocks in sync with time digits
  window.clearInterval(BINARYCLOCK.blockIntervalID);

  if (layout === 'horizontal') {
    BINARYCLOCK.options.layout = 'vertical';

    for (i = 0, len = blocks.length; i < len; i += 1) {
      $(blocks[i]).animate({
        'top': vOffset,
        'left': hOffset
      }, 1000);

      vOffset += 70;            // shift down 70px

      if ((i + 1) % 6 === 0) {
        hOffset += 150;         // shift right 150px
        vOffset = vBaseOffset;  // reset vertical offset
      }
    }
  } else {
    BINARYCLOCK.options.layout = 'horizontal';

    for (i = 0, len = blocks.length; i < len; i += 1) {
      $(blocks[i]).animate({
        'top': vOffset,
        'left': hOffset
      }, 1000);

      hOffset += 100;           // shift right 100px

      if ((i + 1) % 6 === 0) {
        vOffset += 100;         // shift down 100px
        hOffset = hBaseOffset;  // reset horizontal offset
      }
    }
  }

  // restart clock widget.
  // 1 second delay is introduced so that blocks
  // begin updating after the transition finishes
  window.setTimeout(function () {
    BINARYCLOCK.start();
  }, 1000);

  // if time digits are shown, restart them so
  // they display according to updated layout
  if (timeDigits.display === true) {
    layout = BINARYCLOCK.options.layout;
    if ( (layout === 'horizontal' && $(window).width() < 1165) ||
         (layout === 'vertical' && $(window).height() < 635) ) {
      timeDisplay.fadeOut(function () {
        timeDisplay.empty();

        if (layout === 'horizontal') {
          timeDigitTemplate = '<div id="h"><span class="label">h</span><span class="horizontal time"></span></div>' +
                              '<div id="m"><span class="label">m</span><span class="horizontal time"></span></div>' +
                              '<div id="s"><span class="label">s</span><span class="horizontal time"></span></div>';

          timeDisplay.removeClass('vertical')
                     .addClass('horizontal')
                     .append(timeDigitTemplate);
        } else {
          timeDigitTemplate = '<div id="h"><span class="time"></span></div>' +
                              '<div id="m"><span class="time"></span></div>' +
                              '<div id="s"><span class="time"></span></div>';

          timeDisplay.removeClass('horizontal')
                     .addClass('vertical')
                     .append(timeDigitTemplate);
        }
      });
    } else {
      timeDigits.stop();
      window.setTimeout(timeDigits.start, 1000);
    }
  }

  // check display in case options can't be
  // displayed after the layout is toggled
  // (applies to title and time display)
  BINARYCLOCK.checkDisplay();
};

/**
 * Initializes the options tab, i.e. creates and
 * appends a <div> element containing 'options' text.
 */
BINARYCLOCK.options.tab.init = function () {

  "use strict";

  var	tabText = 'options';

	$('#optionTab').html('<div id="optionTabText">' + tabText + '</div');
};

/**
 * Defines hover functionality for option tab.
 * There are four noteworthy points:
 * 
 *   1. When user hovers over option tab, option tab expands to display options
 *   2. When user hovers outside of expanded option tab, options disappear and tab shrinks to default size
 *   3. When option tab remains in default state and cursor is still for 5sec, the tab disappears
 *   4. When user moves cursor and option tab is not displayed, tab reappears in default state
 *
 * TODO: test points 3, 4
 */
BINARYCLOCK.options.tab.hoverFunctionality = function () {

  "use strict";

  // function setTimer() {
  //   return timer = window.setTimeout(function () {
  //       optionTabText.fadeOut('fast', function () {
  //       optionTab.animate({
  //         'width': '18px', 'margin-left': 0
  //       });
  //     });
  //   }, 5000);
  // }

  var controls = $('#controls'),
      optionTab = $('#optionTab'),
      optionTabText = $('#optionTabText'),
      timer;

  // set timer when mouse moves for first time on new page
  // setTimer();

  optionTab
    .mouseenter(function () {
      if (optionTab.css('width') === '44px' &&
          optionTabText.css('display') === 'block') {
        optionTabText.fadeOut({
          'queue': false,
          'duration': 'fast',
          'complete': function () {
            optionTab.animate({
              'width': '243px',
              'height': '266px',
              'margin-top': '-133px',
              'margin-left': '-225px'
            }, {
              'duration': 600,
              'queue': false,
              'complete': function () {
                controls.fadeIn();
  //            window.clearTimeout(timer);
              }
            })
          }
        });
      }
    })
    .mouseleave(function () {
      if (optionTab.css('width') === '243px' &&
          optionTabText.css('display') === 'none') {
        optionTabText.stop(true, true);
        optionTab.stop();
        controls.fadeOut('fast', function () {
          optionTab.animate({
            'width': '44px',
            'height': '94px',
            'margin-top': '-47px',
            'margin-left': '-26px'
          }, {
            'duration': 600,
            'queue': false,
            'complete': function () {
              optionTabText.fadeIn('fast');
  //          setTimer();
            }
          });
        });
      }
    });

  // $(document).mousemove(function () {
  //   window.clearTimeout(timer);
  // 
  //   if (optionTab.css('width') !== '243px') {
  //     setTimer();
  // 
  //     if (optionTab.css('width') === '18px') {
  //       optionTab.animate({
  //         'width': '44px',
  //         'margin-left': '-26px'
  //       }, function () {
  //         optionTabText.fadeIn();
  //       });
  //     }
  //   }
  // });
};

/**
 * Initializes the option panel.
 * First creates and injects option controls into the DOM
 * then initializes click functionality for all buttons.
 */
BINARYCLOCK.options.panel.init = function () {

  "use strict";

  var createOptionControls = (function () {
    var controls = $(document.createElement('div')).prop('id', 'controls'),

    // template for option elements in DOM
    template = '<div><span id="titleBtnLabel">hide</span><button id="titleBtn">title</button></div>' +
               '<div><span id="timeDisplayBtnLabel">show</span><button id="timeDisplayBtn">time display</button></div>' +
               '<div><span id="blockNumberBtnLabel">show</span><button id="blockNumberBtn">numbers on blocks</button></div>' +
               '<hr>' +
               '<div id="mode" class="day">' +
               '  <span>make nighttime</span>' +
               '  <button id="sun"><img src="resources/img/sun.png" alt="sun icon"></button>' +
               '  <button id="moon"><img src="resources/img/moon.png" alt="moon icon"></button>' +
               '</div>' +
               '<div id="layout" class="horizontal">' +
               '  <span>make vertical</span>' +
               '  <button id="vertical"><img src="resources/img/vertical-icon.png" alt="vertical layout"></button>' +
               '  <button id="horizontal"><img src="resources/img/horizontal-icon.png" alt="horizontal layout"></button>' +
               '</div>';

    controls.append(template);
    $('#optionTab').append(controls);
  })(),

  initializeClickEvents = (function () {
    var timeDigits = BINARYCLOCK.options.timeDigits,
        showText = 'show',
        hideText = 'hide';

    // toggle title
    $('#titleBtn').click(function () {
      var titleDisplay = BINARYCLOCK.options.titleDisplay;

      if (titleDisplay === false) {
        BINARYCLOCK.options.titleDisplay = true;
        if ($(window).height() > 590 && $(window).width() > 650) {
          $('h1').fadeIn();
          $('#titleBtnLabel').fadeOut('fast', function () {
            $(this).text(hideText).fadeIn();
          });
        }
      } else {
        BINARYCLOCK.options.titleDisplay = false;
        if ($(window).height() > 590 && $(window).width() > 650) {
          $('h1').fadeOut();
          $('#titleBtnLabel').fadeOut('fast', function () {
            $(this).text(showText).fadeIn();
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
          $(this).text(hideText).fadeIn();
        });
      } else {
        timeDigits.stop();
        $('#timeDisplayBtnLabel').fadeOut('fast', function () {
          $(this).text(showText).fadeIn();
        });
      }
    });

    // toggle numbers on blocks
    $('#blockNumberBtn').click(function () {
      if (BINARYCLOCK.options.numbersOnBlocks === false) {
        BINARYCLOCK.options.numbersOnBlocks = true;
        BINARYCLOCK.newDisplay = true;
        $('#blockNumberBtnLabel').fadeOut('fast', function () {
          $(this).text(hideText).fadeIn();
        });
      } else {
        BINARYCLOCK.options.numbersOnBlocks = false;
        $('#clockWidget span').fadeOut();
        $('#blockNumberBtnLabel').fadeOut('fast', function () {
          $(this).text(showText).fadeIn();
        });
      }
    });

    // toggle mode
    $('button#sun, button#moon').click(function () {
      BINARYCLOCK.toggleMode();
    });

    // toggle layout
    $('button#horizontal, button#vertical').click(function () {
      $(this).stop();
      BINARYCLOCK.toggleLayout();
    });
  })();
};

/**
 * Activates regular updates to hour, minute, second digits
 * and displays digits in UI.
 * 
 * (For time digit display UI option.)
 */
BINARYCLOCK.options.timeDigits.start = function () {

  "use strict";

  var timeDigits  = BINARYCLOCK.options.timeDigits,
      layout      = BINARYCLOCK.options.layout,
      timeDisplay = $('#timeDisplay'),
      triggerTimeUnitDisplay,
      timeUnits,
      template;

  timeDigits.display = true;

  triggerTimeUnitDisplay = function () {
    BINARYCLOCK.timeIntervalID = window.setInterval(function () {

      var hourElem   = $('#h span.time'),
          minuteElem = $('#m span.time'),
          secondElem = $('#s span.time');

      // iterate through the div elements, displaying time for each unit
      $.each(timeUnits, function (idx) {

        window.setTimeout(function () {  // a 150ms delay is introduced
                                         // so digits are visually sync'd
          var timeReading, timeElement;  // with blocks, which fade in-out

          switch (idx) {
            case 0:
              timeReading = BINARYCLOCK.hours;
              timeElement = hourElem;
              break;
            case 1:
              timeReading = BINARYCLOCK.minutes;
              timeElement = minuteElem;
              break;
            case 2:
              timeReading = BINARYCLOCK.seconds;
              timeElement = secondElem;
              break;
          }

          if (timeReading.toString().length < 2) {
            timeReading = '0' + timeReading;
          }

          if (timeElement.text() === '' ||          // required for start, when no text is displayed
              timeElement.text() != timeReading) {  // implicit typecasting

            timeElement.text(timeReading);
          }
        }, 150);  // end setTimeout
      });
    }, 1000);     // end setInterval
  };

  // set up DOM elements depending on layout
  if (layout === 'horizontal') {
    template = '<div id="h"><span class="label">h</span><span class="horizontal time"></span></div>' +
               '<div id="m"><span class="label">m</span><span class="horizontal time"></span></div>' +
               '<div id="s"><span class="label">s</span><span class="horizontal time"></span></div>';

    timeDisplay.removeClass('vertical')
               .addClass('horizontal')
               .append(template);

    // fade in after ~1 second so digits have a chance to update
    window.setTimeout(function () {
      timeDisplay.css('opacity', 0)
                 .css('display', 'block')
                 .animate({opacity: 1});
    }, 1100);

  } else {
    template = '<div id="h"><span class="time"></span></div>' +
               '<div id="m"><span class="time"></span></div>' +
               '<div id="s"><span class="time"></span></div>';

    timeDisplay.removeClass('horizontal')
               .addClass('vertical')
               .append(template);

    // fade in after ~1 second so digits have a chance to update
    window.setTimeout(function () {
      // workaround: $.animate does not work on (display: -webkit-box)
      timeDisplay.css('opacity', 0)
                 .css('display', '-webkit-box')
                 .animate({opacity: 1});
    }, 1100);
  }

  // get a handle on DOM elements for hour, minute, second units
  timeUnits = $.makeArray(timeDisplay.children('div'));
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
 *   * hides options tab if window width is less than 700px
 *   * hides time digit display if:
 *       window height is less than 640px (vertical layout)
 *       window width is less than 1180px (horizontal layout)
 *   * hides title if:
 *       window width is less than 520px or height is less than 840px (vertical layout)
 *       window width is less than 640px or height is less than 670px (horizontal layout)
 */
BINARYCLOCK.checkDisplay = function () {

  "use strict";

  var width           = $(window).width(),
      height          = $(window).height(),
      layout          = BINARYCLOCK.options.layout,
      timeDigits      = BINARYCLOCK.options.timeDigits,
      tabDisplay      = BINARYCLOCK.options.tab.display,
      titleDisplay    = BINARYCLOCK.options.titleDisplay,
      tabDisplayElem  = $('#tabDisplay'),
      timeDisplayElem = $('#timeDisplay'),
      optionTab       = $('#optionTab'),
      attr            = $('#titleBtn').attr('disabled');

  // hide title if not enough vertical or horizontal space
  if ( (layout === 'horizontal' && (height < 670 || width < 640)) ||
       (layout === 'vertical' && (height < 840 || width < 520)) ) {
    if (titleDisplay === true) {
      $('h1').fadeOut();
    }
    // if title label and button aren't already disabled...
    if (typeof attr === 'undefined' || attr === false) {
      // disable them
      $('#titleBtn').prop('disabled', true);
      $('#titleBtnLabel').addClass('disabled');
    }
  } else {
    if (titleDisplay === true && $('h1').css('display') === 'none') {
      $('h1').fadeIn();
    }
    // if title button is disabled...
    if (attr === 'disabled') {
      // enable button and label
      $('#titleBtn').prop('disabled', false);
      $('#titleBtnLabel').removeClass('disabled');
    }
  }

  // hide time digits if there is not enough space to display them
  attr = $('#timeDisplayBtn').attr('disabled');

  if ( (layout === 'horizontal' && width < 1180) ||
       (layout === 'vertical' && height < 640) ) {
    timeDisplayElem.fadeOut();
    // if label and button in option panel aren't already disabled...
    if (typeof attr === 'undefined' || attr === false) {
      // disable them
      $('#timeDisplayBtn').prop('disabled', true);
      $('#timeDisplayBtnLabel').addClass('disabled');
    }
  } else {
    if (timeDigits.display === true && timeDisplayElem.css('display') === 'none') {
      // check if time digit display is correct for layout
      // use case: user can toggle layout triggering time digits to disappear.
      //           if window is resized so that digits appear, they must be
      //           reformatted according to the new layout.
      if ( layout === 'horizontal' ) {
        timeDisplayElem.css('opacity', 0)
                       .css('display', 'block')
                       .animate({opacity: 1});
      } else {
        timeDisplayElem.css('opacity', 0)
                       .css('display', '-webkit-box')
                       .animate({opacity: 1});
      }
    }
    // if time display button isn't enabled...
    if (attr === 'disabled') {
      // enable button and label
      $('#timeDisplayBtn').prop('disabled', false);
      $('#timeDisplayBtnLabel').removeClass('disabled');
    }
  }

  // hide options tab if not enough space
  // to the right of the clock widget
  if (width < 700) {
    if (tabDisplay === true) {
      optionTab.fadeOut();
    }
  } else if (tabDisplay === true && optionTab.css('display') === 'none') {
    optionTab.fadeIn();
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
     *   * fade          (displays or hides blocks)
     *   * checkBlock    (checks whether block is active)
     *   * toggleNumber  (displays or hides digits on blocks (for 'numbers on blocks' option))
     *
     * @param row     The row index (0 - 2). There are 3 rows from
     *                top to bottom: hour, minute, and second.
     * @param column  The specified column of the grid, whereby each
     *                column represents a quantity of 1, 2, 4, 8, etc.
     */
    function updateBlock(row, column) {

      var timeReading,  // reading for hours, minutes or seconds, depending on the given row
          blocks = $('div#clockWidget').find('div');  // gets all 18 <div> elements

      /**
       * Fades a block in or out.
       *
       * @param toggle  Accepts 'in' or 'out' as parameters.
       * @param row     The row index.
       * @param column  The column index.
       */
      function fade(toggle, row, column) {

        var block = $(blocks[(row * 6) + column]);

        // if toggle !== 'in' assume 'out'
        if (toggle === 'in') {
          block.addClass('dark')
               .removeClass('light');
        } else {
          block.addClass('light')
               .removeClass('dark');
        }
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

        var max = 5,  // max number of columns, zero-based
            exp = Math.pow(2, max - column),
            inc;

        for (inc = 0; inc < exp; inc += 1) {
          if (timeReading % (exp * 2) === (inc + exp)) {
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

        var exp, textElement,
            max = 5;  // max number of columns, zero-based

        // get <span> element based on given column and row
        textElement = $(blocks[(row * 6) + column]).find('span');

        if (toggle === 'show') {
          exp = Math.pow(2, max - column);
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

  drawClock();
  prepareOptionsTab();
  prepareOptionPanel();
  hoverFunctionality();
  checkDisplay();

  // all is set up, now start the clock
  BINARYCLOCK.start();
}());

  });
});