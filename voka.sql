-- phpMyAdmin SQL Dump
-- version 3.3.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Oct 23, 2010 at 04:17 PM
-- Server version: 5.1.46
-- PHP Version: 5.2.13

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `voka`
--

-- --------------------------------------------------------

--
-- Table structure for table `voka`
--

CREATE TABLE IF NOT EXISTS `voka` (
  `vid` int(11) NOT NULL AUTO_INCREMENT,
  `cid` int(11) NOT NULL,
  `english` varchar(40) CHARACTER SET utf8 NOT NULL,
  `german` varchar(40) CHARACTER SET utf8 NOT NULL,
  `france` varchar(40) CHARACTER SET utf8 NOT NULL,
  PRIMARY KEY (`vid`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=35 ;

--
-- Dumping data for table `voka`
--

INSERT INTO `voka` (`vid`, `cid`, `english`, `german`, `france`) VALUES
(1, 1, 'pear', 'birne', 'poire'),
(2, 2, 'blackberry', 'Blaubeere', 'myrtille'),
(5, 1, 'apple', 'Apfel', 'pomme'),
(9, 1, 'hello', 'hallo', 'salut'),
(10, 1, 'Germany', 'Deutschland', 'Allemagne'),
(11, 1, 'new', 'neu', 'neuf'),
(12, 2, 'strawberry', 'Erdbeere', 'fraise'),
(13, 1, 'table', 'tisch', 'table'),
(14, 4, 'desk', 'Schreibtisch', 'bureau'),
(15, 1, 'calculator', 'Taschenrechner', 'calculatrice'),
(16, 1, 'paper', 'Papier', 'papier'),
(17, 1, 'pencil', 'Bleistift', 'crayon'),
(18, 1, 'to paint', 'malen', 'faire'),
(19, 1, 'office', 'Büro', 'bureau'),
(20, 1, 'school', 'Schule', 'école'),
(21, 1, 'leaf', 'Blatt', 'feuille'),
(22, 1, 'tree', 'Baum', 'arbre'),
(23, 1, 'language', 'Sprache', 'langue'),
(24, 1, 'mouth', 'Mund', 'bouche'),
(25, 1, 'sun', 'Sonne', 'soleil'),
(26, 1, 'moon', 'Mond', 'lune'),
(27, 3, 'fish', 'Fisch', 'poisson'),
(28, 1, 'England', 'England', 'Angleterre'),
(29, 1, 'France', 'Frankreich', 'France'),
(30, 1, 'child', 'Kind', 'enfant'),
(31, 1, 'island', 'Insel', 'île'),
(32, 1, 'bread', 'Brot', 'pain'),
(33, 1, 'desert', 'Wüste', 'désert');
