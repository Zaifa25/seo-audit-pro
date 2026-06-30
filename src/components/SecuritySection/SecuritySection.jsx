import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function SecuritySection({ audit }) {
  return (
    <AuditAccordion
      id="security"
      icon="bi-shield-lock"
      title="Security"
      checks={audit.security || []}
    />
  );
}
