package qrcode

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"net/smtp"

	"github.com/golang-jwt/jwt/v4"
	"github.com/skip2/go-qrcode"
)

func GenerateJWT(payload jwt.MapClaims, secretKey string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, payload)
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func CreateQRCode(tokenString string) ([]byte, error) {
	qrCode, err := qrcode.Encode(tokenString, qrcode.Medium, 256)
	if err != nil {
		return nil, err
	}
	return qrCode, nil
}

func SendQRCodeByEmail(qrCode []byte, toEmail, smtpServer, smtpPort, fromEmail, fromPassword string) error {
	encodedQRCode := base64.StdEncoding.EncodeToString(qrCode)

	boundary := "boundary-goes-here"
	message := bytes.NewBufferString("")
	message.WriteString(fmt.Sprintf("From: %s\r\n", fromEmail))
	message.WriteString(fmt.Sprintf("To: %s\r\n", toEmail))
	message.WriteString("Subject: Your QR Code\r\n")
	message.WriteString("MIME-Version: 1.0\r\n")
	message.WriteString(fmt.Sprintf("Content-Type: multipart/mixed; boundary=%s\r\n", boundary))
	message.WriteString("\r\n--" + boundary + "\r\n")
	message.WriteString("Content-Type: text/plain; charset=utf-8\r\n\r\n")
	message.WriteString("Below is your QR code for check-in and check-out attendance. Please use this code when attending the event.\r\n\r\n")
	message.WriteString("--" + boundary + "\r\n")
	message.WriteString("Content-Type: image/png\r\n")
	message.WriteString("Content-Transfer-Encoding: base64\r\n")
	message.WriteString("Content-Disposition: attachment; filename=\"qrcode.png\"\r\n\r\n")
	message.WriteString(encodedQRCode + "\r\n")
	message.WriteString("--" + boundary + "--")

	auth := smtp.PlainAuth("", fromEmail, fromPassword, smtpServer)
	smtpAddr := smtpServer + ":" + smtpPort

	err := smtp.SendMail(smtpAddr, auth, fromEmail, []string{toEmail}, message.Bytes())
	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	return nil
}
