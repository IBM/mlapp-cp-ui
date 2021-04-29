<template>
  <div style="height:100%;width:100%" ref="stages">
    <svg class="stages" />
  </div>
</template>

<script>
import * as d3 from "d3";
import { scaleLinear, scaleOrdinal, scaleBand } from "d3-scale";

export default {
  name: "StagesChart",
  mixins: [], // Inherit all options from BaseChart
  components: {},
  data() {
    return {
      data: null,
      height: null,
      width: null,
      min: null,
      max: null
    };
  },
  props: {
    config: { type: Object }
  },
  destroyed() {
    window.removeEventListener("resize", this.createChart);
  },
  created() {},
  computed: {
    xScale() {
      return scaleBand()
        .domain(this.data.map(d => d.name))
        .rangeRound([0, this.width]);
    },
    boxSize() {
      if (this.width / this.data.length <= this.height) {
        return scaleBand()
          .domain(this.data.map(d => d.name))
          .rangeRound([0, this.width]);
      } else {
        return scaleBand()
          .domain(this.data.map(d => d.name))
          .rangeRound([0, this.height * this.config.data.length]);
      }
    },
    boxScale() {
      return scaleLinear()
        .domain([this.min, this.max])
        .range([0.1, 0.7]);
    }
  },
  mounted() {
    this.data = this.config.data;
    const domain = this.data.map(d => {
      return d.value;
    });
    this.max = Math.max(...domain);
    this.min = Math.min(...domain);

    this.createChart();
    window.addEventListener("resize", this.createChart);
  },
  methods: {
    createLine(data, value) {
      const margin_top = (this.boxSize.bandwidth() * 0.15) / 2;
      let width = 0;
      let margin = 0;
      if (data.value > 0) {
        width = this.boxSize.bandwidth() * this.boxScale(data.value);
        margin =
          (this.xScale.bandwidth() -
            this.boxSize.bandwidth() * this.boxScale(data.value)) /
          2;
      } else {
        width = 0;
        margin = this.xScale.bandwidth() / 2;
      }
      const rect_width = 0;
      let lineCommand =
        "M " + this.xScale(data.name) + "," + (this.height / 2 + margin_top);
      lineCommand +=
        "L " +
        (this.xScale(data.name) + margin / 8) +
        "," +
        (this.height / 2 + margin_top);

      lineCommand +=
        " C " +
        (this.xScale(data.name) + margin / 4) +
        "," +
        (this.height / 2 + margin_top);
      lineCommand +=
        " " +
        (this.xScale(data.name) + margin / 2) +
        "," +
        (this.height / 2 + margin_top - (value * width) / 2);
      lineCommand +=
        " " +
        (this.xScale(data.name) + margin) +
        " " +
        (this.height / 2 +
          margin_top -
          (value * width) / 2 -
          value * rect_width);
      lineCommand +=
        " L " +
        (this.xScale(data.name) + margin + width) +
        "," +
        (this.height / 2 +
          margin_top -
          (value * width) / 2 -
          value * rect_width);
      lineCommand +=
        " C " +
        (this.xScale(data.name) + margin * 1.5 + width) +
        "," +
        (this.height / 2 + margin_top - (value * width) / 2);
      lineCommand +=
        " " +
        (this.xScale(data.name) + margin * 1.75 + width) +
        "," +
        (this.height / 2 + margin_top);
      lineCommand +=
        " " +
        (this.xScale(data.name) + (margin * 15) / 8 + width) +
        "," +
        (this.height / 2 + margin_top);
      lineCommand +=
        "L " +
        (this.xScale(data.name) + width + margin * 2) +
        "," +
        (this.height / 2 + margin_top);

      return lineCommand;
    },
    createChart() {
      this.width = this.$refs.stages.clientWidth;
      this.height = this.$refs.stages.clientHeight;
      const margin_top = (this.boxSize.bandwidth() * 0.15) / 2; // this is the font-size for name per stage divided by two.  We will shift the entire thing down by this value to center it
      const that = this;
      d3.select("g.stages").remove();

      const svg = d3
        .select("svg.stages")
        .attr("width", this.width)
        .attr("height", this.height)
        .append("g")
        .attr("class", "stages")
        .attr("transform", "translate(" + 0 + "," + 0 + ")");

      [1, -1].forEach(value => {
        svg
          .selectAll("path." + value == 1 ? "upper" : "lower")
          .data(this.data)
          .enter()
          .append("path")
          .attr("class", "upper")
          .attr("d", function(d) {
            return that.createLine(d, value);
          })
          .attr("stroke", function(d) {
            return that.config ? that.config.pathColor : "#0097DA";
          })
          .attr("stroke-width", 4)
          .attr("fill", "none");
      });

      svg
        .selectAll("text.name")
        .data(this.data)
        .enter()
        .append("text")
        .attr("class", "name")
        .attr("x", function(d) {
          return that.xScale(d.name) + that.xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
          return (
            that.height / 2 -
            (that.boxSize.bandwidth() * 0.7) / 2 -
            10 +
            margin_top
          );
        })
        .style("font-size", margin_top * 2)
        .style("font-weight", "bold")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "top")
        .text(function(d) {
          return d.name;
        });

      svg
        .selectAll("rect")
        .data(this.data)
        .enter()
        .append("rect")
        .attr("stroke", function(d) {
          return that.config.colorScale(d.value);
        })
        .attr("fill", this.config.background ? this.config.background : "white")
        .attr("stroke-width", "3")
        .attr("rx", "5")
        .attr("ry", "5")
        .attr("x", function(d) {
          if (d.value != 0) {
            return (
              that.xScale(d.name) +
              (that.xScale.bandwidth() - that.boxSize.bandwidth() * 0.7) / 2
            );
          }
          return (
            that.xScale(d.name) +
            (that.xScale.bandwidth() - that.boxSize.bandwidth() * 0.2) / 2
          );
        })
        .attr("y", function(d) {
          if (d.value != 0) {
            return (
              that.height / 2 -
              (that.boxSize.bandwidth() * 0.7) / 2 +
              margin_top
            );
          }
          return (
            that.height / 2 - (that.boxSize.bandwidth() * 0.2) / 2 + margin_top
          );
        })
        .attr("height", function(d) {
          if (d.value != 0) {
            return that.boxSize.bandwidth() * 0.7;
          }
          return that.boxSize.bandwidth() * 0.2;
        })
        .attr("width", function(d) {
          if (d.value != 0) {
            return that.boxSize.bandwidth() * 0.7;
          }
          return that.boxSize.bandwidth() * 0.2;
        });

      const text = svg
        .selectAll("text.value")
        .data(this.data)
        .enter()
        .append("text")
        .attr("class", "value")
        .attr("x", function(d) {
          return that.xScale(d.name) + that.xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
          return that.height / 2 + margin_top;
        })
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-size", this.boxSize.bandwidth() / 8);

      text
        .append("tspan")
        .attr("x", function(d) {
          return that.xScale(d.name) + that.xScale.bandwidth() / 2;
        })
        .attr("alignment-baseline", "top")
        .style("font-size", this.boxSize.bandwidth() / 4)
        .style("font-weight", "500")
        .text(function(d) {
          if (d.value != 0) {
            return d.value;
          }
        });

      text
        .append("tspan")
        .attr("x", function(d) {
          return that.xScale(d.name) + that.xScale.bandwidth() / 2;
        })
        .attr("y", function(d) {
          return that.height / 2 + that.boxSize.bandwidth() / 8 + margin_top;
        })
        .attr("font-size", this.boxSize.bandwidth() / 8)
        .attr("alignment-baseline", "top")
        .text(function(d) {
          if (d.value != 0) {
            return d.value >= 0
              ? that.config.message.positive
              : that.config.message.negative;
          }
        });
    }
  }
};
</script>
<style lang="less" scoped></style>
