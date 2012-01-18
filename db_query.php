<?php
/*****************************************************************************
 * 
 *  Perform db queries for browsers with no SQLite support
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
 *  File:   db_query.php                Date:     2012-01-16
 *  Author: Raphael Kuchta              Version:  12.01.16
 *
 *****************************************************************************/

include_once "db_config.php";
include_once "database.php";

// first check if all parameters are set (else we have no need to proceed)
if(isset($_POST['db_lang_1'], $_POST['db_lang_2'], $_POST['sql_limit'], 
         $_POST['search_term'], $_POST['sql_offset'])) {
  
  // exit if the limit parameter is not numeric (possible sql injection)
  if(!is_numeric($_POST['sql_limit']) || !is_numeric($_POST['sql_offset'])) {
    $aReturnCode = Array("code" => -1);
    echo json_encode($aReturnCode);
    return;
  }
  $sSqlLimit = intval($_POST['sql_limit'], 10);
  $sSqlOffset = intval($_POST['sql_offset'], 10);
  
  // get new db object
  // (the parameters are stored in the db_config.php file)
  $oDB = new DataBase($sHost, $sDbUser, $sDbPasswd, $sDatabase);

  $oDB->connect();  
  // escape the search term
  $sSearchTerm = mysql_real_escape_string($_POST['search_term']);
  // extend the search term
  $sSearchTerm = '%' . $sSearchTerm . '%';
  
  // escape the db field names of the both languages
  $sDbLang1 = mysql_real_escape_string($_POST['db_lang_1']);
  $sDbLang2 = mysql_real_escape_string($_POST['db_lang_2']);
  
  // now build the query
  $sQuery = sprintf("SELECT %s, %s FROM voka WHERE %s LIKE '%s' OR %s LIKE '%s' LIMIT %d, %d", 
                    $sDbLang1, $sDbLang2,
                    $sDbLang1, $sSearchTerm,
                    $sDbLang2, $sSearchTerm,
                    $sSqlOffset, $sSqlLimit);
      
  $oResult = $oDB->query($sQuery);
  $oDB->disconnect();
  
  if(!$oResult) {
    //echo "DB error: " . $oDB->getLastError();
    $aReturnCode = Array("code" => -1);
    echo json_encode($aReturnCode);
    return;
  }
  if(mysql_num_rows($oResult) == 0) {
    //echo "No result: ". $oDB->getLastError();
    $aReturnCode = Array("code" => 0);
    echo json_encode($aReturnCode);
    return;
  }
  
  // determine total number of possible results
  $oDB->connect();
  $sQueryTotalNum = sprintf("SELECT COUNT(*) AS total_num FROM voka WHERE %s LIKE '%s' OR %s LIKE '%s'",
                    $sDbLang1, $sSearchTerm,
                    $sDbLang2, $sSearchTerm);
  $oResultTotalNum = $oDB->query($sQueryTotalNum);
  $oDB->disconnect();
  
  if(!$oResultTotalNum) {
    //echo "DB error: " . $oDB->getLastError();
    $aReturnCode = Array("code" => -1);
    echo json_encode($aReturnCode);
    return;
  }
  if(mysql_num_rows($oResultTotalNum) == 0) {
    //echo "No result: ". $oDB->getLastError();
    $aReturnCode = Array("code" => 0);
    echo json_encode($aReturnCode);
    return;
  }
  
  $aResults = Array();
  // add first the return code
  // a returnCode > 0 is the number of total possible oResult rows
  $row = mysql_fetch_assoc($oResultTotalNum);
  $aResults[] = Array("code" => $row['total_num']);
  
  while($row = mysql_fetch_assoc($oResult))
  {
    // build an array with db query results
    $aResults[] = Array("sDbLang1" => $row[$sDbLang1], "sDbLang2" => $row[$sDbLang2]);
  }
  // return the json encoded array back to the javascript
  echo json_encode($aResults);
}
else {
  // wrong parameters -> network problem, or possible "penetration test"
  $aReturnCode = Array("code" => -1);
  echo json_encode($aReturnCode);
  return;
}

?>