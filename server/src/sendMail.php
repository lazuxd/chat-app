<?php

//ini_set('display_errors', 'On');

/**
 * This example shows how to send via Google's Gmail servers using XOAUTH2 authentication.
 */

//SMTP needs accurate times, and the PHP time zone MUST be set
//This should be done in your php.ini, but this is how to do it if you don't have access to that
date_default_timezone_set('Europe/Bucharest');

$root = realpath($_SERVER["DOCUMENT_ROOT"]);

//Load dependencies from composer
//If this causes an error, run 'composer install'
// !!! This path should be updated to the vendor/autoload.php file of this project
require "$root/html/vendor/autoload.php";

function sendMail($fromEmail, $fromName, $toEmails, $subject, $htmlBody) {
    
    //Create a new PHPMailer instance
    $mail = new PHPMailer\PHPMailer\PHPMailer;
    
    //Tell PHPMailer to use SMTP
    $mail->isSMTP();
    
    //Enable SMTP debugging
    // 0 = off (for production use)
    // 1 = client messages
    // 2 = client and server messages
    $mail->SMTPDebug = 0;
    
    //Set the hostname of the mail server
    $mail->Host = 'smtp.gmail.com';
    
    //Set the SMTP port number - 587 for authenticated TLS, a.k.a. RFC4409 SMTP submission
    $mail->Port = 587;
    
    //Set the encryption system to use - ssl (deprecated) or tls
    $mail->SMTPSecure = 'tls';
    
    //Whether to use SMTP authentication
    $mail->SMTPAuth = true;
    
    //Set AuthType to use XOAUTH2
    $mail->AuthType = 'XOAUTH2';
    
    //Fill in authentication details here
    //Either the gmail account owner, or the user that gave consent
    $email = 'dorian.lazar@ldxdev.com';
    $clientId = '440112149314-i2jcrhu0pokecanop3s70666s2cstq2g.apps.googleusercontent.com';
    $clientSecret = 'rUcn6KzM-WdypCRv7DE9KvVT';
    
    //Obtained by configuring and running get_oauth_token.php
    //after setting up an app in Google Developer Console.
    $refreshToken = '1/KEBdNbFgHINVW8BYSbKduyKIq-OhEoW2LBRgMtOwti4-yZIr0yKa0N97n62BLEOV';
    
    //Create a new OAuth2 provider instance
    $provider = new League\OAuth2\Client\Provider\Google(
        [
            'clientId' => $clientId,
            'clientSecret' => $clientSecret,
        ]
    );
    
    //Pass the OAuth provider instance to PHPMailer
    $mail->setOAuth(
        new PHPMailer\PHPMailer\OAuth(
            [
                'provider' => $provider,
                'clientId' => $clientId,
                'clientSecret' => $clientSecret,
                'refreshToken' => $refreshToken,
                'userName' => $email,
            ]
        )
    );
    
    //Set who the message is to be sent from
    //For gmail, this generally needs to be the same as the user you logged in as
    $mail->setFrom($fromEmail, $fromName);
    
    //Set who the message is to be sent to
    foreach ($toEmails as $toEmail) {
        $mail->addAddress($toEmail);
    }
    
    //Set the subject line
    $mail->Subject = $subject;
    
    //Read an HTML message body from an external file, convert referenced images to embedded,
    //convert HTML into a basic plain-text alternative body
    $mail->CharSet = 'utf-8';
    $mail->msgHTML($htmlBody);
    
    //send the message, check for errors
    if (!$mail->send()) {
        throw new Exception('Error sending email');
        return false;
    } else {
        return true;
    }
}

?>
