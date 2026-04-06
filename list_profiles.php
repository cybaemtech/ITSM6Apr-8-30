<?php
require_once __DIR__ . '/php/config/database.php';
try {
    $db = getDb();
    $profiles = $db->fetchAll("SELECT email, full_name, role FROM se_profiles");
    echo json_encode($profiles, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
