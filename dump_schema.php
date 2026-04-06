<?php
require_once __DIR__ . '/php/config/database.php';
$db = getDb();
$res = $db->fetchOne("SHOW CREATE TABLE se_clients");
file_put_contents('se_clients_schema.txt', $res['Create Table'] ?? 'Error');
$res2 = $db->fetchOne("SHOW CREATE TABLE se_assignments");
file_put_contents('se_assignments_schema.txt', $res2['Create Table'] ?? 'Error');
echo "Done\n";
