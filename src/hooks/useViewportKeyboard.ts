import { useState, useEffect, RefObject } from "react";

/**
 * Hook for handling viewport changes when keyboard appears/disappears on mobile devices
 * Automatically scrolls input into view when keyboard opens
 */
export function useViewportKeyboard(inputRef?: RefObject<HTMLInputElement>) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleViewportChange = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const keyboardHeight = Math.max(0, windowHeight - viewportHeight);

        setKeyboardHeight(keyboardHeight);

        // Scroll input into view when keyboard appears
        if (keyboardHeight > 0 && inputRef?.current) {
          setTimeout(() => {
            inputRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 150);
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
      handleViewportChange();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          handleViewportChange
        );
      }
    };
  }, [inputRef]);

  return keyboardHeight;
}
