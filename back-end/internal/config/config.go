package config

import (
    "fmt"
    "log"
    "os"

    "github.com/joho/godotenv"
)

type Config struct {
    DBUser    string
    DBPass    string
    DBHost    string
    DBPort    string
    DBName    string
    DBDSN     string
    Port      string
    SecretKey string
    SMTPHost  string
    SMTPPort  string
    SMTPUser  string
    SMTPPass  string
    FromEmail string
}

func LoadConfig() Config {
    err := godotenv.Load()
    if err != nil {
        log.Printf("No .env file found, relying on environment variables")
    }

    config := Config{
        DBUser:    os.Getenv("DB_USER"),
        DBPass:    os.Getenv("DB_PASS"),
        DBHost:    os.Getenv("DB_HOST"),
        DBPort:    os.Getenv("DB_PORT"),
        DBName:    os.Getenv("DB_NAME"),
        Port:      os.Getenv("PORT"),
        SecretKey: os.Getenv("SECRET_KEY"),
        SMTPHost:  os.Getenv("SMTP_HOST"),
        SMTPPort:  os.Getenv("SMTP_PORT"),
        SMTPUser:  os.Getenv("SMTP_USER"),
        SMTPPass:  os.Getenv("SMTP_PASS"),
        FromEmail: os.Getenv("FROM_EMAIL"),
    }

    config.DBDSN = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
        config.DBUser, config.DBPass, config.DBHost, config.DBPort, config.DBName)

    requiredVars := map[string]string{
        "DB_USER":     config.DBUser,
        "DB_HOST":     config.DBHost,
        "DB_PORT":     config.DBPort,
        "DB_NAME":     config.DBName,
        "PORT":        config.Port,
        "SECRET_KEY":  config.SecretKey,
        "SMTP_HOST":   config.SMTPHost,
        "SMTP_PORT":   config.SMTPPort,
        "SMTP_USER":   config.SMTPUser,
        "SMTP_PASS":   config.SMTPPass,
        "FROM_EMAIL":  config.FromEmail,
    }

    for key, value := range requiredVars {
        if value == "" {
            log.Fatalf("Missing required configuration variable: %s", key)
        }
    }

    return config
}
