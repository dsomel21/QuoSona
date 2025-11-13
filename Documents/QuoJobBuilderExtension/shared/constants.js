export const STORAGE_KEYS = Object.freeze({
  TASK: "quoJobBuilderTask",
  JOB_JSON: "quoJobBuilderJobJson",
  RAW_PROMPT: "quoJobBuilderPrompt"
});

export const MESSAGE_TYPES = Object.freeze({
  GENERATE_JOB: "quoJobBuilder.generateJob",
  GET_STATE: "quoJobBuilder.getState",
  SET_TASK: "quoJobBuilder.setTask",
  CLEAR_STATE: "quoJobBuilder.clearState"
});

export const TASK_STATES = Object.freeze({
  IDLE: "idle",
  STARTED: "started",
  NAVIGATING_TO_SONA: "navigatingToSona",
  OPEN_SONA_MANAGE: "openSonaManage",
  WORKFLOW_READY: "workflowReady",
  GENERATING_JOB: "generatingJob",
  JOB_READY: "jobReady",
  COMPLETED: "completed",
  FAILED: "failed"
});

export const EXTENSION_FLAGS = Object.freeze({
  INBOX_INITIALIZED: "__quoJobBuilderInboxInitialized",
  SONA_INITIALIZED: "__quoJobBuilderSonaInitialized",
  WORKFLOW_INITIALIZED: "__quoJobBuilderWorkflowInitialized"
});

