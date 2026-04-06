<?php
require_once __DIR__ . '/php/config/database.php';
require_once __DIR__ . '/php/lib/mailer.php';

$res = send_mail('rohan@cybaemtech.com', 'Rohan Bhosale', 'System Notification Test', 'This is a test to verify if the mailing system is working after updates.');
echo json_encode($res, JSON_PRETTY_PRINT);
