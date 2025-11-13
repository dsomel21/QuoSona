(async () => {
  const [
    { STORAGE_KEYS, TASK_STATES, EXTENSION_FLAGS, MESSAGE_TYPES },
    { waitForSelector, clickElement, setReactInputValue, setContentEditableValue },
    { getLocalStorage, setLocalStorage }
  ] = await Promise.all([
    import(chrome.runtime.getURL("shared/constants.js")),
    import(chrome.runtime.getURL("shared/dom.js")),
    import(chrome.runtime.getURL("shared/storage.js"))
  ]);

  if (window[EXTENSION_FLAGS.WORKFLOW_INITIALIZED]) {
    return;
  }
  window[EXTENSION_FLAGS.WORKFLOW_INITIALIZED] = true;

  const LOG_PREFIX = "[Quo Job Builder][Workflow]";
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function log(...args) {
    console.log(LOG_PREFIX, ...args);
  }

  function normalize(text) {
    return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  async function updateTask(partial) {
    const { [STORAGE_KEYS.TASK]: current } = await getLocalStorage([
      STORAGE_KEYS.TASK
    ]);
    if (!current) {
      return;
    }
    await setLocalStorage({
      [STORAGE_KEYS.TASK]: {
        ...current,
        ...partial,
        lastUpdatedAt: Date.now()
      }
    });
  }

  async function ensureVoiceAgentSelected() {
    const voiceBlock = await waitForSelector('[data-block-type="voiceAgent"]', {
      timeout: 15000
    });
    clickElement(voiceBlock);
    log("Voice Agent block selected.");
    await sleep(300);

    const navButton = document.querySelector(
      'button[data-sentry-source-file="SideNavigation.tsx"]'
    );
    if (navButton) {
      clickElement(navButton);
      log("Opened job side navigation.");
      await sleep(300);
    }
  }

  async function requestJobGeneration(prompt) {
    log("Requesting job generation via OpenAI.");
    const response = await chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.GENERATE_JOB,
      payload: { prompt }
    });
    if (!response?.ok) {
      throw new Error(response?.error || "Unknown error from background.");
    }
    const job = response.result;
    if (!job || typeof job !== "object") {
      throw new Error("Background returned invalid job payload.");
    }
    return job;
  }

  function findInputByLabel(modal, candidateLabels = []) {
    const normalizedLabels = candidateLabels.map((label) => normalize(label));
    const labelElements = Array.from(modal.querySelectorAll("label")).filter(
      (label) =>
        normalizedLabels.includes(normalize(label.textContent)) ||
        normalizedLabels.some((target) =>
          normalize(label.textContent).includes(target)
        )
    );

    for (const label of labelElements) {
      const htmlFor = label.getAttribute("for");
      if (htmlFor) {
        const input = modal.querySelector(`#${CSS.escape(htmlFor)}`);
        if (input) {
          return input;
        }
      }
      const inputSibling = label.querySelector("input, textarea");
      if (inputSibling) {
        return inputSibling;
      }
      const next = label.nextElementSibling;
      if (next && (next.matches("input") || next.matches("textarea"))) {
        return next;
      }
    }

    const candidates = Array.from(
      modal.querySelectorAll("input, textarea")
    ).filter((input) => {
      const name = normalize(input.getAttribute("name"));
      const placeholder = normalize(input.getAttribute("placeholder"));
      const aria = normalize(input.getAttribute("aria-label"));
      return normalizedLabels.some(
        (label) =>
          name.includes(label) || placeholder.includes(label) || aria.includes(label)
      );
    });

    return candidates[0] || null;
  }

  function findInstructionsEditor(modal) {
    const contentEditable = modal.querySelector(
      '[contenteditable="true"][role="textbox"]'
    );
    if (contentEditable) {
      return contentEditable;
    }
    const markdownTextareas = modal.querySelectorAll("textarea");
    for (const textarea of markdownTextareas) {
      const aria = normalize(textarea.getAttribute("aria-label"));
      const name = normalize(textarea.getAttribute("name"));
      if (aria.includes("instruction") || name.includes("instruction")) {
        return textarea;
      }
    }
    return contentEditable || markdownTextareas[0] || null;
  }

  async function openJobModal() {
    await ensureVoiceAgentSelected();

    const addJobButton = await waitForSelector(
      'button[data-sentry-source-file="CustomJobsV1.tsx"]',
      { timeout: 10000 }
    );
    clickElement(addJobButton);
    log("Clicked Add Job button.");
    await sleep(300);

    const createJobButton = await waitForSelector(
      'button[data-sentry-source-file="AddOrLinkCustomJobsV1Command.tsx"]',
      { timeout: 10000 }
    );
    clickElement(createJobButton);
    log("Clicked Create New Job.");
    await sleep(500);

    const modal = await waitForSelector('[role="dialog"]', {
      timeout: 10000
    });
    return modal;
  }

  async function populateJobModal(modal, job) {
    if (!job) {
      throw new Error("Missing job details.");
    }

    const nameInput =
      findInputByLabel(modal, ["Job Name", "Name"]) ||
      modal.querySelector('input[name="name"]') ||
      modal.querySelector('input[aria-label*="Job Name"]');
    if (!nameInput) {
      throw new Error("Unable to locate the Job Name field.");
    }
    setReactInputValue(nameInput, job.jobName || "");
    log("Filled job name.");

    const descriptionField =
      findInputByLabel(modal, ["Description"]) ||
      modal.querySelector('textarea[name="description"]') ||
      modal.querySelector('textarea[aria-label*="Description"]');
    if (descriptionField) {
      setReactInputValue(descriptionField, job.description || "");
      log("Filled description.");
    }

    const triggerField =
      findInputByLabel(modal, ["Trigger"]) ||
      modal.querySelector('textarea[name="trigger"]') ||
      modal.querySelector('textarea[aria-label*="Trigger"]');
    if (triggerField) {
      setReactInputValue(triggerField, job.trigger || "");
      log("Filled trigger.");
    } else {
      throw new Error("Unable to locate the Trigger field.");
    }

    const instructionsField = findInstructionsEditor(modal);
    if (!instructionsField) {
      throw new Error("Unable to locate the Instructions editor.");
    }

    if (instructionsField instanceof HTMLTextAreaElement) {
      setReactInputValue(instructionsField, job.instructions || "");
    } else {
      setContentEditableValue(instructionsField, job.instructions || "");
    }
    log("Filled instructions.");
  }

  async function finalizeJobCreation() {
    const confirmButton =
      document.querySelector('button[data-sentry-source-file="SideNavigation.tsx"]');
    if (confirmButton) {
      clickElement(confirmButton);
      log("Re-triggered Add new job navigation.");
    }
  }

  async function run() {
    const { [STORAGE_KEYS.TASK]: task, [STORAGE_KEYS.JOB_JSON]: jobJson } =
      await getLocalStorage([STORAGE_KEYS.TASK, STORAGE_KEYS.JOB_JSON]);
    if (!task) {
      log("No active task found.");
      return;
    }

    if (
      task.state !== TASK_STATES.OPEN_SONA_MANAGE &&
      task.state !== TASK_STATES.WORKFLOW_READY &&
      task.state !== TASK_STATES.GENERATING_JOB &&
      task.state !== TASK_STATES.JOB_READY
    ) {
      log("Task in state where workflow automation should not proceed:", task.state);
      return;
    }

    if (task.state === TASK_STATES.OPEN_SONA_MANAGE) {
      await updateTask({ state: TASK_STATES.WORKFLOW_READY });
    }

    let jobDetails = jobJson;
    if (!jobDetails) {
      await updateTask({ state: TASK_STATES.GENERATING_JOB });
      jobDetails = await requestJobGeneration(task.prompt);
      await setLocalStorage({
        [STORAGE_KEYS.JOB_JSON]: jobDetails
      });
      await updateTask({ state: TASK_STATES.JOB_READY });
    }

    const modal = await openJobModal();
    await populateJobModal(modal, jobDetails);
    await finalizeJobCreation();
    await updateTask({ state: TASK_STATES.COMPLETED });
    log("Job creation flow completed.");
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }

    if (changes[STORAGE_KEYS.TASK] || changes[STORAGE_KEYS.JOB_JSON]) {
      run().catch((error) => {
        console.error(LOG_PREFIX, error);
      });
    }
  });

  run().catch(async (error) => {
    console.error(LOG_PREFIX, error);
    const { [STORAGE_KEYS.TASK]: currentTask } = await getLocalStorage([
      STORAGE_KEYS.TASK
    ]);
    await setLocalStorage({
      [STORAGE_KEYS.TASK]: {
        ...(currentTask || {}),
        state: TASK_STATES.FAILED,
        error: error?.message || String(error),
        lastUpdatedAt: Date.now()
      }
    });
  });
})();


