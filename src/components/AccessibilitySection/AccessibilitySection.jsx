import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function AccessibilitySection({ audit }) {
  return (
    <AuditAccordion
      id="accessibility"
      icon="bi-universal-access"
      title="Accessibility"
      checks={audit.accessibility || []}
    />
  );
}
