(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * This script gives you the zone info key representing your device's time zone setting.
 *
 * @name jsTimezoneDetect
 * @version 1.0.5
 * @author Jon Nylander
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 *
 * For usage and examples, visit:
 * http://pellepim.bitbucket.org/jstz/
 *
 * Copyright (c) Jon Nylander
 */

/*jslint undef: true */
/*global console, exports*/

(function(root) {
  /**
   * Namespace to hold all the code for timezone detection.
   */
  var jstz = (function () {
      'use strict';
      var HEMISPHERE_SOUTH = 's',
          
          /**
           * Gets the offset in minutes from UTC for a certain date.
           * @param {Date} date
           * @returns {Number}
           */
          get_date_offset = function (date) {
              var offset = -date.getTimezoneOffset();
              return (offset !== null ? offset : 0);
          },

          get_date = function (year, month, date) {
              var d = new Date();
              if (year !== undefined) {
                d.setFullYear(year);
              }
              d.setMonth(month);
              d.setDate(date);
              return d;
          },

          get_january_offset = function (year) {
              return get_date_offset(get_date(year, 0 ,2));
          },

          get_june_offset = function (year) {
              return get_date_offset(get_date(year, 5, 2));
          },

          /**
           * Private method.
           * Checks whether a given date is in daylight saving time.
           * If the date supplied is after august, we assume that we're checking
           * for southern hemisphere DST.
           * @param {Date} date
           * @returns {Boolean}
           */
          date_is_dst = function (date) {
              var is_southern = date.getMonth() > 7,
                  base_offset = is_southern ? get_june_offset(date.getFullYear()) : 
                                              get_january_offset(date.getFullYear()),
                  date_offset = get_date_offset(date),
                  is_west = base_offset < 0,
                  dst_offset = base_offset - date_offset;
                  
              if (!is_west && !is_southern) {
                  return dst_offset < 0;
              }

              return dst_offset !== 0;
          },

          /**
           * This function does some basic calculations to create information about
           * the user's timezone. It uses REFERENCE_YEAR as a solid year for which
           * the script has been tested rather than depend on the year set by the
           * client device.
           *
           * Returns a key that can be used to do lookups in jstz.olson.timezones.
           * eg: "720,1,2". 
           *
           * @returns {String}
           */

          lookup_key = function () {
              var january_offset = get_january_offset(),
                  june_offset = get_june_offset(),
                  diff = january_offset - june_offset;

              if (diff < 0) {
                  return january_offset + ",1";
              } else if (diff > 0) {
                  return june_offset + ",1," + HEMISPHERE_SOUTH;
              }

              return january_offset + ",0";
          },

          /**
           * Uses get_timezone_info() to formulate a key to use in the olson.timezones dictionary.
           *
           * Returns a primitive object on the format:
           * {'timezone': TimeZone, 'key' : 'the key used to find the TimeZone object'}
           *
           * @returns Object
           */
          determine = function () {
              var key = lookup_key();
              return new jstz.TimeZone(jstz.olson.timezones[key]);
          },

          /**
           * This object contains information on when daylight savings starts for
           * different timezones.
           *
           * The list is short for a reason. Often we do not have to be very specific
           * to single out the correct timezone. But when we do, this list comes in
           * handy.
           *
           * Each value is a date denoting when daylight savings starts for that timezone.
           */
          dst_start_for = function (tz_name) {

            var ru_pre_dst_change = new Date(2010, 6, 15, 1, 0, 0, 0), // In 2010 Russia had DST, this allows us to detect Russia :)
                dst_starts = {
                    'America/Denver': new Date(2011, 2, 13, 3, 0, 0, 0),
                    'America/Mazatlan': new Date(2011, 3, 3, 3, 0, 0, 0),
                    'America/Chicago': new Date(2011, 2, 13, 3, 0, 0, 0),
                    'America/Mexico_City': new Date(2011, 3, 3, 3, 0, 0, 0),
                    'America/Asuncion': new Date(2012, 9, 7, 3, 0, 0, 0),
                    'America/Santiago': new Date(2012, 9, 3, 3, 0, 0, 0),
                    'America/Campo_Grande': new Date(2012, 9, 21, 5, 0, 0, 0),
                    'America/Montevideo': new Date(2011, 9, 2, 3, 0, 0, 0),
                    'America/Sao_Paulo': new Date(2011, 9, 16, 5, 0, 0, 0),
                    'America/Los_Angeles': new Date(2011, 2, 13, 8, 0, 0, 0),
                    'America/Santa_Isabel': new Date(2011, 3, 5, 8, 0, 0, 0),
                    'America/Havana': new Date(2012, 2, 10, 2, 0, 0, 0),
                    'America/New_York': new Date(2012, 2, 10, 7, 0, 0, 0),
                    'Europe/Helsinki': new Date(2013, 2, 31, 5, 0, 0, 0),
                    'Pacific/Auckland': new Date(2011, 8, 26, 7, 0, 0, 0),
                    'America/Halifax': new Date(2011, 2, 13, 6, 0, 0, 0),
                    'America/Goose_Bay': new Date(2011, 2, 13, 2, 1, 0, 0),
                    'America/Miquelon': new Date(2011, 2, 13, 5, 0, 0, 0),
                    'America/Godthab': new Date(2011, 2, 27, 1, 0, 0, 0),
                    'Europe/Moscow': ru_pre_dst_change,
                    'Asia/Amman': new Date(2013, 2, 29, 1, 0, 0, 0),
                    'Asia/Beirut': new Date(2013, 2, 31, 2, 0, 0, 0),
                    'Asia/Damascus': new Date(2013, 3, 6, 2, 0, 0, 0),
                    'Asia/Jerusalem': new Date(2013, 2, 29, 5, 0, 0, 0),
                    'Asia/Yekaterinburg': ru_pre_dst_change,
                    'Asia/Omsk': ru_pre_dst_change,
                    'Asia/Krasnoyarsk': ru_pre_dst_change,
                    'Asia/Irkutsk': ru_pre_dst_change,
                    'Asia/Yakutsk': ru_pre_dst_change,
                    'Asia/Vladivostok': ru_pre_dst_change,
                    'Asia/Baku': new Date(2013, 2, 31, 4, 0, 0),
                    'Asia/Yerevan': new Date(2013, 2, 31, 3, 0, 0),
                    'Asia/Kamchatka': ru_pre_dst_change,
                    'Asia/Gaza': new Date(2010, 2, 27, 4, 0, 0),
                    'Africa/Cairo': new Date(2010, 4, 1, 3, 0, 0),
                    'Europe/Minsk': ru_pre_dst_change,
                    'Pacific/Apia': new Date(2010, 10, 1, 1, 0, 0, 0),
                    'Pacific/Fiji': new Date(2010, 11, 1, 0, 0, 0),
                    'Australia/Perth': new Date(2008, 10, 1, 1, 0, 0, 0)
                };

              return dst_starts[tz_name];
          };

      return {
          determine: determine,
          date_is_dst: date_is_dst,
          dst_start_for: dst_start_for 
      };
  }());

  /**
   * Simple object to perform ambiguity check and to return name of time zone.
   */
  jstz.TimeZone = function (tz_name) {
      'use strict';
        /**
         * The keys in this object are timezones that we know may be ambiguous after
         * a preliminary scan through the olson_tz object.
         *
         * The array of timezones to compare must be in the order that daylight savings
         * starts for the regions.
         */
      var AMBIGUITIES = {
              'America/Denver':       ['America/Denver', 'America/Mazatlan'],
              'America/Chicago':      ['America/Chicago', 'America/Mexico_City'],
              'America/Santiago':     ['America/Santiago', 'America/Asuncion', 'America/Campo_Grande'],
              'America/Montevideo':   ['America/Montevideo', 'America/Sao_Paulo'],
              'Asia/Beirut':          ['Asia/Amman', 'Asia/Jerusalem', 'Asia/Beirut', 'Europe/Helsinki','Asia/Damascus'],
              'Pacific/Auckland':     ['Pacific/Auckland', 'Pacific/Fiji'],
              'America/Los_Angeles':  ['America/Los_Angeles', 'America/Santa_Isabel'],
              'America/New_York':     ['America/Havana', 'America/New_York'],
              'America/Halifax':      ['America/Goose_Bay', 'America/Halifax'],
              'America/Godthab':      ['America/Miquelon', 'America/Godthab'],
              'Asia/Dubai':           ['Europe/Moscow'],
              'Asia/Dhaka':           ['Asia/Yekaterinburg'],
              'Asia/Jakarta':         ['Asia/Omsk'],
              'Asia/Shanghai':        ['Asia/Krasnoyarsk', 'Australia/Perth'],
              'Asia/Tokyo':           ['Asia/Irkutsk'],
              'Australia/Brisbane':   ['Asia/Yakutsk'],
              'Pacific/Noumea':       ['Asia/Vladivostok'],
              'Pacific/Tarawa':       ['Asia/Kamchatka', 'Pacific/Fiji'],
              'Pacific/Tongatapu':    ['Pacific/Apia'],
              'Asia/Baghdad':         ['Europe/Minsk'],
              'Asia/Baku':            ['Asia/Yerevan','Asia/Baku'],
              'Africa/Johannesburg':  ['Asia/Gaza', 'Africa/Cairo']
          },

          timezone_name = tz_name,
          
          /**
           * Checks if a timezone has possible ambiguities. I.e timezones that are similar.
           *
           * For example, if the preliminary scan determines that we're in America/Denver.
           * We double check here that we're really there and not in America/Mazatlan.
           *
           * This is done by checking known dates for when daylight savings start for different
           * timezones during 2010 and 2011.
           */
          ambiguity_check = function () {
              var ambiguity_list = AMBIGUITIES[timezone_name],
                  length = ambiguity_list.length,
                  i = 0,
                  tz = ambiguity_list[0];

              for (; i < length; i += 1) {
                  tz = ambiguity_list[i];

                  if (jstz.date_is_dst(jstz.dst_start_for(tz))) {
                      timezone_name = tz;
                      return;
                  }
              }
          },

          /**
           * Checks if it is possible that the timezone is ambiguous.
           */
          is_ambiguous = function () {
              return typeof (AMBIGUITIES[timezone_name]) !== 'undefined';
          };

      if (is_ambiguous()) {
          ambiguity_check();
      }

      return {
          name: function () {
              return timezone_name;
          }
      };
  };

  jstz.olson = {};

  /*
   * The keys in this dictionary are comma separated as such:
   *
   * First the offset compared to UTC time in minutes.
   *
   * Then a flag which is 0 if the timezone does not take daylight savings into account and 1 if it
   * does.
   *
   * Thirdly an optional 's' signifies that the timezone is in the southern hemisphere,
   * only interesting for timezones with DST.
   *
   * The mapped arrays is used for constructing the jstz.TimeZone object from within
   * jstz.determine_timezone();
   */
  jstz.olson.timezones = {
      '-720,0'   : 'Pacific/Majuro',
      '-660,0'   : 'Pacific/Pago_Pago',
      '-600,1'   : 'America/Adak',
      '-600,0'   : 'Pacific/Honolulu',
      '-570,0'   : 'Pacific/Marquesas',
      '-540,0'   : 'Pacific/Gambier',
      '-540,1'   : 'America/Anchorage',
      '-480,1'   : 'America/Los_Angeles',
      '-480,0'   : 'Pacific/Pitcairn',
      '-420,0'   : 'America/Phoenix',
      '-420,1'   : 'America/Denver',
      '-360,0'   : 'America/Guatemala',
      '-360,1'   : 'America/Chicago',
      '-360,1,s' : 'Pacific/Easter',
      '-300,0'   : 'America/Bogota',
      '-300,1'   : 'America/New_York',
      '-270,0'   : 'America/Caracas',
      '-240,1'   : 'America/Halifax',
      '-240,0'   : 'America/Santo_Domingo',
      '-240,1,s' : 'America/Santiago',
      '-210,1'   : 'America/St_Johns',
      '-180,1'   : 'America/Godthab',
      '-180,0'   : 'America/Argentina/Buenos_Aires',
      '-180,1,s' : 'America/Montevideo',
      '-120,0'   : 'America/Noronha',
      '-120,1'   : 'America/Noronha',
      '-60,1'    : 'Atlantic/Azores',
      '-60,0'    : 'Atlantic/Cape_Verde',
      '0,0'      : 'UTC',
      '0,1'      : 'Europe/London',
      '60,1'     : 'Europe/Berlin',
      '60,0'     : 'Africa/Lagos',
      '60,1,s'   : 'Africa/Windhoek',
      '120,1'    : 'Asia/Beirut',
      '120,0'    : 'Africa/Johannesburg',
      '180,0'    : 'Asia/Baghdad',
      '180,1'    : 'Europe/Moscow',
      '210,1'    : 'Asia/Tehran',
      '240,0'    : 'Asia/Dubai',
      '240,1'    : 'Asia/Baku',
      '270,0'    : 'Asia/Kabul',
      '300,1'    : 'Asia/Yekaterinburg',
      '300,0'    : 'Asia/Karachi',
      '330,0'    : 'Asia/Kolkata',
      '345,0'    : 'Asia/Kathmandu',
      '360,0'    : 'Asia/Dhaka',
      '360,1'    : 'Asia/Omsk',
      '390,0'    : 'Asia/Rangoon',
      '420,1'    : 'Asia/Krasnoyarsk',
      '420,0'    : 'Asia/Jakarta',
      '480,0'    : 'Asia/Shanghai',
      '480,1'    : 'Asia/Irkutsk',
      '525,0'    : 'Australia/Eucla',
      '525,1,s'  : 'Australia/Eucla',
      '540,1'    : 'Asia/Yakutsk',
      '540,0'    : 'Asia/Tokyo',
      '570,0'    : 'Australia/Darwin',
      '570,1,s'  : 'Australia/Adelaide',
      '600,0'    : 'Australia/Brisbane',
      '600,1'    : 'Asia/Vladivostok',
      '600,1,s'  : 'Australia/Sydney',
      '630,1,s'  : 'Australia/Lord_Howe',
      '660,1'    : 'Asia/Kamchatka',
      '660,0'    : 'Pacific/Noumea',
      '690,0'    : 'Pacific/Norfolk',
      '720,1,s'  : 'Pacific/Auckland',
      '720,0'    : 'Pacific/Tarawa',
      '765,1,s'  : 'Pacific/Chatham',
      '780,0'    : 'Pacific/Tongatapu',
      '780,1,s'  : 'Pacific/Apia',
      '840,0'    : 'Pacific/Kiritimati'
  };

  if (typeof exports !== 'undefined') {
    exports.jstz = jstz;
  } else {
    root.jstz = jstz;
  }
})(this);

},{}],2:[function(require,module,exports){
var _ = require('lodash');
var moment = require('moment-timezone');
var tzData = require('./timezone-data');

moment.tz.add(tzData);

exports.localMoment = function(date) {
  var timezone = this.props.config.get('timezone');
  return moment(date).tz(timezone);
};

// Creates a timestring in the form: "Monday, 1/23 - 4 to 6pm"
exports.createTimestring = function(start, end) {
  if (_.isArray(start)) {
    var params = start;
    end = params[1];
    start = params[0];
  }
  // Make sure that am/pm suffixes are only applied when they differ
  // between start and end times
  var startFormat = start.minutes() === 0 ? 'h' : 'h:mm';
  var endFormat = end.minutes() === 0 ? 'ha' : 'h:mma';

  if (end.format('a') !== start.format('a')) {
    startFormat += 'a';
  }

  // Format that shit
  return start.format('dddd M/D, ' + startFormat + ' - ') + end.format(endFormat);
};

},{"./timezone-data":3,"lodash":36,"moment-timezone":37}],3:[function(require,module,exports){
module.exports={
    "zones": {
        "America/Chicago": [
            "-5:50:36 - LMT 1883_10_18_12_9_24 -5:50:36",
            "-6 US C%sT 1920 -6",
            "-6 Chicago C%sT 1936_2_1_2 -6",
            "-5 - EST 1936_10_15_2 -5",
            "-6 Chicago C%sT 1942 -6",
            "-6 US C%sT 1946 -6",
            "-6 Chicago C%sT 1967 -6",
            "-6 US C%sT"
        ],
        "America/Denver": [
            "-6:59:56 - LMT 1883_10_18_12_0_4 -6:59:56",
            "-7 US M%sT 1920 -7",
            "-7 Denver M%sT 1942 -7",
            "-7 US M%sT 1946 -7",
            "-7 Denver M%sT 1967 -7",
            "-7 US M%sT"
        ],
        "America/Los_Angeles": [
            "-7:52:58 - LMT 1883_10_18_12_7_2 -7:52:58",
            "-8 US P%sT 1946 -8",
            "-8 CA P%sT 1967 -8",
            "-8 US P%sT"
        ],
        "America/New_York": [
            "-4:56:2 - LMT 1883_10_18_12_3_58 -4:56:2",
            "-5 US E%sT 1920 -5",
            "-5 NYC E%sT 1942 -5",
            "-5 US E%sT 1946 -5",
            "-5 NYC E%sT 1967 -5",
            "-5 US E%sT"
        ],
        "Asia/Hong_Kong": [
            "7:36:42 - LMT 1904_9_30 7:36:42",
            "8 HK HK%sT 1941_11_25 8",
            "9 - JST 1945_8_15 9",
            "8 HK HK%sT"
        ],
        "Asia/Seoul": [
            "8:27:52 - LMT 1890 8:27:52",
            "8:30 - KST 1904_11 8:30",
            "9 - KST 1928 9",
            "8:30 - KST 1932 8:30",
            "9 - KST 1954_2_21 9",
            "8 ROK K%sT 1961_7_10 8",
            "8:30 - KST 1968_9 8:30",
            "9 ROK K%sT"
        ],
        "Asia/Shanghai": [
            "8:5:57 - LMT 1928 8:5:57",
            "8 Shang C%sT 1949 8",
            "8 PRC C%sT"
        ],
        "Asia/Singapore": [
            "6:55:25 - LMT 1901_0_1 6:55:25",
            "6:55:25 - SMT 1905_5_1 6:55:25",
            "7 - MALT 1933_0_1 7",
            "7:20 - MALST 1936_0_1 7:20",
            "7:20 - MALT 1941_8_1 7:20",
            "7:30 - MALT 1942_1_16 7:30",
            "9 - JST 1945_8_12 9",
            "7:30 - MALT 1965_7_9 7:30",
            "7:30 - SGT 1982_0_1 7:30",
            "8 - SGT"
        ],
        "Asia/Tokyo": [
            "9:18:59 - LMT 1887_11_31_15",
            "9 - JST 1896 9",
            "9 - CJT 1938 9",
            "9 Japan J%sT"
        ],
        "Australia/Melbourne": [
            "9:39:52 - LMT 1895_1 9:39:52",
            "10 Aus EST 1971 10",
            "10 AV EST"
        ],
        "Australia/Sydney": [
            "10:4:52 - LMT 1895_1 10:4:52",
            "10 Aus EST 1971 10",
            "10 AN EST"
        ],
        "Europe/Amsterdam": [
            "0:19:32 - LMT 1835 0:19:32",
            "0:19:32 Neth %s 1937_6_1 1:19:32",
            "0:20 Neth NE%sT 1940_4_16_0 0:20",
            "1 C-Eur CE%sT 1945_3_2_2 1",
            "1 Neth CE%sT 1977 1",
            "1 EU CE%sT"
        ],
        "Europe/London": [
            "-0:1:15 - LMT 1847_11_1_0 -0:1:15",
            "0 GB-Eire %s 1968_9_27 1",
            "1 - BST 1971_9_31_2",
            "0 GB-Eire %s 1996",
            "0 EU GMT/BST"
        ],
        "Europe/Paris": [
            "0:9:21 - LMT 1891_2_15_0_1 0:9:21",
            "0:9:21 - PMT 1911_2_11_0_1 0:9:21",
            "0 France WE%sT 1940_5_14_23 1",
            "1 C-Eur CE%sT 1944_7_25 2",
            "0 France WE%sT 1945_8_16_3 2",
            "1 France CE%sT 1977 1",
            "1 EU CE%sT"
        ],
        "Pacific/Honolulu": [
            "-10:31:26 - LMT 1896_0_13_12 -10:31:26",
            "-10:30 - HST 1933_3_30_2 -10:30",
            "-9:30 - HDT 1933_4_21_12 -9:30",
            "-10:30 - HST 1942_1_09_2 -10:30",
            "-9:30 - HDT 1945_8_30_2 -9:30",
            "-10:30 - HST 1947_5_8_2 -10:30",
            "-10 - HST"
        ]
    },
    "rules": {
        "US": [
            "1918 1919 2 0 8 2 0 1 D",
            "1918 1919 9 0 8 2 0 0 S",
            "1942 1942 1 9 7 2 0 1 W",
            "1945 1945 7 14 7 23 1 1 P",
            "1945 1945 8 30 7 2 0 0 S",
            "1967 2006 9 0 8 2 0 0 S",
            "1967 1973 3 0 8 2 0 1 D",
            "1974 1974 0 6 7 2 0 1 D",
            "1975 1975 1 23 7 2 0 1 D",
            "1976 1986 3 0 8 2 0 1 D",
            "1987 2006 3 1 0 2 0 1 D",
            "2007 9999 2 8 0 2 0 1 D",
            "2007 9999 10 1 0 2 0 0 S"
        ],
        "Chicago": [
            "1920 1920 5 13 7 2 0 1 D",
            "1920 1921 9 0 8 2 0 0 S",
            "1921 1921 2 0 8 2 0 1 D",
            "1922 1966 3 0 8 2 0 1 D",
            "1922 1954 8 0 8 2 0 0 S",
            "1955 1966 9 0 8 2 0 0 S"
        ],
        "Denver": [
            "1920 1921 2 0 8 2 0 1 D",
            "1920 1920 9 0 8 2 0 0 S",
            "1921 1921 4 22 7 2 0 0 S",
            "1965 1966 3 0 8 2 0 1 D",
            "1965 1966 9 0 8 2 0 0 S"
        ],
        "CA": [
            "1948 1948 2 14 7 2 0 1 D",
            "1949 1949 0 1 7 2 0 0 S",
            "1950 1966 3 0 8 2 0 1 D",
            "1950 1961 8 0 8 2 0 0 S",
            "1962 1966 9 0 8 2 0 0 S"
        ],
        "NYC": [
            "1920 1920 2 0 8 2 0 1 D",
            "1920 1920 9 0 8 2 0 0 S",
            "1921 1966 3 0 8 2 0 1 D",
            "1921 1954 8 0 8 2 0 0 S",
            "1955 1966 9 0 8 2 0 0 S"
        ],
        "HK": [
            "1941 1941 3 1 7 3:30 0 1 S",
            "1941 1941 8 30 7 3:30 0 0",
            "1946 1946 3 20 7 3:30 0 1 S",
            "1946 1946 11 1 7 3:30 0 0",
            "1947 1947 3 13 7 3:30 0 1 S",
            "1947 1947 11 30 7 3:30 0 0",
            "1948 1948 4 2 7 3:30 0 1 S",
            "1948 1951 9 0 8 3:30 0 0",
            "1952 1952 9 25 7 3:30 0 0",
            "1949 1953 3 1 0 3:30 0 1 S",
            "1953 1953 10 1 7 3:30 0 0",
            "1954 1964 2 18 0 3:30 0 1 S",
            "1954 1954 9 31 7 3:30 0 0",
            "1955 1964 10 1 0 3:30 0 0",
            "1965 1976 3 16 0 3:30 0 1 S",
            "1965 1976 9 16 0 3:30 0 0",
            "1973 1973 11 30 7 3:30 0 1 S",
            "1979 1979 4 8 0 3:30 0 1 S",
            "1979 1979 9 16 0 3:30 0 0"
        ],
        "ROK": [
            "1960 1960 4 15 7 0 0 1 D",
            "1960 1960 8 13 7 0 0 0 S",
            "1987 1988 4 8 0 0 0 1 D",
            "1987 1988 9 8 0 0 0 0 S"
        ],
        "Shang": [
            "1940 1940 5 3 7 0 0 1 D",
            "1940 1941 9 1 7 0 0 0 S",
            "1941 1941 2 16 7 0 0 1 D"
        ],
        "PRC": [
            "1986 1986 4 4 7 0 0 1 D",
            "1986 1991 8 11 0 0 0 0 S",
            "1987 1991 3 10 0 0 0 1 D"
        ],
        "Japan": [
            "1948 1948 4 1 0 2 0 1 D",
            "1948 1951 8 8 6 2 0 0 S",
            "1949 1949 3 1 0 2 0 1 D",
            "1950 1951 4 1 0 2 0 1 D"
        ],
        "Aus": [
            "1917 1917 0 1 7 0:1 0 1",
            "1917 1917 2 25 7 2 0 0",
            "1942 1942 0 1 7 2 0 1",
            "1942 1942 2 29 7 2 0 0",
            "1942 1942 8 27 7 2 0 1",
            "1943 1944 2 0 8 2 0 0",
            "1943 1943 9 3 7 2 0 1"
        ],
        "AV": [
            "1971 1985 9 0 8 2 2 1",
            "1972 1972 1 0 8 2 2 0",
            "1973 1985 2 1 0 2 2 0",
            "1986 1990 2 15 0 2 2 0",
            "1986 1987 9 15 0 2 2 1",
            "1988 1999 9 0 8 2 2 1",
            "1991 1994 2 1 0 2 2 0",
            "1995 2005 2 0 8 2 2 0",
            "2000 2000 7 0 8 2 2 1",
            "2001 2007 9 0 8 2 2 1",
            "2006 2006 3 1 0 2 2 0",
            "2007 2007 2 0 8 2 2 0",
            "2008 9999 3 1 0 2 2 0",
            "2008 9999 9 1 0 2 2 1"
        ],
        "AN": [
            "1971 1985 9 0 8 2 2 1",
            "1972 1972 1 27 7 2 2 0",
            "1973 1981 2 1 0 2 2 0",
            "1982 1982 3 1 0 2 2 0",
            "1983 1985 2 1 0 2 2 0",
            "1986 1989 2 15 0 2 2 0",
            "1986 1986 9 19 7 2 2 1",
            "1987 1999 9 0 8 2 2 1",
            "1990 1995 2 1 0 2 2 0",
            "1996 2005 2 0 8 2 2 0",
            "2000 2000 7 0 8 2 2 1",
            "2001 2007 9 0 8 2 2 1",
            "2006 2006 3 1 0 2 2 0",
            "2007 2007 2 0 8 2 2 0",
            "2008 9999 3 1 0 2 2 0",
            "2008 9999 9 1 0 2 2 1"
        ],
        "Neth": [
            "1916 1916 4 1 7 0 0 1 NST",
            "1916 1916 9 1 7 0 0 0 AMT",
            "1917 1917 3 16 7 2 2 1 NST",
            "1917 1917 8 17 7 2 2 0 AMT",
            "1918 1921 3 1 1 2 2 1 NST",
            "1918 1921 8 1 8 2 2 0 AMT",
            "1922 1922 2 0 8 2 2 1 NST",
            "1922 1936 9 2 0 2 2 0 AMT",
            "1923 1923 5 1 5 2 2 1 NST",
            "1924 1924 2 0 8 2 2 1 NST",
            "1925 1925 5 1 5 2 2 1 NST",
            "1926 1931 4 15 7 2 2 1 NST",
            "1932 1932 4 22 7 2 2 1 NST",
            "1933 1936 4 15 7 2 2 1 NST",
            "1937 1937 4 22 7 2 2 1 NST",
            "1937 1937 6 1 7 0 0 1 S",
            "1937 1939 9 2 0 2 2 0",
            "1938 1939 4 15 7 2 2 1 S",
            "1945 1945 3 2 7 2 2 1 S",
            "1945 1945 8 16 7 2 2 0"
        ],
        "C-Eur": [
            "1916 1916 3 30 7 23 0 1 S",
            "1916 1916 9 1 7 1 0 0",
            "1917 1918 3 15 1 2 2 1 S",
            "1917 1918 8 15 1 2 2 0",
            "1940 1940 3 1 7 2 2 1 S",
            "1942 1942 10 2 7 2 2 0",
            "1943 1943 2 29 7 2 2 1 S",
            "1943 1943 9 4 7 2 2 0",
            "1944 1945 3 1 1 2 2 1 S",
            "1944 1944 9 2 7 2 2 0",
            "1945 1945 8 16 7 2 2 0",
            "1977 1980 3 1 0 2 2 1 S",
            "1977 1977 8 0 8 2 2 0",
            "1978 1978 9 1 7 2 2 0",
            "1979 1995 8 0 8 2 2 0",
            "1981 9999 2 0 8 2 2 1 S",
            "1996 9999 9 0 8 2 2 0"
        ],
        "EU": [
            "1977 1980 3 1 0 1 1 1 S",
            "1977 1977 8 0 8 1 1 0",
            "1978 1978 9 1 7 1 1 0",
            "1979 1995 8 0 8 1 1 0",
            "1981 9999 2 0 8 1 1 1 S",
            "1996 9999 9 0 8 1 1 0"
        ],
        "GB-Eire": [
            "1916 1916 4 21 7 2 2 1 BST",
            "1916 1916 9 1 7 2 2 0 GMT",
            "1917 1917 3 8 7 2 2 1 BST",
            "1917 1917 8 17 7 2 2 0 GMT",
            "1918 1918 2 24 7 2 2 1 BST",
            "1918 1918 8 30 7 2 2 0 GMT",
            "1919 1919 2 30 7 2 2 1 BST",
            "1919 1919 8 29 7 2 2 0 GMT",
            "1920 1920 2 28 7 2 2 1 BST",
            "1920 1920 9 25 7 2 2 0 GMT",
            "1921 1921 3 3 7 2 2 1 BST",
            "1921 1921 9 3 7 2 2 0 GMT",
            "1922 1922 2 26 7 2 2 1 BST",
            "1922 1922 9 8 7 2 2 0 GMT",
            "1923 1923 3 16 0 2 2 1 BST",
            "1923 1924 8 16 0 2 2 0 GMT",
            "1924 1924 3 9 0 2 2 1 BST",
            "1925 1926 3 16 0 2 2 1 BST",
            "1925 1938 9 2 0 2 2 0 GMT",
            "1927 1927 3 9 0 2 2 1 BST",
            "1928 1929 3 16 0 2 2 1 BST",
            "1930 1930 3 9 0 2 2 1 BST",
            "1931 1932 3 16 0 2 2 1 BST",
            "1933 1933 3 9 0 2 2 1 BST",
            "1934 1934 3 16 0 2 2 1 BST",
            "1935 1935 3 9 0 2 2 1 BST",
            "1936 1937 3 16 0 2 2 1 BST",
            "1938 1938 3 9 0 2 2 1 BST",
            "1939 1939 3 16 0 2 2 1 BST",
            "1939 1939 10 16 0 2 2 0 GMT",
            "1940 1940 1 23 0 2 2 1 BST",
            "1941 1941 4 2 0 1 2 2 BDST",
            "1941 1943 7 9 0 1 2 1 BST",
            "1942 1944 3 2 0 1 2 2 BDST",
            "1944 1944 8 16 0 1 2 1 BST",
            "1945 1945 3 2 1 1 2 2 BDST",
            "1945 1945 6 9 0 1 2 1 BST",
            "1945 1946 9 2 0 2 2 0 GMT",
            "1946 1946 3 9 0 2 2 1 BST",
            "1947 1947 2 16 7 2 2 1 BST",
            "1947 1947 3 13 7 1 2 2 BDST",
            "1947 1947 7 10 7 1 2 1 BST",
            "1947 1947 10 2 7 2 2 0 GMT",
            "1948 1948 2 14 7 2 2 1 BST",
            "1948 1948 9 31 7 2 2 0 GMT",
            "1949 1949 3 3 7 2 2 1 BST",
            "1949 1949 9 30 7 2 2 0 GMT",
            "1950 1952 3 14 0 2 2 1 BST",
            "1950 1952 9 21 0 2 2 0 GMT",
            "1953 1953 3 16 0 2 2 1 BST",
            "1953 1960 9 2 0 2 2 0 GMT",
            "1954 1954 3 9 0 2 2 1 BST",
            "1955 1956 3 16 0 2 2 1 BST",
            "1957 1957 3 9 0 2 2 1 BST",
            "1958 1959 3 16 0 2 2 1 BST",
            "1960 1960 3 9 0 2 2 1 BST",
            "1961 1963 2 0 8 2 2 1 BST",
            "1961 1968 9 23 0 2 2 0 GMT",
            "1964 1967 2 19 0 2 2 1 BST",
            "1968 1968 1 18 7 2 2 1 BST",
            "1972 1980 2 16 0 2 2 1 BST",
            "1972 1980 9 23 0 2 2 0 GMT",
            "1981 1995 2 0 8 1 1 1 BST",
            "1981 1989 9 23 0 1 1 0 GMT",
            "1990 1995 9 22 0 1 1 0 GMT"
        ],
        "France": [
            "1916 1916 5 14 7 23 2 1 S",
            "1916 1919 9 1 0 23 2 0",
            "1917 1917 2 24 7 23 2 1 S",
            "1918 1918 2 9 7 23 2 1 S",
            "1919 1919 2 1 7 23 2 1 S",
            "1920 1920 1 14 7 23 2 1 S",
            "1920 1920 9 23 7 23 2 0",
            "1921 1921 2 14 7 23 2 1 S",
            "1921 1921 9 25 7 23 2 0",
            "1922 1922 2 25 7 23 2 1 S",
            "1922 1938 9 1 6 23 2 0",
            "1923 1923 4 26 7 23 2 1 S",
            "1924 1924 2 29 7 23 2 1 S",
            "1925 1925 3 4 7 23 2 1 S",
            "1926 1926 3 17 7 23 2 1 S",
            "1927 1927 3 9 7 23 2 1 S",
            "1928 1928 3 14 7 23 2 1 S",
            "1929 1929 3 20 7 23 2 1 S",
            "1930 1930 3 12 7 23 2 1 S",
            "1931 1931 3 18 7 23 2 1 S",
            "1932 1932 3 2 7 23 2 1 S",
            "1933 1933 2 25 7 23 2 1 S",
            "1934 1934 3 7 7 23 2 1 S",
            "1935 1935 2 30 7 23 2 1 S",
            "1936 1936 3 18 7 23 2 1 S",
            "1937 1937 3 3 7 23 2 1 S",
            "1938 1938 2 26 7 23 2 1 S",
            "1939 1939 3 15 7 23 2 1 S",
            "1939 1939 10 18 7 23 2 0",
            "1940 1940 1 25 7 2 0 1 S",
            "1941 1941 4 5 7 0 0 2 M",
            "1941 1941 9 6 7 0 0 1 S",
            "1942 1942 2 9 7 0 0 2 M",
            "1942 1942 10 2 7 3 0 1 S",
            "1943 1943 2 29 7 2 0 2 M",
            "1943 1943 9 4 7 3 0 1 S",
            "1944 1944 3 3 7 2 0 2 M",
            "1944 1944 9 8 7 1 0 1 S",
            "1945 1945 3 2 7 2 0 2 M",
            "1945 1945 8 16 7 3 0 0",
            "1976 1976 2 28 7 1 0 1 S",
            "1976 1976 8 26 7 1 0 0"
        ]
    },
    "links": {}
}
},{}],4:[function(require,module,exports){
//     Backbone.js 1.1.2

//     (c) 2010-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Backbone may be freely distributed under the MIT license.
//     For all details and documentation:
//     http://backbonejs.org

(function(root, factory) {

  // Set up Backbone appropriately for the environment. Start with AMD.
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded with
      // others that may still expect a global Backbone.
      root.Backbone = factory(root, exports, _, $);
    });

  // Next for Node.js or CommonJS. jQuery may not be needed as a module.
  } else if (typeof exports !== 'undefined') {
    var _ = require('lodash');
    factory(root, exports, _);

  // Finally, as a browser global.
  } else {
    root.Backbone = factory(root, {}, root._, (root.jQuery || root.Zepto || root.ender || root.$));
  }

}(this, function(root, Backbone, _, $) {

  // Initial Setup
  // -------------

  // Save the previous value of the `Backbone` variable, so that it can be
  // restored later on, if `noConflict` is used.
  var previousBackbone = root.Backbone;

  // Create local references to array methods we'll want to use later.
  var array = [];
  var push = array.push;
  var slice = array.slice;
  var splice = array.splice;

  // Current version of the library. Keep in sync with `package.json`.
  Backbone.VERSION = '1.1.2';

  // For Backbone's purposes, jQuery, Zepto, Ender, or My Library (kidding) owns
  // the `$` variable.
  Backbone.$ = $;

  // Runs Backbone.js in *noConflict* mode, returning the `Backbone` variable
  // to its previous owner. Returns a reference to this Backbone object.
  Backbone.noConflict = function() {
    root.Backbone = previousBackbone;
    return this;
  };

  // Turn on `emulateHTTP` to support legacy HTTP servers. Setting this option
  // will fake `"PATCH"`, `"PUT"` and `"DELETE"` requests via the `_method` parameter and
  // set a `X-Http-Method-Override` header.
  Backbone.emulateHTTP = false;

  // Turn on `emulateJSON` to support legacy servers that can't deal with direct
  // `application/json` requests ... will encode the body as
  // `application/x-www-form-urlencoded` instead and will send the model in a
  // form param named `model`.
  Backbone.emulateJSON = false;

  // Backbone.Events
  // ---------------

  // A module that can be mixed in to *any object* in order to provide it with
  // custom events. You may bind with `on` or remove with `off` callback
  // functions to an event; `trigger`-ing an event fires all callbacks in
  // succession.
  //
  //     var object = {};
  //     _.extend(object, Backbone.Events);
  //     object.on('expand', function(){ alert('expanded'); });
  //     object.trigger('expand');
  //
  var Events = Backbone.Events = {

    // Bind an event to a `callback` function. Passing `"all"` will bind
    // the callback to all events fired.
    on: function(name, callback, context) {
      if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
      this._events || (this._events = {});
      var events = this._events[name] || (this._events[name] = []);
      events.push({callback: callback, context: context, ctx: context || this});
      return this;
    },

    // Bind an event to only be triggered a single time. After the first time
    // the callback is invoked, it will be removed.
    once: function(name, callback, context) {
      if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
      var self = this;
      var once = _.once(function() {
        self.off(name, once);
        callback.apply(this, arguments);
      });
      once._callback = callback;
      return this.on(name, once, context);
    },

    // Remove one or many callbacks. If `context` is null, removes all
    // callbacks with that function. If `callback` is null, removes all
    // callbacks for the event. If `name` is null, removes all bound
    // callbacks for all events.
    off: function(name, callback, context) {
      var retain, ev, events, names, i, l, j, k;
      if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
      if (!name && !callback && !context) {
        this._events = void 0;
        return this;
      }
      names = name ? [name] : _.keys(this._events);
      for (i = 0, l = names.length; i < l; i++) {
        name = names[i];
        if (events = this._events[name]) {
          this._events[name] = retain = [];
          if (callback || context) {
            for (j = 0, k = events.length; j < k; j++) {
              ev = events[j];
              if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                retain.push(ev);
              }
            }
          }
          if (!retain.length) delete this._events[name];
        }
      }

      return this;
    },

    // Trigger one or many events, firing all bound callbacks. Callbacks are
    // passed the same arguments as `trigger` is, apart from the event name
    // (unless you're listening on `"all"`, which will cause your callback to
    // receive the true name of the event as the first argument).
    trigger: function(name) {
      if (!this._events) return this;
      var args = slice.call(arguments, 1);
      if (!eventsApi(this, 'trigger', name, args)) return this;
      var events = this._events[name];
      var allEvents = this._events.all;
      if (events) triggerEvents(events, args);
      if (allEvents) triggerEvents(allEvents, arguments);
      return this;
    },

    // Tell this object to stop listening to either specific events ... or
    // to every object it's currently listening to.
    stopListening: function(obj, name, callback) {
      var listeningTo = this._listeningTo;
      if (!listeningTo) return this;
      var remove = !name && !callback;
      if (!callback && typeof name === 'object') callback = this;
      if (obj) (listeningTo = {})[obj._listenId] = obj;
      for (var id in listeningTo) {
        obj = listeningTo[id];
        obj.off(name, callback, this);
        if (remove || _.isEmpty(obj._events)) delete this._listeningTo[id];
      }
      return this;
    }

  };

  // Regular expression used to split event strings.
  var eventSplitter = /\s+/;

  // Implement fancy features of the Events API such as multiple event
  // names `"change blur"` and jQuery-style event maps `{change: action}`
  // in terms of the existing API.
  var eventsApi = function(obj, action, name, rest) {
    if (!name) return true;

    // Handle event maps.
    if (typeof name === 'object') {
      for (var key in name) {
        obj[action].apply(obj, [key, name[key]].concat(rest));
      }
      return false;
    }

    // Handle space separated event names.
    if (eventSplitter.test(name)) {
      var names = name.split(eventSplitter);
      for (var i = 0, l = names.length; i < l; i++) {
        obj[action].apply(obj, [names[i]].concat(rest));
      }
      return false;
    }

    return true;
  };

  // A difficult-to-believe, but optimized internal dispatch function for
  // triggering events. Tries to keep the usual cases speedy (most internal
  // Backbone events have 3 arguments).
  var triggerEvents = function(events, args) {
    var ev, i = -1, l = events.length, a1 = args[0], a2 = args[1], a3 = args[2];
    switch (args.length) {
      case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx); return;
      case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1); return;
      case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2); return;
      case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, a1, a2, a3); return;
      default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args); return;
    }
  };

  var listenMethods = {listenTo: 'on', listenToOnce: 'once'};

  // Inversion-of-control versions of `on` and `once`. Tell *this* object to
  // listen to an event in another object ... keeping track of what it's
  // listening to.
  _.each(listenMethods, function(implementation, method) {
    Events[method] = function(obj, name, callback) {
      var listeningTo = this._listeningTo || (this._listeningTo = {});
      var id = obj._listenId || (obj._listenId = _.uniqueId('l'));
      listeningTo[id] = obj;
      if (!callback && typeof name === 'object') callback = this;
      obj[implementation](name, callback, this);
      return this;
    };
  });

  // Aliases for backwards compatibility.
  Events.bind   = Events.on;
  Events.unbind = Events.off;

  // Allow the `Backbone` object to serve as a global event bus, for folks who
  // want global "pubsub" in a convenient place.
  _.extend(Backbone, Events);

  // Backbone.Model
  // --------------

  // Backbone **Models** are the basic data object in the framework --
  // frequently representing a row in a table in a database on your server.
  // A discrete chunk of data and a bunch of useful, related methods for
  // performing computations and transformations on that data.

  // Create a new model with the specified attributes. A client id (`cid`)
  // is automatically generated and assigned for you.
  var Model = Backbone.Model = function(attributes, options) {
    var attrs = attributes || {};
    options || (options = {});
    this.cid = _.uniqueId('c');
    this.attributes = {};
    if (options.collection) this.collection = options.collection;
    if (options.parse) attrs = this.parse(attrs, options) || {};
    attrs = _.defaults({}, attrs, _.result(this, 'defaults'));
    this.set(attrs, options);
    this.changed = {};
    this.initialize.apply(this, arguments);
  };

  // Attach all inheritable methods to the Model prototype.
  _.extend(Model.prototype, Events, {

    // A hash of attributes whose current and previous value differ.
    changed: null,

    // The value returned during the last failed validation.
    validationError: null,

    // The default name for the JSON `id` attribute is `"id"`. MongoDB and
    // CouchDB users may want to set this to `"_id"`.
    idAttribute: 'id',

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Return a copy of the model's `attributes` object.
    toJSON: function(options) {
      return _.clone(this.attributes);
    },

    // Proxy `Backbone.sync` by default -- but override this if you need
    // custom syncing semantics for *this* particular model.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Get the value of an attribute.
    get: function(attr) {
      return this.attributes[attr];
    },

    // Get the HTML-escaped value of an attribute.
    escape: function(attr) {
      return _.escape(this.get(attr));
    },

    // Returns `true` if the attribute contains a value that is not null
    // or undefined.
    has: function(attr) {
      return this.get(attr) != null;
    },

    // Set a hash of model attributes on the object, firing `"change"`. This is
    // the core primitive operation of a model, updating the data and notifying
    // anyone who needs to know about the change in state. The heart of the beast.
    set: function(key, val, options) {
      var attr, attrs, unset, changes, silent, changing, prev, current;
      if (key == null) return this;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options || (options = {});

      // Run validation.
      if (!this._validate(attrs, options)) return false;

      // Extract attributes and options.
      unset           = options.unset;
      silent          = options.silent;
      changes         = [];
      changing        = this._changing;
      this._changing  = true;

      if (!changing) {
        this._previousAttributes = _.clone(this.attributes);
        this.changed = {};
      }
      current = this.attributes, prev = this._previousAttributes;

      // Check for changes of `id`.
      if (this.idAttribute in attrs) this.id = attrs[this.idAttribute];

      // For each `set` attribute, update or delete the current value.
      for (attr in attrs) {
        val = attrs[attr];
        if (!_.isEqual(current[attr], val)) changes.push(attr);
        if (!_.isEqual(prev[attr], val)) {
          this.changed[attr] = val;
        } else {
          delete this.changed[attr];
        }
        unset ? delete current[attr] : current[attr] = val;
      }

      // Trigger all relevant attribute changes.
      if (!silent) {
        if (changes.length) this._pending = options;
        for (var i = 0, l = changes.length; i < l; i++) {
          this.trigger('change:' + changes[i], this, current[changes[i]], options);
        }
      }

      // You might be wondering why there's a `while` loop here. Changes can
      // be recursively nested within `"change"` events.
      if (changing) return this;
      if (!silent) {
        while (this._pending) {
          options = this._pending;
          this._pending = false;
          this.trigger('change', this, options);
        }
      }
      this._pending = false;
      this._changing = false;
      return this;
    },

    // Remove an attribute from the model, firing `"change"`. `unset` is a noop
    // if the attribute doesn't exist.
    unset: function(attr, options) {
      return this.set(attr, void 0, _.extend({}, options, {unset: true}));
    },

    // Clear all attributes on the model, firing `"change"`.
    clear: function(options) {
      var attrs = {};
      for (var key in this.attributes) attrs[key] = void 0;
      return this.set(attrs, _.extend({}, options, {unset: true}));
    },

    // Determine if the model has changed since the last `"change"` event.
    // If you specify an attribute name, determine if that attribute has changed.
    hasChanged: function(attr) {
      if (attr == null) return !_.isEmpty(this.changed);
      return _.has(this.changed, attr);
    },

    // Return an object containing all the attributes that have changed, or
    // false if there are no changed attributes. Useful for determining what
    // parts of a view need to be updated and/or what attributes need to be
    // persisted to the server. Unset attributes will be set to undefined.
    // You can also pass an attributes object to diff against the model,
    // determining if there *would be* a change.
    changedAttributes: function(diff) {
      if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
      var val, changed = false;
      var old = this._changing ? this._previousAttributes : this.attributes;
      for (var attr in diff) {
        if (_.isEqual(old[attr], (val = diff[attr]))) continue;
        (changed || (changed = {}))[attr] = val;
      }
      return changed;
    },

    // Get the previous value of an attribute, recorded at the time the last
    // `"change"` event was fired.
    previous: function(attr) {
      if (attr == null || !this._previousAttributes) return null;
      return this._previousAttributes[attr];
    },

    // Get all of the attributes of the model at the time of the previous
    // `"change"` event.
    previousAttributes: function() {
      return _.clone(this._previousAttributes);
    },

    // Fetch the model from the server. If the server's representation of the
    // model differs from its current attributes, they will be overridden,
    // triggering a `"change"` event.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        if (!model.set(model.parse(resp, options), options)) return false;
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Set a hash of model attributes, and sync the model to the server.
    // If the server returns an attributes hash that differs, the model's
    // state will be `set` again.
    save: function(key, val, options) {
      var attrs, method, xhr, attributes = this.attributes;

      // Handle both `"key", value` and `{key: value}` -style arguments.
      if (key == null || typeof key === 'object') {
        attrs = key;
        options = val;
      } else {
        (attrs = {})[key] = val;
      }

      options = _.extend({validate: true}, options);

      // If we're not waiting and attributes exist, save acts as
      // `set(attr).save(null, opts)` with validation. Otherwise, check if
      // the model will be valid when the attributes, if any, are set.
      if (attrs && !options.wait) {
        if (!this.set(attrs, options)) return false;
      } else {
        if (!this._validate(attrs, options)) return false;
      }

      // Set temporary attributes if `{wait: true}`.
      if (attrs && options.wait) {
        this.attributes = _.extend({}, attributes, attrs);
      }

      // After a successful server-side save, the client is (optionally)
      // updated with the server-side state.
      if (options.parse === void 0) options.parse = true;
      var model = this;
      var success = options.success;
      options.success = function(resp) {
        // Ensure attributes are restored during synchronous saves.
        model.attributes = attributes;
        var serverAttrs = model.parse(resp, options);
        if (options.wait) serverAttrs = _.extend(attrs || {}, serverAttrs);
        if (_.isObject(serverAttrs) && !model.set(serverAttrs, options)) {
          return false;
        }
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
      wrapError(this, options);

      method = this.isNew() ? 'create' : (options.patch ? 'patch' : 'update');
      if (method === 'patch') options.attrs = attrs;
      xhr = this.sync(method, this, options);

      // Restore attributes.
      if (attrs && options.wait) this.attributes = attributes;

      return xhr;
    },

    // Destroy this model on the server if it was already persisted.
    // Optimistically removes the model from its collection, if it has one.
    // If `wait: true` is passed, waits for the server to respond before removal.
    destroy: function(options) {
      options = options ? _.clone(options) : {};
      var model = this;
      var success = options.success;

      var destroy = function() {
        model.trigger('destroy', model, model.collection, options);
      };

      options.success = function(resp) {
        if (options.wait || model.isNew()) destroy();
        if (success) success(model, resp, options);
        if (!model.isNew()) model.trigger('sync', model, resp, options);
      };

      if (this.isNew()) {
        options.success();
        return false;
      }
      wrapError(this, options);

      var xhr = this.sync('delete', this, options);
      if (!options.wait) destroy();
      return xhr;
    },

    // Default URL for the model's representation on the server -- if you're
    // using Backbone's restful methods, override this to change the endpoint
    // that will be called.
    url: function() {
      var base =
        _.result(this, 'urlRoot') ||
        _.result(this.collection, 'url') ||
        urlError();
      if (this.isNew()) return base;
      return base.replace(/([^\/])$/, '$1/') + encodeURIComponent(this.id);
    },

    // **parse** converts a response into the hash of attributes to be `set` on
    // the model. The default implementation is just to pass the response along.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new model with identical attributes to this one.
    clone: function() {
      return new this.constructor(this.attributes);
    },

    // A model is new if it has never been saved to the server, and lacks an id.
    isNew: function() {
      return !this.has(this.idAttribute);
    },

    // Check if the model is currently in a valid state.
    isValid: function(options) {
      return this._validate({}, _.extend(options || {}, { validate: true }));
    },

    // Run validation against the next complete set of model attributes,
    // returning `true` if all is well. Otherwise, fire an `"invalid"` event.
    _validate: function(attrs, options) {
      if (!options.validate || !this.validate) return true;
      attrs = _.extend({}, this.attributes, attrs);
      var error = this.validationError = this.validate(attrs, options) || null;
      if (!error) return true;
      this.trigger('invalid', this, error, _.extend(options, {validationError: error}));
      return false;
    }

  });

  // Underscore methods that we want to implement on the Model.
  var modelMethods = ['keys', 'values', 'pairs', 'invert', 'pick', 'omit'];

  // Mix in each Underscore method as a proxy to `Model#attributes`.
  _.each(modelMethods, function(method) {
    Model.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.attributes);
      return _[method].apply(_, args);
    };
  });

  // Backbone.Collection
  // -------------------

  // If models tend to represent a single row of data, a Backbone Collection is
  // more analagous to a table full of data ... or a small slice or page of that
  // table, or a collection of rows that belong together for a particular reason
  // -- all of the messages in this particular folder, all of the documents
  // belonging to this particular author, and so on. Collections maintain
  // indexes of their models, both in order, and for lookup by `id`.

  // Create a new **Collection**, perhaps to contain a specific type of `model`.
  // If a `comparator` is specified, the Collection will maintain
  // its models in sort order, as they're added and removed.
  var Collection = Backbone.Collection = function(models, options) {
    options || (options = {});
    if (options.model) this.model = options.model;
    if (options.comparator !== void 0) this.comparator = options.comparator;
    this._reset();
    this.initialize.apply(this, arguments);
    if (models) this.reset(models, _.extend({silent: true}, options));
  };

  // Default options for `Collection#set`.
  var setOptions = {add: true, remove: true, merge: true};
  var addOptions = {add: true, remove: false};

  // Define the Collection's inheritable methods.
  _.extend(Collection.prototype, Events, {

    // The default model for a collection is just a **Backbone.Model**.
    // This should be overridden in most cases.
    model: Model,

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // The JSON representation of a Collection is an array of the
    // models' attributes.
    toJSON: function(options) {
      return this.map(function(model){ return model.toJSON(options); });
    },

    // Proxy `Backbone.sync` by default.
    sync: function() {
      return Backbone.sync.apply(this, arguments);
    },

    // Add a model, or list of models to the set.
    add: function(models, options) {
      return this.set(models, _.extend({merge: false}, options, addOptions));
    },

    // Remove a model, or a list of models from the set.
    remove: function(models, options) {
      var singular = !_.isArray(models);
      models = singular ? [models] : _.clone(models);
      options || (options = {});
      var i, l, index, model;
      for (i = 0, l = models.length; i < l; i++) {
        model = models[i] = this.get(models[i]);
        if (!model) continue;
        delete this._byId[model.id];
        delete this._byId[model.cid];
        index = this.indexOf(model);
        this.models.splice(index, 1);
        this.length--;
        if (!options.silent) {
          options.index = index;
          model.trigger('remove', model, this, options);
        }
        this._removeReference(model, options);
      }
      return singular ? models[0] : models;
    },

    // Update a collection by `set`-ing a new list of models, adding new ones,
    // removing models that are no longer present, and merging models that
    // already exist in the collection, as necessary. Similar to **Model#set**,
    // the core operation for updating the data contained by the collection.
    set: function(models, options) {
      options = _.defaults({}, options, setOptions);
      if (options.parse) models = this.parse(models, options);
      var singular = !_.isArray(models);
      models = singular ? (models ? [models] : []) : _.clone(models);
      var i, l, id, model, attrs, existing, sort;
      var at = options.at;
      var targetModel = this.model;
      var sortable = this.comparator && (at == null) && options.sort !== false;
      var sortAttr = _.isString(this.comparator) ? this.comparator : null;
      var toAdd = [], toRemove = [], modelMap = {};
      var add = options.add, merge = options.merge, remove = options.remove;
      var order = !sortable && add && remove ? [] : false;

      // Turn bare objects into model references, and prevent invalid models
      // from being added.
      for (i = 0, l = models.length; i < l; i++) {
        attrs = models[i] || {};
        if (attrs instanceof Model) {
          id = model = attrs;
        } else {
          id = attrs[targetModel.prototype.idAttribute || 'id'];
        }

        // If a duplicate is found, prevent it from being added and
        // optionally merge it into the existing model.
        if (existing = this.get(id)) {
          if (remove) modelMap[existing.cid] = true;
          if (merge) {
            attrs = attrs === model ? model.attributes : attrs;
            if (options.parse) attrs = existing.parse(attrs, options);
            existing.set(attrs, options);
            if (sortable && !sort && existing.hasChanged(sortAttr)) sort = true;
          }
          models[i] = existing;

        // If this is a new, valid model, push it to the `toAdd` list.
        } else if (add) {
          model = models[i] = this._prepareModel(attrs, options);
          if (!model) continue;
          toAdd.push(model);
          this._addReference(model, options);
        }

        // Do not add multiple models with the same `id`.
        model = existing || model;
        if (order && (model.isNew() || !modelMap[model.id])) order.push(model);
        modelMap[model.id] = true;
      }

      // Remove nonexistent models if appropriate.
      if (remove) {
        for (i = 0, l = this.length; i < l; ++i) {
          if (!modelMap[(model = this.models[i]).cid]) toRemove.push(model);
        }
        if (toRemove.length) this.remove(toRemove, options);
      }

      // See if sorting is needed, update `length` and splice in new models.
      if (toAdd.length || (order && order.length)) {
        if (sortable) sort = true;
        this.length += toAdd.length;
        if (at != null) {
          for (i = 0, l = toAdd.length; i < l; i++) {
            this.models.splice(at + i, 0, toAdd[i]);
          }
        } else {
          if (order) this.models.length = 0;
          var orderedModels = order || toAdd;
          for (i = 0, l = orderedModels.length; i < l; i++) {
            this.models.push(orderedModels[i]);
          }
        }
      }

      // Silently sort the collection if appropriate.
      if (sort) this.sort({silent: true});

      // Unless silenced, it's time to fire all appropriate add/sort events.
      if (!options.silent) {
        for (i = 0, l = toAdd.length; i < l; i++) {
          (model = toAdd[i]).trigger('add', model, this, options);
        }
        if (sort || (order && order.length)) this.trigger('sort', this, options);
      }

      // Return the added (or merged) model (or models).
      return singular ? models[0] : models;
    },

    // When you have more items than you want to add or remove individually,
    // you can reset the entire set with a new list of models, without firing
    // any granular `add` or `remove` events. Fires `reset` when finished.
    // Useful for bulk operations and optimizations.
    reset: function(models, options) {
      options || (options = {});
      for (var i = 0, l = this.models.length; i < l; i++) {
        this._removeReference(this.models[i], options);
      }
      options.previousModels = this.models;
      this._reset();
      models = this.add(models, _.extend({silent: true}, options));
      if (!options.silent) this.trigger('reset', this, options);
      return models;
    },

    // Add a model to the end of the collection.
    push: function(model, options) {
      return this.add(model, _.extend({at: this.length}, options));
    },

    // Remove a model from the end of the collection.
    pop: function(options) {
      var model = this.at(this.length - 1);
      this.remove(model, options);
      return model;
    },

    // Add a model to the beginning of the collection.
    unshift: function(model, options) {
      return this.add(model, _.extend({at: 0}, options));
    },

    // Remove a model from the beginning of the collection.
    shift: function(options) {
      var model = this.at(0);
      this.remove(model, options);
      return model;
    },

    // Slice out a sub-array of models from the collection.
    slice: function() {
      return slice.apply(this.models, arguments);
    },

    // Get a model from the set by id.
    get: function(obj) {
      if (obj == null) return void 0;
      return this._byId[obj] || this._byId[obj.id] || this._byId[obj.cid];
    },

    // Get the model at the given index.
    at: function(index) {
      return this.models[index];
    },

    // Return models with matching attributes. Useful for simple cases of
    // `filter`.
    where: function(attrs, first) {
      if (_.isEmpty(attrs)) return first ? void 0 : [];
      return this[first ? 'find' : 'filter'](function(model) {
        for (var key in attrs) {
          if (attrs[key] !== model.get(key)) return false;
        }
        return true;
      });
    },

    // Return the first model with matching attributes. Useful for simple cases
    // of `find`.
    findWhere: function(attrs) {
      return this.where(attrs, true);
    },

    // Force the collection to re-sort itself. You don't need to call this under
    // normal circumstances, as the set will maintain sort order as each item
    // is added.
    sort: function(options) {
      if (!this.comparator) throw new Error('Cannot sort a set without a comparator');
      options || (options = {});

      // Run sort based on type of `comparator`.
      if (_.isString(this.comparator) || this.comparator.length === 1) {
        this.models = this.sortBy(this.comparator, this);
      } else {
        this.models.sort(_.bind(this.comparator, this));
      }

      if (!options.silent) this.trigger('sort', this, options);
      return this;
    },

    // Pluck an attribute from each model in the collection.
    pluck: function(attr) {
      return _.invoke(this.models, 'get', attr);
    },

    // Fetch the default set of models for this collection, resetting the
    // collection when they arrive. If `reset: true` is passed, the response
    // data will be passed through the `reset` method instead of `set`.
    fetch: function(options) {
      options = options ? _.clone(options) : {};
      if (options.parse === void 0) options.parse = true;
      var success = options.success;
      var collection = this;
      options.success = function(resp) {
        var method = options.reset ? 'reset' : 'set';
        collection[method](resp, options);
        if (success) success(collection, resp, options);
        collection.trigger('sync', collection, resp, options);
      };
      wrapError(this, options);
      return this.sync('read', this, options);
    },

    // Create a new instance of a model in this collection. Add the model to the
    // collection immediately, unless `wait: true` is passed, in which case we
    // wait for the server to agree.
    create: function(model, options) {
      options = options ? _.clone(options) : {};
      if (!(model = this._prepareModel(model, options))) return false;
      if (!options.wait) this.add(model, options);
      var collection = this;
      var success = options.success;
      options.success = function(model, resp) {
        if (options.wait) collection.add(model, options);
        if (success) success(model, resp, options);
      };
      model.save(null, options);
      return model;
    },

    // **parse** converts a response into a list of models to be added to the
    // collection. The default implementation is just to pass it through.
    parse: function(resp, options) {
      return resp;
    },

    // Create a new collection with an identical list of models as this one.
    clone: function() {
      return new this.constructor(this.models);
    },

    // Private method to reset all internal state. Called when the collection
    // is first initialized or reset.
    _reset: function() {
      this.length = 0;
      this.models = [];
      this._byId  = {};
    },

    // Prepare a hash of attributes (or other model) to be added to this
    // collection.
    _prepareModel: function(attrs, options) {
      if (attrs instanceof Model) return attrs;
      options = options ? _.clone(options) : {};
      options.collection = this;
      var model = new this.model(attrs, options);
      if (!model.validationError) return model;
      this.trigger('invalid', this, model.validationError, options);
      return false;
    },

    // Internal method to create a model's ties to a collection.
    _addReference: function(model, options) {
      this._byId[model.cid] = model;
      if (model.id != null) this._byId[model.id] = model;
      if (!model.collection) model.collection = this;
      model.on('all', this._onModelEvent, this);
    },

    // Internal method to sever a model's ties to a collection.
    _removeReference: function(model, options) {
      if (this === model.collection) delete model.collection;
      model.off('all', this._onModelEvent, this);
    },

    // Internal method called every time a model in the set fires an event.
    // Sets need to update their indexes when models change ids. All other
    // events simply proxy through. "add" and "remove" events that originate
    // in other collections are ignored.
    _onModelEvent: function(event, model, collection, options) {
      if ((event === 'add' || event === 'remove') && collection !== this) return;
      if (event === 'destroy') this.remove(model, options);
      if (model && event === 'change:' + model.idAttribute) {
        delete this._byId[model.previous(model.idAttribute)];
        if (model.id != null) this._byId[model.id] = model;
      }
      this.trigger.apply(this, arguments);
    }

  });

  // Underscore methods that we want to implement on the Collection.
  // 90% of the core usefulness of Backbone Collections is actually implemented
  // right here:
  var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
    'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
    'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
    'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
    'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
    'lastIndexOf', 'isEmpty', 'chain', 'sample'];

  // Mix in each Underscore method as a proxy to `Collection#models`.
  _.each(methods, function(method) {
    Collection.prototype[method] = function() {
      var args = slice.call(arguments);
      args.unshift(this.models);
      return _[method].apply(_, args);
    };
  });

  // Underscore methods that take a property name as an argument.
  var attributeMethods = ['groupBy', 'countBy', 'sortBy', 'indexBy'];

  // Use attributes instead of properties.
  _.each(attributeMethods, function(method) {
    Collection.prototype[method] = function(value, context) {
      var iterator = _.isFunction(value) ? value : function(model) {
        return model.get(value);
      };
      return _[method](this.models, iterator, context);
    };
  });

  // Backbone.View
  // -------------

  // Backbone Views are almost more convention than they are actual code. A View
  // is simply a JavaScript object that represents a logical chunk of UI in the
  // DOM. This might be a single item, an entire list, a sidebar or panel, or
  // even the surrounding frame which wraps your whole app. Defining a chunk of
  // UI as a **View** allows you to define your DOM events declaratively, without
  // having to worry about render order ... and makes it easy for the view to
  // react to specific changes in the state of your models.

  // Creating a Backbone.View creates its initial element outside of the DOM,
  // if an existing element is not provided...
  var View = Backbone.View = function(options) {
    this.cid = _.uniqueId('view');
    options || (options = {});
    _.extend(this, _.pick(options, viewOptions));
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  // Cached regex to split keys for `delegate`.
  var delegateEventSplitter = /^(\S+)\s*(.*)$/;

  // List of view options to be merged as properties.
  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

  // Set up all inheritable **Backbone.View** properties and methods.
  _.extend(View.prototype, Events, {

    // The default `tagName` of a View's element is `"div"`.
    tagName: 'div',

    // jQuery delegate for element lookup, scoped to DOM elements within the
    // current view. This should be preferred to global lookups where possible.
    $: function(selector) {
      return this.$el.find(selector);
    },

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // **render** is the core function that your view should override, in order
    // to populate its element (`this.el`), with the appropriate HTML. The
    // convention is for **render** to always return `this`.
    render: function() {
      return this;
    },

    // Remove this view by taking the element out of the DOM, and removing any
    // applicable Backbone.Events listeners.
    remove: function() {
      this.$el.remove();
      this.stopListening();
      return this;
    },

    // Change the view's element (`this.el` property), including event
    // re-delegation.
    setElement: function(element, delegate) {
      if (this.$el) this.undelegateEvents();
      this.$el = element instanceof Backbone.$ ? element : Backbone.$(element);
      this.el = this.$el[0];
      if (delegate !== false) this.delegateEvents();
      return this;
    },

    // Set callbacks, where `this.events` is a hash of
    //
    // *{"event selector": "callback"}*
    //
    //     {
    //       'mousedown .title':  'edit',
    //       'click .button':     'save',
    //       'click .open':       function(e) { ... }
    //     }
    //
    // pairs. Callbacks will be bound to the view, with `this` set properly.
    // Uses event delegation for efficiency.
    // Omitting the selector binds the event to `this.el`.
    // This only works for delegate-able events: not `focus`, `blur`, and
    // not `change`, `submit`, and `reset` in Internet Explorer.
    delegateEvents: function(events) {
      if (!(events || (events = _.result(this, 'events')))) return this;
      this.undelegateEvents();
      for (var key in events) {
        var method = events[key];
        if (!_.isFunction(method)) method = this[events[key]];
        if (!method) continue;

        var match = key.match(delegateEventSplitter);
        var eventName = match[1], selector = match[2];
        method = _.bind(method, this);
        eventName += '.delegateEvents' + this.cid;
        if (selector === '') {
          this.$el.on(eventName, method);
        } else {
          this.$el.on(eventName, selector, method);
        }
      }
      return this;
    },

    // Clears all callbacks previously bound to the view with `delegateEvents`.
    // You usually don't need to use this, but may wish to if you have multiple
    // Backbone views attached to the same DOM element.
    undelegateEvents: function() {
      this.$el.off('.delegateEvents' + this.cid);
      return this;
    },

    // Ensure that the View has a DOM element to render into.
    // If `this.el` is a string, pass it through `$()`, take the first
    // matching element, and re-assign it to `el`. Otherwise, create
    // an element from the `id`, `className` and `tagName` properties.
    _ensureElement: function() {
      if (!this.el) {
        var attrs = _.extend({}, _.result(this, 'attributes'));
        if (this.id) attrs.id = _.result(this, 'id');
        if (this.className) attrs['class'] = _.result(this, 'className');
        var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
        this.setElement($el, false);
      } else {
        this.setElement(_.result(this, 'el'), false);
      }
    }

  });

  // Backbone.sync
  // -------------

  // Override this function to change the manner in which Backbone persists
  // models to the server. You will be passed the type of request, and the
  // model in question. By default, makes a RESTful Ajax request
  // to the model's `url()`. Some possible customizations could be:
  //
  // * Use `setTimeout` to batch rapid-fire updates into a single request.
  // * Send up the models as XML instead of JSON.
  // * Persist models via WebSockets instead of Ajax.
  //
  // Turn on `Backbone.emulateHTTP` in order to send `PUT` and `DELETE` requests
  // as `POST`, with a `_method` parameter containing the true HTTP method,
  // as well as all requests with the body as `application/x-www-form-urlencoded`
  // instead of `application/json` with the model in a param named `model`.
  // Useful when interfacing with server-side languages like **PHP** that make
  // it difficult to read the body of `PUT` requests.
  Backbone.sync = function(method, model, options) {
    var type = methodMap[method];

    // Default options, unless specified.
    _.defaults(options || (options = {}), {
      emulateHTTP: Backbone.emulateHTTP,
      emulateJSON: Backbone.emulateJSON
    });

    // Default JSON-request options.
    var params = {type: type, dataType: 'json'};

    // Ensure that we have a URL.
    if (!options.url) {
      params.url = _.result(model, 'url') || urlError();
    }

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    // For older servers, emulate JSON by encoding the request into an HTML-form.
    if (options.emulateJSON) {
      params.contentType = 'application/x-www-form-urlencoded';
      params.data = params.data ? {model: params.data} : {};
    }

    // For older servers, emulate HTTP by mimicking the HTTP method with `_method`
    // And an `X-HTTP-Method-Override` header.
    if (options.emulateHTTP && (type === 'PUT' || type === 'DELETE' || type === 'PATCH')) {
      params.type = 'POST';
      if (options.emulateJSON) params.data._method = type;
      var beforeSend = options.beforeSend;
      options.beforeSend = function(xhr) {
        xhr.setRequestHeader('X-HTTP-Method-Override', type);
        if (beforeSend) return beforeSend.apply(this, arguments);
      };
    }

    // Don't process data on a non-GET request.
    if (params.type !== 'GET' && !options.emulateJSON) {
      params.processData = false;
    }

    // If we're sending a `PATCH` request, and we're in an old Internet Explorer
    // that still has ActiveX enabled by default, override jQuery to use that
    // for XHR instead. Remove this line when jQuery supports `PATCH` on IE8.
    if (params.type === 'PATCH' && noXhrPatch) {
      params.xhr = function() {
        return new ActiveXObject("Microsoft.XMLHTTP");
      };
    }

    // Make the request, allowing the user to override any Ajax options.
    var xhr = options.xhr = Backbone.ajax(_.extend(params, options));
    model.trigger('request', model, xhr, options);
    return xhr;
  };

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  // Map from CRUD to HTTP for our default `Backbone.sync` implementation.
  var methodMap = {
    'create': 'POST',
    'update': 'PUT',
    'patch':  'PATCH',
    'delete': 'DELETE',
    'read':   'GET'
  };

  // Set the default implementation of `Backbone.ajax` to proxy through to `$`.
  // Override this if you'd like to use a different library.
  Backbone.ajax = function() {
    return Backbone.$.ajax.apply(Backbone.$, arguments);
  };

  // Backbone.Router
  // ---------------

  // Routers map faux-URLs to actions, and fire events when routes are
  // matched. Creating a new one sets its `routes` hash, if not set statically.
  var Router = Backbone.Router = function(options) {
    options || (options = {});
    if (options.routes) this.routes = options.routes;
    this._bindRoutes();
    this.initialize.apply(this, arguments);
  };

  // Cached regular expressions for matching named param parts and splatted
  // parts of route strings.
  var optionalParam = /\((.*?)\)/g;
  var namedParam    = /(\(\?)?:\w+/g;
  var splatParam    = /\*\w+/g;
  var escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

  // Set up all inheritable **Backbone.Router** properties and methods.
  _.extend(Router.prototype, Events, {

    // Initialize is an empty function by default. Override it with your own
    // initialization logic.
    initialize: function(){},

    // Manually bind a single named route to a callback. For example:
    //
    //     this.route('search/:query/p:num', 'search', function(query, num) {
    //       ...
    //     });
    //
    route: function(route, name, callback) {
      if (!_.isRegExp(route)) route = this._routeToRegExp(route);
      if (_.isFunction(name)) {
        callback = name;
        name = '';
      }
      if (!callback) callback = this[name];
      var router = this;
      Backbone.history.route(route, function(fragment) {
        var args = router._extractParameters(route, fragment);
        router.execute(callback, args);
        router.trigger.apply(router, ['route:' + name].concat(args));
        router.trigger('route', name, args);
        Backbone.history.trigger('route', router, name, args);
      });
      return this;
    },

    // Execute a route handler with the provided parameters.  This is an
    // excellent place to do pre-route setup or post-route cleanup.
    execute: function(callback, args) {
      if (callback) callback.apply(this, args);
    },

    // Simple proxy to `Backbone.history` to save a fragment into the history.
    navigate: function(fragment, options) {
      Backbone.history.navigate(fragment, options);
      return this;
    },

    // Bind all defined routes to `Backbone.history`. We have to reverse the
    // order of the routes here to support behavior where the most general
    // routes can be defined at the bottom of the route map.
    _bindRoutes: function() {
      if (!this.routes) return;
      this.routes = _.result(this, 'routes');
      var route, routes = _.keys(this.routes);
      while ((route = routes.pop()) != null) {
        this.route(route, this.routes[route]);
      }
    },

    // Convert a route string into a regular expression, suitable for matching
    // against the current location hash.
    _routeToRegExp: function(route) {
      route = route.replace(escapeRegExp, '\\$&')
                   .replace(optionalParam, '(?:$1)?')
                   .replace(namedParam, function(match, optional) {
                     return optional ? match : '([^/?]+)';
                   })
                   .replace(splatParam, '([^?]*?)');
      return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
    },

    // Given a route, and a URL fragment that it matches, return the array of
    // extracted decoded parameters. Empty or unmatched parameters will be
    // treated as `null` to normalize cross-browser behavior.
    _extractParameters: function(route, fragment) {
      var params = route.exec(fragment).slice(1);
      return _.map(params, function(param, i) {
        // Don't decode the search params.
        if (i === params.length - 1) return param || null;
        return param ? decodeURIComponent(param) : null;
      });
    }

  });

  // Backbone.History
  // ----------------

  // Handles cross-browser history management, based on either
  // [pushState](http://diveintohtml5.info/history.html) and real URLs, or
  // [onhashchange](https://developer.mozilla.org/en-US/docs/DOM/window.onhashchange)
  // and URL fragments. If the browser supports neither (old IE, natch),
  // falls back to polling.
  var History = Backbone.History = function() {
    this.handlers = [];
    _.bindAll(this, 'checkUrl');

    // Ensure that `History` can be used outside of the browser.
    if (typeof window !== 'undefined') {
      this.location = window.location;
      this.history = window.history;
    }
  };

  // Cached regex for stripping a leading hash/slash and trailing space.
  var routeStripper = /^[#\/]|\s+$/g;

  // Cached regex for stripping leading and trailing slashes.
  var rootStripper = /^\/+|\/+$/g;

  // Cached regex for detecting MSIE.
  var isExplorer = /msie [\w.]+/;

  // Cached regex for removing a trailing slash.
  var trailingSlash = /\/$/;

  // Cached regex for stripping urls of hash.
  var pathStripper = /#.*$/;

  // Has the history handling already been started?
  History.started = false;

  // Set up all inheritable **Backbone.History** properties and methods.
  _.extend(History.prototype, Events, {

    // The default interval to poll for hash changes, if necessary, is
    // twenty times a second.
    interval: 50,

    // Are we at the app root?
    atRoot: function() {
      return this.location.pathname.replace(/[^\/]$/, '$&/') === this.root;
    },

    // Gets the true hash value. Cannot use location.hash directly due to bug
    // in Firefox where location.hash will always be decoded.
    getHash: function(window) {
      var match = (window || this).location.href.match(/#(.*)$/);
      return match ? match[1] : '';
    },

    // Get the cross-browser normalized URL fragment, either from the URL,
    // the hash, or the override.
    getFragment: function(fragment, forcePushState) {
      if (fragment == null) {
        if (this._hasPushState || !this._wantsHashChange || forcePushState) {
          fragment = decodeURI(this.location.pathname + this.location.search);
          var root = this.root.replace(trailingSlash, '');
          if (!fragment.indexOf(root)) fragment = fragment.slice(root.length);
        } else {
          fragment = this.getHash();
        }
      }
      return fragment.replace(routeStripper, '');
    },

    // Start the hash change handling, returning `true` if the current URL matches
    // an existing route, and `false` otherwise.
    start: function(options) {
      if (History.started) throw new Error("Backbone.history has already been started");
      History.started = true;

      // Figure out the initial configuration. Do we need an iframe?
      // Is pushState desired ... is it available?
      this.options          = _.extend({root: '/'}, this.options, options);
      this.root             = this.options.root;
      this._wantsHashChange = this.options.hashChange !== false;
      this._wantsPushState  = !!this.options.pushState;
      this._hasPushState    = !!(this.options.pushState && this.history && this.history.pushState);
      var fragment          = this.getFragment();
      var docMode           = document.documentMode;
      var oldIE             = (isExplorer.exec(navigator.userAgent.toLowerCase()) && (!docMode || docMode <= 7));

      // Normalize root to always include a leading and trailing slash.
      this.root = ('/' + this.root + '/').replace(rootStripper, '/');

      if (oldIE && this._wantsHashChange) {
        var frame = Backbone.$('<iframe src="javascript:0" tabindex="-1">');
        this.iframe = frame.hide().appendTo('body')[0].contentWindow;
        this.navigate(fragment);
      }

      // Depending on whether we're using pushState or hashes, and whether
      // 'onhashchange' is supported, determine how we check the URL state.
      if (this._hasPushState) {
        Backbone.$(window).on('popstate', this.checkUrl);
      } else if (this._wantsHashChange && ('onhashchange' in window) && !oldIE) {
        Backbone.$(window).on('hashchange', this.checkUrl);
      } else if (this._wantsHashChange) {
        this._checkUrlInterval = setInterval(this.checkUrl, this.interval);
      }

      // Determine if we need to change the base url, for a pushState link
      // opened by a non-pushState browser.
      this.fragment = fragment;
      var loc = this.location;

      // Transition from hashChange to pushState or vice versa if both are
      // requested.
      if (this._wantsHashChange && this._wantsPushState) {

        // If we've started off with a route from a `pushState`-enabled
        // browser, but we're currently in a browser that doesn't support it...
        if (!this._hasPushState && !this.atRoot()) {
          this.fragment = this.getFragment(null, true);
          this.location.replace(this.root + '#' + this.fragment);
          // Return immediately as browser will do redirect to new url
          return true;

        // Or if we've started out with a hash-based route, but we're currently
        // in a browser where it could be `pushState`-based instead...
        } else if (this._hasPushState && this.atRoot() && loc.hash) {
          this.fragment = this.getHash().replace(routeStripper, '');
          this.history.replaceState({}, document.title, this.root + this.fragment);
        }

      }

      if (!this.options.silent) return this.loadUrl();
    },

    // Disable Backbone.history, perhaps temporarily. Not useful in a real app,
    // but possibly useful for unit testing Routers.
    stop: function() {
      Backbone.$(window).off('popstate', this.checkUrl).off('hashchange', this.checkUrl);
      if (this._checkUrlInterval) clearInterval(this._checkUrlInterval);
      History.started = false;
    },

    // Add a route to be tested when the fragment changes. Routes added later
    // may override previous routes.
    route: function(route, callback) {
      this.handlers.unshift({route: route, callback: callback});
    },

    // Checks the current URL to see if it has changed, and if it has,
    // calls `loadUrl`, normalizing across the hidden iframe.
    checkUrl: function(e) {
      var current = this.getFragment();
      if (current === this.fragment && this.iframe) {
        current = this.getFragment(this.getHash(this.iframe));
      }
      if (current === this.fragment) return false;
      if (this.iframe) this.navigate(current);
      this.loadUrl();
    },

    // Attempt to load the current URL fragment. If a route succeeds with a
    // match, returns `true`. If no defined routes matches the fragment,
    // returns `false`.
    loadUrl: function(fragment) {
      fragment = this.fragment = this.getFragment(fragment);
      return _.any(this.handlers, function(handler) {
        if (handler.route.test(fragment)) {
          handler.callback(fragment);
          return true;
        }
      });
    },

    // Save a fragment into the hash history, or replace the URL state if the
    // 'replace' option is passed. You are responsible for properly URL-encoding
    // the fragment in advance.
    //
    // The options object can contain `trigger: true` if you wish to have the
    // route callback be fired (not usually desirable), or `replace: true`, if
    // you wish to modify the current URL without adding an entry to the history.
    navigate: function(fragment, options) {
      if (!History.started) return false;
      if (!options || options === true) options = {trigger: !!options};

      var url = this.root + (fragment = this.getFragment(fragment || ''));

      // Strip the hash for matching.
      fragment = fragment.replace(pathStripper, '');

      if (this.fragment === fragment) return;
      this.fragment = fragment;

      // Don't include a trailing slash on the root.
      if (fragment === '' && url !== '/') url = url.slice(0, -1);

      // If pushState is available, we use it to set the fragment as a real URL.
      if (this._hasPushState) {
        this.history[options.replace ? 'replaceState' : 'pushState']({}, document.title, url);

      // If hash changes haven't been explicitly disabled, update the hash
      // fragment to store history.
      } else if (this._wantsHashChange) {
        this._updateHash(this.location, fragment, options.replace);
        if (this.iframe && (fragment !== this.getFragment(this.getHash(this.iframe)))) {
          // Opening and closing the iframe tricks IE7 and earlier to push a
          // history entry on hash-tag change.  When replace is true, we don't
          // want this.
          if(!options.replace) this.iframe.document.open().close();
          this._updateHash(this.iframe.location, fragment, options.replace);
        }

      // If you've told us that you explicitly don't want fallback hashchange-
      // based history, then `navigate` becomes a page refresh.
      } else {
        return this.location.assign(url);
      }
      if (options.trigger) return this.loadUrl(fragment);
    },

    // Update the hash location, either replacing the current entry, or adding
    // a new one to the browser history.
    _updateHash: function(location, fragment, replace) {
      if (replace) {
        var href = location.href.replace(/(javascript:|#).*$/, '');
        location.replace(href + '#' + fragment);
      } else {
        // Some browsers require that `hash` contains a leading #.
        location.hash = '#' + fragment;
      }
    }

  });

  // Create the default Backbone.history.
  Backbone.history = new History;

  // Helpers
  // -------

  // Helper function to correctly set up the prototype chain, for subclasses.
  // Similar to `goog.inherits`, but uses a hash of prototype properties and
  // class properties to be extended.
  var extend = function(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
      child = protoProps.constructor;
    } else {
      child = function(){ return parent.apply(this, arguments); };
    }

    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) _.extend(child.prototype, protoProps);

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;

    return child;
  };

  // Set up inheritance for the model, collection, router, view and history.
  Model.extend = Collection.extend = Router.extend = View.extend = History.extend = extend;

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  // Wrap an optional error callback with a fallback error event.
  var wrapError = function(model, options) {
    var error = options.error;
    options.error = function(resp) {
      if (error) error(model, resp, options);
      model.trigger('error', model, resp, options);
    };
  };

  return Backbone;

}));
},{"lodash":36}],5:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    if (Buffer.isBuffer(subject)) {
      for (i = 0; i < length; i++)
        buf[i] = subject.readUInt8(i)
    } else {
      for (i = 0; i < length; i++)
        buf[i] = ((subject[i] % 256) + 256) % 256
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str.toString()
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list[, length])')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (totalLength === undefined) {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

Buffer.compare = function (a, b) {
  assert(Buffer.isBuffer(a) && Buffer.isBuffer(b), 'Arguments must be Buffers')
  var x = a.length
  var y = b.length
  for (var i = 0, len = Math.min(x, y); i < len && a[i] === b[i]; i++) {}
  if (i !== len) {
    x = a[i]
    y = b[i]
  }
  if (x < y) {
    return -1
  }
  if (y < x) {
    return 1
  }
  return 0
}

// BUFFER INSTANCE METHODS
// =======================

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function asciiWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  var charsWritten = blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function utf16leWrite (buf, string, offset, length) {
  var charsWritten = blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end === undefined) ? self.length : Number(end)

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = asciiSlice(self, start, end)
      break
    case 'binary':
      ret = binarySlice(self, start, end)
      break
    case 'base64':
      ret = base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

Buffer.prototype.equals = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.compare = function (b) {
  assert(Buffer.isBuffer(b), 'Argument must be a Buffer')
  return Buffer.compare(this, b)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++) {
      target[i + target_start] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function binarySlice (buf, start, end) {
  return asciiSlice(buf, start, end)
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return readUInt16(this, offset, false, noAssert)
}

function readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return readInt16(this, offset, false, noAssert)
}

function readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return readInt32(this, offset, false, noAssert)
}

function readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return readFloat(this, offset, false, noAssert)
}

function readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
  return offset + 1
}

function writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
  return offset + 2
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  return writeUInt16(this, value, offset, false, noAssert)
}

function writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
  return offset + 4
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  return writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
  return offset + 1
}

function writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
  return offset + 2
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  return writeInt16(this, value, offset, false, noAssert)
}

function writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
  return offset + 4
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  return writeInt32(this, value, offset, false, noAssert)
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F) {
      byteArray.push(b)
    } else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++) {
        byteArray.push(parseInt(h[j], 16))
      }
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":6,"ieee754":7}],6:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],7:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],8:[function(require,module,exports){
module.exports = require('./lib/chai');

},{"./lib/chai":9}],9:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var used = []
  , exports = module.exports = {};

/*!
 * Chai version
 */

exports.version = '1.6.1';

/*!
 * Primary `Assertion` prototype
 */

exports.Assertion = require('./chai/assertion');

/*!
 * Assertion Error
 */

exports.AssertionError = require('./chai/error');

/*!
 * Utils for plugins (not exported)
 */

var util = require('./chai/utils');

/**
 * # .use(function)
 *
 * Provides a way to extend the internals of Chai
 *
 * @param {Function}
 * @returns {this} for chaining
 * @api public
 */

exports.use = function (fn) {
  if (!~used.indexOf(fn)) {
    fn(this, util);
    used.push(fn);
  }

  return this;
};

/*!
 * Core Assertions
 */

var core = require('./chai/core/assertions');
exports.use(core);

/*!
 * Expect interface
 */

var expect = require('./chai/interface/expect');
exports.use(expect);

/*!
 * Should interface
 */

var should = require('./chai/interface/should');
exports.use(should);

/*!
 * Assert interface
 */

var assert = require('./chai/interface/assert');
exports.use(assert);

},{"./chai/assertion":10,"./chai/core/assertions":11,"./chai/error":12,"./chai/interface/assert":13,"./chai/interface/expect":14,"./chai/interface/should":15,"./chai/utils":27}],10:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies.
 */

var AssertionError = require('./error')
  , util = require('./utils')
  , flag = util.flag;

/*!
 * Module export.
 */

module.exports = Assertion;


/*!
 * Assertion Constructor
 *
 * Creates object for chaining.
 *
 * @api private
 */

function Assertion (obj, msg, stack) {
  flag(this, 'ssfi', stack || arguments.callee);
  flag(this, 'object', obj);
  flag(this, 'message', msg);
}

/*!
  * ### Assertion.includeStack
  *
  * User configurable property, influences whether stack trace
  * is included in Assertion error message. Default of false
  * suppresses stack trace in the error message
  *
  *     Assertion.includeStack = true;  // enable stack on error
  *
  * @api public
  */

Assertion.includeStack = false;

/*!
 * ### Assertion.showDiff
 *
 * User configurable property, influences whether or not
 * the `showDiff` flag should be included in the thrown
 * AssertionErrors. `false` will always be `false`; `true`
 * will be true when the assertion has requested a diff
 * be shown.
 *
 * @api public
 */

Assertion.showDiff = true;

Assertion.addProperty = function (name, fn) {
  util.addProperty(this.prototype, name, fn);
};

Assertion.addMethod = function (name, fn) {
  util.addMethod(this.prototype, name, fn);
};

Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
  util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
};

Assertion.overwriteProperty = function (name, fn) {
  util.overwriteProperty(this.prototype, name, fn);
};

Assertion.overwriteMethod = function (name, fn) {
  util.overwriteMethod(this.prototype, name, fn);
};

/*!
 * ### .assert(expression, message, negateMessage, expected, actual)
 *
 * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
 *
 * @name assert
 * @param {Philosophical} expression to be tested
 * @param {String} message to display if fails
 * @param {String} negatedMessage to display if negated expression fails
 * @param {Mixed} expected value (remember to check for negation)
 * @param {Mixed} actual (optional) will default to `this.obj`
 * @api private
 */

Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
  var ok = util.test(this, arguments);
  if (true !== showDiff) showDiff = false;
  if (true !== Assertion.showDiff) showDiff = false;

  if (!ok) {
    var msg = util.getMessage(this, arguments)
      , actual = util.getActual(this, arguments);
    throw new AssertionError({
        message: msg
      , actual: actual
      , expected: expected
      , stackStartFunction: (Assertion.includeStack) ? this.assert : flag(this, 'ssfi')
      , showDiff: showDiff
    });
  }
};

/*!
 * ### ._obj
 *
 * Quick reference to stored `actual` value for plugin developers.
 *
 * @api private
 */

Object.defineProperty(Assertion.prototype, '_obj',
  { get: function () {
      return flag(this, 'object');
    }
  , set: function (val) {
      flag(this, 'object', val);
    }
});

},{"./error":12,"./utils":27}],11:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, _) {
  var Assertion = chai.Assertion
    , toString = Object.prototype.toString
    , flag = _.flag;

  /**
   * ### Language Chains
   *
   * The following are provide as chainable getters to
   * improve the readability of your assertions. They
   * do not provide an testing capability unless they
   * have been overwritten by a plugin.
   *
   * **Chains**
   *
   * - to
   * - be
   * - been
   * - is
   * - that
   * - and
   * - have
   * - with
   * - at
   * - of
   * - same
   *
   * @name language chains
   * @api public
   */

  [ 'to', 'be', 'been'
  , 'is', 'and', 'have'
  , 'with', 'that', 'at'
  , 'of', 'same' ].forEach(function (chain) {
    Assertion.addProperty(chain, function () {
      return this;
    });
  });

  /**
   * ### .not
   *
   * Negates any of assertions following in the chain.
   *
   *     expect(foo).to.not.equal('bar');
   *     expect(goodFn).to.not.throw(Error);
   *     expect({ foo: 'baz' }).to.have.property('foo')
   *       .and.not.equal('bar');
   *
   * @name not
   * @api public
   */

  Assertion.addProperty('not', function () {
    flag(this, 'negate', true);
  });

  /**
   * ### .deep
   *
   * Sets the `deep` flag, later used by the `equal` and
   * `property` assertions.
   *
   *     expect(foo).to.deep.equal({ bar: 'baz' });
   *     expect({ foo: { bar: { baz: 'quux' } } })
   *       .to.have.deep.property('foo.bar.baz', 'quux');
   *
   * @name deep
   * @api public
   */

  Assertion.addProperty('deep', function () {
    flag(this, 'deep', true);
  });

  /**
   * ### .a(type)
   *
   * The `a` and `an` assertions are aliases that can be
   * used either as language chains or to assert a value's
   * type.
   *
   *     // typeof
   *     expect('test').to.be.a('string');
   *     expect({ foo: 'bar' }).to.be.an('object');
   *     expect(null).to.be.a('null');
   *     expect(undefined).to.be.an('undefined');
   *
   *     // language chain
   *     expect(foo).to.be.an.instanceof(Foo);
   *
   * @name a
   * @alias an
   * @param {String} type
   * @param {String} message _optional_
   * @api public
   */

  function an (type, msg) {
    if (msg) flag(this, 'message', msg);
    type = type.toLowerCase();
    var obj = flag(this, 'object')
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';

    this.assert(
        type === _.type(obj)
      , 'expected #{this} to be ' + article + type
      , 'expected #{this} not to be ' + article + type
    );
  }

  Assertion.addChainableMethod('an', an);
  Assertion.addChainableMethod('a', an);

  /**
   * ### .include(value)
   *
   * The `include` and `contain` assertions can be used as either property
   * based language chains or as methods to assert the inclusion of an object
   * in an array or a substring in a string. When used as language chains,
   * they toggle the `contain` flag for the `keys` assertion.
   *
   *     expect([1,2,3]).to.include(2);
   *     expect('foobar').to.contain('foo');
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
   *
   * @name include
   * @alias contain
   * @param {Object|String|Number} obj
   * @param {String} message _optional_
   * @api public
   */

  function includeChainingBehavior () {
    flag(this, 'contains', true);
  }

  function include (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
    this.assert(
        ~obj.indexOf(val)
      , 'expected #{this} to include ' + _.inspect(val)
      , 'expected #{this} to not include ' + _.inspect(val));
  }

  Assertion.addChainableMethod('include', include, includeChainingBehavior);
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);

  /**
   * ### .ok
   *
   * Asserts that the target is truthy.
   *
   *     expect('everthing').to.be.ok;
   *     expect(1).to.be.ok;
   *     expect(false).to.not.be.ok;
   *     expect(undefined).to.not.be.ok;
   *     expect(null).to.not.be.ok;
   *
   * @name ok
   * @api public
   */

  Assertion.addProperty('ok', function () {
    this.assert(
        flag(this, 'object')
      , 'expected #{this} to be truthy'
      , 'expected #{this} to be falsy');
  });

  /**
   * ### .true
   *
   * Asserts that the target is `true`.
   *
   *     expect(true).to.be.true;
   *     expect(1).to.not.be.true;
   *
   * @name true
   * @api public
   */

  Assertion.addProperty('true', function () {
    this.assert(
        true === flag(this, 'object')
      , 'expected #{this} to be true'
      , 'expected #{this} to be false'
      , this.negate ? false : true
    );
  });

  /**
   * ### .false
   *
   * Asserts that the target is `false`.
   *
   *     expect(false).to.be.false;
   *     expect(0).to.not.be.false;
   *
   * @name false
   * @api public
   */

  Assertion.addProperty('false', function () {
    this.assert(
        false === flag(this, 'object')
      , 'expected #{this} to be false'
      , 'expected #{this} to be true'
      , this.negate ? true : false
    );
  });

  /**
   * ### .null
   *
   * Asserts that the target is `null`.
   *
   *     expect(null).to.be.null;
   *     expect(undefined).not.to.be.null;
   *
   * @name null
   * @api public
   */

  Assertion.addProperty('null', function () {
    this.assert(
        null === flag(this, 'object')
      , 'expected #{this} to be null'
      , 'expected #{this} not to be null'
    );
  });

  /**
   * ### .undefined
   *
   * Asserts that the target is `undefined`.
   *
   *      expect(undefined).to.be.undefined;
   *      expect(null).to.not.be.undefined;
   *
   * @name undefined
   * @api public
   */

  Assertion.addProperty('undefined', function () {
    this.assert(
        undefined === flag(this, 'object')
      , 'expected #{this} to be undefined'
      , 'expected #{this} not to be undefined'
    );
  });

  /**
   * ### .exist
   *
   * Asserts that the target is neither `null` nor `undefined`.
   *
   *     var foo = 'hi'
   *       , bar = null
   *       , baz;
   *
   *     expect(foo).to.exist;
   *     expect(bar).to.not.exist;
   *     expect(baz).to.not.exist;
   *
   * @name exist
   * @api public
   */

  Assertion.addProperty('exist', function () {
    this.assert(
        null != flag(this, 'object')
      , 'expected #{this} to exist'
      , 'expected #{this} to not exist'
    );
  });


  /**
   * ### .empty
   *
   * Asserts that the target's length is `0`. For arrays, it checks
   * the `length` property. For objects, it gets the count of
   * enumerable keys.
   *
   *     expect([]).to.be.empty;
   *     expect('').to.be.empty;
   *     expect({}).to.be.empty;
   *
   * @name empty
   * @api public
   */

  Assertion.addProperty('empty', function () {
    var obj = flag(this, 'object')
      , expected = obj;

    if (Array.isArray(obj) || 'string' === typeof object) {
      expected = obj.length;
    } else if (typeof obj === 'object') {
      expected = Object.keys(obj).length;
    }

    this.assert(
        !expected
      , 'expected #{this} to be empty'
      , 'expected #{this} not to be empty'
    );
  });

  /**
   * ### .arguments
   *
   * Asserts that the target is an arguments object.
   *
   *     function test () {
   *       expect(arguments).to.be.arguments;
   *     }
   *
   * @name arguments
   * @alias Arguments
   * @api public
   */

  function checkArguments () {
    var obj = flag(this, 'object')
      , type = Object.prototype.toString.call(obj);
    this.assert(
        '[object Arguments]' === type
      , 'expected #{this} to be arguments but got ' + type
      , 'expected #{this} to not be arguments'
    );
  }

  Assertion.addProperty('arguments', checkArguments);
  Assertion.addProperty('Arguments', checkArguments);

  /**
   * ### .equal(value)
   *
   * Asserts that the target is strictly equal (`===`) to `value`.
   * Alternately, if the `deep` flag is set, asserts that
   * the target is deeply equal to `value`.
   *
   *     expect('hello').to.equal('hello');
   *     expect(42).to.equal(42);
   *     expect(1).to.not.equal(true);
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
   *
   * @name equal
   * @alias equals
   * @alias eq
   * @alias deep.equal
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEqual (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'deep')) {
      return this.eql(val);
    } else {
      this.assert(
          val === obj
        , 'expected #{this} to equal #{exp}'
        , 'expected #{this} to not equal #{exp}'
        , val
        , this._obj
        , true
      );
    }
  }

  Assertion.addMethod('equal', assertEqual);
  Assertion.addMethod('equals', assertEqual);
  Assertion.addMethod('eq', assertEqual);

  /**
   * ### .eql(value)
   *
   * Asserts that the target is deeply equal to `value`.
   *
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
   *
   * @name eql
   * @alias eqls
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEql(obj, msg) {
    if (msg) flag(this, 'message', msg);
    this.assert(
        _.eql(obj, flag(this, 'object'))
      , 'expected #{this} to deeply equal #{exp}'
      , 'expected #{this} to not deeply equal #{exp}'
      , obj
      , this._obj
      , true
    );
  }

  Assertion.addMethod('eql', assertEql);
  Assertion.addMethod('eqls', assertEql);

  /**
   * ### .above(value)
   *
   * Asserts that the target is greater than `value`.
   *
   *     expect(10).to.be.above(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *
   * @name above
   * @alias gt
   * @alias greaterThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertAbove (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len > n
        , 'expected #{this} to have a length above #{exp} but got #{act}'
        , 'expected #{this} to not have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj > n
        , 'expected #{this} to be above ' + n
        , 'expected #{this} to be at most ' + n
      );
    }
  }

  Assertion.addMethod('above', assertAbove);
  Assertion.addMethod('gt', assertAbove);
  Assertion.addMethod('greaterThan', assertAbove);

  /**
   * ### .least(value)
   *
   * Asserts that the target is greater than or equal to `value`.
   *
   *     expect(10).to.be.at.least(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.least(2);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
   *
   * @name least
   * @alias gte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertLeast (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= n
        , 'expected #{this} to have a length at least #{exp} but got #{act}'
        , 'expected #{this} to have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj >= n
        , 'expected #{this} to be at least ' + n
        , 'expected #{this} to be below ' + n
      );
    }
  }

  Assertion.addMethod('least', assertLeast);
  Assertion.addMethod('gte', assertLeast);

  /**
   * ### .below(value)
   *
   * Asserts that the target is less than `value`.
   *
   *     expect(5).to.be.below(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *
   * @name below
   * @alias lt
   * @alias lessThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertBelow (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len < n
        , 'expected #{this} to have a length below #{exp} but got #{act}'
        , 'expected #{this} to not have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj < n
        , 'expected #{this} to be below ' + n
        , 'expected #{this} to be at least ' + n
      );
    }
  }

  Assertion.addMethod('below', assertBelow);
  Assertion.addMethod('lt', assertBelow);
  Assertion.addMethod('lessThan', assertBelow);

  /**
   * ### .most(value)
   *
   * Asserts that the target is less than or equal to `value`.
   *
   *     expect(5).to.be.at.most(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.most(4);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
   *
   * @name most
   * @alias lte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertMost (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len <= n
        , 'expected #{this} to have a length at most #{exp} but got #{act}'
        , 'expected #{this} to have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj <= n
        , 'expected #{this} to be at most ' + n
        , 'expected #{this} to be above ' + n
      );
    }
  }

  Assertion.addMethod('most', assertMost);
  Assertion.addMethod('lte', assertMost);

  /**
   * ### .within(start, finish)
   *
   * Asserts that the target is within a range.
   *
   *     expect(7).to.be.within(5,10);
   *
   * Can also be used in conjunction with `length` to
   * assert a length range. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name within
   * @param {Number} start lowerbound inclusive
   * @param {Number} finish upperbound inclusive
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('within', function (start, finish, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , range = start + '..' + finish;
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= start && len <= finish
        , 'expected #{this} to have a length within ' + range
        , 'expected #{this} to not have a length within ' + range
      );
    } else {
      this.assert(
          obj >= start && obj <= finish
        , 'expected #{this} to be within ' + range
        , 'expected #{this} to not be within ' + range
      );
    }
  });

  /**
   * ### .instanceof(constructor)
   *
   * Asserts that the target is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , Chai = new Tea('chai');
   *
   *     expect(Chai).to.be.an.instanceof(Tea);
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
   *
   * @name instanceof
   * @param {Constructor} constructor
   * @param {String} message _optional_
   * @alias instanceOf
   * @api public
   */

  function assertInstanceOf (constructor, msg) {
    if (msg) flag(this, 'message', msg);
    var name = _.getName(constructor);
    this.assert(
        flag(this, 'object') instanceof constructor
      , 'expected #{this} to be an instance of ' + name
      , 'expected #{this} to not be an instance of ' + name
    );
  };

  Assertion.addMethod('instanceof', assertInstanceOf);
  Assertion.addMethod('instanceOf', assertInstanceOf);

  /**
   * ### .property(name, [value])
   *
   * Asserts that the target has a property `name`, optionally asserting that
   * the value of that property is strictly equal to  `value`.
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep
   * references into objects and arrays.
   *
   *     // simple referencing
   *     var obj = { foo: 'bar' };
   *     expect(obj).to.have.property('foo');
   *     expect(obj).to.have.property('foo', 'bar');
   *
   *     // deep referencing
   *     var deepObj = {
   *         green: { tea: 'matcha' }
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
   *     };

   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
   *
   * You can also use an array as the starting point of a `deep.property`
   * assertion, or traverse nested arrays.
   *
   *     var arr = [
   *         [ 'chai', 'matcha', 'konacha' ]
   *       , [ { tea: 'chai' }
   *         , { tea: 'matcha' }
   *         , { tea: 'konacha' } ]
   *     ];
   *
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
   *
   * Furthermore, `property` changes the subject of the assertion
   * to be the value of that property from the original object. This
   * permits for further chainable assertions on that property.
   *
   *     expect(obj).to.have.property('foo')
   *       .that.is.a('string');
   *     expect(deepObj).to.have.property('green')
   *       .that.is.an('object')
   *       .that.deep.equals({ tea: 'matcha' });
   *     expect(deepObj).to.have.property('teas')
   *       .that.is.an('array')
   *       .with.deep.property('[2]')
   *         .that.deep.equals({ tea: 'konacha' });
   *
   * @name property
   * @alias deep.property
   * @param {String} name
   * @param {Mixed} value (optional)
   * @param {String} message _optional_
   * @returns value of property for chaining
   * @api public
   */

  Assertion.addMethod('property', function (name, val, msg) {
    if (msg) flag(this, 'message', msg);

    var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '
      , negate = flag(this, 'negate')
      , obj = flag(this, 'object')
      , value = flag(this, 'deep')
        ? _.getPathValue(name, obj)
        : obj[name];

    if (negate && undefined !== val) {
      if (undefined === value) {
        msg = (msg != null) ? msg + ': ' : '';
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
      }
    } else {
      this.assert(
          undefined !== value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
    }

    if (undefined !== val) {
      this.assert(
          val === value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
        , val
        , value
      );
    }

    flag(this, 'object', value);
  });


  /**
   * ### .ownProperty(name)
   *
   * Asserts that the target has an own property `name`.
   *
   *     expect('test').to.have.ownProperty('length');
   *
   * @name ownProperty
   * @alias haveOwnProperty
   * @param {String} name
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnProperty (name, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        obj.hasOwnProperty(name)
      , 'expected #{this} to have own property ' + _.inspect(name)
      , 'expected #{this} to not have own property ' + _.inspect(name)
    );
  }

  Assertion.addMethod('ownProperty', assertOwnProperty);
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);

  /**
   * ### .length(value)
   *
   * Asserts that the target's `length` property has
   * the expected value.
   *
   *     expect([ 1, 2, 3]).to.have.length(3);
   *     expect('foobar').to.have.length(6);
   *
   * Can also be used as a chain precursor to a value
   * comparison for the length property.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name length
   * @alias lengthOf
   * @param {Number} length
   * @param {String} message _optional_
   * @api public
   */

  function assertLengthChain () {
    flag(this, 'doLength', true);
  }

  function assertLength (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).to.have.property('length');
    var len = obj.length;

    this.assert(
        len == n
      , 'expected #{this} to have a length of #{exp} but got #{act}'
      , 'expected #{this} to not have a length of #{act}'
      , n
      , len
    );
  }

  Assertion.addChainableMethod('length', assertLength, assertLengthChain);
  Assertion.addMethod('lengthOf', assertLength, assertLengthChain);

  /**
   * ### .match(regexp)
   *
   * Asserts that the target matches a regular expression.
   *
   *     expect('foobar').to.match(/^foo/);
   *
   * @name match
   * @param {RegExp} RegularExpression
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('match', function (re, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        re.exec(obj)
      , 'expected #{this} to match ' + re
      , 'expected #{this} not to match ' + re
    );
  });

  /**
   * ### .string(string)
   *
   * Asserts that the string target contains another string.
   *
   *     expect('foobar').to.have.string('bar');
   *
   * @name string
   * @param {String} string
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('string', function (str, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('string');

    this.assert(
        ~obj.indexOf(str)
      , 'expected #{this} to contain ' + _.inspect(str)
      , 'expected #{this} to not contain ' + _.inspect(str)
    );
  });


  /**
   * ### .keys(key1, [key2], [...])
   *
   * Asserts that the target has exactly the given keys, or
   * asserts the inclusion of some keys when using the
   * `include` or `contain` modifiers.
   *
   *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');
   *
   * @name keys
   * @alias key
   * @param {String...|Array} keys
   * @api public
   */

  function assertKeys (keys) {
    var obj = flag(this, 'object')
      , str
      , ok = true;

    keys = keys instanceof Array
      ? keys
      : Array.prototype.slice.call(arguments);

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(obj)
      , len = keys.length;

    // Inclusion
    ok = keys.every(function(key){
      return ~actual.indexOf(key);
    });

    // Strict
    if (!flag(this, 'negate') && !flag(this, 'contains')) {
      ok = ok && keys.length == actual.length;
    }

    // Key string
    if (len > 1) {
      keys = keys.map(function(key){
        return _.inspect(key);
      });
      var last = keys.pop();
      str = keys.join(', ') + ', and ' + last;
    } else {
      str = _.inspect(keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

    // Assertion
    this.assert(
        ok
      , 'expected #{this} to ' + str
      , 'expected #{this} to not ' + str
    );
  }

  Assertion.addMethod('keys', assertKeys);
  Assertion.addMethod('key', assertKeys);

  /**
   * ### .throw(constructor)
   *
   * Asserts that the function target will throw a specific error, or specific type of error
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
   * for the error's message.
   *
   *     var err = new ReferenceError('This is a bad function.');
   *     var fn = function () { throw err; }
   *     expect(fn).to.throw(ReferenceError);
   *     expect(fn).to.throw(Error);
   *     expect(fn).to.throw(/bad function/);
   *     expect(fn).to.not.throw('good function');
   *     expect(fn).to.throw(ReferenceError, /bad function/);
   *     expect(fn).to.throw(err);
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));
   *
   * Please note that when a throw expectation is negated, it will check each
   * parameter independently, starting with error constructor type. The appropriate way
   * to check for the existence of a type of error but for a message that does not match
   * is to use `and`.
   *
   *     expect(fn).to.throw(ReferenceError)
   *        .and.not.throw(/good function/);
   *
   * @name throw
   * @alias throws
   * @alias Throw
   * @param {ErrorConstructor} constructor
   * @param {String|RegExp} expected error message
   * @param {String} message _optional_
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  function assertThrows (constructor, errMsg, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('function');

    var thrown = false
      , desiredError = null
      , name = null
      , thrownError = null;

    if (arguments.length === 0) {
      errMsg = null;
      constructor = null;
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
      errMsg = constructor;
      constructor = null;
    } else if (constructor && constructor instanceof Error) {
      desiredError = constructor;
      constructor = null;
      errMsg = null;
    } else if (typeof constructor === 'function') {
      name = (new constructor()).name;
    } else {
      constructor = null;
    }

    try {
      obj();
    } catch (err) {
      // first, check desired error
      if (desiredError) {
        this.assert(
            err === desiredError
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp}'
          , desiredError
          , err
        );

        return this;
      }
      // next, check constructor
      if (constructor) {
        this.assert(
            err instanceof constructor
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'
          , name
          , err
        );

        if (!errMsg) return this;
      }
      // next, check message
      var message = 'object' === _.type(err) && "message" in err
        ? err.message
        : '' + err;

      if ((message != null) && errMsg && errMsg instanceof RegExp) {
        this.assert(
            errMsg.exec(message)
          , 'expected #{this} to throw error matching #{exp} but got #{act}'
          , 'expected #{this} to throw error not matching #{exp}'
          , errMsg
          , message
        );

        return this;
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
        this.assert(
            ~message.indexOf(errMsg)
          , 'expected #{this} to throw error including #{exp} but got #{act}'
          , 'expected #{this} to throw error not including #{act}'
          , errMsg
          , message
        );

        return this;
      } else {
        thrown = true;
        thrownError = err;
      }
    }

    var actuallyGot = ''
      , expectedThrown = name !== null
        ? name
        : desiredError
          ? '#{exp}' //_.inspect(desiredError)
          : 'an error';

    if (thrown) {
      actuallyGot = ' but #{act} was thrown'
    }

    this.assert(
        thrown === true
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
      , desiredError
      , thrownError
    );
  };

  Assertion.addMethod('throw', assertThrows);
  Assertion.addMethod('throws', assertThrows);
  Assertion.addMethod('Throw', assertThrows);

  /**
   * ### .respondTo(method)
   *
   * Asserts that the object or class target will respond to a method.
   *
   *     Klass.prototype.bar = function(){};
   *     expect(Klass).to.respondTo('bar');
   *     expect(obj).to.respondTo('bar');
   *
   * To check if a constructor will respond to a static function,
   * set the `itself` flag.
   *
   *    Klass.baz = function(){};
   *    expect(Klass).itself.to.respondTo('baz');
   *
   * @name respondTo
   * @param {String} method
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('respondTo', function (method, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , itself = flag(this, 'itself')
      , context = ('function' === _.type(obj) && !itself)
        ? obj.prototype[method]
        : obj[method];

    this.assert(
        'function' === typeof context
      , 'expected #{this} to respond to ' + _.inspect(method)
      , 'expected #{this} to not respond to ' + _.inspect(method)
    );
  });

  /**
   * ### .itself
   *
   * Sets the `itself` flag, later used by the `respondTo` assertion.
   *
   *    function Foo() {}
   *    Foo.bar = function() {}
   *    Foo.prototype.baz = function() {}
   *
   *    expect(Foo).itself.to.respondTo('bar');
   *    expect(Foo).itself.not.to.respondTo('baz');
   *
   * @name itself
   * @api public
   */

  Assertion.addProperty('itself', function () {
    flag(this, 'itself', true);
  });

  /**
   * ### .satisfy(method)
   *
   * Asserts that the target passes a given truth test.
   *
   *     expect(1).to.satisfy(function(num) { return num > 0; });
   *
   * @name satisfy
   * @param {Function} matcher
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('satisfy', function (matcher, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        matcher(obj)
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
      , this.negate ? false : true
      , matcher(obj)
    );
  });

  /**
   * ### .closeTo(expected, delta)
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     expect(1.5).to.be.closeTo(1, 0.5);
   *
   * @name closeTo
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('closeTo', function (expected, delta, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        Math.abs(obj - expected) <= delta
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
    );
  });

  function isSubsetOf(subset, superset) {
    return subset.every(function(elem) {
      return superset.indexOf(elem) !== -1;
    })
  }

  /**
   * ### .members
   *
   * Asserts that the target is a superset of `set`,
   * or that the target and `set` have the same members.
   *
   *    expect([1, 2, 3]).to.include.members([3, 2]);
   *    expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
   *
   *    expect([4, 2]).to.have.members([2, 4]);
   *    expect([5, 2]).to.not.have.members([5, 2, 1]);
   *
   * @name members
   * @param {Array} set
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('members', function (subset, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj).to.be.an('array');
    new Assertion(subset).to.be.an('array');

    if (flag(this, 'contains')) {
      return this.assert(
          isSubsetOf(subset, obj)
        , 'expected #{this} to be a superset of #{act}'
        , 'expected #{this} to not be a superset of #{act}'
        , obj
        , subset
      );
    }

    this.assert(
        isSubsetOf(obj, subset) && isSubsetOf(subset, obj)
        , 'expected #{this} to have the same members as #{act}'
        , 'expected #{this} to not have the same members as #{act}'
        , obj
        , subset
    );
  });
};

},{}],12:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main export
 */

module.exports = AssertionError;

/**
 * # AssertionError (constructor)
 *
 * Create a new assertion error based on the Javascript
 * `Error` prototype.
 *
 * **Options**
 * - message
 * - actual
 * - expected
 * - operator
 * - startStackFunction
 *
 * @param {Object} options
 * @api public
 */

function AssertionError (options) {
  options = options || {};
  this.message = options.message;
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.showDiff = options.showDiff;

  if (options.stackStartFunction && Error.captureStackTrace) {
    var stackStartFunction = options.stackStartFunction;
    Error.captureStackTrace(this, stackStartFunction);
  }
}

/*!
 * Inherit from Error
 */

AssertionError.prototype = Object.create(Error.prototype);
AssertionError.prototype.name = 'AssertionError';
AssertionError.prototype.constructor = AssertionError;

/**
 * # toString()
 *
 * Override default to string method
 */

AssertionError.prototype.toString = function() {
  return this.message;
};

},{}],13:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


module.exports = function (chai, util) {

  /*!
   * Chai dependencies.
   */

  var Assertion = chai.Assertion
    , flag = util.flag;

  /*!
   * Module export.
   */

  /**
   * ### assert(expression, message)
   *
   * Write your own test expressions.
   *
   *     assert('foo' !== 'bar', 'foo is not bar');
   *     assert(Array.isArray([]), 'empty arrays are arrays');
   *
   * @param {Mixed} expression to test for truthiness
   * @param {String} message to display on error
   * @name assert
   * @api public
   */

  var assert = chai.assert = function (express, errmsg) {
    var test = new Assertion(null);
    test.assert(
        express
      , errmsg
      , '[ negation message unavailable ]'
    );
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure. Node.js `assert` module-compatible.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  assert.fail = function (actual, expected, message, operator) {
    throw new chai.AssertionError({
        actual: actual
      , expected: expected
      , message: message
      , operator: operator
      , stackStartFunction: assert.fail
    });
  };

  /**
   * ### .ok(object, [message])
   *
   * Asserts that `object` is truthy.
   *
   *     assert.ok('everything', 'everything is ok');
   *     assert.ok(false, 'this will fail');
   *
   * @name ok
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.ok = function (val, msg) {
    new Assertion(val, msg).is.ok;
  };

  /**
   * ### .equal(actual, expected, [message])
   *
   * Asserts non-strict equality (`==`) of `actual` and `expected`.
   *
   *     assert.equal(3, '3', '== coerces values to strings');
   *
   * @name equal
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.equal = function (act, exp, msg) {
    var test = new Assertion(act, msg);

    test.assert(
        exp == flag(test, 'object')
      , 'expected #{this} to equal #{exp}'
      , 'expected #{this} to not equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .notEqual(actual, expected, [message])
   *
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
   *
   *     assert.notEqual(3, 4, 'these numbers are not equal');
   *
   * @name notEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notEqual = function (act, exp, msg) {
    var test = new Assertion(act, msg);

    test.assert(
        exp != flag(test, 'object')
      , 'expected #{this} to not equal #{exp}'
      , 'expected #{this} to equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .strictEqual(actual, expected, [message])
   *
   * Asserts strict equality (`===`) of `actual` and `expected`.
   *
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');
   *
   * @name strictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.strictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.equal(exp);
  };

  /**
   * ### .notStrictEqual(actual, expected, [message])
   *
   * Asserts strict inequality (`!==`) of `actual` and `expected`.
   *
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
   *
   * @name notStrictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notStrictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.equal(exp);
  };

  /**
   * ### .deepEqual(actual, expected, [message])
   *
   * Asserts that `actual` is deeply equal to `expected`.
   *
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
   *
   * @name deepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.deepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.eql(exp);
  };

  /**
   * ### .notDeepEqual(actual, expected, [message])
   *
   * Assert that `actual` is not deeply equal to `expected`.
   *
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
   *
   * @name notDeepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notDeepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.eql(exp);
  };

  /**
   * ### .isTrue(value, [message])
   *
   * Asserts that `value` is true.
   *
   *     var teaServed = true;
   *     assert.isTrue(teaServed, 'the tea has been served');
   *
   * @name isTrue
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isTrue = function (val, msg) {
    new Assertion(val, msg).is['true'];
  };

  /**
   * ### .isFalse(value, [message])
   *
   * Asserts that `value` is false.
   *
   *     var teaServed = false;
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');
   *
   * @name isFalse
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFalse = function (val, msg) {
    new Assertion(val, msg).is['false'];
  };

  /**
   * ### .isNull(value, [message])
   *
   * Asserts that `value` is null.
   *
   *     assert.isNull(err, 'there was no error');
   *
   * @name isNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNull = function (val, msg) {
    new Assertion(val, msg).to.equal(null);
  };

  /**
   * ### .isNotNull(value, [message])
   *
   * Asserts that `value` is not null.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotNull(tea, 'great, time for tea!');
   *
   * @name isNotNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNull = function (val, msg) {
    new Assertion(val, msg).to.not.equal(null);
  };

  /**
   * ### .isUndefined(value, [message])
   *
   * Asserts that `value` is `undefined`.
   *
   *     var tea;
   *     assert.isUndefined(tea, 'no tea defined');
   *
   * @name isUndefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isUndefined = function (val, msg) {
    new Assertion(val, msg).to.equal(undefined);
  };

  /**
   * ### .isDefined(value, [message])
   *
   * Asserts that `value` is not `undefined`.
   *
   *     var tea = 'cup of chai';
   *     assert.isDefined(tea, 'tea has been defined');
   *
   * @name isDefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isDefined = function (val, msg) {
    new Assertion(val, msg).to.not.equal(undefined);
  };

  /**
   * ### .isFunction(value, [message])
   *
   * Asserts that `value` is a function.
   *
   *     function serveTea() { return 'cup of tea'; };
   *     assert.isFunction(serveTea, 'great, we can have tea now');
   *
   * @name isFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFunction = function (val, msg) {
    new Assertion(val, msg).to.be.a('function');
  };

  /**
   * ### .isNotFunction(value, [message])
   *
   * Asserts that `value` is _not_ a function.
   *
   *     var serveTea = [ 'heat', 'pour', 'sip' ];
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
   *
   * @name isNotFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotFunction = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('function');
  };

  /**
   * ### .isObject(value, [message])
   *
   * Asserts that `value` is an object (as revealed by
   * `Object.prototype.toString`).
   *
   *     var selection = { name: 'Chai', serve: 'with spices' };
   *     assert.isObject(selection, 'tea selection is an object');
   *
   * @name isObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isObject = function (val, msg) {
    new Assertion(val, msg).to.be.a('object');
  };

  /**
   * ### .isNotObject(value, [message])
   *
   * Asserts that `value` is _not_ an object.
   *
   *     var selection = 'chai'
   *     assert.isObject(selection, 'tea selection is not an object');
   *     assert.isObject(null, 'null is not an object');
   *
   * @name isNotObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotObject = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('object');
  };

  /**
   * ### .isArray(value, [message])
   *
   * Asserts that `value` is an array.
   *
   *     var menu = [ 'green', 'chai', 'oolong' ];
   *     assert.isArray(menu, 'what kind of tea do we want?');
   *
   * @name isArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isArray = function (val, msg) {
    new Assertion(val, msg).to.be.an('array');
  };

  /**
   * ### .isNotArray(value, [message])
   *
   * Asserts that `value` is _not_ an array.
   *
   *     var menu = 'green|chai|oolong';
   *     assert.isNotArray(menu, 'what kind of tea do we want?');
   *
   * @name isNotArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotArray = function (val, msg) {
    new Assertion(val, msg).to.not.be.an('array');
  };

  /**
   * ### .isString(value, [message])
   *
   * Asserts that `value` is a string.
   *
   *     var teaOrder = 'chai';
   *     assert.isString(teaOrder, 'order placed');
   *
   * @name isString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isString = function (val, msg) {
    new Assertion(val, msg).to.be.a('string');
  };

  /**
   * ### .isNotString(value, [message])
   *
   * Asserts that `value` is _not_ a string.
   *
   *     var teaOrder = 4;
   *     assert.isNotString(teaOrder, 'order placed');
   *
   * @name isNotString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotString = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('string');
  };

  /**
   * ### .isNumber(value, [message])
   *
   * Asserts that `value` is a number.
   *
   *     var cups = 2;
   *     assert.isNumber(cups, 'how many cups');
   *
   * @name isNumber
   * @param {Number} value
   * @param {String} message
   * @api public
   */

  assert.isNumber = function (val, msg) {
    new Assertion(val, msg).to.be.a('number');
  };

  /**
   * ### .isNotNumber(value, [message])
   *
   * Asserts that `value` is _not_ a number.
   *
   *     var cups = '2 cups please';
   *     assert.isNotNumber(cups, 'how many cups');
   *
   * @name isNotNumber
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNumber = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('number');
  };

  /**
   * ### .isBoolean(value, [message])
   *
   * Asserts that `value` is a boolean.
   *
   *     var teaReady = true
   *       , teaServed = false;
   *
   *     assert.isBoolean(teaReady, 'is the tea ready');
   *     assert.isBoolean(teaServed, 'has tea been served');
   *
   * @name isBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isBoolean = function (val, msg) {
    new Assertion(val, msg).to.be.a('boolean');
  };

  /**
   * ### .isNotBoolean(value, [message])
   *
   * Asserts that `value` is _not_ a boolean.
   *
   *     var teaReady = 'yep'
   *       , teaServed = 'nope';
   *
   *     assert.isNotBoolean(teaReady, 'is the tea ready');
   *     assert.isNotBoolean(teaServed, 'has tea been served');
   *
   * @name isNotBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotBoolean = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('boolean');
  };

  /**
   * ### .typeOf(value, name, [message])
   *
   * Asserts that `value`'s type is `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
   *     assert.typeOf('tea', 'string', 'we have a string');
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
   *     assert.typeOf(null, 'null', 'we have a null');
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
   *
   * @name typeOf
   * @param {Mixed} value
   * @param {String} name
   * @param {String} message
   * @api public
   */

  assert.typeOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.a(type);
  };

  /**
   * ### .notTypeOf(value, name, [message])
   *
   * Asserts that `value`'s type is _not_ `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
   *
   * @name notTypeOf
   * @param {Mixed} value
   * @param {String} typeof name
   * @param {String} message
   * @api public
   */

  assert.notTypeOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.a(type);
  };

  /**
   * ### .instanceOf(object, constructor, [message])
   *
   * Asserts that `value` is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new Tea('chai');
   *
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
   *
   * @name instanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.instanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.instanceOf(type);
  };

  /**
   * ### .notInstanceOf(object, constructor, [message])
   *
   * Asserts `value` is not an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new String('chai');
   *
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
   *
   * @name notInstanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.notInstanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.instanceOf(type);
  };

  /**
   * ### .include(haystack, needle, [message])
   *
   * Asserts that `haystack` includes `needle`. Works
   * for strings and arrays.
   *
   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
   *
   * @name include
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.include = function (exp, inc, msg) {
    var obj = new Assertion(exp, msg);

    if (Array.isArray(exp)) {
      obj.to.include(inc);
    } else if ('string' === typeof exp) {
      obj.to.contain.string(inc);
    } else {
      throw new chai.AssertionError({
          message: 'expected an array or string'
        , stackStartFunction: assert.include
      });
    }
  };

  /**
   * ### .notInclude(haystack, needle, [message])
   *
   * Asserts that `haystack` does not include `needle`. Works
   * for strings and arrays.
   *i
   *     assert.notInclude('foobar', 'baz', 'string not include substring');
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
   *
   * @name notInclude
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.notInclude = function (exp, inc, msg) {
    var obj = new Assertion(exp, msg);

    if (Array.isArray(exp)) {
      obj.to.not.include(inc);
    } else if ('string' === typeof exp) {
      obj.to.not.contain.string(inc);
    } else {
      throw new chai.AssertionError({
          message: 'expected an array or string'
        , stackStartFunction: assert.include
      });
    }
  };

  /**
   * ### .match(value, regexp, [message])
   *
   * Asserts that `value` matches the regular expression `regexp`.
   *
   *     assert.match('foobar', /^foo/, 'regexp matches');
   *
   * @name match
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.match = function (exp, re, msg) {
    new Assertion(exp, msg).to.match(re);
  };

  /**
   * ### .notMatch(value, regexp, [message])
   *
   * Asserts that `value` does not match the regular expression `regexp`.
   *
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
   *
   * @name notMatch
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.notMatch = function (exp, re, msg) {
    new Assertion(exp, msg).to.not.match(re);
  };

  /**
   * ### .property(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`.
   *
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');
   *
   * @name property
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.property = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.property(prop);
  };

  /**
   * ### .notProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`.
   *
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
   *
   * @name notProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.property(prop);
  };

  /**
   * ### .deepProperty(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
   *
   * @name deepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.deepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop);
  };

  /**
   * ### .notDeepProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`, which
   * can be a string using dot- and bracket-notation for deep reference.
   *
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
   *
   * @name notDeepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notDeepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop);
  };

  /**
   * ### .propertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`.
   *
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
   *
   * @name propertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.property(prop, val);
  };

  /**
   * ### .propertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`.
   *
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
   *
   * @name propertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.property(prop, val);
  };

  /**
   * ### .deepPropertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`. `property` can use dot- and bracket-notation for deep
   * reference.
   *
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
   *
   * @name deepPropertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop, val);
  };

  /**
   * ### .deepPropertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`. `property` can use dot- and
   * bracket-notation for deep reference.
   *
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
   *
   * @name deepPropertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);
  };

  /**
   * ### .lengthOf(object, length, [message])
   *
   * Asserts that `object` has a `length` property with the expected value.
   *
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
   *     assert.lengthOf('foobar', 5, 'string has length of 6');
   *
   * @name lengthOf
   * @param {Mixed} object
   * @param {Number} length
   * @param {String} message
   * @api public
   */

  assert.lengthOf = function (exp, len, msg) {
    new Assertion(exp, msg).to.have.length(len);
  };

  /**
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
   *
   * Asserts that `function` will throw an error that is an instance of
   * `constructor`, or alternately that it will throw an error with message
   * matching `regexp`.
   *
   *     assert.throw(fn, 'function throws a reference error');
   *     assert.throw(fn, /function throws a reference error/);
   *     assert.throw(fn, ReferenceError);
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);
   *
   * @name throws
   * @alias throw
   * @alias Throw
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.Throw = function (fn, errt, errs, msg) {
    if ('string' === typeof errt || errt instanceof RegExp) {
      errs = errt;
      errt = null;
    }

    new Assertion(fn, msg).to.Throw(errt, errs);
  };

  /**
   * ### .doesNotThrow(function, [constructor/regexp], [message])
   *
   * Asserts that `function` will _not_ throw an error that is an instance of
   * `constructor`, or alternately that it will not throw an error with message
   * matching `regexp`.
   *
   *     assert.doesNotThrow(fn, Error, 'function does not throw');
   *
   * @name doesNotThrow
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.doesNotThrow = function (fn, type, msg) {
    if ('string' === typeof type) {
      msg = type;
      type = null;
    }

    new Assertion(fn, msg).to.not.Throw(type);
  };

  /**
   * ### .operator(val1, operator, val2, [message])
   *
   * Compares two values using `operator`.
   *
   *     assert.operator(1, '<', 2, 'everything is ok');
   *     assert.operator(1, '>', 2, 'this will fail');
   *
   * @name operator
   * @param {Mixed} val1
   * @param {String} operator
   * @param {Mixed} val2
   * @param {String} message
   * @api public
   */

  assert.operator = function (val, operator, val2, msg) {
    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {
      throw new Error('Invalid operator "' + operator + '"');
    }
    var test = new Assertion(eval(val + operator + val2), msg);
    test.assert(
        true === flag(test, 'object')
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
  };

  /**
   * ### .closeTo(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
   *
   * @name closeTo
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @api public
   */

  assert.closeTo = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.closeTo(exp, delta);
  };

  /**
   * ### .sameMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members.
   * Order is not taken into account.
   *
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
   *
   * @name sameMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.sameMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.members(set2);
  }

  /**
   * ### .includeMembers(superset, subset, [message])
   *
   * Asserts that `subset` is included in `superset`.
   * Order is not taken into account.
   *
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
   *
   * @name includeMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.includeMembers = function (superset, subset, msg) {
    new Assertion(superset, msg).to.include.members(subset);
  }

  /*!
   * Undocumented / untested
   */

  assert.ifError = function (val, msg) {
    new Assertion(val, msg).to.not.be.ok;
  };

  /*!
   * Aliases.
   */

  (function alias(name, as){
    assert[as] = assert[name];
    return alias;
  })
  ('Throw', 'throw')
  ('Throw', 'throws');
};

},{}],14:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  chai.expect = function (val, message) {
    return new chai.Assertion(val, message);
  };
};


},{}],15:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  var Assertion = chai.Assertion;

  function loadShould () {
    // modify Object.prototype to have `should`
    Object.defineProperty(Object.prototype, 'should',
      {
        set: function (value) {
          // See https://github.com/chaijs/chai/issues/86: this makes
          // `whatever.should = someValue` actually set `someValue`, which is
          // especially useful for `global.should = require('chai').should()`.
          //
          // Note that we have to use [[DefineProperty]] instead of [[Put]]
          // since otherwise we would trigger this very setter!
          Object.defineProperty(this, 'should', {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        }
      , get: function(){
          if (this instanceof String || this instanceof Number) {
            return new Assertion(this.constructor(this));
          } else if (this instanceof Boolean) {
            return new Assertion(this == true);
          }
          return new Assertion(this);
        }
      , configurable: true
    });

    var should = {};

    should.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.equal(val2);
    };

    should.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.Throw(errt, errs);
    };

    should.exist = function (val, msg) {
      new Assertion(val, msg).to.exist;
    }

    // negation
    should.not = {}

    should.not.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.not.equal(val2);
    };

    should.not.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.not.Throw(errt, errs);
    };

    should.not.exist = function (val, msg) {
      new Assertion(val, msg).to.not.exist;
    }

    should['throw'] = should['Throw'];
    should.not['throw'] = should.not['Throw'];

    return should;
  };

  chai.should = loadShould;
  chai.Should = loadShould;
};

},{}],16:[function(require,module,exports){
/*!
 * Chai - addChainingMethod utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var transferFlags = require('./transferFlags');

/*!
 * Module variables
 */

// Check whether `__proto__` is supported
var hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
var excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
var call  = Function.prototype.call,
    apply = Function.prototype.apply;

/**
 * ### addChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Adds a method to an object, such that the method can also be chained.
 *
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
 *
 * The result can then be used as both a method assertion, executing both `method` and
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
 *
 *     expect(fooStr).to.be.foo('bar');
 *     expect(fooStr).to.be.foo.equal('foo');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for `name`, when called
 * @param {Function} chainingBehavior function to be called every time the property is accessed
 * @name addChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== 'function')
    chainingBehavior = function () { };

  Object.defineProperty(ctx, name,
    { get: function () {
        chainingBehavior.call(this);

        var assert = function () {
          var result = method.apply(this, arguments);
          return result === undefined ? this : result;
        };

        // Use `__proto__` if available
        if (hasProtoSupport) {
          // Inherit all properties from the object by replacing the `Function` prototype
          var prototype = assert.__proto__ = Object.create(this);
          // Restore the `call` and `apply` methods from `Function`
          prototype.call = call;
          prototype.apply = apply;
        }
        // Otherwise, redefine all properties (slow!)
        else {
          var asserterNames = Object.getOwnPropertyNames(ctx);
          asserterNames.forEach(function (asserterName) {
            if (!excludeNames.test(asserterName)) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
              Object.defineProperty(assert, asserterName, pd);
            }
          });
        }

        transferFlags(this, assert);
        return assert;
      }
    , configurable: true
  });
};

},{"./transferFlags":33}],17:[function(require,module,exports){
/*!
 * Chai - addMethod utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .addMethod (ctx, name, method)
 *
 * Adds a method to the prototype of an object.
 *
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(fooStr).to.be.foo('bar');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for name
 * @name addMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  ctx[name] = function () {
    var result = method.apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{}],18:[function(require,module,exports){
/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### addProperty (ctx, name, getter)
 *
 * Adds a property to the prototype of an object.
 *
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.instanceof(Foo);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.foo;
 *
 * @param {Object} ctx object to which the property is added
 * @param {String} name of property to add
 * @param {Function} getter function to be used for name
 * @name addProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter.call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],19:[function(require,module,exports){
// This is (almost) directly from Node.js assert
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/assert.js

module.exports = _deepEqual;

var getEnumerableProperties = require('./getEnumerableProperties');

// for the browser
var Buffer;
try {
  Buffer = require('buffer').Buffer;
} catch (ex) {
  Buffer = {
    isBuffer: function () { return false; }
  };
}

function _deepEqual(actual, expected, memos) {

  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual === expected;

  } else if (actual instanceof RegExp && expected instanceof RegExp){
    return actual.toString() === expected.toString();

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, memos);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, memos) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;

  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;

  // check if we have already compared a and b
  var i;
  if (memos) {
    for(i = 0; i < memos.length; i++) {
      if ((memos[i][0] === a && memos[i][1] === b) ||
          (memos[i][0] === b && memos[i][1] === a))
        return true;
    }
  } else {
    memos = [];
  }

  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, memos);
  }
  try {
    var ka = getEnumerableProperties(a),
        kb = getEnumerableProperties(b),
        key;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }

  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;

  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }

  // remember objects we have compared to guard against circular references
  memos.push([ a, b ]);

  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], memos)) return false;
  }

  return true;
}

},{"./getEnumerableProperties":22,"buffer":5}],20:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### flag(object ,key, [value])
 *
 * Get or set a flag value on an object. If a
 * value is provided it will be set, else it will
 * return the currently set value or `undefined` if
 * the value is not set.
 *
 *     utils.flag(this, 'foo', 'bar'); // setter
 *     utils.flag(this, 'foo'); // getter, returns `bar`
 *
 * @param {Object} object (constructed Assertion
 * @param {String} key
 * @param {Mixed} value (optional)
 * @name flag
 * @api private
 */

module.exports = function (obj, key, value) {
  var flags = obj.__flags || (obj.__flags = Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
};

},{}],21:[function(require,module,exports){
/*!
 * Chai - getActual utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getActual(object, [actual])
 *
 * Returns the `actual` value for an Assertion
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var actual = args[4];
  return 'undefined' !== typeof actual ? actual : obj._obj;
};

},{}],22:[function(require,module,exports){
/*!
 * Chai - getEnumerableProperties utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getEnumerableProperties(object)
 *
 * This allows the retrieval of enumerable property names of an object,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getEnumerableProperties
 * @api public
 */

module.exports = function getEnumerableProperties(object) {
  var result = [];
  for (var name in object) {
    result.push(name);
  }
  return result;
};

},{}],23:[function(require,module,exports){
/*!
 * Chai - message composition utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag')
  , getActual = require('./getActual')
  , inspect = require('./inspect')
  , objDisplay = require('./objDisplay');

/**
 * ### .getMessage(object, message, negateMessage)
 *
 * Construct the error message based on flags
 * and template tags. Template tags will return
 * a stringified inspection of the object referenced.
 *
 * Messsage template tags:
 * - `#{this}` current asserted object
 * - `#{act}` actual value
 * - `#{exp}` expected value
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @name getMessage
 * @api public
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message');

  msg = msg || '';
  msg = msg
    .replace(/#{this}/g, objDisplay(val))
    .replace(/#{act}/g, objDisplay(actual))
    .replace(/#{exp}/g, objDisplay(expected));

  return flagMsg ? flagMsg + ': ' + msg : msg;
};

},{"./flag":20,"./getActual":21,"./inspect":28,"./objDisplay":29}],24:[function(require,module,exports){
/*!
 * Chai - getName utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getName(func)
 *
 * Gets the name of a function, in a cross-browser way.
 *
 * @param {Function} a function (usually a constructor)
 */

module.exports = function (func) {
  if (func.name) return func.name;

  var match = /^\s?function ([^(]*)\(/.exec(func);
  return match && match[1] ? match[1] : "";
};

},{}],25:[function(require,module,exports){
/*!
 * Chai - getPathValue utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * @see https://github.com/logicalparadox/filtr
 * MIT Licensed
 */

/**
 * ### .getPathValue(path, object)
 *
 * This allows the retrieval of values in an
 * object given a string path.
 *
 *     var obj = {
 *         prop1: {
 *             arr: ['a', 'b', 'c']
 *           , str: 'Hello'
 *         }
 *       , prop2: {
 *             arr: [ { nested: 'Universe' } ]
 *           , str: 'Hello again!'
 *         }
 *     }
 *
 * The following would be the results.
 *
 *     getPathValue('prop1.str', obj); // Hello
 *     getPathValue('prop1.att[2]', obj); // b
 *     getPathValue('prop2.arr[0].nested', obj); // Universe
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} value or `undefined`
 * @name getPathValue
 * @api public
 */

var getPathValue = module.exports = function (path, obj) {
  var parsed = parsePath(path);
  return _getPathValue(parsed, obj);
};

/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `_getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 *
 * @param {String} path
 * @returns {Object} parsed
 * @api private
 */

function parsePath (path) {
  var str = path.replace(/\[/g, '.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map(function (value) {
    var re = /\[(\d+)\]$/
      , mArr = re.exec(value)
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value };
  });
};

/*!
 * ## _getPathValue(parsed, obj)
 *
 * Helper companion function for `.parsePath` that returns
 * the value located at the parsed address.
 *
 *      var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @returns {Object|Undefined} value
 * @api private
 */

function _getPathValue (parsed, obj) {
  var tmp = obj
    , res;
  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ('undefined' !== typeof part.p)
        tmp = tmp[part.p];
      else if ('undefined' !== typeof part.i)
        tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }
  return res;
};

},{}],26:[function(require,module,exports){
/*!
 * Chai - getProperties utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getProperties(object)
 *
 * This allows the retrieval of property names of an object, enumerable or not,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getProperties
 * @api public
 */

module.exports = function getProperties(object) {
  var result = Object.getOwnPropertyNames(subject);

  function addProperty(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }

  var proto = Object.getPrototypeOf(subject);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty);
    proto = Object.getPrototypeOf(proto);
  }

  return result;
};

},{}],27:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main exports
 */

var exports = module.exports = {};

/*!
 * test utility
 */

exports.test = require('./test');

/*!
 * type utility
 */

exports.type = require('./type');

/*!
 * message utility
 */

exports.getMessage = require('./getMessage');

/*!
 * actual utility
 */

exports.getActual = require('./getActual');

/*!
 * Inspect util
 */

exports.inspect = require('./inspect');

/*!
 * Object Display util
 */

exports.objDisplay = require('./objDisplay');

/*!
 * Flag utility
 */

exports.flag = require('./flag');

/*!
 * Flag transferring utility
 */

exports.transferFlags = require('./transferFlags');

/*!
 * Deep equal utility
 */

exports.eql = require('./eql');

/*!
 * Deep path value
 */

exports.getPathValue = require('./getPathValue');

/*!
 * Function name
 */

exports.getName = require('./getName');

/*!
 * add Property
 */

exports.addProperty = require('./addProperty');

/*!
 * add Method
 */

exports.addMethod = require('./addMethod');

/*!
 * overwrite Property
 */

exports.overwriteProperty = require('./overwriteProperty');

/*!
 * overwrite Method
 */

exports.overwriteMethod = require('./overwriteMethod');

/*!
 * Add a chainable method
 */

exports.addChainableMethod = require('./addChainableMethod');


},{"./addChainableMethod":16,"./addMethod":17,"./addProperty":18,"./eql":19,"./flag":20,"./getActual":21,"./getMessage":23,"./getName":24,"./getPathValue":25,"./inspect":28,"./objDisplay":29,"./overwriteMethod":30,"./overwriteProperty":31,"./test":32,"./transferFlags":33,"./type":34}],28:[function(require,module,exports){
// This is (almost) directly from Node.js utils
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

var getName = require('./getName');
var getProperties = require('./getProperties');
var getEnumerableProperties = require('./getEnumerableProperties');

module.exports = inspect;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 */
function inspect(obj, showHidden, depth, colors) {
  var ctx = {
    showHidden: showHidden,
    seen: [],
    stylize: function (str) { return str; }
  };
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
}

// https://gist.github.com/1044128/
var getOuterHTML = function(element) {
  if ('outerHTML' in element) return element.outerHTML;
  var ns = "http://www.w3.org/1999/xhtml";
  var container = document.createElementNS(ns, '_');
  var elemProto = (window.HTMLElement || window.Element).prototype;
  var xmlSerializer = new XMLSerializer();
  var html;
  if (document.xmlVersion) {
    return xmlSerializer.serializeToString(element);
  } else {
    container.appendChild(element.cloneNode(false));
    html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
    container.innerHTML = '';
    return html;
  }
};

// Returns true if object is a DOM element.
var isDOMElement = function (object) {
  if (typeof HTMLElement === 'object') {
    return object instanceof HTMLElement;
  } else {
    return object &&
      typeof object === 'object' &&
      object.nodeType === 1 &&
      typeof object.nodeName === 'string';
  }
};

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (value && typeof value.inspect === 'function' &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    return value.inspect(recurseTimes);
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // If it's DOM elem, get outer HTML.
  if (isDOMElement(value)) {
    return getOuterHTML(value);
  }

  // Look up the keys of the object.
  var visibleKeys = getEnumerableProperties(value);
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;

  // Some type of object without properties can be shortcutted.
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
  // a `stack` plus `description` property; ignore those for consistency.
  if (keys.length === 0 || (isError(value) && (
      (keys.length === 1 && keys[0] === 'stack') ||
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
     ))) {
    if (typeof value === 'function') {
      var name = getName(value);
      var nameSuffix = name ? ': ' + name : '';
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (typeof value === 'function') {
    var name = getName(value);
    var nameSuffix = name ? ': ' + name : '';
    base = ' [Function' + nameSuffix + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    return formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  switch (typeof value) {
    case 'undefined':
      return ctx.stylize('undefined', 'undefined');

    case 'string':
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');

    case 'number':
      return ctx.stylize('' + value, 'number');

    case 'boolean':
      return ctx.stylize('' + value, 'boolean');
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return ctx.stylize('null', 'null');
  }
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str;
  if (value.__lookupGetter__) {
    if (value.__lookupGetter__(key)) {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
  }
  if (visibleKeys.indexOf(key) < 0) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(value[key]) < 0) {
      if (recurseTimes === null) {
        str = formatValue(ctx, value[key], null);
      } else {
        str = formatValue(ctx, value[key], recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (typeof name === 'undefined') {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
}

function isRegExp(re) {
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
}

function isDate(d) {
  return typeof d === 'object' && objectToString(d) === '[object Date]';
}

function isError(e) {
  return typeof e === 'object' && objectToString(e) === '[object Error]';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

},{"./getEnumerableProperties":22,"./getName":24,"./getProperties":26}],29:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var inspect = require('./inspect');

/**
 * ### .objDisplay (object)
 *
 * Determines if an object or an array matches
 * criteria to be inspected in-line for error
 * messages or should be truncated.
 *
 * @param {Mixed} javascript object to inspect
 * @name objDisplay
 * @api public
 */

module.exports = function (obj) {
  var str = inspect(obj)
    , type = Object.prototype.toString.call(obj);

  if (str.length >= 40) {
    if (type === '[object Function]') {
      return !obj.name || obj.name === ''
        ? '[Function]'
        : '[Function: ' + obj.name + ']';
    } else if (type === '[object Array]') {
      return '[ Array(' + obj.length + ') ]';
    } else if (type === '[object Object]') {
      var keys = Object.keys(obj)
        , kstr = keys.length > 2
          ? keys.splice(0, 2).join(', ') + ', ...'
          : keys.join(', ');
      return '{ Object (' + kstr + ') }';
    } else {
      return str;
    }
  } else {
    return str;
  }
};

},{"./inspect":28}],30:[function(require,module,exports){
/*!
 * Chai - overwriteMethod utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteMethod (ctx, name, fn)
 *
 * Overwites an already existing method and provides
 * access to previous function. Must return function
 * to be used for name.
 *
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
 *       return function (str) {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.value).to.equal(str);
 *         } else {
 *           _super.apply(this, arguments);
 *         }
 *       }
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.equal('bar');
 *
 * @param {Object} ctx object whose method is to be overwritten
 * @param {String} name of method to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @name overwriteMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  var _method = ctx[name]
    , _super = function () { return this; };

  if (_method && 'function' === typeof _method)
    _super = _method;

  ctx[name] = function () {
    var result = method(_super).apply(this, arguments);
    return result === undefined ? this : result;
  }
};

},{}],31:[function(require,module,exports){
/*!
 * Chai - overwriteProperty utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteProperty (ctx, name, fn)
 *
 * Overwites an already existing property getter and provides
 * access to previous value. Must return function to use as getter.
 *
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
 *       return function () {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.name).to.equal('bar');
 *         } else {
 *           _super.call(this);
 *         }
 *       }
 *     });
 *
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.ok;
 *
 * @param {Object} ctx object whose property is to be overwritten
 * @param {String} name of property to overwrite
 * @param {Function} getter function that returns a getter function to be used for name
 * @name overwriteProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  var _get = Object.getOwnPropertyDescriptor(ctx, name)
    , _super = function () {};

  if (_get && 'function' === typeof _get.get)
    _super = _get.get

  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter(_super).call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],32:[function(require,module,exports){
/*!
 * Chai - test utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag');

/**
 * # test(object, expression)
 *
 * Test and object for expression.
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , expr = args[0];
  return negate ? !expr : expr;
};

},{"./flag":20}],33:[function(require,module,exports){
/*!
 * Chai - transferFlags utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### transferFlags(assertion, object, includeAll = true)
 *
 * Transfer all the flags for `assertion` to `object`. If
 * `includeAll` is set to `false`, then the base Chai
 * assertion flags (namely `object`, `ssfi`, and `message`)
 * will not be transferred.
 *
 *
 *     var newAssertion = new Assertion();
 *     utils.transferFlags(assertion, newAssertion);
 *
 *     var anotherAsseriton = new Assertion(myObj);
 *     utils.transferFlags(assertion, anotherAssertion, false);
 *
 * @param {Assertion} assertion the assertion to transfer the flags from
 * @param {Object} object the object to transfer the flags too; usually a new assertion
 * @param {Boolean} includeAll
 * @name getAllFlags
 * @api private
 */

module.exports = function (assertion, object, includeAll) {
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));

  if (!object.__flags) {
    object.__flags = Object.create(null);
  }

  includeAll = arguments.length === 3 ? includeAll : true;

  for (var flag in flags) {
    if (includeAll ||
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
      object.__flags[flag] = flags[flag];
    }
  }
};

},{}],34:[function(require,module,exports){
/*!
 * Chai - type utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Arguments]': 'arguments'
  , '[object Array]': 'array'
  , '[object Date]': 'date'
  , '[object Function]': 'function'
  , '[object Number]': 'number'
  , '[object RegExp]': 'regexp'
  , '[object String]': 'string'
};

/**
 * ### type(object)
 *
 * Better implementation of `typeof` detection that can
 * be used cross-browser. Handles the inconsistencies of
 * Array, `null`, and `undefined` detection.
 *
 *     utils.type({}) // 'object'
 *     utils.type(null) // `null'
 *     utils.type(undefined) // `undefined`
 *     utils.type([]) // `array`
 *
 * @param {Mixed} object to detect type of
 * @name type
 * @api private
 */

module.exports = function (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
};

},{}],35:[function(require,module,exports){
/*!
 * jQuery JavaScript Library v2.1.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-05-01T17:11Z
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		// For CommonJS and CommonJS-like environments where a proper window is present,
		// execute the factory and get jQuery
		// For environments that do not inherently posses a window with a document
		// (such as Node.js), expose a jQuery-making factory as module.exports
		// This accentuates the need for the creation of a real window
		// e.g. var jQuery = require("jquery")(window);
		// See ticket #14549 for more info
		module.exports = global.document ?
			factory( global, true ) :
			function( w ) {
				if ( !w.document ) {
					throw new Error( "jQuery requires a window with a document" );
				}
				return factory( w );
			};
	} else {
		factory( global );
	}

// Pass this if window is not defined yet
}(typeof window !== "undefined" ? window : this, function( window, noGlobal ) {

// Can't do this because several apps including ASP.NET trace
// the stack via arguments.caller.callee and Firefox dies if
// you try to trace through "use strict" call chains. (#13335)
// Support: Firefox 18+
//

var arr = [];

var slice = arr.slice;

var concat = arr.concat;

var push = arr.push;

var indexOf = arr.indexOf;

var class2type = {};

var toString = class2type.toString;

var hasOwn = class2type.hasOwnProperty;

var support = {};



var
	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	version = "2.1.1",

	// Define a local copy of jQuery
	jQuery = function( selector, context ) {
		// The jQuery object is actually just the init constructor 'enhanced'
		// Need init if jQuery is called (just allow error to be thrown if not included)
		return new jQuery.fn.init( selector, context );
	},

	// Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,

	// Matches dashed string for camelizing
	rmsPrefix = /^-ms-/,
	rdashAlpha = /-([\da-z])/gi,

	// Used by jQuery.camelCase as callback to replace()
	fcamelCase = function( all, letter ) {
		return letter.toUpperCase();
	};

jQuery.fn = jQuery.prototype = {
	// The current version of jQuery being used
	jquery: version,

	constructor: jQuery,

	// Start with an empty selector
	selector: "",

	// The default length of a jQuery object is 0
	length: 0,

	toArray: function() {
		return slice.call( this );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num != null ?

			// Return just the one element from the set
			( num < 0 ? this[ num + this.length ] : this[ num ] ) :

			// Return all the elements in a clean array
			slice.call( this );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems ) {

		// Build a new jQuery matched element set
		var ret = jQuery.merge( this.constructor(), elems );

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;
		ret.context = this.context;

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jQuery.each( this, callback, args );
	},

	map: function( callback ) {
		return this.pushStack( jQuery.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ) );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	eq: function( i ) {
		var len = this.length,
			j = +i + ( i < 0 ? len : 0 );
		return this.pushStack( j >= 0 && j < len ? [ this[j] ] : [] );
	},

	end: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push: push,
	sort: arr.sort,
	splice: arr.splice
};

jQuery.extend = jQuery.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;

		// skip the boolean and the target
		target = arguments[ i ] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
		target = {};
	}

	// extend jQuery itself if only one argument is passed
	if ( i === length ) {
		target = this;
		i--;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : [];

					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jQuery.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

jQuery.extend({
	// Unique for each copy of jQuery on the page
	expando: "jQuery" + ( version + Math.random() ).replace( /\D/g, "" ),

	// Assume jQuery is ready without the ready module
	isReady: true,

	error: function( msg ) {
		throw new Error( msg );
	},

	noop: function() {},

	// See test/unit/core.js for details concerning isFunction.
	// Since version 1.3, DOM methods and functions like alert
	// aren't supported. They return false on IE (#2968).
	isFunction: function( obj ) {
		return jQuery.type(obj) === "function";
	},

	isArray: Array.isArray,

	isWindow: function( obj ) {
		return obj != null && obj === obj.window;
	},

	isNumeric: function( obj ) {
		// parseFloat NaNs numeric-cast false positives (null|true|false|"")
		// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
		// subtraction forces infinities to NaN
		return !jQuery.isArray( obj ) && obj - parseFloat( obj ) >= 0;
	},

	isPlainObject: function( obj ) {
		// Not plain objects:
		// - Any object or value whose internal [[Class]] property is not "[object Object]"
		// - DOM nodes
		// - window
		if ( jQuery.type( obj ) !== "object" || obj.nodeType || jQuery.isWindow( obj ) ) {
			return false;
		}

		if ( obj.constructor &&
				!hasOwn.call( obj.constructor.prototype, "isPrototypeOf" ) ) {
			return false;
		}

		// If the function hasn't returned already, we're confident that
		// |obj| is a plain object, created by {} or constructed with new Object
		return true;
	},

	isEmptyObject: function( obj ) {
		var name;
		for ( name in obj ) {
			return false;
		}
		return true;
	},

	type: function( obj ) {
		if ( obj == null ) {
			return obj + "";
		}
		// Support: Android < 4.0, iOS < 6 (functionish RegExp)
		return typeof obj === "object" || typeof obj === "function" ?
			class2type[ toString.call(obj) ] || "object" :
			typeof obj;
	},

	// Evaluates a script in a global context
	globalEval: function( code ) {
		var script,
			indirect = eval;

		code = jQuery.trim( code );

		if ( code ) {
			// If the code includes a valid, prologue position
			// strict mode pragma, execute code by injecting a
			// script tag into the document.
			if ( code.indexOf("use strict") === 1 ) {
				script = document.createElement("script");
				script.text = code;
				document.head.appendChild( script ).parentNode.removeChild( script );
			} else {
			// Otherwise, avoid the DOM node creation, insertion
			// and removal by using an indirect global eval
				indirect( code );
			}
		}
	},

	// Convert dashed to camelCase; used by the css and data modules
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase: function( string ) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	},

	nodeName: function( elem, name ) {
		return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
	},

	// args is for internal usage only
	each: function( obj, callback, args ) {
		var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

		if ( args ) {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.apply( obj[ i ], args );

					if ( value === false ) {
						break;
					}
				}
			}

		// A special, fast, case for the most common use of each
		} else {
			if ( isArray ) {
				for ( ; i < length; i++ ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			} else {
				for ( i in obj ) {
					value = callback.call( obj[ i ], i, obj[ i ] );

					if ( value === false ) {
						break;
					}
				}
			}
		}

		return obj;
	},

	// Support: Android<4.1
	trim: function( text ) {
		return text == null ?
			"" :
			( text + "" ).replace( rtrim, "" );
	},

	// results is for internal usage only
	makeArray: function( arr, results ) {
		var ret = results || [];

		if ( arr != null ) {
			if ( isArraylike( Object(arr) ) ) {
				jQuery.merge( ret,
					typeof arr === "string" ?
					[ arr ] : arr
				);
			} else {
				push.call( ret, arr );
			}
		}

		return ret;
	},

	inArray: function( elem, arr, i ) {
		return arr == null ? -1 : indexOf.call( arr, elem, i );
	},

	merge: function( first, second ) {
		var len = +second.length,
			j = 0,
			i = first.length;

		for ( ; j < len; j++ ) {
			first[ i++ ] = second[ j ];
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, invert ) {
		var callbackInverse,
			matches = [],
			i = 0,
			length = elems.length,
			callbackExpect = !invert;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( ; i < length; i++ ) {
			callbackInverse = !callback( elems[ i ], i );
			if ( callbackInverse !== callbackExpect ) {
				matches.push( elems[ i ] );
			}
		}

		return matches;
	},

	// arg is for internal usage only
	map: function( elems, callback, arg ) {
		var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

		// Go through the array, translating each of the items to their new values
		if ( isArray ) {
			for ( ; i < length; i++ ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}

		// Go through every key on the object,
		} else {
			for ( i in elems ) {
				value = callback( elems[ i ], i, arg );

				if ( value != null ) {
					ret.push( value );
				}
			}
		}

		// Flatten any nested arrays
		return concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	// Bind a function to a context, optionally partially applying any
	// arguments.
	proxy: function( fn, context ) {
		var tmp, args, proxy;

		if ( typeof context === "string" ) {
			tmp = fn[ context ];
			context = fn;
			fn = tmp;
		}

		// Quick check to determine if target is callable, in the spec
		// this throws a TypeError, but we will just return undefined.
		if ( !jQuery.isFunction( fn ) ) {
			return undefined;
		}

		// Simulated bind
		args = slice.call( arguments, 2 );
		proxy = function() {
			return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
		};

		// Set the guid of unique handler to the same of original handler, so it can be removed
		proxy.guid = fn.guid = fn.guid || jQuery.guid++;

		return proxy;
	},

	now: Date.now,

	// jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support: support
});

// Populate the class2type map
jQuery.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

function isArraylike( obj ) {
	var length = obj.length,
		type = jQuery.type( obj );

	if ( type === "function" || jQuery.isWindow( obj ) ) {
		return false;
	}

	if ( obj.nodeType === 1 && length ) {
		return true;
	}

	return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}
var Sizzle =
/*!
 * Sizzle CSS Selector Engine v1.10.19
 * http://sizzlejs.com/
 *
 * Copyright 2013 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2014-04-18
 */
(function( window ) {

var i,
	support,
	Expr,
	getText,
	isXML,
	tokenize,
	compile,
	select,
	outermostContext,
	sortInput,
	hasDuplicate,

	// Local document vars
	setDocument,
	document,
	docElem,
	documentIsHTML,
	rbuggyQSA,
	rbuggyMatches,
	matches,
	contains,

	// Instance-specific data
	expando = "sizzle" + -(new Date()),
	preferredDoc = window.document,
	dirruns = 0,
	done = 0,
	classCache = createCache(),
	tokenCache = createCache(),
	compilerCache = createCache(),
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
		}
		return 0;
	},

	// General-purpose constants
	strundefined = typeof undefined,
	MAX_NEGATIVE = 1 << 31,

	// Instance methods
	hasOwn = ({}).hasOwnProperty,
	arr = [],
	pop = arr.pop,
	push_native = arr.push,
	push = arr.push,
	slice = arr.slice,
	// Use a stripped-down indexOf if we can't use a native one
	indexOf = arr.indexOf || function( elem ) {
		var i = 0,
			len = this.length;
		for ( ; i < len; i++ ) {
			if ( this[i] === elem ) {
				return i;
			}
		}
		return -1;
	},

	booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",

	// Regular expressions

	// Whitespace characters http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace = "[\\x20\\t\\r\\n\\f]",
	// http://www.w3.org/TR/css3-syntax/#characters
	characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",

	// Loosely modeled on CSS identifier characters
	// An unquoted value should be a CSS identifier http://www.w3.org/TR/css3-selectors/#attribute-selectors
	// Proper syntax: http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier = characterEncoding.replace( "w", "w#" ),

	// Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace +
		// Operator (capture 2)
		"*([*^$|!~]?=)" + whitespace +
		// "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
		"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|(" + identifier + "))|)" + whitespace +
		"*\\]",

	pseudos = ":(" + characterEncoding + ")(?:\\((" +
		// To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
		// 1. quoted (capture 3; capture 4 or capture 5)
		"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|" +
		// 2. simple (capture 6)
		"((?:\\\\.|[^\\\\()[\\]]|" + attributes + ")*)|" +
		// 3. anything else (capture 2)
		".*" +
		")\\)|)",

	// Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rtrim = new RegExp( "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g" ),

	rcomma = new RegExp( "^" + whitespace + "*," + whitespace + "*" ),
	rcombinators = new RegExp( "^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*" ),

	rattributeQuotes = new RegExp( "=" + whitespace + "*([^\\]'\"]*?)" + whitespace + "*\\]", "g" ),

	rpseudo = new RegExp( pseudos ),
	ridentifier = new RegExp( "^" + identifier + "$" ),

	matchExpr = {
		"ID": new RegExp( "^#(" + characterEncoding + ")" ),
		"CLASS": new RegExp( "^\\.(" + characterEncoding + ")" ),
		"TAG": new RegExp( "^(" + characterEncoding.replace( "w", "w*" ) + ")" ),
		"ATTR": new RegExp( "^" + attributes ),
		"PSEUDO": new RegExp( "^" + pseudos ),
		"CHILD": new RegExp( "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace +
			"*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace +
			"*(\\d+)|))" + whitespace + "*\\)|)", "i" ),
		"bool": new RegExp( "^(?:" + booleans + ")$", "i" ),
		// For use in libraries implementing .is()
		// We use this for POS matching in `select`
		"needsContext": new RegExp( "^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" +
			whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i" )
	},

	rinputs = /^(?:input|select|textarea|button)$/i,
	rheader = /^h\d$/i,

	rnative = /^[^{]+\{\s*\[native \w/,

	// Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,

	rsibling = /[+~]/,
	rescape = /'|\\/g,

	// CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape = new RegExp( "\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig" ),
	funescape = function( _, escaped, escapedWhitespace ) {
		var high = "0x" + escaped - 0x10000;
		// NaN means non-codepoint
		// Support: Firefox<24
		// Workaround erroneous numeric interpretation of +"0x"
		return high !== high || escapedWhitespace ?
			escaped :
			high < 0 ?
				// BMP codepoint
				String.fromCharCode( high + 0x10000 ) :
				// Supplemental Plane codepoint (surrogate pair)
				String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
	};

// Optimize for push.apply( _, NodeList )
try {
	push.apply(
		(arr = slice.call( preferredDoc.childNodes )),
		preferredDoc.childNodes
	);
	// Support: Android<4.0
	// Detect silently failing push.apply
	arr[ preferredDoc.childNodes.length ].nodeType;
} catch ( e ) {
	push = { apply: arr.length ?

		// Leverage slice if possible
		function( target, els ) {
			push_native.apply( target, slice.call(els) );
		} :

		// Support: IE<9
		// Otherwise append directly
		function( target, els ) {
			var j = target.length,
				i = 0;
			// Can't trust NodeList.length
			while ( (target[j++] = els[i++]) ) {}
			target.length = j - 1;
		}
	};
}

function Sizzle( selector, context, results, seed ) {
	var match, elem, m, nodeType,
		// QSA vars
		i, groups, old, nid, newContext, newSelector;

	if ( ( context ? context.ownerDocument || context : preferredDoc ) !== document ) {
		setDocument( context );
	}

	context = context || document;
	results = results || [];

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	if ( (nodeType = context.nodeType) !== 1 && nodeType !== 9 ) {
		return [];
	}

	if ( documentIsHTML && !seed ) {

		// Shortcuts
		if ( (match = rquickExpr.exec( selector )) ) {
			// Speed-up: Sizzle("#ID")
			if ( (m = match[1]) ) {
				if ( nodeType === 9 ) {
					elem = context.getElementById( m );
					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document (jQuery #6963)
					if ( elem && elem.parentNode ) {
						// Handle the case where IE, Opera, and Webkit return items
						// by name instead of ID
						if ( elem.id === m ) {
							results.push( elem );
							return results;
						}
					} else {
						return results;
					}
				} else {
					// Context is not a document
					if ( context.ownerDocument && (elem = context.ownerDocument.getElementById( m )) &&
						contains( context, elem ) && elem.id === m ) {
						results.push( elem );
						return results;
					}
				}

			// Speed-up: Sizzle("TAG")
			} else if ( match[2] ) {
				push.apply( results, context.getElementsByTagName( selector ) );
				return results;

			// Speed-up: Sizzle(".CLASS")
			} else if ( (m = match[3]) && support.getElementsByClassName && context.getElementsByClassName ) {
				push.apply( results, context.getElementsByClassName( m ) );
				return results;
			}
		}

		// QSA path
		if ( support.qsa && (!rbuggyQSA || !rbuggyQSA.test( selector )) ) {
			nid = old = expando;
			newContext = context;
			newSelector = nodeType === 9 && selector;

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			if ( nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				groups = tokenize( selector );

				if ( (old = context.getAttribute("id")) ) {
					nid = old.replace( rescape, "\\$&" );
				} else {
					context.setAttribute( "id", nid );
				}
				nid = "[id='" + nid + "'] ";

				i = groups.length;
				while ( i-- ) {
					groups[i] = nid + toSelector( groups[i] );
				}
				newContext = rsibling.test( selector ) && testContext( context.parentNode ) || context;
				newSelector = groups.join(",");
			}

			if ( newSelector ) {
				try {
					push.apply( results,
						newContext.querySelectorAll( newSelector )
					);
					return results;
				} catch(qsaError) {
				} finally {
					if ( !old ) {
						context.removeAttribute("id");
					}
				}
			}
		}
	}

	// All others
	return select( selector.replace( rtrim, "$1" ), context, results, seed );
}

/**
 * Create key-value caches of limited size
 * @returns {Function(string, Object)} Returns the Object data after storing it on itself with
 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
 *	deleting the oldest entry
 */
function createCache() {
	var keys = [];

	function cache( key, value ) {
		// Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
		if ( keys.push( key + " " ) > Expr.cacheLength ) {
			// Only keep the most recent entries
			delete cache[ keys.shift() ];
		}
		return (cache[ key + " " ] = value);
	}
	return cache;
}

/**
 * Mark a function for special use by Sizzle
 * @param {Function} fn The function to mark
 */
function markFunction( fn ) {
	fn[ expando ] = true;
	return fn;
}

/**
 * Support testing using an element
 * @param {Function} fn Passed the created div and expects a boolean result
 */
function assert( fn ) {
	var div = document.createElement("div");

	try {
		return !!fn( div );
	} catch (e) {
		return false;
	} finally {
		// Remove from its parent by default
		if ( div.parentNode ) {
			div.parentNode.removeChild( div );
		}
		// release memory in IE
		div = null;
	}
}

/**
 * Adds the same handler for all of the specified attrs
 * @param {String} attrs Pipe-separated list of attributes
 * @param {Function} handler The method that will be applied
 */
function addHandle( attrs, handler ) {
	var arr = attrs.split("|"),
		i = attrs.length;

	while ( i-- ) {
		Expr.attrHandle[ arr[i] ] = handler;
	}
}

/**
 * Checks document order of two siblings
 * @param {Element} a
 * @param {Element} b
 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
 */
function siblingCheck( a, b ) {
	var cur = b && a,
		diff = cur && a.nodeType === 1 && b.nodeType === 1 &&
			( ~b.sourceIndex || MAX_NEGATIVE ) -
			( ~a.sourceIndex || MAX_NEGATIVE );

	// Use IE sourceIndex if available on both nodes
	if ( diff ) {
		return diff;
	}

	// Check if b follows a
	if ( cur ) {
		while ( (cur = cur.nextSibling) ) {
			if ( cur === b ) {
				return -1;
			}
		}
	}

	return a ? 1 : -1;
}

/**
 * Returns a function to use in pseudos for input types
 * @param {String} type
 */
function createInputPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return name === "input" && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for buttons
 * @param {String} type
 */
function createButtonPseudo( type ) {
	return function( elem ) {
		var name = elem.nodeName.toLowerCase();
		return (name === "input" || name === "button") && elem.type === type;
	};
}

/**
 * Returns a function to use in pseudos for positionals
 * @param {Function} fn
 */
function createPositionalPseudo( fn ) {
	return markFunction(function( argument ) {
		argument = +argument;
		return markFunction(function( seed, matches ) {
			var j,
				matchIndexes = fn( [], seed.length, argument ),
				i = matchIndexes.length;

			// Match elements found at the specified indexes
			while ( i-- ) {
				if ( seed[ (j = matchIndexes[i]) ] ) {
					seed[j] = !(matches[j] = seed[j]);
				}
			}
		});
	});
}

/**
 * Checks a node for validity as a Sizzle context
 * @param {Element|Object=} context
 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
 */
function testContext( context ) {
	return context && typeof context.getElementsByTagName !== strundefined && context;
}

// Expose support vars for convenience
support = Sizzle.support = {};

/**
 * Detects XML nodes
 * @param {Element|Object} elem An element or a document
 * @returns {Boolean} True iff elem is a non-HTML XML node
 */
isXML = Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement = elem && (elem.ownerDocument || elem).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

/**
 * Sets document-related variables once based on the current document
 * @param {Element|Object} [doc] An element or document object to use to set the document
 * @returns {Object} Returns the current document
 */
setDocument = Sizzle.setDocument = function( node ) {
	var hasCompare,
		doc = node ? node.ownerDocument || node : preferredDoc,
		parent = doc.defaultView;

	// If no document and documentElement is available, return
	if ( doc === document || doc.nodeType !== 9 || !doc.documentElement ) {
		return document;
	}

	// Set our document
	document = doc;
	docElem = doc.documentElement;

	// Support tests
	documentIsHTML = !isXML( doc );

	// Support: IE>8
	// If iframe document is assigned to "document" variable and if iframe has been reloaded,
	// IE will throw "permission denied" error when accessing "document" variable, see jQuery #13936
	// IE6-8 do not support the defaultView property so parent will be undefined
	if ( parent && parent !== parent.top ) {
		// IE11 does not have attachEvent, so all must suffer
		if ( parent.addEventListener ) {
			parent.addEventListener( "unload", function() {
				setDocument();
			}, false );
		} else if ( parent.attachEvent ) {
			parent.attachEvent( "onunload", function() {
				setDocument();
			});
		}
	}

	/* Attributes
	---------------------------------------------------------------------- */

	// Support: IE<8
	// Verify that getAttribute really returns attributes and not properties (excepting IE8 booleans)
	support.attributes = assert(function( div ) {
		div.className = "i";
		return !div.getAttribute("className");
	});

	/* getElement(s)By*
	---------------------------------------------------------------------- */

	// Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName = assert(function( div ) {
		div.appendChild( doc.createComment("") );
		return !div.getElementsByTagName("*").length;
	});

	// Check if getElementsByClassName can be trusted
	support.getElementsByClassName = rnative.test( doc.getElementsByClassName ) && assert(function( div ) {
		div.innerHTML = "<div class='a'></div><div class='a i'></div>";

		// Support: Safari<4
		// Catch class over-caching
		div.firstChild.className = "i";
		// Support: Opera<10
		// Catch gEBCN failure to find non-leading classes
		return div.getElementsByClassName("i").length === 2;
	});

	// Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById = assert(function( div ) {
		docElem.appendChild( div ).id = expando;
		return !doc.getElementsByName || !doc.getElementsByName( expando ).length;
	});

	// ID find and filter
	if ( support.getById ) {
		Expr.find["ID"] = function( id, context ) {
			if ( typeof context.getElementById !== strundefined && documentIsHTML ) {
				var m = context.getElementById( id );
				// Check parentNode to catch when Blackberry 4.6 returns
				// nodes that are no longer in the document #6963
				return m && m.parentNode ? [ m ] : [];
			}
		};
		Expr.filter["ID"] = function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				return elem.getAttribute("id") === attrId;
			};
		};
	} else {
		// Support: IE6/7
		// getElementById is not reliable as a find shortcut
		delete Expr.find["ID"];

		Expr.filter["ID"] =  function( id ) {
			var attrId = id.replace( runescape, funescape );
			return function( elem ) {
				var node = typeof elem.getAttributeNode !== strundefined && elem.getAttributeNode("id");
				return node && node.value === attrId;
			};
		};
	}

	// Tag
	Expr.find["TAG"] = support.getElementsByTagName ?
		function( tag, context ) {
			if ( typeof context.getElementsByTagName !== strundefined ) {
				return context.getElementsByTagName( tag );
			}
		} :
		function( tag, context ) {
			var elem,
				tmp = [],
				i = 0,
				results = context.getElementsByTagName( tag );

			// Filter out possible comments
			if ( tag === "*" ) {
				while ( (elem = results[i++]) ) {
					if ( elem.nodeType === 1 ) {
						tmp.push( elem );
					}
				}

				return tmp;
			}
			return results;
		};

	// Class
	Expr.find["CLASS"] = support.getElementsByClassName && function( className, context ) {
		if ( typeof context.getElementsByClassName !== strundefined && documentIsHTML ) {
			return context.getElementsByClassName( className );
		}
	};

	/* QSA/matchesSelector
	---------------------------------------------------------------------- */

	// QSA and matchesSelector support

	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches = [];

	// qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA = [];

	if ( (support.qsa = rnative.test( doc.querySelectorAll )) ) {
		// Build QSA regex
		// Regex strategy adopted from Diego Perini
		assert(function( div ) {
			// Select is set to empty string on purpose
			// This is to test IE's treatment of not explicitly
			// setting a boolean content attribute,
			// since its presence should be enough
			// http://bugs.jquery.com/ticket/12359
			div.innerHTML = "<select msallowclip=''><option selected=''></option></select>";

			// Support: IE8, Opera 11-12.16
			// Nothing should be selected when empty strings follow ^= or $= or *=
			// The test attribute must be unknown in Opera but "safe" for WinRT
			// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
			if ( div.querySelectorAll("[msallowclip^='']").length ) {
				rbuggyQSA.push( "[*^$]=" + whitespace + "*(?:''|\"\")" );
			}

			// Support: IE8
			// Boolean attributes and "value" are not treated correctly
			if ( !div.querySelectorAll("[selected]").length ) {
				rbuggyQSA.push( "\\[" + whitespace + "*(?:value|" + booleans + ")" );
			}

			// Webkit/Opera - :checked should return selected option elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":checked").length ) {
				rbuggyQSA.push(":checked");
			}
		});

		assert(function( div ) {
			// Support: Windows 8 Native Apps
			// The type and name attributes are restricted during .innerHTML assignment
			var input = doc.createElement("input");
			input.setAttribute( "type", "hidden" );
			div.appendChild( input ).setAttribute( "name", "D" );

			// Support: IE8
			// Enforce case-sensitivity of name attribute
			if ( div.querySelectorAll("[name=d]").length ) {
				rbuggyQSA.push( "name" + whitespace + "*[*^$|!~]?=" );
			}

			// FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
			// IE8 throws error here and will not see later tests
			if ( !div.querySelectorAll(":enabled").length ) {
				rbuggyQSA.push( ":enabled", ":disabled" );
			}

			// Opera 10-11 does not throw on post-comma invalid pseudos
			div.querySelectorAll("*,:x");
			rbuggyQSA.push(",.*:");
		});
	}

	if ( (support.matchesSelector = rnative.test( (matches = docElem.matches ||
		docElem.webkitMatchesSelector ||
		docElem.mozMatchesSelector ||
		docElem.oMatchesSelector ||
		docElem.msMatchesSelector) )) ) {

		assert(function( div ) {
			// Check to see if it's possible to do matchesSelector
			// on a disconnected node (IE 9)
			support.disconnectedMatch = matches.call( div, "div" );

			// This should fail with an exception
			// Gecko does not error, returns false instead
			matches.call( div, "[s!='']:x" );
			rbuggyMatches.push( "!=", pseudos );
		});
	}

	rbuggyQSA = rbuggyQSA.length && new RegExp( rbuggyQSA.join("|") );
	rbuggyMatches = rbuggyMatches.length && new RegExp( rbuggyMatches.join("|") );

	/* Contains
	---------------------------------------------------------------------- */
	hasCompare = rnative.test( docElem.compareDocumentPosition );

	// Element contains another
	// Purposefully does not implement inclusive descendent
	// As in, an element does not contain itself
	contains = hasCompare || rnative.test( docElem.contains ) ?
		function( a, b ) {
			var adown = a.nodeType === 9 ? a.documentElement : a,
				bup = b && b.parentNode;
			return a === bup || !!( bup && bup.nodeType === 1 && (
				adown.contains ?
					adown.contains( bup ) :
					a.compareDocumentPosition && a.compareDocumentPosition( bup ) & 16
			));
		} :
		function( a, b ) {
			if ( b ) {
				while ( (b = b.parentNode) ) {
					if ( b === a ) {
						return true;
					}
				}
			}
			return false;
		};

	/* Sorting
	---------------------------------------------------------------------- */

	// Document order sorting
	sortOrder = hasCompare ?
	function( a, b ) {

		// Flag for duplicate removal
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		// Sort on method existence if only one input has compareDocumentPosition
		var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
		if ( compare ) {
			return compare;
		}

		// Calculate position if both inputs belong to the same document
		compare = ( a.ownerDocument || a ) === ( b.ownerDocument || b ) ?
			a.compareDocumentPosition( b ) :

			// Otherwise we know they are disconnected
			1;

		// Disconnected nodes
		if ( compare & 1 ||
			(!support.sortDetached && b.compareDocumentPosition( a ) === compare) ) {

			// Choose the first element that is related to our preferred document
			if ( a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a) ) {
				return -1;
			}
			if ( b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b) ) {
				return 1;
			}

			// Maintain original order
			return sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;
		}

		return compare & 4 ? -1 : 1;
	} :
	function( a, b ) {
		// Exit early if the nodes are identical
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		var cur,
			i = 0,
			aup = a.parentNode,
			bup = b.parentNode,
			ap = [ a ],
			bp = [ b ];

		// Parentless nodes are either documents or disconnected
		if ( !aup || !bup ) {
			return a === doc ? -1 :
				b === doc ? 1 :
				aup ? -1 :
				bup ? 1 :
				sortInput ?
				( indexOf.call( sortInput, a ) - indexOf.call( sortInput, b ) ) :
				0;

		// If the nodes are siblings, we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );
		}

		// Otherwise we need full lists of their ancestors for comparison
		cur = a;
		while ( (cur = cur.parentNode) ) {
			ap.unshift( cur );
		}
		cur = b;
		while ( (cur = cur.parentNode) ) {
			bp.unshift( cur );
		}

		// Walk down the tree looking for a discrepancy
		while ( ap[i] === bp[i] ) {
			i++;
		}

		return i ?
			// Do a sibling check if the nodes have a common ancestor
			siblingCheck( ap[i], bp[i] ) :

			// Otherwise nodes in our document sort first
			ap[i] === preferredDoc ? -1 :
			bp[i] === preferredDoc ? 1 :
			0;
	};

	return doc;
};

Sizzle.matches = function( expr, elements ) {
	return Sizzle( expr, null, null, elements );
};

Sizzle.matchesSelector = function( elem, expr ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	// Make sure that attribute selectors are quoted
	expr = expr.replace( rattributeQuotes, "='$1']" );

	if ( support.matchesSelector && documentIsHTML &&
		( !rbuggyMatches || !rbuggyMatches.test( expr ) ) &&
		( !rbuggyQSA     || !rbuggyQSA.test( expr ) ) ) {

		try {
			var ret = matches.call( elem, expr );

			// IE 9's matchesSelector returns false on disconnected nodes
			if ( ret || support.disconnectedMatch ||
					// As well, disconnected nodes are said to be in a document
					// fragment in IE 9
					elem.document && elem.document.nodeType !== 11 ) {
				return ret;
			}
		} catch(e) {}
	}

	return Sizzle( expr, document, null, [ elem ] ).length > 0;
};

Sizzle.contains = function( context, elem ) {
	// Set document vars if needed
	if ( ( context.ownerDocument || context ) !== document ) {
		setDocument( context );
	}
	return contains( context, elem );
};

Sizzle.attr = function( elem, name ) {
	// Set document vars if needed
	if ( ( elem.ownerDocument || elem ) !== document ) {
		setDocument( elem );
	}

	var fn = Expr.attrHandle[ name.toLowerCase() ],
		// Don't get fooled by Object.prototype properties (jQuery #13807)
		val = fn && hasOwn.call( Expr.attrHandle, name.toLowerCase() ) ?
			fn( elem, name, !documentIsHTML ) :
			undefined;

	return val !== undefined ?
		val :
		support.attributes || !documentIsHTML ?
			elem.getAttribute( name ) :
			(val = elem.getAttributeNode(name)) && val.specified ?
				val.value :
				null;
};

Sizzle.error = function( msg ) {
	throw new Error( "Syntax error, unrecognized expression: " + msg );
};

/**
 * Document sorting and removing duplicates
 * @param {ArrayLike} results
 */
Sizzle.uniqueSort = function( results ) {
	var elem,
		duplicates = [],
		j = 0,
		i = 0;

	// Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate = !support.detectDuplicates;
	sortInput = !support.sortStable && results.slice( 0 );
	results.sort( sortOrder );

	if ( hasDuplicate ) {
		while ( (elem = results[i++]) ) {
			if ( elem === results[ i ] ) {
				j = duplicates.push( i );
			}
		}
		while ( j-- ) {
			results.splice( duplicates[ j ], 1 );
		}
	}

	// Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput = null;

	return results;
};

/**
 * Utility function for retrieving the text value of an array of DOM nodes
 * @param {Array|Element} elem
 */
getText = Sizzle.getText = function( elem ) {
	var node,
		ret = "",
		i = 0,
		nodeType = elem.nodeType;

	if ( !nodeType ) {
		// If no nodeType, this is expected to be an array
		while ( (node = elem[i++]) ) {
			// Do not traverse comment nodes
			ret += getText( node );
		}
	} else if ( nodeType === 1 || nodeType === 9 || nodeType === 11 ) {
		// Use textContent for elements
		// innerText usage removed for consistency of new lines (jQuery #11153)
		if ( typeof elem.textContent === "string" ) {
			return elem.textContent;
		} else {
			// Traverse its children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				ret += getText( elem );
			}
		}
	} else if ( nodeType === 3 || nodeType === 4 ) {
		return elem.nodeValue;
	}
	// Do not include comment or processing instruction nodes

	return ret;
};

Expr = Sizzle.selectors = {

	// Can be adjusted by the user
	cacheLength: 50,

	createPseudo: markFunction,

	match: matchExpr,

	attrHandle: {},

	find: {},

	relative: {
		">": { dir: "parentNode", first: true },
		" ": { dir: "parentNode" },
		"+": { dir: "previousSibling", first: true },
		"~": { dir: "previousSibling" }
	},

	preFilter: {
		"ATTR": function( match ) {
			match[1] = match[1].replace( runescape, funescape );

			// Move the given value to match[3] whether quoted or unquoted
			match[3] = ( match[3] || match[4] || match[5] || "" ).replace( runescape, funescape );

			if ( match[2] === "~=" ) {
				match[3] = " " + match[3] + " ";
			}

			return match.slice( 0, 4 );
		},

		"CHILD": function( match ) {
			/* matches from matchExpr["CHILD"]
				1 type (only|nth|...)
				2 what (child|of-type)
				3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
				4 xn-component of xn+y argument ([+-]?\d*n|)
				5 sign of xn-component
				6 x of xn-component
				7 sign of y-component
				8 y of y-component
			*/
			match[1] = match[1].toLowerCase();

			if ( match[1].slice( 0, 3 ) === "nth" ) {
				// nth-* requires argument
				if ( !match[3] ) {
					Sizzle.error( match[0] );
				}

				// numeric x and y parameters for Expr.filter.CHILD
				// remember that false/true cast respectively to 0/1
				match[4] = +( match[4] ? match[5] + (match[6] || 1) : 2 * ( match[3] === "even" || match[3] === "odd" ) );
				match[5] = +( ( match[7] + match[8] ) || match[3] === "odd" );

			// other types prohibit arguments
			} else if ( match[3] ) {
				Sizzle.error( match[0] );
			}

			return match;
		},

		"PSEUDO": function( match ) {
			var excess,
				unquoted = !match[6] && match[2];

			if ( matchExpr["CHILD"].test( match[0] ) ) {
				return null;
			}

			// Accept quoted arguments as-is
			if ( match[3] ) {
				match[2] = match[4] || match[5] || "";

			// Strip excess characters from unquoted arguments
			} else if ( unquoted && rpseudo.test( unquoted ) &&
				// Get excess from tokenize (recursively)
				(excess = tokenize( unquoted, true )) &&
				// advance to the next closing parenthesis
				(excess = unquoted.indexOf( ")", unquoted.length - excess ) - unquoted.length) ) {

				// excess is a negative index
				match[0] = match[0].slice( 0, excess );
				match[2] = unquoted.slice( 0, excess );
			}

			// Return only captures needed by the pseudo filter method (type and argument)
			return match.slice( 0, 3 );
		}
	},

	filter: {

		"TAG": function( nodeNameSelector ) {
			var nodeName = nodeNameSelector.replace( runescape, funescape ).toLowerCase();
			return nodeNameSelector === "*" ?
				function() { return true; } :
				function( elem ) {
					return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
				};
		},

		"CLASS": function( className ) {
			var pattern = classCache[ className + " " ];

			return pattern ||
				(pattern = new RegExp( "(^|" + whitespace + ")" + className + "(" + whitespace + "|$)" )) &&
				classCache( className, function( elem ) {
					return pattern.test( typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== strundefined && elem.getAttribute("class") || "" );
				});
		},

		"ATTR": function( name, operator, check ) {
			return function( elem ) {
				var result = Sizzle.attr( elem, name );

				if ( result == null ) {
					return operator === "!=";
				}
				if ( !operator ) {
					return true;
				}

				result += "";

				return operator === "=" ? result === check :
					operator === "!=" ? result !== check :
					operator === "^=" ? check && result.indexOf( check ) === 0 :
					operator === "*=" ? check && result.indexOf( check ) > -1 :
					operator === "$=" ? check && result.slice( -check.length ) === check :
					operator === "~=" ? ( " " + result + " " ).indexOf( check ) > -1 :
					operator === "|=" ? result === check || result.slice( 0, check.length + 1 ) === check + "-" :
					false;
			};
		},

		"CHILD": function( type, what, argument, first, last ) {
			var simple = type.slice( 0, 3 ) !== "nth",
				forward = type.slice( -4 ) !== "last",
				ofType = what === "of-type";

			return first === 1 && last === 0 ?

				// Shortcut for :nth-*(n)
				function( elem ) {
					return !!elem.parentNode;
				} :

				function( elem, context, xml ) {
					var cache, outerCache, node, diff, nodeIndex, start,
						dir = simple !== forward ? "nextSibling" : "previousSibling",
						parent = elem.parentNode,
						name = ofType && elem.nodeName.toLowerCase(),
						useCache = !xml && !ofType;

					if ( parent ) {

						// :(first|last|only)-(child|of-type)
						if ( simple ) {
							while ( dir ) {
								node = elem;
								while ( (node = node[ dir ]) ) {
									if ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) {
										return false;
									}
								}
								// Reverse direction for :only-* (if we haven't yet done so)
								start = dir = type === "only" && !start && "nextSibling";
							}
							return true;
						}

						start = [ forward ? parent.firstChild : parent.lastChild ];

						// non-xml :nth-child(...) stores cache data on `parent`
						if ( forward && useCache ) {
							// Seek `elem` from a previously-cached index
							outerCache = parent[ expando ] || (parent[ expando ] = {});
							cache = outerCache[ type ] || [];
							nodeIndex = cache[0] === dirruns && cache[1];
							diff = cache[0] === dirruns && cache[2];
							node = nodeIndex && parent.childNodes[ nodeIndex ];

							while ( (node = ++nodeIndex && node && node[ dir ] ||

								// Fallback to seeking `elem` from the start
								(diff = nodeIndex = 0) || start.pop()) ) {

								// When found, cache indexes on `parent` and break
								if ( node.nodeType === 1 && ++diff && node === elem ) {
									outerCache[ type ] = [ dirruns, nodeIndex, diff ];
									break;
								}
							}

						// Use previously-cached element index if available
						} else if ( useCache && (cache = (elem[ expando ] || (elem[ expando ] = {}))[ type ]) && cache[0] === dirruns ) {
							diff = cache[1];

						// xml :nth-child(...) or :nth-last-child(...) or :nth(-last)?-of-type(...)
						} else {
							// Use the same loop as above to seek `elem` from the start
							while ( (node = ++nodeIndex && node && node[ dir ] ||
								(diff = nodeIndex = 0) || start.pop()) ) {

								if ( ( ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1 ) && ++diff ) {
									// Cache the index of each encountered element
									if ( useCache ) {
										(node[ expando ] || (node[ expando ] = {}))[ type ] = [ dirruns, diff ];
									}

									if ( node === elem ) {
										break;
									}
								}
							}
						}

						// Incorporate the offset, then check against cycle size
						diff -= last;
						return diff === first || ( diff % first === 0 && diff / first >= 0 );
					}
				};
		},

		"PSEUDO": function( pseudo, argument ) {
			// pseudo-class names are case-insensitive
			// http://www.w3.org/TR/selectors/#pseudo-classes
			// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
			// Remember that setFilters inherits from pseudos
			var args,
				fn = Expr.pseudos[ pseudo ] || Expr.setFilters[ pseudo.toLowerCase() ] ||
					Sizzle.error( "unsupported pseudo: " + pseudo );

			// The user may use createPseudo to indicate that
			// arguments are needed to create the filter function
			// just as Sizzle does
			if ( fn[ expando ] ) {
				return fn( argument );
			}

			// But maintain support for old signatures
			if ( fn.length > 1 ) {
				args = [ pseudo, pseudo, "", argument ];
				return Expr.setFilters.hasOwnProperty( pseudo.toLowerCase() ) ?
					markFunction(function( seed, matches ) {
						var idx,
							matched = fn( seed, argument ),
							i = matched.length;
						while ( i-- ) {
							idx = indexOf.call( seed, matched[i] );
							seed[ idx ] = !( matches[ idx ] = matched[i] );
						}
					}) :
					function( elem ) {
						return fn( elem, 0, args );
					};
			}

			return fn;
		}
	},

	pseudos: {
		// Potentially complex pseudos
		"not": markFunction(function( selector ) {
			// Trim the selector passed to compile
			// to avoid treating leading and trailing
			// spaces as combinators
			var input = [],
				results = [],
				matcher = compile( selector.replace( rtrim, "$1" ) );

			return matcher[ expando ] ?
				markFunction(function( seed, matches, context, xml ) {
					var elem,
						unmatched = matcher( seed, null, xml, [] ),
						i = seed.length;

					// Match elements unmatched by `matcher`
					while ( i-- ) {
						if ( (elem = unmatched[i]) ) {
							seed[i] = !(matches[i] = elem);
						}
					}
				}) :
				function( elem, context, xml ) {
					input[0] = elem;
					matcher( input, null, xml, results );
					return !results.pop();
				};
		}),

		"has": markFunction(function( selector ) {
			return function( elem ) {
				return Sizzle( selector, elem ).length > 0;
			};
		}),

		"contains": markFunction(function( text ) {
			return function( elem ) {
				return ( elem.textContent || elem.innerText || getText( elem ) ).indexOf( text ) > -1;
			};
		}),

		// "Whether an element is represented by a :lang() selector
		// is based solely on the element's language value
		// being equal to the identifier C,
		// or beginning with the identifier C immediately followed by "-".
		// The matching of C against the element's language value is performed case-insensitively.
		// The identifier C does not have to be a valid language name."
		// http://www.w3.org/TR/selectors/#lang-pseudo
		"lang": markFunction( function( lang ) {
			// lang value must be a valid identifier
			if ( !ridentifier.test(lang || "") ) {
				Sizzle.error( "unsupported lang: " + lang );
			}
			lang = lang.replace( runescape, funescape ).toLowerCase();
			return function( elem ) {
				var elemLang;
				do {
					if ( (elemLang = documentIsHTML ?
						elem.lang :
						elem.getAttribute("xml:lang") || elem.getAttribute("lang")) ) {

						elemLang = elemLang.toLowerCase();
						return elemLang === lang || elemLang.indexOf( lang + "-" ) === 0;
					}
				} while ( (elem = elem.parentNode) && elem.nodeType === 1 );
				return false;
			};
		}),

		// Miscellaneous
		"target": function( elem ) {
			var hash = window.location && window.location.hash;
			return hash && hash.slice( 1 ) === elem.id;
		},

		"root": function( elem ) {
			return elem === docElem;
		},

		"focus": function( elem ) {
			return elem === document.activeElement && (!document.hasFocus || document.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
		},

		// Boolean properties
		"enabled": function( elem ) {
			return elem.disabled === false;
		},

		"disabled": function( elem ) {
			return elem.disabled === true;
		},

		"checked": function( elem ) {
			// In CSS3, :checked should return both checked and selected elements
			// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
			var nodeName = elem.nodeName.toLowerCase();
			return (nodeName === "input" && !!elem.checked) || (nodeName === "option" && !!elem.selected);
		},

		"selected": function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}

			return elem.selected === true;
		},

		// Contents
		"empty": function( elem ) {
			// http://www.w3.org/TR/selectors/#empty-pseudo
			// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
			//   but not by others (comment: 8; processing instruction: 7; etc.)
			// nodeType < 6 works because attributes (2) do not appear as children
			for ( elem = elem.firstChild; elem; elem = elem.nextSibling ) {
				if ( elem.nodeType < 6 ) {
					return false;
				}
			}
			return true;
		},

		"parent": function( elem ) {
			return !Expr.pseudos["empty"]( elem );
		},

		// Element/input types
		"header": function( elem ) {
			return rheader.test( elem.nodeName );
		},

		"input": function( elem ) {
			return rinputs.test( elem.nodeName );
		},

		"button": function( elem ) {
			var name = elem.nodeName.toLowerCase();
			return name === "input" && elem.type === "button" || name === "button";
		},

		"text": function( elem ) {
			var attr;
			return elem.nodeName.toLowerCase() === "input" &&
				elem.type === "text" &&

				// Support: IE<8
				// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
				( (attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text" );
		},

		// Position-in-collection
		"first": createPositionalPseudo(function() {
			return [ 0 ];
		}),

		"last": createPositionalPseudo(function( matchIndexes, length ) {
			return [ length - 1 ];
		}),

		"eq": createPositionalPseudo(function( matchIndexes, length, argument ) {
			return [ argument < 0 ? argument + length : argument ];
		}),

		"even": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 0;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"odd": createPositionalPseudo(function( matchIndexes, length ) {
			var i = 1;
			for ( ; i < length; i += 2 ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"lt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; --i >= 0; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		}),

		"gt": createPositionalPseudo(function( matchIndexes, length, argument ) {
			var i = argument < 0 ? argument + length : argument;
			for ( ; ++i < length; ) {
				matchIndexes.push( i );
			}
			return matchIndexes;
		})
	}
};

Expr.pseudos["nth"] = Expr.pseudos["eq"];

// Add button/input type pseudos
for ( i in { radio: true, checkbox: true, file: true, password: true, image: true } ) {
	Expr.pseudos[ i ] = createInputPseudo( i );
}
for ( i in { submit: true, reset: true } ) {
	Expr.pseudos[ i ] = createButtonPseudo( i );
}

// Easy API for creating new setFilters
function setFilters() {}
setFilters.prototype = Expr.filters = Expr.pseudos;
Expr.setFilters = new setFilters();

tokenize = Sizzle.tokenize = function( selector, parseOnly ) {
	var matched, match, tokens, type,
		soFar, groups, preFilters,
		cached = tokenCache[ selector + " " ];

	if ( cached ) {
		return parseOnly ? 0 : cached.slice( 0 );
	}

	soFar = selector;
	groups = [];
	preFilters = Expr.preFilter;

	while ( soFar ) {

		// Comma and first run
		if ( !matched || (match = rcomma.exec( soFar )) ) {
			if ( match ) {
				// Don't consume trailing commas as valid
				soFar = soFar.slice( match[0].length ) || soFar;
			}
			groups.push( (tokens = []) );
		}

		matched = false;

		// Combinators
		if ( (match = rcombinators.exec( soFar )) ) {
			matched = match.shift();
			tokens.push({
				value: matched,
				// Cast descendant combinators to space
				type: match[0].replace( rtrim, " " )
			});
			soFar = soFar.slice( matched.length );
		}

		// Filters
		for ( type in Expr.filter ) {
			if ( (match = matchExpr[ type ].exec( soFar )) && (!preFilters[ type ] ||
				(match = preFilters[ type ]( match ))) ) {
				matched = match.shift();
				tokens.push({
					value: matched,
					type: type,
					matches: match
				});
				soFar = soFar.slice( matched.length );
			}
		}

		if ( !matched ) {
			break;
		}
	}

	// Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly ?
		soFar.length :
		soFar ?
			Sizzle.error( selector ) :
			// Cache the tokens
			tokenCache( selector, groups ).slice( 0 );
};

function toSelector( tokens ) {
	var i = 0,
		len = tokens.length,
		selector = "";
	for ( ; i < len; i++ ) {
		selector += tokens[i].value;
	}
	return selector;
}

function addCombinator( matcher, combinator, base ) {
	var dir = combinator.dir,
		checkNonElements = base && dir === "parentNode",
		doneName = done++;

	return combinator.first ?
		// Check against closest ancestor/preceding element
		function( elem, context, xml ) {
			while ( (elem = elem[ dir ]) ) {
				if ( elem.nodeType === 1 || checkNonElements ) {
					return matcher( elem, context, xml );
				}
			}
		} :

		// Check against all ancestor/preceding elements
		function( elem, context, xml ) {
			var oldCache, outerCache,
				newCache = [ dirruns, doneName ];

			// We can't set arbitrary data on XML nodes, so they don't benefit from dir caching
			if ( xml ) {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						if ( matcher( elem, context, xml ) ) {
							return true;
						}
					}
				}
			} else {
				while ( (elem = elem[ dir ]) ) {
					if ( elem.nodeType === 1 || checkNonElements ) {
						outerCache = elem[ expando ] || (elem[ expando ] = {});
						if ( (oldCache = outerCache[ dir ]) &&
							oldCache[ 0 ] === dirruns && oldCache[ 1 ] === doneName ) {

							// Assign to newCache so results back-propagate to previous elements
							return (newCache[ 2 ] = oldCache[ 2 ]);
						} else {
							// Reuse newcache so results back-propagate to previous elements
							outerCache[ dir ] = newCache;

							// A match means we're done; a fail means we have to keep checking
							if ( (newCache[ 2 ] = matcher( elem, context, xml )) ) {
								return true;
							}
						}
					}
				}
			}
		};
}

function elementMatcher( matchers ) {
	return matchers.length > 1 ?
		function( elem, context, xml ) {
			var i = matchers.length;
			while ( i-- ) {
				if ( !matchers[i]( elem, context, xml ) ) {
					return false;
				}
			}
			return true;
		} :
		matchers[0];
}

function multipleContexts( selector, contexts, results ) {
	var i = 0,
		len = contexts.length;
	for ( ; i < len; i++ ) {
		Sizzle( selector, contexts[i], results );
	}
	return results;
}

function condense( unmatched, map, filter, context, xml ) {
	var elem,
		newUnmatched = [],
		i = 0,
		len = unmatched.length,
		mapped = map != null;

	for ( ; i < len; i++ ) {
		if ( (elem = unmatched[i]) ) {
			if ( !filter || filter( elem, context, xml ) ) {
				newUnmatched.push( elem );
				if ( mapped ) {
					map.push( i );
				}
			}
		}
	}

	return newUnmatched;
}

function setMatcher( preFilter, selector, matcher, postFilter, postFinder, postSelector ) {
	if ( postFilter && !postFilter[ expando ] ) {
		postFilter = setMatcher( postFilter );
	}
	if ( postFinder && !postFinder[ expando ] ) {
		postFinder = setMatcher( postFinder, postSelector );
	}
	return markFunction(function( seed, results, context, xml ) {
		var temp, i, elem,
			preMap = [],
			postMap = [],
			preexisting = results.length,

			// Get initial elements from seed or context
			elems = seed || multipleContexts( selector || "*", context.nodeType ? [ context ] : context, [] ),

			// Prefilter to get matcher input, preserving a map for seed-results synchronization
			matcherIn = preFilter && ( seed || !selector ) ?
				condense( elems, preMap, preFilter, context, xml ) :
				elems,

			matcherOut = matcher ?
				// If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
				postFinder || ( seed ? preFilter : preexisting || postFilter ) ?

					// ...intermediate processing is necessary
					[] :

					// ...otherwise use results directly
					results :
				matcherIn;

		// Find primary matches
		if ( matcher ) {
			matcher( matcherIn, matcherOut, context, xml );
		}

		// Apply postFilter
		if ( postFilter ) {
			temp = condense( matcherOut, postMap );
			postFilter( temp, [], context, xml );

			// Un-match failing elements by moving them back to matcherIn
			i = temp.length;
			while ( i-- ) {
				if ( (elem = temp[i]) ) {
					matcherOut[ postMap[i] ] = !(matcherIn[ postMap[i] ] = elem);
				}
			}
		}

		if ( seed ) {
			if ( postFinder || preFilter ) {
				if ( postFinder ) {
					// Get the final matcherOut by condensing this intermediate into postFinder contexts
					temp = [];
					i = matcherOut.length;
					while ( i-- ) {
						if ( (elem = matcherOut[i]) ) {
							// Restore matcherIn since elem is not yet a final match
							temp.push( (matcherIn[i] = elem) );
						}
					}
					postFinder( null, (matcherOut = []), temp, xml );
				}

				// Move matched elements from seed to results to keep them synchronized
				i = matcherOut.length;
				while ( i-- ) {
					if ( (elem = matcherOut[i]) &&
						(temp = postFinder ? indexOf.call( seed, elem ) : preMap[i]) > -1 ) {

						seed[temp] = !(results[temp] = elem);
					}
				}
			}

		// Add elements to results, through postFinder if defined
		} else {
			matcherOut = condense(
				matcherOut === results ?
					matcherOut.splice( preexisting, matcherOut.length ) :
					matcherOut
			);
			if ( postFinder ) {
				postFinder( null, results, matcherOut, xml );
			} else {
				push.apply( results, matcherOut );
			}
		}
	});
}

function matcherFromTokens( tokens ) {
	var checkContext, matcher, j,
		len = tokens.length,
		leadingRelative = Expr.relative[ tokens[0].type ],
		implicitRelative = leadingRelative || Expr.relative[" "],
		i = leadingRelative ? 1 : 0,

		// The foundational matcher ensures that elements are reachable from top-level context(s)
		matchContext = addCombinator( function( elem ) {
			return elem === checkContext;
		}, implicitRelative, true ),
		matchAnyContext = addCombinator( function( elem ) {
			return indexOf.call( checkContext, elem ) > -1;
		}, implicitRelative, true ),
		matchers = [ function( elem, context, xml ) {
			return ( !leadingRelative && ( xml || context !== outermostContext ) ) || (
				(checkContext = context).nodeType ?
					matchContext( elem, context, xml ) :
					matchAnyContext( elem, context, xml ) );
		} ];

	for ( ; i < len; i++ ) {
		if ( (matcher = Expr.relative[ tokens[i].type ]) ) {
			matchers = [ addCombinator(elementMatcher( matchers ), matcher) ];
		} else {
			matcher = Expr.filter[ tokens[i].type ].apply( null, tokens[i].matches );

			// Return special upon seeing a positional matcher
			if ( matcher[ expando ] ) {
				// Find the next relative operator (if any) for proper handling
				j = ++i;
				for ( ; j < len; j++ ) {
					if ( Expr.relative[ tokens[j].type ] ) {
						break;
					}
				}
				return setMatcher(
					i > 1 && elementMatcher( matchers ),
					i > 1 && toSelector(
						// If the preceding token was a descendant combinator, insert an implicit any-element `*`
						tokens.slice( 0, i - 1 ).concat({ value: tokens[ i - 2 ].type === " " ? "*" : "" })
					).replace( rtrim, "$1" ),
					matcher,
					i < j && matcherFromTokens( tokens.slice( i, j ) ),
					j < len && matcherFromTokens( (tokens = tokens.slice( j )) ),
					j < len && toSelector( tokens )
				);
			}
			matchers.push( matcher );
		}
	}

	return elementMatcher( matchers );
}

function matcherFromGroupMatchers( elementMatchers, setMatchers ) {
	var bySet = setMatchers.length > 0,
		byElement = elementMatchers.length > 0,
		superMatcher = function( seed, context, xml, results, outermost ) {
			var elem, j, matcher,
				matchedCount = 0,
				i = "0",
				unmatched = seed && [],
				setMatched = [],
				contextBackup = outermostContext,
				// We must always have either seed elements or outermost context
				elems = seed || byElement && Expr.find["TAG"]( "*", outermost ),
				// Use integer dirruns iff this is the outermost matcher
				dirrunsUnique = (dirruns += contextBackup == null ? 1 : Math.random() || 0.1),
				len = elems.length;

			if ( outermost ) {
				outermostContext = context !== document && context;
			}

			// Add elements passing elementMatchers directly to results
			// Keep `i` a string if there are no elements so `matchedCount` will be "00" below
			// Support: IE<9, Safari
			// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
			for ( ; i !== len && (elem = elems[i]) != null; i++ ) {
				if ( byElement && elem ) {
					j = 0;
					while ( (matcher = elementMatchers[j++]) ) {
						if ( matcher( elem, context, xml ) ) {
							results.push( elem );
							break;
						}
					}
					if ( outermost ) {
						dirruns = dirrunsUnique;
					}
				}

				// Track unmatched elements for set filters
				if ( bySet ) {
					// They will have gone through all possible matchers
					if ( (elem = !matcher && elem) ) {
						matchedCount--;
					}

					// Lengthen the array for every element, matched or not
					if ( seed ) {
						unmatched.push( elem );
					}
				}
			}

			// Apply set filters to unmatched elements
			matchedCount += i;
			if ( bySet && i !== matchedCount ) {
				j = 0;
				while ( (matcher = setMatchers[j++]) ) {
					matcher( unmatched, setMatched, context, xml );
				}

				if ( seed ) {
					// Reintegrate element matches to eliminate the need for sorting
					if ( matchedCount > 0 ) {
						while ( i-- ) {
							if ( !(unmatched[i] || setMatched[i]) ) {
								setMatched[i] = pop.call( results );
							}
						}
					}

					// Discard index placeholder values to get only actual matches
					setMatched = condense( setMatched );
				}

				// Add matches to results
				push.apply( results, setMatched );

				// Seedless set matches succeeding multiple successful matchers stipulate sorting
				if ( outermost && !seed && setMatched.length > 0 &&
					( matchedCount + setMatchers.length ) > 1 ) {

					Sizzle.uniqueSort( results );
				}
			}

			// Override manipulation of globals by nested matchers
			if ( outermost ) {
				dirruns = dirrunsUnique;
				outermostContext = contextBackup;
			}

			return unmatched;
		};

	return bySet ?
		markFunction( superMatcher ) :
		superMatcher;
}

compile = Sizzle.compile = function( selector, match /* Internal Use Only */ ) {
	var i,
		setMatchers = [],
		elementMatchers = [],
		cached = compilerCache[ selector + " " ];

	if ( !cached ) {
		// Generate a function of recursive functions that can be used to check each element
		if ( !match ) {
			match = tokenize( selector );
		}
		i = match.length;
		while ( i-- ) {
			cached = matcherFromTokens( match[i] );
			if ( cached[ expando ] ) {
				setMatchers.push( cached );
			} else {
				elementMatchers.push( cached );
			}
		}

		// Cache the compiled function
		cached = compilerCache( selector, matcherFromGroupMatchers( elementMatchers, setMatchers ) );

		// Save selector and tokenization
		cached.selector = selector;
	}
	return cached;
};

/**
 * A low-level selection function that works with Sizzle's compiled
 *  selector functions
 * @param {String|Function} selector A selector or a pre-compiled
 *  selector function built with Sizzle.compile
 * @param {Element} context
 * @param {Array} [results]
 * @param {Array} [seed] A set of elements to match against
 */
select = Sizzle.select = function( selector, context, results, seed ) {
	var i, tokens, token, type, find,
		compiled = typeof selector === "function" && selector,
		match = !seed && tokenize( (selector = compiled.selector || selector) );

	results = results || [];

	// Try to minimize operations if there is no seed and only one group
	if ( match.length === 1 ) {

		// Take a shortcut and set the context if the root selector is an ID
		tokens = match[0] = match[0].slice( 0 );
		if ( tokens.length > 2 && (token = tokens[0]).type === "ID" &&
				support.getById && context.nodeType === 9 && documentIsHTML &&
				Expr.relative[ tokens[1].type ] ) {

			context = ( Expr.find["ID"]( token.matches[0].replace(runescape, funescape), context ) || [] )[0];
			if ( !context ) {
				return results;

			// Precompiled matchers will still verify ancestry, so step up a level
			} else if ( compiled ) {
				context = context.parentNode;
			}

			selector = selector.slice( tokens.shift().value.length );
		}

		// Fetch a seed set for right-to-left matching
		i = matchExpr["needsContext"].test( selector ) ? 0 : tokens.length;
		while ( i-- ) {
			token = tokens[i];

			// Abort if we hit a combinator
			if ( Expr.relative[ (type = token.type) ] ) {
				break;
			}
			if ( (find = Expr.find[ type ]) ) {
				// Search, expanding context for leading sibling combinators
				if ( (seed = find(
					token.matches[0].replace( runescape, funescape ),
					rsibling.test( tokens[0].type ) && testContext( context.parentNode ) || context
				)) ) {

					// If seed is empty or no tokens remain, we can return early
					tokens.splice( i, 1 );
					selector = seed.length && toSelector( tokens );
					if ( !selector ) {
						push.apply( results, seed );
						return results;
					}

					break;
				}
			}
		}
	}

	// Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	( compiled || compile( selector, match ) )(
		seed,
		context,
		!documentIsHTML,
		results,
		rsibling.test( selector ) && testContext( context.parentNode ) || context
	);
	return results;
};

// One-time assignments

// Sort stability
support.sortStable = expando.split("").sort( sortOrder ).join("") === expando;

// Support: Chrome<14
// Always assume duplicates if they aren't passed to the comparison function
support.detectDuplicates = !!hasDuplicate;

// Initialize against the default document
setDocument();

// Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
// Detached nodes confoundingly follow *each other*
support.sortDetached = assert(function( div1 ) {
	// Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition( document.createElement("div") ) & 1;
});

// Support: IE<8
// Prevent attribute/property "interpolation"
// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
if ( !assert(function( div ) {
	div.innerHTML = "<a href='#'></a>";
	return div.firstChild.getAttribute("href") === "#" ;
}) ) {
	addHandle( "type|href|height|width", function( elem, name, isXML ) {
		if ( !isXML ) {
			return elem.getAttribute( name, name.toLowerCase() === "type" ? 1 : 2 );
		}
	});
}

// Support: IE<9
// Use defaultValue in place of getAttribute("value")
if ( !support.attributes || !assert(function( div ) {
	div.innerHTML = "<input/>";
	div.firstChild.setAttribute( "value", "" );
	return div.firstChild.getAttribute( "value" ) === "";
}) ) {
	addHandle( "value", function( elem, name, isXML ) {
		if ( !isXML && elem.nodeName.toLowerCase() === "input" ) {
			return elem.defaultValue;
		}
	});
}

// Support: IE<9
// Use getAttributeNode to fetch booleans when getAttribute lies
if ( !assert(function( div ) {
	return div.getAttribute("disabled") == null;
}) ) {
	addHandle( booleans, function( elem, name, isXML ) {
		var val;
		if ( !isXML ) {
			return elem[ name ] === true ? name.toLowerCase() :
					(val = elem.getAttributeNode( name )) && val.specified ?
					val.value :
				null;
		}
	});
}

return Sizzle;

})( window );



jQuery.find = Sizzle;
jQuery.expr = Sizzle.selectors;
jQuery.expr[":"] = jQuery.expr.pseudos;
jQuery.unique = Sizzle.uniqueSort;
jQuery.text = Sizzle.getText;
jQuery.isXMLDoc = Sizzle.isXML;
jQuery.contains = Sizzle.contains;



var rneedsContext = jQuery.expr.match.needsContext;

var rsingleTag = (/^<(\w+)\s*\/?>(?:<\/\1>|)$/);



var risSimple = /^.[^:#\[\.,]*$/;

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, not ) {
	if ( jQuery.isFunction( qualifier ) ) {
		return jQuery.grep( elements, function( elem, i ) {
			/* jshint -W018 */
			return !!qualifier.call( elem, i, elem ) !== not;
		});

	}

	if ( qualifier.nodeType ) {
		return jQuery.grep( elements, function( elem ) {
			return ( elem === qualifier ) !== not;
		});

	}

	if ( typeof qualifier === "string" ) {
		if ( risSimple.test( qualifier ) ) {
			return jQuery.filter( qualifier, elements, not );
		}

		qualifier = jQuery.filter( qualifier, elements );
	}

	return jQuery.grep( elements, function( elem ) {
		return ( indexOf.call( qualifier, elem ) >= 0 ) !== not;
	});
}

jQuery.filter = function( expr, elems, not ) {
	var elem = elems[ 0 ];

	if ( not ) {
		expr = ":not(" + expr + ")";
	}

	return elems.length === 1 && elem.nodeType === 1 ?
		jQuery.find.matchesSelector( elem, expr ) ? [ elem ] : [] :
		jQuery.find.matches( expr, jQuery.grep( elems, function( elem ) {
			return elem.nodeType === 1;
		}));
};

jQuery.fn.extend({
	find: function( selector ) {
		var i,
			len = this.length,
			ret = [],
			self = this;

		if ( typeof selector !== "string" ) {
			return this.pushStack( jQuery( selector ).filter(function() {
				for ( i = 0; i < len; i++ ) {
					if ( jQuery.contains( self[ i ], this ) ) {
						return true;
					}
				}
			}) );
		}

		for ( i = 0; i < len; i++ ) {
			jQuery.find( selector, self[ i ], ret );
		}

		// Needed because $( selector, context ) becomes $( context ).find( selector )
		ret = this.pushStack( len > 1 ? jQuery.unique( ret ) : ret );
		ret.selector = this.selector ? this.selector + " " + selector : selector;
		return ret;
	},
	filter: function( selector ) {
		return this.pushStack( winnow(this, selector || [], false) );
	},
	not: function( selector ) {
		return this.pushStack( winnow(this, selector || [], true) );
	},
	is: function( selector ) {
		return !!winnow(
			this,

			// If this is a positional/relative selector, check membership in the returned set
			// so $("p:first").is("p:last") won't return true for a doc with two "p".
			typeof selector === "string" && rneedsContext.test( selector ) ?
				jQuery( selector ) :
				selector || [],
			false
		).length;
	}
});


// Initialize a jQuery object


// A central reference to the root jQuery(document)
var rootjQuery,

	// A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,

	init = jQuery.fn.init = function( selector, context ) {
		var match, elem;

		// HANDLE: $(""), $(null), $(undefined), $(false)
		if ( !selector ) {
			return this;
		}

		// Handle HTML strings
		if ( typeof selector === "string" ) {
			if ( selector[0] === "<" && selector[ selector.length - 1 ] === ">" && selector.length >= 3 ) {
				// Assume that strings that start and end with <> are HTML and skip the regex check
				match = [ null, selector, null ];

			} else {
				match = rquickExpr.exec( selector );
			}

			// Match html or make sure no context is specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(html) -> $(array)
				if ( match[1] ) {
					context = context instanceof jQuery ? context[0] : context;

					// scripts is true for back-compat
					// Intentionally let the error be thrown if parseHTML is not present
					jQuery.merge( this, jQuery.parseHTML(
						match[1],
						context && context.nodeType ? context.ownerDocument || context : document,
						true
					) );

					// HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jQuery.isPlainObject( context ) ) {
						for ( match in context ) {
							// Properties of context are called as methods if possible
							if ( jQuery.isFunction( this[ match ] ) ) {
								this[ match ]( context[ match ] );

							// ...and otherwise set as attributes
							} else {
								this.attr( match, context[ match ] );
							}
						}
					}

					return this;

				// HANDLE: $(#id)
				} else {
					elem = document.getElementById( match[2] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Inject the element directly into the jQuery object
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jquery ) {
				return ( context || rootjQuery ).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(DOMElement)
		} else if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jQuery.isFunction( selector ) ) {
			return typeof rootjQuery.ready !== "undefined" ?
				rootjQuery.ready( selector ) :
				// Execute immediately if ready is not present
				selector( jQuery );
		}

		if ( selector.selector !== undefined ) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jQuery.makeArray( selector, this );
	};

// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;

// Initialize central reference
rootjQuery = jQuery( document );


var rparentsprev = /^(?:parents|prev(?:Until|All))/,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jQuery.extend({
	dir: function( elem, dir, until ) {
		var matched = [],
			truncate = until !== undefined;

		while ( (elem = elem[ dir ]) && elem.nodeType !== 9 ) {
			if ( elem.nodeType === 1 ) {
				if ( truncate && jQuery( elem ).is( until ) ) {
					break;
				}
				matched.push( elem );
			}
		}
		return matched;
	},

	sibling: function( n, elem ) {
		var matched = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				matched.push( n );
			}
		}

		return matched;
	}
});

jQuery.fn.extend({
	has: function( target ) {
		var targets = jQuery( target, this ),
			l = targets.length;

		return this.filter(function() {
			var i = 0;
			for ( ; i < l; i++ ) {
				if ( jQuery.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	closest: function( selectors, context ) {
		var cur,
			i = 0,
			l = this.length,
			matched = [],
			pos = rneedsContext.test( selectors ) || typeof selectors !== "string" ?
				jQuery( selectors, context || this.context ) :
				0;

		for ( ; i < l; i++ ) {
			for ( cur = this[i]; cur && cur !== context; cur = cur.parentNode ) {
				// Always skip document fragments
				if ( cur.nodeType < 11 && (pos ?
					pos.index(cur) > -1 :

					// Don't pass non-elements to Sizzle
					cur.nodeType === 1 &&
						jQuery.find.matchesSelector(cur, selectors)) ) {

					matched.push( cur );
					break;
				}
			}
		}

		return this.pushStack( matched.length > 1 ? jQuery.unique( matched ) : matched );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {

		// No argument, return index in parent
		if ( !elem ) {
			return ( this[ 0 ] && this[ 0 ].parentNode ) ? this.first().prevAll().length : -1;
		}

		// index in selector
		if ( typeof elem === "string" ) {
			return indexOf.call( jQuery( elem ), this[ 0 ] );
		}

		// Locate the position of the desired element
		return indexOf.call( this,

			// If it receives a jQuery object, the first element is used
			elem.jquery ? elem[ 0 ] : elem
		);
	},

	add: function( selector, context ) {
		return this.pushStack(
			jQuery.unique(
				jQuery.merge( this.get(), jQuery( selector, context ) )
			)
		);
	},

	addBack: function( selector ) {
		return this.add( selector == null ?
			this.prevObject : this.prevObject.filter(selector)
		);
	}
});

function sibling( cur, dir ) {
	while ( (cur = cur[dir]) && cur.nodeType !== 1 ) {}
	return cur;
}

jQuery.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jQuery.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return sibling( elem, "nextSibling" );
	},
	prev: function( elem ) {
		return sibling( elem, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jQuery.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jQuery.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jQuery.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jQuery.sibling( ( elem.parentNode || {} ).firstChild, elem );
	},
	children: function( elem ) {
		return jQuery.sibling( elem.firstChild );
	},
	contents: function( elem ) {
		return elem.contentDocument || jQuery.merge( [], elem.childNodes );
	}
}, function( name, fn ) {
	jQuery.fn[ name ] = function( until, selector ) {
		var matched = jQuery.map( this, fn, until );

		if ( name.slice( -5 ) !== "Until" ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			matched = jQuery.filter( selector, matched );
		}

		if ( this.length > 1 ) {
			// Remove duplicates
			if ( !guaranteedUnique[ name ] ) {
				jQuery.unique( matched );
			}

			// Reverse order for parents* and prev-derivatives
			if ( rparentsprev.test( name ) ) {
				matched.reverse();
			}
		}

		return this.pushStack( matched );
	};
});
var rnotwhite = (/\S+/g);



// String to Object options format cache
var optionsCache = {};

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jQuery.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

/*
 * Create a callback list using the following parameters:
 *
 *	options: an optional list of space-separated options that will change how
 *			the callback list behaves or a more traditional option object
 *
 * By default a callback list will act like an event callback list and can be
 * "fired" multiple times.
 *
 * Possible options:
 *
 *	once:			will ensure the callback list can only be fired once (like a Deferred)
 *
 *	memory:			will keep track of previous values and will call any callback added
 *					after the list has been fired right away with the latest "memorized"
 *					values (like a Deferred)
 *
 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
 *
 *	stopOnFalse:	interrupt callings when a callback returns false
 *
 */
jQuery.Callbacks = function( options ) {

	// Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options = typeof options === "string" ?
		( optionsCache[ options ] || createOptions( options ) ) :
		jQuery.extend( {}, options );

	var // Last fire value (for non-forgettable lists)
		memory,
		// Flag to know if list was already fired
		fired,
		// Flag to know if list is currently firing
		firing,
		// First callback to fire (used internally by add and fireWith)
		firingStart,
		// End of the loop when firing
		firingLength,
		// Index of currently firing callback (modified by remove if needed)
		firingIndex,
		// Actual callback list
		list = [],
		// Stack of fire calls for repeatable lists
		stack = !options.once && [],
		// Fire callbacks
		fire = function( data ) {
			memory = options.memory && data;
			fired = true;
			firingIndex = firingStart || 0;
			firingStart = 0;
			firingLength = list.length;
			firing = true;
			for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					memory = false; // To prevent further calls using add
					break;
				}
			}
			firing = false;
			if ( list ) {
				if ( stack ) {
					if ( stack.length ) {
						fire( stack.shift() );
					}
				} else if ( memory ) {
					list = [];
				} else {
					self.disable();
				}
			}
		},
		// Actual Callbacks object
		self = {
			// Add a callback or a collection of callbacks to the list
			add: function() {
				if ( list ) {
					// First, we save the current length
					var start = list.length;
					(function add( args ) {
						jQuery.each( args, function( _, arg ) {
							var type = jQuery.type( arg );
							if ( type === "function" ) {
								if ( !options.unique || !self.has( arg ) ) {
									list.push( arg );
								}
							} else if ( arg && arg.length && type !== "string" ) {
								// Inspect recursively
								add( arg );
							}
						});
					})( arguments );
					// Do we need to add the callbacks to the
					// current firing batch?
					if ( firing ) {
						firingLength = list.length;
					// With memory, if we're not firing then
					// we should call right away
					} else if ( memory ) {
						firingStart = start;
						fire( memory );
					}
				}
				return this;
			},
			// Remove a callback from the list
			remove: function() {
				if ( list ) {
					jQuery.each( arguments, function( _, arg ) {
						var index;
						while ( ( index = jQuery.inArray( arg, list, index ) ) > -1 ) {
							list.splice( index, 1 );
							// Handle firing indexes
							if ( firing ) {
								if ( index <= firingLength ) {
									firingLength--;
								}
								if ( index <= firingIndex ) {
									firingIndex--;
								}
							}
						}
					});
				}
				return this;
			},
			// Check if a given callback is in the list.
			// If no argument is given, return whether or not list has callbacks attached.
			has: function( fn ) {
				return fn ? jQuery.inArray( fn, list ) > -1 : !!( list && list.length );
			},
			// Remove all callbacks from the list
			empty: function() {
				list = [];
				firingLength = 0;
				return this;
			},
			// Have the list do nothing anymore
			disable: function() {
				list = stack = memory = undefined;
				return this;
			},
			// Is it disabled?
			disabled: function() {
				return !list;
			},
			// Lock the list in its current state
			lock: function() {
				stack = undefined;
				if ( !memory ) {
					self.disable();
				}
				return this;
			},
			// Is it locked?
			locked: function() {
				return !stack;
			},
			// Call all callbacks with the given context and arguments
			fireWith: function( context, args ) {
				if ( list && ( !fired || stack ) ) {
					args = args || [];
					args = [ context, args.slice ? args.slice() : args ];
					if ( firing ) {
						stack.push( args );
					} else {
						fire( args );
					}
				}
				return this;
			},
			// Call all the callbacks with the given arguments
			fire: function() {
				self.fireWith( this, arguments );
				return this;
			},
			// To know if the callbacks have already been called at least once
			fired: function() {
				return !!fired;
			}
		};

	return self;
};


jQuery.extend({

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jQuery.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jQuery.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jQuery.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jQuery.Deferred(function( newDefer ) {
						jQuery.each( tuples, function( i, tuple ) {
							var fn = jQuery.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jQuery.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jQuery.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jQuery.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jQuery.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jQuery.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );
					} else if ( !( --remaining ) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jQuery.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	}
});


// The deferred used on DOM ready
var readyList;

jQuery.fn.ready = function( fn ) {
	// Add the callback
	jQuery.ready.promise().done( fn );

	return this;
};

jQuery.extend({
	// Is the DOM ready to be used? Set to true once it occurs.
	isReady: false,

	// A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait: 1,

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			jQuery.readyWait++;
		} else {
			jQuery.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --jQuery.readyWait : jQuery.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		jQuery.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --jQuery.readyWait > 0 ) {
			return;
		}

		// If there are functions bound, to execute
		readyList.resolveWith( document, [ jQuery ] );

		// Trigger any bound ready events
		if ( jQuery.fn.triggerHandler ) {
			jQuery( document ).triggerHandler( "ready" );
			jQuery( document ).off( "ready" );
		}
	}
});

/**
 * The ready event handler and self cleanup method
 */
function completed() {
	document.removeEventListener( "DOMContentLoaded", completed, false );
	window.removeEventListener( "load", completed, false );
	jQuery.ready();
}

jQuery.ready.promise = function( obj ) {
	if ( !readyList ) {

		readyList = jQuery.Deferred();

		// Catch cases where $(document).ready() is called after the browser event has already occurred.
		// we once tried to use readyState "interactive" here, but it caused issues like the one
		// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
		if ( document.readyState === "complete" ) {
			// Handle it asynchronously to allow scripts the opportunity to delay ready
			setTimeout( jQuery.ready );

		} else {

			// Use the handy event callback
			document.addEventListener( "DOMContentLoaded", completed, false );

			// A fallback to window.onload, that will always work
			window.addEventListener( "load", completed, false );
		}
	}
	return readyList.promise( obj );
};

// Kick off the DOM ready check even if the user does not
jQuery.ready.promise();




// Multifunctional method to get and set values of a collection
// The value/s can optionally be executed if it's a function
var access = jQuery.access = function( elems, fn, key, value, chainable, emptyGet, raw ) {
	var i = 0,
		len = elems.length,
		bulk = key == null;

	// Sets many values
	if ( jQuery.type( key ) === "object" ) {
		chainable = true;
		for ( i in key ) {
			jQuery.access( elems, fn, i, key[i], true, emptyGet, raw );
		}

	// Sets one value
	} else if ( value !== undefined ) {
		chainable = true;

		if ( !jQuery.isFunction( value ) ) {
			raw = true;
		}

		if ( bulk ) {
			// Bulk operations run against the entire set
			if ( raw ) {
				fn.call( elems, value );
				fn = null;

			// ...except when executing function values
			} else {
				bulk = fn;
				fn = function( elem, key, value ) {
					return bulk.call( jQuery( elem ), value );
				};
			}
		}

		if ( fn ) {
			for ( ; i < len; i++ ) {
				fn( elems[i], key, raw ? value : value.call( elems[i], i, fn( elems[i], key ) ) );
			}
		}
	}

	return chainable ?
		elems :

		// Gets
		bulk ?
			fn.call( elems ) :
			len ? fn( elems[0], key ) : emptyGet;
};


/**
 * Determines whether an object can have data
 */
jQuery.acceptData = function( owner ) {
	// Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */
	return owner.nodeType === 1 || owner.nodeType === 9 || !( +owner.nodeType );
};


function Data() {
	// Support: Android < 4,
	// Old WebKit does not have Object.preventExtensions/freeze method,
	// return new empty object instead with no [[set]] accessor
	Object.defineProperty( this.cache = {}, 0, {
		get: function() {
			return {};
		}
	});

	this.expando = jQuery.expando + Math.random();
}

Data.uid = 1;
Data.accepts = jQuery.acceptData;

Data.prototype = {
	key: function( owner ) {
		// We can accept data for non-element nodes in modern browsers,
		// but we should not, see #8335.
		// Always return the key for a frozen object.
		if ( !Data.accepts( owner ) ) {
			return 0;
		}

		var descriptor = {},
			// Check if the owner object already has a cache key
			unlock = owner[ this.expando ];

		// If not, create one
		if ( !unlock ) {
			unlock = Data.uid++;

			// Secure it in a non-enumerable, non-writable property
			try {
				descriptor[ this.expando ] = { value: unlock };
				Object.defineProperties( owner, descriptor );

			// Support: Android < 4
			// Fallback to a less secure definition
			} catch ( e ) {
				descriptor[ this.expando ] = unlock;
				jQuery.extend( owner, descriptor );
			}
		}

		// Ensure the cache object
		if ( !this.cache[ unlock ] ) {
			this.cache[ unlock ] = {};
		}

		return unlock;
	},
	set: function( owner, data, value ) {
		var prop,
			// There may be an unlock assigned to this node,
			// if there is no entry for this "owner", create one inline
			// and set the unlock as though an owner entry had always existed
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		// Handle: [ owner, key, value ] args
		if ( typeof data === "string" ) {
			cache[ data ] = value;

		// Handle: [ owner, { properties } ] args
		} else {
			// Fresh assignments by object are shallow copied
			if ( jQuery.isEmptyObject( cache ) ) {
				jQuery.extend( this.cache[ unlock ], data );
			// Otherwise, copy the properties one-by-one to the cache object
			} else {
				for ( prop in data ) {
					cache[ prop ] = data[ prop ];
				}
			}
		}
		return cache;
	},
	get: function( owner, key ) {
		// Either a valid cache is found, or will be created.
		// New caches will be created and the unlock returned,
		// allowing direct access to the newly created
		// empty data object. A valid owner object must be provided.
		var cache = this.cache[ this.key( owner ) ];

		return key === undefined ?
			cache : cache[ key ];
	},
	access: function( owner, key, value ) {
		var stored;
		// In cases where either:
		//
		//   1. No key was specified
		//   2. A string key was specified, but no value provided
		//
		// Take the "read" path and allow the get method to determine
		// which value to return, respectively either:
		//
		//   1. The entire cache object
		//   2. The data stored at the key
		//
		if ( key === undefined ||
				((key && typeof key === "string") && value === undefined) ) {

			stored = this.get( owner, key );

			return stored !== undefined ?
				stored : this.get( owner, jQuery.camelCase(key) );
		}

		// [*]When the key is not a string, or both a key and value
		// are specified, set or extend (existing objects) with either:
		//
		//   1. An object of properties
		//   2. A key and value
		//
		this.set( owner, key, value );

		// Since the "set" path can have two possible entry points
		// return the expected data based on which path was taken[*]
		return value !== undefined ? value : key;
	},
	remove: function( owner, key ) {
		var i, name, camel,
			unlock = this.key( owner ),
			cache = this.cache[ unlock ];

		if ( key === undefined ) {
			this.cache[ unlock ] = {};

		} else {
			// Support array or space separated string of keys
			if ( jQuery.isArray( key ) ) {
				// If "name" is an array of keys...
				// When data is initially created, via ("key", "val") signature,
				// keys will be converted to camelCase.
				// Since there is no way to tell _how_ a key was added, remove
				// both plain key and camelCase key. #12786
				// This will only penalize the array argument path.
				name = key.concat( key.map( jQuery.camelCase ) );
			} else {
				camel = jQuery.camelCase( key );
				// Try the string as a key before any manipulation
				if ( key in cache ) {
					name = [ key, camel ];
				} else {
					// If a key with the spaces exists, use it.
					// Otherwise, create an array by matching non-whitespace
					name = camel;
					name = name in cache ?
						[ name ] : ( name.match( rnotwhite ) || [] );
				}
			}

			i = name.length;
			while ( i-- ) {
				delete cache[ name[ i ] ];
			}
		}
	},
	hasData: function( owner ) {
		return !jQuery.isEmptyObject(
			this.cache[ owner[ this.expando ] ] || {}
		);
	},
	discard: function( owner ) {
		if ( owner[ this.expando ] ) {
			delete this.cache[ owner[ this.expando ] ];
		}
	}
};
var data_priv = new Data();

var data_user = new Data();



/*
	Implementation Summary

	1. Enforce API surface and semantic compatibility with 1.9.x branch
	2. Improve the module's maintainability by reducing the storage
		paths to a single mechanism.
	3. Use the same single mechanism to support "private" and "user" data.
	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	5. Avoid exposing implementation details on user objects (eg. expando properties)
	6. Provide a clear path for implementation upgrade to WeakMap in 2014
*/
var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
	rmultiDash = /([A-Z])/g;

function dataAttr( elem, key, data ) {
	var name;

	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType === 1 ) {
		name = "data-" + key.replace( rmultiDash, "-$1" ).toLowerCase();
		data = elem.getAttribute( name );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
					data === "false" ? false :
					data === "null" ? null :
					// Only convert to a number if it doesn't change the string
					+data + "" === data ? +data :
					rbrace.test( data ) ? jQuery.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			data_user.set( elem, key, data );
		} else {
			data = undefined;
		}
	}
	return data;
}

jQuery.extend({
	hasData: function( elem ) {
		return data_user.hasData( elem ) || data_priv.hasData( elem );
	},

	data: function( elem, name, data ) {
		return data_user.access( elem, name, data );
	},

	removeData: function( elem, name ) {
		data_user.remove( elem, name );
	},

	// TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to data_priv methods, these can be deprecated.
	_data: function( elem, name, data ) {
		return data_priv.access( elem, name, data );
	},

	_removeData: function( elem, name ) {
		data_priv.remove( elem, name );
	}
});

jQuery.fn.extend({
	data: function( key, value ) {
		var i, name, data,
			elem = this[ 0 ],
			attrs = elem && elem.attributes;

		// Gets all values
		if ( key === undefined ) {
			if ( this.length ) {
				data = data_user.get( elem );

				if ( elem.nodeType === 1 && !data_priv.get( elem, "hasDataAttrs" ) ) {
					i = attrs.length;
					while ( i-- ) {

						// Support: IE11+
						// The attrs elements can be null (#14894)
						if ( attrs[ i ] ) {
							name = attrs[ i ].name;
							if ( name.indexOf( "data-" ) === 0 ) {
								name = jQuery.camelCase( name.slice(5) );
								dataAttr( elem, name, data[ name ] );
							}
						}
					}
					data_priv.set( elem, "hasDataAttrs", true );
				}
			}

			return data;
		}

		// Sets multiple values
		if ( typeof key === "object" ) {
			return this.each(function() {
				data_user.set( this, key );
			});
		}

		return access( this, function( value ) {
			var data,
				camelKey = jQuery.camelCase( key );

			// The calling jQuery object (element matches) is not empty
			// (and therefore has an element appears at this[ 0 ]) and the
			// `value` parameter was not undefined. An empty jQuery object
			// will result in `undefined` for elem = this[ 0 ] which will
			// throw an exception if an attempt to read a data cache is made.
			if ( elem && value === undefined ) {
				// Attempt to get data from the cache
				// with the key as-is
				data = data_user.get( elem, key );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to get data from the cache
				// with the key camelized
				data = data_user.get( elem, camelKey );
				if ( data !== undefined ) {
					return data;
				}

				// Attempt to "discover" the data in
				// HTML5 custom data-* attrs
				data = dataAttr( elem, camelKey, undefined );
				if ( data !== undefined ) {
					return data;
				}

				// We tried really hard, but the data doesn't exist.
				return;
			}

			// Set the data...
			this.each(function() {
				// First, attempt to store a copy or reference of any
				// data that might've been store with a camelCased key.
				var data = data_user.get( this, camelKey );

				// For HTML5 data-* attribute interop, we have to
				// store property names with dashes in a camelCase form.
				// This might not apply to all properties...*
				data_user.set( this, camelKey, value );

				// *... In the case of properties that might _actually_
				// have dashes, we need to also store a copy of that
				// unchanged property.
				if ( key.indexOf("-") !== -1 && data !== undefined ) {
					data_user.set( this, key, value );
				}
			});
		}, null, value, arguments.length > 1, null, true );
	},

	removeData: function( key ) {
		return this.each(function() {
			data_user.remove( this, key );
		});
	}
});


jQuery.extend({
	queue: function( elem, type, data ) {
		var queue;

		if ( elem ) {
			type = ( type || "fx" ) + "queue";
			queue = data_priv.get( elem, type );

			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !queue || jQuery.isArray( data ) ) {
					queue = data_priv.access( elem, type, jQuery.makeArray(data) );
				} else {
					queue.push( data );
				}
			}
			return queue || [];
		}
	},

	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = jQuery.queue( elem, type ),
			startLength = queue.length,
			fn = queue.shift(),
			hooks = jQuery._queueHooks( elem, type ),
			next = function() {
				jQuery.dequeue( elem, type );
			};

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {
			fn = queue.shift();
			startLength--;
		}

		if ( fn ) {

			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {
				queue.unshift( "inprogress" );
			}

			// clear up the last queue stop function
			delete hooks.stop;
			fn.call( elem, next, hooks );
		}

		if ( !startLength && hooks ) {
			hooks.empty.fire();
		}
	},

	// not intended for public consumption - generates a queueHooks object, or returns the current one
	_queueHooks: function( elem, type ) {
		var key = type + "queueHooks";
		return data_priv.get( elem, key ) || data_priv.access( elem, key, {
			empty: jQuery.Callbacks("once memory").add(function() {
				data_priv.remove( elem, [ type + "queue", key ] );
			})
		});
	}
});

jQuery.fn.extend({
	queue: function( type, data ) {
		var setter = 2;

		if ( typeof type !== "string" ) {
			data = type;
			type = "fx";
			setter--;
		}

		if ( arguments.length < setter ) {
			return jQuery.queue( this[0], type );
		}

		return data === undefined ?
			this :
			this.each(function() {
				var queue = jQuery.queue( this, type, data );

				// ensure a hooks for this queue
				jQuery._queueHooks( this, type );

				if ( type === "fx" && queue[0] !== "inprogress" ) {
					jQuery.dequeue( this, type );
				}
			});
	},
	dequeue: function( type ) {
		return this.each(function() {
			jQuery.dequeue( this, type );
		});
	},
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, obj ) {
		var tmp,
			count = 1,
			defer = jQuery.Deferred(),
			elements = this,
			i = this.length,
			resolve = function() {
				if ( !( --count ) ) {
					defer.resolveWith( elements, [ elements ] );
				}
			};

		if ( typeof type !== "string" ) {
			obj = type;
			type = undefined;
		}
		type = type || "fx";

		while ( i-- ) {
			tmp = data_priv.get( elements[ i ], type + "queueHooks" );
			if ( tmp && tmp.empty ) {
				count++;
				tmp.empty.add( resolve );
			}
		}
		resolve();
		return defer.promise( obj );
	}
});
var pnum = (/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/).source;

var cssExpand = [ "Top", "Right", "Bottom", "Left" ];

var isHidden = function( elem, el ) {
		// isHidden might be called from jQuery#filter function;
		// in that case, element will be second argument
		elem = el || elem;
		return jQuery.css( elem, "display" ) === "none" || !jQuery.contains( elem.ownerDocument, elem );
	};

var rcheckableType = (/^(?:checkbox|radio)$/i);



(function() {
	var fragment = document.createDocumentFragment(),
		div = fragment.appendChild( document.createElement( "div" ) ),
		input = document.createElement( "input" );

	// #11217 - WebKit loses check when the name is after the checked attribute
	// Support: Windows Web Apps (WWA)
	// `name` and `type` need .setAttribute for WWA
	input.setAttribute( "type", "radio" );
	input.setAttribute( "checked", "checked" );
	input.setAttribute( "name", "t" );

	div.appendChild( input );

	// Support: Safari 5.1, iOS 5.1, Android 4.x, Android 2.3
	// old WebKit doesn't clone checked state correctly in fragments
	support.checkClone = div.cloneNode( true ).cloneNode( true ).lastChild.checked;

	// Make sure textarea (and checkbox) defaultValue is properly cloned
	// Support: IE9-IE11+
	div.innerHTML = "<textarea>x</textarea>";
	support.noCloneChecked = !!div.cloneNode( true ).lastChild.defaultValue;
})();
var strundefined = typeof undefined;



support.focusinBubbles = "onfocusin" in window;


var
	rkeyEvent = /^key/,
	rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

function safeActiveElement() {
	try {
		return document.activeElement;
	} catch ( err ) { }
}

/*
 * Helper functions for managing events -- not part of the public interface.
 * Props to Dean Edwards' addEvent library for many of the ideas.
 */
jQuery.event = {

	global: {},

	add: function( elem, types, handler, data, selector ) {

		var handleObjIn, eventHandle, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.get( elem );

		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jQuery.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jQuery.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jQuery !== strundefined && jQuery.event.triggered !== e.type ?
					jQuery.event.dispatch.apply( elem, arguments ) : undefined;
			};
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jQuery.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jQuery.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jQuery.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

			// Keep track of which events have ever been used, for event optimization
			jQuery.event.global[ type ] = true;
		}

	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {

		var j, origCount, tmp,
			events, t, handleObj,
			special, handlers, type, namespaces, origType,
			elemData = data_priv.hasData( elem ) && data_priv.get( elem );

		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jQuery.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jQuery.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jQuery.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jQuery.isEmptyObject( events ) ) {
			delete elemData.handle;
			data_priv.remove( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {

		var i, cur, tmp, bubbleType, ontype, handle, special,
			eventPath = [ elem || document ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || document;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jQuery.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jQuery.Event object, Object, or just an event type string
		event = event[ jQuery.expando ] ?
			event :
			new jQuery.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jQuery.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jQuery.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || document) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jQuery handler
			handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jQuery.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jQuery.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && jQuery.isFunction( elem[ type ] ) && !jQuery.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jQuery.event.triggered = type;
					elem[ type ]();
					jQuery.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jQuery.Event from the native event object
		event = jQuery.event.fix( event );

		var i, j, ret, matched, handleObj,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
			special = jQuery.event.special[ event.type ] || {};

		// Use the fix-ed jQuery.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jQuery.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

					event.handleObj = handleObj;
					event.data = handleObj.data;

					ret = ( (jQuery.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var i, matches, sel, handleObj,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			for ( ; cur !== this; cur = cur.parentNode || this ) {

				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.disabled !== true || event.type !== "click" ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jQuery( sel, this ).index( cur ) >= 0 :
								jQuery.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),

	fixHooks: {},

	keyHooks: {
		props: "char charCode key keyCode".split(" "),
		filter: function( event, original ) {

			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}

			return event;
		}
	},

	mouseHooks: {
		props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var eventDoc, doc, body,
				button = original.button;

			// Calculate pageX/Y if missing and clientX/Y available
			if ( event.pageX == null && original.clientX != null ) {
				eventDoc = event.target.ownerDocument || document;
				doc = eventDoc.documentElement;
				body = eventDoc.body;

				event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
				event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	fix: function( event ) {
		if ( event[ jQuery.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jQuery.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: Cordova 2.5 (WebKit) (#13255)
		// All events should have a target; Cordova deviceready doesn't
		if ( !event.target ) {
			event.target = document;
		}

		// Support: Safari 6.0+, Chrome < 28
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		},
		focus: {
			// Fire native event if possible so blur/focus sequence is correct
			trigger: function() {
				if ( this !== safeActiveElement() && this.focus ) {
					this.focus();
					return false;
				}
			},
			delegateType: "focusin"
		},
		blur: {
			trigger: function() {
				if ( this === safeActiveElement() && this.blur ) {
					this.blur();
					return false;
				}
			},
			delegateType: "focusout"
		},
		click: {
			// For checkbox, fire native event so checked state will be right
			trigger: function() {
				if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
					this.click();
					return false;
				}
			},

			// For cross-browser consistency, don't fire native .click() on links
			_default: function( event ) {
				return jQuery.nodeName( event.target, "a" );
			}
		},

		beforeunload: {
			postDispatch: function( event ) {

				// Support: Firefox 20+
				// Firefox doesn't alert if the returnValue field is not set.
				if ( event.result !== undefined && event.originalEvent ) {
					event.originalEvent.returnValue = event.result;
				}
			}
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jQuery.extend(
			new jQuery.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jQuery.event.trigger( e, null, elem );
		} else {
			jQuery.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jQuery.removeEvent = function( elem, type, handle ) {
	if ( elem.removeEventListener ) {
		elem.removeEventListener( type, handle, false );
	}
};

jQuery.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jQuery.Event) ) {
		return new jQuery.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined &&
				// Support: Android < 4.0
				src.returnValue === false ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jQuery.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jQuery.now();

	// Mark it as fixed
	this[ jQuery.expando ] = true;
};

// jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jQuery.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;

		if ( e && e.preventDefault ) {
			e.preventDefault();
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;

		if ( e && e.stopPropagation ) {
			e.stopPropagation();
		}
	},
	stopImmediatePropagation: function() {
		var e = this.originalEvent;

		this.isImmediatePropagationStopped = returnTrue;

		if ( e && e.stopImmediatePropagation ) {
			e.stopImmediatePropagation();
		}

		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
// Support: Chrome 15+
jQuery.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout",
	pointerenter: "pointerover",
	pointerleave: "pointerout"
}, function( orig, fix ) {
	jQuery.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jQuery.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

// Create "bubbling" focus and blur events
// Support: Firefox, Chrome, Safari
if ( !support.focusinBubbles ) {
	jQuery.each({ focus: "focusin", blur: "focusout" }, function( orig, fix ) {

		// Attach a single capturing handler on the document while someone wants focusin/focusout
		var handler = function( event ) {
				jQuery.event.simulate( fix, event.target, jQuery.event.fix( event ), true );
			};

		jQuery.event.special[ fix ] = {
			setup: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix );

				if ( !attaches ) {
					doc.addEventListener( orig, handler, true );
				}
				data_priv.access( doc, fix, ( attaches || 0 ) + 1 );
			},
			teardown: function() {
				var doc = this.ownerDocument || this,
					attaches = data_priv.access( doc, fix ) - 1;

				if ( !attaches ) {
					doc.removeEventListener( orig, handler, true );
					data_priv.remove( doc, fix );

				} else {
					data_priv.access( doc, fix, attaches );
				}
			}
		};
	});
}

jQuery.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var origFn, type;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jQuery().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jQuery.guid++ );
		}
		return this.each( function() {
			jQuery.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jQuery.Event
			handleObj = types.handleObj;
			jQuery( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jQuery.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jQuery.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jQuery.event.trigger( type, data, elem, true );
		}
	}
});


var
	rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
	rtagName = /<([\w:]+)/,
	rhtml = /<|&#?\w+;/,
	rnoInnerhtml = /<(?:script|style|link)/i,
	// checked="checked" or checked
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,
	rscriptType = /^$|\/(?:java|ecma)script/i,
	rscriptTypeMasked = /^true\/(.*)/,
	rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,

	// We have to close these tags to support XHTML (#13200)
	wrapMap = {

		// Support: IE 9
		option: [ 1, "<select multiple='multiple'>", "</select>" ],

		thead: [ 1, "<table>", "</table>" ],
		col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

		_default: [ 0, "", "" ]
	};

// Support: IE 9
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// Support: 1.x compatibility
// Manipulating tables requires a tbody
function manipulationTarget( elem, content ) {
	return jQuery.nodeName( elem, "table" ) &&
		jQuery.nodeName( content.nodeType !== 11 ? content : content.firstChild, "tr" ) ?

		elem.getElementsByTagName("tbody")[0] ||
			elem.appendChild( elem.ownerDocument.createElement("tbody") ) :
		elem;
}

// Replace/restore the type attribute of script elements for safe DOM manipulation
function disableScript( elem ) {
	elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
	return elem;
}
function restoreScript( elem ) {
	var match = rscriptTypeMasked.exec( elem.type );

	if ( match ) {
		elem.type = match[ 1 ];
	} else {
		elem.removeAttribute("type");
	}

	return elem;
}

// Mark scripts as having already been evaluated
function setGlobalEval( elems, refElements ) {
	var i = 0,
		l = elems.length;

	for ( ; i < l; i++ ) {
		data_priv.set(
			elems[ i ], "globalEval", !refElements || data_priv.get( refElements[ i ], "globalEval" )
		);
	}
}

function cloneCopyEvent( src, dest ) {
	var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;

	if ( dest.nodeType !== 1 ) {
		return;
	}

	// 1. Copy private data: events, handlers, etc.
	if ( data_priv.hasData( src ) ) {
		pdataOld = data_priv.access( src );
		pdataCur = data_priv.set( dest, pdataOld );
		events = pdataOld.events;

		if ( events ) {
			delete pdataCur.handle;
			pdataCur.events = {};

			for ( type in events ) {
				for ( i = 0, l = events[ type ].length; i < l; i++ ) {
					jQuery.event.add( dest, type, events[ type ][ i ] );
				}
			}
		}
	}

	// 2. Copy user data
	if ( data_user.hasData( src ) ) {
		udataOld = data_user.access( src );
		udataCur = jQuery.extend( {}, udataOld );

		data_user.set( dest, udataCur );
	}
}

function getAll( context, tag ) {
	var ret = context.getElementsByTagName ? context.getElementsByTagName( tag || "*" ) :
			context.querySelectorAll ? context.querySelectorAll( tag || "*" ) :
			[];

	return tag === undefined || tag && jQuery.nodeName( context, tag ) ?
		jQuery.merge( [ context ], ret ) :
		ret;
}

// Support: IE >= 9
function fixInput( src, dest ) {
	var nodeName = dest.nodeName.toLowerCase();

	// Fails to persist the checked state of a cloned checkbox or radio button.
	if ( nodeName === "input" && rcheckableType.test( src.type ) ) {
		dest.checked = src.checked;

	// Fails to return the selected option to the default selected state when cloning options
	} else if ( nodeName === "input" || nodeName === "textarea" ) {
		dest.defaultValue = src.defaultValue;
	}
}

jQuery.extend({
	clone: function( elem, dataAndEvents, deepDataAndEvents ) {
		var i, l, srcElements, destElements,
			clone = elem.cloneNode( true ),
			inPage = jQuery.contains( elem.ownerDocument, elem );

		// Support: IE >= 9
		// Fix Cloning issues
		if ( !support.noCloneChecked && ( elem.nodeType === 1 || elem.nodeType === 11 ) &&
				!jQuery.isXMLDoc( elem ) ) {

			// We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
			destElements = getAll( clone );
			srcElements = getAll( elem );

			for ( i = 0, l = srcElements.length; i < l; i++ ) {
				fixInput( srcElements[ i ], destElements[ i ] );
			}
		}

		// Copy the events from the original to the clone
		if ( dataAndEvents ) {
			if ( deepDataAndEvents ) {
				srcElements = srcElements || getAll( elem );
				destElements = destElements || getAll( clone );

				for ( i = 0, l = srcElements.length; i < l; i++ ) {
					cloneCopyEvent( srcElements[ i ], destElements[ i ] );
				}
			} else {
				cloneCopyEvent( elem, clone );
			}
		}

		// Preserve script evaluation history
		destElements = getAll( clone, "script" );
		if ( destElements.length > 0 ) {
			setGlobalEval( destElements, !inPage && getAll( elem, "script" ) );
		}

		// Return the cloned set
		return clone;
	},

	buildFragment: function( elems, context, scripts, selection ) {
		var elem, tmp, tag, wrap, contains, j,
			fragment = context.createDocumentFragment(),
			nodes = [],
			i = 0,
			l = elems.length;

		for ( ; i < l; i++ ) {
			elem = elems[ i ];

			if ( elem || elem === 0 ) {

				// Add nodes directly
				if ( jQuery.type( elem ) === "object" ) {
					// Support: QtWebKit
					// jQuery.merge because push.apply(_, arraylike) throws
					jQuery.merge( nodes, elem.nodeType ? [ elem ] : elem );

				// Convert non-html into a text node
				} else if ( !rhtml.test( elem ) ) {
					nodes.push( context.createTextNode( elem ) );

				// Convert html into DOM nodes
				} else {
					tmp = tmp || fragment.appendChild( context.createElement("div") );

					// Deserialize a standard representation
					tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
					wrap = wrapMap[ tag ] || wrapMap._default;
					tmp.innerHTML = wrap[ 1 ] + elem.replace( rxhtmlTag, "<$1></$2>" ) + wrap[ 2 ];

					// Descend through wrappers to the right content
					j = wrap[ 0 ];
					while ( j-- ) {
						tmp = tmp.lastChild;
					}

					// Support: QtWebKit
					// jQuery.merge because push.apply(_, arraylike) throws
					jQuery.merge( nodes, tmp.childNodes );

					// Remember the top-level container
					tmp = fragment.firstChild;

					// Fixes #12346
					// Support: Webkit, IE
					tmp.textContent = "";
				}
			}
		}

		// Remove wrapper from fragment
		fragment.textContent = "";

		i = 0;
		while ( (elem = nodes[ i++ ]) ) {

			// #4087 - If origin and destination elements are the same, and this is
			// that element, do not do anything
			if ( selection && jQuery.inArray( elem, selection ) !== -1 ) {
				continue;
			}

			contains = jQuery.contains( elem.ownerDocument, elem );

			// Append to fragment
			tmp = getAll( fragment.appendChild( elem ), "script" );

			// Preserve script evaluation history
			if ( contains ) {
				setGlobalEval( tmp );
			}

			// Capture executables
			if ( scripts ) {
				j = 0;
				while ( (elem = tmp[ j++ ]) ) {
					if ( rscriptType.test( elem.type || "" ) ) {
						scripts.push( elem );
					}
				}
			}
		}

		return fragment;
	},

	cleanData: function( elems ) {
		var data, elem, type, key,
			special = jQuery.event.special,
			i = 0;

		for ( ; (elem = elems[ i ]) !== undefined; i++ ) {
			if ( jQuery.acceptData( elem ) ) {
				key = elem[ data_priv.expando ];

				if ( key && (data = data_priv.cache[ key ]) ) {
					if ( data.events ) {
						for ( type in data.events ) {
							if ( special[ type ] ) {
								jQuery.event.remove( elem, type );

							// This is a shortcut to avoid jQuery.event.remove's overhead
							} else {
								jQuery.removeEvent( elem, type, data.handle );
							}
						}
					}
					if ( data_priv.cache[ key ] ) {
						// Discard any remaining `private` data
						delete data_priv.cache[ key ];
					}
				}
			}
			// Discard any remaining `user` data
			delete data_user.cache[ elem[ data_user.expando ] ];
		}
	}
});

jQuery.fn.extend({
	text: function( value ) {
		return access( this, function( value ) {
			return value === undefined ?
				jQuery.text( this ) :
				this.empty().each(function() {
					if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
						this.textContent = value;
					}
				});
		}, null, value, arguments.length );
	},

	append: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.appendChild( elem );
			}
		});
	},

	prepend: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9 ) {
				var target = manipulationTarget( this, elem );
				target.insertBefore( elem, target.firstChild );
			}
		});
	},

	before: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this );
			}
		});
	},

	after: function() {
		return this.domManip( arguments, function( elem ) {
			if ( this.parentNode ) {
				this.parentNode.insertBefore( elem, this.nextSibling );
			}
		});
	},

	remove: function( selector, keepData /* Internal Use Only */ ) {
		var elem,
			elems = selector ? jQuery.filter( selector, this ) : this,
			i = 0;

		for ( ; (elem = elems[i]) != null; i++ ) {
			if ( !keepData && elem.nodeType === 1 ) {
				jQuery.cleanData( getAll( elem ) );
			}

			if ( elem.parentNode ) {
				if ( keepData && jQuery.contains( elem.ownerDocument, elem ) ) {
					setGlobalEval( getAll( elem, "script" ) );
				}
				elem.parentNode.removeChild( elem );
			}
		}

		return this;
	},

	empty: function() {
		var elem,
			i = 0;

		for ( ; (elem = this[i]) != null; i++ ) {
			if ( elem.nodeType === 1 ) {

				// Prevent memory leaks
				jQuery.cleanData( getAll( elem, false ) );

				// Remove any remaining nodes
				elem.textContent = "";
			}
		}

		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map(function() {
			return jQuery.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	html: function( value ) {
		return access( this, function( value ) {
			var elem = this[ 0 ] || {},
				i = 0,
				l = this.length;

			if ( value === undefined && elem.nodeType === 1 ) {
				return elem.innerHTML;
			}

			// See if we can take a shortcut and just use innerHTML
			if ( typeof value === "string" && !rnoInnerhtml.test( value ) &&
				!wrapMap[ ( rtagName.exec( value ) || [ "", "" ] )[ 1 ].toLowerCase() ] ) {

				value = value.replace( rxhtmlTag, "<$1></$2>" );

				try {
					for ( ; i < l; i++ ) {
						elem = this[ i ] || {};

						// Remove element nodes and prevent memory leaks
						if ( elem.nodeType === 1 ) {
							jQuery.cleanData( getAll( elem, false ) );
							elem.innerHTML = value;
						}
					}

					elem = 0;

				// If using innerHTML throws an exception, use the fallback method
				} catch( e ) {}
			}

			if ( elem ) {
				this.empty().append( value );
			}
		}, null, value, arguments.length );
	},

	replaceWith: function() {
		var arg = arguments[ 0 ];

		// Make the changes, replacing each context element with the new content
		this.domManip( arguments, function( elem ) {
			arg = this.parentNode;

			jQuery.cleanData( getAll( this ) );

			if ( arg ) {
				arg.replaceChild( elem, this );
			}
		});

		// Force removal if there was no new content (e.g., from empty arguments)
		return arg && (arg.length || arg.nodeType) ? this : this.remove();
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {

		// Flatten any nested arrays
		args = concat.apply( [], args );

		var fragment, first, scripts, hasScripts, node, doc,
			i = 0,
			l = this.length,
			set = this,
			iNoClone = l - 1,
			value = args[ 0 ],
			isFunction = jQuery.isFunction( value );

		// We can't cloneNode fragments that contain checked, in WebKit
		if ( isFunction ||
				( l > 1 && typeof value === "string" &&
					!support.checkClone && rchecked.test( value ) ) ) {
			return this.each(function( index ) {
				var self = set.eq( index );
				if ( isFunction ) {
					args[ 0 ] = value.call( this, index, self.html() );
				}
				self.domManip( args, callback );
			});
		}

		if ( l ) {
			fragment = jQuery.buildFragment( args, this[ 0 ].ownerDocument, false, this );
			first = fragment.firstChild;

			if ( fragment.childNodes.length === 1 ) {
				fragment = first;
			}

			if ( first ) {
				scripts = jQuery.map( getAll( fragment, "script" ), disableScript );
				hasScripts = scripts.length;

				// Use the original fragment for the last item instead of the first because it can end up
				// being emptied incorrectly in certain situations (#8070).
				for ( ; i < l; i++ ) {
					node = fragment;

					if ( i !== iNoClone ) {
						node = jQuery.clone( node, true, true );

						// Keep references to cloned scripts for later restoration
						if ( hasScripts ) {
							// Support: QtWebKit
							// jQuery.merge because push.apply(_, arraylike) throws
							jQuery.merge( scripts, getAll( node, "script" ) );
						}
					}

					callback.call( this[ i ], node, i );
				}

				if ( hasScripts ) {
					doc = scripts[ scripts.length - 1 ].ownerDocument;

					// Reenable scripts
					jQuery.map( scripts, restoreScript );

					// Evaluate executable scripts on first document insertion
					for ( i = 0; i < hasScripts; i++ ) {
						node = scripts[ i ];
						if ( rscriptType.test( node.type || "" ) &&
							!data_priv.access( node, "globalEval" ) && jQuery.contains( doc, node ) ) {

							if ( node.src ) {
								// Optional AJAX dependency, but won't run scripts if not present
								if ( jQuery._evalUrl ) {
									jQuery._evalUrl( node.src );
								}
							} else {
								jQuery.globalEval( node.textContent.replace( rcleanScript, "" ) );
							}
						}
					}
				}
			}
		}

		return this;
	}
});

jQuery.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jQuery.fn[ name ] = function( selector ) {
		var elems,
			ret = [],
			insert = jQuery( selector ),
			last = insert.length - 1,
			i = 0;

		for ( ; i <= last; i++ ) {
			elems = i === last ? this : this.clone( true );
			jQuery( insert[ i ] )[ original ]( elems );

			// Support: QtWebKit
			// .get() because push.apply(_, arraylike) throws
			push.apply( ret, elems.get() );
		}

		return this.pushStack( ret );
	};
});


var iframe,
	elemdisplay = {};

/**
 * Retrieve the actual display of a element
 * @param {String} name nodeName of the element
 * @param {Object} doc Document object
 */
// Called only from within defaultDisplay
function actualDisplay( name, doc ) {
	var style,
		elem = jQuery( doc.createElement( name ) ).appendTo( doc.body ),

		// getDefaultComputedStyle might be reliably used only on attached element
		display = window.getDefaultComputedStyle && ( style = window.getDefaultComputedStyle( elem[ 0 ] ) ) ?

			// Use of this method is a temporary fix (more like optmization) until something better comes along,
			// since it was removed from specification and supported only in FF
			style.display : jQuery.css( elem[ 0 ], "display" );

	// We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();

	return display;
}

/**
 * Try to determine the default display value of an element
 * @param {String} nodeName
 */
function defaultDisplay( nodeName ) {
	var doc = document,
		display = elemdisplay[ nodeName ];

	if ( !display ) {
		display = actualDisplay( nodeName, doc );

		// If the simple way fails, read from inside an iframe
		if ( display === "none" || !display ) {

			// Use the already-created iframe if possible
			iframe = (iframe || jQuery( "<iframe frameborder='0' width='0' height='0'/>" )).appendTo( doc.documentElement );

			// Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
			doc = iframe[ 0 ].contentDocument;

			// Support: IE
			doc.write();
			doc.close();

			display = actualDisplay( nodeName, doc );
			iframe.detach();
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return display;
}
var rmargin = (/^margin/);

var rnumnonpx = new RegExp( "^(" + pnum + ")(?!px)[a-z%]+$", "i" );

var getStyles = function( elem ) {
		return elem.ownerDocument.defaultView.getComputedStyle( elem, null );
	};



function curCSS( elem, name, computed ) {
	var width, minWidth, maxWidth, ret,
		style = elem.style;

	computed = computed || getStyles( elem );

	// Support: IE9
	// getPropertyValue is only needed for .css('filter') in IE9, see #12537
	if ( computed ) {
		ret = computed.getPropertyValue( name ) || computed[ name ];
	}

	if ( computed ) {

		if ( ret === "" && !jQuery.contains( elem.ownerDocument, elem ) ) {
			ret = jQuery.style( elem, name );
		}

		// Support: iOS < 6
		// A tribute to the "awesome hack by Dean Edwards"
		// iOS < 6 (at least) returns percentage for a larger set of values, but width seems to be reliably pixels
		// this is against the CSSOM draft spec: http://dev.w3.org/csswg/cssom/#resolved-values
		if ( rnumnonpx.test( ret ) && rmargin.test( name ) ) {

			// Remember the original values
			width = style.width;
			minWidth = style.minWidth;
			maxWidth = style.maxWidth;

			// Put in the new values to get a computed value out
			style.minWidth = style.maxWidth = style.width = ret;
			ret = computed.width;

			// Revert the changed values
			style.width = width;
			style.minWidth = minWidth;
			style.maxWidth = maxWidth;
		}
	}

	return ret !== undefined ?
		// Support: IE
		// IE returns zIndex value as an integer.
		ret + "" :
		ret;
}


function addGetHookIf( conditionFn, hookFn ) {
	// Define the hook, we'll check on the first run if it's really needed.
	return {
		get: function() {
			if ( conditionFn() ) {
				// Hook not needed (or it's not possible to use it due to missing dependency),
				// remove it.
				// Since there are no other hooks for marginRight, remove the whole object.
				delete this.get;
				return;
			}

			// Hook needed; redefine it so that the support test is not executed again.

			return (this.get = hookFn).apply( this, arguments );
		}
	};
}


(function() {
	var pixelPositionVal, boxSizingReliableVal,
		docElem = document.documentElement,
		container = document.createElement( "div" ),
		div = document.createElement( "div" );

	if ( !div.style ) {
		return;
	}

	div.style.backgroundClip = "content-box";
	div.cloneNode( true ).style.backgroundClip = "";
	support.clearCloneStyle = div.style.backgroundClip === "content-box";

	container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;" +
		"position:absolute";
	container.appendChild( div );

	// Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computePixelPositionAndBoxSizingReliable() {
		div.style.cssText =
			// Support: Firefox<29, Android 2.3
			// Vendor-prefix box-sizing
			"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;" +
			"box-sizing:border-box;display:block;margin-top:1%;top:1%;" +
			"border:1px;padding:1px;width:4px;position:absolute";
		div.innerHTML = "";
		docElem.appendChild( container );

		var divStyle = window.getComputedStyle( div, null );
		pixelPositionVal = divStyle.top !== "1%";
		boxSizingReliableVal = divStyle.width === "4px";

		docElem.removeChild( container );
	}

	// Support: node.js jsdom
	// Don't assume that getComputedStyle is a property of the global object
	if ( window.getComputedStyle ) {
		jQuery.extend( support, {
			pixelPosition: function() {
				// This test is executed only once but we still do memoizing
				// since we can use the boxSizingReliable pre-computing.
				// No need to check if the test was already performed, though.
				computePixelPositionAndBoxSizingReliable();
				return pixelPositionVal;
			},
			boxSizingReliable: function() {
				if ( boxSizingReliableVal == null ) {
					computePixelPositionAndBoxSizingReliable();
				}
				return boxSizingReliableVal;
			},
			reliableMarginRight: function() {
				// Support: Android 2.3
				// Check if div with explicit width and no margin-right incorrectly
				// gets computed margin-right based on width of container. (#3333)
				// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
				// This support function is only executed once so no memoizing is needed.
				var ret,
					marginDiv = div.appendChild( document.createElement( "div" ) );

				// Reset CSS: box-sizing; display; margin; border; padding
				marginDiv.style.cssText = div.style.cssText =
					// Support: Firefox<29, Android 2.3
					// Vendor-prefix box-sizing
					"-webkit-box-sizing:content-box;-moz-box-sizing:content-box;" +
					"box-sizing:content-box;display:block;margin:0;border:0;padding:0";
				marginDiv.style.marginRight = marginDiv.style.width = "0";
				div.style.width = "1px";
				docElem.appendChild( container );

				ret = !parseFloat( window.getComputedStyle( marginDiv, null ).marginRight );

				docElem.removeChild( container );

				return ret;
			}
		});
	}
})();


// A method for quickly swapping in/out CSS properties to get correct calculations.
jQuery.swap = function( elem, options, callback, args ) {
	var ret, name,
		old = {};

	// Remember the old values, and insert the new ones
	for ( name in options ) {
		old[ name ] = elem.style[ name ];
		elem.style[ name ] = options[ name ];
	}

	ret = callback.apply( elem, args || [] );

	// Revert the old values
	for ( name in options ) {
		elem.style[ name ] = old[ name ];
	}

	return ret;
};


var
	// swappable if display is none or starts with table except "table", "table-cell", or "table-caption"
	// see here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap = /^(none|table(?!-c[ea]).+)/,
	rnumsplit = new RegExp( "^(" + pnum + ")(.*)$", "i" ),
	rrelNum = new RegExp( "^([+-])=(" + pnum + ")", "i" ),

	cssShow = { position: "absolute", visibility: "hidden", display: "block" },
	cssNormalTransform = {
		letterSpacing: "0",
		fontWeight: "400"
	},

	cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];

// return a css property mapped to a potentially vendor prefixed property
function vendorPropName( style, name ) {

	// shortcut for names that are not vendor prefixed
	if ( name in style ) {
		return name;
	}

	// check for vendor prefixed names
	var capName = name[0].toUpperCase() + name.slice(1),
		origName = name,
		i = cssPrefixes.length;

	while ( i-- ) {
		name = cssPrefixes[ i ] + capName;
		if ( name in style ) {
			return name;
		}
	}

	return origName;
}

function setPositiveNumber( elem, value, subtract ) {
	var matches = rnumsplit.exec( value );
	return matches ?
		// Guard against undefined "subtract", e.g., when used as in cssHooks
		Math.max( 0, matches[ 1 ] - ( subtract || 0 ) ) + ( matches[ 2 ] || "px" ) :
		value;
}

function augmentWidthOrHeight( elem, name, extra, isBorderBox, styles ) {
	var i = extra === ( isBorderBox ? "border" : "content" ) ?
		// If we already have the right measurement, avoid augmentation
		4 :
		// Otherwise initialize for horizontal or vertical properties
		name === "width" ? 1 : 0,

		val = 0;

	for ( ; i < 4; i += 2 ) {
		// both box models exclude margin, so add it if we want it
		if ( extra === "margin" ) {
			val += jQuery.css( elem, extra + cssExpand[ i ], true, styles );
		}

		if ( isBorderBox ) {
			// border-box includes padding, so remove it if we want content
			if ( extra === "content" ) {
				val -= jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );
			}

			// at this point, extra isn't border nor margin, so remove border
			if ( extra !== "margin" ) {
				val -= jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		} else {
			// at this point, extra isn't content, so add padding
			val += jQuery.css( elem, "padding" + cssExpand[ i ], true, styles );

			// at this point, extra isn't content nor padding, so add border
			if ( extra !== "padding" ) {
				val += jQuery.css( elem, "border" + cssExpand[ i ] + "Width", true, styles );
			}
		}
	}

	return val;
}

function getWidthOrHeight( elem, name, extra ) {

	// Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox = true,
		val = name === "width" ? elem.offsetWidth : elem.offsetHeight,
		styles = getStyles( elem ),
		isBorderBox = jQuery.css( elem, "boxSizing", false, styles ) === "border-box";

	// some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if ( val <= 0 || val == null ) {
		// Fall back to computed then uncomputed css if necessary
		val = curCSS( elem, name, styles );
		if ( val < 0 || val == null ) {
			val = elem.style[ name ];
		}

		// Computed unit is not pixels. Stop here and return.
		if ( rnumnonpx.test(val) ) {
			return val;
		}

		// we need the check for style in case a browser which returns unreliable values
		// for getComputedStyle silently falls back to the reliable elem.style
		valueIsBorderBox = isBorderBox &&
			( support.boxSizingReliable() || val === elem.style[ name ] );

		// Normalize "", auto, and prepare for extra
		val = parseFloat( val ) || 0;
	}

	// use the active box-sizing model to add/subtract irrelevant styles
	return ( val +
		augmentWidthOrHeight(
			elem,
			name,
			extra || ( isBorderBox ? "border" : "content" ),
			valueIsBorderBox,
			styles
		)
	) + "px";
}

function showHide( elements, show ) {
	var display, elem, hidden,
		values = [],
		index = 0,
		length = elements.length;

	for ( ; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}

		values[ index ] = data_priv.get( elem, "olddisplay" );
		display = elem.style.display;
		if ( show ) {
			// Reset the inline display of this element to learn if it is
			// being hidden by cascaded rules or not
			if ( !values[ index ] && display === "none" ) {
				elem.style.display = "";
			}

			// Set elements which have been overridden with display: none
			// in a stylesheet to whatever the default browser style is
			// for such an element
			if ( elem.style.display === "" && isHidden( elem ) ) {
				values[ index ] = data_priv.access( elem, "olddisplay", defaultDisplay(elem.nodeName) );
			}
		} else {
			hidden = isHidden( elem );

			if ( display !== "none" || !hidden ) {
				data_priv.set( elem, "olddisplay", hidden ? display : jQuery.css( elem, "display" ) );
			}
		}
	}

	// Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for ( index = 0; index < length; index++ ) {
		elem = elements[ index ];
		if ( !elem.style ) {
			continue;
		}
		if ( !show || elem.style.display === "none" || elem.style.display === "" ) {
			elem.style.display = show ? values[ index ] || "" : "none";
		}
	}

	return elements;
}

jQuery.extend({
	// Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks: {
		opacity: {
			get: function( elem, computed ) {
				if ( computed ) {
					// We should always get a number back from opacity
					var ret = curCSS( elem, "opacity" );
					return ret === "" ? "1" : ret;
				}
			}
		}
	},

	// Don't automatically add "px" to these possibly-unitless properties
	cssNumber: {
		"columnCount": true,
		"fillOpacity": true,
		"flexGrow": true,
		"flexShrink": true,
		"fontWeight": true,
		"lineHeight": true,
		"opacity": true,
		"order": true,
		"orphans": true,
		"widows": true,
		"zIndex": true,
		"zoom": true
	},

	// Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps: {
		// normalize float css property
		"float": "cssFloat"
	},

	// Get and set the style property on a DOM Node
	style: function( elem, name, value, extra ) {
		// Don't set styles on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style ) {
			return;
		}

		// Make sure that we're working with the right name
		var ret, type, hooks,
			origName = jQuery.camelCase( name ),
			style = elem.style;

		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// Check if we're setting a value
		if ( value !== undefined ) {
			type = typeof value;

			// convert relative number strings (+= or -=) to relative numbers. #7345
			if ( type === "string" && (ret = rrelNum.exec( value )) ) {
				value = ( ret[1] + 1 ) * ret[2] + parseFloat( jQuery.css( elem, name ) );
				// Fixes bug #9237
				type = "number";
			}

			// Make sure that null and NaN values aren't set. See: #7116
			if ( value == null || value !== value ) {
				return;
			}

			// If a number was passed in, add 'px' to the (except for certain CSS properties)
			if ( type === "number" && !jQuery.cssNumber[ origName ] ) {
				value += "px";
			}

			// Fixes #8908, it can be done more correctly by specifying setters in cssHooks,
			// but it would mean to define eight (for every problematic property) identical functions
			if ( !support.clearCloneStyle && value === "" && name.indexOf( "background" ) === 0 ) {
				style[ name ] = "inherit";
			}

			// If a hook was provided, use that value, otherwise just set the specified value
			if ( !hooks || !("set" in hooks) || (value = hooks.set( elem, value, extra )) !== undefined ) {
				style[ name ] = value;
			}

		} else {
			// If a hook was provided get the non-computed value from there
			if ( hooks && "get" in hooks && (ret = hooks.get( elem, false, extra )) !== undefined ) {
				return ret;
			}

			// Otherwise just get the value from the style object
			return style[ name ];
		}
	},

	css: function( elem, name, extra, styles ) {
		var val, num, hooks,
			origName = jQuery.camelCase( name );

		// Make sure that we're working with the right name
		name = jQuery.cssProps[ origName ] || ( jQuery.cssProps[ origName ] = vendorPropName( elem.style, origName ) );

		// gets hook for the prefixed version
		// followed by the unprefixed version
		hooks = jQuery.cssHooks[ name ] || jQuery.cssHooks[ origName ];

		// If a hook was provided get the computed value from there
		if ( hooks && "get" in hooks ) {
			val = hooks.get( elem, true, extra );
		}

		// Otherwise, if a way to get the computed value exists, use that
		if ( val === undefined ) {
			val = curCSS( elem, name, styles );
		}

		//convert "normal" to computed value
		if ( val === "normal" && name in cssNormalTransform ) {
			val = cssNormalTransform[ name ];
		}

		// Return, converting to number if forced or a qualifier was provided and val looks numeric
		if ( extra === "" || extra ) {
			num = parseFloat( val );
			return extra === true || jQuery.isNumeric( num ) ? num || 0 : val;
		}
		return val;
	}
});

jQuery.each([ "height", "width" ], function( i, name ) {
	jQuery.cssHooks[ name ] = {
		get: function( elem, computed, extra ) {
			if ( computed ) {
				// certain elements can have dimension info if we invisibly show them
				// however, it must have a current display style that would benefit from this
				return rdisplayswap.test( jQuery.css( elem, "display" ) ) && elem.offsetWidth === 0 ?
					jQuery.swap( elem, cssShow, function() {
						return getWidthOrHeight( elem, name, extra );
					}) :
					getWidthOrHeight( elem, name, extra );
			}
		},

		set: function( elem, value, extra ) {
			var styles = extra && getStyles( elem );
			return setPositiveNumber( elem, value, extra ?
				augmentWidthOrHeight(
					elem,
					name,
					extra,
					jQuery.css( elem, "boxSizing", false, styles ) === "border-box",
					styles
				) : 0
			);
		}
	};
});

// Support: Android 2.3
jQuery.cssHooks.marginRight = addGetHookIf( support.reliableMarginRight,
	function( elem, computed ) {
		if ( computed ) {
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			// Work around by temporarily setting element display to inline-block
			return jQuery.swap( elem, { "display": "inline-block" },
				curCSS, [ elem, "marginRight" ] );
		}
	}
);

// These hooks are used by animate to expand properties
jQuery.each({
	margin: "",
	padding: "",
	border: "Width"
}, function( prefix, suffix ) {
	jQuery.cssHooks[ prefix + suffix ] = {
		expand: function( value ) {
			var i = 0,
				expanded = {},

				// assumes a single number if not a string
				parts = typeof value === "string" ? value.split(" ") : [ value ];

			for ( ; i < 4; i++ ) {
				expanded[ prefix + cssExpand[ i ] + suffix ] =
					parts[ i ] || parts[ i - 2 ] || parts[ 0 ];
			}

			return expanded;
		}
	};

	if ( !rmargin.test( prefix ) ) {
		jQuery.cssHooks[ prefix + suffix ].set = setPositiveNumber;
	}
});

jQuery.fn.extend({
	css: function( name, value ) {
		return access( this, function( elem, name, value ) {
			var styles, len,
				map = {},
				i = 0;

			if ( jQuery.isArray( name ) ) {
				styles = getStyles( elem );
				len = name.length;

				for ( ; i < len; i++ ) {
					map[ name[ i ] ] = jQuery.css( elem, name[ i ], false, styles );
				}

				return map;
			}

			return value !== undefined ?
				jQuery.style( elem, name, value ) :
				jQuery.css( elem, name );
		}, name, value, arguments.length > 1 );
	},
	show: function() {
		return showHide( this, true );
	},
	hide: function() {
		return showHide( this );
	},
	toggle: function( state ) {
		if ( typeof state === "boolean" ) {
			return state ? this.show() : this.hide();
		}

		return this.each(function() {
			if ( isHidden( this ) ) {
				jQuery( this ).show();
			} else {
				jQuery( this ).hide();
			}
		});
	}
});


function Tween( elem, options, prop, end, easing ) {
	return new Tween.prototype.init( elem, options, prop, end, easing );
}
jQuery.Tween = Tween;

Tween.prototype = {
	constructor: Tween,
	init: function( elem, options, prop, end, easing, unit ) {
		this.elem = elem;
		this.prop = prop;
		this.easing = easing || "swing";
		this.options = options;
		this.start = this.now = this.cur();
		this.end = end;
		this.unit = unit || ( jQuery.cssNumber[ prop ] ? "" : "px" );
	},
	cur: function() {
		var hooks = Tween.propHooks[ this.prop ];

		return hooks && hooks.get ?
			hooks.get( this ) :
			Tween.propHooks._default.get( this );
	},
	run: function( percent ) {
		var eased,
			hooks = Tween.propHooks[ this.prop ];

		if ( this.options.duration ) {
			this.pos = eased = jQuery.easing[ this.easing ](
				percent, this.options.duration * percent, 0, 1, this.options.duration
			);
		} else {
			this.pos = eased = percent;
		}
		this.now = ( this.end - this.start ) * eased + this.start;

		if ( this.options.step ) {
			this.options.step.call( this.elem, this.now, this );
		}

		if ( hooks && hooks.set ) {
			hooks.set( this );
		} else {
			Tween.propHooks._default.set( this );
		}
		return this;
	}
};

Tween.prototype.init.prototype = Tween.prototype;

Tween.propHooks = {
	_default: {
		get: function( tween ) {
			var result;

			if ( tween.elem[ tween.prop ] != null &&
				(!tween.elem.style || tween.elem.style[ tween.prop ] == null) ) {
				return tween.elem[ tween.prop ];
			}

			// passing an empty string as a 3rd parameter to .css will automatically
			// attempt a parseFloat and fallback to a string if the parse fails
			// so, simple values such as "10px" are parsed to Float.
			// complex values such as "rotate(1rad)" are returned as is.
			result = jQuery.css( tween.elem, tween.prop, "" );
			// Empty strings, null, undefined and "auto" are converted to 0.
			return !result || result === "auto" ? 0 : result;
		},
		set: function( tween ) {
			// use step hook for back compat - use cssHook if its there - use .style if its
			// available and use plain properties where available
			if ( jQuery.fx.step[ tween.prop ] ) {
				jQuery.fx.step[ tween.prop ]( tween );
			} else if ( tween.elem.style && ( tween.elem.style[ jQuery.cssProps[ tween.prop ] ] != null || jQuery.cssHooks[ tween.prop ] ) ) {
				jQuery.style( tween.elem, tween.prop, tween.now + tween.unit );
			} else {
				tween.elem[ tween.prop ] = tween.now;
			}
		}
	}
};

// Support: IE9
// Panic based approach to setting things on disconnected nodes

Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
	set: function( tween ) {
		if ( tween.elem.nodeType && tween.elem.parentNode ) {
			tween.elem[ tween.prop ] = tween.now;
		}
	}
};

jQuery.easing = {
	linear: function( p ) {
		return p;
	},
	swing: function( p ) {
		return 0.5 - Math.cos( p * Math.PI ) / 2;
	}
};

jQuery.fx = Tween.prototype.init;

// Back Compat <1.8 extension point
jQuery.fx.step = {};




var
	fxNow, timerId,
	rfxtypes = /^(?:toggle|show|hide)$/,
	rfxnum = new RegExp( "^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i" ),
	rrun = /queueHooks$/,
	animationPrefilters = [ defaultPrefilter ],
	tweeners = {
		"*": [ function( prop, value ) {
			var tween = this.createTween( prop, value ),
				target = tween.cur(),
				parts = rfxnum.exec( value ),
				unit = parts && parts[ 3 ] || ( jQuery.cssNumber[ prop ] ? "" : "px" ),

				// Starting value computation is required for potential unit mismatches
				start = ( jQuery.cssNumber[ prop ] || unit !== "px" && +target ) &&
					rfxnum.exec( jQuery.css( tween.elem, prop ) ),
				scale = 1,
				maxIterations = 20;

			if ( start && start[ 3 ] !== unit ) {
				// Trust units reported by jQuery.css
				unit = unit || start[ 3 ];

				// Make sure we update the tween properties later on
				parts = parts || [];

				// Iteratively approximate from a nonzero starting point
				start = +target || 1;

				do {
					// If previous iteration zeroed out, double until we get *something*
					// Use a string for doubling factor so we don't accidentally see scale as unchanged below
					scale = scale || ".5";

					// Adjust and apply
					start = start / scale;
					jQuery.style( tween.elem, prop, start + unit );

				// Update scale, tolerating zero or NaN from tween.cur()
				// And breaking the loop if scale is unchanged or perfect, or if we've just had enough
				} while ( scale !== (scale = tween.cur() / target) && scale !== 1 && --maxIterations );
			}

			// Update tween properties
			if ( parts ) {
				start = tween.start = +start || +target || 0;
				tween.unit = unit;
				// If a +=/-= token was provided, we're doing a relative animation
				tween.end = parts[ 1 ] ?
					start + ( parts[ 1 ] + 1 ) * parts[ 2 ] :
					+parts[ 2 ];
			}

			return tween;
		} ]
	};

// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout(function() {
		fxNow = undefined;
	});
	return ( fxNow = jQuery.now() );
}

// Generate parameters to create a standard animation
function genFx( type, includeWidth ) {
	var which,
		i = 0,
		attrs = { height: type };

	// if we include width, step value is 1 to do all cssExpand values,
	// if we don't include width, step value is 2 to skip over Left and Right
	includeWidth = includeWidth ? 1 : 0;
	for ( ; i < 4 ; i += 2 - includeWidth ) {
		which = cssExpand[ i ];
		attrs[ "margin" + which ] = attrs[ "padding" + which ] = type;
	}

	if ( includeWidth ) {
		attrs.opacity = attrs.width = type;
	}

	return attrs;
}

function createTween( value, prop, animation ) {
	var tween,
		collection = ( tweeners[ prop ] || [] ).concat( tweeners[ "*" ] ),
		index = 0,
		length = collection.length;
	for ( ; index < length; index++ ) {
		if ( (tween = collection[ index ].call( animation, prop, value )) ) {

			// we're done with this property
			return tween;
		}
	}
}

function defaultPrefilter( elem, props, opts ) {
	/* jshint validthis: true */
	var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay,
		anim = this,
		orig = {},
		style = elem.style,
		hidden = elem.nodeType && isHidden( elem ),
		dataShow = data_priv.get( elem, "fxshow" );

	// handle queue: false promises
	if ( !opts.queue ) {
		hooks = jQuery._queueHooks( elem, "fx" );
		if ( hooks.unqueued == null ) {
			hooks.unqueued = 0;
			oldfire = hooks.empty.fire;
			hooks.empty.fire = function() {
				if ( !hooks.unqueued ) {
					oldfire();
				}
			};
		}
		hooks.unqueued++;

		anim.always(function() {
			// doing this makes sure that the complete handler will be called
			// before this completes
			anim.always(function() {
				hooks.unqueued--;
				if ( !jQuery.queue( elem, "fx" ).length ) {
					hooks.empty.fire();
				}
			});
		});
	}

	// height/width overflow pass
	if ( elem.nodeType === 1 && ( "height" in props || "width" in props ) ) {
		// Make sure that nothing sneaks out
		// Record all 3 overflow attributes because IE9-10 do not
		// change the overflow attribute when overflowX and
		// overflowY are set to the same value
		opts.overflow = [ style.overflow, style.overflowX, style.overflowY ];

		// Set display property to inline-block for height/width
		// animations on inline elements that are having width/height animated
		display = jQuery.css( elem, "display" );

		// Test default display if display is currently "none"
		checkDisplay = display === "none" ?
			data_priv.get( elem, "olddisplay" ) || defaultDisplay( elem.nodeName ) : display;

		if ( checkDisplay === "inline" && jQuery.css( elem, "float" ) === "none" ) {
			style.display = "inline-block";
		}
	}

	if ( opts.overflow ) {
		style.overflow = "hidden";
		anim.always(function() {
			style.overflow = opts.overflow[ 0 ];
			style.overflowX = opts.overflow[ 1 ];
			style.overflowY = opts.overflow[ 2 ];
		});
	}

	// show/hide pass
	for ( prop in props ) {
		value = props[ prop ];
		if ( rfxtypes.exec( value ) ) {
			delete props[ prop ];
			toggle = toggle || value === "toggle";
			if ( value === ( hidden ? "hide" : "show" ) ) {

				// If there is dataShow left over from a stopped hide or show and we are going to proceed with show, we should pretend to be hidden
				if ( value === "show" && dataShow && dataShow[ prop ] !== undefined ) {
					hidden = true;
				} else {
					continue;
				}
			}
			orig[ prop ] = dataShow && dataShow[ prop ] || jQuery.style( elem, prop );

		// Any non-fx value stops us from restoring the original display value
		} else {
			display = undefined;
		}
	}

	if ( !jQuery.isEmptyObject( orig ) ) {
		if ( dataShow ) {
			if ( "hidden" in dataShow ) {
				hidden = dataShow.hidden;
			}
		} else {
			dataShow = data_priv.access( elem, "fxshow", {} );
		}

		// store state if its toggle - enables .stop().toggle() to "reverse"
		if ( toggle ) {
			dataShow.hidden = !hidden;
		}
		if ( hidden ) {
			jQuery( elem ).show();
		} else {
			anim.done(function() {
				jQuery( elem ).hide();
			});
		}
		anim.done(function() {
			var prop;

			data_priv.remove( elem, "fxshow" );
			for ( prop in orig ) {
				jQuery.style( elem, prop, orig[ prop ] );
			}
		});
		for ( prop in orig ) {
			tween = createTween( hidden ? dataShow[ prop ] : 0, prop, anim );

			if ( !( prop in dataShow ) ) {
				dataShow[ prop ] = tween.start;
				if ( hidden ) {
					tween.end = tween.start;
					tween.start = prop === "width" || prop === "height" ? 1 : 0;
				}
			}
		}

	// If this is a noop like .hide().hide(), restore an overwritten display value
	} else if ( (display === "none" ? defaultDisplay( elem.nodeName ) : display) === "inline" ) {
		style.display = display;
	}
}

function propFilter( props, specialEasing ) {
	var index, name, easing, value, hooks;

	// camelCase, specialEasing and expand cssHook pass
	for ( index in props ) {
		name = jQuery.camelCase( index );
		easing = specialEasing[ name ];
		value = props[ index ];
		if ( jQuery.isArray( value ) ) {
			easing = value[ 1 ];
			value = props[ index ] = value[ 0 ];
		}

		if ( index !== name ) {
			props[ name ] = value;
			delete props[ index ];
		}

		hooks = jQuery.cssHooks[ name ];
		if ( hooks && "expand" in hooks ) {
			value = hooks.expand( value );
			delete props[ name ];

			// not quite $.extend, this wont overwrite keys already present.
			// also - reusing 'index' from above because we have the correct "name"
			for ( index in value ) {
				if ( !( index in props ) ) {
					props[ index ] = value[ index ];
					specialEasing[ index ] = easing;
				}
			}
		} else {
			specialEasing[ name ] = easing;
		}
	}
}

function Animation( elem, properties, options ) {
	var result,
		stopped,
		index = 0,
		length = animationPrefilters.length,
		deferred = jQuery.Deferred().always( function() {
			// don't match elem in the :animated selector
			delete tick.elem;
		}),
		tick = function() {
			if ( stopped ) {
				return false;
			}
			var currentTime = fxNow || createFxNow(),
				remaining = Math.max( 0, animation.startTime + animation.duration - currentTime ),
				// archaic crash bug won't allow us to use 1 - ( 0.5 || 0 ) (#12497)
				temp = remaining / animation.duration || 0,
				percent = 1 - temp,
				index = 0,
				length = animation.tweens.length;

			for ( ; index < length ; index++ ) {
				animation.tweens[ index ].run( percent );
			}

			deferred.notifyWith( elem, [ animation, percent, remaining ]);

			if ( percent < 1 && length ) {
				return remaining;
			} else {
				deferred.resolveWith( elem, [ animation ] );
				return false;
			}
		},
		animation = deferred.promise({
			elem: elem,
			props: jQuery.extend( {}, properties ),
			opts: jQuery.extend( true, { specialEasing: {} }, options ),
			originalProperties: properties,
			originalOptions: options,
			startTime: fxNow || createFxNow(),
			duration: options.duration,
			tweens: [],
			createTween: function( prop, end ) {
				var tween = jQuery.Tween( elem, animation.opts, prop, end,
						animation.opts.specialEasing[ prop ] || animation.opts.easing );
				animation.tweens.push( tween );
				return tween;
			},
			stop: function( gotoEnd ) {
				var index = 0,
					// if we are going to the end, we want to run all the tweens
					// otherwise we skip this part
					length = gotoEnd ? animation.tweens.length : 0;
				if ( stopped ) {
					return this;
				}
				stopped = true;
				for ( ; index < length ; index++ ) {
					animation.tweens[ index ].run( 1 );
				}

				// resolve when we played the last frame
				// otherwise, reject
				if ( gotoEnd ) {
					deferred.resolveWith( elem, [ animation, gotoEnd ] );
				} else {
					deferred.rejectWith( elem, [ animation, gotoEnd ] );
				}
				return this;
			}
		}),
		props = animation.props;

	propFilter( props, animation.opts.specialEasing );

	for ( ; index < length ; index++ ) {
		result = animationPrefilters[ index ].call( animation, elem, props, animation.opts );
		if ( result ) {
			return result;
		}
	}

	jQuery.map( props, createTween, animation );

	if ( jQuery.isFunction( animation.opts.start ) ) {
		animation.opts.start.call( elem, animation );
	}

	jQuery.fx.timer(
		jQuery.extend( tick, {
			elem: elem,
			anim: animation,
			queue: animation.opts.queue
		})
	);

	// attach callbacks from options
	return animation.progress( animation.opts.progress )
		.done( animation.opts.done, animation.opts.complete )
		.fail( animation.opts.fail )
		.always( animation.opts.always );
}

jQuery.Animation = jQuery.extend( Animation, {

	tweener: function( props, callback ) {
		if ( jQuery.isFunction( props ) ) {
			callback = props;
			props = [ "*" ];
		} else {
			props = props.split(" ");
		}

		var prop,
			index = 0,
			length = props.length;

		for ( ; index < length ; index++ ) {
			prop = props[ index ];
			tweeners[ prop ] = tweeners[ prop ] || [];
			tweeners[ prop ].unshift( callback );
		}
	},

	prefilter: function( callback, prepend ) {
		if ( prepend ) {
			animationPrefilters.unshift( callback );
		} else {
			animationPrefilters.push( callback );
		}
	}
});

jQuery.speed = function( speed, easing, fn ) {
	var opt = speed && typeof speed === "object" ? jQuery.extend( {}, speed ) : {
		complete: fn || !fn && easing ||
			jQuery.isFunction( speed ) && speed,
		duration: speed,
		easing: fn && easing || easing && !jQuery.isFunction( easing ) && easing
	};

	opt.duration = jQuery.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
		opt.duration in jQuery.fx.speeds ? jQuery.fx.speeds[ opt.duration ] : jQuery.fx.speeds._default;

	// normalize opt.queue - true/undefined/null -> "fx"
	if ( opt.queue == null || opt.queue === true ) {
		opt.queue = "fx";
	}

	// Queueing
	opt.old = opt.complete;

	opt.complete = function() {
		if ( jQuery.isFunction( opt.old ) ) {
			opt.old.call( this );
		}

		if ( opt.queue ) {
			jQuery.dequeue( this, opt.queue );
		}
	};

	return opt;
};

jQuery.fn.extend({
	fadeTo: function( speed, to, easing, callback ) {

		// show any hidden elements after setting opacity to 0
		return this.filter( isHidden ).css( "opacity", 0 ).show()

			// animate to the value specified
			.end().animate({ opacity: to }, speed, easing, callback );
	},
	animate: function( prop, speed, easing, callback ) {
		var empty = jQuery.isEmptyObject( prop ),
			optall = jQuery.speed( speed, easing, callback ),
			doAnimation = function() {
				// Operate on a copy of prop so per-property easing won't be lost
				var anim = Animation( this, jQuery.extend( {}, prop ), optall );

				// Empty animations, or finishing resolves immediately
				if ( empty || data_priv.get( this, "finish" ) ) {
					anim.stop( true );
				}
			};
			doAnimation.finish = doAnimation;

		return empty || optall.queue === false ?
			this.each( doAnimation ) :
			this.queue( optall.queue, doAnimation );
	},
	stop: function( type, clearQueue, gotoEnd ) {
		var stopQueue = function( hooks ) {
			var stop = hooks.stop;
			delete hooks.stop;
			stop( gotoEnd );
		};

		if ( typeof type !== "string" ) {
			gotoEnd = clearQueue;
			clearQueue = type;
			type = undefined;
		}
		if ( clearQueue && type !== false ) {
			this.queue( type || "fx", [] );
		}

		return this.each(function() {
			var dequeue = true,
				index = type != null && type + "queueHooks",
				timers = jQuery.timers,
				data = data_priv.get( this );

			if ( index ) {
				if ( data[ index ] && data[ index ].stop ) {
					stopQueue( data[ index ] );
				}
			} else {
				for ( index in data ) {
					if ( data[ index ] && data[ index ].stop && rrun.test( index ) ) {
						stopQueue( data[ index ] );
					}
				}
			}

			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
					timers[ index ].anim.stop( gotoEnd );
					dequeue = false;
					timers.splice( index, 1 );
				}
			}

			// start the next in the queue if the last step wasn't forced
			// timers currently will call their complete callbacks, which will dequeue
			// but only if they were gotoEnd
			if ( dequeue || !gotoEnd ) {
				jQuery.dequeue( this, type );
			}
		});
	},
	finish: function( type ) {
		if ( type !== false ) {
			type = type || "fx";
		}
		return this.each(function() {
			var index,
				data = data_priv.get( this ),
				queue = data[ type + "queue" ],
				hooks = data[ type + "queueHooks" ],
				timers = jQuery.timers,
				length = queue ? queue.length : 0;

			// enable finishing flag on private data
			data.finish = true;

			// empty the queue first
			jQuery.queue( this, type, [] );

			if ( hooks && hooks.stop ) {
				hooks.stop.call( this, true );
			}

			// look for any active animations, and finish them
			for ( index = timers.length; index--; ) {
				if ( timers[ index ].elem === this && timers[ index ].queue === type ) {
					timers[ index ].anim.stop( true );
					timers.splice( index, 1 );
				}
			}

			// look for any animations in the old queue and finish them
			for ( index = 0; index < length; index++ ) {
				if ( queue[ index ] && queue[ index ].finish ) {
					queue[ index ].finish.call( this );
				}
			}

			// turn off finishing flag
			delete data.finish;
		});
	}
});

jQuery.each([ "toggle", "show", "hide" ], function( i, name ) {
	var cssFn = jQuery.fn[ name ];
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return speed == null || typeof speed === "boolean" ?
			cssFn.apply( this, arguments ) :
			this.animate( genFx( name, true ), speed, easing, callback );
	};
});

// Generate shortcuts for custom animations
jQuery.each({
	slideDown: genFx("show"),
	slideUp: genFx("hide"),
	slideToggle: genFx("toggle"),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, function( name, props ) {
	jQuery.fn[ name ] = function( speed, easing, callback ) {
		return this.animate( props, speed, easing, callback );
	};
});

jQuery.timers = [];
jQuery.fx.tick = function() {
	var timer,
		i = 0,
		timers = jQuery.timers;

	fxNow = jQuery.now();

	for ( ; i < timers.length; i++ ) {
		timer = timers[ i ];
		// Checks the timer has not already been removed
		if ( !timer() && timers[ i ] === timer ) {
			timers.splice( i--, 1 );
		}
	}

	if ( !timers.length ) {
		jQuery.fx.stop();
	}
	fxNow = undefined;
};

jQuery.fx.timer = function( timer ) {
	jQuery.timers.push( timer );
	if ( timer() ) {
		jQuery.fx.start();
	} else {
		jQuery.timers.pop();
	}
};

jQuery.fx.interval = 13;

jQuery.fx.start = function() {
	if ( !timerId ) {
		timerId = setInterval( jQuery.fx.tick, jQuery.fx.interval );
	}
};

jQuery.fx.stop = function() {
	clearInterval( timerId );
	timerId = null;
};

jQuery.fx.speeds = {
	slow: 600,
	fast: 200,
	// Default speed
	_default: 400
};


// Based off of the plugin by Clint Helfers, with permission.
// http://blindsignals.com/index.php/2009/07/jquery-delay/
jQuery.fn.delay = function( time, type ) {
	time = jQuery.fx ? jQuery.fx.speeds[ time ] || time : time;
	type = type || "fx";

	return this.queue( type, function( next, hooks ) {
		var timeout = setTimeout( next, time );
		hooks.stop = function() {
			clearTimeout( timeout );
		};
	});
};


(function() {
	var input = document.createElement( "input" ),
		select = document.createElement( "select" ),
		opt = select.appendChild( document.createElement( "option" ) );

	input.type = "checkbox";

	// Support: iOS 5.1, Android 4.x, Android 2.3
	// Check the default checkbox/radio value ("" on old WebKit; "on" elsewhere)
	support.checkOn = input.value !== "";

	// Must access the parent to make an option select properly
	// Support: IE9, IE10
	support.optSelected = opt.selected;

	// Make sure that the options inside disabled selects aren't marked as disabled
	// (WebKit marks them as disabled)
	select.disabled = true;
	support.optDisabled = !opt.disabled;

	// Check if an input maintains its value after becoming a radio
	// Support: IE9, IE10
	input = document.createElement( "input" );
	input.value = "t";
	input.type = "radio";
	support.radioValue = input.value === "t";
})();


var nodeHook, boolHook,
	attrHandle = jQuery.expr.attrHandle;

jQuery.fn.extend({
	attr: function( name, value ) {
		return access( this, jQuery.attr, name, value, arguments.length > 1 );
	},

	removeAttr: function( name ) {
		return this.each(function() {
			jQuery.removeAttr( this, name );
		});
	}
});

jQuery.extend({
	attr: function( elem, name, value ) {
		var hooks, ret,
			nType = elem.nodeType;

		// don't get/set attributes on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		// Fallback to prop when attributes are not supported
		if ( typeof elem.getAttribute === strundefined ) {
			return jQuery.prop( elem, name, value );
		}

		// All attributes are lowercase
		// Grab necessary hook if one is defined
		if ( nType !== 1 || !jQuery.isXMLDoc( elem ) ) {
			name = name.toLowerCase();
			hooks = jQuery.attrHooks[ name ] ||
				( jQuery.expr.match.bool.test( name ) ? boolHook : nodeHook );
		}

		if ( value !== undefined ) {

			if ( value === null ) {
				jQuery.removeAttr( elem, name );

			} else if ( hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ) {
				return ret;

			} else {
				elem.setAttribute( name, value + "" );
				return value;
			}

		} else if ( hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ) {
			return ret;

		} else {
			ret = jQuery.find.attr( elem, name );

			// Non-existent attributes return null, we normalize to undefined
			return ret == null ?
				undefined :
				ret;
		}
	},

	removeAttr: function( elem, value ) {
		var name, propName,
			i = 0,
			attrNames = value && value.match( rnotwhite );

		if ( attrNames && elem.nodeType === 1 ) {
			while ( (name = attrNames[i++]) ) {
				propName = jQuery.propFix[ name ] || name;

				// Boolean attributes get special treatment (#10870)
				if ( jQuery.expr.match.bool.test( name ) ) {
					// Set corresponding property to false
					elem[ propName ] = false;
				}

				elem.removeAttribute( name );
			}
		}
	},

	attrHooks: {
		type: {
			set: function( elem, value ) {
				if ( !support.radioValue && value === "radio" &&
					jQuery.nodeName( elem, "input" ) ) {
					// Setting the type on a radio button after the value resets the value in IE6-9
					// Reset value to default in case type is set after value during creation
					var val = elem.value;
					elem.setAttribute( "type", value );
					if ( val ) {
						elem.value = val;
					}
					return value;
				}
			}
		}
	}
});

// Hooks for boolean attributes
boolHook = {
	set: function( elem, value, name ) {
		if ( value === false ) {
			// Remove boolean attributes when set to false
			jQuery.removeAttr( elem, name );
		} else {
			elem.setAttribute( name, name );
		}
		return name;
	}
};
jQuery.each( jQuery.expr.match.bool.source.match( /\w+/g ), function( i, name ) {
	var getter = attrHandle[ name ] || jQuery.find.attr;

	attrHandle[ name ] = function( elem, name, isXML ) {
		var ret, handle;
		if ( !isXML ) {
			// Avoid an infinite loop by temporarily removing this function from the getter
			handle = attrHandle[ name ];
			attrHandle[ name ] = ret;
			ret = getter( elem, name, isXML ) != null ?
				name.toLowerCase() :
				null;
			attrHandle[ name ] = handle;
		}
		return ret;
	};
});




var rfocusable = /^(?:input|select|textarea|button)$/i;

jQuery.fn.extend({
	prop: function( name, value ) {
		return access( this, jQuery.prop, name, value, arguments.length > 1 );
	},

	removeProp: function( name ) {
		return this.each(function() {
			delete this[ jQuery.propFix[ name ] || name ];
		});
	}
});

jQuery.extend({
	propFix: {
		"for": "htmlFor",
		"class": "className"
	},

	prop: function( elem, name, value ) {
		var ret, hooks, notxml,
			nType = elem.nodeType;

		// don't get/set properties on text, comment and attribute nodes
		if ( !elem || nType === 3 || nType === 8 || nType === 2 ) {
			return;
		}

		notxml = nType !== 1 || !jQuery.isXMLDoc( elem );

		if ( notxml ) {
			// Fix name and attach hooks
			name = jQuery.propFix[ name ] || name;
			hooks = jQuery.propHooks[ name ];
		}

		if ( value !== undefined ) {
			return hooks && "set" in hooks && (ret = hooks.set( elem, value, name )) !== undefined ?
				ret :
				( elem[ name ] = value );

		} else {
			return hooks && "get" in hooks && (ret = hooks.get( elem, name )) !== null ?
				ret :
				elem[ name ];
		}
	},

	propHooks: {
		tabIndex: {
			get: function( elem ) {
				return elem.hasAttribute( "tabindex" ) || rfocusable.test( elem.nodeName ) || elem.href ?
					elem.tabIndex :
					-1;
			}
		}
	}
});

// Support: IE9+
// Selectedness for an option in an optgroup can be inaccurate
if ( !support.optSelected ) {
	jQuery.propHooks.selected = {
		get: function( elem ) {
			var parent = elem.parentNode;
			if ( parent && parent.parentNode ) {
				parent.parentNode.selectedIndex;
			}
			return null;
		}
	};
}

jQuery.each([
	"tabIndex",
	"readOnly",
	"maxLength",
	"cellSpacing",
	"cellPadding",
	"rowSpan",
	"colSpan",
	"useMap",
	"frameBorder",
	"contentEditable"
], function() {
	jQuery.propFix[ this.toLowerCase() ] = this;
});




var rclass = /[\t\r\n\f]/g;

jQuery.fn.extend({
	addClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).addClass( value.call( this, j, this.className ) );
			});
		}

		if ( proceed ) {
			// The disjunction here is for better compressibility (see removeClass)
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					" "
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						if ( cur.indexOf( " " + clazz + " " ) < 0 ) {
							cur += clazz + " ";
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = jQuery.trim( cur );
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	removeClass: function( value ) {
		var classes, elem, cur, clazz, j, finalValue,
			proceed = arguments.length === 0 || typeof value === "string" && value,
			i = 0,
			len = this.length;

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( j ) {
				jQuery( this ).removeClass( value.call( this, j, this.className ) );
			});
		}
		if ( proceed ) {
			classes = ( value || "" ).match( rnotwhite ) || [];

			for ( ; i < len; i++ ) {
				elem = this[ i ];
				// This expression is here for better compressibility (see addClass)
				cur = elem.nodeType === 1 && ( elem.className ?
					( " " + elem.className + " " ).replace( rclass, " " ) :
					""
				);

				if ( cur ) {
					j = 0;
					while ( (clazz = classes[j++]) ) {
						// Remove *all* instances
						while ( cur.indexOf( " " + clazz + " " ) >= 0 ) {
							cur = cur.replace( " " + clazz + " ", " " );
						}
					}

					// only assign if different to avoid unneeded rendering.
					finalValue = value ? jQuery.trim( cur ) : "";
					if ( elem.className !== finalValue ) {
						elem.className = finalValue;
					}
				}
			}
		}

		return this;
	},

	toggleClass: function( value, stateVal ) {
		var type = typeof value;

		if ( typeof stateVal === "boolean" && type === "string" ) {
			return stateVal ? this.addClass( value ) : this.removeClass( value );
		}

		if ( jQuery.isFunction( value ) ) {
			return this.each(function( i ) {
				jQuery( this ).toggleClass( value.call(this, i, this.className, stateVal), stateVal );
			});
		}

		return this.each(function() {
			if ( type === "string" ) {
				// toggle individual class names
				var className,
					i = 0,
					self = jQuery( this ),
					classNames = value.match( rnotwhite ) || [];

				while ( (className = classNames[ i++ ]) ) {
					// check each className given, space separated list
					if ( self.hasClass( className ) ) {
						self.removeClass( className );
					} else {
						self.addClass( className );
					}
				}

			// Toggle whole class name
			} else if ( type === strundefined || type === "boolean" ) {
				if ( this.className ) {
					// store className if set
					data_priv.set( this, "__className__", this.className );
				}

				// If the element has a class name or if we're passed "false",
				// then remove the whole classname (if there was one, the above saved it).
				// Otherwise bring back whatever was previously saved (if anything),
				// falling back to the empty string if nothing was stored.
				this.className = this.className || value === false ? "" : data_priv.get( this, "__className__" ) || "";
			}
		});
	},

	hasClass: function( selector ) {
		var className = " " + selector + " ",
			i = 0,
			l = this.length;
		for ( ; i < l; i++ ) {
			if ( this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) >= 0 ) {
				return true;
			}
		}

		return false;
	}
});




var rreturn = /\r/g;

jQuery.fn.extend({
	val: function( value ) {
		var hooks, ret, isFunction,
			elem = this[0];

		if ( !arguments.length ) {
			if ( elem ) {
				hooks = jQuery.valHooks[ elem.type ] || jQuery.valHooks[ elem.nodeName.toLowerCase() ];

				if ( hooks && "get" in hooks && (ret = hooks.get( elem, "value" )) !== undefined ) {
					return ret;
				}

				ret = elem.value;

				return typeof ret === "string" ?
					// handle most common string cases
					ret.replace(rreturn, "") :
					// handle cases where value is null/undef or number
					ret == null ? "" : ret;
			}

			return;
		}

		isFunction = jQuery.isFunction( value );

		return this.each(function( i ) {
			var val;

			if ( this.nodeType !== 1 ) {
				return;
			}

			if ( isFunction ) {
				val = value.call( this, i, jQuery( this ).val() );
			} else {
				val = value;
			}

			// Treat null/undefined as ""; convert numbers to string
			if ( val == null ) {
				val = "";

			} else if ( typeof val === "number" ) {
				val += "";

			} else if ( jQuery.isArray( val ) ) {
				val = jQuery.map( val, function( value ) {
					return value == null ? "" : value + "";
				});
			}

			hooks = jQuery.valHooks[ this.type ] || jQuery.valHooks[ this.nodeName.toLowerCase() ];

			// If set returns undefined, fall back to normal setting
			if ( !hooks || !("set" in hooks) || hooks.set( this, val, "value" ) === undefined ) {
				this.value = val;
			}
		});
	}
});

jQuery.extend({
	valHooks: {
		option: {
			get: function( elem ) {
				var val = jQuery.find.attr( elem, "value" );
				return val != null ?
					val :
					// Support: IE10-11+
					// option.text throws exceptions (#14686, #14858)
					jQuery.trim( jQuery.text( elem ) );
			}
		},
		select: {
			get: function( elem ) {
				var value, option,
					options = elem.options,
					index = elem.selectedIndex,
					one = elem.type === "select-one" || index < 0,
					values = one ? null : [],
					max = one ? index + 1 : options.length,
					i = index < 0 ?
						max :
						one ? index : 0;

				// Loop through all the selected options
				for ( ; i < max; i++ ) {
					option = options[ i ];

					// IE6-9 doesn't update selected after form reset (#2551)
					if ( ( option.selected || i === index ) &&
							// Don't return options that are disabled or in a disabled optgroup
							( support.optDisabled ? !option.disabled : option.getAttribute( "disabled" ) === null ) &&
							( !option.parentNode.disabled || !jQuery.nodeName( option.parentNode, "optgroup" ) ) ) {

						// Get the specific value for the option
						value = jQuery( option ).val();

						// We don't need an array for one selects
						if ( one ) {
							return value;
						}

						// Multi-Selects return an array
						values.push( value );
					}
				}

				return values;
			},

			set: function( elem, value ) {
				var optionSet, option,
					options = elem.options,
					values = jQuery.makeArray( value ),
					i = options.length;

				while ( i-- ) {
					option = options[ i ];
					if ( (option.selected = jQuery.inArray( option.value, values ) >= 0) ) {
						optionSet = true;
					}
				}

				// force browsers to behave consistently when non-matching value is set
				if ( !optionSet ) {
					elem.selectedIndex = -1;
				}
				return values;
			}
		}
	}
});

// Radios and checkboxes getter/setter
jQuery.each([ "radio", "checkbox" ], function() {
	jQuery.valHooks[ this ] = {
		set: function( elem, value ) {
			if ( jQuery.isArray( value ) ) {
				return ( elem.checked = jQuery.inArray( jQuery(elem).val(), value ) >= 0 );
			}
		}
	};
	if ( !support.checkOn ) {
		jQuery.valHooks[ this ].get = function( elem ) {
			// Support: Webkit
			// "" is returned instead of "on" if a value isn't specified
			return elem.getAttribute("value") === null ? "on" : elem.value;
		};
	}
});




// Return jQuery for attributes-only inclusion


jQuery.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {

	// Handle event binding
	jQuery.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jQuery.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});


var nonce = jQuery.now();

var rquery = (/\?/);



// Support: Android 2.3
// Workaround failure to string-cast null input
jQuery.parseJSON = function( data ) {
	return JSON.parse( data + "" );
};


// Cross-browser xml parsing
jQuery.parseXML = function( data ) {
	var xml, tmp;
	if ( !data || typeof data !== "string" ) {
		return null;
	}

	// Support: IE9
	try {
		tmp = new DOMParser();
		xml = tmp.parseFromString( data, "text/xml" );
	} catch ( e ) {
		xml = undefined;
	}

	if ( !xml || xml.getElementsByTagName( "parsererror" ).length ) {
		jQuery.error( "Invalid XML: " + data );
	}
	return xml;
};


var
	// Document location
	ajaxLocParts,
	ajaxLocation,

	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg,
	// #7653, #8125, #8152: local protocol detection
	rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {},

	// Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes = "*/".concat("*");

// #8138, IE may throw an exception when accessing
// a field from window.location if document.domain has been set
try {
	ajaxLocation = location.href;
} catch( e ) {
	// Use the href attribute of an A element
	// since IE will modify it given document.location
	ajaxLocation = document.createElement( "a" );
	ajaxLocation.href = "";
	ajaxLocation = ajaxLocation.href;
}

// Segment location into parts
ajaxLocParts = rurl.exec( ajaxLocation.toLowerCase() ) || [];

// Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jQuery.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType[0] === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jQuery.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var key, deep,
		flatOptions = jQuery.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jQuery.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {

	var ct, type, finalDataType, firstDataType,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

		// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jQuery.extend({

	// Counter for holding the number of active queries
	active: 0,

	// Last-Modified header cache for next request
	lastModified: {},
	etag: {},

	ajaxSettings: {
		url: ajaxLocation,
		type: "GET",
		isLocal: rlocalProtocol.test( ajaxLocParts[ 1 ] ),
		global: true,
		processData: true,
		async: true,
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		/*
		timeout: 0,
		data: null,
		dataType: null,
		username: null,
		password: null,
		cache: null,
		throws: false,
		traditional: false,
		headers: {},
		*/

		accepts: {
			"*": allTypes,
			text: "text/plain",
			html: "text/html",
			xml: "application/xml, text/xml",
			json: "application/json, text/javascript"
		},

		contents: {
			xml: /xml/,
			html: /html/,
			json: /json/
		},

		responseFields: {
			xml: "responseXML",
			text: "responseText",
			json: "responseJSON"
		},

		// Data converters
		// Keys separate source (or catchall "*") and destination types with a single space
		converters: {

			// Convert anything to text
			"* text": String,

			// Text to html (true = no transformation)
			"text html": true,

			// Evaluate text as a json expression
			"text json": jQuery.parseJSON,

			// Parse text as xml
			"text xml": jQuery.parseXML
		},

		// For options that shouldn't be deep extended:
		// you can add your own custom options here if
		// and when you create one that shouldn't be
		// deep extended (see ajaxExtend)
		flatOptions: {
			url: true,
			context: true
		}
	},

	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, jQuery.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( jQuery.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var transport,
			// URL without anti-cache param
			cacheURL,
			// Response headers
			responseHeadersString,
			responseHeaders,
			// timeout handle
			timeoutTimer,
			// Cross-domain detection vars
			parts,
			// To know if global events are to be dispatched
			fireGlobals,
			// Loop variable
			i,
			// Create the final options object
			s = jQuery.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jQuery collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jquery ) ?
				jQuery( callbackContext ) :
				jQuery.event,
			// Deferreds
			deferred = jQuery.Deferred(),
			completeDeferred = jQuery.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (prefilters might expect it)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || ajaxLocation ) + "" ).replace( rhash, "" )
			.replace( rprotocol, ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jQuery.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== ajaxLocParts[ 1 ] || parts[ 2 ] !== ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( ajaxLocParts[ 3 ] || ( ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jQuery.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && jQuery.active++ === 0 ) {
			jQuery.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( jQuery.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", jQuery.lastModified[ cacheURL ] );
			}
			if ( jQuery.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", jQuery.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + allTypes + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						jQuery.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						jQuery.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( status || !statusText ) {
					statusText = "error";
					if ( status < 0 ) {
						status = 0;
					}
				}
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --jQuery.active ) ) {
					jQuery.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jQuery.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jQuery.get( url, undefined, callback, "script" );
	}
});

jQuery.each( [ "get", "post" ], function( i, method ) {
	jQuery[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jQuery.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

// Attach a bunch of functions for handling common AJAX events
jQuery.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jQuery.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});


jQuery._evalUrl = function( url ) {
	return jQuery.ajax({
		url: url,
		type: "GET",
		dataType: "script",
		async: false,
		global: false,
		"throws": true
	});
};


jQuery.fn.extend({
	wrapAll: function( html ) {
		var wrap;

		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapAll( html.call(this, i) );
			});
		}

		if ( this[ 0 ] ) {

			// The elements to wrap the target around
			wrap = jQuery( html, this[ 0 ].ownerDocument ).eq( 0 ).clone( true );

			if ( this[ 0 ].parentNode ) {
				wrap.insertBefore( this[ 0 ] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append( this );
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jQuery.isFunction( html ) ) {
			return this.each(function( i ) {
				jQuery( this ).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jQuery( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		var isFunction = jQuery.isFunction( html );

		return this.each(function( i ) {
			jQuery( this ).wrapAll( isFunction ? html.call(this, i) : html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jQuery.nodeName( this, "body" ) ) {
				jQuery( this ).replaceWith( this.childNodes );
			}
		}).end();
	}
});


jQuery.expr.filters.hidden = function( elem ) {
	// Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
};
jQuery.expr.filters.visible = function( elem ) {
	return !jQuery.expr.filters.hidden( elem );
};




var r20 = /%20/g,
	rbracket = /\[\]$/,
	rCRLF = /\r?\n/g,
	rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
	rsubmittable = /^(?:input|select|textarea|keygen)/i;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jQuery.isArray( obj ) ) {
		// Serialize array item.
		jQuery.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jQuery.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize an array of form elements or a set of
// key/values into a query string
jQuery.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jQuery.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};

	// Set traditional to true for jQuery <= 1.3.2 behavior.
	if ( traditional === undefined ) {
		traditional = jQuery.ajaxSettings && jQuery.ajaxSettings.traditional;
	}

	// If an array was passed in, assume that it is an array of form elements.
	if ( jQuery.isArray( a ) || ( a.jquery && !jQuery.isPlainObject( a ) ) ) {
		// Serialize the form elements
		jQuery.each( a, function() {
			add( this.name, this.value );
		});

	} else {
		// If traditional, encode the "old" way (the way 1.3.2 or older
		// did it), otherwise encode params recursively.
		for ( prefix in a ) {
			buildParams( prefix, a[ prefix ], traditional, add );
		}
	}

	// Return the resulting serialization
	return s.join( "&" ).replace( r20, "+" );
};

jQuery.fn.extend({
	serialize: function() {
		return jQuery.param( this.serializeArray() );
	},
	serializeArray: function() {
		return this.map(function() {
			// Can add propHook for "elements" to filter or add form elements
			var elements = jQuery.prop( this, "elements" );
			return elements ? jQuery.makeArray( elements ) : this;
		})
		.filter(function() {
			var type = this.type;

			// Use .is( ":disabled" ) so that fieldset[disabled] works
			return this.name && !jQuery( this ).is( ":disabled" ) &&
				rsubmittable.test( this.nodeName ) && !rsubmitterTypes.test( type ) &&
				( this.checked || !rcheckableType.test( type ) );
		})
		.map(function( i, elem ) {
			var val = jQuery( this ).val();

			return val == null ?
				null :
				jQuery.isArray( val ) ?
					jQuery.map( val, function( val ) {
						return { name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
					}) :
					{ name: elem.name, value: val.replace( rCRLF, "\r\n" ) };
		}).get();
	}
});


jQuery.ajaxSettings.xhr = function() {
	try {
		return new XMLHttpRequest();
	} catch( e ) {}
};

var xhrId = 0,
	xhrCallbacks = {},
	xhrSuccessStatus = {
		// file protocol always yields status code 0, assume 200
		0: 200,
		// Support: IE9
		// #1450: sometimes IE returns 1223 when it should be 204
		1223: 204
	},
	xhrSupported = jQuery.ajaxSettings.xhr();

// Support: IE9
// Open requests must be manually aborted on unload (#5280)
if ( window.ActiveXObject ) {
	jQuery( window ).on( "unload", function() {
		for ( var key in xhrCallbacks ) {
			xhrCallbacks[ key ]();
		}
	});
}

support.cors = !!xhrSupported && ( "withCredentials" in xhrSupported );
support.ajax = xhrSupported = !!xhrSupported;

jQuery.ajaxTransport(function( options ) {
	var callback;

	// Cross domain only allowed if supported through XMLHttpRequest
	if ( support.cors || xhrSupported && !options.crossDomain ) {
		return {
			send: function( headers, complete ) {
				var i,
					xhr = options.xhr(),
					id = ++xhrId;

				xhr.open( options.type, options.url, options.async, options.username, options.password );

				// Apply custom fields if provided
				if ( options.xhrFields ) {
					for ( i in options.xhrFields ) {
						xhr[ i ] = options.xhrFields[ i ];
					}
				}

				// Override mime type if needed
				if ( options.mimeType && xhr.overrideMimeType ) {
					xhr.overrideMimeType( options.mimeType );
				}

				// X-Requested-With header
				// For cross-domain requests, seeing as conditions for a preflight are
				// akin to a jigsaw puzzle, we simply never set it to be sure.
				// (it can always be set on a per-request basis or even using ajaxSetup)
				// For same-domain requests, won't change header if already provided.
				if ( !options.crossDomain && !headers["X-Requested-With"] ) {
					headers["X-Requested-With"] = "XMLHttpRequest";
				}

				// Set headers
				for ( i in headers ) {
					xhr.setRequestHeader( i, headers[ i ] );
				}

				// Callback
				callback = function( type ) {
					return function() {
						if ( callback ) {
							delete xhrCallbacks[ id ];
							callback = xhr.onload = xhr.onerror = null;

							if ( type === "abort" ) {
								xhr.abort();
							} else if ( type === "error" ) {
								complete(
									// file: protocol always yields status 0; see #8605, #14207
									xhr.status,
									xhr.statusText
								);
							} else {
								complete(
									xhrSuccessStatus[ xhr.status ] || xhr.status,
									xhr.statusText,
									// Support: IE9
									// Accessing binary-data responseText throws an exception
									// (#11426)
									typeof xhr.responseText === "string" ? {
										text: xhr.responseText
									} : undefined,
									xhr.getAllResponseHeaders()
								);
							}
						}
					};
				};

				// Listen to events
				xhr.onload = callback();
				xhr.onerror = callback("error");

				// Create the abort callback
				callback = xhrCallbacks[ id ] = callback("abort");

				try {
					// Do send the request (this may raise an exception)
					xhr.send( options.hasContent && options.data || null );
				} catch ( e ) {
					// #14683: Only rethrow if this hasn't been notified as an error yet
					if ( callback ) {
						throw e;
					}
				}
			},

			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




// Install script dataType
jQuery.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jQuery.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and crossDomain
jQuery.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
	}
});

// Bind script tag hack transport
jQuery.ajaxTransport( "script", function( s ) {
	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {
		var script, callback;
		return {
			send: function( _, complete ) {
				script = jQuery("<script>").prop({
					async: true,
					charset: s.scriptCharset,
					src: s.url
				}).on(
					"load error",
					callback = function( evt ) {
						script.remove();
						callback = null;
						if ( evt ) {
							complete( evt.type === "error" ? 404 : 200, evt.type );
						}
					}
				);
				document.head.appendChild( script[ 0 ] );
			},
			abort: function() {
				if ( callback ) {
					callback();
				}
			}
		};
	}
});




var oldCallbacks = [],
	rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jQuery.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jQuery.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jQuery.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jQuery.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jQuery.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jQuery.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});




// data: string of html
// context (optional): If specified, the fragment will be created in this context, defaults to document
// keepScripts (optional): If true, will include scripts passed in the html string
jQuery.parseHTML = function( data, context, keepScripts ) {
	if ( !data || typeof data !== "string" ) {
		return null;
	}
	if ( typeof context === "boolean" ) {
		keepScripts = context;
		context = false;
	}
	context = context || document;

	var parsed = rsingleTag.exec( data ),
		scripts = !keepScripts && [];

	// Single tag
	if ( parsed ) {
		return [ context.createElement( parsed[1] ) ];
	}

	parsed = jQuery.buildFragment( [ data ], context, scripts );

	if ( scripts && scripts.length ) {
		jQuery( scripts ).remove();
	}

	return jQuery.merge( [], parsed.childNodes );
};


// Keep a copy of the old load method
var _load = jQuery.fn.load;

/**
 * Load a url into a page
 */
jQuery.fn.load = function( url, params, callback ) {
	if ( typeof url !== "string" && _load ) {
		return _load.apply( this, arguments );
	}

	var selector, type, response,
		self = this,
		off = url.indexOf(" ");

	if ( off >= 0 ) {
		selector = jQuery.trim( url.slice( off ) );
		url = url.slice( 0, off );
	}

	// If it's a function
	if ( jQuery.isFunction( params ) ) {

		// We assume that it's the callback
		callback = params;
		params = undefined;

	// Otherwise, build a param string
	} else if ( params && typeof params === "object" ) {
		type = "POST";
	}

	// If we have elements to modify, make the request
	if ( self.length > 0 ) {
		jQuery.ajax({
			url: url,

			// if "type" variable is undefined, then "GET" method will be used
			type: type,
			dataType: "html",
			data: params
		}).done(function( responseText ) {

			// Save response for use in complete callback
			response = arguments;

			self.html( selector ?

				// If a selector was specified, locate the right elements in a dummy div
				// Exclude scripts to avoid IE 'Permission Denied' errors
				jQuery("<div>").append( jQuery.parseHTML( responseText ) ).find( selector ) :

				// Otherwise use the full result
				responseText );

		}).complete( callback && function( jqXHR, status ) {
			self.each( callback, response || [ jqXHR.responseText, status, jqXHR ] );
		});
	}

	return this;
};




jQuery.expr.filters.animated = function( elem ) {
	return jQuery.grep(jQuery.timers, function( fn ) {
		return elem === fn.elem;
	}).length;
};




var docElem = window.document.documentElement;

/**
 * Gets a window from an element
 */
function getWindow( elem ) {
	return jQuery.isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
}

jQuery.offset = {
	setOffset: function( elem, options, i ) {
		var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition,
			position = jQuery.css( elem, "position" ),
			curElem = jQuery( elem ),
			props = {};

		// Set position first, in-case top/left are set even on static elem
		if ( position === "static" ) {
			elem.style.position = "relative";
		}

		curOffset = curElem.offset();
		curCSSTop = jQuery.css( elem, "top" );
		curCSSLeft = jQuery.css( elem, "left" );
		calculatePosition = ( position === "absolute" || position === "fixed" ) &&
			( curCSSTop + curCSSLeft ).indexOf("auto") > -1;

		// Need to be able to calculate position if either top or left is auto and position is either absolute or fixed
		if ( calculatePosition ) {
			curPosition = curElem.position();
			curTop = curPosition.top;
			curLeft = curPosition.left;

		} else {
			curTop = parseFloat( curCSSTop ) || 0;
			curLeft = parseFloat( curCSSLeft ) || 0;
		}

		if ( jQuery.isFunction( options ) ) {
			options = options.call( elem, i, curOffset );
		}

		if ( options.top != null ) {
			props.top = ( options.top - curOffset.top ) + curTop;
		}
		if ( options.left != null ) {
			props.left = ( options.left - curOffset.left ) + curLeft;
		}

		if ( "using" in options ) {
			options.using.call( elem, props );

		} else {
			curElem.css( props );
		}
	}
};

jQuery.fn.extend({
	offset: function( options ) {
		if ( arguments.length ) {
			return options === undefined ?
				this :
				this.each(function( i ) {
					jQuery.offset.setOffset( this, options, i );
				});
		}

		var docElem, win,
			elem = this[ 0 ],
			box = { top: 0, left: 0 },
			doc = elem && elem.ownerDocument;

		if ( !doc ) {
			return;
		}

		docElem = doc.documentElement;

		// Make sure it's not a disconnected DOM node
		if ( !jQuery.contains( docElem, elem ) ) {
			return box;
		}

		// If we don't have gBCR, just use 0,0 rather than error
		// BlackBerry 5, iOS 3 (original iPhone)
		if ( typeof elem.getBoundingClientRect !== strundefined ) {
			box = elem.getBoundingClientRect();
		}
		win = getWindow( doc );
		return {
			top: box.top + win.pageYOffset - docElem.clientTop,
			left: box.left + win.pageXOffset - docElem.clientLeft
		};
	},

	position: function() {
		if ( !this[ 0 ] ) {
			return;
		}

		var offsetParent, offset,
			elem = this[ 0 ],
			parentOffset = { top: 0, left: 0 };

		// Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is its only offset parent
		if ( jQuery.css( elem, "position" ) === "fixed" ) {
			// We assume that getBoundingClientRect is available when computed position is fixed
			offset = elem.getBoundingClientRect();

		} else {
			// Get *real* offsetParent
			offsetParent = this.offsetParent();

			// Get correct offsets
			offset = this.offset();
			if ( !jQuery.nodeName( offsetParent[ 0 ], "html" ) ) {
				parentOffset = offsetParent.offset();
			}

			// Add offsetParent borders
			parentOffset.top += jQuery.css( offsetParent[ 0 ], "borderTopWidth", true );
			parentOffset.left += jQuery.css( offsetParent[ 0 ], "borderLeftWidth", true );
		}

		// Subtract parent offsets and element margins
		return {
			top: offset.top - parentOffset.top - jQuery.css( elem, "marginTop", true ),
			left: offset.left - parentOffset.left - jQuery.css( elem, "marginLeft", true )
		};
	},

	offsetParent: function() {
		return this.map(function() {
			var offsetParent = this.offsetParent || docElem;

			while ( offsetParent && ( !jQuery.nodeName( offsetParent, "html" ) && jQuery.css( offsetParent, "position" ) === "static" ) ) {
				offsetParent = offsetParent.offsetParent;
			}

			return offsetParent || docElem;
		});
	}
});

// Create scrollLeft and scrollTop methods
jQuery.each( { scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function( method, prop ) {
	var top = "pageYOffset" === prop;

	jQuery.fn[ method ] = function( val ) {
		return access( this, function( elem, method, val ) {
			var win = getWindow( elem );

			if ( val === undefined ) {
				return win ? win[ prop ] : elem[ method ];
			}

			if ( win ) {
				win.scrollTo(
					!top ? val : window.pageXOffset,
					top ? val : window.pageYOffset
				);

			} else {
				elem[ method ] = val;
			}
		}, method, val, arguments.length, null );
	};
});

// Add the top/left cssHooks using jQuery.fn.position
// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
// getComputedStyle returns percent when specified for top/left/bottom/right
// rather than make the css module depend on the offset module, we just check for it here
jQuery.each( [ "top", "left" ], function( i, prop ) {
	jQuery.cssHooks[ prop ] = addGetHookIf( support.pixelPosition,
		function( elem, computed ) {
			if ( computed ) {
				computed = curCSS( elem, prop );
				// if curCSS returns percentage, fallback to offset
				return rnumnonpx.test( computed ) ?
					jQuery( elem ).position()[ prop ] + "px" :
					computed;
			}
		}
	);
});


// Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
jQuery.each( { Height: "height", Width: "width" }, function( name, type ) {
	jQuery.each( { padding: "inner" + name, content: type, "": "outer" + name }, function( defaultExtra, funcName ) {
		// margin is only for outerHeight, outerWidth
		jQuery.fn[ funcName ] = function( margin, value ) {
			var chainable = arguments.length && ( defaultExtra || typeof margin !== "boolean" ),
				extra = defaultExtra || ( margin === true || value === true ? "margin" : "border" );

			return access( this, function( elem, type, value ) {
				var doc;

				if ( jQuery.isWindow( elem ) ) {
					// As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
					// isn't a whole lot we can do. See pull request at this URL for discussion:
					// https://github.com/jquery/jquery/pull/764
					return elem.document.documentElement[ "client" + name ];
				}

				// Get document width or height
				if ( elem.nodeType === 9 ) {
					doc = elem.documentElement;

					// Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
					// whichever is greatest
					return Math.max(
						elem.body[ "scroll" + name ], doc[ "scroll" + name ],
						elem.body[ "offset" + name ], doc[ "offset" + name ],
						doc[ "client" + name ]
					);
				}

				return value === undefined ?
					// Get width or height on the element, requesting but not forcing parseFloat
					jQuery.css( elem, type, extra ) :

					// Set width or height on the element
					jQuery.style( elem, type, value, extra );
			}, type, chainable ? margin : undefined, chainable, null );
		};
	});
});


// The number of elements contained in the matched element set
jQuery.fn.size = function() {
	return this.length;
};

jQuery.fn.andSelf = jQuery.fn.addBack;




// Register as a named AMD module, since jQuery can be concatenated with other
// files that may use define, but not via a proper concatenation script that
// understands anonymous AMD modules. A named AMD is safest and most robust
// way to register. Lowercase jquery is used because AMD module names are
// derived from file names, and jQuery is normally delivered in a lowercase
// file name. Do this after creating the global so that if an AMD module wants
// to call noConflict to hide this version of jQuery, it will work.

// Note that for maximum portability, libraries that are not jQuery should
// declare themselves as anonymous modules, and avoid setting a global if an
// AMD loader is present. jQuery is a special case. For more information, see
// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon

if ( typeof define === "function" && define.amd ) {
	define( "jquery", [], function() {
		return jQuery;
	});
}




var
	// Map over jQuery in case of overwrite
	_jQuery = window.jQuery,

	// Map over the $ in case of overwrite
	_$ = window.$;

jQuery.noConflict = function( deep ) {
	if ( window.$ === jQuery ) {
		window.$ = _$;
	}

	if ( deep && window.jQuery === jQuery ) {
		window.jQuery = _jQuery;
	}

	return jQuery;
};

// Expose jQuery and $ identifiers, even in
// AMD (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
// and CommonJS for browser emulators (#13566)
if ( typeof noGlobal === strundefined ) {
	window.jQuery = window.$ = jQuery;
}




return jQuery;

}));

},{}],36:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * http://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.1';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],37:[function(require,module,exports){
module.exports = require("./moment-timezone");
module.exports.tz.add(require('./moment-timezone.json'));

},{"./moment-timezone":39,"./moment-timezone.json":38}],38:[function(require,module,exports){
module.exports={
	"links": {
		"Africa/Asmera": "Africa/Asmara",
		"Africa/Timbuktu": "Africa/Bamako",
		"America/Argentina/ComodRivadavia": "America/Argentina/Catamarca",
		"America/Atka": "America/Adak",
		"America/Buenos_Aires": "America/Argentina/Buenos_Aires",
		"America/Catamarca": "America/Argentina/Catamarca",
		"America/Coral_Harbour": "America/Atikokan",
		"America/Cordoba": "America/Argentina/Cordoba",
		"America/Ensenada": "America/Tijuana",
		"America/Fort_Wayne": "America/Indiana/Indianapolis",
		"America/Indianapolis": "America/Indiana/Indianapolis",
		"America/Jujuy": "America/Argentina/Jujuy",
		"America/Knox_IN": "America/Indiana/Knox",
		"America/Kralendijk": "America/Curacao",
		"America/Louisville": "America/Kentucky/Louisville",
		"America/Lower_Princes": "America/Curacao",
		"America/Marigot": "America/Guadeloupe",
		"America/Mendoza": "America/Argentina/Mendoza",
		"America/Porto_Acre": "America/Rio_Branco",
		"America/Rosario": "America/Argentina/Cordoba",
		"America/Shiprock": "America/Denver",
		"America/St_Barthelemy": "America/Guadeloupe",
		"America/Virgin": "America/St_Thomas",
		"Antarctica/South_Pole": "Antarctica/McMurdo",
		"Arctic/Longyearbyen": "Europe/Oslo",
		"Asia/Ashkhabad": "Asia/Ashgabat",
		"Asia/Calcutta": "Asia/Kolkata",
		"Asia/Chungking": "Asia/Chongqing",
		"Asia/Dacca": "Asia/Dhaka",
		"Asia/Istanbul": "Europe/Istanbul",
		"Asia/Katmandu": "Asia/Kathmandu",
		"Asia/Macao": "Asia/Macau",
		"Asia/Saigon": "Asia/Ho_Chi_Minh",
		"Asia/Tel_Aviv": "Asia/Jerusalem",
		"Asia/Thimbu": "Asia/Thimphu",
		"Asia/Ujung_Pandang": "Asia/Makassar",
		"Asia/Ulan_Bator": "Asia/Ulaanbaatar",
		"Atlantic/Faeroe": "Atlantic/Faroe",
		"Atlantic/Jan_Mayen": "Europe/Oslo",
		"Australia/ACT": "Australia/Sydney",
		"Australia/Canberra": "Australia/Sydney",
		"Australia/LHI": "Australia/Lord_Howe",
		"Australia/NSW": "Australia/Sydney",
		"Australia/North": "Australia/Darwin",
		"Australia/Queensland": "Australia/Brisbane",
		"Australia/South": "Australia/Adelaide",
		"Australia/Tasmania": "Australia/Hobart",
		"Australia/Victoria": "Australia/Melbourne",
		"Australia/West": "Australia/Perth",
		"Australia/Yancowinna": "Australia/Broken_Hill",
		"Brazil/Acre": "America/Rio_Branco",
		"Brazil/DeNoronha": "America/Noronha",
		"Brazil/East": "America/Sao_Paulo",
		"Brazil/West": "America/Manaus",
		"Canada/Atlantic": "America/Halifax",
		"Canada/Central": "America/Winnipeg",
		"Canada/East-Saskatchewan": "America/Regina",
		"Canada/Eastern": "America/Toronto",
		"Canada/Mountain": "America/Edmonton",
		"Canada/Newfoundland": "America/St_Johns",
		"Canada/Pacific": "America/Vancouver",
		"Canada/Saskatchewan": "America/Regina",
		"Canada/Yukon": "America/Whitehorse",
		"Chile/Continental": "America/Santiago",
		"Chile/EasterIsland": "Pacific/Easter",
		"Cuba": "America/Havana",
		"Egypt": "Africa/Cairo",
		"Eire": "Europe/Dublin",
		"Etc/GMT+0": "Etc/GMT",
		"Etc/GMT-0": "Etc/GMT",
		"Etc/GMT0": "Etc/GMT",
		"Etc/Greenwich": "Etc/GMT",
		"Etc/Universal": "Etc/UTC",
		"Etc/Zulu": "Etc/UTC",
		"Europe/Belfast": "Europe/London",
		"Europe/Bratislava": "Europe/Prague",
		"Europe/Busingen": "Europe/Zurich",
		"Europe/Guernsey": "Europe/London",
		"Europe/Isle_of_Man": "Europe/London",
		"Europe/Jersey": "Europe/London",
		"Europe/Ljubljana": "Europe/Belgrade",
		"Europe/Mariehamn": "Europe/Helsinki",
		"Europe/Nicosia": "Asia/Nicosia",
		"Europe/Podgorica": "Europe/Belgrade",
		"Europe/San_Marino": "Europe/Rome",
		"Europe/Sarajevo": "Europe/Belgrade",
		"Europe/Skopje": "Europe/Belgrade",
		"Europe/Tiraspol": "Europe/Chisinau",
		"Europe/Vatican": "Europe/Rome",
		"Europe/Zagreb": "Europe/Belgrade",
		"GB": "Europe/London",
		"GB-Eire": "Europe/London",
		"GMT": "Etc/GMT",
		"GMT+0": "Etc/GMT",
		"GMT-0": "Etc/GMT",
		"GMT0": "Etc/GMT",
		"Greenwich": "Etc/GMT",
		"Hongkong": "Asia/Hong_Kong",
		"Iceland": "Atlantic/Reykjavik",
		"Iran": "Asia/Tehran",
		"Israel": "Asia/Jerusalem",
		"Jamaica": "America/Jamaica",
		"Japan": "Asia/Tokyo",
		"Kwajalein": "Pacific/Kwajalein",
		"Libya": "Africa/Tripoli",
		"Mexico/BajaNorte": "America/Tijuana",
		"Mexico/BajaSur": "America/Mazatlan",
		"Mexico/General": "America/Mexico_City",
		"NZ": "Pacific/Auckland",
		"NZ-CHAT": "Pacific/Chatham",
		"Navajo": "America/Denver",
		"PRC": "Asia/Shanghai",
		"Pacific/Ponape": "Pacific/Pohnpei",
		"Pacific/Samoa": "Pacific/Pago_Pago",
		"Pacific/Truk": "Pacific/Chuuk",
		"Pacific/Yap": "Pacific/Chuuk",
		"Poland": "Europe/Warsaw",
		"Portugal": "Europe/Lisbon",
		"ROC": "Asia/Taipei",
		"ROK": "Asia/Seoul",
		"Singapore": "Asia/Singapore",
		"Turkey": "Europe/Istanbul",
		"UCT": "Etc/UCT",
		"US/Alaska": "America/Anchorage",
		"US/Aleutian": "America/Adak",
		"US/Arizona": "America/Phoenix",
		"US/Central": "America/Chicago",
		"US/East-Indiana": "America/Indiana/Indianapolis",
		"US/Eastern": "America/New_York",
		"US/Hawaii": "Pacific/Honolulu",
		"US/Indiana-Starke": "America/Indiana/Knox",
		"US/Michigan": "America/Detroit",
		"US/Mountain": "America/Denver",
		"US/Pacific": "America/Los_Angeles",
		"US/Samoa": "Pacific/Pago_Pago",
		"UTC": "Etc/UTC",
		"Universal": "Etc/UTC",
		"W-SU": "Europe/Moscow",
		"Zulu": "Etc/UTC"
	},
	"meta": {
		"Africa/Abidjan": {
			"lat": 5.3167,
			"lon": -3.9667,
			"rules": ""
		},
		"Africa/Accra": {
			"lat": 5.55,
			"lon": 0.2167,
			"rules": "Ghana"
		},
		"Africa/Addis_Ababa": {
			"lat": 9.0333,
			"lon": 38.7,
			"rules": ""
		},
		"Africa/Algiers": {
			"lat": 36.7833,
			"lon": 3.05,
			"rules": "Algeria"
		},
		"Africa/Asmara": {
			"lat": 15.3333,
			"lon": 38.8833,
			"rules": ""
		},
		"Africa/Bamako": {
			"lat": 12.65,
			"lon": -8,
			"rules": ""
		},
		"Africa/Bangui": {
			"lat": 4.3667,
			"lon": 18.5833,
			"rules": ""
		},
		"Africa/Banjul": {
			"lat": 13.4667,
			"lon": -15.35,
			"rules": ""
		},
		"Africa/Bissau": {
			"lat": 11.85,
			"lon": -14.4167,
			"rules": ""
		},
		"Africa/Blantyre": {
			"lat": -14.2167,
			"lon": 35,
			"rules": ""
		},
		"Africa/Brazzaville": {
			"lat": -3.7333,
			"lon": 15.2833,
			"rules": ""
		},
		"Africa/Bujumbura": {
			"lat": -2.6167,
			"lon": 29.3667,
			"rules": ""
		},
		"Africa/Cairo": {
			"lat": 30.05,
			"lon": 31.25,
			"rules": "Egypt"
		},
		"Africa/Casablanca": {
			"lat": 33.65,
			"lon": -6.4167,
			"rules": "Morocco"
		},
		"Africa/Ceuta": {
			"lat": 35.8833,
			"lon": -4.6833,
			"rules": "Spain SpainAfrica EU"
		},
		"Africa/Conakry": {
			"lat": 9.5167,
			"lon": -12.2833,
			"rules": ""
		},
		"Africa/Dakar": {
			"lat": 14.6667,
			"lon": -16.5667,
			"rules": ""
		},
		"Africa/Dar_es_Salaam": {
			"lat": -5.2,
			"lon": 39.2833,
			"rules": ""
		},
		"Africa/Djibouti": {
			"lat": 11.6,
			"lon": 43.15,
			"rules": ""
		},
		"Africa/Douala": {
			"lat": 4.05,
			"lon": 9.7,
			"rules": ""
		},
		"Africa/El_Aaiun": {
			"lat": 27.15,
			"lon": -12.8,
			"rules": ""
		},
		"Africa/Freetown": {
			"lat": 8.5,
			"lon": -12.75,
			"rules": "SL"
		},
		"Africa/Gaborone": {
			"lat": -23.35,
			"lon": 25.9167,
			"rules": ""
		},
		"Africa/Harare": {
			"lat": -16.1667,
			"lon": 31.05,
			"rules": ""
		},
		"Africa/Johannesburg": {
			"lat": -25.75,
			"lon": 28,
			"rules": "SA"
		},
		"Africa/Juba": {
			"lat": 4.85,
			"lon": 31.6,
			"rules": "Sudan"
		},
		"Africa/Kampala": {
			"lat": 0.3167,
			"lon": 32.4167,
			"rules": ""
		},
		"Africa/Khartoum": {
			"lat": 15.6,
			"lon": 32.5333,
			"rules": "Sudan"
		},
		"Africa/Kigali": {
			"lat": -0.05,
			"lon": 30.0667,
			"rules": ""
		},
		"Africa/Kinshasa": {
			"lat": -3.7,
			"lon": 15.3,
			"rules": ""
		},
		"Africa/Lagos": {
			"lat": 6.45,
			"lon": 3.4,
			"rules": ""
		},
		"Africa/Libreville": {
			"lat": 0.3833,
			"lon": 9.45,
			"rules": ""
		},
		"Africa/Lome": {
			"lat": 6.1333,
			"lon": 1.2167,
			"rules": ""
		},
		"Africa/Luanda": {
			"lat": -7.2,
			"lon": 13.2333,
			"rules": ""
		},
		"Africa/Lubumbashi": {
			"lat": -10.3333,
			"lon": 27.4667,
			"rules": ""
		},
		"Africa/Lusaka": {
			"lat": -14.5833,
			"lon": 28.2833,
			"rules": ""
		},
		"Africa/Malabo": {
			"lat": 3.75,
			"lon": 8.7833,
			"rules": ""
		},
		"Africa/Maputo": {
			"lat": -24.0333,
			"lon": 32.5833,
			"rules": ""
		},
		"Africa/Maseru": {
			"lat": -28.5333,
			"lon": 27.5,
			"rules": ""
		},
		"Africa/Mbabane": {
			"lat": -25.7,
			"lon": 31.1,
			"rules": ""
		},
		"Africa/Mogadishu": {
			"lat": 2.0667,
			"lon": 45.3667,
			"rules": ""
		},
		"Africa/Monrovia": {
			"lat": 6.3,
			"lon": -9.2167,
			"rules": ""
		},
		"Africa/Nairobi": {
			"lat": -0.7167,
			"lon": 36.8167,
			"rules": ""
		},
		"Africa/Ndjamena": {
			"lat": 12.1167,
			"lon": 15.05,
			"rules": ""
		},
		"Africa/Niamey": {
			"lat": 13.5167,
			"lon": 2.1167,
			"rules": ""
		},
		"Africa/Nouakchott": {
			"lat": 18.1,
			"lon": -14.05,
			"rules": ""
		},
		"Africa/Ouagadougou": {
			"lat": 12.3667,
			"lon": -0.4833,
			"rules": ""
		},
		"Africa/Porto-Novo": {
			"lat": 6.4833,
			"lon": 2.6167,
			"rules": ""
		},
		"Africa/Sao_Tome": {
			"lat": 0.3333,
			"lon": 6.7333,
			"rules": ""
		},
		"Africa/Tripoli": {
			"lat": 32.9,
			"lon": 13.1833,
			"rules": "Libya"
		},
		"Africa/Tunis": {
			"lat": 36.8,
			"lon": 10.1833,
			"rules": "Tunisia"
		},
		"Africa/Windhoek": {
			"lat": -21.4333,
			"lon": 17.1,
			"rules": "Namibia"
		},
		"America/Adak": {
			"lat": 51.88,
			"lon": -175.3419,
			"rules": "US"
		},
		"America/Anchorage": {
			"lat": 61.2181,
			"lon": -148.0997,
			"rules": "US"
		},
		"America/Anguilla": {
			"lat": 18.2,
			"lon": -62.9333,
			"rules": ""
		},
		"America/Antigua": {
			"lat": 17.05,
			"lon": -60.2,
			"rules": ""
		},
		"America/Araguaina": {
			"lat": -6.8,
			"lon": -47.8,
			"rules": "Brazil"
		},
		"America/Argentina/Buenos_Aires": {
			"lat": -33.4,
			"lon": -57.55,
			"rules": "Arg"
		},
		"America/Argentina/Catamarca": {
			"lat": -27.5333,
			"lon": -64.2167,
			"rules": "Arg"
		},
		"America/Argentina/Cordoba": {
			"lat": -30.6,
			"lon": -63.8167,
			"rules": "Arg"
		},
		"America/Argentina/Jujuy": {
			"lat": -23.8167,
			"lon": -64.7,
			"rules": "Arg"
		},
		"America/Argentina/La_Rioja": {
			"lat": -28.5667,
			"lon": -65.15,
			"rules": "Arg"
		},
		"America/Argentina/Mendoza": {
			"lat": -31.1167,
			"lon": -67.1833,
			"rules": "Arg"
		},
		"America/Argentina/Rio_Gallegos": {
			"lat": -50.3667,
			"lon": -68.7833,
			"rules": "Arg"
		},
		"America/Argentina/Salta": {
			"lat": -23.2167,
			"lon": -64.5833,
			"rules": "Arg"
		},
		"America/Argentina/San_Juan": {
			"lat": -30.4667,
			"lon": -67.4833,
			"rules": "Arg"
		},
		"America/Argentina/San_Luis": {
			"lat": -32.6833,
			"lon": -65.65,
			"rules": "Arg SanLuis"
		},
		"America/Argentina/Tucuman": {
			"lat": -25.1833,
			"lon": -64.7833,
			"rules": "Arg"
		},
		"America/Argentina/Ushuaia": {
			"lat": -53.2,
			"lon": -67.7,
			"rules": "Arg"
		},
		"America/Aruba": {
			"lat": 12.5,
			"lon": -68.0333,
			"rules": ""
		},
		"America/Asuncion": {
			"lat": -24.7333,
			"lon": -56.3333,
			"rules": "Para"
		},
		"America/Atikokan": {
			"lat": 48.7586,
			"lon": -90.3783,
			"rules": "Canada"
		},
		"America/Bahia": {
			"lat": -11.0167,
			"lon": -37.4833,
			"rules": "Brazil"
		},
		"America/Bahia_Banderas": {
			"lat": 20.8,
			"lon": -104.75,
			"rules": "Mexico"
		},
		"America/Barbados": {
			"lat": 13.1,
			"lon": -58.3833,
			"rules": "Barb"
		},
		"America/Belem": {
			"lat": -0.55,
			"lon": -47.5167,
			"rules": "Brazil"
		},
		"America/Belize": {
			"lat": 17.5,
			"lon": -87.8,
			"rules": "Belize"
		},
		"America/Blanc-Sablon": {
			"lat": 51.4167,
			"lon": -56.8833,
			"rules": "Canada"
		},
		"America/Boa_Vista": {
			"lat": 2.8167,
			"lon": -59.3333,
			"rules": "Brazil"
		},
		"America/Bogota": {
			"lat": 4.6,
			"lon": -73.9167,
			"rules": "CO"
		},
		"America/Boise": {
			"lat": 43.6136,
			"lon": -115.7975,
			"rules": "US"
		},
		"America/Cambridge_Bay": {
			"lat": 69.1139,
			"lon": -104.9472,
			"rules": "NT_YK Canada"
		},
		"America/Campo_Grande": {
			"lat": -19.55,
			"lon": -53.3833,
			"rules": "Brazil"
		},
		"America/Cancun": {
			"lat": 21.0833,
			"lon": -85.2333,
			"rules": "Mexico"
		},
		"America/Caracas": {
			"lat": 10.5,
			"lon": -65.0667,
			"rules": ""
		},
		"America/Cayenne": {
			"lat": 4.9333,
			"lon": -51.6667,
			"rules": ""
		},
		"America/Cayman": {
			"lat": 19.3,
			"lon": -80.6167,
			"rules": ""
		},
		"America/Chicago": {
			"lat": 41.85,
			"lon": -86.35,
			"rules": "US Chicago"
		},
		"America/Chihuahua": {
			"lat": 28.6333,
			"lon": -105.9167,
			"rules": "Mexico"
		},
		"America/Costa_Rica": {
			"lat": 9.9333,
			"lon": -83.9167,
			"rules": "CR"
		},
		"America/Creston": {
			"lat": 49.1,
			"lon": -115.4833,
			"rules": ""
		},
		"America/Cuiaba": {
			"lat": -14.4167,
			"lon": -55.9167,
			"rules": "Brazil"
		},
		"America/Curacao": {
			"lat": 12.1833,
			"lon": -69,
			"rules": ""
		},
		"America/Danmarkshavn": {
			"lat": 76.7667,
			"lon": -17.3333,
			"rules": "EU"
		},
		"America/Dawson": {
			"lat": 64.0667,
			"lon": -138.5833,
			"rules": "NT_YK Canada"
		},
		"America/Dawson_Creek": {
			"lat": 59.7667,
			"lon": -119.7667,
			"rules": "Canada Vanc"
		},
		"America/Denver": {
			"lat": 39.7392,
			"lon": -103.0158,
			"rules": "US Denver"
		},
		"America/Detroit": {
			"lat": 42.3314,
			"lon": -82.9542,
			"rules": "US Detroit"
		},
		"America/Dominica": {
			"lat": 15.3,
			"lon": -60.6,
			"rules": ""
		},
		"America/Edmonton": {
			"lat": 53.55,
			"lon": -112.5333,
			"rules": "Edm Canada"
		},
		"America/Eirunepe": {
			"lat": -5.3333,
			"lon": -68.1333,
			"rules": "Brazil"
		},
		"America/El_Salvador": {
			"lat": 13.7,
			"lon": -88.8,
			"rules": "Salv"
		},
		"America/Fortaleza": {
			"lat": -2.2833,
			"lon": -37.5,
			"rules": "Brazil"
		},
		"America/Glace_Bay": {
			"lat": 46.2,
			"lon": -58.05,
			"rules": "Canada Halifax"
		},
		"America/Godthab": {
			"lat": 64.1833,
			"lon": -50.2667,
			"rules": "EU"
		},
		"America/Goose_Bay": {
			"lat": 53.3333,
			"lon": -59.5833,
			"rules": "Canada StJohns"
		},
		"America/Grand_Turk": {
			"lat": 21.4667,
			"lon": -70.8667,
			"rules": "TC"
		},
		"America/Grenada": {
			"lat": 12.05,
			"lon": -60.25,
			"rules": ""
		},
		"America/Guadeloupe": {
			"lat": 16.2333,
			"lon": -60.4667,
			"rules": ""
		},
		"America/Guatemala": {
			"lat": 14.6333,
			"lon": -89.4833,
			"rules": "Guat"
		},
		"America/Guayaquil": {
			"lat": -1.8333,
			"lon": -78.1667,
			"rules": ""
		},
		"America/Guyana": {
			"lat": 6.8,
			"lon": -57.8333,
			"rules": ""
		},
		"America/Halifax": {
			"lat": 44.65,
			"lon": -62.4,
			"rules": "Halifax Canada"
		},
		"America/Havana": {
			"lat": 23.1333,
			"lon": -81.6333,
			"rules": "Cuba"
		},
		"America/Hermosillo": {
			"lat": 29.0667,
			"lon": -109.0333,
			"rules": "Mexico"
		},
		"America/Indiana/Indianapolis": {
			"lat": 39.7683,
			"lon": -85.8419,
			"rules": "US Indianapolis"
		},
		"America/Indiana/Knox": {
			"lat": 41.2958,
			"lon": -85.375,
			"rules": "US Starke"
		},
		"America/Indiana/Marengo": {
			"lat": 38.3756,
			"lon": -85.6553,
			"rules": "US Marengo"
		},
		"America/Indiana/Petersburg": {
			"lat": 38.4919,
			"lon": -86.7214,
			"rules": "US Pike"
		},
		"America/Indiana/Tell_City": {
			"lat": 37.9531,
			"lon": -85.2386,
			"rules": "US Perry"
		},
		"America/Indiana/Vevay": {
			"lat": 38.7478,
			"lon": -84.9328,
			"rules": "US"
		},
		"America/Indiana/Vincennes": {
			"lat": 38.6772,
			"lon": -86.4714,
			"rules": "US Vincennes"
		},
		"America/Indiana/Winamac": {
			"lat": 41.0514,
			"lon": -85.3969,
			"rules": "US Pulaski"
		},
		"America/Inuvik": {
			"lat": 68.3497,
			"lon": -132.2833,
			"rules": "NT_YK Canada"
		},
		"America/Iqaluit": {
			"lat": 63.7333,
			"lon": -67.5333,
			"rules": "NT_YK Canada"
		},
		"America/Jamaica": {
			"lat": 18,
			"lon": -75.2,
			"rules": "US"
		},
		"America/Juneau": {
			"lat": 58.3019,
			"lon": -133.5803,
			"rules": "US"
		},
		"America/Kentucky/Louisville": {
			"lat": 38.2542,
			"lon": -84.2406,
			"rules": "US Louisville"
		},
		"America/Kentucky/Monticello": {
			"lat": 36.8297,
			"lon": -83.1508,
			"rules": "US"
		},
		"America/Kralendijk": {
			"lat": 12.1508,
			"lon": -67.7233,
			"rules": ""
		},
		"America/La_Paz": {
			"lat": -15.5,
			"lon": -67.85,
			"rules": ""
		},
		"America/Lima": {
			"lat": -11.95,
			"lon": -76.95,
			"rules": "Peru"
		},
		"America/Los_Angeles": {
			"lat": 34.0522,
			"lon": -117.7572,
			"rules": "US CA"
		},
		"America/Lower_Princes": {
			"lat": 18.0514,
			"lon": -62.9528,
			"rules": ""
		},
		"America/Maceio": {
			"lat": -8.3333,
			"lon": -34.2833,
			"rules": "Brazil"
		},
		"America/Managua": {
			"lat": 12.15,
			"lon": -85.7167,
			"rules": "Nic"
		},
		"America/Manaus": {
			"lat": -2.8667,
			"lon": -59.9833,
			"rules": "Brazil"
		},
		"America/Marigot": {
			"lat": 18.0667,
			"lon": -62.9167,
			"rules": ""
		},
		"America/Martinique": {
			"lat": 14.6,
			"lon": -60.9167,
			"rules": ""
		},
		"America/Matamoros": {
			"lat": 25.8333,
			"lon": -96.5,
			"rules": "US Mexico"
		},
		"America/Mazatlan": {
			"lat": 23.2167,
			"lon": -105.5833,
			"rules": "Mexico"
		},
		"America/Menominee": {
			"lat": 45.1078,
			"lon": -86.3858,
			"rules": "US Menominee"
		},
		"America/Merida": {
			"lat": 20.9667,
			"lon": -88.3833,
			"rules": "Mexico"
		},
		"America/Metlakatla": {
			"lat": 55.1269,
			"lon": -130.4236,
			"rules": "US"
		},
		"America/Mexico_City": {
			"lat": 19.4,
			"lon": -98.85,
			"rules": "Mexico"
		},
		"America/Miquelon": {
			"lat": 47.05,
			"lon": -55.6667,
			"rules": "Canada"
		},
		"America/Moncton": {
			"lat": 46.1,
			"lon": -63.2167,
			"rules": "Canada Moncton"
		},
		"America/Monterrey": {
			"lat": 25.6667,
			"lon": -99.6833,
			"rules": "US Mexico"
		},
		"America/Montevideo": {
			"lat": -33.1167,
			"lon": -55.8167,
			"rules": "Uruguay"
		},
		"America/Montreal": {
			"lat": 45.5167,
			"lon": -72.4333,
			"rules": "Mont Canada"
		},
		"America/Montserrat": {
			"lat": 16.7167,
			"lon": -61.7833,
			"rules": ""
		},
		"America/Nassau": {
			"lat": 25.0833,
			"lon": -76.65,
			"rules": "Bahamas US"
		},
		"America/New_York": {
			"lat": 40.7142,
			"lon": -73.9936,
			"rules": "US NYC"
		},
		"America/Nipigon": {
			"lat": 49.0167,
			"lon": -87.7333,
			"rules": "Canada"
		},
		"America/Nome": {
			"lat": 64.5011,
			"lon": -164.5936,
			"rules": "US"
		},
		"America/Noronha": {
			"lat": -2.15,
			"lon": -31.5833,
			"rules": "Brazil"
		},
		"America/North_Dakota/Beulah": {
			"lat": 47.2642,
			"lon": -100.2222,
			"rules": "US"
		},
		"America/North_Dakota/Center": {
			"lat": 47.1164,
			"lon": -100.7008,
			"rules": "US"
		},
		"America/North_Dakota/New_Salem": {
			"lat": 46.845,
			"lon": -100.5892,
			"rules": "US"
		},
		"America/Ojinaga": {
			"lat": 29.5667,
			"lon": -103.5833,
			"rules": "Mexico US"
		},
		"America/Panama": {
			"lat": 8.9667,
			"lon": -78.4667,
			"rules": ""
		},
		"America/Pangnirtung": {
			"lat": 66.1333,
			"lon": -64.2667,
			"rules": "NT_YK Canada"
		},
		"America/Paramaribo": {
			"lat": 5.8333,
			"lon": -54.8333,
			"rules": ""
		},
		"America/Phoenix": {
			"lat": 33.4483,
			"lon": -111.9267,
			"rules": "US"
		},
		"America/Port-au-Prince": {
			"lat": 18.5333,
			"lon": -71.6667,
			"rules": "Haiti"
		},
		"America/Port_of_Spain": {
			"lat": 10.65,
			"lon": -60.4833,
			"rules": ""
		},
		"America/Porto_Velho": {
			"lat": -7.2333,
			"lon": -62.1,
			"rules": "Brazil"
		},
		"America/Puerto_Rico": {
			"lat": 18.4683,
			"lon": -65.8939,
			"rules": "US"
		},
		"America/Rainy_River": {
			"lat": 48.7167,
			"lon": -93.4333,
			"rules": "Canada"
		},
		"America/Rankin_Inlet": {
			"lat": 62.8167,
			"lon": -91.9169,
			"rules": "NT_YK Canada"
		},
		"America/Recife": {
			"lat": -7.95,
			"lon": -33.1,
			"rules": "Brazil"
		},
		"America/Regina": {
			"lat": 50.4,
			"lon": -103.35,
			"rules": "Regina"
		},
		"America/Resolute": {
			"lat": 74.6956,
			"lon": -93.1708,
			"rules": "NT_YK Canada"
		},
		"America/Rio_Branco": {
			"lat": -8.0333,
			"lon": -66.2,
			"rules": "Brazil"
		},
		"America/Santa_Isabel": {
			"lat": 30.3,
			"lon": -113.1333,
			"rules": "CA US Mexico"
		},
		"America/Santarem": {
			"lat": -1.5667,
			"lon": -53.1333,
			"rules": "Brazil"
		},
		"America/Santiago": {
			"lat": -32.55,
			"lon": -69.3333,
			"rules": "Chile"
		},
		"America/Santo_Domingo": {
			"lat": 18.4667,
			"lon": -68.1,
			"rules": "DR US"
		},
		"America/Sao_Paulo": {
			"lat": -22.4667,
			"lon": -45.3833,
			"rules": "Brazil"
		},
		"America/Scoresbysund": {
			"lat": 70.4833,
			"lon": -20.0333,
			"rules": "C-Eur EU"
		},
		"America/Shiprock": {
			"lat": 36.7856,
			"lon": -107.3136,
			"rules": ""
		},
		"America/Sitka": {
			"lat": 57.1764,
			"lon": -134.6981,
			"rules": "US"
		},
		"America/St_Barthelemy": {
			"lat": 17.8833,
			"lon": -61.15,
			"rules": ""
		},
		"America/St_Johns": {
			"lat": 47.5667,
			"lon": -51.2833,
			"rules": "StJohns Canada"
		},
		"America/St_Kitts": {
			"lat": 17.3,
			"lon": -61.2833,
			"rules": ""
		},
		"America/St_Lucia": {
			"lat": 14.0167,
			"lon": -61,
			"rules": ""
		},
		"America/St_Thomas": {
			"lat": 18.35,
			"lon": -63.0667,
			"rules": ""
		},
		"America/St_Vincent": {
			"lat": 13.15,
			"lon": -60.7667,
			"rules": ""
		},
		"America/Swift_Current": {
			"lat": 50.2833,
			"lon": -106.1667,
			"rules": "Canada Regina Swift"
		},
		"America/Tegucigalpa": {
			"lat": 14.1,
			"lon": -86.7833,
			"rules": "Hond"
		},
		"America/Thule": {
			"lat": 76.5667,
			"lon": -67.2167,
			"rules": "Thule"
		},
		"America/Thunder_Bay": {
			"lat": 48.3833,
			"lon": -88.75,
			"rules": "Canada Mont"
		},
		"America/Tijuana": {
			"lat": 32.5333,
			"lon": -116.9833,
			"rules": "CA US Mexico"
		},
		"America/Toronto": {
			"lat": 43.65,
			"lon": -78.6167,
			"rules": "Canada Toronto"
		},
		"America/Tortola": {
			"lat": 18.45,
			"lon": -63.3833,
			"rules": ""
		},
		"America/Vancouver": {
			"lat": 49.2667,
			"lon": -122.8833,
			"rules": "Vanc Canada"
		},
		"America/Whitehorse": {
			"lat": 60.7167,
			"lon": -134.95,
			"rules": "NT_YK Canada"
		},
		"America/Winnipeg": {
			"lat": 49.8833,
			"lon": -96.85,
			"rules": "Winn Canada"
		},
		"America/Yakutat": {
			"lat": 59.5469,
			"lon": -138.2728,
			"rules": "US"
		},
		"America/Yellowknife": {
			"lat": 62.45,
			"lon": -113.65,
			"rules": "NT_YK Canada"
		},
		"Antarctica/Casey": {
			"lat": -65.7167,
			"lon": 110.5167,
			"rules": ""
		},
		"Antarctica/Davis": {
			"lat": -67.4167,
			"lon": 77.9667,
			"rules": ""
		},
		"Antarctica/DumontDUrville": {
			"lat": -65.3333,
			"lon": 140.0167,
			"rules": ""
		},
		"Antarctica/Macquarie": {
			"lat": -53.5,
			"lon": 158.95,
			"rules": "Aus AT"
		},
		"Antarctica/Mawson": {
			"lat": -66.4,
			"lon": 62.8833,
			"rules": ""
		},
		"Antarctica/McMurdo": {
			"lat": -76.1667,
			"lon": 166.6,
			"rules": "NZAQ"
		},
		"Antarctica/Palmer": {
			"lat": -63.2,
			"lon": -63.9,
			"rules": "ArgAQ ChileAQ"
		},
		"Antarctica/Rothera": {
			"lat": -66.4333,
			"lon": -67.8667,
			"rules": ""
		},
		"Antarctica/South_Pole": {
			"lat": -90,
			"lon": 0,
			"rules": ""
		},
		"Antarctica/Syowa": {
			"lat": -68.9939,
			"lon": 39.59,
			"rules": ""
		},
		"Antarctica/Vostok": {
			"lat": -77.6,
			"lon": 106.9,
			"rules": ""
		},
		"Arctic/Longyearbyen": {
			"lat": 78,
			"lon": 16,
			"rules": ""
		},
		"Asia/Aden": {
			"lat": 12.75,
			"lon": 45.2,
			"rules": ""
		},
		"Asia/Almaty": {
			"lat": 43.25,
			"lon": 76.95,
			"rules": "RussiaAsia"
		},
		"Asia/Amman": {
			"lat": 31.95,
			"lon": 35.9333,
			"rules": "Jordan"
		},
		"Asia/Anadyr": {
			"lat": 64.75,
			"lon": 177.4833,
			"rules": "Russia"
		},
		"Asia/Aqtau": {
			"lat": 44.5167,
			"lon": 50.2667,
			"rules": "RussiaAsia"
		},
		"Asia/Aqtobe": {
			"lat": 50.2833,
			"lon": 57.1667,
			"rules": "RussiaAsia"
		},
		"Asia/Ashgabat": {
			"lat": 37.95,
			"lon": 58.3833,
			"rules": "RussiaAsia"
		},
		"Asia/Baghdad": {
			"lat": 33.35,
			"lon": 44.4167,
			"rules": "Iraq"
		},
		"Asia/Bahrain": {
			"lat": 26.3833,
			"lon": 50.5833,
			"rules": ""
		},
		"Asia/Baku": {
			"lat": 40.3833,
			"lon": 49.85,
			"rules": "RussiaAsia EUAsia Azer"
		},
		"Asia/Bangkok": {
			"lat": 13.75,
			"lon": 100.5167,
			"rules": ""
		},
		"Asia/Beirut": {
			"lat": 33.8833,
			"lon": 35.5,
			"rules": "Lebanon"
		},
		"Asia/Bishkek": {
			"lat": 42.9,
			"lon": 74.6,
			"rules": "RussiaAsia Kyrgyz"
		},
		"Asia/Brunei": {
			"lat": 4.9333,
			"lon": 114.9167,
			"rules": ""
		},
		"Asia/Choibalsan": {
			"lat": 48.0667,
			"lon": 114.5,
			"rules": "Mongol"
		},
		"Asia/Chongqing": {
			"lat": 29.5667,
			"lon": 106.5833,
			"rules": "PRC"
		},
		"Asia/Colombo": {
			"lat": 6.9333,
			"lon": 79.85,
			"rules": ""
		},
		"Asia/Damascus": {
			"lat": 33.5,
			"lon": 36.3,
			"rules": "Syria"
		},
		"Asia/Dhaka": {
			"lat": 23.7167,
			"lon": 90.4167,
			"rules": "Dhaka"
		},
		"Asia/Dili": {
			"lat": -7.45,
			"lon": 125.5833,
			"rules": ""
		},
		"Asia/Dubai": {
			"lat": 25.3,
			"lon": 55.3,
			"rules": ""
		},
		"Asia/Dushanbe": {
			"lat": 38.5833,
			"lon": 68.8,
			"rules": "RussiaAsia"
		},
		"Asia/Gaza": {
			"lat": 31.5,
			"lon": 34.4667,
			"rules": "Zion EgyptAsia Jordan Palestine"
		},
		"Asia/Harbin": {
			"lat": 45.75,
			"lon": 126.6833,
			"rules": "PRC"
		},
		"Asia/Hebron": {
			"lat": 31.5333,
			"lon": 35.095,
			"rules": "Zion EgyptAsia Jordan Palestine"
		},
		"Asia/Ho_Chi_Minh": {
			"lat": 10.75,
			"lon": 106.6667,
			"rules": ""
		},
		"Asia/Hong_Kong": {
			"lat": 22.2833,
			"lon": 114.15,
			"rules": "HK"
		},
		"Asia/Hovd": {
			"lat": 48.0167,
			"lon": 91.65,
			"rules": "Mongol"
		},
		"Asia/Irkutsk": {
			"lat": 52.2667,
			"lon": 104.3333,
			"rules": "Russia"
		},
		"Asia/Jakarta": {
			"lat": -5.8333,
			"lon": 106.8,
			"rules": ""
		},
		"Asia/Jayapura": {
			"lat": -1.4667,
			"lon": 140.7,
			"rules": ""
		},
		"Asia/Jerusalem": {
			"lat": 31.7667,
			"lon": 35.2333,
			"rules": "Zion"
		},
		"Asia/Kabul": {
			"lat": 34.5167,
			"lon": 69.2,
			"rules": ""
		},
		"Asia/Kamchatka": {
			"lat": 53.0167,
			"lon": 158.65,
			"rules": "Russia"
		},
		"Asia/Karachi": {
			"lat": 24.8667,
			"lon": 67.05,
			"rules": "Pakistan"
		},
		"Asia/Kashgar": {
			"lat": 39.4833,
			"lon": 75.9833,
			"rules": "PRC"
		},
		"Asia/Kathmandu": {
			"lat": 27.7167,
			"lon": 85.3167,
			"rules": ""
		},
		"Asia/Khandyga": {
			"lat": 62.6564,
			"lon": 135.5539,
			"rules": "Russia"
		},
		"Asia/Kolkata": {
			"lat": 22.5333,
			"lon": 88.3667,
			"rules": ""
		},
		"Asia/Krasnoyarsk": {
			"lat": 56.0167,
			"lon": 92.8333,
			"rules": "Russia"
		},
		"Asia/Kuala_Lumpur": {
			"lat": 3.1667,
			"lon": 101.7,
			"rules": ""
		},
		"Asia/Kuching": {
			"lat": 1.55,
			"lon": 110.3333,
			"rules": "NBorneo"
		},
		"Asia/Kuwait": {
			"lat": 29.3333,
			"lon": 47.9833,
			"rules": ""
		},
		"Asia/Macau": {
			"lat": 22.2333,
			"lon": 113.5833,
			"rules": "Macau PRC"
		},
		"Asia/Magadan": {
			"lat": 59.5667,
			"lon": 150.8,
			"rules": "Russia"
		},
		"Asia/Makassar": {
			"lat": -4.8833,
			"lon": 119.4,
			"rules": ""
		},
		"Asia/Manila": {
			"lat": 14.5833,
			"lon": 121,
			"rules": "Phil"
		},
		"Asia/Muscat": {
			"lat": 23.6,
			"lon": 58.5833,
			"rules": ""
		},
		"Asia/Nicosia": {
			"lat": 35.1667,
			"lon": 33.3667,
			"rules": "Cyprus EUAsia"
		},
		"Asia/Novokuznetsk": {
			"lat": 53.75,
			"lon": 87.1167,
			"rules": "Russia"
		},
		"Asia/Novosibirsk": {
			"lat": 55.0333,
			"lon": 82.9167,
			"rules": "Russia"
		},
		"Asia/Omsk": {
			"lat": 55,
			"lon": 73.4,
			"rules": "Russia"
		},
		"Asia/Oral": {
			"lat": 51.2167,
			"lon": 51.35,
			"rules": "RussiaAsia"
		},
		"Asia/Phnom_Penh": {
			"lat": 11.55,
			"lon": 104.9167,
			"rules": ""
		},
		"Asia/Pontianak": {
			"lat": 0.0333,
			"lon": 109.3333,
			"rules": ""
		},
		"Asia/Pyongyang": {
			"lat": 39.0167,
			"lon": 125.75,
			"rules": ""
		},
		"Asia/Qatar": {
			"lat": 25.2833,
			"lon": 51.5333,
			"rules": ""
		},
		"Asia/Qyzylorda": {
			"lat": 44.8,
			"lon": 65.4667,
			"rules": "RussiaAsia"
		},
		"Asia/Rangoon": {
			"lat": 16.7833,
			"lon": 96.1667,
			"rules": ""
		},
		"Asia/Riyadh": {
			"lat": 24.6333,
			"lon": 46.7167,
			"rules": ""
		},
		"Asia/Sakhalin": {
			"lat": 46.9667,
			"lon": 142.7,
			"rules": "Russia"
		},
		"Asia/Samarkand": {
			"lat": 39.6667,
			"lon": 66.8,
			"rules": "RussiaAsia"
		},
		"Asia/Seoul": {
			"lat": 37.55,
			"lon": 126.9667,
			"rules": "ROK"
		},
		"Asia/Shanghai": {
			"lat": 31.2333,
			"lon": 121.4667,
			"rules": "Shang PRC"
		},
		"Asia/Singapore": {
			"lat": 1.2833,
			"lon": 103.85,
			"rules": ""
		},
		"Asia/Taipei": {
			"lat": 25.05,
			"lon": 121.5,
			"rules": "Taiwan"
		},
		"Asia/Tashkent": {
			"lat": 41.3333,
			"lon": 69.3,
			"rules": "RussiaAsia"
		},
		"Asia/Tbilisi": {
			"lat": 41.7167,
			"lon": 44.8167,
			"rules": "RussiaAsia E-EurAsia"
		},
		"Asia/Tehran": {
			"lat": 35.6667,
			"lon": 51.4333,
			"rules": "Iran"
		},
		"Asia/Thimphu": {
			"lat": 27.4667,
			"lon": 89.65,
			"rules": ""
		},
		"Asia/Tokyo": {
			"lat": 35.6544,
			"lon": 139.7447,
			"rules": "Japan"
		},
		"Asia/Ulaanbaatar": {
			"lat": 47.9167,
			"lon": 106.8833,
			"rules": "Mongol"
		},
		"Asia/Urumqi": {
			"lat": 43.8,
			"lon": 87.5833,
			"rules": "PRC"
		},
		"Asia/Ust-Nera": {
			"lat": 64.5603,
			"lon": 143.2267,
			"rules": "Russia"
		},
		"Asia/Vientiane": {
			"lat": 17.9667,
			"lon": 102.6,
			"rules": ""
		},
		"Asia/Vladivostok": {
			"lat": 43.1667,
			"lon": 131.9333,
			"rules": "Russia"
		},
		"Asia/Yakutsk": {
			"lat": 62,
			"lon": 129.6667,
			"rules": "Russia"
		},
		"Asia/Yekaterinburg": {
			"lat": 56.85,
			"lon": 60.6,
			"rules": "Russia"
		},
		"Asia/Yerevan": {
			"lat": 40.1833,
			"lon": 44.5,
			"rules": "RussiaAsia"
		},
		"Atlantic/Azores": {
			"lat": 37.7333,
			"lon": -24.3333,
			"rules": "Port W-Eur EU"
		},
		"Atlantic/Bermuda": {
			"lat": 32.2833,
			"lon": -63.2333,
			"rules": "Bahamas US"
		},
		"Atlantic/Canary": {
			"lat": 28.1,
			"lon": -14.6,
			"rules": "EU"
		},
		"Atlantic/Cape_Verde": {
			"lat": 14.9167,
			"lon": -22.4833,
			"rules": ""
		},
		"Atlantic/Faroe": {
			"lat": 62.0167,
			"lon": -5.2333,
			"rules": "EU"
		},
		"Atlantic/Madeira": {
			"lat": 32.6333,
			"lon": -15.1,
			"rules": "Port EU"
		},
		"Atlantic/Reykjavik": {
			"lat": 64.15,
			"lon": -20.15,
			"rules": "Iceland"
		},
		"Atlantic/South_Georgia": {
			"lat": -53.7333,
			"lon": -35.4667,
			"rules": ""
		},
		"Atlantic/St_Helena": {
			"lat": -14.0833,
			"lon": -4.3,
			"rules": ""
		},
		"Atlantic/Stanley": {
			"lat": -50.3,
			"lon": -56.15,
			"rules": "Falk"
		},
		"Australia/Adelaide": {
			"lat": -33.0833,
			"lon": 138.5833,
			"rules": "Aus AS"
		},
		"Australia/Brisbane": {
			"lat": -26.5333,
			"lon": 153.0333,
			"rules": "Aus AQ"
		},
		"Australia/Broken_Hill": {
			"lat": -30.05,
			"lon": 141.45,
			"rules": "Aus AN AS"
		},
		"Australia/Currie": {
			"lat": -38.0667,
			"lon": 143.8667,
			"rules": "Aus AT"
		},
		"Australia/Darwin": {
			"lat": -11.5333,
			"lon": 130.8333,
			"rules": "Aus"
		},
		"Australia/Eucla": {
			"lat": -30.2833,
			"lon": 128.8667,
			"rules": "Aus AW"
		},
		"Australia/Hobart": {
			"lat": -41.1167,
			"lon": 147.3167,
			"rules": "Aus AT"
		},
		"Australia/Lindeman": {
			"lat": -19.7333,
			"lon": 149,
			"rules": "Aus AQ Holiday"
		},
		"Australia/Lord_Howe": {
			"lat": -30.45,
			"lon": 159.0833,
			"rules": "LH"
		},
		"Australia/Melbourne": {
			"lat": -36.1833,
			"lon": 144.9667,
			"rules": "Aus AV"
		},
		"Australia/Perth": {
			"lat": -30.05,
			"lon": 115.85,
			"rules": "Aus AW"
		},
		"Australia/Sydney": {
			"lat": -32.1333,
			"lon": 151.2167,
			"rules": "Aus AN"
		},
		"CET": {
			"rules": "C-Eur"
		},
		"CST6CDT": {
			"rules": "US"
		},
		"EET": {
			"rules": "EU"
		},
		"EST": {
			"rules": ""
		},
		"EST5EDT": {
			"rules": "US"
		},
		"Etc/GMT": {
			"rules": ""
		},
		"Etc/GMT+1": {
			"rules": ""
		},
		"Etc/GMT+10": {
			"rules": ""
		},
		"Etc/GMT+11": {
			"rules": ""
		},
		"Etc/GMT+12": {
			"rules": ""
		},
		"Etc/GMT+2": {
			"rules": ""
		},
		"Etc/GMT+3": {
			"rules": ""
		},
		"Etc/GMT+4": {
			"rules": ""
		},
		"Etc/GMT+5": {
			"rules": ""
		},
		"Etc/GMT+6": {
			"rules": ""
		},
		"Etc/GMT+7": {
			"rules": ""
		},
		"Etc/GMT+8": {
			"rules": ""
		},
		"Etc/GMT+9": {
			"rules": ""
		},
		"Etc/GMT-1": {
			"rules": ""
		},
		"Etc/GMT-10": {
			"rules": ""
		},
		"Etc/GMT-11": {
			"rules": ""
		},
		"Etc/GMT-12": {
			"rules": ""
		},
		"Etc/GMT-13": {
			"rules": ""
		},
		"Etc/GMT-14": {
			"rules": ""
		},
		"Etc/GMT-2": {
			"rules": ""
		},
		"Etc/GMT-3": {
			"rules": ""
		},
		"Etc/GMT-4": {
			"rules": ""
		},
		"Etc/GMT-5": {
			"rules": ""
		},
		"Etc/GMT-6": {
			"rules": ""
		},
		"Etc/GMT-7": {
			"rules": ""
		},
		"Etc/GMT-8": {
			"rules": ""
		},
		"Etc/GMT-9": {
			"rules": ""
		},
		"Etc/UCT": {
			"rules": ""
		},
		"Etc/UTC": {
			"rules": ""
		},
		"Europe/Amsterdam": {
			"lat": 52.3667,
			"lon": 4.9,
			"rules": "Neth C-Eur EU"
		},
		"Europe/Andorra": {
			"lat": 42.5,
			"lon": 1.5167,
			"rules": "EU"
		},
		"Europe/Athens": {
			"lat": 37.9667,
			"lon": 23.7167,
			"rules": "Greece EU"
		},
		"Europe/Belgrade": {
			"lat": 44.8333,
			"lon": 20.5,
			"rules": "C-Eur EU"
		},
		"Europe/Berlin": {
			"lat": 52.5,
			"lon": 13.3667,
			"rules": "C-Eur SovietZone Germany EU"
		},
		"Europe/Bratislava": {
			"lat": 48.15,
			"lon": 17.1167,
			"rules": ""
		},
		"Europe/Brussels": {
			"lat": 50.8333,
			"lon": 4.3333,
			"rules": "C-Eur Belgium EU"
		},
		"Europe/Bucharest": {
			"lat": 44.4333,
			"lon": 26.1,
			"rules": "Romania C-Eur E-Eur EU"
		},
		"Europe/Budapest": {
			"lat": 47.5,
			"lon": 19.0833,
			"rules": "C-Eur Hungary EU"
		},
		"Europe/Busingen": {
			"lat": 47.7,
			"lon": 8.6833,
			"rules": ""
		},
		"Europe/Chisinau": {
			"lat": 47,
			"lon": 28.8333,
			"rules": "Romania C-Eur Russia E-Eur EU"
		},
		"Europe/Copenhagen": {
			"lat": 55.6667,
			"lon": 12.5833,
			"rules": "Denmark C-Eur EU"
		},
		"Europe/Dublin": {
			"lat": 53.3333,
			"lon": -5.75,
			"rules": "GB-Eire EU"
		},
		"Europe/Gibraltar": {
			"lat": 36.1333,
			"lon": -4.65,
			"rules": "GB-Eire EU"
		},
		"Europe/Guernsey": {
			"lat": 49.45,
			"lon": -1.4667,
			"rules": ""
		},
		"Europe/Helsinki": {
			"lat": 60.1667,
			"lon": 24.9667,
			"rules": "Finland EU"
		},
		"Europe/Isle_of_Man": {
			"lat": 54.15,
			"lon": -3.5333,
			"rules": ""
		},
		"Europe/Istanbul": {
			"lat": 41.0167,
			"lon": 28.9667,
			"rules": "Turkey EU"
		},
		"Europe/Jersey": {
			"lat": 49.2,
			"lon": -1.8833,
			"rules": ""
		},
		"Europe/Kaliningrad": {
			"lat": 54.7167,
			"lon": 20.5,
			"rules": "C-Eur Poland Russia"
		},
		"Europe/Kiev": {
			"lat": 50.4333,
			"lon": 30.5167,
			"rules": "C-Eur Russia E-Eur EU"
		},
		"Europe/Lisbon": {
			"lat": 38.7167,
			"lon": -8.8667,
			"rules": "Port W-Eur EU"
		},
		"Europe/Ljubljana": {
			"lat": 46.05,
			"lon": 14.5167,
			"rules": ""
		},
		"Europe/London": {
			"lat": 51.5083,
			"lon": 0.1253,
			"rules": "GB-Eire EU"
		},
		"Europe/Luxembourg": {
			"lat": 49.6,
			"lon": 6.15,
			"rules": "Lux Belgium C-Eur EU"
		},
		"Europe/Madrid": {
			"lat": 40.4,
			"lon": -2.3167,
			"rules": "Spain EU"
		},
		"Europe/Malta": {
			"lat": 35.9,
			"lon": 14.5167,
			"rules": "Italy C-Eur Malta EU"
		},
		"Europe/Mariehamn": {
			"lat": 60.1,
			"lon": 19.95,
			"rules": ""
		},
		"Europe/Minsk": {
			"lat": 53.9,
			"lon": 27.5667,
			"rules": "C-Eur Russia"
		},
		"Europe/Monaco": {
			"lat": 43.7,
			"lon": 7.3833,
			"rules": "France EU"
		},
		"Europe/Moscow": {
			"lat": 55.75,
			"lon": 37.5833,
			"rules": "Russia"
		},
		"Europe/Oslo": {
			"lat": 59.9167,
			"lon": 10.75,
			"rules": "Norway C-Eur EU"
		},
		"Europe/Paris": {
			"lat": 48.8667,
			"lon": 2.3333,
			"rules": "France C-Eur EU"
		},
		"Europe/Podgorica": {
			"lat": 42.4333,
			"lon": 19.2667,
			"rules": ""
		},
		"Europe/Prague": {
			"lat": 50.0833,
			"lon": 14.4333,
			"rules": "C-Eur Czech EU"
		},
		"Europe/Riga": {
			"lat": 56.95,
			"lon": 24.1,
			"rules": "C-Eur Russia Latvia EU"
		},
		"Europe/Rome": {
			"lat": 41.9,
			"lon": 12.4833,
			"rules": "Italy C-Eur EU"
		},
		"Europe/Samara": {
			"lat": 53.2,
			"lon": 50.15,
			"rules": "Russia"
		},
		"Europe/San_Marino": {
			"lat": 43.9167,
			"lon": 12.4667,
			"rules": ""
		},
		"Europe/Sarajevo": {
			"lat": 43.8667,
			"lon": 18.4167,
			"rules": ""
		},
		"Europe/Simferopol": {
			"lat": 44.95,
			"lon": 34.1,
			"rules": "C-Eur Russia E-Eur EU"
		},
		"Europe/Skopje": {
			"lat": 41.9833,
			"lon": 21.4333,
			"rules": ""
		},
		"Europe/Sofia": {
			"lat": 42.6833,
			"lon": 23.3167,
			"rules": "C-Eur Bulg E-Eur EU"
		},
		"Europe/Stockholm": {
			"lat": 59.3333,
			"lon": 18.05,
			"rules": "EU"
		},
		"Europe/Tallinn": {
			"lat": 59.4167,
			"lon": 24.75,
			"rules": "C-Eur Russia EU"
		},
		"Europe/Tirane": {
			"lat": 41.3333,
			"lon": 19.8333,
			"rules": "Albania EU"
		},
		"Europe/Uzhgorod": {
			"lat": 48.6167,
			"lon": 22.3,
			"rules": "C-Eur Russia E-Eur EU"
		},
		"Europe/Vaduz": {
			"lat": 47.15,
			"lon": 9.5167,
			"rules": "EU"
		},
		"Europe/Vatican": {
			"lat": 41.9022,
			"lon": 12.4531,
			"rules": ""
		},
		"Europe/Vienna": {
			"lat": 48.2167,
			"lon": 16.3333,
			"rules": "C-Eur Austria EU"
		},
		"Europe/Vilnius": {
			"lat": 54.6833,
			"lon": 25.3167,
			"rules": "C-Eur Russia EU"
		},
		"Europe/Volgograd": {
			"lat": 48.7333,
			"lon": 44.4167,
			"rules": "Russia"
		},
		"Europe/Warsaw": {
			"lat": 52.25,
			"lon": 21,
			"rules": "C-Eur Poland W-Eur EU"
		},
		"Europe/Zagreb": {
			"lat": 45.8,
			"lon": 15.9667,
			"rules": ""
		},
		"Europe/Zaporozhye": {
			"lat": 47.8333,
			"lon": 35.1667,
			"rules": "C-Eur Russia E-Eur EU"
		},
		"Europe/Zurich": {
			"lat": 47.3833,
			"lon": 8.5333,
			"rules": "Swiss EU"
		},
		"HST": {
			"rules": ""
		},
		"Indian/Antananarivo": {
			"lat": -17.0833,
			"lon": 47.5167,
			"rules": ""
		},
		"Indian/Chagos": {
			"lat": -6.6667,
			"lon": 72.4167,
			"rules": ""
		},
		"Indian/Christmas": {
			"lat": -9.5833,
			"lon": 105.7167,
			"rules": ""
		},
		"Indian/Cocos": {
			"lat": -11.8333,
			"lon": 96.9167,
			"rules": ""
		},
		"Indian/Comoro": {
			"lat": -10.3167,
			"lon": 43.2667,
			"rules": ""
		},
		"Indian/Kerguelen": {
			"lat": -48.6472,
			"lon": 70.2175,
			"rules": ""
		},
		"Indian/Mahe": {
			"lat": -3.3333,
			"lon": 55.4667,
			"rules": ""
		},
		"Indian/Maldives": {
			"lat": 4.1667,
			"lon": 73.5,
			"rules": ""
		},
		"Indian/Mauritius": {
			"lat": -19.8333,
			"lon": 57.5,
			"rules": "Mauritius"
		},
		"Indian/Mayotte": {
			"lat": -11.2167,
			"lon": 45.2333,
			"rules": ""
		},
		"Indian/Reunion": {
			"lat": -19.1333,
			"lon": 55.4667,
			"rules": ""
		},
		"MET": {
			"rules": "C-Eur"
		},
		"MST": {
			"rules": ""
		},
		"MST7MDT": {
			"rules": "US"
		},
		"PST8PDT": {
			"rules": "US"
		},
		"Pacific/Apia": {
			"lat": -12.1667,
			"lon": -170.2667,
			"rules": "WS"
		},
		"Pacific/Auckland": {
			"lat": -35.1333,
			"lon": 174.7667,
			"rules": "NZ"
		},
		"Pacific/Chatham": {
			"lat": -42.05,
			"lon": -175.45,
			"rules": "Chatham"
		},
		"Pacific/Chuuk": {
			"lat": 7.4167,
			"lon": 151.7833,
			"rules": ""
		},
		"Pacific/Easter": {
			"lat": -26.85,
			"lon": -108.5667,
			"rules": "Chile"
		},
		"Pacific/Efate": {
			"lat": -16.3333,
			"lon": 168.4167,
			"rules": "Vanuatu"
		},
		"Pacific/Enderbury": {
			"lat": -2.8667,
			"lon": -170.9167,
			"rules": ""
		},
		"Pacific/Fakaofo": {
			"lat": -8.6333,
			"lon": -170.7667,
			"rules": ""
		},
		"Pacific/Fiji": {
			"lat": -17.8667,
			"lon": 178.4167,
			"rules": "Fiji"
		},
		"Pacific/Funafuti": {
			"lat": -7.4833,
			"lon": 179.2167,
			"rules": ""
		},
		"Pacific/Galapagos": {
			"lat": 0.9,
			"lon": -88.4,
			"rules": ""
		},
		"Pacific/Gambier": {
			"lat": -22.8667,
			"lon": -133.05,
			"rules": ""
		},
		"Pacific/Guadalcanal": {
			"lat": -8.4667,
			"lon": 160.2,
			"rules": ""
		},
		"Pacific/Guam": {
			"lat": 13.4667,
			"lon": 144.75,
			"rules": ""
		},
		"Pacific/Honolulu": {
			"lat": 21.3069,
			"lon": -156.1417,
			"rules": ""
		},
		"Pacific/Johnston": {
			"lat": 16.75,
			"lon": -168.4833,
			"rules": ""
		},
		"Pacific/Kiritimati": {
			"lat": 1.8667,
			"lon": -156.6667,
			"rules": ""
		},
		"Pacific/Kosrae": {
			"lat": 5.3167,
			"lon": 162.9833,
			"rules": ""
		},
		"Pacific/Kwajalein": {
			"lat": 9.0833,
			"lon": 167.3333,
			"rules": ""
		},
		"Pacific/Majuro": {
			"lat": 7.15,
			"lon": 171.2,
			"rules": ""
		},
		"Pacific/Marquesas": {
			"lat": -9,
			"lon": -138.5,
			"rules": ""
		},
		"Pacific/Midway": {
			"lat": 28.2167,
			"lon": -176.6333,
			"rules": ""
		},
		"Pacific/Nauru": {
			"lat": 0.5167,
			"lon": 166.9167,
			"rules": ""
		},
		"Pacific/Niue": {
			"lat": -18.9833,
			"lon": -168.0833,
			"rules": ""
		},
		"Pacific/Norfolk": {
			"lat": -28.95,
			"lon": 167.9667,
			"rules": ""
		},
		"Pacific/Noumea": {
			"lat": -21.7333,
			"lon": 166.45,
			"rules": "NC"
		},
		"Pacific/Pago_Pago": {
			"lat": -13.7333,
			"lon": -169.3,
			"rules": ""
		},
		"Pacific/Palau": {
			"lat": 7.3333,
			"lon": 134.4833,
			"rules": ""
		},
		"Pacific/Pitcairn": {
			"lat": -24.9333,
			"lon": -129.9167,
			"rules": ""
		},
		"Pacific/Pohnpei": {
			"lat": 6.9667,
			"lon": 158.2167,
			"rules": ""
		},
		"Pacific/Port_Moresby": {
			"lat": -8.5,
			"lon": 147.1667,
			"rules": ""
		},
		"Pacific/Rarotonga": {
			"lat": -20.7667,
			"lon": -158.2333,
			"rules": "Cook"
		},
		"Pacific/Saipan": {
			"lat": 15.2,
			"lon": 145.75,
			"rules": ""
		},
		"Pacific/Tahiti": {
			"lat": -16.4667,
			"lon": -148.4333,
			"rules": ""
		},
		"Pacific/Tarawa": {
			"lat": 1.4167,
			"lon": 173,
			"rules": ""
		},
		"Pacific/Tongatapu": {
			"lat": -20.8333,
			"lon": -174.8333,
			"rules": "Tonga"
		},
		"Pacific/Wake": {
			"lat": 19.2833,
			"lon": 166.6167,
			"rules": ""
		},
		"Pacific/Wallis": {
			"lat": -12.7,
			"lon": -175.8333,
			"rules": ""
		},
		"WET": {
			"rules": "EU"
		}
	},
	"rules": {
		"AN": [
			"1971 1985 9 0 8 2 2 1",
			"1972 1972 1 27 7 2 2 0",
			"1973 1981 2 1 0 2 2 0",
			"1982 1982 3 1 0 2 2 0",
			"1983 1985 2 1 0 2 2 0",
			"1986 1989 2 15 0 2 2 0",
			"1986 1986 9 19 7 2 2 1",
			"1987 1999 9 0 8 2 2 1",
			"1990 1995 2 1 0 2 2 0",
			"1996 2005 2 0 8 2 2 0",
			"2000 2000 7 0 8 2 2 1",
			"2001 2007 9 0 8 2 2 1",
			"2006 2006 3 1 0 2 2 0",
			"2007 2007 2 0 8 2 2 0",
			"2008 9999 3 1 0 2 2 0",
			"2008 9999 9 1 0 2 2 1"
		],
		"AQ": [
			"1971 1971 9 0 8 2 2 1",
			"1972 1972 1 0 8 2 2 0",
			"1989 1991 9 0 8 2 2 1",
			"1990 1992 2 1 0 2 2 0"
		],
		"AS": [
			"1971 1985 9 0 8 2 2 1",
			"1986 1986 9 19 7 2 2 1",
			"1987 2007 9 0 8 2 2 1",
			"1972 1972 1 27 7 2 2 0",
			"1973 1985 2 1 0 2 2 0",
			"1986 1990 2 15 0 2 2 0",
			"1991 1991 2 3 7 2 2 0",
			"1992 1992 2 22 7 2 2 0",
			"1993 1993 2 7 7 2 2 0",
			"1994 1994 2 20 7 2 2 0",
			"1995 2005 2 0 8 2 2 0",
			"2006 2006 3 2 7 2 2 0",
			"2007 2007 2 0 8 2 2 0",
			"2008 9999 3 1 0 2 2 0",
			"2008 9999 9 1 0 2 2 1"
		],
		"AT": [
			"1967 1967 9 1 0 2 2 1",
			"1968 1968 2 0 8 2 2 0",
			"1968 1985 9 0 8 2 2 1",
			"1969 1971 2 8 0 2 2 0",
			"1972 1972 1 0 8 2 2 0",
			"1973 1981 2 1 0 2 2 0",
			"1982 1983 2 0 8 2 2 0",
			"1984 1986 2 1 0 2 2 0",
			"1986 1986 9 15 0 2 2 1",
			"1987 1990 2 15 0 2 2 0",
			"1987 1987 9 22 0 2 2 1",
			"1988 1990 9 0 8 2 2 1",
			"1991 1999 9 1 0 2 2 1",
			"1991 2005 2 0 8 2 2 0",
			"2000 2000 7 0 8 2 2 1",
			"2001 9999 9 1 0 2 2 1",
			"2006 2006 3 1 0 2 2 0",
			"2007 2007 2 0 8 2 2 0",
			"2008 9999 3 1 0 2 2 0"
		],
		"AV": [
			"1971 1985 9 0 8 2 2 1",
			"1972 1972 1 0 8 2 2 0",
			"1973 1985 2 1 0 2 2 0",
			"1986 1990 2 15 0 2 2 0",
			"1986 1987 9 15 0 2 2 1",
			"1988 1999 9 0 8 2 2 1",
			"1991 1994 2 1 0 2 2 0",
			"1995 2005 2 0 8 2 2 0",
			"2000 2000 7 0 8 2 2 1",
			"2001 2007 9 0 8 2 2 1",
			"2006 2006 3 1 0 2 2 0",
			"2007 2007 2 0 8 2 2 0",
			"2008 9999 3 1 0 2 2 0",
			"2008 9999 9 1 0 2 2 1"
		],
		"AW": [
			"1974 1974 9 0 8 2 2 1",
			"1975 1975 2 1 0 2 2 0",
			"1983 1983 9 0 8 2 2 1",
			"1984 1984 2 1 0 2 2 0",
			"1991 1991 10 17 7 2 2 1",
			"1992 1992 2 1 0 2 2 0",
			"2006 2006 11 3 7 2 2 1",
			"2007 2009 2 0 8 2 2 0",
			"2007 2008 9 0 8 2 2 1"
		],
		"Albania": [
			"1940 1940 5 16 7 0 0 1 S",
			"1942 1942 10 2 7 3 0 0",
			"1943 1943 2 29 7 2 0 1 S",
			"1943 1943 3 10 7 3 0 0",
			"1974 1974 4 4 7 0 0 1 S",
			"1974 1974 9 2 7 0 0 0",
			"1975 1975 4 1 7 0 0 1 S",
			"1975 1975 9 2 7 0 0 0",
			"1976 1976 4 2 7 0 0 1 S",
			"1976 1976 9 3 7 0 0 0",
			"1977 1977 4 8 7 0 0 1 S",
			"1977 1977 9 2 7 0 0 0",
			"1978 1978 4 6 7 0 0 1 S",
			"1978 1978 9 1 7 0 0 0",
			"1979 1979 4 5 7 0 0 1 S",
			"1979 1979 8 30 7 0 0 0",
			"1980 1980 4 3 7 0 0 1 S",
			"1980 1980 9 4 7 0 0 0",
			"1981 1981 3 26 7 0 0 1 S",
			"1981 1981 8 27 7 0 0 0",
			"1982 1982 4 2 7 0 0 1 S",
			"1982 1982 9 3 7 0 0 0",
			"1983 1983 3 18 7 0 0 1 S",
			"1983 1983 9 1 7 0 0 0",
			"1984 1984 3 1 7 0 0 1 S"
		],
		"Algeria": [
			"1916 1916 5 14 7 23 2 1 S",
			"1916 1919 9 1 0 23 2 0",
			"1917 1917 2 24 7 23 2 1 S",
			"1918 1918 2 9 7 23 2 1 S",
			"1919 1919 2 1 7 23 2 1 S",
			"1920 1920 1 14 7 23 2 1 S",
			"1920 1920 9 23 7 23 2 0",
			"1921 1921 2 14 7 23 2 1 S",
			"1921 1921 5 21 7 23 2 0",
			"1939 1939 8 11 7 23 2 1 S",
			"1939 1939 10 19 7 1 0 0",
			"1944 1945 3 1 1 2 0 1 S",
			"1944 1944 9 8 7 2 0 0",
			"1945 1945 8 16 7 1 0 0",
			"1971 1971 3 25 7 23 2 1 S",
			"1971 1971 8 26 7 23 2 0",
			"1977 1977 4 6 7 0 0 1 S",
			"1977 1977 9 21 7 0 0 0",
			"1978 1978 2 24 7 1 0 1 S",
			"1978 1978 8 22 7 3 0 0",
			"1980 1980 3 25 7 0 0 1 S",
			"1980 1980 9 31 7 2 0 0"
		],
		"Arg": [
			"1930 1930 11 1 7 0 0 1 S",
			"1931 1931 3 1 7 0 0 0",
			"1931 1931 9 15 7 0 0 1 S",
			"1932 1940 2 1 7 0 0 0",
			"1932 1939 10 1 7 0 0 1 S",
			"1940 1940 6 1 7 0 0 1 S",
			"1941 1941 5 15 7 0 0 0",
			"1941 1941 9 15 7 0 0 1 S",
			"1943 1943 7 1 7 0 0 0",
			"1943 1943 9 15 7 0 0 1 S",
			"1946 1946 2 1 7 0 0 0",
			"1946 1946 9 1 7 0 0 1 S",
			"1963 1963 9 1 7 0 0 0",
			"1963 1963 11 15 7 0 0 1 S",
			"1964 1966 2 1 7 0 0 0",
			"1964 1966 9 15 7 0 0 1 S",
			"1967 1967 3 2 7 0 0 0",
			"1967 1968 9 1 0 0 0 1 S",
			"1968 1969 3 1 0 0 0 0",
			"1974 1974 0 23 7 0 0 1 S",
			"1974 1974 4 1 7 0 0 0",
			"1988 1988 11 1 7 0 0 1 S",
			"1989 1993 2 1 0 0 0 0",
			"1989 1992 9 15 0 0 0 1 S",
			"1999 1999 9 1 0 0 0 1 S",
			"2000 2000 2 3 7 0 0 0",
			"2007 2007 11 30 7 0 0 1 S",
			"2008 2009 2 15 0 0 0 0",
			"2008 2008 9 15 0 0 0 1 S"
		],
		"ArgAQ": [
			"1964 1966 2 1 7 0 0 0",
			"1964 1966 9 15 7 0 0 1 S",
			"1967 1967 3 2 7 0 0 0",
			"1967 1968 9 1 0 0 0 1 S",
			"1968 1969 3 1 0 0 0 0",
			"1974 1974 0 23 7 0 0 1 S",
			"1974 1974 4 1 7 0 0 0"
		],
		"Aus": [
			"1917 1917 0 1 7 0:1 0 1",
			"1917 1917 2 25 7 2 0 0",
			"1942 1942 0 1 7 2 0 1",
			"1942 1942 2 29 7 2 0 0",
			"1942 1942 8 27 7 2 0 1",
			"1943 1944 2 0 8 2 0 0",
			"1943 1943 9 3 7 2 0 1"
		],
		"Austria": [
			"1920 1920 3 5 7 2 2 1 S",
			"1920 1920 8 13 7 2 2 0",
			"1946 1946 3 14 7 2 2 1 S",
			"1946 1948 9 1 0 2 2 0",
			"1947 1947 3 6 7 2 2 1 S",
			"1948 1948 3 18 7 2 2 1 S",
			"1980 1980 3 6 7 0 0 1 S",
			"1980 1980 8 28 7 0 0 0"
		],
		"Azer": [
			"1997 9999 2 0 8 4 0 1 S",
			"1997 9999 9 0 8 5 0 0"
		],
		"Bahamas": [
			"1964 1975 9 0 8 2 0 0 S",
			"1964 1975 3 0 8 2 0 1 D"
		],
		"Barb": [
			"1977 1977 5 12 7 2 0 1 D",
			"1977 1978 9 1 0 2 0 0 S",
			"1978 1980 3 15 0 2 0 1 D",
			"1979 1979 8 30 7 2 0 0 S",
			"1980 1980 8 25 7 2 0 0 S"
		],
		"Belgium": [
			"1918 1918 2 9 7 0 2 1 S",
			"1918 1919 9 1 6 23 2 0",
			"1919 1919 2 1 7 23 2 1 S",
			"1920 1920 1 14 7 23 2 1 S",
			"1920 1920 9 23 7 23 2 0",
			"1921 1921 2 14 7 23 2 1 S",
			"1921 1921 9 25 7 23 2 0",
			"1922 1922 2 25 7 23 2 1 S",
			"1922 1927 9 1 6 23 2 0",
			"1923 1923 3 21 7 23 2 1 S",
			"1924 1924 2 29 7 23 2 1 S",
			"1925 1925 3 4 7 23 2 1 S",
			"1926 1926 3 17 7 23 2 1 S",
			"1927 1927 3 9 7 23 2 1 S",
			"1928 1928 3 14 7 23 2 1 S",
			"1928 1938 9 2 0 2 2 0",
			"1929 1929 3 21 7 2 2 1 S",
			"1930 1930 3 13 7 2 2 1 S",
			"1931 1931 3 19 7 2 2 1 S",
			"1932 1932 3 3 7 2 2 1 S",
			"1933 1933 2 26 7 2 2 1 S",
			"1934 1934 3 8 7 2 2 1 S",
			"1935 1935 2 31 7 2 2 1 S",
			"1936 1936 3 19 7 2 2 1 S",
			"1937 1937 3 4 7 2 2 1 S",
			"1938 1938 2 27 7 2 2 1 S",
			"1939 1939 3 16 7 2 2 1 S",
			"1939 1939 10 19 7 2 2 0",
			"1940 1940 1 25 7 2 2 1 S",
			"1944 1944 8 17 7 2 2 0",
			"1945 1945 3 2 7 2 2 1 S",
			"1945 1945 8 16 7 2 2 0",
			"1946 1946 4 19 7 2 2 1 S",
			"1946 1946 9 7 7 2 2 0"
		],
		"Belize": [
			"1918 1942 9 2 0 0 0 0:30 HD",
			"1919 1943 1 9 0 0 0 0 S",
			"1973 1973 11 5 7 0 0 1 D",
			"1974 1974 1 9 7 0 0 0 S",
			"1982 1982 11 18 7 0 0 1 D",
			"1983 1983 1 12 7 0 0 0 S"
		],
		"Brazil": [
			"1931 1931 9 3 7 11 0 1 S",
			"1932 1933 3 1 7 0 0 0",
			"1932 1932 9 3 7 0 0 1 S",
			"1949 1952 11 1 7 0 0 1 S",
			"1950 1950 3 16 7 1 0 0",
			"1951 1952 3 1 7 0 0 0",
			"1953 1953 2 1 7 0 0 0",
			"1963 1963 11 9 7 0 0 1 S",
			"1964 1964 2 1 7 0 0 0",
			"1965 1965 0 31 7 0 0 1 S",
			"1965 1965 2 31 7 0 0 0",
			"1965 1965 11 1 7 0 0 1 S",
			"1966 1968 2 1 7 0 0 0",
			"1966 1967 10 1 7 0 0 1 S",
			"1985 1985 10 2 7 0 0 1 S",
			"1986 1986 2 15 7 0 0 0",
			"1986 1986 9 25 7 0 0 1 S",
			"1987 1987 1 14 7 0 0 0",
			"1987 1987 9 25 7 0 0 1 S",
			"1988 1988 1 7 7 0 0 0",
			"1988 1988 9 16 7 0 0 1 S",
			"1989 1989 0 29 7 0 0 0",
			"1989 1989 9 15 7 0 0 1 S",
			"1990 1990 1 11 7 0 0 0",
			"1990 1990 9 21 7 0 0 1 S",
			"1991 1991 1 17 7 0 0 0",
			"1991 1991 9 20 7 0 0 1 S",
			"1992 1992 1 9 7 0 0 0",
			"1992 1992 9 25 7 0 0 1 S",
			"1993 1993 0 31 7 0 0 0",
			"1993 1995 9 11 0 0 0 1 S",
			"1994 1995 1 15 0 0 0 0",
			"1996 1996 1 11 7 0 0 0",
			"1996 1996 9 6 7 0 0 1 S",
			"1997 1997 1 16 7 0 0 0",
			"1997 1997 9 6 7 0 0 1 S",
			"1998 1998 2 1 7 0 0 0",
			"1998 1998 9 11 7 0 0 1 S",
			"1999 1999 1 21 7 0 0 0",
			"1999 1999 9 3 7 0 0 1 S",
			"2000 2000 1 27 7 0 0 0",
			"2000 2001 9 8 0 0 0 1 S",
			"2001 2006 1 15 0 0 0 0",
			"2002 2002 10 3 7 0 0 1 S",
			"2003 2003 9 19 7 0 0 1 S",
			"2004 2004 10 2 7 0 0 1 S",
			"2005 2005 9 16 7 0 0 1 S",
			"2006 2006 10 5 7 0 0 1 S",
			"2007 2007 1 25 7 0 0 0",
			"2007 2007 9 8 0 0 0 1 S",
			"2008 9999 9 15 0 0 0 1 S",
			"2008 2011 1 15 0 0 0 0",
			"2012 2012 1 22 0 0 0 0",
			"2013 2014 1 15 0 0 0 0",
			"2015 2015 1 22 0 0 0 0",
			"2016 2022 1 15 0 0 0 0",
			"2023 2023 1 22 0 0 0 0",
			"2024 2025 1 15 0 0 0 0",
			"2026 2026 1 22 0 0 0 0",
			"2027 2033 1 15 0 0 0 0",
			"2034 2034 1 22 0 0 0 0",
			"2035 2036 1 15 0 0 0 0",
			"2037 2037 1 22 0 0 0 0",
			"2038 9999 1 15 0 0 0 0"
		],
		"Bulg": [
			"1979 1979 2 31 7 23 0 1 S",
			"1979 1979 9 1 7 1 0 0",
			"1980 1982 3 1 6 23 0 1 S",
			"1980 1980 8 29 7 1 0 0",
			"1981 1981 8 27 7 2 0 0"
		],
		"C-Eur": [
			"1916 1916 3 30 7 23 0 1 S",
			"1916 1916 9 1 7 1 0 0",
			"1917 1918 3 15 1 2 2 1 S",
			"1917 1918 8 15 1 2 2 0",
			"1940 1940 3 1 7 2 2 1 S",
			"1942 1942 10 2 7 2 2 0",
			"1943 1943 2 29 7 2 2 1 S",
			"1943 1943 9 4 7 2 2 0",
			"1944 1945 3 1 1 2 2 1 S",
			"1944 1944 9 2 7 2 2 0",
			"1945 1945 8 16 7 2 2 0",
			"1977 1980 3 1 0 2 2 1 S",
			"1977 1977 8 0 8 2 2 0",
			"1978 1978 9 1 7 2 2 0",
			"1979 1995 8 0 8 2 2 0",
			"1981 9999 2 0 8 2 2 1 S",
			"1996 9999 9 0 8 2 2 0"
		],
		"CA": [
			"1948 1948 2 14 7 2 0 1 D",
			"1949 1949 0 1 7 2 0 0 S",
			"1950 1966 3 0 8 2 0 1 D",
			"1950 1961 8 0 8 2 0 0 S",
			"1962 1966 9 0 8 2 0 0 S"
		],
		"CO": [
			"1992 1992 4 3 7 0 0 1 S",
			"1993 1993 3 4 7 0 0 0"
		],
		"CR": [
			"1979 1980 1 0 8 0 0 1 D",
			"1979 1980 5 1 0 0 0 0 S",
			"1991 1992 0 15 6 0 0 1 D",
			"1991 1991 6 1 7 0 0 0 S",
			"1992 1992 2 15 7 0 0 0 S"
		],
		"Canada": [
			"1918 1918 3 14 7 2 0 1 D",
			"1918 1918 9 27 7 2 0 0 S",
			"1942 1942 1 9 7 2 0 1 W",
			"1945 1945 7 14 7 23 1 1 P",
			"1945 1945 8 30 7 2 0 0 S",
			"1974 1986 3 0 8 2 0 1 D",
			"1974 2006 9 0 8 2 0 0 S",
			"1987 2006 3 1 0 2 0 1 D",
			"2007 9999 2 8 0 2 0 1 D",
			"2007 9999 10 1 0 2 0 0 S"
		],
		"Chatham": [
			"1974 1974 10 1 0 2:45 2 1 D",
			"1975 1975 1 0 8 2:45 2 0 S",
			"1975 1988 9 0 8 2:45 2 1 D",
			"1976 1989 2 1 0 2:45 2 0 S",
			"1989 1989 9 8 0 2:45 2 1 D",
			"1990 2006 9 1 0 2:45 2 1 D",
			"1990 2007 2 15 0 2:45 2 0 S",
			"2007 9999 8 0 8 2:45 2 1 D",
			"2008 9999 3 1 0 2:45 2 0 S"
		],
		"Chicago": [
			"1920 1920 5 13 7 2 0 1 D",
			"1920 1921 9 0 8 2 0 0 S",
			"1921 1921 2 0 8 2 0 1 D",
			"1922 1966 3 0 8 2 0 1 D",
			"1922 1954 8 0 8 2 0 0 S",
			"1955 1966 9 0 8 2 0 0 S"
		],
		"Chile": [
			"1927 1932 8 1 7 0 0 1 S",
			"1928 1932 3 1 7 0 0 0",
			"1942 1942 5 1 7 4 1 0",
			"1942 1942 7 1 7 5 1 1 S",
			"1946 1946 6 15 7 4 1 1 S",
			"1946 1946 8 1 7 3 1 0",
			"1947 1947 3 1 7 4 1 0",
			"1968 1968 10 3 7 4 1 1 S",
			"1969 1969 2 30 7 3 1 0",
			"1969 1969 10 23 7 4 1 1 S",
			"1970 1970 2 29 7 3 1 0",
			"1971 1971 2 14 7 3 1 0",
			"1970 1972 9 9 0 4 1 1 S",
			"1972 1986 2 9 0 3 1 0",
			"1973 1973 8 30 7 4 1 1 S",
			"1974 1987 9 9 0 4 1 1 S",
			"1987 1987 3 12 7 3 1 0",
			"1988 1989 2 9 0 3 1 0",
			"1988 1988 9 1 0 4 1 1 S",
			"1989 1989 9 9 0 4 1 1 S",
			"1990 1990 2 18 7 3 1 0",
			"1990 1990 8 16 7 4 1 1 S",
			"1991 1996 2 9 0 3 1 0",
			"1991 1997 9 9 0 4 1 1 S",
			"1997 1997 2 30 7 3 1 0",
			"1998 1998 2 9 0 3 1 0",
			"1998 1998 8 27 7 4 1 1 S",
			"1999 1999 3 4 7 3 1 0",
			"1999 2010 9 9 0 4 1 1 S",
			"2000 2007 2 9 0 3 1 0",
			"2008 2008 2 30 7 3 1 0",
			"2009 2009 2 9 0 3 1 0",
			"2010 2010 3 1 0 3 1 0",
			"2011 2011 4 2 0 3 1 0",
			"2011 2011 7 16 0 4 1 1 S",
			"2012 9999 3 23 0 3 1 0",
			"2012 9999 8 2 0 4 1 1 S"
		],
		"ChileAQ": [
			"1972 1986 2 9 0 3 1 0",
			"1974 1987 9 9 0 4 1 1 S",
			"1987 1987 3 12 7 3 1 0",
			"1988 1989 2 9 0 3 1 0",
			"1988 1988 9 1 0 4 1 1 S",
			"1989 1989 9 9 0 4 1 1 S",
			"1990 1990 2 18 7 3 1 0",
			"1990 1990 8 16 7 4 1 1 S",
			"1991 1996 2 9 0 3 1 0",
			"1991 1997 9 9 0 4 1 1 S",
			"1997 1997 2 30 7 3 1 0",
			"1998 1998 2 9 0 3 1 0",
			"1998 1998 8 27 7 4 1 1 S",
			"1999 1999 3 4 7 3 1 0",
			"1999 2010 9 9 0 4 1 1 S",
			"2000 2007 2 9 0 3 1 0",
			"2008 2008 2 30 7 3 1 0",
			"2009 2009 2 9 0 3 1 0",
			"2010 2010 3 1 0 3 1 0",
			"2011 2011 4 2 0 3 1 0",
			"2011 2011 7 16 0 4 1 1 S",
			"2012 9999 3 23 0 3 1 0",
			"2012 9999 8 2 0 4 1 1 S"
		],
		"Cook": [
			"1978 1978 10 12 7 0 0 0:30 HS",
			"1979 1991 2 1 0 0 0 0",
			"1979 1990 9 0 8 0 0 0:30 HS"
		],
		"Cuba": [
			"1928 1928 5 10 7 0 0 1 D",
			"1928 1928 9 10 7 0 0 0 S",
			"1940 1942 5 1 0 0 0 1 D",
			"1940 1942 8 1 0 0 0 0 S",
			"1945 1946 5 1 0 0 0 1 D",
			"1945 1946 8 1 0 0 0 0 S",
			"1965 1965 5 1 7 0 0 1 D",
			"1965 1965 8 30 7 0 0 0 S",
			"1966 1966 4 29 7 0 0 1 D",
			"1966 1966 9 2 7 0 0 0 S",
			"1967 1967 3 8 7 0 0 1 D",
			"1967 1968 8 8 0 0 0 0 S",
			"1968 1968 3 14 7 0 0 1 D",
			"1969 1977 3 0 8 0 0 1 D",
			"1969 1971 9 0 8 0 0 0 S",
			"1972 1974 9 8 7 0 0 0 S",
			"1975 1977 9 0 8 0 0 0 S",
			"1978 1978 4 7 7 0 0 1 D",
			"1978 1990 9 8 0 0 0 0 S",
			"1979 1980 2 15 0 0 0 1 D",
			"1981 1985 4 5 0 0 0 1 D",
			"1986 1989 2 14 0 0 0 1 D",
			"1990 1997 3 1 0 0 0 1 D",
			"1991 1995 9 8 0 0 2 0 S",
			"1996 1996 9 6 7 0 2 0 S",
			"1997 1997 9 12 7 0 2 0 S",
			"1998 1999 2 0 8 0 2 1 D",
			"1998 2003 9 0 8 0 2 0 S",
			"2000 2004 3 1 0 0 2 1 D",
			"2006 2010 9 0 8 0 2 0 S",
			"2007 2007 2 8 0 0 2 1 D",
			"2008 2008 2 15 0 0 2 1 D",
			"2009 2010 2 8 0 0 2 1 D",
			"2011 2011 2 15 0 0 2 1 D",
			"2011 2011 10 13 7 0 2 0 S",
			"2012 2012 3 1 7 0 2 1 D",
			"2012 9999 10 1 0 0 2 0 S",
			"2013 9999 2 8 0 0 2 1 D"
		],
		"Cyprus": [
			"1975 1975 3 13 7 0 0 1 S",
			"1975 1975 9 12 7 0 0 0",
			"1976 1976 4 15 7 0 0 1 S",
			"1976 1976 9 11 7 0 0 0",
			"1977 1980 3 1 0 0 0 1 S",
			"1977 1977 8 25 7 0 0 0",
			"1978 1978 9 2 7 0 0 0",
			"1979 1997 8 0 8 0 0 0",
			"1981 1998 2 0 8 0 0 1 S"
		],
		"Czech": [
			"1945 1945 3 8 7 2 2 1 S",
			"1945 1945 10 18 7 2 2 0",
			"1946 1946 4 6 7 2 2 1 S",
			"1946 1949 9 1 0 2 2 0",
			"1947 1947 3 20 7 2 2 1 S",
			"1948 1948 3 18 7 2 2 1 S",
			"1949 1949 3 9 7 2 2 1 S"
		],
		"DR": [
			"1966 1966 9 30 7 0 0 1 D",
			"1967 1967 1 28 7 0 0 0 S",
			"1969 1973 9 0 8 0 0 0:30 HD",
			"1970 1970 1 21 7 0 0 0 S",
			"1971 1971 0 20 7 0 0 0 S",
			"1972 1974 0 21 7 0 0 0 S"
		],
		"Denmark": [
			"1916 1916 4 14 7 23 0 1 S",
			"1916 1916 8 30 7 23 0 0",
			"1940 1940 4 15 7 0 0 1 S",
			"1945 1945 3 2 7 2 2 1 S",
			"1945 1945 7 15 7 2 2 0",
			"1946 1946 4 1 7 2 2 1 S",
			"1946 1946 8 1 7 2 2 0",
			"1947 1947 4 4 7 2 2 1 S",
			"1947 1947 7 10 7 2 2 0",
			"1948 1948 4 9 7 2 2 1 S",
			"1948 1948 7 8 7 2 2 0"
		],
		"Denver": [
			"1920 1921 2 0 8 2 0 1 D",
			"1920 1920 9 0 8 2 0 0 S",
			"1921 1921 4 22 7 2 0 0 S",
			"1965 1966 3 0 8 2 0 1 D",
			"1965 1966 9 0 8 2 0 0 S"
		],
		"Detroit": [
			"1948 1948 3 0 8 2 0 1 D",
			"1948 1948 8 0 8 2 0 0 S",
			"1967 1967 5 14 7 2 0 1 D",
			"1967 1967 9 0 8 2 0 0 S"
		],
		"Dhaka": [
			"2009 2009 5 19 7 23 0 1 S",
			"2009 2009 11 31 7 23:59 0 0"
		],
		"E-Eur": [
			"1977 1980 3 1 0 0 0 1 S",
			"1977 1977 8 0 8 0 0 0",
			"1978 1978 9 1 7 0 0 0",
			"1979 1995 8 0 8 0 0 0",
			"1981 9999 2 0 8 0 0 1 S",
			"1996 9999 9 0 8 0 0 0"
		],
		"E-EurAsia": [
			"1981 9999 2 0 8 0 0 1 S",
			"1979 1995 8 0 8 0 0 0",
			"1996 9999 9 0 8 0 0 0"
		],
		"EU": [
			"1977 1980 3 1 0 1 1 1 S",
			"1977 1977 8 0 8 1 1 0",
			"1978 1978 9 1 7 1 1 0",
			"1979 1995 8 0 8 1 1 0",
			"1981 9999 2 0 8 1 1 1 S",
			"1996 9999 9 0 8 1 1 0"
		],
		"EUAsia": [
			"1981 9999 2 0 8 1 1 1 S",
			"1979 1995 8 0 8 1 1 0",
			"1996 9999 9 0 8 1 1 0"
		],
		"Edm": [
			"1918 1919 3 8 0 2 0 1 D",
			"1918 1918 9 27 7 2 0 0 S",
			"1919 1919 4 27 7 2 0 0 S",
			"1920 1923 3 0 8 2 0 1 D",
			"1920 1920 9 0 8 2 0 0 S",
			"1921 1923 8 0 8 2 0 0 S",
			"1942 1942 1 9 7 2 0 1 W",
			"1945 1945 7 14 7 23 1 1 P",
			"1945 1945 8 0 8 2 0 0 S",
			"1947 1947 3 0 8 2 0 1 D",
			"1947 1947 8 0 8 2 0 0 S",
			"1967 1967 3 0 8 2 0 1 D",
			"1967 1967 9 0 8 2 0 0 S",
			"1969 1969 3 0 8 2 0 1 D",
			"1969 1969 9 0 8 2 0 0 S",
			"1972 1986 3 0 8 2 0 1 D",
			"1972 2006 9 0 8 2 0 0 S"
		],
		"Egypt": [
			"1940 1940 6 15 7 0 0 1 S",
			"1940 1940 9 1 7 0 0 0",
			"1941 1941 3 15 7 0 0 1 S",
			"1941 1941 8 16 7 0 0 0",
			"1942 1944 3 1 7 0 0 1 S",
			"1942 1942 9 27 7 0 0 0",
			"1943 1945 10 1 7 0 0 0",
			"1945 1945 3 16 7 0 0 1 S",
			"1957 1957 4 10 7 0 0 1 S",
			"1957 1958 9 1 7 0 0 0",
			"1958 1958 4 1 7 0 0 1 S",
			"1959 1981 4 1 7 1 0 1 S",
			"1959 1965 8 30 7 3 0 0",
			"1966 1994 9 1 7 3 0 0",
			"1982 1982 6 25 7 1 0 1 S",
			"1983 1983 6 12 7 1 0 1 S",
			"1984 1988 4 1 7 1 0 1 S",
			"1989 1989 4 6 7 1 0 1 S",
			"1990 1994 4 1 7 1 0 1 S",
			"1995 2010 3 5 8 0 2 1 S",
			"1995 2005 8 4 8 23 2 0",
			"2006 2006 8 21 7 23 2 0",
			"2007 2007 8 1 4 23 2 0",
			"2008 2008 7 4 8 23 2 0",
			"2009 2009 7 20 7 23 2 0",
			"2010 2010 7 11 7 0 0 0",
			"2010 2010 8 10 7 0 0 1 S",
			"2010 2010 8 4 8 23 2 0"
		],
		"EgyptAsia": [
			"1957 1957 4 10 7 0 0 1 S",
			"1957 1958 9 1 7 0 0 0",
			"1958 1958 4 1 7 0 0 1 S",
			"1959 1967 4 1 7 1 0 1 S",
			"1959 1965 8 30 7 3 0 0",
			"1966 1966 9 1 7 3 0 0"
		],
		"Falk": [
			"1937 1938 8 0 8 0 0 1 S",
			"1938 1942 2 19 0 0 0 0",
			"1939 1939 9 1 7 0 0 1 S",
			"1940 1942 8 0 8 0 0 1 S",
			"1943 1943 0 1 7 0 0 0",
			"1983 1983 8 0 8 0 0 1 S",
			"1984 1985 3 0 8 0 0 0",
			"1984 1984 8 16 7 0 0 1 S",
			"1985 2000 8 9 0 0 0 1 S",
			"1986 2000 3 16 0 0 0 0",
			"2001 2010 3 15 0 2 0 0",
			"2001 2010 8 1 0 2 0 1 S"
		],
		"Fiji": [
			"1998 1999 10 1 0 2 0 1 S",
			"1999 2000 1 0 8 3 0 0",
			"2009 2009 10 29 7 2 0 1 S",
			"2010 2010 2 0 8 3 0 0",
			"2010 9999 9 18 0 2 0 1 S",
			"2011 2011 2 1 0 3 0 0",
			"2012 9999 0 18 0 3 0 0"
		],
		"Finland": [
			"1942 1942 3 3 7 0 0 1 S",
			"1942 1942 9 3 7 0 0 0",
			"1981 1982 2 0 8 2 0 1 S",
			"1981 1982 8 0 8 3 0 0"
		],
		"France": [
			"1916 1916 5 14 7 23 2 1 S",
			"1916 1919 9 1 0 23 2 0",
			"1917 1917 2 24 7 23 2 1 S",
			"1918 1918 2 9 7 23 2 1 S",
			"1919 1919 2 1 7 23 2 1 S",
			"1920 1920 1 14 7 23 2 1 S",
			"1920 1920 9 23 7 23 2 0",
			"1921 1921 2 14 7 23 2 1 S",
			"1921 1921 9 25 7 23 2 0",
			"1922 1922 2 25 7 23 2 1 S",
			"1922 1938 9 1 6 23 2 0",
			"1923 1923 4 26 7 23 2 1 S",
			"1924 1924 2 29 7 23 2 1 S",
			"1925 1925 3 4 7 23 2 1 S",
			"1926 1926 3 17 7 23 2 1 S",
			"1927 1927 3 9 7 23 2 1 S",
			"1928 1928 3 14 7 23 2 1 S",
			"1929 1929 3 20 7 23 2 1 S",
			"1930 1930 3 12 7 23 2 1 S",
			"1931 1931 3 18 7 23 2 1 S",
			"1932 1932 3 2 7 23 2 1 S",
			"1933 1933 2 25 7 23 2 1 S",
			"1934 1934 3 7 7 23 2 1 S",
			"1935 1935 2 30 7 23 2 1 S",
			"1936 1936 3 18 7 23 2 1 S",
			"1937 1937 3 3 7 23 2 1 S",
			"1938 1938 2 26 7 23 2 1 S",
			"1939 1939 3 15 7 23 2 1 S",
			"1939 1939 10 18 7 23 2 0",
			"1940 1940 1 25 7 2 0 1 S",
			"1941 1941 4 5 7 0 0 2 M",
			"1941 1941 9 6 7 0 0 1 S",
			"1942 1942 2 9 7 0 0 2 M",
			"1942 1942 10 2 7 3 0 1 S",
			"1943 1943 2 29 7 2 0 2 M",
			"1943 1943 9 4 7 3 0 1 S",
			"1944 1944 3 3 7 2 0 2 M",
			"1944 1944 9 8 7 1 0 1 S",
			"1945 1945 3 2 7 2 0 2 M",
			"1945 1945 8 16 7 3 0 0",
			"1976 1976 2 28 7 1 0 1 S",
			"1976 1976 8 26 7 1 0 0"
		],
		"GB-Eire": [
			"1916 1916 4 21 7 2 2 1 BST",
			"1916 1916 9 1 7 2 2 0 GMT",
			"1917 1917 3 8 7 2 2 1 BST",
			"1917 1917 8 17 7 2 2 0 GMT",
			"1918 1918 2 24 7 2 2 1 BST",
			"1918 1918 8 30 7 2 2 0 GMT",
			"1919 1919 2 30 7 2 2 1 BST",
			"1919 1919 8 29 7 2 2 0 GMT",
			"1920 1920 2 28 7 2 2 1 BST",
			"1920 1920 9 25 7 2 2 0 GMT",
			"1921 1921 3 3 7 2 2 1 BST",
			"1921 1921 9 3 7 2 2 0 GMT",
			"1922 1922 2 26 7 2 2 1 BST",
			"1922 1922 9 8 7 2 2 0 GMT",
			"1923 1923 3 16 0 2 2 1 BST",
			"1923 1924 8 16 0 2 2 0 GMT",
			"1924 1924 3 9 0 2 2 1 BST",
			"1925 1926 3 16 0 2 2 1 BST",
			"1925 1938 9 2 0 2 2 0 GMT",
			"1927 1927 3 9 0 2 2 1 BST",
			"1928 1929 3 16 0 2 2 1 BST",
			"1930 1930 3 9 0 2 2 1 BST",
			"1931 1932 3 16 0 2 2 1 BST",
			"1933 1933 3 9 0 2 2 1 BST",
			"1934 1934 3 16 0 2 2 1 BST",
			"1935 1935 3 9 0 2 2 1 BST",
			"1936 1937 3 16 0 2 2 1 BST",
			"1938 1938 3 9 0 2 2 1 BST",
			"1939 1939 3 16 0 2 2 1 BST",
			"1939 1939 10 16 0 2 2 0 GMT",
			"1940 1940 1 23 0 2 2 1 BST",
			"1941 1941 4 2 0 1 2 2 BDST",
			"1941 1943 7 9 0 1 2 1 BST",
			"1942 1944 3 2 0 1 2 2 BDST",
			"1944 1944 8 16 0 1 2 1 BST",
			"1945 1945 3 2 1 1 2 2 BDST",
			"1945 1945 6 9 0 1 2 1 BST",
			"1945 1946 9 2 0 2 2 0 GMT",
			"1946 1946 3 9 0 2 2 1 BST",
			"1947 1947 2 16 7 2 2 1 BST",
			"1947 1947 3 13 7 1 2 2 BDST",
			"1947 1947 7 10 7 1 2 1 BST",
			"1947 1947 10 2 7 2 2 0 GMT",
			"1948 1948 2 14 7 2 2 1 BST",
			"1948 1948 9 31 7 2 2 0 GMT",
			"1949 1949 3 3 7 2 2 1 BST",
			"1949 1949 9 30 7 2 2 0 GMT",
			"1950 1952 3 14 0 2 2 1 BST",
			"1950 1952 9 21 0 2 2 0 GMT",
			"1953 1953 3 16 0 2 2 1 BST",
			"1953 1960 9 2 0 2 2 0 GMT",
			"1954 1954 3 9 0 2 2 1 BST",
			"1955 1956 3 16 0 2 2 1 BST",
			"1957 1957 3 9 0 2 2 1 BST",
			"1958 1959 3 16 0 2 2 1 BST",
			"1960 1960 3 9 0 2 2 1 BST",
			"1961 1963 2 0 8 2 2 1 BST",
			"1961 1968 9 23 0 2 2 0 GMT",
			"1964 1967 2 19 0 2 2 1 BST",
			"1968 1968 1 18 7 2 2 1 BST",
			"1972 1980 2 16 0 2 2 1 BST",
			"1972 1980 9 23 0 2 2 0 GMT",
			"1981 1995 2 0 8 1 1 1 BST",
			"1981 1989 9 23 0 1 1 0 GMT",
			"1990 1995 9 22 0 1 1 0 GMT"
		],
		"Germany": [
			"1946 1946 3 14 7 2 2 1 S",
			"1946 1946 9 7 7 2 2 0",
			"1947 1949 9 1 0 2 2 0",
			"1947 1947 3 6 7 3 2 1 S",
			"1947 1947 4 11 7 2 2 2 M",
			"1947 1947 5 29 7 3 0 1 S",
			"1948 1948 3 18 7 2 2 1 S",
			"1949 1949 3 10 7 2 2 1 S"
		],
		"Ghana": [
			"1936 1942 8 1 7 0 0 0:20 GHST",
			"1936 1942 11 31 7 0 0 0 GMT"
		],
		"Greece": [
			"1932 1932 6 7 7 0 0 1 S",
			"1932 1932 8 1 7 0 0 0",
			"1941 1941 3 7 7 0 0 1 S",
			"1942 1942 10 2 7 3 0 0",
			"1943 1943 2 30 7 0 0 1 S",
			"1943 1943 9 4 7 0 0 0",
			"1952 1952 6 1 7 0 0 1 S",
			"1952 1952 10 2 7 0 0 0",
			"1975 1975 3 12 7 0 2 1 S",
			"1975 1975 10 26 7 0 2 0",
			"1976 1976 3 11 7 2 2 1 S",
			"1976 1976 9 10 7 2 2 0",
			"1977 1978 3 1 0 2 2 1 S",
			"1977 1977 8 26 7 2 2 0",
			"1978 1978 8 24 7 4 0 0",
			"1979 1979 3 1 7 9 0 1 S",
			"1979 1979 8 29 7 2 0 0",
			"1980 1980 3 1 7 0 0 1 S",
			"1980 1980 8 28 7 0 0 0"
		],
		"Guat": [
			"1973 1973 10 25 7 0 0 1 D",
			"1974 1974 1 24 7 0 0 0 S",
			"1983 1983 4 21 7 0 0 1 D",
			"1983 1983 8 22 7 0 0 0 S",
			"1991 1991 2 23 7 0 0 1 D",
			"1991 1991 8 7 7 0 0 0 S",
			"2006 2006 3 30 7 0 0 1 D",
			"2006 2006 9 1 7 0 0 0 S"
		],
		"HK": [
			"1941 1941 3 1 7 3:30 0 1 S",
			"1941 1941 8 30 7 3:30 0 0",
			"1946 1946 3 20 7 3:30 0 1 S",
			"1946 1946 11 1 7 3:30 0 0",
			"1947 1947 3 13 7 3:30 0 1 S",
			"1947 1947 11 30 7 3:30 0 0",
			"1948 1948 4 2 7 3:30 0 1 S",
			"1948 1951 9 0 8 3:30 0 0",
			"1952 1952 9 25 7 3:30 0 0",
			"1949 1953 3 1 0 3:30 0 1 S",
			"1953 1953 10 1 7 3:30 0 0",
			"1954 1964 2 18 0 3:30 0 1 S",
			"1954 1954 9 31 7 3:30 0 0",
			"1955 1964 10 1 0 3:30 0 0",
			"1965 1976 3 16 0 3:30 0 1 S",
			"1965 1976 9 16 0 3:30 0 0",
			"1973 1973 11 30 7 3:30 0 1 S",
			"1979 1979 4 8 0 3:30 0 1 S",
			"1979 1979 9 16 0 3:30 0 0"
		],
		"Haiti": [
			"1983 1983 4 8 7 0 0 1 D",
			"1984 1987 3 0 8 0 0 1 D",
			"1983 1987 9 0 8 0 0 0 S",
			"1988 1997 3 1 0 1 2 1 D",
			"1988 1997 9 0 8 1 2 0 S",
			"2005 2006 3 1 0 0 0 1 D",
			"2005 2006 9 0 8 0 0 0 S",
			"2012 9999 2 8 0 2 0 1 D",
			"2012 9999 10 1 0 2 0 0 S"
		],
		"Halifax": [
			"1916 1916 3 1 7 0 0 1 D",
			"1916 1916 9 1 7 0 0 0 S",
			"1920 1920 4 9 7 0 0 1 D",
			"1920 1920 7 29 7 0 0 0 S",
			"1921 1921 4 6 7 0 0 1 D",
			"1921 1922 8 5 7 0 0 0 S",
			"1922 1922 3 30 7 0 0 1 D",
			"1923 1925 4 1 0 0 0 1 D",
			"1923 1923 8 4 7 0 0 0 S",
			"1924 1924 8 15 7 0 0 0 S",
			"1925 1925 8 28 7 0 0 0 S",
			"1926 1926 4 16 7 0 0 1 D",
			"1926 1926 8 13 7 0 0 0 S",
			"1927 1927 4 1 7 0 0 1 D",
			"1927 1927 8 26 7 0 0 0 S",
			"1928 1931 4 8 0 0 0 1 D",
			"1928 1928 8 9 7 0 0 0 S",
			"1929 1929 8 3 7 0 0 0 S",
			"1930 1930 8 15 7 0 0 0 S",
			"1931 1932 8 24 1 0 0 0 S",
			"1932 1932 4 1 7 0 0 1 D",
			"1933 1933 3 30 7 0 0 1 D",
			"1933 1933 9 2 7 0 0 0 S",
			"1934 1934 4 20 7 0 0 1 D",
			"1934 1934 8 16 7 0 0 0 S",
			"1935 1935 5 2 7 0 0 1 D",
			"1935 1935 8 30 7 0 0 0 S",
			"1936 1936 5 1 7 0 0 1 D",
			"1936 1936 8 14 7 0 0 0 S",
			"1937 1938 4 1 0 0 0 1 D",
			"1937 1941 8 24 1 0 0 0 S",
			"1939 1939 4 28 7 0 0 1 D",
			"1940 1941 4 1 0 0 0 1 D",
			"1946 1949 3 0 8 2 0 1 D",
			"1946 1949 8 0 8 2 0 0 S",
			"1951 1954 3 0 8 2 0 1 D",
			"1951 1954 8 0 8 2 0 0 S",
			"1956 1959 3 0 8 2 0 1 D",
			"1956 1959 8 0 8 2 0 0 S",
			"1962 1973 3 0 8 2 0 1 D",
			"1962 1973 9 0 8 2 0 0 S"
		],
		"Holiday": [
			"1992 1993 9 0 8 2 2 1",
			"1993 1994 2 1 0 2 2 0"
		],
		"Hond": [
			"1987 1988 4 1 0 0 0 1 D",
			"1987 1988 8 0 8 0 0 0 S",
			"2006 2006 4 1 0 0 0 1 D",
			"2006 2006 7 1 1 0 0 0 S"
		],
		"Hungary": [
			"1918 1918 3 1 7 3 0 1 S",
			"1918 1918 8 29 7 3 0 0",
			"1919 1919 3 15 7 3 0 1 S",
			"1919 1919 8 15 7 3 0 0",
			"1920 1920 3 5 7 3 0 1 S",
			"1920 1920 8 30 7 3 0 0",
			"1945 1945 4 1 7 23 0 1 S",
			"1945 1945 10 3 7 0 0 0",
			"1946 1946 2 31 7 2 2 1 S",
			"1946 1949 9 1 0 2 2 0",
			"1947 1949 3 4 0 2 2 1 S",
			"1950 1950 3 17 7 2 2 1 S",
			"1950 1950 9 23 7 2 2 0",
			"1954 1955 4 23 7 0 0 1 S",
			"1954 1955 9 3 7 0 0 0",
			"1956 1956 5 1 0 0 0 1 S",
			"1956 1956 8 0 8 0 0 0",
			"1957 1957 5 1 0 1 0 1 S",
			"1957 1957 8 0 8 3 0 0",
			"1980 1980 3 6 7 1 0 1 S"
		],
		"Iceland": [
			"1917 1918 1 19 7 23 0 1 S",
			"1917 1917 9 21 7 1 0 0",
			"1918 1918 10 16 7 1 0 0",
			"1939 1939 3 29 7 23 0 1 S",
			"1939 1939 10 29 7 2 0 0",
			"1940 1940 1 25 7 2 0 1 S",
			"1940 1940 10 3 7 2 0 0",
			"1941 1941 2 2 7 1 2 1 S",
			"1941 1941 10 2 7 1 2 0",
			"1942 1942 2 8 7 1 2 1 S",
			"1942 1942 9 25 7 1 2 0",
			"1943 1946 2 1 0 1 2 1 S",
			"1943 1948 9 22 0 1 2 0",
			"1947 1967 3 1 0 1 2 1 S",
			"1949 1949 9 30 7 1 2 0",
			"1950 1966 9 22 0 1 2 0",
			"1967 1967 9 29 7 1 2 0"
		],
		"Indianapolis": [
			"1941 1941 5 22 7 2 0 1 D",
			"1941 1954 8 0 8 2 0 0 S",
			"1946 1954 3 0 8 2 0 1 D"
		],
		"Iran": [
			"1978 1980 2 21 7 0 0 1 D",
			"1978 1978 9 21 7 0 0 0 S",
			"1979 1979 8 19 7 0 0 0 S",
			"1980 1980 8 23 7 0 0 0 S",
			"1991 1991 4 3 7 0 0 1 D",
			"1992 1995 2 22 7 0 0 1 D",
			"1991 1995 8 22 7 0 0 0 S",
			"1996 1996 2 21 7 0 0 1 D",
			"1996 1996 8 21 7 0 0 0 S",
			"1997 1999 2 22 7 0 0 1 D",
			"1997 1999 8 22 7 0 0 0 S",
			"2000 2000 2 21 7 0 0 1 D",
			"2000 2000 8 21 7 0 0 0 S",
			"2001 2003 2 22 7 0 0 1 D",
			"2001 2003 8 22 7 0 0 0 S",
			"2004 2004 2 21 7 0 0 1 D",
			"2004 2004 8 21 7 0 0 0 S",
			"2005 2005 2 22 7 0 0 1 D",
			"2005 2005 8 22 7 0 0 0 S",
			"2008 2008 2 21 7 0 0 1 D",
			"2008 2008 8 21 7 0 0 0 S",
			"2009 2011 2 22 7 0 0 1 D",
			"2009 2011 8 22 7 0 0 0 S",
			"2012 2012 2 21 7 0 0 1 D",
			"2012 2012 8 21 7 0 0 0 S",
			"2013 2015 2 22 7 0 0 1 D",
			"2013 2015 8 22 7 0 0 0 S",
			"2016 2016 2 21 7 0 0 1 D",
			"2016 2016 8 21 7 0 0 0 S",
			"2017 2019 2 22 7 0 0 1 D",
			"2017 2019 8 22 7 0 0 0 S",
			"2020 2020 2 21 7 0 0 1 D",
			"2020 2020 8 21 7 0 0 0 S",
			"2021 2023 2 22 7 0 0 1 D",
			"2021 2023 8 22 7 0 0 0 S",
			"2024 2024 2 21 7 0 0 1 D",
			"2024 2024 8 21 7 0 0 0 S",
			"2025 2027 2 22 7 0 0 1 D",
			"2025 2027 8 22 7 0 0 0 S",
			"2028 2029 2 21 7 0 0 1 D",
			"2028 2029 8 21 7 0 0 0 S",
			"2030 2031 2 22 7 0 0 1 D",
			"2030 2031 8 22 7 0 0 0 S",
			"2032 2033 2 21 7 0 0 1 D",
			"2032 2033 8 21 7 0 0 0 S",
			"2034 2035 2 22 7 0 0 1 D",
			"2034 2035 8 22 7 0 0 0 S",
			"2036 2037 2 21 7 0 0 1 D",
			"2036 2037 8 21 7 0 0 0 S"
		],
		"Iraq": [
			"1982 1982 4 1 7 0 0 1 D",
			"1982 1984 9 1 7 0 0 0 S",
			"1983 1983 2 31 7 0 0 1 D",
			"1984 1985 3 1 7 0 0 1 D",
			"1985 1990 8 0 8 1 2 0 S",
			"1986 1990 2 0 8 1 2 1 D",
			"1991 2007 3 1 7 3 2 1 D",
			"1991 2007 9 1 7 3 2 0 S"
		],
		"Italy": [
			"1916 1916 5 3 7 0 2 1 S",
			"1916 1916 9 1 7 0 2 0",
			"1917 1917 3 1 7 0 2 1 S",
			"1917 1917 8 30 7 0 2 0",
			"1918 1918 2 10 7 0 2 1 S",
			"1918 1919 9 1 0 0 2 0",
			"1919 1919 2 2 7 0 2 1 S",
			"1920 1920 2 21 7 0 2 1 S",
			"1920 1920 8 19 7 0 2 0",
			"1940 1940 5 15 7 0 2 1 S",
			"1944 1944 8 17 7 0 2 0",
			"1945 1945 3 2 7 2 0 1 S",
			"1945 1945 8 15 7 0 2 0",
			"1946 1946 2 17 7 2 2 1 S",
			"1946 1946 9 6 7 2 2 0",
			"1947 1947 2 16 7 0 2 1 S",
			"1947 1947 9 5 7 0 2 0",
			"1948 1948 1 29 7 2 2 1 S",
			"1948 1948 9 3 7 2 2 0",
			"1966 1968 4 22 0 0 0 1 S",
			"1966 1969 8 22 0 0 0 0",
			"1969 1969 5 1 7 0 0 1 S",
			"1970 1970 4 31 7 0 0 1 S",
			"1970 1970 8 0 8 0 0 0",
			"1971 1972 4 22 0 0 0 1 S",
			"1971 1971 8 0 8 1 0 0",
			"1972 1972 9 1 7 0 0 0",
			"1973 1973 5 3 7 0 0 1 S",
			"1973 1974 8 0 8 0 0 0",
			"1974 1974 4 26 7 0 0 1 S",
			"1975 1975 5 1 7 0 2 1 S",
			"1975 1977 8 0 8 0 2 0",
			"1976 1976 4 30 7 0 2 1 S",
			"1977 1979 4 22 0 0 2 1 S",
			"1978 1978 9 1 7 0 2 0",
			"1979 1979 8 30 7 0 2 0"
		],
		"Japan": [
			"1948 1948 4 1 0 2 0 1 D",
			"1948 1951 8 8 6 2 0 0 S",
			"1949 1949 3 1 0 2 0 1 D",
			"1950 1951 4 1 0 2 0 1 D"
		],
		"Jordan": [
			"1973 1973 5 6 7 0 0 1 S",
			"1973 1975 9 1 7 0 0 0",
			"1974 1977 4 1 7 0 0 1 S",
			"1976 1976 10 1 7 0 0 0",
			"1977 1977 9 1 7 0 0 0",
			"1978 1978 3 30 7 0 0 1 S",
			"1978 1978 8 30 7 0 0 0",
			"1985 1985 3 1 7 0 0 1 S",
			"1985 1985 9 1 7 0 0 0",
			"1986 1988 3 1 5 0 0 1 S",
			"1986 1990 9 1 5 0 0 0",
			"1989 1989 4 8 7 0 0 1 S",
			"1990 1990 3 27 7 0 0 1 S",
			"1991 1991 3 17 7 0 0 1 S",
			"1991 1991 8 27 7 0 0 0",
			"1992 1992 3 10 7 0 0 1 S",
			"1992 1993 9 1 5 0 0 0",
			"1993 1998 3 1 5 0 0 1 S",
			"1994 1994 8 15 5 0 0 0",
			"1995 1998 8 15 5 0 2 0",
			"1999 1999 6 1 7 0 2 1 S",
			"1999 2002 8 5 8 0 2 0",
			"2000 2001 2 4 8 0 2 1 S",
			"2002 9999 2 4 8 24 0 1 S",
			"2003 2003 9 24 7 0 2 0",
			"2004 2004 9 15 7 0 2 0",
			"2005 2005 8 5 8 0 2 0",
			"2006 2011 9 5 8 0 2 0",
			"2013 9999 9 5 8 0 2 0"
		],
		"Kyrgyz": [
			"1992 1996 3 7 0 0 2 1 S",
			"1992 1996 8 0 8 0 0 0",
			"1997 2005 2 0 8 2:30 0 1 S",
			"1997 2004 9 0 8 2:30 0 0"
		],
		"LH": [
			"1981 1984 9 0 8 2 0 1",
			"1982 1985 2 1 0 2 0 0",
			"1985 1985 9 0 8 2 0 0:30",
			"1986 1989 2 15 0 2 0 0",
			"1986 1986 9 19 7 2 0 0:30",
			"1987 1999 9 0 8 2 0 0:30",
			"1990 1995 2 1 0 2 0 0",
			"1996 2005 2 0 8 2 0 0",
			"2000 2000 7 0 8 2 0 0:30",
			"2001 2007 9 0 8 2 0 0:30",
			"2006 2006 3 1 0 2 0 0",
			"2007 2007 2 0 8 2 0 0",
			"2008 9999 3 1 0 2 0 0",
			"2008 9999 9 1 0 2 0 0:30"
		],
		"Latvia": [
			"1989 1996 2 0 8 2 2 1 S",
			"1989 1996 8 0 8 2 2 0"
		],
		"Lebanon": [
			"1920 1920 2 28 7 0 0 1 S",
			"1920 1920 9 25 7 0 0 0",
			"1921 1921 3 3 7 0 0 1 S",
			"1921 1921 9 3 7 0 0 0",
			"1922 1922 2 26 7 0 0 1 S",
			"1922 1922 9 8 7 0 0 0",
			"1923 1923 3 22 7 0 0 1 S",
			"1923 1923 8 16 7 0 0 0",
			"1957 1961 4 1 7 0 0 1 S",
			"1957 1961 9 1 7 0 0 0",
			"1972 1972 5 22 7 0 0 1 S",
			"1972 1977 9 1 7 0 0 0",
			"1973 1977 4 1 7 0 0 1 S",
			"1978 1978 3 30 7 0 0 1 S",
			"1978 1978 8 30 7 0 0 0",
			"1984 1987 4 1 7 0 0 1 S",
			"1984 1991 9 16 7 0 0 0",
			"1988 1988 5 1 7 0 0 1 S",
			"1989 1989 4 10 7 0 0 1 S",
			"1990 1992 4 1 7 0 0 1 S",
			"1992 1992 9 4 7 0 0 0",
			"1993 9999 2 0 8 0 0 1 S",
			"1993 1998 8 0 8 0 0 0",
			"1999 9999 9 0 8 0 0 0"
		],
		"Libya": [
			"1951 1951 9 14 7 2 0 1 S",
			"1952 1952 0 1 7 0 0 0",
			"1953 1953 9 9 7 2 0 1 S",
			"1954 1954 0 1 7 0 0 0",
			"1955 1955 8 30 7 0 0 1 S",
			"1956 1956 0 1 7 0 0 0",
			"1982 1984 3 1 7 0 0 1 S",
			"1982 1985 9 1 7 0 0 0",
			"1985 1985 3 6 7 0 0 1 S",
			"1986 1986 3 4 7 0 0 1 S",
			"1986 1986 9 3 7 0 0 0",
			"1987 1989 3 1 7 0 0 1 S",
			"1987 1989 9 1 7 0 0 0",
			"1997 1997 3 4 7 0 0 1 S",
			"1997 1997 9 4 7 0 0 0",
			"2013 9999 2 5 8 1 0 1 S",
			"2013 9999 9 5 8 2 0 0"
		],
		"Louisville": [
			"1921 1921 4 1 7 2 0 1 D",
			"1921 1921 8 1 7 2 0 0 S",
			"1941 1961 3 0 8 2 0 1 D",
			"1941 1941 8 0 8 2 0 0 S",
			"1946 1946 5 2 7 2 0 0 S",
			"1950 1955 8 0 8 2 0 0 S",
			"1956 1960 9 0 8 2 0 0 S"
		],
		"Lux": [
			"1916 1916 4 14 7 23 0 1 S",
			"1916 1916 9 1 7 1 0 0",
			"1917 1917 3 28 7 23 0 1 S",
			"1917 1917 8 17 7 1 0 0",
			"1918 1918 3 15 1 2 2 1 S",
			"1918 1918 8 15 1 2 2 0",
			"1919 1919 2 1 7 23 0 1 S",
			"1919 1919 9 5 7 3 0 0",
			"1920 1920 1 14 7 23 0 1 S",
			"1920 1920 9 24 7 2 0 0",
			"1921 1921 2 14 7 23 0 1 S",
			"1921 1921 9 26 7 2 0 0",
			"1922 1922 2 25 7 23 0 1 S",
			"1922 1922 9 2 0 1 0 0",
			"1923 1923 3 21 7 23 0 1 S",
			"1923 1923 9 2 0 2 0 0",
			"1924 1924 2 29 7 23 0 1 S",
			"1924 1928 9 2 0 1 0 0",
			"1925 1925 3 5 7 23 0 1 S",
			"1926 1926 3 17 7 23 0 1 S",
			"1927 1927 3 9 7 23 0 1 S",
			"1928 1928 3 14 7 23 0 1 S",
			"1929 1929 3 20 7 23 0 1 S"
		],
		"Macau": [
			"1961 1962 2 16 0 3:30 0 1 S",
			"1961 1964 10 1 0 3:30 0 0",
			"1963 1963 2 16 0 0 0 1 S",
			"1964 1964 2 16 0 3:30 0 1 S",
			"1965 1965 2 16 0 0 0 1 S",
			"1965 1965 9 31 7 0 0 0",
			"1966 1971 3 16 0 3:30 0 1 S",
			"1966 1971 9 16 0 3:30 0 0",
			"1972 1974 3 15 0 0 0 1 S",
			"1972 1973 9 15 0 0 0 0",
			"1974 1977 9 15 0 3:30 0 0",
			"1975 1977 3 15 0 3:30 0 1 S",
			"1978 1980 3 15 0 0 0 1 S",
			"1978 1980 9 15 0 0 0 0"
		],
		"Malta": [
			"1973 1973 2 31 7 0 2 1 S",
			"1973 1973 8 29 7 0 2 0",
			"1974 1974 3 21 7 0 2 1 S",
			"1974 1974 8 16 7 0 2 0",
			"1975 1979 3 15 0 2 0 1 S",
			"1975 1980 8 15 0 2 0 0",
			"1980 1980 2 31 7 2 0 1 S"
		],
		"Marengo": [
			"1951 1951 3 0 8 2 0 1 D",
			"1951 1951 8 0 8 2 0 0 S",
			"1954 1960 3 0 8 2 0 1 D",
			"1954 1960 8 0 8 2 0 0 S"
		],
		"Mauritius": [
			"1982 1982 9 10 7 0 0 1 S",
			"1983 1983 2 21 7 0 0 0",
			"2008 2008 9 0 8 2 0 1 S",
			"2009 2009 2 0 8 2 0 0"
		],
		"Menominee": [
			"1946 1946 3 0 8 2 0 1 D",
			"1946 1946 8 0 8 2 0 0 S",
			"1966 1966 3 0 8 2 0 1 D",
			"1966 1966 9 0 8 2 0 0 S"
		],
		"Mexico": [
			"1939 1939 1 5 7 0 0 1 D",
			"1939 1939 5 25 7 0 0 0 S",
			"1940 1940 11 9 7 0 0 1 D",
			"1941 1941 3 1 7 0 0 0 S",
			"1943 1943 11 16 7 0 0 1 W",
			"1944 1944 4 1 7 0 0 0 S",
			"1950 1950 1 12 7 0 0 1 D",
			"1950 1950 6 30 7 0 0 0 S",
			"1996 2000 3 1 0 2 0 1 D",
			"1996 2000 9 0 8 2 0 0 S",
			"2001 2001 4 1 0 2 0 1 D",
			"2001 2001 8 0 8 2 0 0 S",
			"2002 9999 3 1 0 2 0 1 D",
			"2002 9999 9 0 8 2 0 0 S"
		],
		"Moncton": [
			"1933 1935 5 8 0 1 0 1 D",
			"1933 1935 8 8 0 1 0 0 S",
			"1936 1938 5 1 0 1 0 1 D",
			"1936 1938 8 1 0 1 0 0 S",
			"1939 1939 4 27 7 1 0 1 D",
			"1939 1941 8 21 6 1 0 0 S",
			"1940 1940 4 19 7 1 0 1 D",
			"1941 1941 4 4 7 1 0 1 D",
			"1946 1972 3 0 8 2 0 1 D",
			"1946 1956 8 0 8 2 0 0 S",
			"1957 1972 9 0 8 2 0 0 S",
			"1993 2006 3 1 0 0:1 0 1 D",
			"1993 2006 9 0 8 0:1 0 0 S"
		],
		"Mongol": [
			"1983 1984 3 1 7 0 0 1 S",
			"1983 1983 9 1 7 0 0 0",
			"1985 1998 2 0 8 0 0 1 S",
			"1984 1998 8 0 8 0 0 0",
			"2001 2001 3 6 8 2 0 1 S",
			"2001 2006 8 6 8 2 0 0",
			"2002 2006 2 6 8 2 0 1 S"
		],
		"Mont": [
			"1917 1917 2 25 7 2 0 1 D",
			"1917 1917 3 24 7 0 0 0 S",
			"1919 1919 2 31 7 2:30 0 1 D",
			"1919 1919 9 25 7 2:30 0 0 S",
			"1920 1920 4 2 7 2:30 0 1 D",
			"1920 1922 9 1 0 2:30 0 0 S",
			"1921 1921 4 1 7 2 0 1 D",
			"1922 1922 3 30 7 2 0 1 D",
			"1924 1924 4 17 7 2 0 1 D",
			"1924 1926 8 0 8 2:30 0 0 S",
			"1925 1926 4 1 0 2 0 1 D",
			"1927 1927 4 1 7 0 0 1 D",
			"1927 1932 8 0 8 0 0 0 S",
			"1928 1931 3 0 8 0 0 1 D",
			"1932 1932 4 1 7 0 0 1 D",
			"1933 1940 3 0 8 0 0 1 D",
			"1933 1933 9 1 7 0 0 0 S",
			"1934 1939 8 0 8 0 0 0 S",
			"1946 1973 3 0 8 2 0 1 D",
			"1945 1948 8 0 8 2 0 0 S",
			"1949 1950 9 0 8 2 0 0 S",
			"1951 1956 8 0 8 2 0 0 S",
			"1957 1973 9 0 8 2 0 0 S"
		],
		"Morocco": [
			"1939 1939 8 12 7 0 0 1 S",
			"1939 1939 10 19 7 0 0 0",
			"1940 1940 1 25 7 0 0 1 S",
			"1945 1945 10 18 7 0 0 0",
			"1950 1950 5 11 7 0 0 1 S",
			"1950 1950 9 29 7 0 0 0",
			"1967 1967 5 3 7 12 0 1 S",
			"1967 1967 9 1 7 0 0 0",
			"1974 1974 5 24 7 0 0 1 S",
			"1974 1974 8 1 7 0 0 0",
			"1976 1977 4 1 7 0 0 1 S",
			"1976 1976 7 1 7 0 0 0",
			"1977 1977 8 28 7 0 0 0",
			"1978 1978 5 1 7 0 0 1 S",
			"1978 1978 7 4 7 0 0 0",
			"2008 2008 5 1 7 0 0 1 S",
			"2008 2008 8 1 7 0 0 0",
			"2009 2009 5 1 7 0 0 1 S",
			"2009 2009 7 21 7 0 0 0",
			"2010 2010 4 2 7 0 0 1 S",
			"2010 2010 7 8 7 0 0 0",
			"2011 2011 3 3 7 0 0 1 S",
			"2011 2011 6 31 7 0 0 0",
			"2012 2019 3 0 8 2 0 1 S",
			"2012 9999 8 0 8 3 0 0",
			"2012 2012 6 20 7 3 0 0",
			"2012 2012 7 20 7 2 0 1 S",
			"2013 2013 6 9 7 3 0 0",
			"2013 2013 7 8 7 2 0 1 S",
			"2014 2014 5 29 7 3 0 0",
			"2014 2014 6 29 7 2 0 1 S",
			"2015 2015 5 18 7 3 0 0",
			"2015 2015 6 18 7 2 0 1 S",
			"2016 2016 5 7 7 3 0 0",
			"2016 2016 6 7 7 2 0 1 S",
			"2017 2017 4 27 7 3 0 0",
			"2017 2017 5 26 7 2 0 1 S",
			"2018 2018 4 16 7 3 0 0",
			"2018 2018 5 15 7 2 0 1 S",
			"2019 2019 4 6 7 3 0 0",
			"2019 2019 5 5 7 2 0 1 S",
			"2020 2020 4 24 7 2 0 1 S",
			"2021 2021 4 13 7 2 0 1 S",
			"2022 2022 4 3 7 2 0 1 S",
			"2023 9999 3 0 8 2 0 1 S"
		],
		"NBorneo": [
			"1935 1941 8 14 7 0 0 0:20 TS",
			"1935 1941 11 14 7 0 0 0"
		],
		"NC": [
			"1977 1978 11 1 0 0 0 1 S",
			"1978 1979 1 27 7 0 0 0",
			"1996 1996 11 1 7 2 2 1 S",
			"1997 1997 2 2 7 2 2 0"
		],
		"NT_YK": [
			"1918 1918 3 14 7 2 0 1 D",
			"1918 1918 9 27 7 2 0 0 S",
			"1919 1919 4 25 7 2 0 1 D",
			"1919 1919 10 1 7 0 0 0 S",
			"1942 1942 1 9 7 2 0 1 W",
			"1945 1945 7 14 7 23 1 1 P",
			"1945 1945 8 30 7 2 0 0 S",
			"1965 1965 3 0 8 0 0 2 DD",
			"1965 1965 9 0 8 2 0 0 S",
			"1980 1986 3 0 8 2 0 1 D",
			"1980 2006 9 0 8 2 0 0 S",
			"1987 2006 3 1 0 2 0 1 D"
		],
		"NYC": [
			"1920 1920 2 0 8 2 0 1 D",
			"1920 1920 9 0 8 2 0 0 S",
			"1921 1966 3 0 8 2 0 1 D",
			"1921 1954 8 0 8 2 0 0 S",
			"1955 1966 9 0 8 2 0 0 S"
		],
		"NZ": [
			"1927 1927 10 6 7 2 0 1 S",
			"1928 1928 2 4 7 2 0 0 M",
			"1928 1933 9 8 0 2 0 0:30 S",
			"1929 1933 2 15 0 2 0 0 M",
			"1934 1940 3 0 8 2 0 0 M",
			"1934 1940 8 0 8 2 0 0:30 S",
			"1946 1946 0 1 7 0 0 0 S",
			"1974 1974 10 1 0 2 2 1 D",
			"1975 1975 1 0 8 2 2 0 S",
			"1975 1988 9 0 8 2 2 1 D",
			"1976 1989 2 1 0 2 2 0 S",
			"1989 1989 9 8 0 2 2 1 D",
			"1990 2006 9 1 0 2 2 1 D",
			"1990 2007 2 15 0 2 2 0 S",
			"2007 9999 8 0 8 2 2 1 D",
			"2008 9999 3 1 0 2 2 0 S"
		],
		"NZAQ": [
			"1974 1974 10 3 7 2 2 1 D",
			"1975 1988 9 0 8 2 2 1 D",
			"1989 1989 9 8 7 2 2 1 D",
			"1990 2006 9 1 0 2 2 1 D",
			"1975 1975 1 23 7 2 2 0 S",
			"1976 1989 2 1 0 2 2 0 S",
			"1990 2007 2 15 0 2 2 0 S",
			"2007 9999 8 0 8 2 2 1 D",
			"2008 9999 3 1 0 2 2 0 S"
		],
		"Namibia": [
			"1994 9999 8 1 0 2 0 1 S",
			"1995 9999 3 1 0 2 0 0"
		],
		"Neth": [
			"1916 1916 4 1 7 0 0 1 NST",
			"1916 1916 9 1 7 0 0 0 AMT",
			"1917 1917 3 16 7 2 2 1 NST",
			"1917 1917 8 17 7 2 2 0 AMT",
			"1918 1921 3 1 1 2 2 1 NST",
			"1918 1921 8 1 8 2 2 0 AMT",
			"1922 1922 2 0 8 2 2 1 NST",
			"1922 1936 9 2 0 2 2 0 AMT",
			"1923 1923 5 1 5 2 2 1 NST",
			"1924 1924 2 0 8 2 2 1 NST",
			"1925 1925 5 1 5 2 2 1 NST",
			"1926 1931 4 15 7 2 2 1 NST",
			"1932 1932 4 22 7 2 2 1 NST",
			"1933 1936 4 15 7 2 2 1 NST",
			"1937 1937 4 22 7 2 2 1 NST",
			"1937 1937 6 1 7 0 0 1 S",
			"1937 1939 9 2 0 2 2 0",
			"1938 1939 4 15 7 2 2 1 S",
			"1945 1945 3 2 7 2 2 1 S",
			"1945 1945 8 16 7 2 2 0"
		],
		"Nic": [
			"1979 1980 2 16 0 0 0 1 D",
			"1979 1980 5 23 1 0 0 0 S",
			"2005 2005 3 10 7 0 0 1 D",
			"2005 2005 9 1 0 0 0 0 S",
			"2006 2006 3 30 7 2 0 1 D",
			"2006 2006 9 1 0 1 0 0 S"
		],
		"Norway": [
			"1916 1916 4 22 7 1 0 1 S",
			"1916 1916 8 30 7 0 0 0",
			"1945 1945 3 2 7 2 2 1 S",
			"1945 1945 9 1 7 2 2 0",
			"1959 1964 2 15 0 2 2 1 S",
			"1959 1965 8 15 0 2 2 0",
			"1965 1965 3 25 7 2 2 1 S"
		],
		"PRC": [
			"1986 1986 4 4 7 0 0 1 D",
			"1986 1991 8 11 0 0 0 0 S",
			"1987 1991 3 10 0 0 0 1 D"
		],
		"Pakistan": [
			"2002 2002 3 2 0 0:1 0 1 S",
			"2002 2002 9 2 0 0:1 0 0",
			"2008 2008 5 1 7 0 0 1 S",
			"2008 2008 10 1 7 0 0 0",
			"2009 2009 3 15 7 0 0 1 S",
			"2009 2009 10 1 7 0 0 0"
		],
		"Palestine": [
			"1999 2005 3 15 5 0 0 1 S",
			"1999 2003 9 15 5 0 0 0",
			"2004 2004 9 1 7 1 0 0",
			"2005 2005 9 4 7 2 0 0",
			"2006 2007 3 1 7 0 0 1 S",
			"2006 2006 8 22 7 0 0 0",
			"2007 2007 8 8 4 2 0 0",
			"2008 2009 2 5 8 0 0 1 S",
			"2008 2008 8 1 7 0 0 0",
			"2009 2009 8 1 5 1 0 0",
			"2010 2010 2 26 7 0 0 1 S",
			"2010 2010 7 11 7 0 0 0",
			"2011 2011 3 1 7 0:1 0 1 S",
			"2011 2011 7 1 7 0 0 0",
			"2011 2011 7 30 7 0 0 1 S",
			"2011 2011 8 30 7 0 0 0",
			"2012 9999 2 4 8 24 0 1 S",
			"2012 9999 8 21 5 1 0 0"
		],
		"Para": [
			"1975 1988 9 1 7 0 0 1 S",
			"1975 1978 2 1 7 0 0 0",
			"1979 1991 3 1 7 0 0 0",
			"1989 1989 9 22 7 0 0 1 S",
			"1990 1990 9 1 7 0 0 1 S",
			"1991 1991 9 6 7 0 0 1 S",
			"1992 1992 2 1 7 0 0 0",
			"1992 1992 9 5 7 0 0 1 S",
			"1993 1993 2 31 7 0 0 0",
			"1993 1995 9 1 7 0 0 1 S",
			"1994 1995 1 0 8 0 0 0",
			"1996 1996 2 1 7 0 0 0",
			"1996 2001 9 1 0 0 0 1 S",
			"1997 1997 1 0 8 0 0 0",
			"1998 2001 2 1 0 0 0 0",
			"2002 2004 3 1 0 0 0 0",
			"2002 2003 8 1 0 0 0 1 S",
			"2004 2009 9 15 0 0 0 1 S",
			"2005 2009 2 8 0 0 0 0",
			"2010 9999 9 1 0 0 0 1 S",
			"2010 2012 3 8 0 0 0 0",
			"2013 9999 2 22 0 0 0 0"
		],
		"Perry": [
			"1946 1946 3 0 8 2 0 1 D",
			"1946 1946 8 0 8 2 0 0 S",
			"1953 1954 3 0 8 2 0 1 D",
			"1953 1959 8 0 8 2 0 0 S",
			"1955 1955 4 1 7 0 0 1 D",
			"1956 1963 3 0 8 2 0 1 D",
			"1960 1960 9 0 8 2 0 0 S",
			"1961 1961 8 0 8 2 0 0 S",
			"1962 1963 9 0 8 2 0 0 S"
		],
		"Peru": [
			"1938 1938 0 1 7 0 0 1 S",
			"1938 1938 3 1 7 0 0 0",
			"1938 1939 8 0 8 0 0 1 S",
			"1939 1940 2 24 0 0 0 0",
			"1986 1987 0 1 7 0 0 1 S",
			"1986 1987 3 1 7 0 0 0",
			"1990 1990 0 1 7 0 0 1 S",
			"1990 1990 3 1 7 0 0 0",
			"1994 1994 0 1 7 0 0 1 S",
			"1994 1994 3 1 7 0 0 0"
		],
		"Phil": [
			"1936 1936 10 1 7 0 0 1 S",
			"1937 1937 1 1 7 0 0 0",
			"1954 1954 3 12 7 0 0 1 S",
			"1954 1954 6 1 7 0 0 0",
			"1978 1978 2 22 7 0 0 1 S",
			"1978 1978 8 21 7 0 0 0"
		],
		"Pike": [
			"1955 1955 4 1 7 0 0 1 D",
			"1955 1960 8 0 8 2 0 0 S",
			"1956 1964 3 0 8 2 0 1 D",
			"1961 1964 9 0 8 2 0 0 S"
		],
		"Poland": [
			"1918 1919 8 16 7 2 2 0",
			"1919 1919 3 15 7 2 2 1 S",
			"1944 1944 3 3 7 2 2 1 S",
			"1944 1944 9 4 7 2 0 0",
			"1945 1945 3 29 7 0 0 1 S",
			"1945 1945 10 1 7 0 0 0",
			"1946 1946 3 14 7 0 2 1 S",
			"1946 1946 9 7 7 2 2 0",
			"1947 1947 4 4 7 2 2 1 S",
			"1947 1949 9 1 0 2 2 0",
			"1948 1948 3 18 7 2 2 1 S",
			"1949 1949 3 10 7 2 2 1 S",
			"1957 1957 5 2 7 1 2 1 S",
			"1957 1958 8 0 8 1 2 0",
			"1958 1958 2 30 7 1 2 1 S",
			"1959 1959 4 31 7 1 2 1 S",
			"1959 1961 9 1 0 1 2 0",
			"1960 1960 3 3 7 1 2 1 S",
			"1961 1964 4 0 8 1 2 1 S",
			"1962 1964 8 0 8 1 2 0"
		],
		"Port": [
			"1916 1916 5 17 7 23 0 1 S",
			"1916 1916 10 1 7 1 0 0",
			"1917 1917 1 28 7 23 2 1 S",
			"1917 1921 9 14 7 23 2 0",
			"1918 1918 2 1 7 23 2 1 S",
			"1919 1919 1 28 7 23 2 1 S",
			"1920 1920 1 29 7 23 2 1 S",
			"1921 1921 1 28 7 23 2 1 S",
			"1924 1924 3 16 7 23 2 1 S",
			"1924 1924 9 14 7 23 2 0",
			"1926 1926 3 17 7 23 2 1 S",
			"1926 1929 9 1 6 23 2 0",
			"1927 1927 3 9 7 23 2 1 S",
			"1928 1928 3 14 7 23 2 1 S",
			"1929 1929 3 20 7 23 2 1 S",
			"1931 1931 3 18 7 23 2 1 S",
			"1931 1932 9 1 6 23 2 0",
			"1932 1932 3 2 7 23 2 1 S",
			"1934 1934 3 7 7 23 2 1 S",
			"1934 1938 9 1 6 23 2 0",
			"1935 1935 2 30 7 23 2 1 S",
			"1936 1936 3 18 7 23 2 1 S",
			"1937 1937 3 3 7 23 2 1 S",
			"1938 1938 2 26 7 23 2 1 S",
			"1939 1939 3 15 7 23 2 1 S",
			"1939 1939 10 18 7 23 2 0",
			"1940 1940 1 24 7 23 2 1 S",
			"1940 1941 9 5 7 23 2 0",
			"1941 1941 3 5 7 23 2 1 S",
			"1942 1945 2 8 6 23 2 1 S",
			"1942 1942 3 25 7 22 2 2 M",
			"1942 1942 7 15 7 22 2 1 S",
			"1942 1945 9 24 6 23 2 0",
			"1943 1943 3 17 7 22 2 2 M",
			"1943 1945 7 25 6 22 2 1 S",
			"1944 1945 3 21 6 22 2 2 M",
			"1946 1946 3 1 6 23 2 1 S",
			"1946 1946 9 1 6 23 2 0",
			"1947 1949 3 1 0 2 2 1 S",
			"1947 1949 9 1 0 2 2 0",
			"1951 1965 3 1 0 2 2 1 S",
			"1951 1965 9 1 0 2 2 0",
			"1977 1977 2 27 7 0 2 1 S",
			"1977 1977 8 25 7 0 2 0",
			"1978 1979 3 1 0 0 2 1 S",
			"1978 1978 9 1 7 0 2 0",
			"1979 1982 8 0 8 1 2 0",
			"1980 1980 2 0 8 0 2 1 S",
			"1981 1982 2 0 8 1 2 1 S",
			"1983 1983 2 0 8 2 2 1 S"
		],
		"Pulaski": [
			"1946 1960 3 0 8 2 0 1 D",
			"1946 1954 8 0 8 2 0 0 S",
			"1955 1956 9 0 8 2 0 0 S",
			"1957 1960 8 0 8 2 0 0 S"
		],
		"ROK": [
			"1960 1960 4 15 7 0 0 1 D",
			"1960 1960 8 13 7 0 0 0 S",
			"1987 1988 4 8 0 0 0 1 D",
			"1987 1988 9 8 0 0 0 0 S"
		],
		"Regina": [
			"1918 1918 3 14 7 2 0 1 D",
			"1918 1918 9 27 7 2 0 0 S",
			"1930 1934 4 1 0 0 0 1 D",
			"1930 1934 9 1 0 0 0 0 S",
			"1937 1941 3 8 0 0 0 1 D",
			"1937 1937 9 8 0 0 0 0 S",
			"1938 1938 9 1 0 0 0 0 S",
			"1939 1941 9 8 0 0 0 0 S",
			"1942 1942 1 9 7 2 0 1 W",
			"1945 1945 7 14 7 23 1 1 P",
			"1945 1945 8 0 8 2 0 0 S",
			"1946 1946 3 8 0 2 0 1 D",
			"1946 1946 9 8 0 2 0 0 S",
			"1947 1957 3 0 8 2 0 1 D",
			"1947 1957 8 0 8 2 0 0 S",
			"1959 1959 3 0 8 2 0 1 D",
			"1959 1959 9 0 8 2 0 0 S"
		],
		"Romania": [
			"1932 1932 4 21 7 0 2 1 S",
			"1932 1939 9 1 0 0 2 0",
			"1933 1939 3 2 0 0 2 1 S",
			"1979 1979 4 27 7 0 0 1 S",
			"1979 1979 8 0 8 0 0 0",
			"1980 1980 3 5 7 23 0 1 S",
			"1980 1980 8 0 8 1 0 0",
			"1991 1993 2 0 8 0 2 1 S",
			"1991 1993 8 0 8 0 2 0"
		],
		"Russia": [
			"1917 1917 6 1 7 23 0 1 MST",
			"1917 1917 11 28 7 0 0 0 MMT",
			"1918 1918 4 31 7 22 0 2 MDST",
			"1918 1918 8 16 7 1 0 1 MST",
			"1919 1919 4 31 7 23 0 2 MDST",
			"1919 1919 6 1 7 2 0 1 S",
			"1919 1919 7 16 7 0 0 0",
			"1921 1921 1 14 7 23 0 1 S",
			"1921 1921 2 20 7 23 0 2 M",
			"1921 1921 8 1 7 0 0 1 S",
			"1921 1921 9 1 7 0 0 0",
			"1981 1984 3 1 7 0 0 1 S",
			"1981 1983 9 1 7 0 0 0",
			"1984 1991 8 0 8 2 2 0",
			"1985 1991 2 0 8 2 2 1 S",
			"1992 1992 2 6 8 23 0 1 S",
			"1992 1992 8 6 8 23 0 0",
			"1993 2010 2 0 8 2 2 1 S",
			"1993 1995 8 0 8 2 2 0",
			"1996 2010 9 0 8 2 2 0"
		],
		"RussiaAsia": [
			"1981 1984 3 1 7 0 0 1 S",
			"1981 1983 9 1 7 0 0 0",
			"1984 1991 8 0 8 2 2 0",
			"1985 1991 2 0 8 2 2 1 S",
			"1992 1992 2 6 8 23 0 1 S",
			"1992 1992 8 6 8 23 0 0",
			"1993 9999 2 0 8 2 2 1 S",
			"1993 1995 8 0 8 2 2 0",
			"1996 9999 9 0 8 2 2 0"
		],
		"SA": [
			"1942 1943 8 15 0 2 0 1",
			"1943 1944 2 15 0 2 0 0"
		],
		"SL": [
			"1935 1942 5 1 7 0 0 0:40 SLST",
			"1935 1942 9 1 7 0 0 0 WAT",
			"1957 1962 5 1 7 0 0 1 SLST",
			"1957 1962 8 1 7 0 0 0 GMT"
		],
		"Salv": [
			"1987 1988 4 1 0 0 0 1 D",
			"1987 1988 8 0 8 0 0 0 S"
		],
		"SanLuis": [
			"2008 2009 2 8 0 0 0 0",
			"2007 2009 9 8 0 0 0 1 S"
		],
		"Shang": [
			"1940 1940 5 3 7 0 0 1 D",
			"1940 1941 9 1 7 0 0 0 S",
			"1941 1941 2 16 7 0 0 1 D"
		],
		"SovietZone": [
			"1945 1945 4 24 7 2 0 2 M",
			"1945 1945 8 24 7 3 0 1 S",
			"1945 1945 10 18 7 2 2 0"
		],
		"Spain": [
			"1917 1917 4 5 7 23 2 1 S",
			"1917 1919 9 6 7 23 2 0",
			"1918 1918 3 15 7 23 2 1 S",
			"1919 1919 3 5 7 23 2 1 S",
			"1924 1924 3 16 7 23 2 1 S",
			"1924 1924 9 4 7 23 2 0",
			"1926 1926 3 17 7 23 2 1 S",
			"1926 1929 9 1 6 23 2 0",
			"1927 1927 3 9 7 23 2 1 S",
			"1928 1928 3 14 7 23 2 1 S",
			"1929 1929 3 20 7 23 2 1 S",
			"1937 1937 4 22 7 23 2 1 S",
			"1937 1939 9 1 6 23 2 0",
			"1938 1938 2 22 7 23 2 1 S",
			"1939 1939 3 15 7 23 2 1 S",
			"1940 1940 2 16 7 23 2 1 S",
			"1942 1942 4 2 7 22 2 2 M",
			"1942 1942 8 1 7 22 2 1 S",
			"1943 1946 3 13 6 22 2 2 M",
			"1943 1943 9 3 7 22 2 1 S",
			"1944 1944 9 10 7 22 2 1 S",
			"1945 1945 8 30 7 1 0 1 S",
			"1946 1946 8 30 7 0 0 0",
			"1949 1949 3 30 7 23 0 1 S",
			"1949 1949 8 30 7 1 0 0",
			"1974 1975 3 13 6 23 0 1 S",
			"1974 1975 9 1 0 1 0 0",
			"1976 1976 2 27 7 23 0 1 S",
			"1976 1977 8 0 8 1 0 0",
			"1977 1978 3 2 7 23 0 1 S",
			"1978 1978 9 1 7 1 0 0"
		],
		"SpainAfrica": [
			"1967 1967 5 3 7 12 0 1 S",
			"1967 1967 9 1 7 0 0 0",
			"1974 1974 5 24 7 0 0 1 S",
			"1974 1974 8 1 7 0 0 0",
			"1976 1977 4 1 7 0 0 1 S",
			"1976 1976 7 1 7 0 0 0",
			"1977 1977 8 28 7 0 0 0",
			"1978 1978 5 1 7 0 0 1 S",
			"1978 1978 7 4 7 0 0 0"
		],
		"StJohns": [
			"1917 1917 3 8 7 2 0 1 D",
			"1917 1917 8 17 7 2 0 0 S",
			"1919 1919 4 5 7 23 0 1 D",
			"1919 1919 7 12 7 23 0 0 S",
			"1920 1935 4 1 0 23 0 1 D",
			"1920 1935 9 0 8 23 0 0 S",
			"1936 1941 4 9 1 0 0 1 D",
			"1936 1941 9 2 1 0 0 0 S",
			"1946 1950 4 8 0 2 0 1 D",
			"1946 1950 9 2 0 2 0 0 S",
			"1951 1986 3 0 8 2 0 1 D",
			"1951 1959 8 0 8 2 0 0 S",
			"1960 1986 9 0 8 2 0 0 S",
			"1987 1987 3 1 0 0:1 0 1 D",
			"1987 2006 9 0 8 0:1 0 0 S",
			"1988 1988 3 1 0 0:1 0 2 DD",
			"1989 2006 3 1 0 0:1 0 1 D",
			"2007 2011 2 8 0 0:1 0 1 D",
			"2007 2010 10 1 0 0:1 0 0 S"
		],
		"Starke": [
			"1947 1961 3 0 8 2 0 1 D",
			"1947 1954 8 0 8 2 0 0 S",
			"1955 1956 9 0 8 2 0 0 S",
			"1957 1958 8 0 8 2 0 0 S",
			"1959 1961 9 0 8 2 0 0 S"
		],
		"Sudan": [
			"1970 1970 4 1 7 0 0 1 S",
			"1970 1985 9 15 7 0 0 0",
			"1971 1971 3 30 7 0 0 1 S",
			"1972 1985 3 0 8 0 0 1 S"
		],
		"Swift": [
			"1957 1957 3 0 8 2 0 1 D",
			"1957 1957 9 0 8 2 0 0 S",
			"1959 1961 3 0 8 2 0 1 D",
			"1959 1959 9 0 8 2 0 0 S",
			"1960 1961 8 0 8 2 0 0 S"
		],
		"Swiss": [
			"1941 1942 4 1 1 1 0 1 S",
			"1941 1942 9 1 1 2 0 0"
		],
		"Syria": [
			"1920 1923 3 15 0 2 0 1 S",
			"1920 1923 9 1 0 2 0 0",
			"1962 1962 3 29 7 2 0 1 S",
			"1962 1962 9 1 7 2 0 0",
			"1963 1965 4 1 7 2 0 1 S",
			"1963 1963 8 30 7 2 0 0",
			"1964 1964 9 1 7 2 0 0",
			"1965 1965 8 30 7 2 0 0",
			"1966 1966 3 24 7 2 0 1 S",
			"1966 1976 9 1 7 2 0 0",
			"1967 1978 4 1 7 2 0 1 S",
			"1977 1978 8 1 7 2 0 0",
			"1983 1984 3 9 7 2 0 1 S",
			"1983 1984 9 1 7 2 0 0",
			"1986 1986 1 16 7 2 0 1 S",
			"1986 1986 9 9 7 2 0 0",
			"1987 1987 2 1 7 2 0 1 S",
			"1987 1988 9 31 7 2 0 0",
			"1988 1988 2 15 7 2 0 1 S",
			"1989 1989 2 31 7 2 0 1 S",
			"1989 1989 9 1 7 2 0 0",
			"1990 1990 3 1 7 2 0 1 S",
			"1990 1990 8 30 7 2 0 0",
			"1991 1991 3 1 7 0 0 1 S",
			"1991 1992 9 1 7 0 0 0",
			"1992 1992 3 8 7 0 0 1 S",
			"1993 1993 2 26 7 0 0 1 S",
			"1993 1993 8 25 7 0 0 0",
			"1994 1996 3 1 7 0 0 1 S",
			"1994 2005 9 1 7 0 0 0",
			"1997 1998 2 1 8 0 0 1 S",
			"1999 2006 3 1 7 0 0 1 S",
			"2006 2006 8 22 7 0 0 0",
			"2007 2007 2 5 8 0 0 1 S",
			"2007 2007 10 1 5 0 0 0",
			"2008 2008 3 1 5 0 0 1 S",
			"2008 2008 10 1 7 0 0 0",
			"2009 2009 2 5 8 0 0 1 S",
			"2010 2011 3 1 5 0 0 1 S",
			"2012 9999 2 5 8 0 0 1 S",
			"2009 9999 9 5 8 0 0 0"
		],
		"TC": [
			"1979 1986 3 0 8 2 0 1 D",
			"1979 2006 9 0 8 2 0 0 S",
			"1987 2006 3 1 0 2 0 1 D",
			"2007 9999 2 8 0 2 0 1 D",
			"2007 9999 10 1 0 2 0 0 S"
		],
		"Taiwan": [
			"1945 1951 4 1 7 0 0 1 D",
			"1945 1951 9 1 7 0 0 0 S",
			"1952 1952 2 1 7 0 0 1 D",
			"1952 1954 10 1 7 0 0 0 S",
			"1953 1959 3 1 7 0 0 1 D",
			"1955 1961 9 1 7 0 0 0 S",
			"1960 1961 5 1 7 0 0 1 D",
			"1974 1975 3 1 7 0 0 1 D",
			"1974 1975 9 1 7 0 0 0 S",
			"1979 1979 5 30 7 0 0 1 D",
			"1979 1979 8 30 7 0 0 0 S"
		],
		"Thule": [
			"1991 1992 2 0 8 2 0 1 D",
			"1991 1992 8 0 8 2 0 0 S",
			"1993 2006 3 1 0 2 0 1 D",
			"1993 2006 9 0 8 2 0 0 S",
			"2007 9999 2 8 0 2 0 1 D",
			"2007 9999 10 1 0 2 0 0 S"
		],
		"Tonga": [
			"1999 1999 9 7 7 2 2 1 S",
			"2000 2000 2 19 7 2 2 0",
			"2000 2001 10 1 0 2 0 1 S",
			"2001 2002 0 0 8 2 0 0"
		],
		"Toronto": [
			"1919 1919 2 30 7 23:30 0 1 D",
			"1919 1919 9 26 7 0 0 0 S",
			"1920 1920 4 2 7 2 0 1 D",
			"1920 1920 8 26 7 0 0 0 S",
			"1921 1921 4 15 7 2 0 1 D",
			"1921 1921 8 15 7 2 0 0 S",
			"1922 1923 4 8 0 2 0 1 D",
			"1922 1926 8 15 0 2 0 0 S",
			"1924 1927 4 1 0 2 0 1 D",
			"1927 1932 8 0 8 2 0 0 S",
			"1928 1931 3 0 8 2 0 1 D",
			"1932 1932 4 1 7 2 0 1 D",
			"1933 1940 3 0 8 2 0 1 D",
			"1933 1933 9 1 7 2 0 0 S",
			"1934 1939 8 0 8 2 0 0 S",
			"1945 1946 8 0 8 2 0 0 S",
			"1946 1946 3 0 8 2 0 1 D",
			"1947 1949 3 0 8 0 0 1 D",
			"1947 1948 8 0 8 0 0 0 S",
			"1949 1949 10 0 8 0 0 0 S",
			"1950 1973 3 0 8 2 0 1 D",
			"1950 1950 10 0 8 2 0 0 S",
			"1951 1956 8 0 8 2 0 0 S",
			"1957 1973 9 0 8 2 0 0 S"
		],
		"Tunisia": [
			"1939 1939 3 15 7 23 2 1 S",
			"1939 1939 10 18 7 23 2 0",
			"1940 1940 1 25 7 23 2 1 S",
			"1941 1941 9 6 7 0 0 0",
			"1942 1942 2 9 7 0 0 1 S",
			"1942 1942 10 2 7 3 0 0",
			"1943 1943 2 29 7 2 0 1 S",
			"1943 1943 3 17 7 2 0 0",
			"1943 1943 3 25 7 2 0 1 S",
			"1943 1943 9 4 7 2 0 0",
			"1944 1945 3 1 1 2 0 1 S",
			"1944 1944 9 8 7 0 0 0",
			"1945 1945 8 16 7 0 0 0",
			"1977 1977 3 30 7 0 2 1 S",
			"1977 1977 8 24 7 0 2 0",
			"1978 1978 4 1 7 0 2 1 S",
			"1978 1978 9 1 7 0 2 0",
			"1988 1988 5 1 7 0 2 1 S",
			"1988 1990 8 0 8 0 2 0",
			"1989 1989 2 26 7 0 2 1 S",
			"1990 1990 4 1 7 0 2 1 S",
			"2005 2005 4 1 7 0 2 1 S",
			"2005 2005 8 30 7 1 2 0",
			"2006 2008 2 0 8 2 2 1 S",
			"2006 2008 9 0 8 2 2 0"
		],
		"Turkey": [
			"1916 1916 4 1 7 0 0 1 S",
			"1916 1916 9 1 7 0 0 0",
			"1920 1920 2 28 7 0 0 1 S",
			"1920 1920 9 25 7 0 0 0",
			"1921 1921 3 3 7 0 0 1 S",
			"1921 1921 9 3 7 0 0 0",
			"1922 1922 2 26 7 0 0 1 S",
			"1922 1922 9 8 7 0 0 0",
			"1924 1924 4 13 7 0 0 1 S",
			"1924 1925 9 1 7 0 0 0",
			"1925 1925 4 1 7 0 0 1 S",
			"1940 1940 5 30 7 0 0 1 S",
			"1940 1940 9 5 7 0 0 0",
			"1940 1940 11 1 7 0 0 1 S",
			"1941 1941 8 21 7 0 0 0",
			"1942 1942 3 1 7 0 0 1 S",
			"1942 1942 10 1 7 0 0 0",
			"1945 1945 3 2 7 0 0 1 S",
			"1945 1945 9 8 7 0 0 0",
			"1946 1946 5 1 7 0 0 1 S",
			"1946 1946 9 1 7 0 0 0",
			"1947 1948 3 16 0 0 0 1 S",
			"1947 1950 9 2 0 0 0 0",
			"1949 1949 3 10 7 0 0 1 S",
			"1950 1950 3 19 7 0 0 1 S",
			"1951 1951 3 22 7 0 0 1 S",
			"1951 1951 9 8 7 0 0 0",
			"1962 1962 6 15 7 0 0 1 S",
			"1962 1962 9 8 7 0 0 0",
			"1964 1964 4 15 7 0 0 1 S",
			"1964 1964 9 1 7 0 0 0",
			"1970 1972 4 2 0 0 0 1 S",
			"1970 1972 9 2 0 0 0 0",
			"1973 1973 5 3 7 1 0 1 S",
			"1973 1973 10 4 7 3 0 0",
			"1974 1974 2 31 7 2 0 1 S",
			"1974 1974 10 3 7 5 0 0",
			"1975 1975 2 30 7 0 0 1 S",
			"1975 1976 9 0 8 0 0 0",
			"1976 1976 5 1 7 0 0 1 S",
			"1977 1978 3 1 0 0 0 1 S",
			"1977 1977 9 16 7 0 0 0",
			"1979 1980 3 1 0 3 0 1 S",
			"1979 1982 9 11 1 0 0 0",
			"1981 1982 2 0 8 3 0 1 S",
			"1983 1983 6 31 7 0 0 1 S",
			"1983 1983 9 2 7 0 0 0",
			"1985 1985 3 20 7 0 0 1 S",
			"1985 1985 8 28 7 0 0 0",
			"1986 1990 2 0 8 2 2 1 S",
			"1986 1990 8 0 8 2 2 0",
			"1991 2006 2 0 8 1 2 1 S",
			"1991 1995 8 0 8 1 2 0",
			"1996 2006 9 0 8 1 2 0"
		],
		"US": [
			"1918 1919 2 0 8 2 0 1 D",
			"1918 1919 9 0 8 2 0 0 S",
			"1942 1942 1 9 7 2 0 1 W",
			"1945 1945 7 14 7 23 1 1 P",
			"1945 1945 8 30 7 2 0 0 S",
			"1967 2006 9 0 8 2 0 0 S",
			"1967 1973 3 0 8 2 0 1 D",
			"1974 1974 0 6 7 2 0 1 D",
			"1975 1975 1 23 7 2 0 1 D",
			"1976 1986 3 0 8 2 0 1 D",
			"1987 2006 3 1 0 2 0 1 D",
			"2007 9999 2 8 0 2 0 1 D",
			"2007 9999 10 1 0 2 0 0 S"
		],
		"Uruguay": [
			"1923 1923 9 2 7 0 0 0:30 HS",
			"1924 1926 3 1 7 0 0 0",
			"1924 1925 9 1 7 0 0 0:30 HS",
			"1933 1935 9 0 8 0 0 0:30 HS",
			"1934 1936 2 25 6 23:30 2 0",
			"1936 1936 10 1 7 0 0 0:30 HS",
			"1937 1941 2 0 8 0 0 0",
			"1937 1940 9 0 8 0 0 0:30 HS",
			"1941 1941 7 1 7 0 0 0:30 HS",
			"1942 1942 0 1 7 0 0 0",
			"1942 1942 11 14 7 0 0 1 S",
			"1943 1943 2 14 7 0 0 0",
			"1959 1959 4 24 7 0 0 1 S",
			"1959 1959 10 15 7 0 0 0",
			"1960 1960 0 17 7 0 0 1 S",
			"1960 1960 2 6 7 0 0 0",
			"1965 1967 3 1 0 0 0 1 S",
			"1965 1965 8 26 7 0 0 0",
			"1966 1967 9 31 7 0 0 0",
			"1968 1970 4 27 7 0 0 0:30 HS",
			"1968 1970 11 2 7 0 0 0",
			"1972 1972 3 24 7 0 0 1 S",
			"1972 1972 7 15 7 0 0 0",
			"1974 1974 2 10 7 0 0 0:30 HS",
			"1974 1974 11 22 7 0 0 1 S",
			"1976 1976 9 1 7 0 0 0",
			"1977 1977 11 4 7 0 0 1 S",
			"1978 1978 3 1 7 0 0 0",
			"1979 1979 9 1 7 0 0 1 S",
			"1980 1980 4 1 7 0 0 0",
			"1987 1987 11 14 7 0 0 1 S",
			"1988 1988 2 14 7 0 0 0",
			"1988 1988 11 11 7 0 0 1 S",
			"1989 1989 2 12 7 0 0 0",
			"1989 1989 9 29 7 0 0 1 S",
			"1990 1992 2 1 0 0 0 0",
			"1990 1991 9 21 0 0 0 1 S",
			"1992 1992 9 18 7 0 0 1 S",
			"1993 1993 1 28 7 0 0 0",
			"2004 2004 8 19 7 0 0 1 S",
			"2005 2005 2 27 7 2 0 0",
			"2005 2005 9 9 7 2 0 1 S",
			"2006 2006 2 12 7 2 0 0",
			"2006 9999 9 1 0 2 0 1 S",
			"2007 9999 2 8 0 2 0 0"
		],
		"Vanc": [
			"1918 1918 3 14 7 2 0 1 D",
			"1918 1918 9 27 7 2 0 0 S",
			"1942 1942 1 9 7 2 0 1 W",
			"1945 1945 7 14 7 23 1 1 P",
			"1945 1945 8 30 7 2 0 0 S",
			"1946 1986 3 0 8 2 0 1 D",
			"1946 1946 9 13 7 2 0 0 S",
			"1947 1961 8 0 8 2 0 0 S",
			"1962 2006 9 0 8 2 0 0 S"
		],
		"Vanuatu": [
			"1983 1983 8 25 7 0 0 1 S",
			"1984 1991 2 23 0 0 0 0",
			"1984 1984 9 23 7 0 0 1 S",
			"1985 1991 8 23 0 0 0 1 S",
			"1992 1993 0 23 0 0 0 0",
			"1992 1992 9 23 0 0 0 1 S"
		],
		"Vincennes": [
			"1946 1946 3 0 8 2 0 1 D",
			"1946 1946 8 0 8 2 0 0 S",
			"1953 1954 3 0 8 2 0 1 D",
			"1953 1959 8 0 8 2 0 0 S",
			"1955 1955 4 1 7 0 0 1 D",
			"1956 1963 3 0 8 2 0 1 D",
			"1960 1960 9 0 8 2 0 0 S",
			"1961 1961 8 0 8 2 0 0 S",
			"1962 1963 9 0 8 2 0 0 S"
		],
		"W-Eur": [
			"1977 1980 3 1 0 1 2 1 S",
			"1977 1977 8 0 8 1 2 0",
			"1978 1978 9 1 7 1 2 0",
			"1979 1995 8 0 8 1 2 0",
			"1981 9999 2 0 8 1 2 1 S",
			"1996 9999 9 0 8 1 2 0"
		],
		"WS": [
			"2012 9999 8 0 8 3 0 1 D",
			"2012 9999 3 1 0 4 0 0"
		],
		"Winn": [
			"1916 1916 3 23 7 0 0 1 D",
			"1916 1916 8 17 7 0 0 0 S",
			"1918 1918 3 14 7 2 0 1 D",
			"1918 1918 9 27 7 2 0 0 S",
			"1937 1937 4 16 7 2 0 1 D",
			"1937 1937 8 26 7 2 0 0 S",
			"1942 1942 1 9 7 2 0 1 W",
			"1945 1945 7 14 7 23 1 1 P",
			"1945 1945 8 0 8 2 0 0 S",
			"1946 1946 4 12 7 2 0 1 D",
			"1946 1946 9 13 7 2 0 0 S",
			"1947 1949 3 0 8 2 0 1 D",
			"1947 1949 8 0 8 2 0 0 S",
			"1950 1950 4 1 7 2 0 1 D",
			"1950 1950 8 30 7 2 0 0 S",
			"1951 1960 3 0 8 2 0 1 D",
			"1951 1958 8 0 8 2 0 0 S",
			"1959 1959 9 0 8 2 0 0 S",
			"1960 1960 8 0 8 2 0 0 S",
			"1963 1963 3 0 8 2 0 1 D",
			"1963 1963 8 22 7 2 0 0 S",
			"1966 1986 3 0 8 2 2 1 D",
			"1966 2005 9 0 8 2 2 0 S",
			"1987 2005 3 1 0 2 2 1 D"
		],
		"Zion": [
			"1940 1940 5 1 7 0 0 1 D",
			"1942 1944 10 1 7 0 0 0 S",
			"1943 1943 3 1 7 2 0 1 D",
			"1944 1944 3 1 7 0 0 1 D",
			"1945 1945 3 16 7 0 0 1 D",
			"1945 1945 10 1 7 2 0 0 S",
			"1946 1946 3 16 7 2 0 1 D",
			"1946 1946 10 1 7 0 0 0 S",
			"1948 1948 4 23 7 0 0 2 DD",
			"1948 1948 8 1 7 0 0 1 D",
			"1948 1949 10 1 7 2 0 0 S",
			"1949 1949 4 1 7 0 0 1 D",
			"1950 1950 3 16 7 0 0 1 D",
			"1950 1950 8 15 7 3 0 0 S",
			"1951 1951 3 1 7 0 0 1 D",
			"1951 1951 10 11 7 3 0 0 S",
			"1952 1952 3 20 7 2 0 1 D",
			"1952 1952 9 19 7 3 0 0 S",
			"1953 1953 3 12 7 2 0 1 D",
			"1953 1953 8 13 7 3 0 0 S",
			"1954 1954 5 13 7 0 0 1 D",
			"1954 1954 8 12 7 0 0 0 S",
			"1955 1955 5 11 7 2 0 1 D",
			"1955 1955 8 11 7 0 0 0 S",
			"1956 1956 5 3 7 0 0 1 D",
			"1956 1956 8 30 7 3 0 0 S",
			"1957 1957 3 29 7 2 0 1 D",
			"1957 1957 8 22 7 0 0 0 S",
			"1974 1974 6 7 7 0 0 1 D",
			"1974 1974 9 13 7 0 0 0 S",
			"1975 1975 3 20 7 0 0 1 D",
			"1975 1975 7 31 7 0 0 0 S",
			"1985 1985 3 14 7 0 0 1 D",
			"1985 1985 8 15 7 0 0 0 S",
			"1986 1986 4 18 7 0 0 1 D",
			"1986 1986 8 7 7 0 0 0 S",
			"1987 1987 3 15 7 0 0 1 D",
			"1987 1987 8 13 7 0 0 0 S",
			"1988 1988 3 9 7 0 0 1 D",
			"1988 1988 8 3 7 0 0 0 S",
			"1989 1989 3 30 7 0 0 1 D",
			"1989 1989 8 3 7 0 0 0 S",
			"1990 1990 2 25 7 0 0 1 D",
			"1990 1990 7 26 7 0 0 0 S",
			"1991 1991 2 24 7 0 0 1 D",
			"1991 1991 8 1 7 0 0 0 S",
			"1992 1992 2 29 7 0 0 1 D",
			"1992 1992 8 6 7 0 0 0 S",
			"1993 1993 3 2 7 0 0 1 D",
			"1993 1993 8 5 7 0 0 0 S",
			"1994 1994 3 1 7 0 0 1 D",
			"1994 1994 7 28 7 0 0 0 S",
			"1995 1995 2 31 7 0 0 1 D",
			"1995 1995 8 3 7 0 0 0 S",
			"1996 1996 2 15 7 0 0 1 D",
			"1996 1996 8 16 7 0 0 0 S",
			"1997 1997 2 21 7 0 0 1 D",
			"1997 1997 8 14 7 0 0 0 S",
			"1998 1998 2 20 7 0 0 1 D",
			"1998 1998 8 6 7 0 0 0 S",
			"1999 1999 3 2 7 2 0 1 D",
			"1999 1999 8 3 7 2 0 0 S",
			"2000 2000 3 14 7 2 0 1 D",
			"2000 2000 9 6 7 1 0 0 S",
			"2001 2001 3 9 7 1 0 1 D",
			"2001 2001 8 24 7 1 0 0 S",
			"2002 2002 2 29 7 1 0 1 D",
			"2002 2002 9 7 7 1 0 0 S",
			"2003 2003 2 28 7 1 0 1 D",
			"2003 2003 9 3 7 1 0 0 S",
			"2004 2004 3 7 7 1 0 1 D",
			"2004 2004 8 22 7 1 0 0 S",
			"2005 2005 3 1 7 2 0 1 D",
			"2005 2005 9 9 7 2 0 0 S",
			"2006 2010 2 26 5 2 0 1 D",
			"2006 2006 9 1 7 2 0 0 S",
			"2007 2007 8 16 7 2 0 0 S",
			"2008 2008 9 5 7 2 0 0 S",
			"2009 2009 8 27 7 2 0 0 S",
			"2010 2010 8 12 7 2 0 0 S",
			"2011 2011 3 1 7 2 0 1 D",
			"2011 2011 9 2 7 2 0 0 S",
			"2012 2012 2 26 5 2 0 1 D",
			"2012 2012 8 23 7 2 0 0 S",
			"2013 9999 2 23 5 2 0 1 D",
			"2013 2026 9 2 0 2 0 0 S",
			"2027 2027 9 3 1 2 0 0 S",
			"2028 9999 9 2 0 2 0 0 S"
		]
	},
	"zones": {
		"Africa/Abidjan": [
			"-0:16:8 - LMT 1912 -0:16:8",
			"0 - GMT"
		],
		"Africa/Accra": [
			"-0:0:52 - LMT 1918 -0:0:52",
			"0 Ghana %s"
		],
		"Africa/Addis_Ababa": [
			"2:34:48 - LMT 1870 2:34:48",
			"2:35:20 - ADMT 1936_4_5 2:35:20",
			"3 - EAT"
		],
		"Africa/Algiers": [
			"0:12:12 - LMT 1891_2_15_0_1 0:12:12",
			"0:9:21 - PMT 1911_2_11 0:9:21",
			"0 Algeria WE%sT 1940_1_25_2",
			"1 Algeria CE%sT 1946_9_7 1",
			"0 - WET 1956_0_29",
			"1 - CET 1963_3_14 1",
			"0 Algeria WE%sT 1977_9_21 1",
			"1 Algeria CE%sT 1979_9_26 1",
			"0 Algeria WE%sT 1981_4",
			"1 - CET"
		],
		"Africa/Asmara": [
			"2:35:32 - LMT 1870 2:35:32",
			"2:35:32 - AMT 1890 2:35:32",
			"2:35:20 - ADMT 1936_4_5 2:35:20",
			"3 - EAT"
		],
		"Africa/Bamako": [
			"-0:32 - LMT 1912 -0:32",
			"0 - GMT 1934_1_26",
			"-1 - WAT 1960_5_20 -1",
			"0 - GMT"
		],
		"Africa/Bangui": [
			"1:14:20 - LMT 1912 1:14:20",
			"1 - WAT"
		],
		"Africa/Banjul": [
			"-1:6:36 - LMT 1912 -1:6:36",
			"-1:6:36 - BMT 1935 -1:6:36",
			"-1 - WAT 1964 -1",
			"0 - GMT"
		],
		"Africa/Bissau": [
			"-1:2:20 - LMT 1911_4_26 -1:2:20",
			"-1 - WAT 1975 -1",
			"0 - GMT"
		],
		"Africa/Blantyre": [
			"2:20 - LMT 1903_2 2:20",
			"2 - CAT"
		],
		"Africa/Brazzaville": [
			"1:1:8 - LMT 1912 1:1:8",
			"1 - WAT"
		],
		"Africa/Bujumbura": [
			"1:57:28 - LMT 1890 1:57:28",
			"2 - CAT"
		],
		"Africa/Cairo": [
			"2:5:9 - LMT 1900_9 2:5:9",
			"2 Egypt EE%sT"
		],
		"Africa/Casablanca": [
			"-0:30:20 - LMT 1913_9_26 -0:30:20",
			"0 Morocco WE%sT 1984_2_16",
			"1 - CET 1986 1",
			"0 Morocco WE%sT"
		],
		"Africa/Ceuta": [
			"-0:21:16 - LMT 1901 -0:21:16",
			"0 - WET 1918_4_6_23",
			"1 - WEST 1918_9_7_23 1",
			"0 - WET 1924",
			"0 Spain WE%sT 1929",
			"0 SpainAfrica WE%sT 1984_2_16",
			"1 - CET 1986 1",
			"1 EU CE%sT"
		],
		"Africa/Conakry": [
			"-0:54:52 - LMT 1912 -0:54:52",
			"0 - GMT 1934_1_26",
			"-1 - WAT 1960 -1",
			"0 - GMT"
		],
		"Africa/Dakar": [
			"-1:9:44 - LMT 1912 -1:9:44",
			"-1 - WAT 1941_5 -1",
			"0 - GMT"
		],
		"Africa/Dar_es_Salaam": [
			"2:37:8 - LMT 1931 2:37:8",
			"3 - EAT 1948 3",
			"2:45 - BEAUT 1961 2:45",
			"3 - EAT"
		],
		"Africa/Djibouti": [
			"2:52:36 - LMT 1911_6 2:52:36",
			"3 - EAT"
		],
		"Africa/Douala": [
			"0:38:48 - LMT 1912 0:38:48",
			"1 - WAT"
		],
		"Africa/El_Aaiun": [
			"-0:52:48 - LMT 1934_0 -0:52:48",
			"-1 - WAT 1976_3_14 -1",
			"0 - WET"
		],
		"Africa/Freetown": [
			"-0:53 - LMT 1882 -0:53",
			"-0:53 - FMT 1913_5 -0:53",
			"-1 SL %s 1957 -1",
			"0 SL %s"
		],
		"Africa/Gaborone": [
			"1:43:40 - LMT 1885 1:43:40",
			"1:30 - SAST 1903_2 1:30",
			"2 - CAT 1943_8_19_2 2",
			"3 - CAST 1944_2_19_2 3",
			"2 - CAT"
		],
		"Africa/Harare": [
			"2:4:12 - LMT 1903_2 2:4:12",
			"2 - CAT"
		],
		"Africa/Johannesburg": [
			"1:52 - LMT 1892_1_8 1:52",
			"1:30 - SAST 1903_2 1:30",
			"2 SA SAST"
		],
		"Africa/Juba": [
			"2:6:24 - LMT 1931 2:6:24",
			"2 Sudan CA%sT 2000_0_15_12 2",
			"3 - EAT"
		],
		"Africa/Kampala": [
			"2:9:40 - LMT 1928_6 2:9:40",
			"3 - EAT 1930 3",
			"2:30 - BEAT 1948 2:30",
			"2:45 - BEAUT 1957 2:45",
			"3 - EAT"
		],
		"Africa/Khartoum": [
			"2:10:8 - LMT 1931 2:10:8",
			"2 Sudan CA%sT 2000_0_15_12 2",
			"3 - EAT"
		],
		"Africa/Kigali": [
			"2:0:16 - LMT 1935_5 2:0:16",
			"2 - CAT"
		],
		"Africa/Kinshasa": [
			"1:1:12 - LMT 1897_10_9 1:1:12",
			"1 - WAT"
		],
		"Africa/Lagos": [
			"0:13:36 - LMT 1919_8 0:13:36",
			"1 - WAT"
		],
		"Africa/Libreville": [
			"0:37:48 - LMT 1912 0:37:48",
			"1 - WAT"
		],
		"Africa/Lome": [
			"0:4:52 - LMT 1893 0:4:52",
			"0 - GMT"
		],
		"Africa/Luanda": [
			"0:52:56 - LMT 1892 0:52:56",
			"0:52:4 - AOT 1911_4_26 0:52:4",
			"1 - WAT"
		],
		"Africa/Lubumbashi": [
			"1:49:52 - LMT 1897_10_9 1:49:52",
			"2 - CAT"
		],
		"Africa/Lusaka": [
			"1:53:8 - LMT 1903_2 1:53:8",
			"2 - CAT"
		],
		"Africa/Malabo": [
			"0:35:8 - LMT 1912 0:35:8",
			"0 - GMT 1963_11_15",
			"1 - WAT"
		],
		"Africa/Maputo": [
			"2:10:20 - LMT 1903_2 2:10:20",
			"2 - CAT"
		],
		"Africa/Maseru": [
			"1:50 - LMT 1903_2 1:50",
			"2 - SAST 1943_8_19_2 2",
			"3 - SAST 1944_2_19_2 3",
			"2 - SAST"
		],
		"Africa/Mbabane": [
			"2:4:24 - LMT 1903_2 2:4:24",
			"2 - SAST"
		],
		"Africa/Mogadishu": [
			"3:1:28 - LMT 1893_10 3:1:28",
			"3 - EAT 1931 3",
			"2:30 - BEAT 1957 2:30",
			"3 - EAT"
		],
		"Africa/Monrovia": [
			"-0:43:8 - LMT 1882 -0:43:8",
			"-0:43:8 - MMT 1919_2 -0:43:8",
			"-0:44:30 - LRT 1972_4 -0:44:30",
			"0 - GMT"
		],
		"Africa/Nairobi": [
			"2:27:16 - LMT 1928_6 2:27:16",
			"3 - EAT 1930 3",
			"2:30 - BEAT 1940 2:30",
			"2:45 - BEAUT 1960 2:45",
			"3 - EAT"
		],
		"Africa/Ndjamena": [
			"1:0:12 - LMT 1912 1:0:12",
			"1 - WAT 1979_9_14 1",
			"2 - WAST 1980_2_8 2",
			"1 - WAT"
		],
		"Africa/Niamey": [
			"0:8:28 - LMT 1912 0:8:28",
			"-1 - WAT 1934_1_26 -1",
			"0 - GMT 1960",
			"1 - WAT"
		],
		"Africa/Nouakchott": [
			"-1:3:48 - LMT 1912 -1:3:48",
			"0 - GMT 1934_1_26",
			"-1 - WAT 1960_10_28 -1",
			"0 - GMT"
		],
		"Africa/Ouagadougou": [
			"-0:6:4 - LMT 1912 -0:6:4",
			"0 - GMT"
		],
		"Africa/Porto-Novo": [
			"0:10:28 - LMT 1912 0:10:28",
			"0 - GMT 1934_1_26",
			"1 - WAT"
		],
		"Africa/Sao_Tome": [
			"0:26:56 - LMT 1884 0:26:56",
			"-0:36:32 - LMT 1912 -0:36:32",
			"0 - GMT"
		],
		"Africa/Tripoli": [
			"0:52:44 - LMT 1920 0:52:44",
			"1 Libya CE%sT 1959 1",
			"2 - EET 1982 2",
			"1 Libya CE%sT 1990_4_4 1",
			"2 - EET 1996_8_30 2",
			"1 Libya CE%sT 1997_9_4 2",
			"2 - EET 2012_10_10_2 2",
			"1 Libya CE%sT"
		],
		"Africa/Tunis": [
			"0:40:44 - LMT 1881_4_12 0:40:44",
			"0:9:21 - PMT 1911_2_11 0:9:21",
			"1 Tunisia CE%sT"
		],
		"Africa/Windhoek": [
			"1:8:24 - LMT 1892_1_8 1:8:24",
			"1:30 - SWAT 1903_2 1:30",
			"2 - SAST 1942_8_20_2 2",
			"3 - SAST 1943_2_21_2 3",
			"2 - SAST 1990_2_21 2",
			"2 - CAT 1994_3_3 2",
			"1 Namibia WA%sT"
		],
		"America/Adak": [
			"12:13:21 - LMT 1867_9_18 12:13:21",
			"-11:46:38 - LMT 1900_7_20_12 -11:46:38",
			"-11 - NST 1942 -11",
			"-11 US N%sT 1946 -11",
			"-11 - NST 1967_3 -11",
			"-11 - BST 1969 -11",
			"-11 US B%sT 1983_9_30_2 -10",
			"-10 US AH%sT 1983_10_30 -10",
			"-10 US HA%sT"
		],
		"America/Anchorage": [
			"14:0:24 - LMT 1867_9_18 14:0:24",
			"-9:59:36 - LMT 1900_7_20_12 -9:59:36",
			"-10 - CAT 1942 -10",
			"-10 US CAT/CAWT 1945_7_14_23",
			"-10 US CAT/CAPT 1946 -10",
			"-10 - CAT 1967_3 -10",
			"-10 - AHST 1969 -10",
			"-10 US AH%sT 1983_9_30_2 -9",
			"-9 US Y%sT 1983_10_30 -9",
			"-9 US AK%sT"
		],
		"America/Anguilla": [
			"-4:12:16 - LMT 1912_2_2 -4:12:16",
			"-4 - AST"
		],
		"America/Antigua": [
			"-4:7:12 - LMT 1912_2_2 -4:7:12",
			"-5 - EST 1951 -5",
			"-4 - AST"
		],
		"America/Araguaina": [
			"-3:12:48 - LMT 1914 -3:12:48",
			"-3 Brazil BR%sT 1990_8_17 -3",
			"-3 - BRT 1995_8_14 -3",
			"-3 Brazil BR%sT 2003_8_24 -3",
			"-3 - BRT 2012_9_21 -3",
			"-3 Brazil BR%sT"
		],
		"America/Argentina/Buenos_Aires": [
			"-3:53:48 - LMT 1894_9_31 -3:53:48",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 Arg AR%sT"
		],
		"America/Argentina/Catamarca": [
			"-4:23:8 - LMT 1894_9_31 -4:23:8",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1991_2_3 -2",
			"-4 - WART 1991_9_20 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 - ART 2004_5_1 -3",
			"-4 - WART 2004_5_20 -4",
			"-3 Arg AR%sT 2008_9_18 -3",
			"-3 - ART"
		],
		"America/Argentina/Cordoba": [
			"-4:16:48 - LMT 1894_9_31 -4:16:48",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1991_2_3 -2",
			"-4 - WART 1991_9_20 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 Arg AR%sT"
		],
		"America/Argentina/Jujuy": [
			"-4:21:12 - LMT 1894_9_31 -4:21:12",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1990_2_4 -2",
			"-4 - WART 1990_9_28 -4",
			"-3 - WARST 1991_2_17 -3",
			"-4 - WART 1991_9_6 -4",
			"-2 - ARST 1992 -2",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 Arg AR%sT 2008_9_18 -3",
			"-3 - ART"
		],
		"America/Argentina/La_Rioja": [
			"-4:27:24 - LMT 1894_9_31 -4:27:24",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1991_2_1 -2",
			"-4 - WART 1991_4_7 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 - ART 2004_5_1 -3",
			"-4 - WART 2004_5_20 -4",
			"-3 Arg AR%sT 2008_9_18 -3",
			"-3 - ART"
		],
		"America/Argentina/Mendoza": [
			"-4:35:16 - LMT 1894_9_31 -4:35:16",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1990_2_4 -2",
			"-4 - WART 1990_9_15 -4",
			"-3 - WARST 1991_2_1 -3",
			"-4 - WART 1991_9_15 -4",
			"-3 - WARST 1992_2_1 -3",
			"-4 - WART 1992_9_18 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 - ART 2004_4_23 -3",
			"-4 - WART 2004_8_26 -4",
			"-3 Arg AR%sT 2008_9_18 -3",
			"-3 - ART"
		],
		"America/Argentina/Rio_Gallegos": [
			"-4:36:52 - LMT 1894_9_31 -4:36:52",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 - ART 2004_5_1 -3",
			"-4 - WART 2004_5_20 -4",
			"-3 Arg AR%sT 2008_9_18 -3",
			"-3 - ART"
		],
		"America/Argentina/Salta": [
			"-4:21:40 - LMT 1894_9_31 -4:21:40",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1991_2_3 -2",
			"-4 - WART 1991_9_20 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 Arg AR%sT 2008_9_18 -3",
			"-3 - ART"
		],
		"America/Argentina/San_Juan": [
			"-4:34:4 - LMT 1894_9_31 -4:34:4",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1991_2_1 -2",
			"-4 - WART 1991_4_7 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 - ART 2004_4_31 -3",
			"-4 - WART 2004_6_25 -4",
			"-3 Arg AR%sT 2008_9_18 -3",
			"-3 - ART"
		],
		"America/Argentina/San_Luis": [
			"-4:25:24 - LMT 1894_9_31 -4:25:24",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1990 -2",
			"-2 - ARST 1990_2_14 -2",
			"-4 - WART 1990_9_15 -4",
			"-3 - WARST 1991_2_1 -3",
			"-4 - WART 1991_5_1 -4",
			"-3 - ART 1999_9_3 -3",
			"-3 - WARST 2000_2_3 -3",
			"-3 - ART 2004_4_31 -3",
			"-4 - WART 2004_6_25 -4",
			"-3 Arg AR%sT 2008_0_21 -2",
			"-4 SanLuis WAR%sT"
		],
		"America/Argentina/Tucuman": [
			"-4:20:52 - LMT 1894_9_31 -4:20:52",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1991_2_3 -2",
			"-4 - WART 1991_9_20 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 - ART 2004_5_1 -3",
			"-4 - WART 2004_5_13 -4",
			"-3 Arg AR%sT"
		],
		"America/Argentina/Ushuaia": [
			"-4:33:12 - LMT 1894_9_31 -4:33:12",
			"-4:16:48 - CMT 1920_4 -4:16:48",
			"-4 - ART 1930_11 -4",
			"-4 Arg AR%sT 1969_9_5 -4",
			"-3 Arg AR%sT 1999_9_3 -3",
			"-4 Arg AR%sT 2000_2_3 -3",
			"-3 - ART 2004_4_30 -3",
			"-4 - WART 2004_5_20 -4",
			"-3 Arg AR%sT 2008_9_18 -3",
			"-3 - ART"
		],
		"America/Aruba": [
			"-4:40:24 - LMT 1912_1_12 -4:40:24",
			"-4:30 - ANT 1965 -4:30",
			"-4 - AST"
		],
		"America/Asuncion": [
			"-3:50:40 - LMT 1890 -3:50:40",
			"-3:50:40 - AMT 1931_9_10 -3:50:40",
			"-4 - PYT 1972_9 -4",
			"-3 - PYT 1974_3 -3",
			"-4 Para PY%sT"
		],
		"America/Atikokan": [
			"-6:6:28 - LMT 1895 -6:6:28",
			"-6 Canada C%sT 1940_8_29 -6",
			"-5 - CDT 1942_1_9_2 -6",
			"-6 Canada C%sT 1945_8_30_2 -5",
			"-5 - EST"
		],
		"America/Bahia": [
			"-2:34:4 - LMT 1914 -2:34:4",
			"-3 Brazil BR%sT 2003_8_24 -3",
			"-3 - BRT 2011_9_16 -3",
			"-3 Brazil BR%sT 2012_9_21 -3",
			"-3 - BRT"
		],
		"America/Bahia_Banderas": [
			"-7:1 - LMT 1921_11_31_23_59 -7:1",
			"-7 - MST 1927_5_10_23 -7",
			"-6 - CST 1930_10_15 -6",
			"-7 - MST 1931_4_1_23 -7",
			"-6 - CST 1931_9 -6",
			"-7 - MST 1932_3_1 -7",
			"-6 - CST 1942_3_24 -6",
			"-7 - MST 1949_0_14 -7",
			"-8 - PST 1970 -8",
			"-7 Mexico M%sT 2010_3_4_2 -7",
			"-6 Mexico C%sT"
		],
		"America/Barbados": [
			"-3:58:29 - LMT 1924 -3:58:29",
			"-3:58:29 - BMT 1932 -3:58:29",
			"-4 Barb A%sT"
		],
		"America/Belem": [
			"-3:13:56 - LMT 1914 -3:13:56",
			"-3 Brazil BR%sT 1988_8_12 -3",
			"-3 - BRT"
		],
		"America/Belize": [
			"-5:52:48 - LMT 1912_3 -5:52:48",
			"-6 Belize C%sT"
		],
		"America/Blanc-Sablon": [
			"-3:48:28 - LMT 1884 -3:48:28",
			"-4 Canada A%sT 1970 -4",
			"-4 - AST"
		],
		"America/Boa_Vista": [
			"-4:2:40 - LMT 1914 -4:2:40",
			"-4 Brazil AM%sT 1988_8_12 -4",
			"-4 - AMT 1999_8_30 -4",
			"-4 Brazil AM%sT 2000_9_15 -3",
			"-4 - AMT"
		],
		"America/Bogota": [
			"-4:56:16 - LMT 1884_2_13 -4:56:16",
			"-4:56:16 - BMT 1914_10_23 -4:56:16",
			"-5 CO CO%sT"
		],
		"America/Boise": [
			"-7:44:49 - LMT 1883_10_18_12_15_11 -7:44:49",
			"-8 US P%sT 1923_4_13_2 -8",
			"-7 US M%sT 1974 -7",
			"-7 - MST 1974_1_3_2 -7",
			"-7 US M%sT"
		],
		"America/Cambridge_Bay": [
			"0 - zzz 1920",
			"-7 NT_YK M%sT 1999_9_31_2 -6",
			"-6 Canada C%sT 2000_9_29_2 -5",
			"-5 - EST 2000_10_5_0 -5",
			"-6 - CST 2001_3_1_3 -6",
			"-7 Canada M%sT"
		],
		"America/Campo_Grande": [
			"-3:38:28 - LMT 1914 -3:38:28",
			"-4 Brazil AM%sT"
		],
		"America/Cancun": [
			"-5:47:4 - LMT 1922_0_1_0_12_56 -5:47:4",
			"-6 - CST 1981_11_23 -6",
			"-5 Mexico E%sT 1998_7_2_2 -4",
			"-6 Mexico C%sT"
		],
		"America/Caracas": [
			"-4:27:44 - LMT 1890 -4:27:44",
			"-4:27:40 - CMT 1912_1_12 -4:27:40",
			"-4:30 - VET 1965 -4:30",
			"-4 - VET 2007_11_9_03 -4",
			"-4:30 - VET"
		],
		"America/Cayenne": [
			"-3:29:20 - LMT 1911_6 -3:29:20",
			"-4 - GFT 1967_9 -4",
			"-3 - GFT"
		],
		"America/Cayman": [
			"-5:25:32 - LMT 1890 -5:25:32",
			"-5:7:12 - KMT 1912_1 -5:7:12",
			"-5 - EST"
		],
		"America/Chicago": [
			"-5:50:36 - LMT 1883_10_18_12_9_24 -5:50:36",
			"-6 US C%sT 1920 -6",
			"-6 Chicago C%sT 1936_2_1_2 -6",
			"-5 - EST 1936_10_15_2 -5",
			"-6 Chicago C%sT 1942 -6",
			"-6 US C%sT 1946 -6",
			"-6 Chicago C%sT 1967 -6",
			"-6 US C%sT"
		],
		"America/Chihuahua": [
			"-7:4:20 - LMT 1921_11_31_23_55_40 -7:4:20",
			"-7 - MST 1927_5_10_23 -7",
			"-6 - CST 1930_10_15 -6",
			"-7 - MST 1931_4_1_23 -7",
			"-6 - CST 1931_9 -6",
			"-7 - MST 1932_3_1 -7",
			"-6 - CST 1996 -6",
			"-6 Mexico C%sT 1998 -6",
			"-6 - CST 1998_3_5_3 -6",
			"-7 Mexico M%sT"
		],
		"America/Costa_Rica": [
			"-5:36:13 - LMT 1890 -5:36:13",
			"-5:36:13 - SJMT 1921_0_15 -5:36:13",
			"-6 CR C%sT"
		],
		"America/Creston": [
			"-7:46:4 - LMT 1884 -7:46:4",
			"-7 - MST 1916_9_1 -7",
			"-8 - PST 1918_5_2 -8",
			"-7 - MST"
		],
		"America/Cuiaba": [
			"-3:44:20 - LMT 1914 -3:44:20",
			"-4 Brazil AM%sT 2003_8_24 -4",
			"-4 - AMT 2004_9_1 -4",
			"-4 Brazil AM%sT"
		],
		"America/Curacao": [
			"-4:35:47 - LMT 1912_1_12 -4:35:47",
			"-4:30 - ANT 1965 -4:30",
			"-4 - AST"
		],
		"America/Danmarkshavn": [
			"-1:14:40 - LMT 1916_6_28 -1:14:40",
			"-3 - WGT 1980_3_6_2 -3",
			"-3 EU WG%sT 1996 -3",
			"0 - GMT"
		],
		"America/Dawson": [
			"-9:17:40 - LMT 1900_7_20 -9:17:40",
			"-9 NT_YK Y%sT 1973_9_28_0 -9",
			"-8 NT_YK P%sT 1980 -8",
			"-8 Canada P%sT"
		],
		"America/Dawson_Creek": [
			"-8:0:56 - LMT 1884 -8:0:56",
			"-8 Canada P%sT 1947 -8",
			"-8 Vanc P%sT 1972_7_30_2 -7",
			"-7 - MST"
		],
		"America/Denver": [
			"-6:59:56 - LMT 1883_10_18_12_0_4 -6:59:56",
			"-7 US M%sT 1920 -7",
			"-7 Denver M%sT 1942 -7",
			"-7 US M%sT 1946 -7",
			"-7 Denver M%sT 1967 -7",
			"-7 US M%sT"
		],
		"America/Detroit": [
			"-5:32:11 - LMT 1905 -5:32:11",
			"-6 - CST 1915_4_15_2 -6",
			"-5 - EST 1942 -5",
			"-5 US E%sT 1946 -5",
			"-5 Detroit E%sT 1973 -5",
			"-5 US E%sT 1975 -5",
			"-5 - EST 1975_3_27_2 -5",
			"-5 US E%sT"
		],
		"America/Dominica": [
			"-4:5:36 - LMT 1911_6_1_0_1 -4:5:36",
			"-4 - AST"
		],
		"America/Edmonton": [
			"-7:33:52 - LMT 1906_8 -7:33:52",
			"-7 Edm M%sT 1987 -7",
			"-7 Canada M%sT"
		],
		"America/Eirunepe": [
			"-4:39:28 - LMT 1914 -4:39:28",
			"-5 Brazil AC%sT 1988_8_12 -5",
			"-5 - ACT 1993_8_28 -5",
			"-5 Brazil AC%sT 1994_8_22 -5",
			"-5 - ACT 2008_5_24_00 -5",
			"-4 - AMT"
		],
		"America/El_Salvador": [
			"-5:56:48 - LMT 1921 -5:56:48",
			"-6 Salv C%sT"
		],
		"America/Fortaleza": [
			"-2:34 - LMT 1914 -2:34",
			"-3 Brazil BR%sT 1990_8_17 -3",
			"-3 - BRT 1999_8_30 -3",
			"-3 Brazil BR%sT 2000_9_22 -2",
			"-3 - BRT 2001_8_13 -3",
			"-3 Brazil BR%sT 2002_9_1 -3",
			"-3 - BRT"
		],
		"America/Glace_Bay": [
			"-3:59:48 - LMT 1902_5_15 -3:59:48",
			"-4 Canada A%sT 1953 -4",
			"-4 Halifax A%sT 1954 -4",
			"-4 - AST 1972 -4",
			"-4 Halifax A%sT 1974 -4",
			"-4 Canada A%sT"
		],
		"America/Godthab": [
			"-3:26:56 - LMT 1916_6_28 -3:26:56",
			"-3 - WGT 1980_3_6_2 -3",
			"-3 EU WG%sT"
		],
		"America/Goose_Bay": [
			"-4:1:40 - LMT 1884 -4:1:40",
			"-3:30:52 - NST 1918 -3:30:52",
			"-3:30:52 Canada N%sT 1919 -3:30:52",
			"-3:30:52 - NST 1935_2_30 -3:30:52",
			"-3:30 - NST 1936 -3:30",
			"-3:30 StJohns N%sT 1942_4_11 -3:30",
			"-3:30 Canada N%sT 1946 -3:30",
			"-3:30 StJohns N%sT 1966_2_15_2 -3:30",
			"-4 StJohns A%sT 2011_10 -3",
			"-4 Canada A%sT"
		],
		"America/Grand_Turk": [
			"-4:44:32 - LMT 1890 -4:44:32",
			"-5:7:12 - KMT 1912_1 -5:7:12",
			"-5 TC E%sT"
		],
		"America/Grenada": [
			"-4:7 - LMT 1911_6 -4:7",
			"-4 - AST"
		],
		"America/Guadeloupe": [
			"-4:6:8 - LMT 1911_5_8 -4:6:8",
			"-4 - AST"
		],
		"America/Guatemala": [
			"-6:2:4 - LMT 1918_9_5 -6:2:4",
			"-6 Guat C%sT"
		],
		"America/Guayaquil": [
			"-5:19:20 - LMT 1890 -5:19:20",
			"-5:14 - QMT 1931 -5:14",
			"-5 - ECT"
		],
		"America/Guyana": [
			"-3:52:40 - LMT 1915_2 -3:52:40",
			"-3:45 - GBGT 1966_4_26 -3:45",
			"-3:45 - GYT 1975_6_31 -3:45",
			"-3 - GYT 1991 -3",
			"-4 - GYT"
		],
		"America/Halifax": [
			"-4:14:24 - LMT 1902_5_15 -4:14:24",
			"-4 Halifax A%sT 1918 -4",
			"-4 Canada A%sT 1919 -4",
			"-4 Halifax A%sT 1942_1_9_2 -4",
			"-4 Canada A%sT 1946 -4",
			"-4 Halifax A%sT 1974 -4",
			"-4 Canada A%sT"
		],
		"America/Havana": [
			"-5:29:28 - LMT 1890 -5:29:28",
			"-5:29:36 - HMT 1925_6_19_12 -5:29:36",
			"-5 Cuba C%sT"
		],
		"America/Hermosillo": [
			"-7:23:52 - LMT 1921_11_31_23_36_8 -7:23:52",
			"-7 - MST 1927_5_10_23 -7",
			"-6 - CST 1930_10_15 -6",
			"-7 - MST 1931_4_1_23 -7",
			"-6 - CST 1931_9 -6",
			"-7 - MST 1932_3_1 -7",
			"-6 - CST 1942_3_24 -6",
			"-7 - MST 1949_0_14 -7",
			"-8 - PST 1970 -8",
			"-7 Mexico M%sT 1999 -7",
			"-7 - MST"
		],
		"America/Indiana/Indianapolis": [
			"-5:44:38 - LMT 1883_10_18_12_15_22 -5:44:38",
			"-6 US C%sT 1920 -6",
			"-6 Indianapolis C%sT 1942 -6",
			"-6 US C%sT 1946 -6",
			"-6 Indianapolis C%sT 1955_3_24_2 -6",
			"-5 - EST 1957_8_29_2 -5",
			"-6 - CST 1958_3_27_2 -6",
			"-5 - EST 1969 -5",
			"-5 US E%sT 1971 -5",
			"-5 - EST 2006 -5",
			"-5 US E%sT"
		],
		"America/Indiana/Knox": [
			"-5:46:30 - LMT 1883_10_18_12_13_30 -5:46:30",
			"-6 US C%sT 1947 -6",
			"-6 Starke C%sT 1962_3_29_2 -6",
			"-5 - EST 1963_9_27_2 -5",
			"-6 US C%sT 1991_9_27_2 -5",
			"-5 - EST 2006_3_2_2 -5",
			"-6 US C%sT"
		],
		"America/Indiana/Marengo": [
			"-5:45:23 - LMT 1883_10_18_12_14_37 -5:45:23",
			"-6 US C%sT 1951 -6",
			"-6 Marengo C%sT 1961_3_30_2 -6",
			"-5 - EST 1969 -5",
			"-5 US E%sT 1974_0_6_2 -5",
			"-5 - CDT 1974_9_27_2 -5",
			"-5 US E%sT 1976 -5",
			"-5 - EST 2006 -5",
			"-5 US E%sT"
		],
		"America/Indiana/Petersburg": [
			"-5:49:7 - LMT 1883_10_18_12_10_53 -5:49:7",
			"-6 US C%sT 1955 -6",
			"-6 Pike C%sT 1965_3_25_2 -6",
			"-5 - EST 1966_9_30_2 -5",
			"-6 US C%sT 1977_9_30_2 -5",
			"-5 - EST 2006_3_2_2 -5",
			"-6 US C%sT 2007_10_4_2 -5",
			"-5 US E%sT"
		],
		"America/Indiana/Tell_City": [
			"-5:47:3 - LMT 1883_10_18_12_12_57 -5:47:3",
			"-6 US C%sT 1946 -6",
			"-6 Perry C%sT 1964_3_26_2 -6",
			"-5 - EST 1969 -5",
			"-5 US E%sT 1971 -5",
			"-5 - EST 2006_3_2_2 -5",
			"-6 US C%sT"
		],
		"America/Indiana/Vevay": [
			"-5:40:16 - LMT 1883_10_18_12_19_44 -5:40:16",
			"-6 US C%sT 1954_3_25_2 -6",
			"-5 - EST 1969 -5",
			"-5 US E%sT 1973 -5",
			"-5 - EST 2006 -5",
			"-5 US E%sT"
		],
		"America/Indiana/Vincennes": [
			"-5:50:7 - LMT 1883_10_18_12_9_53 -5:50:7",
			"-6 US C%sT 1946 -6",
			"-6 Vincennes C%sT 1964_3_26_2 -6",
			"-5 - EST 1969 -5",
			"-5 US E%sT 1971 -5",
			"-5 - EST 2006_3_2_2 -5",
			"-6 US C%sT 2007_10_4_2 -5",
			"-5 US E%sT"
		],
		"America/Indiana/Winamac": [
			"-5:46:25 - LMT 1883_10_18_12_13_35 -5:46:25",
			"-6 US C%sT 1946 -6",
			"-6 Pulaski C%sT 1961_3_30_2 -6",
			"-5 - EST 1969 -5",
			"-5 US E%sT 1971 -5",
			"-5 - EST 2006_3_2_2 -5",
			"-6 US C%sT 2007_2_11_2 -6",
			"-5 US E%sT"
		],
		"America/Inuvik": [
			"0 - zzz 1953",
			"-8 NT_YK P%sT 1979_3_29_2 -8",
			"-7 NT_YK M%sT 1980 -7",
			"-7 Canada M%sT"
		],
		"America/Iqaluit": [
			"0 - zzz 1942_7",
			"-5 NT_YK E%sT 1999_9_31_2 -4",
			"-6 Canada C%sT 2000_9_29_2 -5",
			"-5 Canada E%sT"
		],
		"America/Jamaica": [
			"-5:7:12 - LMT 1890 -5:7:12",
			"-5:7:12 - KMT 1912_1 -5:7:12",
			"-5 - EST 1974_3_28_2 -5",
			"-5 US E%sT 1984 -5",
			"-5 - EST"
		],
		"America/Juneau": [
			"15:2:19 - LMT 1867_9_18 15:2:19",
			"-8:57:41 - LMT 1900_7_20_12 -8:57:41",
			"-8 - PST 1942 -8",
			"-8 US P%sT 1946 -8",
			"-8 - PST 1969 -8",
			"-8 US P%sT 1980_3_27_2 -8",
			"-9 US Y%sT 1980_9_26_2 -8",
			"-8 US P%sT 1983_9_30_2 -7",
			"-9 US Y%sT 1983_10_30 -9",
			"-9 US AK%sT"
		],
		"America/Kentucky/Louisville": [
			"-5:43:2 - LMT 1883_10_18_12_16_58 -5:43:2",
			"-6 US C%sT 1921 -6",
			"-6 Louisville C%sT 1942 -6",
			"-6 US C%sT 1946 -6",
			"-6 Louisville C%sT 1961_6_23_2 -5",
			"-5 - EST 1968 -5",
			"-5 US E%sT 1974_0_6_2 -5",
			"-5 - CDT 1974_9_27_2 -5",
			"-5 US E%sT"
		],
		"America/Kentucky/Monticello": [
			"-5:39:24 - LMT 1883_10_18_12_20_36 -5:39:24",
			"-6 US C%sT 1946 -6",
			"-6 - CST 1968 -6",
			"-6 US C%sT 2000_9_29_2 -5",
			"-5 US E%sT"
		],
		"America/La_Paz": [
			"-4:32:36 - LMT 1890 -4:32:36",
			"-4:32:36 - CMT 1931_9_15 -4:32:36",
			"-3:32:36 - BOST 1932_2_21 -3:32:36",
			"-4 - BOT"
		],
		"America/Lima": [
			"-5:8:12 - LMT 1890 -5:8:12",
			"-5:8:36 - LMT 1908_6_28 -5:8:36",
			"-5 Peru PE%sT"
		],
		"America/Los_Angeles": [
			"-7:52:58 - LMT 1883_10_18_12_7_2 -7:52:58",
			"-8 US P%sT 1946 -8",
			"-8 CA P%sT 1967 -8",
			"-8 US P%sT"
		],
		"America/Maceio": [
			"-2:22:52 - LMT 1914 -2:22:52",
			"-3 Brazil BR%sT 1990_8_17 -3",
			"-3 - BRT 1995_9_13 -3",
			"-3 Brazil BR%sT 1996_8_4 -3",
			"-3 - BRT 1999_8_30 -3",
			"-3 Brazil BR%sT 2000_9_22 -2",
			"-3 - BRT 2001_8_13 -3",
			"-3 Brazil BR%sT 2002_9_1 -3",
			"-3 - BRT"
		],
		"America/Managua": [
			"-5:45:8 - LMT 1890 -5:45:8",
			"-5:45:12 - MMT 1934_5_23 -5:45:12",
			"-6 - CST 1973_4 -6",
			"-5 - EST 1975_1_16 -5",
			"-6 Nic C%sT 1992_0_1_4 -6",
			"-5 - EST 1992_8_24 -5",
			"-6 - CST 1993 -6",
			"-5 - EST 1997 -5",
			"-6 Nic C%sT"
		],
		"America/Manaus": [
			"-4:0:4 - LMT 1914 -4:0:4",
			"-4 Brazil AM%sT 1988_8_12 -4",
			"-4 - AMT 1993_8_28 -4",
			"-4 Brazil AM%sT 1994_8_22 -4",
			"-4 - AMT"
		],
		"America/Martinique": [
			"-4:4:20 - LMT 1890 -4:4:20",
			"-4:4:20 - FFMT 1911_4 -4:4:20",
			"-4 - AST 1980_3_6 -4",
			"-3 - ADT 1980_8_28 -3",
			"-4 - AST"
		],
		"America/Matamoros": [
			"-6:40 - LMT 1921_11_31_23_20 -6:40",
			"-6 - CST 1988 -6",
			"-6 US C%sT 1989 -6",
			"-6 Mexico C%sT 2010 -6",
			"-6 US C%sT"
		],
		"America/Mazatlan": [
			"-7:5:40 - LMT 1921_11_31_23_54_20 -7:5:40",
			"-7 - MST 1927_5_10_23 -7",
			"-6 - CST 1930_10_15 -6",
			"-7 - MST 1931_4_1_23 -7",
			"-6 - CST 1931_9 -6",
			"-7 - MST 1932_3_1 -7",
			"-6 - CST 1942_3_24 -6",
			"-7 - MST 1949_0_14 -7",
			"-8 - PST 1970 -8",
			"-7 Mexico M%sT"
		],
		"America/Menominee": [
			"-5:50:27 - LMT 1885_8_18_12 -5:50:27",
			"-6 US C%sT 1946 -6",
			"-6 Menominee C%sT 1969_3_27_2 -6",
			"-5 - EST 1973_3_29_2 -5",
			"-6 US C%sT"
		],
		"America/Merida": [
			"-5:58:28 - LMT 1922_0_1_0_1_32 -5:58:28",
			"-6 - CST 1981_11_23 -6",
			"-5 - EST 1982_11_2 -5",
			"-6 Mexico C%sT"
		],
		"America/Metlakatla": [
			"15:13:42 - LMT 1867_9_18 15:13:42",
			"-8:46:18 - LMT 1900_7_20_12 -8:46:18",
			"-8 - PST 1942 -8",
			"-8 US P%sT 1946 -8",
			"-8 - PST 1969 -8",
			"-8 US P%sT 1983_9_30_2 -7",
			"-8 - MeST"
		],
		"America/Mexico_City": [
			"-6:36:36 - LMT 1922_0_1_0_23_24 -6:36:36",
			"-7 - MST 1927_5_10_23 -7",
			"-6 - CST 1930_10_15 -6",
			"-7 - MST 1931_4_1_23 -7",
			"-6 - CST 1931_9 -6",
			"-7 - MST 1932_3_1 -7",
			"-6 Mexico C%sT 2001_8_30_02 -5",
			"-6 - CST 2002_1_20 -6",
			"-6 Mexico C%sT"
		],
		"America/Miquelon": [
			"-3:44:40 - LMT 1911_4_15 -3:44:40",
			"-4 - AST 1980_4 -4",
			"-3 - PMST 1987 -3",
			"-3 Canada PM%sT"
		],
		"America/Moncton": [
			"-4:19:8 - LMT 1883_11_9 -4:19:8",
			"-5 - EST 1902_5_15 -5",
			"-4 Canada A%sT 1933 -4",
			"-4 Moncton A%sT 1942 -4",
			"-4 Canada A%sT 1946 -4",
			"-4 Moncton A%sT 1973 -4",
			"-4 Canada A%sT 1993 -4",
			"-4 Moncton A%sT 2007 -4",
			"-4 Canada A%sT"
		],
		"America/Monterrey": [
			"-6:41:16 - LMT 1921_11_31_23_18_44 -6:41:16",
			"-6 - CST 1988 -6",
			"-6 US C%sT 1989 -6",
			"-6 Mexico C%sT"
		],
		"America/Montevideo": [
			"-3:44:44 - LMT 1898_5_28 -3:44:44",
			"-3:44:44 - MMT 1920_4_1 -3:44:44",
			"-3:30 Uruguay UY%sT 1942_11_14 -3:30",
			"-3 Uruguay UY%sT"
		],
		"America/Montreal": [
			"-4:54:16 - LMT 1884 -4:54:16",
			"-5 Mont E%sT 1918 -5",
			"-5 Canada E%sT 1919 -5",
			"-5 Mont E%sT 1942_1_9_2 -5",
			"-5 Canada E%sT 1946 -5",
			"-5 Mont E%sT 1974 -5",
			"-5 Canada E%sT"
		],
		"America/Montserrat": [
			"-4:8:52 - LMT 1911_6_1_0_1 -4:8:52",
			"-4 - AST"
		],
		"America/Nassau": [
			"-5:9:30 - LMT 1912_2_2 -5:9:30",
			"-5 Bahamas E%sT 1976 -5",
			"-5 US E%sT"
		],
		"America/New_York": [
			"-4:56:2 - LMT 1883_10_18_12_3_58 -4:56:2",
			"-5 US E%sT 1920 -5",
			"-5 NYC E%sT 1942 -5",
			"-5 US E%sT 1946 -5",
			"-5 NYC E%sT 1967 -5",
			"-5 US E%sT"
		],
		"America/Nipigon": [
			"-5:53:4 - LMT 1895 -5:53:4",
			"-5 Canada E%sT 1940_8_29 -5",
			"-4 - EDT 1942_1_9_2 -5",
			"-5 Canada E%sT"
		],
		"America/Nome": [
			"12:58:21 - LMT 1867_9_18 12:58:21",
			"-11:1:38 - LMT 1900_7_20_12 -11:1:38",
			"-11 - NST 1942 -11",
			"-11 US N%sT 1946 -11",
			"-11 - NST 1967_3 -11",
			"-11 - BST 1969 -11",
			"-11 US B%sT 1983_9_30_2 -10",
			"-9 US Y%sT 1983_10_30 -9",
			"-9 US AK%sT"
		],
		"America/Noronha": [
			"-2:9:40 - LMT 1914 -2:9:40",
			"-2 Brazil FN%sT 1990_8_17 -2",
			"-2 - FNT 1999_8_30 -2",
			"-2 Brazil FN%sT 2000_9_15 -1",
			"-2 - FNT 2001_8_13 -2",
			"-2 Brazil FN%sT 2002_9_1 -2",
			"-2 - FNT"
		],
		"America/North_Dakota/Beulah": [
			"-6:47:7 - LMT 1883_10_18_12_12_53 -6:47:7",
			"-7 US M%sT 2010_10_7_2 -6",
			"-6 US C%sT"
		],
		"America/North_Dakota/Center": [
			"-6:45:12 - LMT 1883_10_18_12_14_48 -6:45:12",
			"-7 US M%sT 1992_9_25_02 -6",
			"-6 US C%sT"
		],
		"America/North_Dakota/New_Salem": [
			"-6:45:39 - LMT 1883_10_18_12_14_21 -6:45:39",
			"-7 US M%sT 2003_9_26_02 -6",
			"-6 US C%sT"
		],
		"America/Ojinaga": [
			"-6:57:40 - LMT 1922_0_1_0_2_20 -6:57:40",
			"-7 - MST 1927_5_10_23 -7",
			"-6 - CST 1930_10_15 -6",
			"-7 - MST 1931_4_1_23 -7",
			"-6 - CST 1931_9 -6",
			"-7 - MST 1932_3_1 -7",
			"-6 - CST 1996 -6",
			"-6 Mexico C%sT 1998 -6",
			"-6 - CST 1998_3_5_3 -6",
			"-7 Mexico M%sT 2010 -7",
			"-7 US M%sT"
		],
		"America/Panama": [
			"-5:18:8 - LMT 1890 -5:18:8",
			"-5:19:36 - CMT 1908_3_22 -5:19:36",
			"-5 - EST"
		],
		"America/Pangnirtung": [
			"0 - zzz 1921",
			"-4 NT_YK A%sT 1995_3_2_2 -4",
			"-5 Canada E%sT 1999_9_31_2 -4",
			"-6 Canada C%sT 2000_9_29_2 -5",
			"-5 Canada E%sT"
		],
		"America/Paramaribo": [
			"-3:40:40 - LMT 1911 -3:40:40",
			"-3:40:52 - PMT 1935 -3:40:52",
			"-3:40:36 - PMT 1945_9 -3:40:36",
			"-3:30 - NEGT 1975_10_20 -3:30",
			"-3:30 - SRT 1984_9 -3:30",
			"-3 - SRT"
		],
		"America/Phoenix": [
			"-7:28:18 - LMT 1883_10_18_11_31_42 -7:28:18",
			"-7 US M%sT 1944_0_1_00_1 -6",
			"-7 - MST 1944_3_1_00_1 -7",
			"-7 US M%sT 1944_9_1_00_1 -6",
			"-7 - MST 1967 -7",
			"-7 US M%sT 1968_2_21 -7",
			"-7 - MST"
		],
		"America/Port-au-Prince": [
			"-4:49:20 - LMT 1890 -4:49:20",
			"-4:49 - PPMT 1917_0_24_12 -4:49",
			"-5 Haiti E%sT"
		],
		"America/Port_of_Spain": [
			"-4:6:4 - LMT 1912_2_2 -4:6:4",
			"-4 - AST"
		],
		"America/Porto_Velho": [
			"-4:15:36 - LMT 1914 -4:15:36",
			"-4 Brazil AM%sT 1988_8_12 -4",
			"-4 - AMT"
		],
		"America/Puerto_Rico": [
			"-4:24:25 - LMT 1899_2_28_12 -4:24:25",
			"-4 - AST 1942_4_3 -4",
			"-4 US A%sT 1946 -4",
			"-4 - AST"
		],
		"America/Rainy_River": [
			"-6:18:16 - LMT 1895 -6:18:16",
			"-6 Canada C%sT 1940_8_29 -6",
			"-5 - CDT 1942_1_9_2 -6",
			"-6 Canada C%sT"
		],
		"America/Rankin_Inlet": [
			"0 - zzz 1957",
			"-6 NT_YK C%sT 2000_9_29_2 -5",
			"-5 - EST 2001_3_1_3 -5",
			"-6 Canada C%sT"
		],
		"America/Recife": [
			"-2:19:36 - LMT 1914 -2:19:36",
			"-3 Brazil BR%sT 1990_8_17 -3",
			"-3 - BRT 1999_8_30 -3",
			"-3 Brazil BR%sT 2000_9_15 -2",
			"-3 - BRT 2001_8_13 -3",
			"-3 Brazil BR%sT 2002_9_1 -3",
			"-3 - BRT"
		],
		"America/Regina": [
			"-6:58:36 - LMT 1905_8 -6:58:36",
			"-7 Regina M%sT 1960_3_24_2 -7",
			"-6 - CST"
		],
		"America/Resolute": [
			"0 - zzz 1947_7_31",
			"-6 NT_YK C%sT 2000_9_29_2 -5",
			"-5 - EST 2001_3_1_3 -5",
			"-6 Canada C%sT 2006_9_29_2 -5",
			"-5 - EST 2007_2_11_3 -5",
			"-6 Canada C%sT"
		],
		"America/Rio_Branco": [
			"-4:31:12 - LMT 1914 -4:31:12",
			"-5 Brazil AC%sT 1988_8_12 -5",
			"-5 - ACT 2008_5_24_00 -5",
			"-4 - AMT"
		],
		"America/Santa_Isabel": [
			"-7:39:28 - LMT 1922_0_1_0_20_32 -7:39:28",
			"-7 - MST 1924 -7",
			"-8 - PST 1927_5_10_23 -8",
			"-7 - MST 1930_10_15 -7",
			"-8 - PST 1931_3_1 -8",
			"-7 - PDT 1931_8_30 -7",
			"-8 - PST 1942_3_24 -8",
			"-7 - PWT 1945_7_14_23",
			"-7 - PPT 1945_10_12 -7",
			"-8 - PST 1948_3_5 -8",
			"-7 - PDT 1949_0_14 -7",
			"-8 - PST 1954 -8",
			"-8 CA P%sT 1961 -8",
			"-8 - PST 1976 -8",
			"-8 US P%sT 1996 -8",
			"-8 Mexico P%sT 2001 -8",
			"-8 US P%sT 2002_1_20 -8",
			"-8 Mexico P%sT"
		],
		"America/Santarem": [
			"-3:38:48 - LMT 1914 -3:38:48",
			"-4 Brazil AM%sT 1988_8_12 -4",
			"-4 - AMT 2008_5_24_00 -4",
			"-3 - BRT"
		],
		"America/Santiago": [
			"-4:42:46 - LMT 1890 -4:42:46",
			"-4:42:46 - SMT 1910 -4:42:46",
			"-5 - CLT 1916_6_1 -5",
			"-4:42:46 - SMT 1918_8_1 -4:42:46",
			"-4 - CLT 1919_6_1 -4",
			"-4:42:46 - SMT 1927_8_1 -4:42:46",
			"-5 Chile CL%sT 1947_4_22 -5",
			"-4 Chile CL%sT"
		],
		"America/Santo_Domingo": [
			"-4:39:36 - LMT 1890 -4:39:36",
			"-4:40 - SDMT 1933_3_1_12 -4:40",
			"-5 DR E%sT 1974_9_27 -5",
			"-4 - AST 2000_9_29_02 -4",
			"-5 US E%sT 2000_11_3_01 -5",
			"-4 - AST"
		],
		"America/Sao_Paulo": [
			"-3:6:28 - LMT 1914 -3:6:28",
			"-3 Brazil BR%sT 1963_9_23_00 -3",
			"-2 - BRST 1964 -2",
			"-3 Brazil BR%sT"
		],
		"America/Scoresbysund": [
			"-1:27:52 - LMT 1916_6_28 -1:27:52",
			"-2 - CGT 1980_3_6_2 -2",
			"-2 C-Eur CG%sT 1981_2_29 -2",
			"-1 EU EG%sT"
		],
		"America/Sitka": [
			"14:58:47 - LMT 1867_9_18 14:58:47",
			"-9:1:13 - LMT 1900_7_20_12 -9:1:13",
			"-8 - PST 1942 -8",
			"-8 US P%sT 1946 -8",
			"-8 - PST 1969 -8",
			"-8 US P%sT 1983_9_30_2 -7",
			"-9 US Y%sT 1983_10_30 -9",
			"-9 US AK%sT"
		],
		"America/St_Johns": [
			"-3:30:52 - LMT 1884 -3:30:52",
			"-3:30:52 StJohns N%sT 1918 -3:30:52",
			"-3:30:52 Canada N%sT 1919 -3:30:52",
			"-3:30:52 StJohns N%sT 1935_2_30 -3:30:52",
			"-3:30 StJohns N%sT 1942_4_11 -3:30",
			"-3:30 Canada N%sT 1946 -3:30",
			"-3:30 StJohns N%sT 2011_10 -2:30",
			"-3:30 Canada N%sT"
		],
		"America/St_Kitts": [
			"-4:10:52 - LMT 1912_2_2 -4:10:52",
			"-4 - AST"
		],
		"America/St_Lucia": [
			"-4:4 - LMT 1890 -4:4",
			"-4:4 - CMT 1912 -4:4",
			"-4 - AST"
		],
		"America/St_Thomas": [
			"-4:19:44 - LMT 1911_6 -4:19:44",
			"-4 - AST"
		],
		"America/St_Vincent": [
			"-4:4:56 - LMT 1890 -4:4:56",
			"-4:4:56 - KMT 1912 -4:4:56",
			"-4 - AST"
		],
		"America/Swift_Current": [
			"-7:11:20 - LMT 1905_8 -7:11:20",
			"-7 Canada M%sT 1946_3_28_2 -7",
			"-7 Regina M%sT 1950 -7",
			"-7 Swift M%sT 1972_3_30_2 -7",
			"-6 - CST"
		],
		"America/Tegucigalpa": [
			"-5:48:52 - LMT 1921_3 -5:48:52",
			"-6 Hond C%sT"
		],
		"America/Thule": [
			"-4:35:8 - LMT 1916_6_28 -4:35:8",
			"-4 Thule A%sT"
		],
		"America/Thunder_Bay": [
			"-5:57 - LMT 1895 -5:57",
			"-6 - CST 1910 -6",
			"-5 - EST 1942 -5",
			"-5 Canada E%sT 1970 -5",
			"-5 Mont E%sT 1973 -5",
			"-5 - EST 1974 -5",
			"-5 Canada E%sT"
		],
		"America/Tijuana": [
			"-7:48:4 - LMT 1922_0_1_0_11_56 -7:48:4",
			"-7 - MST 1924 -7",
			"-8 - PST 1927_5_10_23 -8",
			"-7 - MST 1930_10_15 -7",
			"-8 - PST 1931_3_1 -8",
			"-7 - PDT 1931_8_30 -7",
			"-8 - PST 1942_3_24 -8",
			"-7 - PWT 1945_7_14_23",
			"-7 - PPT 1945_10_12 -7",
			"-8 - PST 1948_3_5 -8",
			"-7 - PDT 1949_0_14 -7",
			"-8 - PST 1954 -8",
			"-8 CA P%sT 1961 -8",
			"-8 - PST 1976 -8",
			"-8 US P%sT 1996 -8",
			"-8 Mexico P%sT 2001 -8",
			"-8 US P%sT 2002_1_20 -8",
			"-8 Mexico P%sT 2010 -8",
			"-8 US P%sT"
		],
		"America/Toronto": [
			"-5:17:32 - LMT 1895 -5:17:32",
			"-5 Canada E%sT 1919 -5",
			"-5 Toronto E%sT 1942_1_9_2 -5",
			"-5 Canada E%sT 1946 -5",
			"-5 Toronto E%sT 1974 -5",
			"-5 Canada E%sT"
		],
		"America/Tortola": [
			"-4:18:28 - LMT 1911_6 -4:18:28",
			"-4 - AST"
		],
		"America/Vancouver": [
			"-8:12:28 - LMT 1884 -8:12:28",
			"-8 Vanc P%sT 1987 -8",
			"-8 Canada P%sT"
		],
		"America/Whitehorse": [
			"-9:0:12 - LMT 1900_7_20 -9:0:12",
			"-9 NT_YK Y%sT 1966_6_1_2 -9",
			"-8 NT_YK P%sT 1980 -8",
			"-8 Canada P%sT"
		],
		"America/Winnipeg": [
			"-6:28:36 - LMT 1887_6_16 -6:28:36",
			"-6 Winn C%sT 2006 -6",
			"-6 Canada C%sT"
		],
		"America/Yakutat": [
			"14:41:5 - LMT 1867_9_18 14:41:5",
			"-9:18:55 - LMT 1900_7_20_12 -9:18:55",
			"-9 - YST 1942 -9",
			"-9 US Y%sT 1946 -9",
			"-9 - YST 1969 -9",
			"-9 US Y%sT 1983_10_30 -9",
			"-9 US AK%sT"
		],
		"America/Yellowknife": [
			"0 - zzz 1935",
			"-7 NT_YK M%sT 1980 -7",
			"-7 Canada M%sT"
		],
		"Antarctica/Casey": [
			"0 - zzz 1969",
			"8 - WST 2009_9_18_2 8",
			"11 - CAST 2010_2_5_2 11",
			"8 - WST 2011_9_28_2 8",
			"11 - CAST 2012_1_21_17",
			"8 - WST"
		],
		"Antarctica/Davis": [
			"0 - zzz 1957_0_13",
			"7 - DAVT 1964_10 7",
			"0 - zzz 1969_1",
			"7 - DAVT 2009_9_18_2 7",
			"5 - DAVT 2010_2_10_20",
			"7 - DAVT 2011_9_28_2 7",
			"5 - DAVT 2012_1_21_20",
			"7 - DAVT"
		],
		"Antarctica/DumontDUrville": [
			"0 - zzz 1947",
			"10 - PMT 1952_0_14 10",
			"0 - zzz 1956_10",
			"10 - DDUT"
		],
		"Antarctica/Macquarie": [
			"0 - zzz 1899_10",
			"10 - EST 1916_9_1_2 10",
			"11 - EST 1917_1 11",
			"10 Aus EST 1919_3 10",
			"0 - zzz 1948_2_25",
			"10 Aus EST 1967 10",
			"10 AT EST 2010_3_4_3 11",
			"11 - MIST"
		],
		"Antarctica/Mawson": [
			"0 - zzz 1954_1_13",
			"6 - MAWT 2009_9_18_2 6",
			"5 - MAWT"
		],
		"Antarctica/McMurdo": [
			"0 - zzz 1956",
			"12 NZAQ NZ%sT"
		],
		"Antarctica/Palmer": [
			"0 - zzz 1965",
			"-4 ArgAQ AR%sT 1969_9_5 -4",
			"-3 ArgAQ AR%sT 1982_4 -3",
			"-4 ChileAQ CL%sT"
		],
		"Antarctica/Rothera": [
			"0 - zzz 1976_11_1",
			"-3 - ROTT"
		],
		"Antarctica/Syowa": [
			"0 - zzz 1957_0_29",
			"3 - SYOT"
		],
		"Antarctica/Vostok": [
			"0 - zzz 1957_11_16",
			"6 - VOST"
		],
		"Asia/Aden": [
			"2:59:54 - LMT 1950 2:59:54",
			"3 - AST"
		],
		"Asia/Almaty": [
			"5:7:48 - LMT 1924_4_2 5:7:48",
			"5 - ALMT 1930_5_21 5",
			"6 RussiaAsia ALM%sT 1991 6",
			"6 - ALMT 1992 6",
			"6 RussiaAsia ALM%sT 2005_2_15 6",
			"6 - ALMT"
		],
		"Asia/Amman": [
			"2:23:44 - LMT 1931 2:23:44",
			"2 Jordan EE%sT"
		],
		"Asia/Anadyr": [
			"11:49:56 - LMT 1924_4_2 11:49:56",
			"12 - ANAT 1930_5_21 12",
			"13 Russia ANA%sT 1982_3_1_0 13",
			"12 Russia ANA%sT 1991_2_31_2 12",
			"11 Russia ANA%sT 1992_0_19_2 11",
			"12 Russia ANA%sT 2010_2_28_2 12",
			"11 Russia ANA%sT 2011_2_27_2 11",
			"12 - ANAT"
		],
		"Asia/Aqtau": [
			"3:21:4 - LMT 1924_4_2 3:21:4",
			"4 - FORT 1930_5_21 4",
			"5 - FORT 1963 5",
			"5 - SHET 1981_9_1 5",
			"6 - SHET 1982_3_1 6",
			"5 RussiaAsia SHE%sT 1991 5",
			"5 - SHET 1991_11_16 5",
			"5 RussiaAsia AQT%sT 1995_2_26_2 5",
			"4 RussiaAsia AQT%sT 2005_2_15 4",
			"5 - AQTT"
		],
		"Asia/Aqtobe": [
			"3:48:40 - LMT 1924_4_2 3:48:40",
			"4 - AKTT 1930_5_21 4",
			"5 - AKTT 1981_3_1 5",
			"6 - AKTST 1981_9_1 6",
			"6 - AKTT 1982_3_1 6",
			"5 RussiaAsia AKT%sT 1991 5",
			"5 - AKTT 1991_11_16 5",
			"5 RussiaAsia AQT%sT 2005_2_15 5",
			"5 - AQTT"
		],
		"Asia/Ashgabat": [
			"3:53:32 - LMT 1924_4_2 3:53:32",
			"4 - ASHT 1930_5_21 4",
			"5 RussiaAsia ASH%sT 1991_2_31_2 5",
			"4 RussiaAsia ASH%sT 1991_9_27 4",
			"4 RussiaAsia TM%sT 1992_0_19_2 4",
			"5 - TMT"
		],
		"Asia/Baghdad": [
			"2:57:40 - LMT 1890 2:57:40",
			"2:57:36 - BMT 1918 2:57:36",
			"3 - AST 1982_4 3",
			"3 Iraq A%sT"
		],
		"Asia/Bahrain": [
			"3:22:20 - LMT 1920 3:22:20",
			"4 - GST 1972_5 4",
			"3 - AST"
		],
		"Asia/Baku": [
			"3:19:24 - LMT 1924_4_2 3:19:24",
			"3 - BAKT 1957_2 3",
			"4 RussiaAsia BAK%sT 1991_2_31_2 4",
			"4 - BAKST 1991_7_30 4",
			"3 RussiaAsia AZ%sT 1992_8_26_23 4",
			"4 - AZT 1996 4",
			"4 EUAsia AZ%sT 1997 4",
			"4 Azer AZ%sT"
		],
		"Asia/Bangkok": [
			"6:42:4 - LMT 1880 6:42:4",
			"6:42:4 - BMT 1920_3 6:42:4",
			"7 - ICT"
		],
		"Asia/Beirut": [
			"2:22 - LMT 1880 2:22",
			"2 Lebanon EE%sT"
		],
		"Asia/Bishkek": [
			"4:58:24 - LMT 1924_4_2 4:58:24",
			"5 - FRUT 1930_5_21 5",
			"6 RussiaAsia FRU%sT 1991_2_31_2 6",
			"6 - FRUST 1991_7_31_2 6",
			"5 Kyrgyz KG%sT 2005_7_12 6",
			"6 - KGT"
		],
		"Asia/Brunei": [
			"7:39:40 - LMT 1926_2 7:39:40",
			"7:30 - BNT 1933 7:30",
			"8 - BNT"
		],
		"Asia/Choibalsan": [
			"7:38 - LMT 1905_7 7:38",
			"7 - ULAT 1978 7",
			"8 - ULAT 1983_3 8",
			"9 Mongol CHO%sT 2008_2_31 9",
			"8 Mongol CHO%sT"
		],
		"Asia/Chongqing": [
			"7:6:20 - LMT 1928 7:6:20",
			"7 - LONT 1980_4 7",
			"8 PRC C%sT"
		],
		"Asia/Colombo": [
			"5:19:24 - LMT 1880 5:19:24",
			"5:19:32 - MMT 1906 5:19:32",
			"5:30 - IST 1942_0_5 5:30",
			"6 - IHST 1942_8 6",
			"6:30 - IST 1945_9_16_2 6:30",
			"5:30 - IST 1996_4_25_0 5:30",
			"6:30 - LKT 1996_9_26_0_30 6:30",
			"6 - LKT 2006_3_15_0_30 6",
			"5:30 - IST"
		],
		"Asia/Damascus": [
			"2:25:12 - LMT 1920 2:25:12",
			"2 Syria EE%sT"
		],
		"Asia/Dhaka": [
			"6:1:40 - LMT 1890 6:1:40",
			"5:53:20 - HMT 1941_9 5:53:20",
			"6:30 - BURT 1942_4_15 6:30",
			"5:30 - IST 1942_8 5:30",
			"6:30 - BURT 1951_8_30 6:30",
			"6 - DACT 1971_2_26 6",
			"6 - BDT 2009 6",
			"6 Dhaka BD%sT"
		],
		"Asia/Dili": [
			"8:22:20 - LMT 1912 8:22:20",
			"8 - TLT 1942_1_21_23 8",
			"9 - JST 1945_8_23 9",
			"9 - TLT 1976_4_3 9",
			"8 - CIT 2000_8_17_00 8",
			"9 - TLT"
		],
		"Asia/Dubai": [
			"3:41:12 - LMT 1920 3:41:12",
			"4 - GST"
		],
		"Asia/Dushanbe": [
			"4:35:12 - LMT 1924_4_2 4:35:12",
			"5 - DUST 1930_5_21 5",
			"6 RussiaAsia DUS%sT 1991_2_31_2 6",
			"6 - DUSST 1991_8_9_2 5",
			"5 - TJT"
		],
		"Asia/Gaza": [
			"2:17:52 - LMT 1900_9 2:17:52",
			"2 Zion EET 1948_4_15 2",
			"2 EgyptAsia EE%sT 1967_5_5 3",
			"2 Zion I%sT 1996 2",
			"2 Jordan EE%sT 1999 2",
			"2 Palestine EE%sT 2008_7_29_0 3",
			"2 - EET 2008_8 2",
			"2 Palestine EE%sT 2010 2",
			"2 - EET 2010_2_27_0_1 2",
			"2 Palestine EE%sT 2011_7_1 3",
			"2 - EET 2012 2",
			"2 Palestine EE%sT"
		],
		"Asia/Harbin": [
			"8:26:44 - LMT 1928 8:26:44",
			"8:30 - CHAT 1932_2 8:30",
			"8 - CST 1940 8",
			"9 - CHAT 1966_4 9",
			"8:30 - CHAT 1980_4 8:30",
			"8 PRC C%sT"
		],
		"Asia/Hebron": [
			"2:20:23 - LMT 1900_9 2:20:23",
			"2 Zion EET 1948_4_15 2",
			"2 EgyptAsia EE%sT 1967_5_5 3",
			"2 Zion I%sT 1996 2",
			"2 Jordan EE%sT 1999 2",
			"2 Palestine EE%sT"
		],
		"Asia/Ho_Chi_Minh": [
			"7:6:40 - LMT 1906_5_9 7:6:40",
			"7:6:20 - SMT 1911_2_11_0_1 7:6:20",
			"7 - ICT 1912_4 7",
			"8 - ICT 1931_4 8",
			"7 - ICT"
		],
		"Asia/Hong_Kong": [
			"7:36:42 - LMT 1904_9_30 7:36:42",
			"8 HK HK%sT 1941_11_25 8",
			"9 - JST 1945_8_15 9",
			"8 HK HK%sT"
		],
		"Asia/Hovd": [
			"6:6:36 - LMT 1905_7 6:6:36",
			"6 - HOVT 1978 6",
			"7 Mongol HOV%sT"
		],
		"Asia/Irkutsk": [
			"6:57:20 - LMT 1880 6:57:20",
			"6:57:20 - IMT 1920_0_25 6:57:20",
			"7 - IRKT 1930_5_21 7",
			"8 Russia IRK%sT 1991_2_31_2 8",
			"7 Russia IRK%sT 1992_0_19_2 7",
			"8 Russia IRK%sT 2011_2_27_2 8",
			"9 - IRKT"
		],
		"Asia/Jakarta": [
			"7:7:12 - LMT 1867_7_10 7:7:12",
			"7:7:12 - JMT 1923_11_31_23_47_12 7:7:12",
			"7:20 - JAVT 1932_10 7:20",
			"7:30 - WIT 1942_2_23 7:30",
			"9 - JST 1945_8_23 9",
			"7:30 - WIT 1948_4 7:30",
			"8 - WIT 1950_4 8",
			"7:30 - WIT 1964 7:30",
			"7 - WIT"
		],
		"Asia/Jayapura": [
			"9:22:48 - LMT 1932_10 9:22:48",
			"9 - EIT 1944_8_1 9",
			"9:30 - CST 1964 9:30",
			"9 - EIT"
		],
		"Asia/Jerusalem": [
			"2:20:56 - LMT 1880 2:20:56",
			"2:20:40 - JMT 1918 2:20:40",
			"2 Zion I%sT"
		],
		"Asia/Kabul": [
			"4:36:48 - LMT 1890 4:36:48",
			"4 - AFT 1945 4",
			"4:30 - AFT"
		],
		"Asia/Kamchatka": [
			"10:34:36 - LMT 1922_10_10 10:34:36",
			"11 - PETT 1930_5_21 11",
			"12 Russia PET%sT 1991_2_31_2 12",
			"11 Russia PET%sT 1992_0_19_2 11",
			"12 Russia PET%sT 2010_2_28_2 12",
			"11 Russia PET%sT 2011_2_27_2 11",
			"12 - PETT"
		],
		"Asia/Karachi": [
			"4:28:12 - LMT 1907 4:28:12",
			"5:30 - IST 1942_8 5:30",
			"6:30 - IST 1945_9_15 6:30",
			"5:30 - IST 1951_8_30 5:30",
			"5 - KART 1971_2_26 5",
			"5 Pakistan PK%sT"
		],
		"Asia/Kashgar": [
			"5:3:56 - LMT 1928 5:3:56",
			"5:30 - KAST 1940 5:30",
			"5 - KAST 1980_4 5",
			"8 PRC C%sT"
		],
		"Asia/Kathmandu": [
			"5:41:16 - LMT 1920 5:41:16",
			"5:30 - IST 1986 5:30",
			"5:45 - NPT"
		],
		"Asia/Khandyga": [
			"9:2:13 - LMT 1919_11_15 9:2:13",
			"8 - YAKT 1930_5_21 8",
			"9 Russia YAK%sT 1991_2_31_2 9",
			"8 Russia YAK%sT 1992_0_19_2 8",
			"9 Russia YAK%sT 2004 9",
			"10 Russia VLA%sT 2011_2_27_2 10",
			"11 - VLAT 2011_8_13_0 11",
			"10 - YAKT"
		],
		"Asia/Kolkata": [
			"5:53:28 - LMT 1880 5:53:28",
			"5:53:20 - HMT 1941_9 5:53:20",
			"6:30 - BURT 1942_4_15 6:30",
			"5:30 - IST 1942_8 5:30",
			"6:30 - IST 1945_9_15 6:30",
			"5:30 - IST"
		],
		"Asia/Krasnoyarsk": [
			"6:11:20 - LMT 1920_0_6 6:11:20",
			"6 - KRAT 1930_5_21 6",
			"7 Russia KRA%sT 1991_2_31_2 7",
			"6 Russia KRA%sT 1992_0_19_2 6",
			"7 Russia KRA%sT 2011_2_27_2 7",
			"8 - KRAT"
		],
		"Asia/Kuala_Lumpur": [
			"6:46:46 - LMT 1901_0_1 6:46:46",
			"6:55:25 - SMT 1905_5_1 6:55:25",
			"7 - MALT 1933_0_1 7",
			"7:20 - MALST 1936_0_1 7:20",
			"7:20 - MALT 1941_8_1 7:20",
			"7:30 - MALT 1942_1_16 7:30",
			"9 - JST 1945_8_12 9",
			"7:30 - MALT 1982_0_1 7:30",
			"8 - MYT"
		],
		"Asia/Kuching": [
			"7:21:20 - LMT 1926_2 7:21:20",
			"7:30 - BORT 1933 7:30",
			"8 NBorneo BOR%sT 1942_1_16 8",
			"9 - JST 1945_8_12 9",
			"8 - BORT 1982_0_1 8",
			"8 - MYT"
		],
		"Asia/Kuwait": [
			"3:11:56 - LMT 1950 3:11:56",
			"3 - AST"
		],
		"Asia/Macau": [
			"7:34:20 - LMT 1912 7:34:20",
			"8 Macau MO%sT 1999_11_20 8",
			"8 PRC C%sT"
		],
		"Asia/Magadan": [
			"10:3:12 - LMT 1924_4_2 10:3:12",
			"10 - MAGT 1930_5_21 10",
			"11 Russia MAG%sT 1991_2_31_2 11",
			"10 Russia MAG%sT 1992_0_19_2 10",
			"11 Russia MAG%sT 2011_2_27_2 11",
			"12 - MAGT"
		],
		"Asia/Makassar": [
			"7:57:36 - LMT 1920 7:57:36",
			"7:57:36 - MMT 1932_10 7:57:36",
			"8 - CIT 1942_1_9 8",
			"9 - JST 1945_8_23 9",
			"8 - CIT"
		],
		"Asia/Manila": [
			"-15:56 - LMT 1844_11_31 -15:56",
			"8:4 - LMT 1899_4_11 8:4",
			"8 Phil PH%sT 1942_4 8",
			"9 - JST 1944_10 9",
			"8 Phil PH%sT"
		],
		"Asia/Muscat": [
			"3:54:24 - LMT 1920 3:54:24",
			"4 - GST"
		],
		"Asia/Nicosia": [
			"2:13:28 - LMT 1921_10_14 2:13:28",
			"2 Cyprus EE%sT 1998_8 3",
			"2 EUAsia EE%sT"
		],
		"Asia/Novokuznetsk": [
			"5:48:48 - NMT 1920_0_6 5:48:48",
			"6 - KRAT 1930_5_21 6",
			"7 Russia KRA%sT 1991_2_31_2 7",
			"6 Russia KRA%sT 1992_0_19_2 6",
			"7 Russia KRA%sT 2010_2_28_2 7",
			"6 Russia NOV%sT 2011_2_27_2 6",
			"7 - NOVT"
		],
		"Asia/Novosibirsk": [
			"5:31:40 - LMT 1919_11_14_6 5:31:40",
			"6 - NOVT 1930_5_21 6",
			"7 Russia NOV%sT 1991_2_31_2 7",
			"6 Russia NOV%sT 1992_0_19_2 6",
			"7 Russia NOV%sT 1993_4_23 8",
			"6 Russia NOV%sT 2011_2_27_2 6",
			"7 - NOVT"
		],
		"Asia/Omsk": [
			"4:53:36 - LMT 1919_10_14 4:53:36",
			"5 - OMST 1930_5_21 5",
			"6 Russia OMS%sT 1991_2_31_2 6",
			"5 Russia OMS%sT 1992_0_19_2 5",
			"6 Russia OMS%sT 2011_2_27_2 6",
			"7 - OMST"
		],
		"Asia/Oral": [
			"3:25:24 - LMT 1924_4_2 3:25:24",
			"4 - URAT 1930_5_21 4",
			"5 - URAT 1981_3_1 5",
			"6 - URAST 1981_9_1 6",
			"6 - URAT 1982_3_1 6",
			"5 RussiaAsia URA%sT 1989_2_26_2 5",
			"4 RussiaAsia URA%sT 1991 4",
			"4 - URAT 1991_11_16 4",
			"4 RussiaAsia ORA%sT 2005_2_15 4",
			"5 - ORAT"
		],
		"Asia/Phnom_Penh": [
			"6:59:40 - LMT 1906_5_9 6:59:40",
			"7:6:20 - SMT 1911_2_11_0_1 7:6:20",
			"7 - ICT 1912_4 7",
			"8 - ICT 1931_4 8",
			"7 - ICT"
		],
		"Asia/Pontianak": [
			"7:17:20 - LMT 1908_4 7:17:20",
			"7:17:20 - PMT 1932_10 7:17:20",
			"7:30 - WIT 1942_0_29 7:30",
			"9 - JST 1945_8_23 9",
			"7:30 - WIT 1948_4 7:30",
			"8 - WIT 1950_4 8",
			"7:30 - WIT 1964 7:30",
			"8 - CIT 1988_0_1 8",
			"7 - WIT"
		],
		"Asia/Pyongyang": [
			"8:23 - LMT 1890 8:23",
			"8:30 - KST 1904_11 8:30",
			"9 - KST 1928 9",
			"8:30 - KST 1932 8:30",
			"9 - KST 1954_2_21 9",
			"8 - KST 1961_7_10 8",
			"9 - KST"
		],
		"Asia/Qatar": [
			"3:26:8 - LMT 1920 3:26:8",
			"4 - GST 1972_5 4",
			"3 - AST"
		],
		"Asia/Qyzylorda": [
			"4:21:52 - LMT 1924_4_2 4:21:52",
			"4 - KIZT 1930_5_21 4",
			"5 - KIZT 1981_3_1 5",
			"6 - KIZST 1981_9_1 6",
			"6 - KIZT 1982_3_1 6",
			"5 RussiaAsia KIZ%sT 1991 5",
			"5 - KIZT 1991_11_16 5",
			"5 - QYZT 1992_0_19_2 5",
			"6 RussiaAsia QYZ%sT 2005_2_15 6",
			"6 - QYZT"
		],
		"Asia/Rangoon": [
			"6:24:40 - LMT 1880 6:24:40",
			"6:24:40 - RMT 1920 6:24:40",
			"6:30 - BURT 1942_4 6:30",
			"9 - JST 1945_4_3 9",
			"6:30 - MMT"
		],
		"Asia/Riyadh": [
			"3:6:52 - LMT 1950 3:6:52",
			"3 - AST"
		],
		"Asia/Sakhalin": [
			"9:30:48 - LMT 1905_7_23 9:30:48",
			"9 - CJT 1938 9",
			"9 - JST 1945_7_25 9",
			"11 Russia SAK%sT 1991_2_31_2 11",
			"10 Russia SAK%sT 1992_0_19_2 10",
			"11 Russia SAK%sT 1997_2_30_2 11",
			"10 Russia SAK%sT 2011_2_27_2 10",
			"11 - SAKT"
		],
		"Asia/Samarkand": [
			"4:27:12 - LMT 1924_4_2 4:27:12",
			"4 - SAMT 1930_5_21 4",
			"5 - SAMT 1981_3_1 5",
			"6 - SAMST 1981_9_1 6",
			"6 - TAST 1982_3_1 6",
			"5 RussiaAsia SAM%sT 1991_8_1 6",
			"5 RussiaAsia UZ%sT 1992 5",
			"5 - UZT"
		],
		"Asia/Seoul": [
			"8:27:52 - LMT 1890 8:27:52",
			"8:30 - KST 1904_11 8:30",
			"9 - KST 1928 9",
			"8:30 - KST 1932 8:30",
			"9 - KST 1954_2_21 9",
			"8 ROK K%sT 1961_7_10 8",
			"8:30 - KST 1968_9 8:30",
			"9 ROK K%sT"
		],
		"Asia/Shanghai": [
			"8:5:57 - LMT 1928 8:5:57",
			"8 Shang C%sT 1949 8",
			"8 PRC C%sT"
		],
		"Asia/Singapore": [
			"6:55:25 - LMT 1901_0_1 6:55:25",
			"6:55:25 - SMT 1905_5_1 6:55:25",
			"7 - MALT 1933_0_1 7",
			"7:20 - MALST 1936_0_1 7:20",
			"7:20 - MALT 1941_8_1 7:20",
			"7:30 - MALT 1942_1_16 7:30",
			"9 - JST 1945_8_12 9",
			"7:30 - MALT 1965_7_9 7:30",
			"7:30 - SGT 1982_0_1 7:30",
			"8 - SGT"
		],
		"Asia/Taipei": [
			"8:6 - LMT 1896 8:6",
			"8 Taiwan C%sT"
		],
		"Asia/Tashkent": [
			"4:37:12 - LMT 1924_4_2 4:37:12",
			"5 - TAST 1930_5_21 5",
			"6 RussiaAsia TAS%sT 1991_2_31_2 6",
			"5 RussiaAsia TAS%sT 1991_8_1 6",
			"5 RussiaAsia UZ%sT 1992 5",
			"5 - UZT"
		],
		"Asia/Tbilisi": [
			"2:59:16 - LMT 1880 2:59:16",
			"2:59:16 - TBMT 1924_4_2 2:59:16",
			"3 - TBIT 1957_2 3",
			"4 RussiaAsia TBI%sT 1991_2_31_2 4",
			"4 - TBIST 1991_3_9 4",
			"3 RussiaAsia GE%sT 1992 3",
			"3 E-EurAsia GE%sT 1994_8_25 4",
			"4 E-EurAsia GE%sT 1996_9_27 5",
			"5 - GEST 1997_2_30 5",
			"4 E-EurAsia GE%sT 2004_5_27 5",
			"3 RussiaAsia GE%sT 2005_2_27_2 3",
			"4 - GET"
		],
		"Asia/Tehran": [
			"3:25:44 - LMT 1916 3:25:44",
			"3:25:44 - TMT 1946 3:25:44",
			"3:30 - IRST 1977_10 3:30",
			"4 Iran IR%sT 1979 4",
			"3:30 Iran IR%sT"
		],
		"Asia/Thimphu": [
			"5:58:36 - LMT 1947_7_15 5:58:36",
			"5:30 - IST 1987_9 5:30",
			"6 - BTT"
		],
		"Asia/Tokyo": [
			"9:18:59 - LMT 1887_11_31_15",
			"9 - JST 1896 9",
			"9 - CJT 1938 9",
			"9 Japan J%sT"
		],
		"Asia/Ulaanbaatar": [
			"7:7:32 - LMT 1905_7 7:7:32",
			"7 - ULAT 1978 7",
			"8 Mongol ULA%sT"
		],
		"Asia/Urumqi": [
			"5:50:20 - LMT 1928 5:50:20",
			"6 - URUT 1980_4 6",
			"8 PRC C%sT"
		],
		"Asia/Ust-Nera": [
			"9:32:54 - LMT 1919_11_15 9:32:54",
			"8 - YAKT 1930_5_21 8",
			"9 Russia YAKT 1981_3_1 9",
			"11 Russia MAG%sT 1991_2_31_2 11",
			"10 Russia MAG%sT 1992_0_19_2 10",
			"11 Russia MAG%sT 2011_2_27_2 11",
			"12 - MAGT 2011_8_13_0 12",
			"11 - VLAT"
		],
		"Asia/Vientiane": [
			"6:50:24 - LMT 1906_5_9 6:50:24",
			"7:6:20 - SMT 1911_2_11_0_1 7:6:20",
			"7 - ICT 1912_4 7",
			"8 - ICT 1931_4 8",
			"7 - ICT"
		],
		"Asia/Vladivostok": [
			"8:47:44 - LMT 1922_10_15 8:47:44",
			"9 - VLAT 1930_5_21 9",
			"10 Russia VLA%sT 1991_2_31_2 10",
			"9 Russia VLA%sST 1992_0_19_2 9",
			"10 Russia VLA%sT 2011_2_27_2 10",
			"11 - VLAT"
		],
		"Asia/Yakutsk": [
			"8:38:40 - LMT 1919_11_15 8:38:40",
			"8 - YAKT 1930_5_21 8",
			"9 Russia YAK%sT 1991_2_31_2 9",
			"8 Russia YAK%sT 1992_0_19_2 8",
			"9 Russia YAK%sT 2011_2_27_2 9",
			"10 - YAKT"
		],
		"Asia/Yekaterinburg": [
			"4:2:24 - LMT 1919_6_15_4 4:2:24",
			"4 - SVET 1930_5_21 4",
			"5 Russia SVE%sT 1991_2_31_2 5",
			"4 Russia SVE%sT 1992_0_19_2 4",
			"5 Russia YEK%sT 2011_2_27_2 5",
			"6 - YEKT"
		],
		"Asia/Yerevan": [
			"2:58 - LMT 1924_4_2 2:58",
			"3 - YERT 1957_2 3",
			"4 RussiaAsia YER%sT 1991_2_31_2 4",
			"4 - YERST 1991_8_23 4",
			"3 RussiaAsia AM%sT 1995_8_24_2 3",
			"4 - AMT 1997 4",
			"4 RussiaAsia AM%sT 2012_2_25_2 4",
			"4 - AMT"
		],
		"Atlantic/Azores": [
			"-1:42:40 - LMT 1884 -1:42:40",
			"-1:54:32 - HMT 1911_4_24 -1:54:32",
			"-2 Port AZO%sT 1966_3_3_2 -2",
			"-1 Port AZO%sT 1983_8_25_1 -1",
			"-1 W-Eur AZO%sT 1992_8_27_1 -1",
			"0 EU WE%sT 1993_2_28_1",
			"-1 EU AZO%sT"
		],
		"Atlantic/Bermuda": [
			"-4:19:18 - LMT 1930_0_1_2 -4:19:18",
			"-4 - AST 1974_3_28_2 -4",
			"-4 Bahamas A%sT 1976 -4",
			"-4 US A%sT"
		],
		"Atlantic/Canary": [
			"-1:1:36 - LMT 1922_2 -1:1:36",
			"-1 - CANT 1946_8_30_1 -1",
			"0 - WET 1980_3_6_0",
			"1 - WEST 1980_8_28_0",
			"0 EU WE%sT"
		],
		"Atlantic/Cape_Verde": [
			"-1:34:4 - LMT 1907 -1:34:4",
			"-2 - CVT 1942_8 -2",
			"-1 - CVST 1945_9_15 -1",
			"-2 - CVT 1975_10_25_2 -2",
			"-1 - CVT"
		],
		"Atlantic/Faroe": [
			"-0:27:4 - LMT 1908_0_11 -0:27:4",
			"0 - WET 1981",
			"0 EU WE%sT"
		],
		"Atlantic/Madeira": [
			"-1:7:36 - LMT 1884 -1:7:36",
			"-1:7:36 - FMT 1911_4_24 -1:7:36",
			"-1 Port MAD%sT 1966_3_3_2 -1",
			"0 Port WE%sT 1983_8_25_1",
			"0 EU WE%sT"
		],
		"Atlantic/Reykjavik": [
			"-1:27:24 - LMT 1837 -1:27:24",
			"-1:27:48 - RMT 1908 -1:27:48",
			"-1 Iceland IS%sT 1968_3_7_1 -1",
			"0 - GMT"
		],
		"Atlantic/South_Georgia": [
			"-2:26:8 - LMT 1890 -2:26:8",
			"-2 - GST"
		],
		"Atlantic/St_Helena": [
			"-0:22:48 - LMT 1890 -0:22:48",
			"-0:22:48 - JMT 1951 -0:22:48",
			"0 - GMT"
		],
		"Atlantic/Stanley": [
			"-3:51:24 - LMT 1890 -3:51:24",
			"-3:51:24 - SMT 1912_2_12 -3:51:24",
			"-4 Falk FK%sT 1983_4 -4",
			"-3 Falk FK%sT 1985_8_15 -3",
			"-4 Falk FK%sT 2010_8_5_02 -4",
			"-3 - FKST"
		],
		"Australia/Adelaide": [
			"9:14:20 - LMT 1895_1 9:14:20",
			"9 - CST 1899_4 9",
			"9:30 Aus CST 1971 9:30",
			"9:30 AS CST"
		],
		"Australia/Brisbane": [
			"10:12:8 - LMT 1895 10:12:8",
			"10 Aus EST 1971 10",
			"10 AQ EST"
		],
		"Australia/Broken_Hill": [
			"9:25:48 - LMT 1895_1 9:25:48",
			"10 - EST 1896_7_23 10",
			"9 - CST 1899_4 9",
			"9:30 Aus CST 1971 9:30",
			"9:30 AN CST 2000 10:30",
			"9:30 AS CST"
		],
		"Australia/Currie": [
			"9:35:28 - LMT 1895_8 9:35:28",
			"10 - EST 1916_9_1_2 10",
			"11 - EST 1917_1 11",
			"10 Aus EST 1971_6 10",
			"10 AT EST"
		],
		"Australia/Darwin": [
			"8:43:20 - LMT 1895_1 8:43:20",
			"9 - CST 1899_4 9",
			"9:30 Aus CST"
		],
		"Australia/Eucla": [
			"8:35:28 - LMT 1895_11 8:35:28",
			"8:45 Aus CWST 1943_6 8:45",
			"8:45 AW CWST"
		],
		"Australia/Hobart": [
			"9:49:16 - LMT 1895_8 9:49:16",
			"10 - EST 1916_9_1_2 10",
			"11 - EST 1917_1 11",
			"10 Aus EST 1967 10",
			"10 AT EST"
		],
		"Australia/Lindeman": [
			"9:55:56 - LMT 1895 9:55:56",
			"10 Aus EST 1971 10",
			"10 AQ EST 1992_6 10",
			"10 Holiday EST"
		],
		"Australia/Lord_Howe": [
			"10:36:20 - LMT 1895_1 10:36:20",
			"10 - EST 1981_2 10",
			"10:30 LH LHST"
		],
		"Australia/Melbourne": [
			"9:39:52 - LMT 1895_1 9:39:52",
			"10 Aus EST 1971 10",
			"10 AV EST"
		],
		"Australia/Perth": [
			"7:43:24 - LMT 1895_11 7:43:24",
			"8 Aus WST 1943_6 8",
			"8 AW WST"
		],
		"Australia/Sydney": [
			"10:4:52 - LMT 1895_1 10:4:52",
			"10 Aus EST 1971 10",
			"10 AN EST"
		],
		"CET": [
			"1 C-Eur CE%sT"
		],
		"CST6CDT": [
			"-6 US C%sT"
		],
		"EET": [
			"2 EU EE%sT"
		],
		"EST": [
			"-5 - EST"
		],
		"EST5EDT": [
			"-5 US E%sT"
		],
		"Etc/GMT": [
			"0 - GMT"
		],
		"Etc/GMT+1": [
			"-1 - GMT+1"
		],
		"Etc/GMT+10": [
			"-10 - GMT+10"
		],
		"Etc/GMT+11": [
			"-11 - GMT+11"
		],
		"Etc/GMT+12": [
			"-12 - GMT+12"
		],
		"Etc/GMT+2": [
			"-2 - GMT+2"
		],
		"Etc/GMT+3": [
			"-3 - GMT+3"
		],
		"Etc/GMT+4": [
			"-4 - GMT+4"
		],
		"Etc/GMT+5": [
			"-5 - GMT+5"
		],
		"Etc/GMT+6": [
			"-6 - GMT+6"
		],
		"Etc/GMT+7": [
			"-7 - GMT+7"
		],
		"Etc/GMT+8": [
			"-8 - GMT+8"
		],
		"Etc/GMT+9": [
			"-9 - GMT+9"
		],
		"Etc/GMT-1": [
			"1 - GMT-1"
		],
		"Etc/GMT-10": [
			"10 - GMT-10"
		],
		"Etc/GMT-11": [
			"11 - GMT-11"
		],
		"Etc/GMT-12": [
			"12 - GMT-12"
		],
		"Etc/GMT-13": [
			"13 - GMT-13"
		],
		"Etc/GMT-14": [
			"14 - GMT-14"
		],
		"Etc/GMT-2": [
			"2 - GMT-2"
		],
		"Etc/GMT-3": [
			"3 - GMT-3"
		],
		"Etc/GMT-4": [
			"4 - GMT-4"
		],
		"Etc/GMT-5": [
			"5 - GMT-5"
		],
		"Etc/GMT-6": [
			"6 - GMT-6"
		],
		"Etc/GMT-7": [
			"7 - GMT-7"
		],
		"Etc/GMT-8": [
			"8 - GMT-8"
		],
		"Etc/GMT-9": [
			"9 - GMT-9"
		],
		"Etc/UCT": [
			"0 - UCT"
		],
		"Etc/UTC": [
			"0 - UTC"
		],
		"Europe/Amsterdam": [
			"0:19:32 - LMT 1835 0:19:32",
			"0:19:32 Neth %s 1937_6_1 1:19:32",
			"0:20 Neth NE%sT 1940_4_16_0 0:20",
			"1 C-Eur CE%sT 1945_3_2_2 1",
			"1 Neth CE%sT 1977 1",
			"1 EU CE%sT"
		],
		"Europe/Andorra": [
			"0:6:4 - LMT 1901 0:6:4",
			"0 - WET 1946_8_30",
			"1 - CET 1985_2_31_2 1",
			"1 EU CE%sT"
		],
		"Europe/Athens": [
			"1:34:52 - LMT 1895_8_14 1:34:52",
			"1:34:52 - AMT 1916_6_28_0_1 1:34:52",
			"2 Greece EE%sT 1941_3_30 3",
			"1 Greece CE%sT 1944_3_4 1",
			"2 Greece EE%sT 1981 2",
			"2 EU EE%sT"
		],
		"Europe/Belgrade": [
			"1:22 - LMT 1884 1:22",
			"1 - CET 1941_3_18_23 1",
			"1 C-Eur CE%sT 1945 1",
			"1 - CET 1945_4_8_2 1",
			"2 - CEST 1945_8_16_2 1",
			"1 - CET 1982_10_27 1",
			"1 EU CE%sT"
		],
		"Europe/Berlin": [
			"0:53:28 - LMT 1893_3 0:53:28",
			"1 C-Eur CE%sT 1945_4_24_2 2",
			"1 SovietZone CE%sT 1946 1",
			"1 Germany CE%sT 1980 1",
			"1 EU CE%sT"
		],
		"Europe/Brussels": [
			"0:17:30 - LMT 1880 0:17:30",
			"0:17:30 - BMT 1892_4_1_12 0:17:30",
			"0 - WET 1914_10_8",
			"1 - CET 1916_4_1_0 1",
			"1 C-Eur CE%sT 1918_10_11_11",
			"0 Belgium WE%sT 1940_4_20_2",
			"1 C-Eur CE%sT 1944_8_3 2",
			"1 Belgium CE%sT 1977 1",
			"1 EU CE%sT"
		],
		"Europe/Bucharest": [
			"1:44:24 - LMT 1891_9 1:44:24",
			"1:44:24 - BMT 1931_6_24 1:44:24",
			"2 Romania EE%sT 1981_2_29_2 2",
			"2 C-Eur EE%sT 1991 2",
			"2 Romania EE%sT 1994 2",
			"2 E-Eur EE%sT 1997 2",
			"2 EU EE%sT"
		],
		"Europe/Budapest": [
			"1:16:20 - LMT 1890_9 1:16:20",
			"1 C-Eur CE%sT 1918 1",
			"1 Hungary CE%sT 1941_3_6_2 1",
			"1 C-Eur CE%sT 1945 1",
			"1 Hungary CE%sT 1980_8_28_2 1",
			"1 EU CE%sT"
		],
		"Europe/Chisinau": [
			"1:55:20 - LMT 1880 1:55:20",
			"1:55 - CMT 1918_1_15 1:55",
			"1:44:24 - BMT 1931_6_24 1:44:24",
			"2 Romania EE%sT 1940_7_15 2",
			"3 - EEST 1941_6_17 3",
			"1 C-Eur CE%sT 1944_7_24 2",
			"3 Russia MSK/MSD 1990 3",
			"3 - MSK 1990_4_6 3",
			"2 - EET 1991 2",
			"2 Russia EE%sT 1992 2",
			"2 E-Eur EE%sT 1997 2",
			"2 EU EE%sT"
		],
		"Europe/Copenhagen": [
			"0:50:20 - LMT 1890 0:50:20",
			"0:50:20 - CMT 1894_0_1 0:50:20",
			"1 Denmark CE%sT 1942_10_2_2 1",
			"1 C-Eur CE%sT 1945_3_2_2 1",
			"1 Denmark CE%sT 1980 1",
			"1 EU CE%sT"
		],
		"Europe/Dublin": [
			"-0:25 - LMT 1880_7_2 -0:25",
			"-0:25:21 - DMT 1916_4_21_2 -0:25:21",
			"0:34:39 - IST 1916_9_1_2 -0:25:21",
			"0 GB-Eire %s 1921_11_6",
			"0 GB-Eire GMT/IST 1940_1_25_2",
			"1 - IST 1946_9_6_2 1",
			"0 - GMT 1947_2_16_2",
			"1 - IST 1947_10_2_2 1",
			"0 - GMT 1948_3_18_2",
			"0 GB-Eire GMT/IST 1968_9_27 1",
			"1 - IST 1971_9_31_2",
			"0 GB-Eire GMT/IST 1996",
			"0 EU GMT/IST"
		],
		"Europe/Gibraltar": [
			"-0:21:24 - LMT 1880_7_2_0 -0:21:24",
			"0 GB-Eire %s 1957_3_14_2",
			"1 - CET 1982 1",
			"1 EU CE%sT"
		],
		"Europe/Helsinki": [
			"1:39:52 - LMT 1878_4_31 1:39:52",
			"1:39:52 - HMT 1921_4 1:39:52",
			"2 Finland EE%sT 1983 2",
			"2 EU EE%sT"
		],
		"Europe/Istanbul": [
			"1:55:52 - LMT 1880 1:55:52",
			"1:56:56 - IMT 1910_9 1:56:56",
			"2 Turkey EE%sT 1978_9_15 3",
			"3 Turkey TR%sT 1985_3_20 3",
			"2 Turkey EE%sT 2007 2",
			"2 EU EE%sT 2011_2_27_1",
			"2 - EET 2011_2_28_1",
			"2 EU EE%sT"
		],
		"Europe/Kaliningrad": [
			"1:22 - LMT 1893_3 1:22",
			"1 C-Eur CE%sT 1945 1",
			"2 Poland CE%sT 1946 2",
			"3 Russia MSK/MSD 1991_2_31_2 3",
			"2 Russia EE%sT 2011_2_27_2 2",
			"3 - FET"
		],
		"Europe/Kiev": [
			"2:2:4 - LMT 1880 2:2:4",
			"2:2:4 - KMT 1924_4_2 2:2:4",
			"2 - EET 1930_5_21 2",
			"3 - MSK 1941_8_20 3",
			"1 C-Eur CE%sT 1943_10_6 1",
			"3 Russia MSK/MSD 1990 3",
			"3 - MSK 1990_6_1_2 3",
			"2 - EET 1992 2",
			"2 E-Eur EE%sT 1995 2",
			"2 EU EE%sT"
		],
		"Europe/Lisbon": [
			"-0:36:32 - LMT 1884 -0:36:32",
			"-0:36:32 - LMT 1912_0_1 -0:36:32",
			"0 Port WE%sT 1966_3_3_2",
			"1 - CET 1976_8_26_1 1",
			"0 Port WE%sT 1983_8_25_1",
			"0 W-Eur WE%sT 1992_8_27_1",
			"1 EU CE%sT 1996_2_31_1",
			"0 EU WE%sT"
		],
		"Europe/London": [
			"-0:1:15 - LMT 1847_11_1_0 -0:1:15",
			"0 GB-Eire %s 1968_9_27 1",
			"1 - BST 1971_9_31_2",
			"0 GB-Eire %s 1996",
			"0 EU GMT/BST"
		],
		"Europe/Luxembourg": [
			"0:24:36 - LMT 1904_5 0:24:36",
			"1 Lux CE%sT 1918_10_25 1",
			"0 Lux WE%sT 1929_9_6_2",
			"0 Belgium WE%sT 1940_4_14_3 1",
			"1 C-Eur WE%sT 1944_8_18_3 2",
			"1 Belgium CE%sT 1977 1",
			"1 EU CE%sT"
		],
		"Europe/Madrid": [
			"-0:14:44 - LMT 1901_0_1_0 -0:14:44",
			"0 Spain WE%sT 1946_8_30 2",
			"1 Spain CE%sT 1979 1",
			"1 EU CE%sT"
		],
		"Europe/Malta": [
			"0:58:4 - LMT 1893_10_2_0 0:58:4",
			"1 Italy CE%sT 1942_10_2_2 1",
			"1 C-Eur CE%sT 1945_3_2_2 1",
			"1 Italy CE%sT 1973_2_31 1",
			"1 Malta CE%sT 1981 1",
			"1 EU CE%sT"
		],
		"Europe/Minsk": [
			"1:50:16 - LMT 1880 1:50:16",
			"1:50 - MMT 1924_4_2 1:50",
			"2 - EET 1930_5_21 2",
			"3 - MSK 1941_5_28 3",
			"1 C-Eur CE%sT 1944_6_3 2",
			"3 Russia MSK/MSD 1990 3",
			"3 - MSK 1991_2_31_2 3",
			"3 - EEST 1991_8_29_2 2",
			"2 - EET 1992_2_29_0 2",
			"3 - EEST 1992_8_27_0 2",
			"2 Russia EE%sT 2011_2_27_2 2",
			"3 - FET"
		],
		"Europe/Monaco": [
			"0:29:32 - LMT 1891_2_15 0:29:32",
			"0:9:21 - PMT 1911_2_11 0:9:21",
			"0 France WE%sT 1945_8_16_3 2",
			"1 France CE%sT 1977 1",
			"1 EU CE%sT"
		],
		"Europe/Moscow": [
			"2:30:20 - LMT 1880 2:30:20",
			"2:30 - MMT 1916_6_3 2:30",
			"2:30:48 Russia %s 1919_6_1_2 4:30:48",
			"3 Russia MSK/MSD 1922_9 3",
			"2 - EET 1930_5_21 2",
			"3 Russia MSK/MSD 1991_2_31_2 3",
			"2 Russia EE%sT 1992_0_19_2 2",
			"3 Russia MSK/MSD 2011_2_27_2 3",
			"4 - MSK"
		],
		"Europe/Oslo": [
			"0:43 - LMT 1895_0_1 0:43",
			"1 Norway CE%sT 1940_7_10_23 1",
			"1 C-Eur CE%sT 1945_3_2_2 1",
			"1 Norway CE%sT 1980 1",
			"1 EU CE%sT"
		],
		"Europe/Paris": [
			"0:9:21 - LMT 1891_2_15_0_1 0:9:21",
			"0:9:21 - PMT 1911_2_11_0_1 0:9:21",
			"0 France WE%sT 1940_5_14_23 1",
			"1 C-Eur CE%sT 1944_7_25 2",
			"0 France WE%sT 1945_8_16_3 2",
			"1 France CE%sT 1977 1",
			"1 EU CE%sT"
		],
		"Europe/Prague": [
			"0:57:44 - LMT 1850 0:57:44",
			"0:57:44 - PMT 1891_9 0:57:44",
			"1 C-Eur CE%sT 1944_8_17_2 1",
			"1 Czech CE%sT 1979 1",
			"1 EU CE%sT"
		],
		"Europe/Riga": [
			"1:36:24 - LMT 1880 1:36:24",
			"1:36:24 - RMT 1918_3_15_2 1:36:24",
			"2:36:24 - LST 1918_8_16_3 2:36:24",
			"1:36:24 - RMT 1919_3_1_2 1:36:24",
			"2:36:24 - LST 1919_4_22_3 2:36:24",
			"1:36:24 - RMT 1926_4_11 1:36:24",
			"2 - EET 1940_7_5 2",
			"3 - MSK 1941_6 3",
			"1 C-Eur CE%sT 1944_9_13 1",
			"3 Russia MSK/MSD 1989_2_26_2 3",
			"3 - EEST 1989_8_24_2 2",
			"2 Latvia EE%sT 1997_0_21 2",
			"2 EU EE%sT 2000_1_29 2",
			"2 - EET 2001_0_2 2",
			"2 EU EE%sT"
		],
		"Europe/Rome": [
			"0:49:56 - LMT 1866_8_22 0:49:56",
			"0:49:56 - RMT 1893_10_1_0 0:49:56",
			"1 Italy CE%sT 1942_10_2_2 1",
			"1 C-Eur CE%sT 1944_6 2",
			"1 Italy CE%sT 1980 1",
			"1 EU CE%sT"
		],
		"Europe/Samara": [
			"3:20:36 - LMT 1919_6_1_2 3:20:36",
			"3 - SAMT 1930_5_21 3",
			"4 - SAMT 1935_0_27 4",
			"4 Russia KUY%sT 1989_2_26_2 4",
			"3 Russia KUY%sT 1991_2_31_2 3",
			"2 Russia KUY%sT 1991_8_29_2 2",
			"3 - KUYT 1991_9_20_3 3",
			"4 Russia SAM%sT 2010_2_28_2 4",
			"3 Russia SAM%sT 2011_2_27_2 3",
			"4 - SAMT"
		],
		"Europe/Simferopol": [
			"2:16:24 - LMT 1880 2:16:24",
			"2:16 - SMT 1924_4_2 2:16",
			"2 - EET 1930_5_21 2",
			"3 - MSK 1941_10 3",
			"1 C-Eur CE%sT 1944_3_13 2",
			"3 Russia MSK/MSD 1990 3",
			"3 - MSK 1990_6_1_2 3",
			"2 - EET 1992 2",
			"2 E-Eur EE%sT 1994_4 3",
			"3 E-Eur MSK/MSD 1996_2_31_3 3",
			"4 - MSD 1996_9_27_3 3",
			"3 Russia MSK/MSD 1997 3",
			"3 - MSK 1997_2_30_1",
			"2 EU EE%sT"
		],
		"Europe/Sofia": [
			"1:33:16 - LMT 1880 1:33:16",
			"1:56:56 - IMT 1894_10_30 1:56:56",
			"2 - EET 1942_10_2_3 2",
			"1 C-Eur CE%sT 1945 1",
			"1 - CET 1945_3_2_3 1",
			"2 - EET 1979_2_31_23 2",
			"2 Bulg EE%sT 1982_8_26_2 3",
			"2 C-Eur EE%sT 1991 2",
			"2 E-Eur EE%sT 1997 2",
			"2 EU EE%sT"
		],
		"Europe/Stockholm": [
			"1:12:12 - LMT 1879_0_1 1:12:12",
			"1:0:14 - SET 1900_0_1 1:0:14",
			"1 - CET 1916_4_14_23 1",
			"2 - CEST 1916_9_1_01 2",
			"1 - CET 1980 1",
			"1 EU CE%sT"
		],
		"Europe/Tallinn": [
			"1:39 - LMT 1880 1:39",
			"1:39 - TMT 1918_1 1:39",
			"1 C-Eur CE%sT 1919_6 1",
			"1:39 - TMT 1921_4 1:39",
			"2 - EET 1940_7_6 2",
			"3 - MSK 1941_8_15 3",
			"1 C-Eur CE%sT 1944_8_22 2",
			"3 Russia MSK/MSD 1989_2_26_2 3",
			"3 - EEST 1989_8_24_2 2",
			"2 C-Eur EE%sT 1998_8_22 3",
			"2 EU EE%sT 1999_10_1 3",
			"2 - EET 2002_1_21 2",
			"2 EU EE%sT"
		],
		"Europe/Tirane": [
			"1:19:20 - LMT 1914 1:19:20",
			"1 - CET 1940_5_16 1",
			"1 Albania CE%sT 1984_6 2",
			"1 EU CE%sT"
		],
		"Europe/Uzhgorod": [
			"1:29:12 - LMT 1890_9 1:29:12",
			"1 - CET 1940 1",
			"1 C-Eur CE%sT 1944_9 2",
			"2 - CEST 1944_9_26 2",
			"1 - CET 1945_5_29 1",
			"3 Russia MSK/MSD 1990 3",
			"3 - MSK 1990_6_1_2 3",
			"1 - CET 1991_2_31_3 1",
			"2 - EET 1992 2",
			"2 E-Eur EE%sT 1995 2",
			"2 EU EE%sT"
		],
		"Europe/Vaduz": [
			"0:38:4 - LMT 1894_5 0:38:4",
			"1 - CET 1981 1",
			"1 EU CE%sT"
		],
		"Europe/Vienna": [
			"1:5:21 - LMT 1893_3 1:5:21",
			"1 C-Eur CE%sT 1920 1",
			"1 Austria CE%sT 1940_3_1_2 1",
			"1 C-Eur CE%sT 1945_3_2_2 1",
			"2 - CEST 1945_3_12_2 1",
			"1 - CET 1946 1",
			"1 Austria CE%sT 1981 1",
			"1 EU CE%sT"
		],
		"Europe/Vilnius": [
			"1:41:16 - LMT 1880 1:41:16",
			"1:24 - WMT 1917 1:24",
			"1:35:36 - KMT 1919_9_10 1:35:36",
			"1 - CET 1920_6_12 1",
			"2 - EET 1920_9_9 2",
			"1 - CET 1940_7_3 1",
			"3 - MSK 1941_5_24 3",
			"1 C-Eur CE%sT 1944_7 2",
			"3 Russia MSK/MSD 1991_2_31_2 3",
			"3 - EEST 1991_8_29_2 2",
			"2 C-Eur EE%sT 1998 2",
			"2 - EET 1998_2_29_1",
			"1 EU CE%sT 1999_9_31_1",
			"2 - EET 2003_0_1 2",
			"2 EU EE%sT"
		],
		"Europe/Volgograd": [
			"2:57:40 - LMT 1920_0_3 2:57:40",
			"3 - TSAT 1925_3_6 3",
			"3 - STAT 1930_5_21 3",
			"4 - STAT 1961_10_11 4",
			"4 Russia VOL%sT 1989_2_26_2 4",
			"3 Russia VOL%sT 1991_2_31_2 3",
			"4 - VOLT 1992_2_29_2 4",
			"3 Russia VOL%sT 2011_2_27_2 3",
			"4 - VOLT"
		],
		"Europe/Warsaw": [
			"1:24 - LMT 1880 1:24",
			"1:24 - WMT 1915_7_5 1:24",
			"1 C-Eur CE%sT 1918_8_16_3 2",
			"2 Poland EE%sT 1922_5 2",
			"1 Poland CE%sT 1940_5_23_2 1",
			"1 C-Eur CE%sT 1944_9 2",
			"1 Poland CE%sT 1977 1",
			"1 W-Eur CE%sT 1988 1",
			"1 EU CE%sT"
		],
		"Europe/Zaporozhye": [
			"2:20:40 - LMT 1880 2:20:40",
			"2:20 - CUT 1924_4_2 2:20",
			"2 - EET 1930_5_21 2",
			"3 - MSK 1941_7_25 3",
			"1 C-Eur CE%sT 1943_9_25 1",
			"3 Russia MSK/MSD 1991_2_31_2 3",
			"2 E-Eur EE%sT 1995 2",
			"2 EU EE%sT"
		],
		"Europe/Zurich": [
			"0:34:8 - LMT 1848_8_12 0:34:8",
			"0:29:44 - BMT 1894_5 0:29:44",
			"1 Swiss CE%sT 1981 1",
			"1 EU CE%sT"
		],
		"HST": [
			"-10 - HST"
		],
		"Indian/Antananarivo": [
			"3:10:4 - LMT 1911_6 3:10:4",
			"3 - EAT 1954_1_27_23 3",
			"4 - EAST 1954_4_29_23 3",
			"3 - EAT"
		],
		"Indian/Chagos": [
			"4:49:40 - LMT 1907 4:49:40",
			"5 - IOT 1996 5",
			"6 - IOT"
		],
		"Indian/Christmas": [
			"7:2:52 - LMT 1895_1 7:2:52",
			"7 - CXT"
		],
		"Indian/Cocos": [
			"6:27:40 - LMT 1900 6:27:40",
			"6:30 - CCT"
		],
		"Indian/Comoro": [
			"2:53:4 - LMT 1911_6 2:53:4",
			"3 - EAT"
		],
		"Indian/Kerguelen": [
			"0 - zzz 1950",
			"5 - TFT"
		],
		"Indian/Mahe": [
			"3:41:48 - LMT 1906_5 3:41:48",
			"4 - SCT"
		],
		"Indian/Maldives": [
			"4:54 - LMT 1880 4:54",
			"4:54 - MMT 1960 4:54",
			"5 - MVT"
		],
		"Indian/Mauritius": [
			"3:50 - LMT 1907 3:50",
			"4 Mauritius MU%sT"
		],
		"Indian/Mayotte": [
			"3:0:56 - LMT 1911_6 3:0:56",
			"3 - EAT"
		],
		"Indian/Reunion": [
			"3:41:52 - LMT 1911_5 3:41:52",
			"4 - RET"
		],
		"MET": [
			"1 C-Eur ME%sT"
		],
		"MST": [
			"-7 - MST"
		],
		"MST7MDT": [
			"-7 US M%sT"
		],
		"PST8PDT": [
			"-8 US P%sT"
		],
		"Pacific/Apia": [
			"12:33:4 - LMT 1879_6_5 12:33:4",
			"-11:26:56 - LMT 1911 -11:26:56",
			"-11:30 - SAMT 1950 -11:30",
			"-11 - WST 2010_8_26 -11",
			"-10 - WSDT 2011_3_2_4 -10",
			"-11 - WST 2011_8_24_3 -11",
			"-10 - WSDT 2011_11_30 -10",
			"14 - WSDT 2012_3_1_4 14",
			"13 WS WS%sT"
		],
		"Pacific/Auckland": [
			"11:39:4 - LMT 1868_10_2 11:39:4",
			"11:30 NZ NZ%sT 1946_0_1 12",
			"12 NZ NZ%sT"
		],
		"Pacific/Chatham": [
			"12:13:48 - LMT 1957_0_1 12:13:48",
			"12:45 Chatham CHA%sT"
		],
		"Pacific/Chuuk": [
			"10:7:8 - LMT 1901 10:7:8",
			"10 - CHUT"
		],
		"Pacific/Easter": [
			"-7:17:44 - LMT 1890 -7:17:44",
			"-7:17:28 - EMT 1932_8 -7:17:28",
			"-7 Chile EAS%sT 1982_2_13_21 -6",
			"-6 Chile EAS%sT"
		],
		"Pacific/Efate": [
			"11:13:16 - LMT 1912_0_13 11:13:16",
			"11 Vanuatu VU%sT"
		],
		"Pacific/Enderbury": [
			"-11:24:20 - LMT 1901 -11:24:20",
			"-12 - PHOT 1979_9 -12",
			"-11 - PHOT 1995 -11",
			"13 - PHOT"
		],
		"Pacific/Fakaofo": [
			"-11:24:56 - LMT 1901 -11:24:56",
			"-11 - TKT 2011_11_30 -11",
			"13 - TKT"
		],
		"Pacific/Fiji": [
			"11:55:44 - LMT 1915_9_26 11:55:44",
			"12 Fiji FJ%sT"
		],
		"Pacific/Funafuti": [
			"11:56:52 - LMT 1901 11:56:52",
			"12 - TVT"
		],
		"Pacific/Galapagos": [
			"-5:58:24 - LMT 1931 -5:58:24",
			"-5 - ECT 1986 -5",
			"-6 - GALT"
		],
		"Pacific/Gambier": [
			"-8:59:48 - LMT 1912_9 -8:59:48",
			"-9 - GAMT"
		],
		"Pacific/Guadalcanal": [
			"10:39:48 - LMT 1912_9 10:39:48",
			"11 - SBT"
		],
		"Pacific/Guam": [
			"-14:21 - LMT 1844_11_31 -14:21",
			"9:39 - LMT 1901 9:39",
			"10 - GST 2000_11_23 10",
			"10 - ChST"
		],
		"Pacific/Honolulu": [
			"-10:31:26 - LMT 1896_0_13_12 -10:31:26",
			"-10:30 - HST 1933_3_30_2 -10:30",
			"-9:30 - HDT 1933_4_21_12 -9:30",
			"-10:30 - HST 1942_1_09_2 -10:30",
			"-9:30 - HDT 1945_8_30_2 -9:30",
			"-10:30 - HST 1947_5_8_2 -10:30",
			"-10 - HST"
		],
		"Pacific/Johnston": [
			"-10 - HST"
		],
		"Pacific/Kiritimati": [
			"-10:29:20 - LMT 1901 -10:29:20",
			"-10:40 - LINT 1979_9 -10:40",
			"-10 - LINT 1995 -10",
			"14 - LINT"
		],
		"Pacific/Kosrae": [
			"10:51:56 - LMT 1901 10:51:56",
			"11 - KOST 1969_9 11",
			"12 - KOST 1999 12",
			"11 - KOST"
		],
		"Pacific/Kwajalein": [
			"11:9:20 - LMT 1901 11:9:20",
			"11 - MHT 1969_9 11",
			"-12 - KWAT 1993_7_20 -12",
			"12 - MHT"
		],
		"Pacific/Majuro": [
			"11:24:48 - LMT 1901 11:24:48",
			"11 - MHT 1969_9 11",
			"12 - MHT"
		],
		"Pacific/Marquesas": [
			"-9:18 - LMT 1912_9 -9:18",
			"-9:30 - MART"
		],
		"Pacific/Midway": [
			"-11:49:28 - LMT 1901 -11:49:28",
			"-11 - NST 1956_5_3 -11",
			"-10 - NDT 1956_8_2 -10",
			"-11 - NST 1967_3 -11",
			"-11 - BST 1983_10_30 -11",
			"-11 - SST"
		],
		"Pacific/Nauru": [
			"11:7:40 - LMT 1921_0_15 11:7:40",
			"11:30 - NRT 1942_2_15 11:30",
			"9 - JST 1944_7_15 9",
			"11:30 - NRT 1979_4 11:30",
			"12 - NRT"
		],
		"Pacific/Niue": [
			"-11:19:40 - LMT 1901 -11:19:40",
			"-11:20 - NUT 1951 -11:20",
			"-11:30 - NUT 1978_9_1 -11:30",
			"-11 - NUT"
		],
		"Pacific/Norfolk": [
			"11:11:52 - LMT 1901 11:11:52",
			"11:12 - NMT 1951 11:12",
			"11:30 - NFT"
		],
		"Pacific/Noumea": [
			"11:5:48 - LMT 1912_0_13 11:5:48",
			"11 NC NC%sT"
		],
		"Pacific/Pago_Pago": [
			"12:37:12 - LMT 1879_6_5 12:37:12",
			"-11:22:48 - LMT 1911 -11:22:48",
			"-11:30 - SAMT 1950 -11:30",
			"-11 - NST 1967_3 -11",
			"-11 - BST 1983_10_30 -11",
			"-11 - SST"
		],
		"Pacific/Palau": [
			"8:57:56 - LMT 1901 8:57:56",
			"9 - PWT"
		],
		"Pacific/Pitcairn": [
			"-8:40:20 - LMT 1901 -8:40:20",
			"-8:30 - PNT 1998_3_27_00 -8:30",
			"-8 - PST"
		],
		"Pacific/Pohnpei": [
			"10:32:52 - LMT 1901 10:32:52",
			"11 - PONT"
		],
		"Pacific/Port_Moresby": [
			"9:48:40 - LMT 1880 9:48:40",
			"9:48:32 - PMMT 1895 9:48:32",
			"10 - PGT"
		],
		"Pacific/Rarotonga": [
			"-10:39:4 - LMT 1901 -10:39:4",
			"-10:30 - CKT 1978_10_12 -10:30",
			"-10 Cook CK%sT"
		],
		"Pacific/Saipan": [
			"-14:17 - LMT 1844_11_31 -14:17",
			"9:43 - LMT 1901 9:43",
			"9 - MPT 1969_9 9",
			"10 - MPT 2000_11_23 10",
			"10 - ChST"
		],
		"Pacific/Tahiti": [
			"-9:58:16 - LMT 1912_9 -9:58:16",
			"-10 - TAHT"
		],
		"Pacific/Tarawa": [
			"11:32:4 - LMT 1901 11:32:4",
			"12 - GILT"
		],
		"Pacific/Tongatapu": [
			"12:19:20 - LMT 1901 12:19:20",
			"12:20 - TOT 1941 12:20",
			"13 - TOT 1999 13",
			"13 Tonga TO%sT"
		],
		"Pacific/Wake": [
			"11:6:28 - LMT 1901 11:6:28",
			"12 - WAKT"
		],
		"Pacific/Wallis": [
			"12:15:20 - LMT 1901 12:15:20",
			"12 - WFT"
		],
		"WET": [
			"0 EU WE%sT"
		]
	}
}
},{}],39:[function(require,module,exports){
// moment-timezone.js
// version : 0.0.6
// author : Tim Wood
// license : MIT
// github.com/timrwood/moment-timezone

(function () {

	var VERSION = "0.0.6";

	function onload(moment) {
		var oldZoneName = moment.fn.zoneName,
			oldZoneAbbr = moment.fn.zoneAbbr,

			defaultRule,
			rules = {},
			ruleSets = {},
			zones = {},
			zoneSets = {},
			links = {},

			TIME_RULE_WALL_CLOCK = 0,
			TIME_RULE_UTC        = 1,
			TIME_RULE_STANDARD   = 2,

			DAY_RULE_DAY_OF_MONTH   = 7,
			DAY_RULE_LAST_WEEKDAY   = 8;

		if (moment.tz !== undefined) {
			// Do not load moment-timezone a second time.
			return moment;
		}

		// converts time in the HH:mm:ss format to absolute number of minutes
		function parseMinutes (input) {
			input = input + '';
			var output = input.split(':'),
				sign = ~input.indexOf('-') ? -1 : 1,
				hour = Math.abs(+output[0]),
				minute = parseInt(output[1], 10) || 0,
				second = parseInt(output[2], 10) || 0;

			return sign * ((hour * 60) + (minute) + (second / 60));
		}

		/************************************
			Rules
		************************************/

		function Rule (name, startYear, endYear, month, day, dayRule, time, timeRule, offset, letters) {
			this.name      = name;
			this.startYear = +startYear;
			this.endYear   = +endYear;
			this.month     = +month;
			this.day       = +day;
			this.dayRule   = +dayRule;
			this.time      = parseMinutes(time);
			this.timeRule  = +timeRule;
			this.offset    = parseMinutes(offset);
			this.letters   = letters || '';
			this.date = memoize(this.date);
			this.weekdayAfter = memoize(this.weekdayAfter);
			this.lastWeekday = memoize(this.lastWeekday);
		}

		Rule.prototype = {
			contains : function (year) {
				return (year >= this.startYear && year <= this.endYear);
			},

			start : function (year) {
				year = Math.min(Math.max(year, this.startYear), this.endYear);
				return moment.utc([year, this.month, this.date(year), 0, this.time]);
			},

			date : function (year) {
				if (this.dayRule === DAY_RULE_DAY_OF_MONTH) {
					return this.day;
				} else if (this.dayRule === DAY_RULE_LAST_WEEKDAY) {
					return this.lastWeekday(year);
				}
				return this.weekdayAfter(year);
			},

			weekdayAfter : function (year) {
				var day = this.day,
					firstDayOfWeek = moment([year, this.month, 1]).day(),
					output = this.dayRule + 1 - firstDayOfWeek;

				while (output < day) {
					output += 7;
				}

				return output;
			},

			lastWeekday : function (year) {
				var day = this.day,
					dow = day % 7,
					lastDowOfMonth = moment([year, this.month + 1, 1]).day(),
					daysInMonth = moment([year, this.month, 1]).daysInMonth(),
					output = daysInMonth + (dow - (lastDowOfMonth - 1)) - (~~(day / 7) * 7);

				if (dow >= lastDowOfMonth) {
					output -= 7;
				}
				return output;
			}
		};

		/************************************
			Rule Year
		************************************/

		function RuleYear (year, rule) {
			this.rule = rule;
			this.start = rule.start(year);
		}

		RuleYear.prototype = {
			equals : function (other) {
				if (!other || other.rule !== this.rule) {
					return false;
				}
				return Math.abs(other.start - this.start) < 86400000; // 24 * 60 * 60 * 1000
			}
		};

		function sortRuleYears (a, b) {
			if (a.isLast) {
				return -1;
			}
			if (b.isLast) {
				return 1;
			}
			return b.start - a.start;
		}

		/************************************
			Rule Sets
		************************************/

		function RuleSet (name) {
			this.name = name;
			this.rules = [];
			this.lastYearRule = memoize(this.lastYearRule);
		}

		RuleSet.prototype = {
			add : function (rule) {
				this.rules.push(rule);
			},

			ruleYears : function (mom, lastZone) {
				var i, j,
					year = mom.year(),
					rule,
					lastZoneRule,
					rules = [];

				for (i = 0; i < this.rules.length; i++) {
					rule = this.rules[i];
					if (rule.contains(year)) {
						rules.push(new RuleYear(year, rule));
					} else if (rule.contains(year + 1)) {
						rules.push(new RuleYear(year + 1, rule));
					}
				}
				rules.push(new RuleYear(year - 1, this.lastYearRule(year - 1)));

				if (lastZone) {
					lastZoneRule = new RuleYear(year - 1, lastZone.lastRule());
					lastZoneRule.start = lastZone.until.clone().utc();
					lastZoneRule.isLast = lastZone.ruleSet !== this;
					rules.push(lastZoneRule);
				}

				rules.sort(sortRuleYears);
				return rules;
			},

			rule : function (mom, offset, lastZone) {
				var rules = this.ruleYears(mom, lastZone),
					lastOffset = 0,
					rule,
					lastZoneOffset,
					lastZoneOffsetAbs,
					lastRule,
					i;

				if (lastZone) {
					lastZoneOffset = lastZone.offset + lastZone.lastRule().offset;
					lastZoneOffsetAbs = Math.abs(lastZoneOffset) * 90000;
				}

				// make sure to include the previous rule's offset
				for (i = rules.length - 1; i > -1; i--) {
					lastRule = rule;
					rule = rules[i];

					if (rule.equals(lastRule)) {
						continue;
					}

					if (lastZone && !rule.isLast && Math.abs(rule.start - lastZone.until) <= lastZoneOffsetAbs) {
						lastOffset += lastZoneOffset - offset;
					}

					if (rule.rule.timeRule === TIME_RULE_STANDARD) {
						lastOffset = offset;
					}

					if (rule.rule.timeRule !== TIME_RULE_UTC) {
						rule.start.add('m', -lastOffset);
					}

					lastOffset = rule.rule.offset + offset;
				}

				for (i = 0; i < rules.length; i++) {
					rule = rules[i];
					if (mom >= rule.start && !rule.isLast) {
						return rule.rule;
					}
				}

				return defaultRule;
			},

			lastYearRule : function (year) {
				var i,
					rule,
					start,
					bestRule = defaultRule,
					largest = -1e30;

				for (i = 0; i < this.rules.length; i++) {
					rule = this.rules[i];
					if (year >= rule.startYear) {
						start = rule.start(year);
						if (start > largest) {
							largest = start;
							bestRule = rule;
						}
					}
				}

				return bestRule;
			}
		};

		/************************************
			Zone
		************************************/

		function Zone (name, offset, ruleSet, letters, until, untilOffset) {
			var i,
				untilArray = typeof until === 'string' ? until.split('_') : [9999];

			this.name = name;
			this.offset = parseMinutes(offset);
			this.ruleSet = ruleSet;
			this.letters = letters;
			this.lastRule = memoize(this.lastRule);

			for (i = 0; i < untilArray.length; i++) {
				untilArray[i] = +untilArray[i];
			}
			this.until = moment.utc(untilArray).subtract('m', parseMinutes(untilOffset));
		}

		Zone.prototype = {
			rule : function (mom, lastZone) {
				return this.ruleSet.rule(mom, this.offset, lastZone);
			},

			lastRule : function () {
				return this.rule(this.until);
			},

			format : function (rule) {
				return this.letters.replace("%s", rule.letters);
			}
		};

		/************************************
			Zone Set
		************************************/

		function sortZones (a, b) {
			return a.until - b.until;
		}

		function ZoneSet (name) {
			this.name = normalizeName(name);
			this.displayName = name;
			this.zones = [];
			this.zoneAndRule = memoize(this.zoneAndRule, function (mom) {
				return +mom;
			});
		}

		ZoneSet.prototype = {
			zoneAndRule : function (mom) {
				var i,
					zone,
					lastZone;

				mom = mom.clone().utc();
				for (i = 0; i < this.zones.length; i++) {
					zone = this.zones[i];
					if (mom < zone.until) {
						break;
					}
					lastZone = zone;
				}

				return [zone, zone.rule(mom, lastZone)];
			},

			add : function (zone) {
				this.zones.push(zone);
				this.zones.sort(sortZones);
			},

			format : function (mom) {
				var zoneAndRule = this.zoneAndRule(mom);
				return zoneAndRule[0].format(zoneAndRule[1]);
			},

			offset : function (mom) {
				var zoneAndRule = this.zoneAndRule(mom);
				return -(zoneAndRule[0].offset + zoneAndRule[1].offset);
			}
		};

		/************************************
			Global Methods
		************************************/

		function memoize (fn, keyFn) {
			var cache = {};
			return function (first) {
				var key = keyFn ? keyFn.apply(this, arguments) : first;
				return key in cache ?
					cache[key] :
					(cache[key] = fn.apply(this, arguments));
			};
		}

		function addRules (rules) {
			var i, j, rule;
			for (i in rules) {
				rule = rules[i];
				for (j = 0; j < rule.length; j++) {
					addRule(i + '\t' + rule[j]);
				}
			}
		}

		function addRule (ruleString) {
			// don't duplicate rules
			if (rules[ruleString]) {
				return rules[ruleString];
			}

			var p = ruleString.split(/\s/),
				name = normalizeName(p[0]),
				rule = new Rule(name, p[1], p[2], p[3], p[4], p[5], p[6], p[7], p[8], p[9], p[10]);

			// cache the rule so we don't add it again
			rules[ruleString] = rule;

			// add to the ruleset
			getRuleSet(name).add(rule);

			return rule;
		}

		function normalizeName (name) {
			return (name || '').toLowerCase().replace(/\//g, '_');
		}

		function addZones (zones) {
			var i, j, zone;
			for (i in zones) {
				zone = zones[i];
				for (j = 0; j < zone.length; j++) {
					addZone(i + '\t' + zone[j]);
				}
			}
		}

		function addLinks (linksToAdd) {
			var i;
			for (i in linksToAdd) {
				links[normalizeName(i)] = normalizeName(linksToAdd[i]);
			}
		}

		function addZone (zoneString) {
			// don't duplicate zones
			if (zones[zoneString]) {
				return zones[zoneString];
			}

			var p = zoneString.split(/\s/),
				name = normalizeName(p[0]),
				zone = new Zone(name, p[1], getRuleSet(p[2]), p[3], p[4], p[5]);

			// cache the zone so we don't add it again
			zones[zoneString] = zone;

			// add to the zoneset
			getZoneSet(p[0]).add(zone);

			return zone;
		}

		function getRuleSet (name) {
			name = normalizeName(name);
			if (!ruleSets[name]) {
				ruleSets[name] = new RuleSet(name);
			}
			return ruleSets[name];
		}

		function getZoneSet (name) {
			var machineName = normalizeName(name);
			if (links[machineName]) {
				machineName = links[machineName];
			}
			if (!zoneSets[machineName]) {
				zoneSets[machineName] = new ZoneSet(name);
			}
			return zoneSets[machineName];
		}

		function add (data) {
			if (!data) {
				return;
			}
			if (data.zones) {
				addZones(data.zones);
			}
			if (data.rules) {
				addRules(data.rules);
			}
			if (data.links) {
				addLinks(data.links);
			}
		}

		// overwrite moment.updateOffset
		moment.updateOffset = function (mom, keepTime) {
			var offset;
			if (mom._z) {
				offset = mom._z.offset(mom);
				if (Math.abs(offset) < 16) {
					offset = offset / 60;
				}
				mom.zone(offset, keepTime);
			}
		};

		function getZoneSets() {
			var sets = [],
				zoneName;
			for (zoneName in zoneSets) {
				sets.push(zoneSets[zoneName]);
			}
			return sets;
		}

		moment.fn.tz = function (name) {
			if (name) {
				this._z = getZoneSet(name);
				if (this._z) {
					moment.updateOffset(this);
				}
				return this;
			}
			if (this._z) {
				return this._z.displayName;
			}
		};

		moment.fn.zoneName = function () {
			if (this._z) {
				return this._z.format(this);
			}
			return oldZoneName.call(this);
		};

		moment.fn.zoneAbbr = function () {
			if (this._z) {
				return this._z.format(this);
			}
			return oldZoneAbbr.call(this);
		};

		// Make sure moment's clone includes the newly added properties
		moment.momentProperties._z = null;

		moment.tz = function () {
			var args = [], i, len = arguments.length - 1;
			for (i = 0; i < len; i++) {
				args[i] = arguments[i];
			}
			var m = moment.apply(null, args);
			var preTzOffset = m.zone();
			m.tz(arguments[len]);
			return m.add('minutes', m.zone() - preTzOffset);
		};

		moment.tz.add = add;
		moment.tz.addRule = addRule;
		moment.tz.addZone = addZone;
		moment.tz.zones = getZoneSets;

		moment.tz.version = VERSION;

		moment.tz.zoneExists = function (name) {
			return getZoneSet(name).zones.length > 0;
		};

		// add default rule
		defaultRule = addRule("- 0 9999 0 0 0 0 0 0");

		return moment;
	}

	if (typeof define === "function" && define.amd) {
		define("moment-timezone", ["moment"], onload);
	} else if (typeof module !== 'undefined') {
		module.exports = onload(require('moment'));
	} else if (typeof window !== "undefined" && window.moment) {
		onload(window.moment);
	}
}).apply(this);

},{"moment":40}],40:[function(require,module,exports){
(function (global){
//! moment.js
//! version : 2.7.0
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com

(function (undefined) {

    /************************************
        Constants
    ************************************/

    var moment,
        VERSION = "2.7.0",
        // the global-scope this is NOT the global object in Node.js
        globalScope = typeof global !== 'undefined' ? global : this,
        oldGlobalMoment,
        round = Math.round,
        i,

        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,

        // internal storage for language config files
        languages = {},

        // moment internal properties
        momentProperties = {
            _isAMomentObject: null,
            _i : null,
            _f : null,
            _l : null,
            _strict : null,
            _tzm : null,
            _isUTC : null,
            _offset : null,  // optional. Combine with _isUTC
            _pf : null,
            _lang : null  // optional
        },

        // check for nodeJS
        hasModule = (typeof module !== 'undefined' && module.exports),

        // ASP.NET json date format regex
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,

        // format tokens
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Q|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,

        // parsing token regexes
        parseTokenOneOrTwoDigits = /\d\d?/, // 0 - 99
        parseTokenOneToThreeDigits = /\d{1,3}/, // 0 - 999
        parseTokenOneToFourDigits = /\d{1,4}/, // 0 - 9999
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/, // -999,999 - 999,999
        parseTokenDigits = /\d+/, // nonzero number of digits
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i, // any word (or two) characters or numbers including two/three word month in arabic.
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
        parseTokenT = /T/i, // T (ISO separator)
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
        parseTokenOrdinal = /\d{1,2}/,

        //strict parsing regexes
        parseTokenOneDigit = /\d/, // 0 - 9
        parseTokenTwoDigits = /\d\d/, // 00 - 99
        parseTokenThreeDigits = /\d{3}/, // 000 - 999
        parseTokenFourDigits = /\d{4}/, // 0000 - 9999
        parseTokenSixDigits = /[+-]?\d{6}/, // -999,999 - 999,999
        parseTokenSignedNumber = /[+-]?\d+/, // -inf - inf

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,

        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',

        isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/],
            ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/],
            ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d{2}/],
            ['YYYY-DDD', /\d{4}-\d{3}/]
        ],

        // iso time formats and regexes
        isoTimes = [
            ['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/],
            ['HH:mm', /(T| )\d\d:\d\d/],
            ['HH', /(T| )\d\d/]
        ],

        // timezone chunker "+10:00" > ["10", "00"] or "-1530" > ["-15", "30"]
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,

        // getter and setter names
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            'Milliseconds' : 1,
            'Seconds' : 1e3,
            'Minutes' : 6e4,
            'Hours' : 36e5,
            'Days' : 864e5,
            'Months' : 2592e6,
            'Years' : 31536e6
        },

        unitAliases = {
            ms : 'millisecond',
            s : 'second',
            m : 'minute',
            h : 'hour',
            d : 'day',
            D : 'date',
            w : 'week',
            W : 'isoWeek',
            M : 'month',
            Q : 'quarter',
            y : 'year',
            DDD : 'dayOfYear',
            e : 'weekday',
            E : 'isoWeekday',
            gg: 'weekYear',
            GG: 'isoWeekYear'
        },

        camelFunctions = {
            dayofyear : 'dayOfYear',
            isoweekday : 'isoWeekday',
            isoweek : 'isoWeek',
            weekyear : 'weekYear',
            isoweekyear : 'isoWeekYear'
        },

        // format function strings
        formatFunctions = {},

        // default relative time thresholds
        relativeTimeThresholds = {
          s: 45,   //seconds to minutes
          m: 45,   //minutes to hours
          h: 22,   //hours to days
          dd: 25,  //days to month (month == 1)
          dm: 45,  //days to months (months > 1)
          dy: 345  //days to year
        },

        // tokens to ordinalize and pad
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),

        formatTokenFunctions = {
            M    : function () {
                return this.month() + 1;
            },
            MMM  : function (format) {
                return this.lang().monthsShort(this, format);
            },
            MMMM : function (format) {
                return this.lang().months(this, format);
            },
            D    : function () {
                return this.date();
            },
            DDD  : function () {
                return this.dayOfYear();
            },
            d    : function () {
                return this.day();
            },
            dd   : function (format) {
                return this.lang().weekdaysMin(this, format);
            },
            ddd  : function (format) {
                return this.lang().weekdaysShort(this, format);
            },
            dddd : function (format) {
                return this.lang().weekdays(this, format);
            },
            w    : function () {
                return this.week();
            },
            W    : function () {
                return this.isoWeek();
            },
            YY   : function () {
                return leftZeroFill(this.year() % 100, 2);
            },
            YYYY : function () {
                return leftZeroFill(this.year(), 4);
            },
            YYYYY : function () {
                return leftZeroFill(this.year(), 5);
            },
            YYYYYY : function () {
                var y = this.year(), sign = y >= 0 ? '+' : '-';
                return sign + leftZeroFill(Math.abs(y), 6);
            },
            gg   : function () {
                return leftZeroFill(this.weekYear() % 100, 2);
            },
            gggg : function () {
                return leftZeroFill(this.weekYear(), 4);
            },
            ggggg : function () {
                return leftZeroFill(this.weekYear(), 5);
            },
            GG   : function () {
                return leftZeroFill(this.isoWeekYear() % 100, 2);
            },
            GGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 4);
            },
            GGGGG : function () {
                return leftZeroFill(this.isoWeekYear(), 5);
            },
            e : function () {
                return this.weekday();
            },
            E : function () {
                return this.isoWeekday();
            },
            a    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), true);
            },
            A    : function () {
                return this.lang().meridiem(this.hours(), this.minutes(), false);
            },
            H    : function () {
                return this.hours();
            },
            h    : function () {
                return this.hours() % 12 || 12;
            },
            m    : function () {
                return this.minutes();
            },
            s    : function () {
                return this.seconds();
            },
            S    : function () {
                return toInt(this.milliseconds() / 100);
            },
            SS   : function () {
                return leftZeroFill(toInt(this.milliseconds() / 10), 2);
            },
            SSS  : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            SSSS : function () {
                return leftZeroFill(this.milliseconds(), 3);
            },
            Z    : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2);
            },
            ZZ   : function () {
                var a = -this.zone(),
                    b = "+";
                if (a < 0) {
                    a = -a;
                    b = "-";
                }
                return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2);
            },
            z : function () {
                return this.zoneAbbr();
            },
            zz : function () {
                return this.zoneName();
            },
            X    : function () {
                return this.unix();
            },
            Q : function () {
                return this.quarter();
            }
        },

        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];

    // Pick the first defined of two or three arguments. dfl comes from
    // default.
    function dfl(a, b, c) {
        switch (arguments.length) {
            case 2: return a != null ? a : b;
            case 3: return a != null ? a : b != null ? b : c;
            default: throw new Error("Implement me");
        }
    }

    function defaultParsingFlags() {
        // We need to deep clone this object, and es5 standard is not very
        // helpful.
        return {
            empty : false,
            unusedTokens : [],
            unusedInput : [],
            overflow : -2,
            charsLeftOver : 0,
            nullInput : false,
            invalidMonth : null,
            invalidFormat : false,
            userInvalidated : false,
            iso: false
        };
    }

    function deprecate(msg, fn) {
        var firstTime = true;
        function printMsg() {
            if (moment.suppressDeprecationWarnings === false &&
                    typeof console !== 'undefined' && console.warn) {
                console.warn("Deprecation warning: " + msg);
            }
        }
        return extend(function () {
            if (firstTime) {
                printMsg();
                firstTime = false;
            }
            return fn.apply(this, arguments);
        }, fn);
    }

    function padToken(func, count) {
        return function (a) {
            return leftZeroFill(func.call(this, a), count);
        };
    }
    function ordinalizeToken(func, period) {
        return function (a) {
            return this.lang().ordinal(func.call(this, a), period);
        };
    }

    while (ordinalizeTokens.length) {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i);
    }
    while (paddedTokens.length) {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2);
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);


    /************************************
        Constructors
    ************************************/

    function Language() {

    }

    // Moment prototype object
    function Moment(config) {
        checkOverflow(config);
        extend(this, config);
    }

    // Duration Constructor
    function Duration(duration) {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            quarters = normalizedInput.quarter || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;

        // representation for dateAddRemove
        this._milliseconds = +milliseconds +
            seconds * 1e3 + // 1000
            minutes * 6e4 + // 1000 * 60
            hours * 36e5; // 1000 * 60 * 60
        // Because of dateAddRemove treats 24 hours as different from a
        // day when working around DST, we need to store them separately
        this._days = +days +
            weeks * 7;
        // It is impossible translate months into days without knowing
        // which months you are are talking about, so we have to store
        // it separately.
        this._months = +months +
            quarters * 3 +
            years * 12;

        this._data = {};

        this._bubble();
    }

    /************************************
        Helpers
    ************************************/


    function extend(a, b) {
        for (var i in b) {
            if (b.hasOwnProperty(i)) {
                a[i] = b[i];
            }
        }

        if (b.hasOwnProperty("toString")) {
            a.toString = b.toString;
        }

        if (b.hasOwnProperty("valueOf")) {
            a.valueOf = b.valueOf;
        }

        return a;
    }

    function cloneMoment(m) {
        var result = {}, i;
        for (i in m) {
            if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i)) {
                result[i] = m[i];
            }
        }

        return result;
    }

    function absRound(number) {
        if (number < 0) {
            return Math.ceil(number);
        } else {
            return Math.floor(number);
        }
    }

    // left zero fill a number
    // see http://jsperf.com/left-zero-filling for performance comparison
    function leftZeroFill(number, targetLength, forceSign) {
        var output = '' + Math.abs(number),
            sign = number >= 0;

        while (output.length < targetLength) {
            output = '0' + output;
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output;
    }

    // helper function for _.addTime and _.subtractTime
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, updateOffset) {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months;
        updateOffset = updateOffset == null ? true : updateOffset;

        if (milliseconds) {
            mom._d.setTime(+mom._d + milliseconds * isAdding);
        }
        if (days) {
            rawSetter(mom, 'Date', rawGetter(mom, 'Date') + days * isAdding);
        }
        if (months) {
            rawMonthSetter(mom, rawGetter(mom, 'Month') + months * isAdding);
        }
        if (updateOffset) {
            moment.updateOffset(mom, days || months);
        }
    }

    // check if is an array
    function isArray(input) {
        return Object.prototype.toString.call(input) === '[object Array]';
    }

    function isDate(input) {
        return  Object.prototype.toString.call(input) === '[object Date]' ||
                input instanceof Date;
    }

    // compare two arrays, return the number of differences
    function compareArrays(array1, array2, dontConvert) {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++) {
            if ((dontConvert && array1[i] !== array2[i]) ||
                (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                diffs++;
            }
        }
        return diffs + lengthDiff;
    }

    function normalizeUnits(units) {
        if (units) {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered;
        }
        return units;
    }

    function normalizeObjectUnits(inputObject) {
        var normalizedInput = {},
            normalizedProp,
            prop;

        for (prop in inputObject) {
            if (inputObject.hasOwnProperty(prop)) {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp) {
                    normalizedInput[normalizedProp] = inputObject[prop];
                }
            }
        }

        return normalizedInput;
    }

    function makeList(field) {
        var count, setter;

        if (field.indexOf('week') === 0) {
            count = 7;
            setter = 'day';
        }
        else if (field.indexOf('month') === 0) {
            count = 12;
            setter = 'month';
        }
        else {
            return;
        }

        moment[field] = function (format, index) {
            var i, getter,
                method = moment.fn._lang[field],
                results = [];

            if (typeof format === 'number') {
                index = format;
                format = undefined;
            }

            getter = function (i) {
                var m = moment().utc().set(setter, i);
                return method.call(moment.fn._lang, m, format || '');
            };

            if (index != null) {
                return getter(index);
            }
            else {
                for (i = 0; i < count; i++) {
                    results.push(getter(i));
                }
                return results;
            }
        };
    }

    function toInt(argumentForCoercion) {
        var coercedNumber = +argumentForCoercion,
            value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            if (coercedNumber >= 0) {
                value = Math.floor(coercedNumber);
            } else {
                value = Math.ceil(coercedNumber);
            }
        }

        return value;
    }

    function daysInMonth(year, month) {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    }

    function weeksInYear(year, dow, doy) {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week;
    }

    function daysInYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function checkOverflow(m) {
        var overflow;
        if (m._a && m._pf.overflow === -2) {
            overflow =
                m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH :
                m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE :
                m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR :
                m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE :
                m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND :
                m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND :
                -1;

            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                overflow = DATE;
            }

            m._pf.overflow = overflow;
        }
    }

    function isValid(m) {
        if (m._isValid == null) {
            m._isValid = !isNaN(m._d.getTime()) &&
                m._pf.overflow < 0 &&
                !m._pf.empty &&
                !m._pf.invalidMonth &&
                !m._pf.nullInput &&
                !m._pf.invalidFormat &&
                !m._pf.userInvalidated;

            if (m._strict) {
                m._isValid = m._isValid &&
                    m._pf.charsLeftOver === 0 &&
                    m._pf.unusedTokens.length === 0;
            }
        }
        return m._isValid;
    }

    function normalizeLanguage(key) {
        return key ? key.toLowerCase().replace('_', '-') : key;
    }

    // Return a moment from input, that is local/utc/zone equivalent to model.
    function makeAs(input, model) {
        return model._isUTC ? moment(input).zone(model._offset || 0) :
            moment(input).local();
    }

    /************************************
        Languages
    ************************************/


    extend(Language.prototype, {

        set : function (config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (typeof prop === 'function') {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
        },

        _months : "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        months : function (m) {
            return this._months[m.month()];
        },

        _monthsShort : "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),
        monthsShort : function (m) {
            return this._monthsShort[m.month()];
        },

        monthsParse : function (monthName) {
            var i, mom, regex;

            if (!this._monthsParse) {
                this._monthsParse = [];
            }

            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                if (!this._monthsParse[i]) {
                    mom = moment.utc([2000, i]);
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        },

        _weekdays : "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        weekdays : function (m) {
            return this._weekdays[m.day()];
        },

        _weekdaysShort : "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),
        weekdaysShort : function (m) {
            return this._weekdaysShort[m.day()];
        },

        _weekdaysMin : "Su_Mo_Tu_We_Th_Fr_Sa".split("_"),
        weekdaysMin : function (m) {
            return this._weekdaysMin[m.day()];
        },

        weekdaysParse : function (weekdayName) {
            var i, mom, regex;

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                if (!this._weekdaysParse[i]) {
                    mom = moment([2000, 1]).day(i);
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        },

        _longDateFormat : {
            LT : "h:mm A",
            L : "MM/DD/YYYY",
            LL : "MMMM D YYYY",
            LLL : "MMMM D YYYY LT",
            LLLL : "dddd, MMMM D YYYY LT"
        },
        longDateFormat : function (key) {
            var output = this._longDateFormat[key];
            if (!output && this._longDateFormat[key.toUpperCase()]) {
                output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function (val) {
                    return val.slice(1);
                });
                this._longDateFormat[key] = output;
            }
            return output;
        },

        isPM : function (input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        },

        _meridiemParse : /[ap]\.?m?\.?/i,
        meridiem : function (hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        },

        _calendar : {
            sameDay : '[Today at] LT',
            nextDay : '[Tomorrow at] LT',
            nextWeek : 'dddd [at] LT',
            lastDay : '[Yesterday at] LT',
            lastWeek : '[Last] dddd [at] LT',
            sameElse : 'L'
        },
        calendar : function (key, mom) {
            var output = this._calendar[key];
            return typeof output === 'function' ? output.apply(mom) : output;
        },

        _relativeTime : {
            future : "in %s",
            past : "%s ago",
            s : "a few seconds",
            m : "a minute",
            mm : "%d minutes",
            h : "an hour",
            hh : "%d hours",
            d : "a day",
            dd : "%d days",
            M : "a month",
            MM : "%d months",
            y : "a year",
            yy : "%d years"
        },
        relativeTime : function (number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        },
        pastFuture : function (diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return typeof format === 'function' ? format(output) : format.replace(/%s/i, output);
        },

        ordinal : function (number) {
            return this._ordinal.replace("%d", number);
        },
        _ordinal : "%d",

        preparse : function (string) {
            return string;
        },

        postformat : function (string) {
            return string;
        },

        week : function (mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        },

        _week : {
            dow : 0, // Sunday is the first day of the week.
            doy : 6  // The week that contains Jan 1st is the first week of the year.
        },

        _invalidDate: 'Invalid date',
        invalidDate: function () {
            return this._invalidDate;
        }
    });

    // Loads a language definition into the `languages` cache.  The function
    // takes a key and optionally values.  If not in the browser and no values
    // are provided, it will load the language file module.  As a convenience,
    // this function also returns the language values.
    function loadLang(key, values) {
        values.abbr = key;
        if (!languages[key]) {
            languages[key] = new Language();
        }
        languages[key].set(values);
        return languages[key];
    }

    // Remove a language from the `languages` cache. Mostly useful in tests.
    function unloadLang(key) {
        delete languages[key];
    }

    // Determines which language definition to use and returns it.
    //
    // With no parameters, it will return the global language.  If you
    // pass in a language key, such as 'en', it will return the
    // definition for 'en', so long as 'en' has already been loaded using
    // moment.lang.
    function getLangDefinition(key) {
        var i = 0, j, lang, next, split,
            get = function (k) {
                if (!languages[k] && hasModule) {
                    try {
                        require('./lang/' + k);
                    } catch (e) { }
                }
                return languages[k];
            };

        if (!key) {
            return moment.fn._lang;
        }

        if (!isArray(key)) {
            //short-circuit everything else
            lang = get(key);
            if (lang) {
                return lang;
            }
            key = [key];
        }

        //pick the language from the array
        //try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        //substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        while (i < key.length) {
            split = normalizeLanguage(key[i]).split('-');
            j = split.length;
            next = normalizeLanguage(key[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0) {
                lang = get(split.slice(0, j).join('-'));
                if (lang) {
                    return lang;
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                    //the next array item is better than a shallower substring of this one
                    break;
                }
                j--;
            }
            i++;
        }
        return moment.fn._lang;
    }

    /************************************
        Formatting
    ************************************/


    function removeFormattingTokens(input) {
        if (input.match(/\[[\s\S]/)) {
            return input.replace(/^\[|\]$/g, "");
        }
        return input.replace(/\\/g, "");
    }

    function makeFormatFunction(format) {
        var array = format.match(formattingTokens), i, length;

        for (i = 0, length = array.length; i < length; i++) {
            if (formatTokenFunctions[array[i]]) {
                array[i] = formatTokenFunctions[array[i]];
            } else {
                array[i] = removeFormattingTokens(array[i]);
            }
        }

        return function (mom) {
            var output = "";
            for (i = 0; i < length; i++) {
                output += array[i] instanceof Function ? array[i].call(mom, format) : array[i];
            }
            return output;
        };
    }

    // format date using native date object
    function formatMoment(m, format) {

        if (!m.isValid()) {
            return m.lang().invalidDate();
        }

        format = expandFormat(format, m.lang());

        if (!formatFunctions[format]) {
            formatFunctions[format] = makeFormatFunction(format);
        }

        return formatFunctions[format](m);
    }

    function expandFormat(format, lang) {
        var i = 5;

        function replaceLongDateFormatTokens(input) {
            return lang.longDateFormat(input) || input;
        }

        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format)) {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1;
        }

        return format;
    }


    /************************************
        Parsing
    ************************************/


    // get the regex to find the next token
    function getParseRegexForToken(token, config) {
        var a, strict = config._strict;
        switch (token) {
        case 'Q':
            return parseTokenOneDigit;
        case 'DDDD':
            return parseTokenThreeDigits;
        case 'YYYY':
        case 'GGGG':
        case 'gggg':
            return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
        case 'Y':
        case 'G':
        case 'g':
            return parseTokenSignedNumber;
        case 'YYYYYY':
        case 'YYYYY':
        case 'GGGGG':
        case 'ggggg':
            return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
        case 'S':
            if (strict) { return parseTokenOneDigit; }
            /* falls through */
        case 'SS':
            if (strict) { return parseTokenTwoDigits; }
            /* falls through */
        case 'SSS':
            if (strict) { return parseTokenThreeDigits; }
            /* falls through */
        case 'DDD':
            return parseTokenOneToThreeDigits;
        case 'MMM':
        case 'MMMM':
        case 'dd':
        case 'ddd':
        case 'dddd':
            return parseTokenWord;
        case 'a':
        case 'A':
            return getLangDefinition(config._l)._meridiemParse;
        case 'X':
            return parseTokenTimestampMs;
        case 'Z':
        case 'ZZ':
            return parseTokenTimezone;
        case 'T':
            return parseTokenT;
        case 'SSSS':
            return parseTokenDigits;
        case 'MM':
        case 'DD':
        case 'YY':
        case 'GG':
        case 'gg':
        case 'HH':
        case 'hh':
        case 'mm':
        case 'ss':
        case 'ww':
        case 'WW':
            return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
        case 'M':
        case 'D':
        case 'd':
        case 'H':
        case 'h':
        case 'm':
        case 's':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
            return parseTokenOneOrTwoDigits;
        case 'Do':
            return parseTokenOrdinal;
        default :
            a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), "i"));
            return a;
        }
    }

    function timezoneMinutesFromString(string) {
        string = string || "";
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);

        return parts[0] === '+' ? -minutes : minutes;
    }

    // function to convert string input to date
    function addTimeToArrayFromToken(token, input, config) {
        var a, datePartArray = config._a;

        switch (token) {
        // QUARTER
        case 'Q':
            if (input != null) {
                datePartArray[MONTH] = (toInt(input) - 1) * 3;
            }
            break;
        // MONTH
        case 'M' : // fall through to MM
        case 'MM' :
            if (input != null) {
                datePartArray[MONTH] = toInt(input) - 1;
            }
            break;
        case 'MMM' : // fall through to MMMM
        case 'MMMM' :
            a = getLangDefinition(config._l).monthsParse(input);
            // if we didn't find a month name, mark the date as invalid.
            if (a != null) {
                datePartArray[MONTH] = a;
            } else {
                config._pf.invalidMonth = input;
            }
            break;
        // DAY OF MONTH
        case 'D' : // fall through to DD
        case 'DD' :
            if (input != null) {
                datePartArray[DATE] = toInt(input);
            }
            break;
        case 'Do' :
            if (input != null) {
                datePartArray[DATE] = toInt(parseInt(input, 10));
            }
            break;
        // DAY OF YEAR
        case 'DDD' : // fall through to DDDD
        case 'DDDD' :
            if (input != null) {
                config._dayOfYear = toInt(input);
            }

            break;
        // YEAR
        case 'YY' :
            datePartArray[YEAR] = moment.parseTwoDigitYear(input);
            break;
        case 'YYYY' :
        case 'YYYYY' :
        case 'YYYYYY' :
            datePartArray[YEAR] = toInt(input);
            break;
        // AM / PM
        case 'a' : // fall through to A
        case 'A' :
            config._isPm = getLangDefinition(config._l).isPM(input);
            break;
        // 24 HOUR
        case 'H' : // fall through to hh
        case 'HH' : // fall through to hh
        case 'h' : // fall through to hh
        case 'hh' :
            datePartArray[HOUR] = toInt(input);
            break;
        // MINUTE
        case 'm' : // fall through to mm
        case 'mm' :
            datePartArray[MINUTE] = toInt(input);
            break;
        // SECOND
        case 's' : // fall through to ss
        case 'ss' :
            datePartArray[SECOND] = toInt(input);
            break;
        // MILLISECOND
        case 'S' :
        case 'SS' :
        case 'SSS' :
        case 'SSSS' :
            datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
            break;
        // UNIX TIMESTAMP WITH MS
        case 'X':
            config._d = new Date(parseFloat(input) * 1000);
            break;
        // TIMEZONE
        case 'Z' : // fall through to ZZ
        case 'ZZ' :
            config._useUTC = true;
            config._tzm = timezoneMinutesFromString(input);
            break;
        // WEEKDAY - human
        case 'dd':
        case 'ddd':
        case 'dddd':
            a = getLangDefinition(config._l).weekdaysParse(input);
            // if we didn't get a weekday name, mark the date as invalid
            if (a != null) {
                config._w = config._w || {};
                config._w['d'] = a;
            } else {
                config._pf.invalidWeekday = input;
            }
            break;
        // WEEK, WEEK DAY - numeric
        case 'w':
        case 'ww':
        case 'W':
        case 'WW':
        case 'd':
        case 'e':
        case 'E':
            token = token.substr(0, 1);
            /* falls through */
        case 'gggg':
        case 'GGGG':
        case 'GGGGG':
            token = token.substr(0, 2);
            if (input) {
                config._w = config._w || {};
                config._w[token] = toInt(input);
            }
            break;
        case 'gg':
        case 'GG':
            config._w = config._w || {};
            config._w[token] = moment.parseTwoDigitYear(input);
        }
    }

    function dayOfYearFromWeekInfo(config) {
        var w, weekYear, week, weekday, dow, doy, temp, lang;

        w = config._w;
        if (w.GG != null || w.W != null || w.E != null) {
            dow = 1;
            doy = 4;

            // TODO: We need to take the current isoWeekYear, but that depends on
            // how we interpret now (local, utc, fixed offset). So create
            // a now version of current config (take local/utc/offset flags, and
            // create now).
            weekYear = dfl(w.GG, config._a[YEAR], weekOfYear(moment(), 1, 4).year);
            week = dfl(w.W, 1);
            weekday = dfl(w.E, 1);
        } else {
            lang = getLangDefinition(config._l);
            dow = lang._week.dow;
            doy = lang._week.doy;

            weekYear = dfl(w.gg, config._a[YEAR], weekOfYear(moment(), dow, doy).year);
            week = dfl(w.w, 1);

            if (w.d != null) {
                // weekday -- low day numbers are considered next week
                weekday = w.d;
                if (weekday < dow) {
                    ++week;
                }
            } else if (w.e != null) {
                // local weekday -- counting starts from begining of week
                weekday = w.e + dow;
            } else {
                // default to begining of week
                weekday = dow;
            }
        }
        temp = dayOfYearFromWeeks(weekYear, week, weekday, doy, dow);

        config._a[YEAR] = temp.year;
        config._dayOfYear = temp.dayOfYear;
    }

    // convert an array to a date.
    // the array should mirror the parameters below
    // note: all values past the year are optional and will default to the lowest possible value.
    // [year, month, day , hour, minute, second, millisecond]
    function dateFromConfig(config) {
        var i, date, input = [], currentDate, yearToUse;

        if (config._d) {
            return;
        }

        currentDate = currentDateArray(config);

        //compute day of the year from weeks and weekdays
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
            dayOfYearFromWeekInfo(config);
        }

        //if the day of the year is set, figure out what it is
        if (config._dayOfYear) {
            yearToUse = dfl(config._a[YEAR], currentDate[YEAR]);

            if (config._dayOfYear > daysInYear(yearToUse)) {
                config._pf._overflowDayOfYear = true;
            }

            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate();
        }

        // Default to current date.
        // * if no year, month, day of month are given, default to today
        // * if day of month is given, default month and year
        // * if month is given, default only year
        // * if year is given, don't default anything
        for (i = 0; i < 3 && config._a[i] == null; ++i) {
            config._a[i] = input[i] = currentDate[i];
        }

        // Zero out whatever was not defaulted, including time
        for (; i < 7; i++) {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
        }

        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input);
        // Apply timezone offset from input. The actual zone can be changed
        // with parseZone.
        if (config._tzm != null) {
            config._d.setUTCMinutes(config._d.getUTCMinutes() + config._tzm);
        }
    }

    function dateFromObject(config) {
        var normalizedInput;

        if (config._d) {
            return;
        }

        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [
            normalizedInput.year,
            normalizedInput.month,
            normalizedInput.day,
            normalizedInput.hour,
            normalizedInput.minute,
            normalizedInput.second,
            normalizedInput.millisecond
        ];

        dateFromConfig(config);
    }

    function currentDateArray(config) {
        var now = new Date();
        if (config._useUTC) {
            return [
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate()
            ];
        } else {
            return [now.getFullYear(), now.getMonth(), now.getDate()];
        }
    }

    // date from string and format string
    function makeDateFromStringAndFormat(config) {

        if (config._f === moment.ISO_8601) {
            parseISO(config);
            return;
        }

        config._a = [];
        config._pf.empty = true;

        // This array is used to make a Date, either with `new Date` or `Date.UTC`
        var lang = getLangDefinition(config._l),
            string = '' + config._i,
            i, parsedInput, tokens, token, skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;

        tokens = expandFormat(config._f, lang).match(formattingTokens) || [];

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput) {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0) {
                    config._pf.unusedInput.push(skipped);
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length;
            }
            // don't parse if it's not a known token
            if (formatTokenFunctions[token]) {
                if (parsedInput) {
                    config._pf.empty = false;
                }
                else {
                    config._pf.unusedTokens.push(token);
                }
                addTimeToArrayFromToken(token, parsedInput, config);
            }
            else if (config._strict && !parsedInput) {
                config._pf.unusedTokens.push(token);
            }
        }

        // add remaining unparsed input length to the string
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0) {
            config._pf.unusedInput.push(string);
        }

        // handle am pm
        if (config._isPm && config._a[HOUR] < 12) {
            config._a[HOUR] += 12;
        }
        // if is 12 am, change hours to 0
        if (config._isPm === false && config._a[HOUR] === 12) {
            config._a[HOUR] = 0;
        }

        dateFromConfig(config);
        checkOverflow(config);
    }

    function unescapeFormat(s) {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
            return p1 || p2 || p3 || p4;
        });
    }

    // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
    function regexpEscape(s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    // date from string and array of format strings
    function makeDateFromStringAndArray(config) {
        var tempConfig,
            bestMoment,

            scoreToBeat,
            i,
            currentScore;

        if (config._f.length === 0) {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return;
        }

        for (i = 0; i < config._f.length; i++) {
            currentScore = 0;
            tempConfig = extend({}, config);
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);

            if (!isValid(tempConfig)) {
                continue;
            }

            // if there is any input that was not parsed add a penalty for that format
            currentScore += tempConfig._pf.charsLeftOver;

            //or tokens
            currentScore += tempConfig._pf.unusedTokens.length * 10;

            tempConfig._pf.score = currentScore;

            if (scoreToBeat == null || currentScore < scoreToBeat) {
                scoreToBeat = currentScore;
                bestMoment = tempConfig;
            }
        }

        extend(config, bestMoment || tempConfig);
    }

    // date from iso format
    function parseISO(config) {
        var i, l,
            string = config._i,
            match = isoRegex.exec(string);

        if (match) {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++) {
                if (isoDates[i][1].exec(string)) {
                    // match[5] should be "T" or undefined
                    config._f = isoDates[i][0] + (match[6] || " ");
                    break;
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++) {
                if (isoTimes[i][1].exec(string)) {
                    config._f += isoTimes[i][0];
                    break;
                }
            }
            if (string.match(parseTokenTimezone)) {
                config._f += "Z";
            }
            makeDateFromStringAndFormat(config);
        } else {
            config._isValid = false;
        }
    }

    // date from iso format or fallback
    function makeDateFromString(config) {
        parseISO(config);
        if (config._isValid === false) {
            delete config._isValid;
            moment.createFromInputFallback(config);
        }
    }

    function makeDateFromInput(config) {
        var input = config._i,
            matched = aspNetJsonRegex.exec(input);

        if (input === undefined) {
            config._d = new Date();
        } else if (matched) {
            config._d = new Date(+matched[1]);
        } else if (typeof input === 'string') {
            makeDateFromString(config);
        } else if (isArray(input)) {
            config._a = input.slice(0);
            dateFromConfig(config);
        } else if (isDate(input)) {
            config._d = new Date(+input);
        } else if (typeof(input) === 'object') {
            dateFromObject(config);
        } else if (typeof(input) === 'number') {
            // from milliseconds
            config._d = new Date(input);
        } else {
            moment.createFromInputFallback(config);
        }
    }

    function makeDate(y, m, d, h, M, s, ms) {
        //can't just apply() to create a date:
        //http://stackoverflow.com/questions/181348/instantiating-a-javascript-object-by-calling-prototype-constructor-apply
        var date = new Date(y, m, d, h, M, s, ms);

        //the date constructor doesn't accept years < 1970
        if (y < 1970) {
            date.setFullYear(y);
        }
        return date;
    }

    function makeUTCDate(y) {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970) {
            date.setUTCFullYear(y);
        }
        return date;
    }

    function parseWeekday(input, language) {
        if (typeof input === 'string') {
            if (!isNaN(input)) {
                input = parseInt(input, 10);
            }
            else {
                input = language.weekdaysParse(input);
                if (typeof input !== 'number') {
                    return null;
                }
            }
        }
        return input;
    }

    /************************************
        Relative Time
    ************************************/


    // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang) {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
    }

    function relativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < relativeTimeThresholds.s  && ['s', seconds] ||
                minutes === 1 && ['m'] ||
                minutes < relativeTimeThresholds.m && ['mm', minutes] ||
                hours === 1 && ['h'] ||
                hours < relativeTimeThresholds.h && ['hh', hours] ||
                days === 1 && ['d'] ||
                days <= relativeTimeThresholds.dd && ['dd', days] ||
                days <= relativeTimeThresholds.dm && ['M'] ||
                days < relativeTimeThresholds.dy && ['MM', round(days / 30)] ||
                years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args);
    }


    /************************************
        Week of Year
    ************************************/


    // firstDayOfWeek       0 = sun, 6 = sat
    //                      the day of the week that starts the week
    //                      (usually sunday or monday)
    // firstDayOfWeekOfYear 0 = sun, 6 = sat
    //                      the first week is the week that contains the first
    //                      of this day of the week
    //                      (eg. ISO weeks use thursday (4))
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear) {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;


        if (daysToDayOfWeek > end) {
            daysToDayOfWeek -= 7;
        }

        if (daysToDayOfWeek < end - 7) {
            daysToDayOfWeek += 7;
        }

        adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
        return {
            week: Math.ceil(adjustedMoment.dayOfYear() / 7),
            year: adjustedMoment.year()
        };
    }

    //http://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek) {
        var d = makeUTCDate(year, 0, 1).getUTCDay(), daysToAdd, dayOfYear;

        d = d === 0 ? 7 : d;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;

        return {
            year: dayOfYear > 0 ? year : year - 1,
            dayOfYear: dayOfYear > 0 ?  dayOfYear : daysInYear(year - 1) + dayOfYear
        };
    }

    /************************************
        Top Level Functions
    ************************************/

    function makeMoment(config) {
        var input = config._i,
            format = config._f;

        if (input === null || (format === undefined && input === '')) {
            return moment.invalid({nullInput: true});
        }

        if (typeof input === 'string') {
            config._i = input = getLangDefinition().preparse(input);
        }

        if (moment.isMoment(input)) {
            config = cloneMoment(input);

            config._d = new Date(+input._d);
        } else if (format) {
            if (isArray(format)) {
                makeDateFromStringAndArray(config);
            } else {
                makeDateFromStringAndFormat(config);
            }
        } else {
            makeDateFromInput(config);
        }

        return new Moment(config);
    }

    moment = function (input, format, lang, strict) {
        var c;

        if (typeof(lang) === "boolean") {
            strict = lang;
            lang = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = lang;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();

        return makeMoment(c);
    };

    moment.suppressDeprecationWarnings = false;

    moment.createFromInputFallback = deprecate(
            "moment construction falls back to js Date. This is " +
            "discouraged and will be removed in upcoming major " +
            "release. Please refer to " +
            "https://github.com/moment/moment/issues/1407 for more info.",
            function (config) {
        config._d = new Date(config._i);
    });

    // Pick a moment m from moments so that m[fn](other) is true for all
    // other. This relies on the function fn to be transitive.
    //
    // moments should either be an array of moment objects or an array, whose
    // first element is an array of moment objects.
    function pickBy(fn, moments) {
        var res, i;
        if (moments.length === 1 && isArray(moments[0])) {
            moments = moments[0];
        }
        if (!moments.length) {
            return moment();
        }
        res = moments[0];
        for (i = 1; i < moments.length; ++i) {
            if (moments[i][fn](res)) {
                res = moments[i];
            }
        }
        return res;
    }

    moment.min = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isBefore', args);
    };

    moment.max = function () {
        var args = [].slice.call(arguments, 0);

        return pickBy('isAfter', args);
    };

    // creating with utc
    moment.utc = function (input, format, lang, strict) {
        var c;

        if (typeof(lang) === "boolean") {
            strict = lang;
            lang = undefined;
        }
        // object construction must be done this way.
        // https://github.com/moment/moment/issues/1423
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = lang;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();

        return makeMoment(c).utc();
    };

    // creating with unix timestamp (in seconds)
    moment.unix = function (input) {
        return moment(input * 1000);
    };

    // duration
    moment.duration = function (input, key) {
        var duration = input,
            // matching against regexp is expensive, do it on demand
            match = null,
            sign,
            ret,
            parseIso;

        if (moment.isDuration(input)) {
            duration = {
                ms: input._milliseconds,
                d: input._days,
                M: input._months
            };
        } else if (typeof input === 'number') {
            duration = {};
            if (key) {
                duration[key] = input;
            } else {
                duration.milliseconds = input;
            }
        } else if (!!(match = aspNetTimeSpanJsonRegex.exec(input))) {
            sign = (match[1] === "-") ? -1 : 1;
            duration = {
                y: 0,
                d: toInt(match[DATE]) * sign,
                h: toInt(match[HOUR]) * sign,
                m: toInt(match[MINUTE]) * sign,
                s: toInt(match[SECOND]) * sign,
                ms: toInt(match[MILLISECOND]) * sign
            };
        } else if (!!(match = isoDurationRegex.exec(input))) {
            sign = (match[1] === "-") ? -1 : 1;
            parseIso = function (inp) {
                // We'd normally use ~~inp for this, but unfortunately it also
                // converts floats to ints.
                // inp may be undefined, so careful calling replace on it.
                var res = inp && parseFloat(inp.replace(',', '.'));
                // apply sign while we're at it
                return (isNaN(res) ? 0 : res) * sign;
            };
            duration = {
                y: parseIso(match[2]),
                M: parseIso(match[3]),
                d: parseIso(match[4]),
                h: parseIso(match[5]),
                m: parseIso(match[6]),
                s: parseIso(match[7]),
                w: parseIso(match[8])
            };
        }

        ret = new Duration(duration);

        if (moment.isDuration(input) && input.hasOwnProperty('_lang')) {
            ret._lang = input._lang;
        }

        return ret;
    };

    // version number
    moment.version = VERSION;

    // default format
    moment.defaultFormat = isoFormat;

    // constant that refers to the ISO standard
    moment.ISO_8601 = function () {};

    // Plugins that add properties should also add the key here (null value),
    // so we can properly clone ourselves.
    moment.momentProperties = momentProperties;

    // This function will be called whenever a moment is mutated.
    // It is intended to keep the offset in sync with the timezone.
    moment.updateOffset = function () {};

    // This function allows you to set a threshold for relative time strings
    moment.relativeTimeThreshold = function(threshold, limit) {
      if (relativeTimeThresholds[threshold] === undefined) {
        return false;
      }
      relativeTimeThresholds[threshold] = limit;
      return true;
    };

    // This function will load languages and then set the global language.  If
    // no arguments are passed in, it will simply return the current global
    // language key.
    moment.lang = function (key, values) {
        var r;
        if (!key) {
            return moment.fn._lang._abbr;
        }
        if (values) {
            loadLang(normalizeLanguage(key), values);
        } else if (values === null) {
            unloadLang(key);
            key = 'en';
        } else if (!languages[key]) {
            getLangDefinition(key);
        }
        r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
        return r._abbr;
    };

    // returns language data
    moment.langData = function (key) {
        if (key && key._lang && key._lang._abbr) {
            key = key._lang._abbr;
        }
        return getLangDefinition(key);
    };

    // compare moment object
    moment.isMoment = function (obj) {
        return obj instanceof Moment ||
            (obj != null &&  obj.hasOwnProperty('_isAMomentObject'));
    };

    // for typechecking Duration objects
    moment.isDuration = function (obj) {
        return obj instanceof Duration;
    };

    for (i = lists.length - 1; i >= 0; --i) {
        makeList(lists[i]);
    }

    moment.normalizeUnits = function (units) {
        return normalizeUnits(units);
    };

    moment.invalid = function (flags) {
        var m = moment.utc(NaN);
        if (flags != null) {
            extend(m._pf, flags);
        }
        else {
            m._pf.userInvalidated = true;
        }

        return m;
    };

    moment.parseZone = function () {
        return moment.apply(null, arguments).parseZone();
    };

    moment.parseTwoDigitYear = function (input) {
        return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
    };

    /************************************
        Moment Prototype
    ************************************/


    extend(moment.fn = Moment.prototype, {

        clone : function () {
            return moment(this);
        },

        valueOf : function () {
            return +this._d + ((this._offset || 0) * 60000);
        },

        unix : function () {
            return Math.floor(+this / 1000);
        },

        toString : function () {
            return this.clone().lang('en').format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ");
        },

        toDate : function () {
            return this._offset ? new Date(+this) : this._d;
        },

        toISOString : function () {
            var m = moment(this).utc();
            if (0 < m.year() && m.year() <= 9999) {
                return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            } else {
                return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]');
            }
        },

        toArray : function () {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hours(),
                m.minutes(),
                m.seconds(),
                m.milliseconds()
            ];
        },

        isValid : function () {
            return isValid(this);
        },

        isDSTShifted : function () {

            if (this._a) {
                return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0;
            }

            return false;
        },

        parsingFlags : function () {
            return extend({}, this._pf);
        },

        invalidAt: function () {
            return this._pf.overflow;
        },

        utc : function () {
            return this.zone(0);
        },

        local : function () {
            this.zone(0);
            this._isUTC = false;
            return this;
        },

        format : function (inputString) {
            var output = formatMoment(this, inputString || moment.defaultFormat);
            return this.lang().postformat(output);
        },

        add : function (input, val) {
            var dur;
            // switch args to support add('s', 1) and add(1, 's')
            if (typeof input === 'string' && typeof val === 'string') {
                dur = moment.duration(isNaN(+val) ? +input : +val, isNaN(+val) ? val : input);
            } else if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, 1);
            return this;
        },

        subtract : function (input, val) {
            var dur;
            // switch args to support subtract('s', 1) and subtract(1, 's')
            if (typeof input === 'string' && typeof val === 'string') {
                dur = moment.duration(isNaN(+val) ? +input : +val, isNaN(+val) ? val : input);
            } else if (typeof input === 'string') {
                dur = moment.duration(+val, input);
            } else {
                dur = moment.duration(input, val);
            }
            addOrSubtractDurationFromMoment(this, dur, -1);
            return this;
        },

        diff : function (input, units, asFloat) {
            var that = makeAs(input, this),
                zoneDiff = (this.zone() - that.zone()) * 6e4,
                diff, output;

            units = normalizeUnits(units);

            if (units === 'year' || units === 'month') {
                // average number of days in the months in the given dates
                diff = (this.daysInMonth() + that.daysInMonth()) * 432e5; // 24 * 60 * 60 * 1000 / 2
                // difference in months
                output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                // adjust by taking difference in days, average number of days
                // and dst in the given months.
                output += ((this - moment(this).startOf('month')) -
                        (that - moment(that).startOf('month'))) / diff;
                // same as above but with zones, to negate all dst
                output -= ((this.zone() - moment(this).startOf('month').zone()) -
                        (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
                if (units === 'year') {
                    output = output / 12;
                }
            } else {
                diff = (this - that);
                output = units === 'second' ? diff / 1e3 : // 1000
                    units === 'minute' ? diff / 6e4 : // 1000 * 60
                    units === 'hour' ? diff / 36e5 : // 1000 * 60 * 60
                    units === 'day' ? (diff - zoneDiff) / 864e5 : // 1000 * 60 * 60 * 24, negate dst
                    units === 'week' ? (diff - zoneDiff) / 6048e5 : // 1000 * 60 * 60 * 24 * 7, negate dst
                    diff;
            }
            return asFloat ? output : absRound(output);
        },

        from : function (time, withoutSuffix) {
            return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix);
        },

        fromNow : function (withoutSuffix) {
            return this.from(moment(), withoutSuffix);
        },

        calendar : function (time) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're zone'd or not.
            var now = time || moment(),
                sod = makeAs(now, this).startOf('day'),
                diff = this.diff(sod, 'days', true),
                format = diff < -6 ? 'sameElse' :
                    diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                    diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                    diff < 7 ? 'nextWeek' : 'sameElse';
            return this.format(this.lang().calendar(format, this));
        },

        isLeapYear : function () {
            return isLeapYear(this.year());
        },

        isDST : function () {
            return (this.zone() < this.clone().month(0).zone() ||
                this.zone() < this.clone().month(5).zone());
        },

        day : function (input) {
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.lang());
                return this.add({ d : input - day });
            } else {
                return day;
            }
        },

        month : makeAccessor('Month', true),

        startOf: function (units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
            case 'year':
                this.month(0);
                /* falls through */
            case 'quarter':
            case 'month':
                this.date(1);
                /* falls through */
            case 'week':
            case 'isoWeek':
            case 'day':
                this.hours(0);
                /* falls through */
            case 'hour':
                this.minutes(0);
                /* falls through */
            case 'minute':
                this.seconds(0);
                /* falls through */
            case 'second':
                this.milliseconds(0);
                /* falls through */
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            } else if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        },

        endOf: function (units) {
            units = normalizeUnits(units);
            return this.startOf(units).add((units === 'isoWeek' ? 'week' : units), 1).subtract('ms', 1);
        },

        isAfter: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) > +moment(input).startOf(units);
        },

        isBefore: function (input, units) {
            units = typeof units !== 'undefined' ? units : 'millisecond';
            return +this.clone().startOf(units) < +moment(input).startOf(units);
        },

        isSame: function (input, units) {
            units = units || 'ms';
            return +this.clone().startOf(units) === +makeAs(input, this).startOf(units);
        },

        min: deprecate(
                 "moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",
                 function (other) {
                     other = moment.apply(null, arguments);
                     return other < this ? this : other;
                 }
         ),

        max: deprecate(
                "moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",
                function (other) {
                    other = moment.apply(null, arguments);
                    return other > this ? this : other;
                }
        ),

        // keepTime = true means only change the timezone, without affecting
        // the local hour. So 5:31:26 +0300 --[zone(2, true)]--> 5:31:26 +0200
        // It is possible that 5:31:26 doesn't exist int zone +0200, so we
        // adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        zone : function (input, keepTime) {
            var offset = this._offset || 0;
            if (input != null) {
                if (typeof input === "string") {
                    input = timezoneMinutesFromString(input);
                }
                if (Math.abs(input) < 16) {
                    input = input * 60;
                }
                this._offset = input;
                this._isUTC = true;
                if (offset !== input) {
                    if (!keepTime || this._changeInProgress) {
                        addOrSubtractDurationFromMoment(this,
                                moment.duration(offset - input, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        moment.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
            } else {
                return this._isUTC ? offset : this._d.getTimezoneOffset();
            }
            return this;
        },

        zoneAbbr : function () {
            return this._isUTC ? "UTC" : "";
        },

        zoneName : function () {
            return this._isUTC ? "Coordinated Universal Time" : "";
        },

        parseZone : function () {
            if (this._tzm) {
                this.zone(this._tzm);
            } else if (typeof this._i === 'string') {
                this.zone(this._i);
            }
            return this;
        },

        hasAlignedHourOffset : function (input) {
            if (!input) {
                input = 0;
            }
            else {
                input = moment(input).zone();
            }

            return (this.zone() - input) % 60 === 0;
        },

        daysInMonth : function () {
            return daysInMonth(this.year(), this.month());
        },

        dayOfYear : function (input) {
            var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add("d", (input - dayOfYear));
        },

        quarter : function (input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        },

        weekYear : function (input) {
            var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
            return input == null ? year : this.add("y", (input - year));
        },

        isoWeekYear : function (input) {
            var year = weekOfYear(this, 1, 4).year;
            return input == null ? year : this.add("y", (input - year));
        },

        week : function (input) {
            var week = this.lang().week(this);
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        isoWeek : function (input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add("d", (input - week) * 7);
        },

        weekday : function (input) {
            var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
            return input == null ? weekday : this.add("d", input - weekday);
        },

        isoWeekday : function (input) {
            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.
            return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7);
        },

        isoWeeksInYear : function () {
            return weeksInYear(this.year(), 1, 4);
        },

        weeksInYear : function () {
            var weekInfo = this._lang._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units]();
        },

        set : function (units, value) {
            units = normalizeUnits(units);
            if (typeof this[units] === 'function') {
                this[units](value);
            }
            return this;
        },

        // If passed a language key, it will set the language for this
        // instance.  Otherwise, it will return the language configuration
        // variables for this instance.
        lang : function (key) {
            if (key === undefined) {
                return this._lang;
            } else {
                this._lang = getLangDefinition(key);
                return this;
            }
        }
    });

    function rawMonthSetter(mom, value) {
        var dayOfMonth;

        // TODO: Move this out of here!
        if (typeof value === 'string') {
            value = mom.lang().monthsParse(value);
            // TODO: Another silent failure?
            if (typeof value !== 'number') {
                return mom;
            }
        }

        dayOfMonth = Math.min(mom.date(),
                daysInMonth(mom.year(), value));
        mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
        return mom;
    }

    function rawGetter(mom, unit) {
        return mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]();
    }

    function rawSetter(mom, unit, value) {
        if (unit === 'Month') {
            return rawMonthSetter(mom, value);
        } else {
            return mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
        }
    }

    function makeAccessor(unit, keepTime) {
        return function (value) {
            if (value != null) {
                rawSetter(this, unit, value);
                moment.updateOffset(this, keepTime);
                return this;
            } else {
                return rawGetter(this, unit);
            }
        };
    }

    moment.fn.millisecond = moment.fn.milliseconds = makeAccessor('Milliseconds', false);
    moment.fn.second = moment.fn.seconds = makeAccessor('Seconds', false);
    moment.fn.minute = moment.fn.minutes = makeAccessor('Minutes', false);
    // Setting the hour should keep the time, because the user explicitly
    // specified which hour he wants. So trying to maintain the same hour (in
    // a new timezone) makes sense. Adding/subtracting hours does not follow
    // this rule.
    moment.fn.hour = moment.fn.hours = makeAccessor('Hours', true);
    // moment.fn.month is defined separately
    moment.fn.date = makeAccessor('Date', true);
    moment.fn.dates = deprecate("dates accessor is deprecated. Use date instead.", makeAccessor('Date', true));
    moment.fn.year = makeAccessor('FullYear', true);
    moment.fn.years = deprecate("years accessor is deprecated. Use year instead.", makeAccessor('FullYear', true));

    // add plural methods
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.quarters = moment.fn.quarter;

    // add aliased format methods
    moment.fn.toJSON = moment.fn.toISOString;

    /************************************
        Duration Prototype
    ************************************/


    extend(moment.duration.fn = Duration.prototype, {

        _bubble : function () {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds, minutes, hours, years;

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;

            hours = absRound(minutes / 60);
            data.hours = hours % 24;

            days += absRound(hours / 24);
            data.days = days % 30;

            months += absRound(days / 30);
            data.months = months % 12;

            years = absRound(months / 12);
            data.years = years;
        },

        weeks : function () {
            return absRound(this.days() / 7);
        },

        valueOf : function () {
            return this._milliseconds +
              this._days * 864e5 +
              (this._months % 12) * 2592e6 +
              toInt(this._months / 12) * 31536e6;
        },

        humanize : function (withSuffix) {
            var difference = +this,
                output = relativeTime(difference, !withSuffix, this.lang());

            if (withSuffix) {
                output = this.lang().pastFuture(difference, output);
            }

            return this.lang().postformat(output);
        },

        add : function (input, val) {
            // supports only 2.0-style add(1, 's') or add(moment)
            var dur = moment.duration(input, val);

            this._milliseconds += dur._milliseconds;
            this._days += dur._days;
            this._months += dur._months;

            this._bubble();

            return this;
        },

        subtract : function (input, val) {
            var dur = moment.duration(input, val);

            this._milliseconds -= dur._milliseconds;
            this._days -= dur._days;
            this._months -= dur._months;

            this._bubble();

            return this;
        },

        get : function (units) {
            units = normalizeUnits(units);
            return this[units.toLowerCase() + 's']();
        },

        as : function (units) {
            units = normalizeUnits(units);
            return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']();
        },

        lang : moment.fn.lang,

        toIsoString : function () {
            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var years = Math.abs(this.years()),
                months = Math.abs(this.months()),
                days = Math.abs(this.days()),
                hours = Math.abs(this.hours()),
                minutes = Math.abs(this.minutes()),
                seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);

            if (!this.asSeconds()) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            return (this.asSeconds() < 0 ? '-' : '') +
                'P' +
                (years ? years + 'Y' : '') +
                (months ? months + 'M' : '') +
                (days ? days + 'D' : '') +
                ((hours || minutes || seconds) ? 'T' : '') +
                (hours ? hours + 'H' : '') +
                (minutes ? minutes + 'M' : '') +
                (seconds ? seconds + 'S' : '');
        }
    });

    function makeDurationGetter(name) {
        moment.duration.fn[name] = function () {
            return this._data[name];
        };
    }

    function makeDurationAsGetter(name, factor) {
        moment.duration.fn['as' + name] = function () {
            return +this / factor;
        };
    }

    for (i in unitMillisecondFactors) {
        if (unitMillisecondFactors.hasOwnProperty(i)) {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase());
        }
    }

    makeDurationAsGetter('Weeks', 6048e5);
    moment.duration.fn.asMonths = function () {
        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12;
    };


    /************************************
        Default Lang
    ************************************/


    // Set default language, other languages will inherit from English.
    moment.lang('en', {
        ordinal : function (number) {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' :
                (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                (b === 3) ? 'rd' : 'th';
            return number + output;
        }
    });

    /* EMBED_LANGUAGES */

    /************************************
        Exposing Moment
    ************************************/

    function makeGlobal(shouldDeprecate) {
        /*global ender:false */
        if (typeof ender !== 'undefined') {
            return;
        }
        oldGlobalMoment = globalScope.moment;
        if (shouldDeprecate) {
            globalScope.moment = deprecate(
                    "Accessing Moment through the global scope is " +
                    "deprecated, and will be removed in an upcoming " +
                    "release.",
                    moment);
        } else {
            globalScope.moment = moment;
        }
    }

    // CommonJS module is defined
    if (hasModule) {
        module.exports = moment;
    } else if (typeof define === "function" && define.amd) {
        define("moment", function (require, exports, module) {
            if (module.config && module.config() && module.config().noGlobal === true) {
                // release the global variable
                globalScope.moment = oldGlobalMoment;
            }

            return moment;
        });
        makeGlobal(true);
    } else {
        makeGlobal();
    }
}).call(this);

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],41:[function(require,module,exports){
/*globals Backbone, sinon, describe, it, runs, spyOn, expect, waitsFor,
    beforeEach, afterEach, before, after*/
var assert = require('chai').assert;
var fixtures = require('../fixtures');
var Config = require('models/config');
var TakenCollection = require('collections/availability');

describe('collections/taken', function(){
  it('exists', function(){
    assert.isDefined( TakenCollection );
  });

  describe('initialize', function(){
    it('should throw without a config model', function(){
      assert.throws(function(){
        new TakenCollection([], {});
      }, /You must pass a config model/);
    });
  });

  describe('url', function(){
    it('should assemble a well-formed querystring from config data', function(){
      var config = new Config();
      var taken = new TakenCollection([], { config: config });
      assert.equal(taken.url(), '/api/freebusy?calendars=[sam%40quickleft.com]&timeMin=2013-05-12T00%3A00%3A00-06%3A00&timeMax=2013-05-20T00%3A00%3A00-06%3A00');
    });
  });
});



},{"../fixtures":42,"chai":8,"collections/availability":44,"models/config":45}],42:[function(require,module,exports){
exports.configData = {
  "start": "10am",
  "end": "6pm",
  "minDuration": 30,
  "timezone": "America/Denver",
  "ignoreWeekend": true,
  "calendars": [
    "sam@quickleft.com"
  ],
  "timeMin": "14 June, 2014",
  "timeMax": "14 June, 2014"
};

exports.availabilityData = [
  {
    "start": "2013-05-06T15:30:00Z",
    "end": "2013-05-06T16:45:00Z"
  },
  {
    "start": "2013-05-06T17:00:00Z",
    "end": "2013-05-06T18:00:00Z"
  },
  {
    "start": "2013-05-06T22:00:00Z",
    "end": "2013-05-06T23:00:00Z"
  },
  {
    "start": "2013-05-07T00:00:00Z",
    "end": "2013-05-07T01:00:00Z"
  },
  {
    "start": "2013-05-07T15:00:00Z",
    "end": "2013-05-07T16:00:00Z"
  },
  {
    "start": "2013-05-07T18:00:00Z",
    "end": "2013-05-07T19:00:00Z"
  },
  {
    "start": "2013-05-08T15:30:00Z",
    "end": "2013-05-08T18:00:00Z"
  },
  {
    "start": "2013-05-08T19:00:00Z",
    "end": "2013-05-08T20:00:00Z"
  },
  {
    "start": "2013-05-08T22:00:00Z",
    "end": "2013-05-08T23:00:00Z"
  },
  {
    "start": "2013-05-09T15:30:00Z",
    "end": "2013-05-09T16:30:00Z"
  },
  {
    "start": "2013-05-10T16:00:00Z",
    "end": "2013-05-10T16:30:00Z"
  },
  {
    "start": "2013-05-10T17:00:00Z",
    "end": "2013-05-10T18:00:00Z"
  },
  {
    "start": "2013-05-10T20:00:00Z",
    "end": "2013-05-10T21:30:00Z"
  }
];

exports.singleDayAvailability= [
  {
    "start": "2013-05-06T15:30:00Z",
    "end": "2013-05-06T16:45:00Z"
  },
  {
    "start": "2013-05-06T17:00:00Z",
    "end": "2013-05-06T18:00:00Z"
  },
  {
    "start": "2013-05-06T22:00:00Z",
    "end": "2013-05-06T23:00:00Z"
  },
  {
    "start": "2013-05-07T00:00:00Z",
    "end": "2013-05-07T01:00:00Z"
  }
];


exports.userData = {
  "id": "108809895309028249408",
  "email": "sam@quickleft.com",
  "verified_email": true,
  "name": "Samuel Breed",
  "given_name": "Samuel",
  "family_name": "Breed",
  "link": "https://plus.google.com/108809895309028249408",
  "picture": "https://lh4.googleusercontent.com/-q_eJOQjuaM4/AAAAAAAAAAI/AAAAAAAAABE/UB6OIPpqEr8/photo.jpg",
  "gender": "male",
  "locale": "en",
  "hd": "quickleft.com"
};

},{}],43:[function(require,module,exports){
require('./collections/taken-spec');

if (window.mochaPhantomJS) {
  window.mochaPhantomJS.run();
} else {
  window.mocha.run();
}

},{"./collections/taken-spec":41}],44:[function(require,module,exports){
var $ = require('jquery');
var _ = require('lodash');
var Backbone = require('backdash');
var mixins = require('../lib/mixins');
var moment = require('moment-timezone')
var tzData = require('../lib/timezone-data');

module.exports = Backbone.Collection.extend({

  DATE_FORMAT: 'YYYY-MM-DD',

  initialize: function(models, params) {
    if (!params.config) {
      throw new Error('You must pass a config model');
    }
    this.config = params.config;

    this.once('sync', function(){
      this.loaded = true;
    }, this);

    this.config.on('change:calendars change:timeMax change:timeMin', function(model) {
      if (model.get('timeMax') && model.get('timeMin') && model.get('calendars')) {
        this.fetch(model.get('options') || {});
      }
    }, this);
  },

  url: function() {
    var min = this.moment(this.config.get('timeMin')).format();
    var max = this.moment(this.config.get('timeMax')).add('days', 1).format();

    var query = $.param({
      calendars: this.config.get('calendars'),
      timeMin: min,
      timeMax: max
    });

    return '/api/freebusy?' + query;
  },

  parse: function(obj) {
    return _.map(obj.calendars, function(data, name){
      return { id: name, freebusy: data.busy };
    });
  },

  // Removes any free time that is shorter than the minimum meeting duration
  pruneShortMeetings: function(dayblocks) {
    var minDuration = parseInt(this.config.get('minDuration'), 10);

    return _.map(dayblocks, function(times){
      return _.reject(times, function(time){
        return (moment.duration(time[1] - time[0]).as('minutes') < minDuration);
      });
    });
  },

  // Returns a presented dayblock in the form ['Monday 6/66, 1 -2pm', ...]
  presentDayblocks: function(dayblocks) {
    return _.map(_.flatten(this.pruneShortMeetings(dayblocks), true), this.createTimestring);
  },

  // Returns a merged array of "busy" times, for combining multiple calendars
  mergeSort: function(times) {
    times = times.sort(function(a, b) {
      var aStart = moment(a.start);
      var bStart = moment(b.start);

      if (aStart.isSame(bStart)) {
        return moment(a.end) - moment(b.end);
      } else {
        return aStart - bStart
      }
    })

    var stack = [];
    stack.push(times.shift());
    _.each(times, function(interval){
      var last = _.last(stack);

      if (moment(interval.start).isAfter(moment(last.end))) {
        return stack.push(interval);
      }

      if (moment(interval.end).isAfter(moment(last.end))) {
        last.end = interval.end
      }
    });

    return stack;
  },

  // Interface for generating and array of availabile times
  getAvailableTimes: function(blacklist) {
    if (this.length === 0) {
      return [];
    }

    var days, dayblocks;
    var calendars = this.config.get('calendars');

    if (calendars.length === 1) {
      days = this.getDays(calendars[0]);
      dayblocks = _.map(days, this.getAvailabilityFromDay, this);
    } else {
      days = this.getAllDays(calendars);
      dayblocks = _.map(days, function(times, date){
        if (times.length === 0) {
          return [];
        }
        var timeblock = this.mergeSort(times);
        return this.getAvailabilityFromDay(timeblock, date);
      }, this);
    }

    var timeblock = this.presentDayblocks(dayblocks);

    // You jerk
    if (timeblock.length === 0) {
      timeblock = [
        "You're completely free!", "Good for you."
      ];
    }

    return _.difference(timeblock, blacklist || []);
  },

  // Merges all calendars into the `getDays` format
  getAllDays: function(calendars) {
    return _.reduce(calendars, function(result, id) {
      return _.merge(result, this.getDays(id), function(a, b) {
        return _.isArray(a) ? a.concat(b) : undefined;
      })
    }, {}, this);
  },

  // Creates an Object that takes the form
  //
  // {
  //   2013-01-01: [ (Freebusy Model) ]
  // }
  //
  // Ranging from the configured time range
  getDays: function(id) {
    var model = this.get(id);
    var events = _.groupBy(model.get('freebusy'), function(meeting) {
      return this.moment(meeting.start).format(this.DATE_FORMAT);
    }, this);

    var allDays = {};
    var weekend = [];
    var start = this.moment(this.config.get('timeMin'));
    var end = this.moment(this.config.get('timeMax'));

    _.times(moment.duration(end - start).days(), function(i) {
      var date = start.clone().add('d', i);
      var dayIndex = +date.format('d');
      var dateKey = date.format(this.DATE_FORMAT);
      if (dayIndex === 0 || dayIndex === 6) {
        weekend.push(dateKey);
      }
      allDays[dateKey] = [];
    }, this);

    if (this.config.get('ignoreWeekend')) {
      allDays = _.omit(allDays, weekend);
      events = _.omit(events, weekend);
    }

    return _.merge(allDays, events);
  },

  // Creates a timestring in the form: "Monday, 1/23 - 4 to 6pm"
  createTimestring: mixins.createTimestring,

  // Returns a Moment object with the correct timezone offset.
  moment: function(date) {
    var timezone = this.config.get('timezone');
    return moment(date).tz(timezone);
  },

  // Takes an array of Models for a given date and determines the availabilty
  //
  //  times - an array of Models with start and end times
  //  date  - the current date
  //
  // returns an array of available times
  getAvailabilityFromDay: function(times, date) {
    var dayblock = [];
    // Set the beginning and end of the Day from the user settings
    var startTime = moment(this.config.get('start'), 'hha').hours();
    var endTime = moment(this.config.get('end'), 'hha').hours();
    // Set the Beginning and the End of the current day
    var dayStart = this.moment(moment(date).hour(startTime));
    var dayEnd = this.moment(moment(date).hour(endTime));

    function addToDayblock(start, end) {
      dayblock.push([start, end]);
    }

    // if this is an empty day, return early
    if (times.length === 0) {
      addToDayblock(dayStart, dayEnd);
      return dayblock;
    }

    // Remove the First and Last time entry from the times array
    var first = times.shift();
    var last = times.pop();
    // Set the start and end times for the first meeting, if it exists
    var firstMeetingStart = first ? this.moment(first.start) : false;
    var firstMeetingEnd = first ? this.moment(first.end) : false;
    // Set the start and end times for the last meeting, if it exists
    var lastMeetingStart = last ? this.moment(last.start) : false;
    var lastMeetingEnd = last ? this.moment(last.end) : false;
    // The next available meeting time is always the end of the first meeting
    var nextAvailableStart = firstMeetingEnd;

    // If anything is on the calendar for that day and there's any free time
    // before it, add it to the dayblock
    if (firstMeetingStart &&
      firstMeetingStart !== dayStart &&
      firstMeetingStart.isAfter(dayStart)) {
      addToDayblock(dayStart, firstMeetingStart);
    }

    // If you have an all day event scheduled, it usually ends *after* the
    // end of the current day
    if (firstMeetingStart &&
      firstMeetingEnd.isAfter(dayEnd) && times.length === 0) {
      return []; // This will disappear into nothing when _.flatten'ed
    }

    if (firstMeetingEnd && firstMeetingEnd.isBefore(dayStart)) {
      nextAvailableStart = dayStart;
    }

    // Iterate through the "middle" times and add timestrings for the time
    // between the meetings
    _.each(times, function(timeEntry, i) {
      var meetingEnd = this.moment(timeEntry.start);

      // Handle empty start times, and same start & end times
      if (!nextAvailableStart || meetingEnd.isSame(nextAvailableStart)) {
        nextAvailableStart = this.moment(timeEntry.end);
        return;
      }

      if (meetingEnd.isSame(dayStart) || meetingEnd.isBefore(dayStart)) {
        return;
      }

      // Create a timestring (Monday 1/1 1 - 2pm) and add it to the list
      addToDayblock(nextAvailableStart, meetingEnd);
      // Set the next availability period's start time
      nextAvailableStart = this.moment(timeEntry.end);
    }, this);

    if (nextAvailableStart && nextAvailableStart.isSame(dayStart) && _.last(times)) {
      nextAvailableStart = this.moment(_.last(times).end);
    }

    // If there were meetings today, *and* a last meeting of the day, create
    // a timestring
    if (nextAvailableStart && lastMeetingStart) {
      if (!nextAvailableStart.isSame(lastMeetingStart)) {
        addToDayblock(nextAvailableStart, lastMeetingStart);
      }

      // If the end of the last meeting is before the end of the day, create
      // a timestring
      if (lastMeetingEnd.isBefore(dayEnd)) {
        addToDayblock(lastMeetingEnd, dayEnd);
      }
    }

    // And if there's no last meeting, create a timestring from the end of
    // the last timeslot to the dayblock
    if (!lastMeetingStart) {
      addToDayblock(nextAvailableStart, dayEnd);
    }

    return dayblock;
  }
});

},{"../lib/mixins":2,"../lib/timezone-data":3,"backdash":4,"jquery":35,"lodash":36,"moment-timezone":37}],45:[function(require,module,exports){
var Backbone = require('backdash');
var moment = require('moment');
var jstz = require('../lib/jstz').jstz;

function getFormat() {
  if (window.Intl === undefined || window.Intl.DateTimeFormat === undefined) {
    return;
  }

  var format = window.Intl.DateTimeFormat();

  if (format === undefined || format.resolvedOptions === undefined) {
    return
  }

  return format.resolvedOptions().timeZone;
}

module.exports = Backbone.Model.extend({

  constructor: function(attrs, options) {
    this.user = options.user;
    Backbone.Model.apply(this, arguments);
  },

  defaults: function() {
    return {
      timeMin: moment().format(),
      timeMax: moment().endOf('week').format(),
      start: '10am',
      end: '6pm',
      minDuration: 30,
      timezone: getFormat() || jstz.determine().name(),
      ignoreWeekend: true,
      calendars: [this.user.get('email')]
    };
  }
});

},{"../lib/jstz":1,"backdash":4,"moment":40}]},{},[43])