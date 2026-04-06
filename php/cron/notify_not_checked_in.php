<?php
/**
 * Cron script to notify Admin & HR about engineers who haven't checked in today.
 * Suggested run time: 10:30 AM daily.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/mailer.php';

$db = getDb();
$today = date('Y-m-d');

// 1. Get all active engineers
$engineers = $db->fetchAll("SELECT id, full_name, email FROM se_profiles WHERE role = 'engineer'");

// 2. Get today's check-ins
$checkIns = $db->fetchAll("SELECT engineer_id FROM se_check_ins WHERE date = ?", [$today]);
$checkedInIds = array_column($checkIns, 'engineer_id');

// 3. Find who hasn't checked in
$notCheckedIn = [];
foreach ($engineers as $eng) {
    if (!in_array($eng['id'], $checkedInIds)) {
        $notCheckedIn[] = $eng;
    }
}

if (empty($notCheckedIn)) {
    echo "All engineers have checked in today.\n";
    exit;
}

// 4. Prepare email
$subject = "MISSING CHECK-IN ALERT: " . count($notCheckedIn) . " Engineers (" . $today . ")";
$body = "<h2>Engineers who haven't checked in today</h2>
         <p>Date: {$today}</p>
         <ul>";

foreach ($notCheckedIn as $eng) {
    $body .= "<li><b>{$eng['full_name']}</b> ({$eng['email']})</li>";
}
$body .= "</ul>
         <p>Please check with them if they are on site or on unannounced leave.</p>";

// 5. Send to Admin & HR
$recipients = $db->fetchAll("SELECT email, full_name FROM se_profiles WHERE role IN ('admin', 'hr')");

foreach ($recipients as $r) {
    $res = send_mail($r['email'], $r['full_name'], $subject, $body);
    if ($res['success']) {
        echo "Notification sent to {$r['full_name']} ({$r['email']})\n";
    } else {
        echo "Failed to send to {$r['full_name']}: " . $res['error'] . "\n";
    }
}
