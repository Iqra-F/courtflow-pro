export const ADMIN_CREDENTIALS = {
  email: "admin@court.local",
  password: "ChangeMe123!", // Edit this in code as needed
};

export const DEFAULT_SYSTEM_SETTINGS = {
  allowedFileTypes: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/png", "image/jpeg"],
  maxFileSize: 25 * 1024 * 1024, // 25MB
  publicFilingTypes: ["Small Claims Request", "Public Records Request"],
  courtrooms: ["Courtroom A", "Courtroom B", "Courtroom C"],
  workingHours: {
    start: "08:00",
    end: "17:00",
    timezone: "America/New_York"
  }
};