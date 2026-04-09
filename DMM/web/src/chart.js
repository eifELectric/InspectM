let uZoomed = null;
let uRanger = null;

function debounce(fn) {
  let raf;

  return (...args) => {
    if (raf)
      return;

    raf = requestAnimationFrame(() => {
      fn(...args);
      raf = null;
    });
  };
}

function placeDiv(par, cls) {
  let el = document.createElement("div");
  el.classList.add(cls);
  par.appendChild(el);
  return el;
}

function on(ev, el, fn) {
  el.addEventListener(ev, fn);
}

function off(ev, el, fn) {
  el.removeEventListener(ev, fn);
}


let x0;
let lft0;
let rgt0;

const lftWid = {left: null, width: null};
const minMax = {min: null, max: null};

const BOUNDARY_LEFT  = 0;
const BOUNDARY_RIGHT = 1;
const BOUNDARY_BOTH  = 2;

function update(newLft, newRgt, movedBoundary) {
  let maxRgt = uRanger.bbox.width / uPlot.pxRatio;

  if (movedBoundary == BOUNDARY_BOTH) {
    let initWidth = newRgt - newLft;

    if (newRgt > maxRgt) {
      newRgt = maxRgt;
      newLft = newRgt-initWidth;
    }
    else if (newLft < 0) {
      newLft = 0;
      newRgt = newLft+initWidth;
    }
  }
  else {
    if (newLft > newRgt) {
      if (movedBoundary == BOUNDARY_LEFT)
        newLft = newRgt;
      else if (movedBoundary == BOUNDARY_RIGHT)
        newRgt = newLft;
    }

    newLft = Math.max(0, newLft);
    newRgt = Math.min(newRgt, maxRgt);
  }

  zoom(newLft, newRgt - newLft);
}

function select(newLft, newWid) {
  lftWid.left = newLft;
  lftWid.width = newWid;
  uRanger.setSelect(lftWid, false);
}

function zoom(newLft, newWid) {
  minMax.min = uRanger.posToVal(newLft, 'x');
  minMax.max = uRanger.posToVal(newLft + newWid, 'x');
  uZoomed.setScale('x', minMax);
}

function bindMove(e, onMove) {
  x0 = e.clientX;
  lft0 = uRanger.select.left;
  rgt0 = lft0 + uRanger.select.width;

  const _onMove = debounce(onMove);
  on("mousemove", document, _onMove);

  const _onUp = e => {
    off("mouseup", document, _onUp);
    off("mousemove", document, _onMove);
    viaGrip = false;
  };
  on("mouseup", document, _onUp);

  e.stopPropagation();
}


//color ##e6e6f0

// converts the legend into a simple tooltip
function legendAsTooltipPlugin({ className, style = { backgroundColor:"rgba(230, 230, 240, 0.9)", color: "black" } } = {}) {
  let legendEl;

  function init(u, opts) {
    legendEl = u.root.querySelector(".u-legend");

    legendEl.classList.remove("u-inline");
    className && legendEl.classList.add(className);

    uPlot.assign(legendEl.style, {
      textAlign: "left",
      pointerEvents: "none",
      display: "none",
      position: "absolute",
      left: 0,
      top: 0,
      zIndex: 100,
      //invertieren
      boxShadow: "2px 2px 10px rgba(255,255,255,0.5)",
      ...style
    });

    // hide series color markers
    const idents = legendEl.querySelectorAll(".u-marker");

    for (let i = 0; i < idents.length; i++)
      idents[i].style.display = "none";

    const overEl = u.over;
    overEl.style.overflow = "visible";

    // move legend into plot bounds
    overEl.appendChild(legendEl);

    // show/hide tooltip on enter/exit
    overEl.addEventListener("mouseenter", () => {legendEl.style.display = null;});
    overEl.addEventListener("mouseleave", () => {legendEl.style.display = "none";});

    // let tooltip exit plot
  //	overEl.style.overflow = "visible";
  }

  function update(u) {
    const { left, top } = u.cursor;
    legendEl.style.transform = "translate(" + left + "px, " + top + "px)";
  }

  return {
    hooks: {
      init: init,
      setCursor: update,
    }
  };
}


function createChart(xyData, xDescription, yDescription, xUnit, yUnit, htmlElement) {
  if (uRanger) {
    uRanger.destroy();
  }

  if (uZoomed) {
    uZoomed.destroy();
  }

  const textColor = window.getComputedStyle(document.body).getPropertyValue("--text-color");
  const lineColor = window.getComputedStyle(document.body).getPropertyValue('--chart-line-color');
  const MIN_RANGE = xyData[0][1] - xyData[0][0];

  const zoomedOpts = {
    //	title: "Zoomed Area",
    width: htmlElement.clientWidth,
    height: 500, //htmlElement.clientHeight,
    plugins: [
      legendAsTooltipPlugin()
    ],
    cursor: {
      points: {
        size:   (u, seriesIdx)       => u.series[seriesIdx].points.size * 2.5,
        width:  (u, seriesIdx, size) => size / 4,
        stroke: (u, seriesIdx)       => u.series[seriesIdx].points.stroke(u, seriesIdx) + '90',
        fill:   (u, seriesIdx)       => "#fff",
      },
      drag: {
        x: true,
        y: false
      },
    },
    select: {
      over: false,
    },
    scales: {
      x: {
        time: false,
        range: (u, min, max) => {
          if (max - min < MIN_RANGE) {
            const mid = (max + min) / 2;
            return [mid - MIN_RANGE / 2, mid + MIN_RANGE / 2];
          }
          return [min, max];
        }
      },
    },
    axes: [
      {
        //label: `${v} ${xUnit}`,
        values: (u, vals) => vals.map(v => `${v} ${xUnit}`),
        stroke: textColor, //axesLabelColor
        grid: {
          width: 1, // devicePixelRatio,
          stroke: "#2c3235", //gridColor
        },
        ticks: {
          width: 1, // devicePixelRatio,
          stroke: "#2c3235",//gridColor
        }
      },
      {
        //label: `${v} ${yUnit}`,
        values: (u, vals) => vals.map(v => `${v} ${yUnit}`),
        stroke: textColor, //axesLabelColor,
        size: 75,
        grid: {
          width: 1, //devicePixelRatio,
          stroke: "#2c3235",  //gridColor
        },
        ticks: {
          width: 1, //devicePixelRatio,
          stroke: "#2c3235", //gridColor
        }
      },
    ],
    series: [
      {
        label: `${xDescription} (${xUnit})`,
        values: (u, vals) => vals.map(v => `${v} ${xUnit}`),
      },
      {
        label: `${yDescription} (${yUnit})`,
        stroke: lineColor, //Color
        width: 2,
        fill: lineColor + "1A", //Color
      }
    ],
    hooks : {
      setScale : [
        uZoomed => {
          let left = Math.round(uRanger.valToPos(uZoomed.scales.x.min, 'x'));
          let right = Math.round(uRanger.valToPos(uZoomed.scales.x.max, 'x'));
          select(left, right-left);
        }
      ]
    }
  };
  
  uZoomed = new uPlot(zoomedOpts, xyData, htmlElement);

  const rangerOpts = {
    width: htmlElement.clientWidth,
    height: 100,
    cursor: {
      x: false,
      y: false,
      points: {
        show: false,
      },
      drag: {
        setScale: false,
        setSelect: true,
        x: true,
        y: false,
      },
    },
    axes: [
      {
        //label: `${v} ${xUnit}`,
        values: (u, vals) => vals.map(v => `${v} ${xUnit}`),
        stroke: textColor, //axesLabelColor
        grid: {
          width: 1, // devicePixelRatio,
          stroke: "#2c3235", //gridColor
        },
        ticks: {
          width: 1, // devicePixelRatio,
          stroke: "#2c3235",//gridColor
        }
      },
      {
        //label: `${v} ${yUnit}`,
        values: (u, vals) => vals.map(v => `${v} ${yUnit}`),
        stroke: textColor, //axesLabelColor
        size: 75,
        grid: {
          width: 1, //devicePixelRatio,
          stroke: "#2c3235",  //gridColor
        },
        ticks: {
          width: 1, //devicePixelRatio,
          stroke: "#2c3235", //gridColor
        }
      },
    ],
    legend: {
      show: false
    },
    scales: {
      x: {
        time: false,
      },
    },
    series: [
      {},
      {
        stroke: lineColor, //Color
        fill: lineColor + "1A", //Color
        width: 2,
      }
    ],
    hooks: {
      ready: [
        uRanger => {
          let left = Math.round(uRanger.valToPos(uZoomed.scales.x.min, 'x'));
          let width = Math.round(uRanger.valToPos(uZoomed.scales.x.max, 'x')) - left;
          let height = uRanger.bbox.height / devicePixelRatio;
          uRanger.setSelect({left, width, height}, false);

          const sel = uRanger.root.querySelector(".u-select");

          on("mousedown", sel, e => {
            bindMove(e, e => update(lft0 + (e.clientX - x0), rgt0 + (e.clientX - x0), BOUNDARY_BOTH));
          });

          on("mousedown", placeDiv(sel, "u-grip-l"), e => {
            bindMove(e, e => update(lft0 + (e.clientX - x0), rgt0, BOUNDARY_LEFT));
          });

          on("mousedown", placeDiv(sel, "u-grip-r"), e => {
            bindMove(e, e => update(lft0, rgt0 + (e.clientX - x0), BOUNDARY_RIGHT));
          });
        }
      ],
      setSelect: [
        uRanger => {
          zoom(uRanger.select.left, uRanger.select.width);
        }
      ],
    }
  };

  uRanger = new uPlot(rangerOpts, xyData, htmlElement);
}
