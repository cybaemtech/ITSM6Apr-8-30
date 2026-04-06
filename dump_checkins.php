<?php
require_once __DIR__ . '/php/config/database.php';
$db = getDb();
$data = $db->fetchAll("SELECT * FROM se_check_ins ORDER BY created_at DESC LIMIT 50");
file_put_contents('se_checkins_dump.json', json_encode($data, JSON_PRETTY_PRINT));
echo "Dumped " . count($data) . " records to se_checkins_dump.json\n";
