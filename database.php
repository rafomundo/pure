<?php
/*****************************************************************************
 *
 *  Database class for connecting to, and disconnecting from the database.
 *
 *  Copyright (c) 2012 Raphael Kuchta
 *
 *	
 *  File:   database.php                Date:     2012-01-16
 *  Author: Raphael Kuchta              Version:  12.01.16
 *
 *****************************************************************************/
 
class DataBase {
  // the link var stores the database connection object
  private $oLink;
  // database parameters
  private $sHost;
  private $sUser;
  private $sPasswd;
  private $sDatabase;
  
  /**
   *  Default class constructor
   *  
   *  @param: $sHost      The db server host
   *  @param: $sUser      The db user name
   *  @param: $sPasswd    The db users password
   *  @param: $sDatabase  The database that should be selected
   */
  public function __construct($sHost, $sUser, $sPasswd, $sDatabase) {
    $this->oLink = NULL;
    $this->sHost = $sHost;
    $this->sUser = $sUser;
    $this->sPasswd = $sPasswd;
    $this->sDatabase = $sDatabase;
  }
  
  /**
   *  Default class destructor
   */
  public function __destruct() {
    // close the db connection
    //$this->disconnect();
  }
  
  /**
   *  Connect to the predefined database server and select the desired database
   *
   *  @return:  TRUE if successfull, else FALSE
   */
  public function connect() {
    // connect to the mysql-server
    $this->oLink = mysql_connect($this->sHost, $this->sUser, $this->sPasswd);
    if($this->oLink)
    {
      // select the database
      $selected_db = mysql_select_db($this->sDatabase, $this->oLink);
      if($selected_db)
        return true;
    }
    return false;
  }

  /**
   *  Disconnect from the database
   */
  public function disconnect() {
    // close the connection (if it is active)
    if($this->oLink != NULL)
      mysql_close($this->oLink);
  }
  
  /**
   *  Execute mysql queries.
   *  The query string has to be secured before passing to this function!
   *
   *  @param: $sQuery   The query string
   *
   *  @return:          The result resource
   */
  public function query($sQuery) {
    return mysql_query($sQuery);
  }
  
  /**
   *  Returns last mysql error.
   *
   *  @return:          Last mysql error
   */
  public function getLastError() {
    return mysql_error();
  }
}
?>