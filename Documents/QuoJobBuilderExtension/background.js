const STORAGE_KEYS = {
  TASK: "quoJobBuilderTask",
  JOB_JSON: "quoJobBuilderJobJson",
  RAW_PROMPT: "quoJobBuilderPrompt"
};

const MESSAGE_TYPES = {
  GENERATE_JOB: "quoJobBuilder.generateJob",
  GET_STATE: "quoJobBuilder.getState",
  SET_TASK: "quoJobBuilder.setTask",
  CLEAR_STATE: "quoJobBuilder.clearState"
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) {
    return;
  }

  switch (message.type) {
    case MESSAGE_TYPES.GENERATE_JOB: {
      handleGenerateJob(message.payload)
        .then((result) => sendResponse({ ok: true, result }))
        .catch((error) =>
          sendResponse({
            ok: false,
            error: error instanceof Error ? error.message : String(error)
          })
        );
      return true;
    }
    case MESSAGE_TYPES.GET_STATE: {
      chrome.storage.local.get(
        [STORAGE_KEYS.TASK, STORAGE_KEYS.JOB_JSON, STORAGE_KEYS.RAW_PROMPT],
        (items) => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            sendResponse({ ok: false, error: lastError.message });
            return;
          }
          sendResponse({ ok: true, result: items });
        }
      );
      return true;
    }
    case MESSAGE_TYPES.SET_TASK: {
      chrome.storage.local.set(
        { [STORAGE_KEYS.TASK]: message.payload },
        () => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            sendResponse({ ok: false, error: lastError.message });
            return;
          }
          sendResponse({ ok: true });
        }
      );
      return true;
    }
    case MESSAGE_TYPES.CLEAR_STATE: {
      chrome.storage.local.remove(
        [STORAGE_KEYS.TASK, STORAGE_KEYS.JOB_JSON, STORAGE_KEYS.RAW_PROMPT],
        () => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            sendResponse({ ok: false, error: lastError.message });
            return;
          }
          sendResponse({ ok: true });
        }
      );
      return true;
    }
    default:
      break;
  }
});

async function handleGenerateJob(payload) {
  if (!payload || typeof payload.prompt !== "string") {
    throw new Error("Missing prompt payload for job generation.");
  }

  const { openAiKey } = await chrome.storage.local.get(["openAiKey"]);
  if (!openAiKey) {
    throw new Error(
      "Missing OpenAI key. Set `openAiKey` in chrome.storage.local before running."
    );
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You analyze call transcripts and produce Sona job definitions. Output JSON only."
        },
        { role: "user", content: payload.prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenAI request failed (${response.status}): ${errorText.slice(0, 2000)}`
    );
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("No content returned from OpenAI completion.");
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (error) {
    throw new Error(
      `Unable to parse JSON from OpenAI response: ${String(error)}`
    );
  }

  await chrome.storage.local.set({
    [STORAGE_KEYS.JOB_JSON]: parsed,
    [STORAGE_KEYS.RAW_PROMPT]: payload.prompt
  });

  return parsed;
}

