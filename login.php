<?php
require_once 'vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['idtoken'])) {
        $id_token = $_POST['idtoken'];
        
        $client = new Google_Client(['client_id' => 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com']);
        $payload = $client->verifyIdToken($id_token);
        
        if ($payload) {
            $userid = $payload['sub'];
            // If request specified a G Suite domain:
            //$domain = $payload['hd'];
            // Handle login, create session, etc.
            echo 'Google User ID: ' . $userid;
        } else {
            // Invalid ID token
            echo 'Invalid ID token';
        }
    } else {
        $username = $_POST['username'];
        $password = $_POST['password'];

        // Handle traditional login with username and password
        // Example: Query database, verify password, create session, etc.

        echo 'Username: ' . $username;
    }
}
?>
