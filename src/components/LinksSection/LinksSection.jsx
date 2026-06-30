import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function LinksSection({ audit }) {
  return (
    <AuditAccordion
      id="links"
      icon="bi-link-45deg"
      title="Links"
      checks={audit.links || []}
    />
  );
}
