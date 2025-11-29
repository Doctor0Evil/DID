const noop = () => (() => {});

function getTracer() {
  // No-op tracer by default. If an OTLP exporter or tracing agent is configured at runtime,
  // this module can be updated to return a real tracer instance.
  return {
    startSpan: noop,
    endSpan: noop
  };
}

module.exports = { getTracer };
