<?php
require_once __DIR__ . '/php/config/database.php';
$db = getDb();
$data = $db->fetchAll("SELECT * FROM se_assignments");
file_put_contents('se_assignments_dump.json', json_encode($data, JSON_PRETTY_PRINT));
echo "Dumped " . count($data) . " assignments\n";
