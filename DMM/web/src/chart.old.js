let chart = null;

function createChart(xyData, xDescription, yDescription, xUnit, yUnit, htmlElement) {
  if (chart) {
    chart.destroy();
  }

  let options = {
    title: "Messdatendiagramm",
    id: "chart",
    class: "lineChart",
    width: htmlElement.clientWidth,
    height: 600, //htmlElement.clientHeight,
    cursor: {
      points: {
        size:   (u, seriesIdx)       => u.series[seriesIdx].points.size * 2.5,
        width:  (u, seriesIdx, size) => size / 4,
        stroke: (u, seriesIdx)       => u.series[seriesIdx].points.stroke(u, seriesIdx) + '90',
        fill:   (u, seriesIdx)       => "#fff",
      },
      sync: {
        key: 0,
      },
      drag: {
        x: true,
        y: false,
      },
    },
    scales: {
      x: {
        time: false,
      },
    },
    axes: [
      {
        //label: `${v} ${xUnit}`,
        values: (u, vals) => vals.map(v => `${v} ${xUnit}`),
        stroke: "#c7d0d9",
        grid: {
          width: 1, // devicePixelRatio,
          stroke: "#2c3235",
        },
        ticks: {
          width: 1, // devicePixelRatio,
          stroke: "#2c3235",
        }
      },
      {
        //label: `${v} ${yUnit}`,
        values: (u, vals) => vals.map(v => `${v} ${yUnit}`),
        stroke: "#c7d0d9",
        grid: {
          width: 1, //devicePixelRatio,
          stroke: "#2c3235",
        },
        ticks: {
          width: 1, //devicePixelRatio,
          stroke: "#2c3235",
        }
      },
    ],
    series: [
      {
        label: `${xDescription} (${xUnit})`,
        values: (u, vals) => vals.map(v => `${v} ${xUnit}`),
      },
      Object.assign({
        label: `${yDescription} (${yUnit})`,
        width: 1, //devicePixelRatio,
        drawStyle: 2, //drawStyles.points,
        lineInterpolation: null,
      }, {
        drawStyle:         0, //drawStyles.line,
        lineInterpolation: 0, //lineInterpolations.linear,
        stroke:            "#7EB26D",
        fill:              "#7EB26D" + "1A",
      }),
    ],
  };

  chart = new uPlot(options, xyData, htmlElement);
}