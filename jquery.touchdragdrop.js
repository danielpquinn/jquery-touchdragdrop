/*global jQuery: true, console */
/*jslint devel: false, browser: true, sloppy: false, nomen: true, maxerr: 50, indent: 2 */

(function ($, window) {

  'use strict';

  var methods = {
    init: function (options) {

      // Local vars, common to all instances
      var settings = $.extend({
          dropTarget: '.drop',
          cloneClassName: 'clone'
        }, options),

        dragging = false,
        // Cache dom queries
        $targets = $(settings.dropTarget),
        $siblings = $(settings.dropTarget).children(),
        $dragged = {},
        // Arrays to hold positions
        targetPositions = [],
        siblingPositions = [],
        // Stolen from Modernizr
        touch = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch ? true : false;

      // On touchmove
      $(document).on(touch ? 'touchmove' : 'mousemove', function (e) {
        if (!dragging) {
          return;
        }
        e.preventDefault();
        var pos = touch ? [
            e.originalEvent.touches[0].clientX,
            e.originalEvent.touches[0].clientY + $(window).scrollTop()
          ] : [
            e.clientX,
            e.clientY
          ],
          closest,
          data = $dragged.data('touchdragdrop');

        data.clone.css({
          'left': pos[0] + 'px',
          'top': pos[1] + 'px'
        });

        // Find index of closest point in an array of points
        function findClosest(position, positions) {
          var i = 0,
            distances = [],
            smallestDistance = 9999,
            index;

          for (i; i < positions.length; i += 1) {
            distances.push(Math.sqrt(Math.pow(pos[0] - positions[i][0], 2) + Math.pow(pos[1] - positions[i][1], 2)));
          }
          for (i = 0; i < distances.length; i += 1) {
            if (distances[i] < smallestDistance) {
              smallestDistance = distances[i];
              index = i;
            }
          }
          return index;
        }

        closest = findClosest(pos, targetPositions);

        if ($targets.eq(closest).children().length <= 1) {
          $targets.eq(closest).append($dragged);
        } else {
          closest = findClosest(pos, siblingPositions);
          if(!$($siblings[closest]).hasClass('placeholder')) {
            $($siblings[closest]).after($dragged);
          }
        }
      });

      $(document).bind(touch ? 'touchend' : 'mouseup', function (e) {
        if(!dragging) {
          return
        };
        var data = $dragged.data('touchdragdrop');
        // Reset positions
        siblingPositions = [];
        targetPositions = [];
        $dragged.removeClass('placeholder');
        data.clone.detach();
        dragging = false;
      });

      // Loop through jQuery collection object
      return this.each(function () {
        var $this = $(this),
          data = $this.data('touchdragdrop');

        // If not already initialized
        if (!data) {

          // Initialize
          $this.data('touchdragdrop', {
            settings: settings,
            clone: $this.clone()
          });

          data = $this.data('touchdragdrop');

          // Style cloned element
          data.clone.css({
            'position': 'absolute',
            'margin-left': $this.outerWidth() / 2 * -1 + 'px',
            'margin-top': $this.outerHeight() / 2 * -1 + 'px'
          }).addClass(settings.cloneClassName);

          // On touchstart
          $this.bind(touch ? 'touchstart' : 'mousedown', function (e) {
            e.preventDefault();
            var pos = touch ? [
                e.originalEvent.touches[0].clientX,
                e.originalEvent.touches[0].clientY + $(window).scrollTop()
              ] : [
                e.clientX,
                e.clientY
              ];

            $dragged = $this;

            if (!dragging) {
              dragging = true;
              $this.addClass('placeholder');
              data.clone.css({
                'left': pos[0] + 'px',
                'top': pos[1] + $(window).scrollTop() + 'px'
              });
              $('body').append(data.clone);
              $siblings.each(function () {
                siblingPositions.push([
                  $(this).offset().left + ($(this).outerWidth() / 2),
                  $(this).offset().top + $(this).outerHeight()
                ]);
              });
              $targets.each(function () {
                targetPositions.push([
                  $(this).offset().left + ($(this).outerWidth() / 2),
                  $(this).offset().top + $(this).outerHeight()
                ]);
              });
            }
          });
        }
      });
    }
  };

  $.fn.touchdragdrop = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.touchdragdrop');
    }
  };

}(jQuery, window));