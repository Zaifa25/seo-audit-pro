import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function OpenGraphSection({ audit }) {
  return (
    <AuditAccordion
      id="openGraph"
      icon="bi-share"
      title="Open Graph"
      checks={audit.openGraph || []}
    />
  );
}
