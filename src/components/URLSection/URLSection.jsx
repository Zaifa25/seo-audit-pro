import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function URLSection({ audit }) {
  return (
    <AuditAccordion
      id="url"
      icon="bi-globe"
      title="URL Analysis"
      checks={audit.url || []}
    />
  );
}
