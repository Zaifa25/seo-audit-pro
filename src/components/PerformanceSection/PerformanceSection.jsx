import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function PerformanceSection({ audit }) {
  return (
    <AuditAccordion
      id="performance"
      icon="bi-speedometer2"
      title="Performance"
      checks={audit.performance || []}
    />
  );
}
