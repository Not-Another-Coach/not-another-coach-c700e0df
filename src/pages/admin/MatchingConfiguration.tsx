import { AdminLayout } from "@/components/admin/AdminLayout";
import { MatchingAlgorithmConfig } from "@/components/admin/MatchingAlgorithmConfig";

export default function MatchingConfiguration() {
  return (
    <AdminLayout 
      title="Matching Configuration"
      description="Configure the trainer matching algorithm weights, thresholds, and rules"
    >
      <MatchingAlgorithmConfig />
    </AdminLayout>
  );
}
