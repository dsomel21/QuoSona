export function waitForSelector(selector, { timeout = 10000, root = document } = {}) {
  return new Promise((resolve, reject) => {
    const existing = root.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(root, { childList: true, subtree: true });

    if (timeout > 0) {
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timed out waiting for selector: ${selector}`));
      }, timeout);
    }
  });
}

export function waitForCondition(checker, { interval = 250, timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    const tick = () => {
      try {
        const result = checker();
        if (result) {
          resolve(result);
          return;
        }
      } catch (error) {
        reject(error);
        return;
      }

      if (timeout > 0 && Date.now() - start > timeout) {
        reject(new Error("Timed out waiting for condition"));
        return;
      }

      setTimeout(tick, interval);
    };

    tick();
  });
}

export function clickElement(el) {
  el?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

export function setReactInputValue(element, value) {
  if (!element) return;

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    element.__proto__,
    "value"
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function setContentEditableValue(element, value) {
  if (!element) return;
  element.focus();

  const selection = window.getSelection();
  const range = document.createRange();
  element.innerHTML = "";
  element.appendChild(document.createTextNode(value));
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);

  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

