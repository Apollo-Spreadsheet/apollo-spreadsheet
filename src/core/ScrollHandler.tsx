import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { createPortal } from "react-dom";
import { WindowScroller } from "react-virtualized";
import { debounce } from "lodash";
import { makeStyles } from "@material-ui/core/styles";

const recomputeDebounceTimeout = 1000;

const useStyles = makeStyles(() => ({
  scrollContent: {
    height: "10px",
  },
  root: {
    overflowX: "hidden",
    minHeight: "10px",
    "&::-webkit-scrollbar-track": {
      borderRadius: "10px",
      opacity: 0.5,
      "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,.3)",
    },
    "&::-webkit-scrollbar": {
      // width: `px`,
      height: "5px",
      opacity: 0.5,
    },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: "10px",
      opacity: 0.5,
      "-webkit-box-shadow": "inset 0 0 6px rgba(0,0,0,.3)",
    },
    "&:hover":{
      overflowX: 'auto'
    }
  },
}));
const ScrollHandler = forwardRef(
  (
    { children, scrollContainer, width, totalColumnWidth }: any,
    componentRef: any
  ) => {
    const scrollChildRef = useRef<any>(null);
    const headerRef = useRef<any>(null);
    const gridRef = useRef<any>(null);
    const fakeScrollerRef = useRef<any>(null);
    const [stickyScroller, setStickyScroller] = useState(true);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrolling, setScrolling] = useState(false);

    const classes = useStyles();
    // exposing api for resetting
    useImperativeHandle(componentRef, () => ({
      recompute: () => {
        setScrollLeft(0);
        setScrolling(false);
      },
      forceUpdate: () => {
        if (!headerRef.current || !gridRef.current) {
          return;
        }
        headerRef.current.forceUpdate();
        gridRef.current.forceUpdate();
      },
    }));

    // updating fake scroller if scrolled on grid body
    useEffect(() => {
      if (
        !fakeScrollerRef.current ||
        fakeScrollerRef.current.scrollLeft === scrollLeft
      ) {
        return;
      }

      fakeScrollerRef.current.scrollLeft = scrollLeft;
    }, [scrollLeft]);

    // update sticky status of fake scroller on each update if not scrolling
    useEffect(() => {
      if (!scrollChildRef.current || scrolling) {
        return;
      }

      const clientRect = scrollChildRef.current.getBoundingClientRect();

      setStickyScroller(clientRect.bottom > window.innerHeight);
    });

    // reset scrolling flag when scroll stops
    const setNotScrolling = useCallback(
      debounce(() => {
        setScrolling(false);
      }, 100),
      []
    );

    const handleScroll = useCallback(({ scrollLeft: paramScrollLeft }) => {
      setScrollLeft(paramScrollLeft);
      setScrolling(true);
      setNotScrolling();
    }, []);

    // call virtualized recompute when window scroller detects resize
    const onResize = useCallback(
      debounce(() => {
        if (!headerRef.current || !gridRef.current) {
          return;
        }
        headerRef.current.recomputeGridSize();
        gridRef.current.recomputeGridSize();
      }, recomputeDebounceTimeout),
      []
    );

    // const onMouseMove = () => {
    //   console.warn("Updating the scroll visibility")
    //   if (scrolling){
    //     return
    //   }
    //   setScrolling(true)
    // }
    return (
      <>
        <WindowScroller
          scrollElement={scrollContainer || window}
          onResize={onResize}
        >
          {({ height, isScrolling, scrollTop, registerChild }) => (
            <div
              ref={(ref) => {
                scrollChildRef.current = ref;
                registerChild(ref);
              }}
            >
              {children({
                height,
                onScroll: handleScroll,
                isScrolling: isScrolling || scrolling,
                scrollTop,
                scrollLeft,
                headerRef,
                gridRef,
              })}
              {totalColumnWidth > width ? (
                <div
                  id="fake-scroller"
                  className={classes.root}
                  style={{
                    width,
                    position: stickyScroller ? "sticky" : "relative",
                    bottom: stickyScroller ? "0px" : "unset",
                  }}
                  onScroll={(e) => handleScroll(e.target)}
                 // onMouseMove={onMouseMove}
                  ref={fakeScrollerRef}
                >
                  <div
                    id="fake-scroller-content"
                    className={classes.scrollContent}
                    style={{ width: totalColumnWidth }}
                  />
                </div>
              ) : null}
            </div>
          )}
        </WindowScroller>
        {createPortal(
          // added to prevent the lag issue between header and body scroll
          <canvas
            style={{
              position: "absolute",
              top: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />,
          document.body
        )}
      </>
    );
  }
);

export default ScrollHandler;
