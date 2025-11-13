(function (global) {
  /**
   * Render a Google Scholar timeline using ECharts.
   *
   * @param {string|HTMLElement} container  DOM id or element where the chart is mounted
   * @param {Array<Object>} papers          Paper list:
   *   {
   *     date: 'YYYY-MM-DD',
   *     title: string,
   *     venue: string,
   *     citation: number|string,
   *     authors: string[] | string
   *   }
   * @param {Object} [options]              Optional customization
   *   - xMin, xMax:       time-axis bounds (e.g. '2014-01-01')
   *   - yMin, maxCitation: y-axis bounds
   *   - markAreaData:     ECharts markArea.data array
   *   - backgroundColor, gridBackgroundColor
   *   - seriesName, pointColor, etc.
   *   - showTotal (default: true)
   */
  function renderScholarTimeline(container, papers, options) {
    options = options || {};

    var dom =
      typeof container === "string"
        ? document.getElementById(container)
        : container;

    if (!dom) {
      console.error("renderScholarTimeline: container not found:", container);
      return;
    }

    var paperInfo = (papers || []).map(function (p) {
      return {
        paperDate: p.date,
        paperTitle: p.title,
        paperVenue: p.venue,
        paperCitation: Number(p.citation || 0),
        paperAuthors: Array.isArray(p.authors)
          ? p.authors.join(", ")
          : (p.authors || ""),
      };
    });

    var chart = echarts.init(dom, options.theme || null, options.echartsInitOptions);

    // Keep chart responsive
    window.addEventListener("resize", function () {
      chart.resize();
    });

    var maxCitationValue = paperInfo.length
      ? Math.max.apply(
          null,
          paperInfo.map(function (p) {
            return p.paperCitation;
          })
        )
      : 0;

    var maxCitation =
      typeof options.maxCitation === "number"
        ? options.maxCitation
        : maxCitationValue + (options.citationPadding || 100);

    var totalCitations = paperInfo.reduce(function (sum, item) {
      return sum + Number(item.paperCitation || 0);
    }, 0);

    var showLabels = options.showLabels !== false;

    var series = {
      name: options.seriesName || "Scholar Timeline Papers",
      type: "scatter",
      data: paperInfo.map(function (item) {
        return [
          item.paperDate,
          item.paperCitation,
          item.paperTitle,
          item.paperVenue,
          item.paperAuthors,
        ];
      }),
      symbol: options.symbol || "circle",
      symbolSize: options.symbolSize || 10,
      itemStyle: {
        color: options.pointColor || "green",
        borderColor: options.pointBorderColor || "white",
        opacity: 1,
      },
      emphasis: {
        scale: 1.5,
        itemStyle: {
          borderColor: options.emphasisBorderColor || "black",
        },
      },
      label: {
        // original behavior: show label anchor/line but no text
        show: showLabels,
        formatter: function () {
          return "";
        },
        fontSize: 14,
        color: "black",
        position: "bottom",
      },
      labelLayout: function () {
        return {
          y: chart.getHeight() - 72,
        };
      },
      labelLine: {
        show: showLabels,
        length2: 0,
        lineStyle: {
          color: "black",
          width: 0.5,
        },
      },
      tooltip: {
        formatter: function (params) {
          var value = params.value || [];
          var citation = value[1];
          var title = value[2];
          var venue = value[3];
          var authors = value[4];

          var tooltipText = "";
          tooltipText += "<div><b>" + (title || "") + "</b></div>";

          if (authors) {
            tooltipText +=
              '<div style="color: #555;">' + authors + "</div>";
          }

          tooltipText +=
            "<div style='display: flex; justify-content: space-between;'>";
          tooltipText += "<div>" + (venue || "") + "</div>";
          tooltipText +=
            "<div>Citations: " + (citation || 0) + "</div>";
          tooltipText += "</div>";

          return tooltipText;
        },
      },
    };

    // Allow caller to supply their own markArea definitions (e.g. Bachelor/Master/PhD)
    if (options.markAreaData) {
      series.markArea = {
        data: options.markAreaData,
      };
    }

    var option = {
      backgroundColor: options.backgroundColor || "#eff6ee",
      grid: {
        show: true,
        containLabel: true,
        backgroundColor: options.gridBackgroundColor || "#fff",
        borderWidth: 0,
        top:
          typeof options.gridTop === "number"
            ? options.gridTop
            : 90,
        bottom:
          typeof options.gridBottom === "number"
            ? options.gridBottom
            : 50,
      },
      tooltip: {
        trigger: "item",
      },
      textStyle: {
        fontFamily:
          options.fontFamily || "Inter, Arial, Roboto, sans-serif",
        color: "black",
      },
      xAxis: {
        type: "time",
        name: options.xAxisName || "Date",
        nameLocation: "middle",
        axisLabel: {
          fontSize: 14,
          color: "black",
          formatter: options.xAxisFormatter || "{yyyy}",
        },
        nameTextStyle: {
          fontSize: 16,
          color: "black",
        },
        splitLine: {
          show: false,
          lineStyle: {
            type: "dashed",
          },
        },
        // Let ECharts auto-range unless user overrides
        min: options.xMin,
        max: options.xMax,
        nameGap:
          typeof options.xAxisNameGap === "number"
            ? options.xAxisNameGap
            : 30,
      },
      yAxis: {
        type: "value",
        name: options.yAxisName || "📑 Paper Citation",
        axisLabel: {
          fontSize: 14,
          color: "black",
          showMaxLabel: false,
        },
        nameTextStyle: {
          fontSize: 16,
          color: "black",
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: "dashed",
          },
        },
        min:
          typeof options.yMin === "number"
            ? options.yMin
            : 0,
        max: maxCitation,
        nameGap:
          typeof options.yAxisNameGap === "number"
            ? options.yAxisNameGap
            : 30,
      },
      dataZoom:
        options.dataZoom !== undefined
          ? options.dataZoom
          : [
              {
                type: "inside",
                xAxisIndex: 0,
              },
            ],
      graphic: {
        elements:
          options.showTotal === false
            ? []
            : [
                {
                  type: "text",
                  right: options.totalRight || 20,
                  bottom: options.totalBottom || 15,
                  style: {
                    text:
                      (options.totalLabelPrefix || "# Citation: ") +
                      totalCitations,
                    fontSize: 16,
                    fontFamily:
                      options.fontFamily ||
                      "Inter, Arial, Roboto, sans-serif",
                    fill: "#333",
                  },
                },
              ],
      },
      series: [series],
    };

    chart.setOption(option);
    return chart; // in case caller wants to access the ECharts instance
  }

  global.renderScholarTimeline = renderScholarTimeline;
})(window);
