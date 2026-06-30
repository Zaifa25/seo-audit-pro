import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function CanonicalSection({ audit }) {
  return (
    <AuditAccordion
      id="canonical"
      icon="bi-link"
      title="Canonical URL"
      checks={audit.canonical || []}
    />
  );
}
