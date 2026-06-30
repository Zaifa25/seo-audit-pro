import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function TwitterCardSection({ audit }) {
  return (
    <AuditAccordion
      id="twitterCard"
      icon="bi-twitter-x"
      title="Twitter Cards"
      checks={audit.twitterCard || []}
    />
  );
}
