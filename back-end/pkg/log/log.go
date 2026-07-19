package log

import (
	"context"
	"fmt"
	"os"
	"strconv"

	"github.com/sirupsen/logrus"
	easy "github.com/t-tomalak/logrus-easy-formatter"
	"go.opentelemetry.io/otel/trace"
)

type Logger interface {
	Debug(ctx context.Context, msg string)
	Debugf(ctx context.Context, msg string, args ...interface{})

	Info(ctx context.Context, msg string)
	Infof(ctx context.Context, msg string, args ...interface{})

	Warn(ctx context.Context, msg string)
	Warnf(ctx context.Context, msg string, args ...interface{})

	Error(ctx context.Context, msg string)
	Errorf(ctx context.Context, msg string, args ...interface{})

	Fatal(ctx context.Context, msg string)
	Fatalf(ctx context.Context, msg string, args ...interface{})

	Panic(ctx context.Context, msg string)
	Panicf(ctx context.Context, msg string, args ...interface{})
}

type LogrusLogger struct {
	logger *logrus.Logger
}

// NewLogrusLogger creates a new instance of LogrusLogger with default settings.
func NewLogrusLogger() Logger {
	logger := logrus.New()
	logger.Out = os.Stdout
	logger.Formatter = &easy.Formatter{
		TimestampFormat: "2006/01/02 15:04:05",
		LogFormat:       "%time% [%lvl%] %msg%\n",
	}

	return &LogrusLogger{logger: logger}
}

// Debug logs a debug message.
func (l *LogrusLogger) Debug(ctx context.Context, msg string) {
	l.logger.WithFields(l.addCustomFields(ctx)).Debug(msg)
}

// Debugf logs a formatted debug message.
func (l *LogrusLogger) Debugf(ctx context.Context, msg string, args ...interface{}) {
	l.logger.WithFields(l.addCustomFields(ctx)).Debug(fmt.Sprintf(msg, args...))
}

// Info logs an info message.
func (l *LogrusLogger) Info(ctx context.Context, msg string) {
	l.logger.WithFields(l.addCustomFields(ctx)).Info(msg)
}

// Infof logs a formatted info message.
func (l *LogrusLogger) Infof(ctx context.Context, msg string, args ...interface{}) {
	l.logger.WithFields(l.addCustomFields(ctx)).Info(fmt.Sprintf(msg, args...))
}

// Warn logs a warning message.
func (l *LogrusLogger) Warn(ctx context.Context, msg string) {
	l.logger.WithFields(l.addCustomFields(ctx)).Warn(msg)
}

// Warnf logs a formatted warning message.
func (l *LogrusLogger) Warnf(ctx context.Context, msg string, args ...interface{}) {
	l.logger.WithFields(l.addCustomFields(ctx)).Warn(fmt.Sprintf(msg, args...))
}

// Error logs an error message.
func (l *LogrusLogger) Error(ctx context.Context, msg string) {
	l.logger.WithFields(l.addCustomFields(ctx)).Error(msg)
}

// Errorf logs a formatted error message.
func (l *LogrusLogger) Errorf(ctx context.Context, msg string, args ...interface{}) {
	l.logger.WithFields(l.addCustomFields(ctx)).Error(fmt.Sprintf(msg, args...))
}

// Fatal logs a fatal error message and exits the program.
func (l *LogrusLogger) Fatal(ctx context.Context, msg string) {
	l.logger.WithFields(l.addCustomFields(ctx)).Fatal(msg)
}

// Fatalf logs a formatted fatal error message and exits the program.
func (l *LogrusLogger) Fatalf(ctx context.Context, msg string, args ...interface{}) {
	l.logger.WithFields(l.addCustomFields(ctx)).Fatal(fmt.Sprintf(msg, args...))
}

// Panic logs a panic message and panics.
func (l *LogrusLogger) Panic(ctx context.Context, msg string) {
	l.logger.WithFields(l.addCustomFields(ctx)).Panic(msg)
}

// Panicf logs a formatted panic message and panics.
func (l *LogrusLogger) Panicf(ctx context.Context, msg string, args ...interface{}) {
	l.logger.WithFields(l.addCustomFields(ctx)).Panic(fmt.Sprintf(msg, args...))
}

// addCustomFields extracts custom fields from context and adds them to the log.
func (l *LogrusLogger) addCustomFields(ctx context.Context) logrus.Fields {
	var fields = logrus.Fields{}

	if ctx != nil {
		// Extract custom data in context
		if customData := ctx.Value("data"); customData != nil {
			for key, val := range customData.(map[string]interface{}) {
				fields[key] = fmt.Sprintf("%v", val)
			}
		}

		// Extract span in context
		if span := trace.SpanFromContext(ctx); span != nil {
			fields["trace_id"] = convertTraceID(span.SpanContext().TraceID().String())
			fields["span_id"] = convertTraceID(span.SpanContext().SpanID().String())
		}
	}

	return fields
}

// convertTraceID converts a hexadecimal trace ID to a decimal format.
func convertTraceID(id string) string {
	if len(id) < 16 {
		return ""
	}
	if len(id) > 16 {
		id = id[16:]
	}
	intValue, err := strconv.ParseUint(id, 16, 64)
	if err != nil {
		return ""
	}
	return strconv.FormatUint(intValue, 10)
}
