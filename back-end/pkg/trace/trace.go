package trace

import (
	"context"
	"log"
	"os"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/trace"

	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

type tracePack struct {
	Exporter sdktrace.SpanExporter
	Provider *sdktrace.TracerProvider
}

type Trace struct {
	Tracer trace.Tracer
	traceCall
}

type traceCall interface {
	Shutdown(ctx context.Context)
}

func New(ctx context.Context, otelEndpoint string) (Trace, error) {
	var (
		err       error
		tracePack tracePack
		traceIntf Trace
	)

	switch {
	case otelEndpoint == "":
		tracePack.Provider, err = newTraceProvider(tracePack.Exporter)
		if err != nil {
			return traceIntf, err
		}
	default:
		tracePack.Exporter, err = newOTLPExporter(ctx, otelEndpoint)
		if err != nil {
			return traceIntf, err
		}

		tracePack.Provider, err = newTraceProvider(tracePack.Exporter)
		if err != nil {
			return traceIntf, err
		}
	}

	otel.SetTextMapPropagator(propagation.TraceContext{})
	otel.SetTracerProvider(tracePack.Provider)

	tracer := tracePack.Provider.Tracer(os.Getenv("POD_NAME"))
	traceIntf = Trace{
		Tracer:    tracer,
		traceCall: &tracePack,
	}

	return traceIntf, err
}

func (t *tracePack) Shutdown(ctx context.Context) {
	var err error
	if t.Exporter != nil {
		err = t.Exporter.Shutdown(ctx)
		if err != nil {
			log.Printf("[trace] error while shutting down exporter: %s", err.Error())
		}
	}

	err = t.Provider.Shutdown(ctx)
	if err != nil {
		log.Printf("[trace] error while shutting down provider: %s", err.Error())
	}
}

func newOTLPExporter(ctx context.Context, otelEndpoint string) (*otlptrace.Exporter, error) {
	// Configure the exporter
	client := otlptracehttp.NewClient(
		otlptracehttp.WithTimeout(10*time.Second),
		otlptracehttp.WithInsecure(),
		otlptracehttp.WithRetry(otlptracehttp.RetryConfig{
			Enabled:         true,
			InitialInterval: 10 * time.Second,
			MaxInterval:     300 * time.Second,
		}),
		otlptracehttp.WithEndpoint(otelEndpoint),
		otlptracehttp.WithURLPath("/v1/traces"),
	)
	return otlptrace.New(ctx, client)
}

func newTraceProvider(exp sdktrace.SpanExporter) (*sdktrace.TracerProvider, error) {
	var (
		err      error
		provider *sdktrace.TracerProvider
	)

	if exp == nil {
		return sdktrace.NewTracerProvider(
			sdktrace.WithSampler(sdktrace.AlwaysSample()),
		), nil
	}

	r := resource.NewWithAttributes(
		semconv.SchemaURL,
		semconv.K8SNamespaceName(os.Getenv("POD_NAMESPACE")),
		semconv.DeploymentEnvironment(os.Getenv("POD_NAMESPACE")),
		semconv.K8SPodName(os.Getenv("POD_NAME")),
		semconv.K8SClusterName(os.Getenv("SERVICE_CLUSTER")),
		semconv.ServiceName(os.Getenv("SERVICE_NAME")),
		semconv.ServiceVersion(os.Getenv("SERVICE_VERSION")),
		attribute.String("service.alias", os.Getenv("SERVICE_ALIAS")),
	)

	if err != nil {
		return provider, err
	}

	provider = sdktrace.NewTracerProvider(
		sdktrace.WithSpanProcessor(sdktrace.NewBatchSpanProcessor(exp)),
		sdktrace.WithBatcher(exp),
		sdktrace.WithResource(r),
	)

	return provider, err
}
