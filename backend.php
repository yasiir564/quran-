<?php
session_start();
$host = 'localhost'; // your database host
$dbname = 'quran_audio'; // your database name
$user = 'root'; // your database user
$pass = ''; // your database password

$conn = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);

function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function getUserId() {
    return $_SESSION['user_id'];
}

function handleRequest($conn) {
    $action = $_POST['action'];

    switch ($action) {
        case 'login':
            login($conn);
            break;
        case 'bookmark':
            bookmarkSurah($conn);
            break;
        case 'add_to_playlist':
            addToPlaylist($conn);
            break;
        case 'get_user_data':
            getUserData($conn);
            break;
        default:
            echo json_encode(['error' => 'Invalid action']);
    }
}

function login($conn) {
    // This is a simplified example. You should hash passwords and use prepared statements to prevent SQL injection.
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT id FROM users WHERE username = :username AND password = :password");
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $password);
    $stmt->execute();

    if ($stmt->rowCount() > 0) {
        $_SESSION['user_id'] = $stmt->fetchColumn();
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Invalid credentials']);
    }
}

function bookmarkSurah($conn) {
    if (!isLoggedIn()) {
        echo json_encode(['error' => 'Not logged in']);
        return;
    }

    $surahId = $_POST['surah_id'];
    $userId = getUserId();

    $stmt = $conn->prepare("INSERT INTO bookmarks (user_id, surah_id) VALUES (:user_id, :surah_id)");
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':surah_id', $surahId);
    $stmt->execute();

    echo json_encode(['success' => true]);
}

function addToPlaylist($conn) {
    if (!isLoggedIn()) {
        echo json_encode(['error' => 'Not logged in']);
        return;
    }

    $surahId = $_POST['surah_id'];
    $userId = getUserId();

    $stmt = $conn->prepare("INSERT INTO playlist (user_id, surah_id) VALUES (:user_id, :surah_id)");
    $stmt->bindParam(':user_id', $userId);
    $stmt->bindParam(':surah_id', $surahId);
    $stmt->execute();

    echo json_encode(['success' => true]);
}

function getUserData($conn) {
    if (!isLoggedIn()) {
        echo json_encode(['error' => 'Not logged in']);
        return;
    }

    $userId = getUserId();

    $bookmarks = $conn->prepare("SELECT surah_id FROM bookmarks WHERE user_id = :user_id");
    $bookmarks->bindParam(':user_id', $userId);
    $bookmarks->execute();
    $bookmarks = $bookmarks->fetchAll(PDO::FETCH_COLUMN);

    $playlist = $conn->prepare("SELECT surah_id FROM playlist WHERE user_id = :user_id");
    $playlist->bindParam(':user_id', $userId);
    $playlist->execute();
    $playlist = $playlist->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode(['bookmarks' => $bookmarks, 'playlist' => $playlist]);
}

handleRequest($conn);
