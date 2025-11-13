(async () => {
  const [
    { STORAGE_KEYS, TASK_STATES, EXTENSION_FLAGS },
    { waitForCondition, clickElement },
    { getLocalStorage, setLocalStorage }
  ] = await Promise.all([
    import(chrome.runtime.getURL("shared/constants.js")),
    import(chrome.runtime.getURL("shared/dom.js")),
    import(chrome.runtime.getURL("shared/storage.js"))
  ]);

  if (window[EXTENSION_FLAGS.SONA_INITIALIZED]) {
    return;
  }
  window[EXTENSION_FLAGS.SONA_INITIALIZED] = true;

  const LOG_PREFIX = "[Quo Job Builder][Sona]";
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function log(...args) {
    console.log(LOG_PREFIX, ...args);
  }

  function normalize(text) {
    return (text || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  async function init() {
    const { [STORAGE_KEYS.TASK]: task } = await getLocalStorage([
      STORAGE_KEYS.TASK
    ]);
    if (!task || task.state !== TASK_STATES.NAVIGATING_TO_SONA) {
      log("No active task requiring Sona navigation.");
      return;
    }

    log("Continuing workflow for phone number:", task.phoneNumberId);

    const manageUrl = `https://my.quo.com/settings/phone-numbers/${task.phoneNumberId}/workflow-builder?workflowDefinitionId=${encodeURIComponent(
      task.workflowDefinitionId
    )}`;

    const manageButtonSelectors = [
      'a[href*="/settings/phone-numbers/"][href*="workflow-builder"]',
      'button[data-sentry-source-file="PhoneNumberManageButton.tsx"]',
      'a[href*="/settings/phone-numbers/"] button',
      'button:contains("Manage")'
    ];

    let navigated = false;
    for (const selector of manageButtonSelectors) {
      if (selector.includes(":contains")) {
        const buttons = Array.from(document.querySelectorAll("button"));
        const target = buttons.find(
          (btn) =>
            normalize(btn.innerText) === "manage" ||
            normalize(btn.innerText).includes("manage")
        );
        if (target) {
          clickElement(target);
          navigated = true;
          break;
        }
        continue;
      }

      const button = document.querySelector(selector);
      if (button) {
        clickElement(button);
        navigated = true;
        break;
      }
    }

    if (!navigated) {
      window.location.href = manageUrl;
      navigated = true;
      log("Navigating directly to workflow builder.");
    }

    await setLocalStorage({
      [STORAGE_KEYS.TASK]: {
        ...task,
        state: TASK_STATES.OPEN_SONA_MANAGE,
        lastUpdatedAt: Date.now()
      }
    });

    if (navigated) {
      await waitForCondition(
        () =>
          normalize(window.location.href).includes("workflow-builder") ||
          document.querySelector(
            'a[href*="/settings/phone-numbers/"][href*="workflow-builder"]'
          ),
        { timeout: 15000 }
      ).catch(() => {});
    }
  }

  init().catch(async (error) => {
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


