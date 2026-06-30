import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function StructuredDataSection({ audit }) {
  return (
    <AuditAccordion
      id="structuredData"
      icon="bi-braces"
      title="Structured Data"
      checks={audit.structuredData || []}
    />
  );
}
