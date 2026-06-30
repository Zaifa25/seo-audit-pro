import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function HeadingSection({ audit }) {
  return (
    <AuditAccordion
      id="headings"
      icon="bi-list-ol"
      title="Heading Structure"
      checks={audit.headings || []}
    />
  );
}
