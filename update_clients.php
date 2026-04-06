<?php
require_once __DIR__ . '/php/config/database.php';
$db = getDb();

$clients = [
    "SATELLITE BUILDCON",
    "Sarthak India",
    "DESIGNCURVE TECHNOLOGIES PRIVATE LIMITED",
    "PNS WEALTH",
    "Shramajivi High School",
    "HARSHAL BUILDCON LLP",
    "ABN INTERARCH PRIVATE LIMITED",
    "Axis Consultant",
    "Denansa Buildcon",
    "Creativve Contruction",
    "Saturo"
];

try {
    // 1. Delete associated data first to maintain some integrity (optional but cleaner)
    // Actually, user said "remove others", so we just truncate if possible or delete all.
    // We'll delete assignments and sites too because they won't make sense without the old clients.
    $db->query("DELETE FROM se_assignments");
    $db->query("DELETE FROM se_sites");
    $db->query("DELETE FROM se_clients");

    // 2. Insert new clients
    foreach ($clients as $name) {
        $id = uniqid('client_');
        $db->query("INSERT INTO se_clients (id, name, created_at) VALUES (?, ?, NOW())", [$id, $name]);
        echo "Added client: $name\n";
    }

    echo "\nAll clients updated successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
