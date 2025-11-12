import React, { useState, useEffect, useRef, useContext } from "react";

// Context
import { contentStateContext } from "../context/ContentState";

const ZoomContainer = () => {
  const [contentState, setContentState] = useContext(contentStateContext);
  const [zoomLevel, setZoomLevel] = useState(1);
  const scaleRef = useRef(1);
  const translateXRef = useRef(0);
  const translateYRef = useRef(0);
  const cursorXRef = useRef(0);
  const cursorYRef = useRef(0);
  const isKeyDownRef = useRef(false);
  const isKeyUpRef = useRef(false);
  const zoomSelector = useRef(null);
  const oldPosition = useRef(null);
  const oldWidth = useRef(null);
  const oldHeight = useRef(null);
  const oldOverflow = useRef(null);
  const oldTop = useRef(null);
  const oldLeft = useRef(null);
  const contentStateRef = useRef(contentState);
  const observer = useRef(null);
  const isClickZoomActiveRef = useRef(false);
  const clickZoomTimeoutRef = useRef(null);
  const clickZoomIndicatorRef = useRef(null);

  useEffect(() => {
    oldPosition.current = document.body.style.position;
    oldWidth.current = document.body.style.width;
    oldHeight.current = document.body.style.height;
    oldOverflow.current = document.body.style.overflow;
    oldTop.current = document.body.style.top;
    oldLeft.current = document.body.style.left;
  }, []);

  useEffect(() => {
    contentStateRef.current = contentState;
  }, [contentState]);

  
  const handleClick = (e) => {
    // Skip if zoom is not enabled or click zoom is not enabled
    // Allow zoom during recording - it's a useful feature for annotating recordings
    if (!contentStateRef.current.zoomEnabled || !contentStateRef.current.clickZoomEnabled) return;

    // If click zoom is already active, check if this click should deactivate it
    if (isClickZoomActiveRef.current) {
      // Allow deactivation on any click that's not on UI elements
      if (
        !e.target.closest(".ToolbarRoot") &&
        !e.target.closest(".ToolbarRecordingControls") &&
        !e.target.closest(".ToolbarToggleWrap") &&
        !e.target.closest(".ToolbarPaused") &&
        !e.target.closest(".Toast") &&
        !e.target.closest("#screenity-root-container") &&
        !e.target.closest("#screenity-ui")
      ) {
        // Clear timeout and deactivate
        if (clickZoomTimeoutRef.current) {
          clearTimeout(clickZoomTimeoutRef.current);
          clickZoomTimeoutRef.current = null;
        }
        isClickZoomActiveRef.current = false;
        zoomOut();
        return;
      }
    }

    // Ignore clicks inside the toolbar and other UI elements for activation
    if (
      e.target.closest(".ToolbarRoot") ||
      e.target.closest(".ToolbarRecordingControls") ||
      e.target.closest(".ToolbarToggleWrap") ||
      e.target.closest(".ToolbarPaused") ||
      e.target.closest(".Toast") ||
      e.target.closest("#screenity-root-container") ||
      e.target.closest("#screenity-ui")
    ) {
      return;
    }

    // Ignore clicks on canvas wrapper
    const canvasWrapper = document.getElementById("canvas-wrapper-screenity");
    if (canvasWrapper && canvasWrapper.contains(e.target)) {
      return;
    }

    // Clear any existing timeout
    if (clickZoomTimeoutRef.current) {
      clearTimeout(clickZoomTimeoutRef.current);
    }

    // Activate click zoom at the clicked position
    const { top, left } = document.documentElement.getBoundingClientRect();
    cursorXRef.current = e.clientX - left;
    cursorYRef.current = e.clientY - top;

    isClickZoomActiveRef.current = true;
    zoomIn();
    showClickZoomIndicator();

    // Auto-deactivate zoom after 3 seconds
    clickZoomTimeoutRef.current = setTimeout(() => {
      isClickZoomActiveRef.current = false;
      zoomOut();
    }, 3000);
  };

  const handleKeyUp = (e) => {
    if (e.code === "KeyE" || e.altKey || e.shiftKey) {
      isKeyDownRef.current = false;
      isKeyUpRef.current = true;
      zoomOut();

      setTimeout(() => {
        isKeyUpRef.current = false;
        setTimeout(() => {
          enableScrolling();
        }, 500);
      }, 500);
    }
  };

  const handleKeyDown = (e) => {
    // Alt / Option + Shift + Z (existing keyboard zoom)
    if (e.code === "KeyE" && e.altKey && e.shiftKey) {
      //if (!contentStateRef.current.recording) return;
      if (!contentStateRef.current.zoomEnabled) return;
      if (isKeyDownRef.current) return;
      isKeyDownRef.current = true;
      zoomIn();
    }

    // ESC key to exit click zoom
    if (e.code === "Escape" && isClickZoomActiveRef.current) {
      if (clickZoomTimeoutRef.current) {
        clearTimeout(clickZoomTimeoutRef.current);
        clickZoomTimeoutRef.current = null;
      }
      isClickZoomActiveRef.current = false;
      zoomOut();
    }
  };

  const handleMouseMove = (e) => {
    //if (!contentStateRef.current.recording) return;
    if (!contentStateRef.current.zoomEnabled) return;

    // Update cursor position for both keyboard and click zoom
    const { top, left } = document.documentElement.getBoundingClientRect();

    cursorXRef.current = e.clientX - left;
    cursorYRef.current = e.clientY - top;

    // Apply transform only if zoom is active (keyboard or click)
    if (isKeyDownRef.current || (contentStateRef.current.clickZoomEnabled && isClickZoomActiveRef.current)) {
      applyTransform();
    }
  };

  const zoomIn = () => {
    scaleRef.current *= 1.5;
    setZoomLevel(scaleRef.current);
    applyTransformWithTransition();
    preventScrolling();
  };

  const showClickZoomIndicator = () => {
    // Remove existing indicator if any
    hideClickZoomIndicator();

    const indicator = document.createElement("div");
    indicator.id = "screenity-click-zoom-indicator";
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
      color: white;
      padding: 12px 18px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 999999;
      pointer-events: none;
      transition: all 0.3s ease;
      box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.12);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    `;
    indicator.innerHTML = `
      🔍 ${chrome.i18n.getMessage("clickZoomActivated") || "Click zoom activated"}<br>
      <small style="opacity: 0.9; font-weight: 400;">${chrome.i18n.getMessage("clickToZoomHint") || "Click again or press ESC to exit"}</small>
    `;

    document.body.appendChild(indicator);
    clickZoomIndicatorRef.current = indicator;

    // Auto-hide after 2.5 seconds (before zoom auto-exits)
    setTimeout(() => {
      if (indicator && indicator.parentNode) {
        indicator.style.opacity = '0';
        setTimeout(() => {
          if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
          }
        }, 300);
      }
    }, 2500);
  };

  const hideClickZoomIndicator = () => {
    if (clickZoomIndicatorRef.current && clickZoomIndicatorRef.current.parentNode) {
      clickZoomIndicatorRef.current.parentNode.removeChild(clickZoomIndicatorRef.current);
      clickZoomIndicatorRef.current = null;
    }
  };

  const zoomOut = () => {
    scaleRef.current = 1;
    translateXRef.current = 0;
    translateYRef.current = 0;
    setZoomLevel(scaleRef.current);
    isClickZoomActiveRef.current = false;

    // Clear any click zoom timeout
    if (clickZoomTimeoutRef.current) {
      clearTimeout(clickZoomTimeoutRef.current);
      clickZoomTimeoutRef.current = null;
    }

    // Hide the indicator
    hideClickZoomIndicator();

    // Apply the transform to reset zoom
    if (zoomSelector.current) {
      applyTransformWithTransition();
    } else {
      // If zoom selector is not available yet, try to find it directly
      const zoomWrap = document.querySelector("#screenity-zoom-wrap");
      const canvasWrapper = document.querySelector("#canvas-wrapper-screenity");

      if (zoomWrap) {
        zoomWrap.style.transition = "transform 0.5s";
        zoomWrap.style.transform = `scale(1) translate(0px, 0px)`;
        zoomWrap.style.transformOrigin = `50% 50%`;
      }

      if (canvasWrapper) {
        canvasWrapper.style.transition = "transform 0.5s";
        canvasWrapper.style.transform = `scale(1) translate(0px, 0px)`;
        canvasWrapper.style.transformOrigin = `50% 50%`;
      }
    }
  };

  const applyTransform = () => {
    // Try to use zoomSelector if available, otherwise find it directly
    const zoomElement = zoomSelector.current || document.querySelector("#screenity-zoom-wrap");
    if (!zoomElement) return;

    //if (!contentStateRef.current.recording) return;
    const { current: scale } = scaleRef;
    const { current: translateX } = translateXRef;
    const { current: translateY } = translateYRef;

    const originX = cursorXRef.current - translateX;
    const originY = cursorYRef.current - translateY;

    zoomElement.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    zoomElement.style.transformOrigin = `${originX}px ${originY}px`;

    // I also need to apply the transform to the #canvas-wrapper, if it exists
    const canvasWrapper = document.querySelector("#canvas-wrapper-screenity");

    // Substract scroll position
    const fixedOriginX = originX - window.scrollX;
    const fixedOriginY = originY - window.scrollY;
    if (canvasWrapper) {
      canvasWrapper.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
      canvasWrapper.style.transformOrigin = `${fixedOriginX}px ${fixedOriginY}px`;
    }

    // Also to #mockup-wrapper
    //const mockupWrapper = document.querySelector("#mockup-wrapper");
    //if (mockupWrapper) {
    //  mockupWrapper.style.transform = `scale(${scale}) translate(${translateX}px, ${translateY}px)`;
    //  mockupWrapper.style.transformOrigin = `${originX}px ${originY}px`;
    //}
  };

  const applyTransformWithTransition = () => {
    const zoomElement = zoomSelector.current || document.querySelector("#screenity-zoom-wrap");
    if (!zoomElement) return;

    zoomElement.style.transition = "transform 0.5s";
    if (document.querySelector("#canvas-wrapper-screenity")) {
      document.querySelector("#canvas-wrapper-screenity").style.transition =
        "transform 0.5s";
    }
    //if (document.querySelector("#mockup-wrapper")) {
    //  document.querySelector("#mockup-wrapper").style.transition =
    //    "transform 0.5s";
    //}
    applyTransform();
  };

  const preventScrolling = () => {
    /*
    zoomSelector.current.style.position = "fixed";
    zoomSelector.current.style.top = "0";
    zoomSelector.current.style.left = "0";
    zoomSelector.current.style.overflow = "hidden";
    zoomSelector.current.style.width = "100vw";
    zoomSelector.current.style.height = "100vh";
		*/
  };

  const enableScrolling = () => {
    if (!zoomSelector.current) return;
    zoomSelector.current.style.position = oldPosition.current;
    zoomSelector.current.style.top = oldTop.current;
    zoomSelector.current.style.left = oldLeft.current;
    zoomSelector.current.style.overflow = oldOverflow.current;
    zoomSelector.current.style.width = oldWidth.current;
    zoomSelector.current.style.height = oldHeight.current;
  };

  useEffect(() => {
    // Add click listener if both zoom and click zoom are enabled
    // Allow zoom during recording - it's useful for annotating recordings
    const shouldAddClickListener = contentState.zoomEnabled &&
                                 contentState.clickZoomEnabled;

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);

    if (shouldAddClickListener) {
      window.addEventListener("click", handleClick, true);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);

      if (shouldAddClickListener) {
        window.removeEventListener("click", handleClick, true);
      }

      // Clean up click zoom timeout on unmount
      if (clickZoomTimeoutRef.current) {
        clearTimeout(clickZoomTimeoutRef.current);
      }

      // Clean up indicator on unmount
      hideClickZoomIndicator();
    };
  }, [contentState.zoomEnabled, contentState.clickZoomEnabled, contentState.showExtension, contentState.recording]);

  useEffect(() => {
    if (!contentState.zoomEnabled) return;
    if (!contentState.showPopup) return;

    setTimeout(() => {
      //if (!contentState.recording) return;
      if (document.querySelector("#screenity-zoom-wrap")) return;
      const div = document.createElement("div");
      div.id = "screenity-zoom-wrap";
      div.style.width = "100vw";
      div.style.height = "100vh";

      // Move the body's children into this wrapper
      while (
        document.body.firstChild &&
        document.body.firstChild.id !== "screenity-ui"
      ) {
        if (document.body.firstChild.id !== "screenity-ui") {
          div.appendChild(document.body.firstChild);
        }
      }

      // Append the wrapper to the body
      document.body.prepend(div);

      document.body.appendChild(document.getElementById("screenity-ui"));
      zoomSelector.current = document.querySelector("#screenity-zoom-wrap");

      observer.current = new MutationObserver((mutations) => {
        if (!contentState.showExtension) {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length > 0) {
              const screenityUi = document.querySelector("#screenity-ui");
              if (screenityUi) {
                // Disconnect the observer
                observer.current.disconnect();
              }
            }
          });
        }
      });

      observer.current.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }, 500);

    return () => {
      setTimeout(() => {
        if (observer.current && typeof observer.current === "object") {
          observer.current.disconnect();
        }
        const zoomWrap = document.querySelector("#screenity-zoom-wrap");
        if (zoomWrap) {
          while (zoomWrap.firstChild) {
            document.body.prepend(zoomWrap.firstChild);
          }

          if (document.body.contains(zoomWrap)) {
            document.body.removeChild(zoomWrap);
          }
        }
        // reset
        scaleRef.current = 1;
        translateXRef.current = 0;
        translateYRef.current = 0;
        setZoomLevel(scaleRef.current);
        isClickZoomActiveRef.current = false;

        // Clean up click zoom timeout
        if (clickZoomTimeoutRef.current) {
          clearTimeout(clickZoomTimeoutRef.current);
          clickZoomTimeoutRef.current = null;
        }
      }, 500);
    };
  }, [contentState.zoomEnabled, contentState.showExtension]);

  useEffect(() => {
    setTimeout(() => {
      if (!contentState.zoomEnabled || !contentState.showExtension) {
        const zoomWrap = document.querySelector("#screenity-zoom-wrap");
        if (zoomWrap) {
          while (zoomWrap.firstChild) {
            document.body.prepend(zoomWrap.firstChild);
          }

          if (document.body.contains(zoomWrap)) {
            document.body.removeChild(zoomWrap);
          }
        }
        // reset
        scaleRef.current = 1;
        translateXRef.current = 0;
        translateYRef.current = 0;
        setZoomLevel(scaleRef.current);
        isClickZoomActiveRef.current = false;

        // Clean up click zoom timeout
        if (clickZoomTimeoutRef.current) {
          clearTimeout(clickZoomTimeoutRef.current);
          clickZoomTimeoutRef.current = null;
        }
      }
    }, 500);
  }, [contentState.zoomEnabled, contentState.showExtension]);

  useEffect(() => {
    if (!zoomSelector.current) return;
    //if (!contentStateRef.current.recording) return;
    if (!contentStateRef.current.zoomEnabled) return;
    if (isKeyDownRef.current || isKeyUpRef.current || isClickZoomActiveRef.current) {
      //preventScrolling();
      applyTransform();
    }
  }, [zoomLevel]);

  return null;
};

export default ZoomContainer;
