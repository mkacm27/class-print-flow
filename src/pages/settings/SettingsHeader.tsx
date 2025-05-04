
import React from "react";
import { BackupRestoreSection } from "./BackupRestoreSection";

export const SettingsHeader = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <div>
        <h1 className="text-3xl font-bold mb-1">Settings</h1>
        <p className="text-gray-500">Configure your print shop application</p>
      </div>
      <BackupRestoreSection />
    </div>
  );
};
