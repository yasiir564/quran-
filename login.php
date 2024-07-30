<?php
require_once 'vendor/autoload.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['idtoken'])) {
        $id_token = $_POST['idtoken'];
        
        $client = new Google_Client(['client_id' => getenv('GOOGLE_CLIENT_ID')]);
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

        // Example: Query database, verify password, create session, etc.
        $pdo = new PDO('mysql:host=localhost;dbname=your_db', 'your_db_user', 'your_db_password');
        $stmt = $pdo->prepare('SELECT password FROM users WHERE username = ?');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            // Password is correct, create session
            session_start();
            $_SESSION['username'] = $username;
            echo 'Login successful';
        } else {
            // Invalid credentials
            echo 'Invalid username or password';
        }
    }
}
?>
