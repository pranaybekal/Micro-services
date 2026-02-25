'use strict';

const serviceName = process.env.OTEL_SERVICE_NAME || 'unknown-service';

try {
  const { NodeSDK } = require('@opentelemetry/sdk-node');
  const resources = require('@opentelemetry/resources');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
  const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
  const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

  const traceExporter = new OTLPTraceExporter({
    url: 'http://otel-collector:4318/v1/traces',
  });

  const metricExporter = new OTLPMetricExporter({
    url: 'http://otel-collector:4318/v1/metrics',
  });

  const serviceAttrs = { 'service.name': serviceName };
  const resource = typeof resources.resourceFromAttributes === 'function'
    ? resources.resourceFromAttributes(serviceAttrs)
    : new resources.Resource(serviceAttrs);

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 10000,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
  console.log(`OpenTelemetry initialized for ${serviceName}`);

  process.on('SIGTERM', async () => {
    await sdk.shutdown();
    console.log('OpenTelemetry shut down');
    process.exit(0);
  });
} catch (err) {
  console.warn(`OpenTelemetry failed to init for ${serviceName}:`, err.message);
  console.warn('Service will continue without telemetry.');
}
