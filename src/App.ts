class Signal<T> {
  private _value: T;
  private _subscribers: Set<() => void>;

  constructor(value: T) {
    this._value = value;
    this._subscribers = new Set();
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    this._value = newValue;
    this._subscribers.forEach((fn) => fn());
  }

  subscribe(fn: () => void): () => void {
    this._subscribers.add(fn);
    return () => this._subscribers.delete(fn);
  }
}

export function createApp(isClient = false) {
  const count = new Signal<number>(0);

  function render(): string {
    return `
      <div>
        <h1>Vite SSR + Signals Test</h1>
        <p>This was rendered on the ${isClient ? "client" : "server"}.</p>
        <div class="counter">
          <p>Count: <strong id="count">${count.value}</strong></p>
          <button id="increment">Increment</button>
          <button id="decrement">Decrement</button>
        </div>
        <p><small>Try clicking the buttons - they only work after hydration!</small></p>
      </div>
    `;
  }

  function hydrate(): void {
    if (!isClient) return;

    const countEl = document.getElementById("count");
    const incrementBtn = document.getElementById("increment");
    const decrementBtn = document.getElementById("decrement");

    if (!countEl || !incrementBtn || !decrementBtn) {
      console.error("Required elements not found");
      return;
    }

    // Subscribe to count changes
    count.subscribe(() => {
      countEl.textContent = String(count.value);
    });

    // Add event listeners
    incrementBtn.addEventListener("click", () => {
      count.value++;
    });

    decrementBtn.addEventListener("click", () => {
      count.value--;
    });

    console.log("✅ App hydrated! Buttons are now interactive.");
  }

  return { render, hydrate, count };
}
