/*****************************************************************************
 *
 *  "Pure" vocabulary - with focus on mobile devices.
 *
 *  Copyright (c) 2012 Raphael Kuchta
 *
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along
 *  with this program; if not, write to the Free Software Foundation, Inc.,
 *  51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 *****************************************************************************
 *
 *  Functionality: It loads vocables from a csv file or directly from the
 *  MySQL DB (with the help of some PHP scripts) and stores
 *  them in a local SQLite DB (to minimize server load and have a better
 *  reaction time)
 *  For the reason that the Firefox web browser is not (and probably 
 *  never will be) supporting local databases like SQLite, the queries 
 *  have to be done with PHP scripts directly on the server in this case.
 *
 *  File:   pure.js                     Date:     2011-05-17
 *  Author: Raphael Kuchta              Version:  12.01.17
 *
 *
 *  TODO: Rebuild the process of loading data for the offline database.
 *        Instead of the csv file, the data should be loaded directly from 
 *        the server, and the user should see the load progress 
 *        (percentage, not only the simple ajax-loader gif).
 *  
 *        Implement an offline database (for Forefox and other browsers 
 *        without SQLite support) with localStorage and a special form 
 *        of a key-value storage.
 *  
 *****************************************************************************/
 

/** simple string trim function */
String.prototype.trim = function(){   
  return this.replace(/(^\s*)|(\s*$)/g, '');
};


/**
 *  Basic DataBase "class".
 *  It needs to be extended by other classes that implement
 *  at least the "search" method.
 */
function DataBase() {
  this.sDbLang1 = "english";            // db name for first language
  this.sDbLang2 = "german";             // db name for second language
  this.iSqlLimit = 10;                  // default sql query limit

  this.iSqlOffset = 0;                  // offset for fetching new results (for SQL LIMIT)
  this.sLastSearchTerm = "";            // users last search term (needed to get more results)
  this.iTotalResults = 0;               // total possible results for last query

  this.sDisplayLang1 = "English";       // written name for first language
  this.sDisplayLang2 = "Deutsch";       // written name for second language
  
  /**
   *  Perform a new search.
   *  The search term will be extracted from the search field
   *  and passed to the appropriate search method
   *  (what depents on the "class" which extends this "class").
   */
  this.searchNew = function() {
    // get search term from input field
    var sSearchTerm = $("#search_term").val().trim();
    
    if(sSearchTerm.length == 0)
    {
      alert("Bitte einen Suchbegriff eingeben.");
      return false;
    }
    // overwrite last search term value with actual search term
    this.sLastSearchTerm = sSearchTerm;
    // overwrite query limit offset (this is a new search)
    this.iSqlOffset = 0;
    
    // clear result area
    $("#results").empty();
    // hide 'load more' botton
    $("#load_more_button").hide();
    
    this.search(sSearchTerm);
  };
  
  /**
   *  Load more results.
   *  Basically only the offset is updated, the 
   *  'load more' button is (temporary) hidden
   *  and the search is performed again (with new offset).
   */
  this.loadMore = function() {
    // increment offset 
    this.iSqlOffset += this.iSqlLimit;
    
    // hide 'load more' botton
    $("#load_more_button").hide();
      
    // perform a search with new offset
    this.search(this.sLastSearchTerm);
  };
  
  /**
   *  Check if there are more results that could be displayed.
   *  If so, show the 'load more' button again.
   */
  this.showLoadMoreButton = function() {
    // show the "load more" button only if there are more results to show
    if(this.iTotalResults > (this.iSqlLimit + this.iSqlOffset)) {
      $("#load_more_button").show();
    }
  };
  
  /**
   *  Print / render the header of the result list.
   *  (Only on a new search, not if more results got loaded and displayed.)
   */
  this.printResultHeader = function() {
    // only print header on new search
    if(this.iSqlOffset != 0)
      return;
  // print result header
  $("#results").append('<br /><div class="ui-grid-a"><div class="ui-block-a"><h1>' 
    + this.sDisplayLang1 + ' </h1></div><div class="ui-block-b"><span class="text_right"><h1>' 
    + this.sDisplayLang2 + '</h1></span></div></div>');
  };
}


/**
 *  Online database "class" using PHP and MySQL DB.
 *  Extends the basic DataBase "class".
 */
function OnlineDataBase() {
  // this ivar can be used to check if we are in online or offline mode
  this.offline = false;
  
  /**
   *  This search method performs an online search and outputs the results.
   *  The total number of results is determined on the server and passed with the return code.
   *  (return code > 0: number of results; return code <= 0: error)
   *  The total number of possible results is used to show or hide the 
   *  'load more' button to load more content if desired.
   */
  this.search = function(sSearchTerm) {
    // save reference to this object
    var thisObj = this;
    
    $.post("db_query.php", {"db_lang_1": this.sDbLang1, "db_lang_2": this.sDbLang2, 
      "search_term": sSearchTerm, "sql_offset": this.iSqlOffset, "sql_limit": this.iSqlLimit}, 
      function(data) {
        if(!data) {
          // db or server error!
          alert("Es trat ein Problem auf. Bitte später erneut versuchen.");
          return;
        }
      
        // if the object has only one property it contains only the return code.
        // (else the return code is followed by result data, and has to be shifted
        //  before the data gets processed!)
        if(Object.keys(data).length == 1) {
          
          if(data.code == -1) {
            // db error
            alert("Es trat ein Problem mit der Datenbank auf. Bitte später erneut versuchen.");
            return;
          }
          else if(data.code == 0) {
            // no result
            alert("Leider keinen passenden Eintrag gefunden.");
            return;
          }
        }
        // okay: returnCode.code > 0
        // the return code contains the total numer of possible results,
        // and needs to be extracted first before the results can be processed.
        var returnCode = data.shift();
        
        // print result header
        thisObj.printResultHeader();
        
        // print the results
        var resultString = '<div class="ui-grid-a">';
        for(var i = 0; i < data.length; i++) {
          if(i % 2) {
            resultString += '<div class="ui-block-a other_list_color">' 
              + data[i].sDbLang1 + '</div><div class="ui-block-b text_right other_list_color">' 
              + data[i].sDbLang2 + '</div>';					
          }
          else {
            resultString += '<div class="ui-block-a">' + data[i].sDbLang1 
              + '</div><div class="ui-block-b text_right">' + data[i].sDbLang2 + '</div>';					
          }
        }
        resultString += '</div>';
        $("#results").append(resultString);
        
        // save the total number of possible results
        thisObj.iTotalResults = returnCode.code;
        // show the 'load more' button (if possible)
        thisObj.showLoadMoreButton();
      }, "json"
    );
  };
}
// = OnlineDataBase extends DataBase
OnlineDataBase.prototype = new DataBase;

/**
 *  Offline database "class" using local SQLite DB.
 *  Extends the basic DataBase "class".
 */
function OfflineDataBase() {
  // this ivar can be used to check if we are in online or offline mode
  this.offline = true;
  var db;                               // reference to the db object (private)
  
  this.shortName = 'pure db';
  this.version = '1.0';
  this.displayName = 'pure vocabulary';
  this.maxSize = 5 * 1024 * 1024;
  
  /**
   *  This search method uses an offline SQLite database and performs a search, 
   *  outputs the results and determines the total number of possible results 
   *  (for the possibility to load more content if desired).
   *
   *  @param: sSearchTerm   The search term
   */
  this.search = function(sSearchTerm) {
    // save reference to this object
    var thisObj = this;
  
    db.transaction( function(tx) {
      tx.executeSql(
        'SELECT * FROM vocabulary WHERE (' + thisObj.sDbLang1 + ' LIKE ?) OR (' 
          + thisObj.sDbLang2 + ' LIKE ?) LIMIT ' + thisObj.iSqlOffset + ', ' + thisObj.iSqlLimit, ['%' 
          + sSearchTerm + '%', '%' + sSearchTerm + '%'],
        function(tx, result) {
          if(result.rows.length != 0) {
            // print result header
            thisObj.printResultHeader();
            
            // result content
            var resultString = '<div class="ui-grid-a">';
            for(var i = 0; i < result.rows.length; i++) {
              // paint the list in two alternating colors
              if(i%2) {
                resultString += '<div class="ui-block-a other_list_color">' 
                  + result.rows.item(i)[thisObj.sDbLang1] + '</div><div class="ui-block-b text_right other_list_color">' 
                  + result.rows.item(i)[thisObj.sDbLang2] + '</div>';					
              }
              else {
                resultString += '<div class="ui-block-a">' + result.rows.item(i)[thisObj.sDbLang1] 
                  + '</div><div class="ui-block-b text_right">' + result.rows.item(i)[thisObj.sDbLang2] + '</div>';					
              }
            }
            resultString += "</div>";
            $("#results").append(resultString);
            
            // determine total possible results
            tx.executeSql(
              'SELECT COUNT(*) AS num FROM vocabulary WHERE (' + thisObj.sDbLang1 
                + ' LIKE ?) OR (' + thisObj.sDbLang2 + ' LIKE ?)', ['%' + sSearchTerm + '%', '%' + sSearchTerm + '%'],
              function(tx, result) {
                if(result.rows.length != 0) {
                  // save the total number of results
                  thisObj.iTotalResults = result.rows.item(0)['num'];
                  
                  // show the 'load more' button (if possible)
                  thisObj.showLoadMoreButton();
                }
              }
            );
          }
          else {
            alert("Leider keinen passenden Eintrag gefunden.");
          }
        }
      );
    });
  };
  
  /**
   *  Load the vocabulary and init the database 
   *
   *  @param: bRebuild: Rebuild the complete database? [true = yes]
   */
  this.initDB = function (bRebuild) {
    // save reference to this object
    var thisObj = this;
    
    db = openDatabase(this.shortName, this.version, this.displayName, this.maxSize);
    db.transaction( function(tx) {
    
      // drop old db table and rebuild it
      if(bRebuild == true) {
        tx.executeSql('DROP TABLE IF EXISTS vocabulary');
      }
      
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS vocabulary ' +
        ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
        thisObj.sDbLang1 + ' VARCHAR NOT NULL, ' + thisObj.sDbLang2 + ' VARCHAR NOT NULL );'
      );

      tx.executeSql(
        // try to select one element from the db (to test if data already exists)
        'SELECT * FROM vocabulary LIMIT 1', [], 
        function(tx, result) {
          // insert only data to the DB if it is empty
          if(result.rows.length == 0) {
            // show ajax loader gif
            $("body").append('<div id="load"></div>');
            $("#load").fadeIn('fast');
            // call the load function in external js
            // that loads the vocables from a csv file
            thisObj.data2table(db, thisObj.sDbLang1, thisObj.sDbLang2);
            
            // hide ajax loader
            $("#load").fadeOut('fast');
            $("body").remove("#load");
          }
        }
      );
    });
  };

  /**
   *  Import data from a csv file to a local SQLite database.
   */
  this.data2table = function () {
    // reference to the this object
    var thisObj = this;
    // csv configuration
    var cLineSeperator = "#";
    var cFieldSeperator = ",";
    var sCsvFile = "voka.csv";
  
    // import raw data from csv file
    $.post(sCsvFile, function(data) {
      var aLines = data.split(cLineSeperator);
      db.transaction( function(tx) {
        for(var i = 0, iLength = aLines.length - 1; i < iLength; i++) {
          var aWords = aLines[i].split(cFieldSeperator);
          tx.executeSql(
            'INSERT INTO vocabulary (' + thisObj.sDbLang1 + ', ' + thisObj.sDbLang2 + ') VALUES (?, ?);',
            [aWords[0], aWords[1]]
          );
        }
      });
    });
  };
}
// OfflineDataBase extends DataBase
OfflineDataBase.prototype = new DataBase;


/** document ready function */
$(document).ready( function() {

  // the DB object
  var database;
  // Check if this browser supports offline databases with SQLite.
  // If not, use PHP and an online MySQL database.
  if(!window.openDatabase) {
    database = new OnlineDataBase();
  }
  else {
    database = new OfflineDataBase();
    // init the offline DB
    database.initDB(false);
  }
  
  if(!database.offline) {
    $("#recreate_db").hide();
  }
	
	// recreate the database (only offline)
  $("#recreate_db").click( function() {
      database.initDB(true);
  });

  // search functionality
  $('#search_form').submit( function() {
    database.searchNew();
    return false;
  });
  
  // load more results for previous search
  $("#load_more").click( function() {
    database.loadMore();
  });
});
