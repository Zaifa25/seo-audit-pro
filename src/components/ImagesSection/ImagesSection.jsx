import React from "react";
import AuditAccordion from "../AuditAccordion.jsx";

export default function ImagesSection({ audit }) {
  return (
    <AuditAccordion
      id="images"
      icon="bi-image"
      title="Images"
      checks={audit.images || []}
    />
  );
}
