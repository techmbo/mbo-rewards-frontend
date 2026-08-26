import { useMemo } from "react";
import { PageLayout } from "../../components/layout/PageLayout";
import { DataTable } from "../../components/ui/DataTable";
import { displayText } from "../../utils/display";
import namingCatalog from "./mboNamingCatalog.json";

/**
 * v13 MBO Naming Standard — display / canonical / backend naming crosswalk (03E).
 */
export function MboNamingStandardPage() {
  const rows = useMemo(
    () =>
      (namingCatalog || []).map((r) => ({
        adminDisplayName: r.display,
        mboCanonicalField: r.canonical,
        backendDbField: r.db,
        adminDisplayPurpose: r.purpose,
        validationRule: r.validation,
        notesForTechTeam: r.tech,
      })),
    [],
  );

  const columns = useMemo(
    () => [
      {
        key: "adminDisplayName",
        label: "Admin Display Name",
        minWidth: 160,
        render: (r) => displayText(r.adminDisplayName),
      },
      {
        key: "mboCanonicalField",
        label: "MBO Canonical Field",
        minWidth: 180,
        render: (r) => displayText(r.mboCanonicalField),
      },
      {
        key: "backendDbField",
        label: "Backend DB / Model Field",
        minWidth: 220,
        render: (r) => displayText(r.backendDbField),
      },
      {
        key: "adminDisplayPurpose",
        label: "Admin Display Purpose",
        minWidth: 240,
        render: (r) => displayText(r.adminDisplayPurpose),
      },
      {
        key: "validationRule",
        label: "Validation Rule",
        minWidth: 200,
        render: (r) => displayText(r.validationRule),
      },
      {
        key: "notesForTechTeam",
        label: "Notes for Tech Team",
        minWidth: 240,
        render: (r) => displayText(r.notesForTechTeam),
      },
    ],
    [],
  );

  return (
    <PageLayout
      eyebrow="Data Integrity"
      title="MBO Naming Standard"
      subtitle="Directly generated from 03E My Naming Field Map. Display / canonical / backend naming crosswalk for the tech team."
    >
      <DataTable
        dense
        columns={columns}
        rows={rows}
        emptyTitle="No naming rows"
        searchable
      />
    </PageLayout>
  );
}
