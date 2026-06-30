import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function MetaSection({ audit }) {
  return (
    <AuditAccordion
      id="meta"
      icon="bi-card-text"
      title="Meta Information"
      checks={audit.meta || []}
    />
  );
}
