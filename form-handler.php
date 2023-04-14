<?php
if (isset($_POST['submit'])) {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phoneNumber'];
    $website = $_POST['websiteUrl'];
    $message = $_POST['message'];
    $to = 'shivanshdengla@gmail.com'; // replace with your email address
    $subject = 'New form submission';
    $body = "Name: $name\nEmail: $email\nPhone: $phone\nWebsite/Company Name: $website\nMessage:\n$message";
    $headers = "From: $email\r\nReply-To: $email\r\n";
    if (mail($to, $subject, $body, $headers)) {
        echo 'Message sent successfully';
    } else {
        echo 'Message sending failed';
    }
}
?>
