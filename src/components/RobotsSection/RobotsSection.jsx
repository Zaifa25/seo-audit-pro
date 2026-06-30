import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function RobotsSection({ audit }) {
  return (
    <AuditAccordion
      id="robots"
      icon="bi-robot"
      title="Robots & Indexability"
      checks={audit.robots || []}
    />
  );
}
