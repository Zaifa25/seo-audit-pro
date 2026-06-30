import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function MobileSEOSection({ audit }) {
  return (
    <AuditAccordion
      id="mobile"
      icon="bi-phone"
      title="Mobile SEO"
      checks={audit.mobile || []}
    />
  );
}
