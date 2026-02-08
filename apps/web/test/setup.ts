import "@testing-library/jest-dom";

if (!("matchMedia" in window)) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof (window as any).ResizeObserver === "undefined") {
  (window as any).ResizeObserver = ResizeObserverMock;
  (globalThis as any).ResizeObserver = ResizeObserverMock;
}

if (typeof (window as any).PointerEvent === "undefined") {
  (window as any).PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type: string, params?: any) {
      super(type, params);
    }
  };
}

if (
  typeof HTMLElement !== "undefined" &&
  !HTMLElement.prototype.scrollIntoView
) {
  HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
}
