import { useState } from "react";
import { MatchingVersion } from "@/types/matching";
import { MatchingVersionsList } from "./MatchingVersionsList";
import { MatchingVersionEditor } from "./MatchingVersionEditor";

export function MatchingAlgorithmConfig() {
  const [selectedVersion, setSelectedVersion] = useState<MatchingVersion | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const handleSelectVersion = (version: MatchingVersion, selectMode: 'view' | 'edit') => {
    setSelectedVersion(version);
    setMode(selectMode);
  };

  const handleBack = () => {
    setSelectedVersion(null);
  };

  const handleVersionCreated = (version: MatchingVersion) => {
    setSelectedVersion(version);
    setMode('edit');
  };

  if (selectedVersion) {
    return (
      <MatchingVersionEditor
        version={selectedVersion}
        mode={mode}
        onBack={handleBack}
        onVersionCreated={handleVersionCreated}
      />
    );
  }

  return <MatchingVersionsList onSelectVersion={handleSelectVersion} />;
}