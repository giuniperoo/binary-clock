require(['jquery', 'options'], function ($, OPTIONS) {
  $(function () {

    var hours, minutes, seconds,

        // flag to identify when clock is
        // rendered for the first time
        newDisplay = true,

        blockIntervalID,

        // Initializes the widget (draws the clock and option panel in the UI)
        // and defines functionality that is bound to UI components.
        // Assumes that the page's DOM has already been set up,
        // and is self-invoking.
        init = (function () {
          "use strict";

          drawClock();

          // initialize options
          if (OPTIONS) {
            OPTIONS.tab.init();
            OPTIONS.panel.init();
            OPTIONS.tab.hover();
            OPTIONS.util.checkDisplay();

            // bind clock display rules to window resize event
            $(window).resize(OPTIONS.util.checkDisplay);
          }

          // all is set up, now start the clock
          start();
        })();

    /**
     * Gets the current time.
     * @param unit  Accepts 'h', 'm', or 's' as a parameter. If no
     *              parameter is given, or if none of the above three
     *              are recognized, the local time string is returned.
     */
    function getCurrentTime(unit) {
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

    /**
     * Draws the clock widget onto the screen
     * based on OPTIONS.layout.
     * (Horizontal layout drawn by default.)
     */
    function drawClock() {
      "use strict";

      var layout = OPTIONS.layout,
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
     * Starts the clock. The time begins updating
     * per second, and the widget reflects changes.
     */
    function start() {
      "use strict";

      // get initial time readings
      hours   = getCurrentTime('h');
      minutes = getCurrentTime('m');

      // update clock at second intervals
      if (typeof blockIntervalID === 'number') {
        window.clearInterval(blockIntervalID);
      }
      blockIntervalID = window.setInterval(function () {
        _update();
      }, 1000);
    };

    /**
     * Private method that updates the UI to
     * accurately display the current time
     * (called repeatedly by a setInterval
     * within start func).
     */
    _update = function () {

      var column, row;

      // update seconds reading
      seconds = getCurrentTime('s');

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
            timeReading = hours;
            break;
          case 1:
            timeReading = minutes;
            break;
          case 2:
            timeReading = seconds;
            break;
        }

        if (checkBlock(timeReading, column)) {
          fade('in', row, column);
          if (OPTIONS.numbersOnBlocks) {
            toggleNumber('show', row, column);
          }
        } else {
          fade('out', row, column);
          if (OPTIONS.numbersOnBlocks) {
            toggleNumber('hide', row, column);
          }
        }
      }  // end updateBlock

      if (newDisplay) {
        newDisplay = false;

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
        if (seconds === 0) {
          // update minute reading
          minutes = getCurrentTime('m');
          for (column = 5; column >= 0; column -= 1) {
            updateBlock(1, column);
          }

          // iterate through hour blocks if minutes reading is 0
          if (minutes === 0) {
            // update hour reading
            hours = getCurrentTime('h');
            for (column = 5; column >= 0; column -= 1) {
              updateBlock(0, column);
            }
          }
        }
      }
    };  // end _update
  });
});