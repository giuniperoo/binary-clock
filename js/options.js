define(function () {

  /**
   * Initializes the options tab, i.e. creates and
   * appends a <div> element containing 'options' text.
   */
  function tabInit() {
    "use strict";

    var  tabText = 'options';
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
  function hoverFunc() {
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
  function panelInit() {
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
      var timeDigits = options.timeDigits,
          showText = 'show',
          hideText = 'hide';

      // toggle title
      $('#titleBtn').click(function () {
        if (options.titleDisplay === false) {
          options.titleDisplay = true;
          if ($(window).height() > 590 && $(window).width() > 650) {
            $('h1').fadeIn();
            $('#titleBtnLabel').fadeOut('fast', function () {
              $(this).text(hideText).fadeIn();
            });
          }
        } else {
          options.titleDisplay = false;
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

          // ***********************************
          // restart clock so that blocks are synchronized with digits
          // window.clearInterval(BINARYCLOCK.blockIntervalID);
          // BINARYCLOCK.start();

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
        if (options.numbersOnBlocks === false) {
          options.numbersOnBlocks = true;
          // ***********************************
          // BINARYCLOCK.newDisplay = true;
          $('#blockNumberBtnLabel').fadeOut('fast', function () {
            $(this).text(hideText).fadeIn();
          });
        } else {
          options.numbersOnBlocks = false;
          $('#clockWidget span').fadeOut();
          $('#blockNumberBtnLabel').fadeOut('fast', function () {
            $(this).text(showText).fadeIn();
          });
        }
      });

      // toggle mode
      $('button#sun, button#moon').click(function () {
        toggleMode();
      });

      // toggle layout
      $('button#horizontal, button#vertical').click(function () {
        $(this).stop();
        toggleLayout();
      });
    })();
  };

  /**
   * Activates regular updates to hour, minute, second digits
   * and displays digits in UI.
   * 
   * (For time digit display UI option.)
   */
  function startDigits() {
    "use strict";

    var timeDigits  = options.timeDigits,
        layout      = options.layout,
        timeDisplay = $('#timeDisplay'),
        triggerTimeUnitDisplay,
        timeUnits,
        template;

    timeDigits.display = true;

    triggerTimeUnitDisplay = function () {
      // ***********************************
      // BINARYCLOCK.timeIntervalID = window.setInterval(function () {
      // 
      //   var hourElem   = $('#h span.time'),
      //       minuteElem = $('#m span.time'),
      //       secondElem = $('#s span.time');
      // 
      //   // iterate through the div elements, displaying time for each unit
      //   $.each(timeUnits, function (idx) {
      // 
      //     window.setTimeout(function () {  // a 150ms delay is introduced
      //                                      // so digits are visually sync'd
      //       var timeReading, timeElement;  // with blocks, which fade in-out
      // 
      //       switch (idx) {
      //         case 0:
      //           timeReading = BINARYCLOCK.hours;
      //           timeElement = hourElem;
      //           break;
      //         case 1:
      //           timeReading = BINARYCLOCK.minutes;
      //           timeElement = minuteElem;
      //           break;
      //         case 2:
      //           timeReading = BINARYCLOCK.seconds;
      //           timeElement = secondElem;
      //           break;
      //       }
      // 
      //       if (timeReading.toString().length < 2) {
      //         timeReading = '0' + timeReading;
      //       }
      // 
      //       if (timeElement.text() === '' ||          // required for start, when no text is displayed
      //           timeElement.text() != timeReading) {  // implicit typecasting
      // 
      //         timeElement.text(timeReading);
      //       }
      //     }, 150);  // end setTimeout
      //   });
      // }, 1000);     // end setInterval
      // 
    };

    // set up DOM elements depending on layout
    if (layout === 'horizontal') {
      template = '<div id="h"><span class="label">h</span><span class="horizontal time"></span></div>' +
                 '<div id="m"><span class="label">m</span><span class="horizontal time"></span></div>' +
                 '<div id="s"><span class="label">s</span><span class="horizontal time"></span></div>';

      timeDisplay.removeClass('vertical')
                 .addClass('horizontal')
                 .append(template)

                 // fade in after ~1s so digits display
                 // in sync with 'h' 'm' 's' labels
                 .delay(1100).fadeIn();

    } else {
      template = '<div id="h"><span class="time"></span></div>' +
                 '<div id="m"><span class="time"></span></div>' +
                 '<div id="s"><span class="time"></span></div>';

      timeDisplay.removeClass('horizontal')
                 .addClass('vertical')
                 .append(template)
                 .delay(1100).fadeIn();
    }

    // get a handle on DOM elements for hour, minute, second units
    timeUnits = $.makeArray(timeDisplay.children('div'));
    triggerTimeUnitDisplay();
  };

  /**
   * Stops regular updates to hour, minute, second digits.
   */
  function stopDigits() {
    "use strict";

    options.timeDigits.display = false;
    // ***********************************
    // window.clearInterval(BINARYCLOCK.timeIntervalID);

    $('#timeDisplay').fadeOut('fast', function () {
      $('#timeDisplay').empty();
    });
  };

  /**
   * Toggles between night and day modes.
   * This method switches the setting at options.mode,
   * then updates the UI to reflect that setting.
   */
  function toggleMode() {
    "use strict";

    var mode = options.mode,
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
      options.mode = 'night';
      $('html').prop('id', 'night');
    } else {
      options.mode = 'day';
      $('html').prop('id', 'day');
    }
  };

  /**
   * Toggles between horizontal and vertical layouts.
   * This method toggles the setting at options.layout,
   * then updates the UI to reflect that setting.
   */
  function toggleLayout() {
    "use strict";

    var layout        = options.layout,
        timeDigits    = options.timeDigits,
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

    // ***********************************
    // clear interval + reset after transition finishes
    // necessary to keep blocks in sync with time digits
    // window.clearInterval(BINARYCLOCK.blockIntervalID);

    if (layout === 'horizontal') {
      options.layout = 'vertical';

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
      options.layout = 'horizontal';

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

    // ***********************************
    // restart clock widget.
    // 1 second delay is introduced so that blocks
    // begin updating after the transition finishes
    // window.setTimeout(function () {
    //   BINARYCLOCK.start();
    // }, 1000);

    // if time digits are shown, restart them so
    // they display according to updated layout
    if (timeDigits.display === true) {
      layout = options.layout;
      if ( (layout === 'horizontal' && $(window).width() < 1180) ||
           (layout === 'vertical' && $(window).height() < 640) ) {
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
    check();
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
  function check() {
    "use strict";

    var width           = $(window).width(),
        height          = $(window).height(),
        layout          = options.layout,
        timeDigits      = options.timeDigits,
        tabDisplay      = options.tab.display,
        titleDisplay    = options.titleDisplay,
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
      // use case: user can resize window after toggling layout -
      // if time digits are enabled ensure that they
      // display if window dimensions become adequate
      if (timeDigits.display === true && timeDisplayElem.css('display') === 'none') {
        timeDisplayElem.fadeIn();
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

  // register and return default values for UI options
  return options = {                 
    titleDisplay:    true,
    numbersOnBlocks: false,
    mode:            'day',
    layout:          'horizontal',
    panel:           { init: panelInit },
    tab:             { init: tabInit,
                       hover: hoverFunc, 
                       display: true },
    timeDigits:      { start: startDigits,
                       stop: stopDigits,
                       display: false },
    util:            { checkDisplay: check }
  };
});
