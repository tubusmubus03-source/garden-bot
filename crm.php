<?php
// PHP Proxy for LP-CRM to avoid CORS and hide API Key
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$apiKey = 'ea26c2cbc26a264dd6529b0c25410bc1';
$apiUrl = 'http://wildsub.lp-crm.biz/api/addNewOrder.html';

$data = [
    'key'             => $apiKey,
    'order_id'        => number_format(round(microtime(true)*10), 0, '.', ''),
    'country'         => 'UA',
    'office'          => '38',
    'products'        => $_POST['products'] ?? '',
    'bayer_name'      => $_POST['bayer_name'] ?? 'Клієнт',
    'phone'           => $_POST['phone'] ?? '',
    'comment'         => $_POST['comment'] ?? '',
    'delivery'        => '1',
    'payment'         => '4',
    'sender'          => serialize($_SERVER),
    'utm_source'      => $_POST['utm_source'] ?? '',
    'utm_medium'      => $_POST['utm_medium'] ?? '',
    'utm_term'        => $_POST['utm_term'] ?? '',
    'utm_content'     => $_POST['utm_content'] ?? '',
    'utm_campaign'    => $_POST['utm_campaign'] ?? '',
];

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $apiUrl);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
$out = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

// Logging for debug
file_put_contents('crm_log.txt', date('[Y-m-d H:i:s] ') . "HTTP $httpCode, Response: $out\n", FILE_APPEND);

echo $out;
?>
