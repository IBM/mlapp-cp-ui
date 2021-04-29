<template>
  <div class="chart-container" ref="treemap">
    <a-spin v-if="loading" tip="Loading..."></a-spin>
    <div v-if="!loading" class="treemap">
      <!-- The SVG structure is explicitly defined in the template with attributes derived from component data -->
      <svg :height="height" style="margin-left: 0px;" :width="width">
        <g style="shape-rendering: crispEdges;" transform="translate(0,20)">
          <!-- We can use Vue transitions too! -->
          <transition-group name="list" tag="g" class="depth" v-if="selectedNode">
            <!-- Generate each of the visible squares at a given zoom level (the current selected node) -->
            <g
              class="children"
              v-for="(children, index) in selectedNode._children"
              :key="'c_' + children.id + '_' + index"
            >
              <!--
              The visible square rect element.
              You can attribute directly an event, that fires a method that changes the current node,
              restructuring the data tree, that reactivly gets reflected in the template.
              -->
              <rect
                class="parent"
                :id="children.id"
                :key="children.id"
                :x="x(children.x0)"
                :y="y(children.y0)"
                v-on:click="selectNode"
                :width="x(children.x1 - children.x0 + children.parent.x0)"
                :height="y(children.y1 - children.y0 + children.parent.y0)"
                :style="{ fill: color(children.secondary_value) }"
              >
                <!-- The title attribute -->
                <title>
                  {{ children.data.name }} | {{ children.value }} |
                  {{ children.secondary_value }}
                </title>
              </rect>

              <!-- Generate the children squares (only visible on hover of a square) -->
              <rect
                v-for="child in children._children"
                class="child"
                v-on:click="selectNode"
                :id="getId(child.id)"
                :key="child.id"
                :height="y(child.y1) - y(child.y0)"
                :width="x(child.x1) - x(child.x0)"
                :x="x(child.x0)"
                :y="y(child.y0)"
                :style="{ fill: color(child.secondary_value) }"
              />

              <!-- The visible square text element with the title and value of the child node -->
              <text
                dy="1em"
                :key="'t_' + children.id + '_name'"
                :id="'t_' + children.id + '_name'"
                class="parent-text"
                :x="x(children.x0) + 6"
                :y="y(children.y0) + 6"
                style="font-size:18px"
              >
                {{ children.data.name }}
              </text>

              <!-- <text
              dy="2.25em"
              :key="'t_' + children.id"
              :x="x(children.x0) + 6"
              :y="y(children.y0) + 6"
              style="fill-opacity: 1;"
              >

              {{ children.value }}
              </text>-->

              <text
                v-for="child in children._children"
                class="child child_text"
                :id="getId(child.id) + '_name'"
                :key="child.id + 'name'"
                :x="x(child.x0 + (child.x1 - child.x0) / 2)"
                :y="y(child.y0 + (child.y1 - child.y0) / 2)"
                style="text-anchor:middle"
              >
                {{ child.data.name }}
              </text>
              <text
                v-for="child in children._children"
                class="child"
                :id="child.id + 'val'"
                :key="child.id + 'val'"
                :x="x(child.x0 + (child.x1 - child.x0) / 2)"
                :y="y(child.y0 + (child.y1 - child.y0) / 2) + 20"
                style="text-anchor:middle"
              >
                {{ child.value }}
              </text>
            </g>
          </transition-group>

          <!-- The top most element, representing the previous node -->
          <g class="grandparent">
            <rect
              :height="margin.top"
              :width="width"
              :y="margin.top * -1"
              v-on:click="selectNode"
              :id="parentId"
              v-bind:style="{
                fill:
                  config.header['background'] != undefined
                    ? config.header['background']
                    : 'black'
              }"
            />

            <!-- The visible square text element with the id (basically a breadcumb, if you will) -->
            <text
              dy=".65em"
              x="6"
              y="-14"
              v-bind:style="{
                fill:
                  config.header['font'] != undefined
                    ? config.header['font']
                    : 'white'
              }"
            >
              {{ formatId(selectedNode.id) }}
            </text>
          </g>
          <g id="tooltip" style="visibility:hidden">
            <rect
              class="tooltip"
              width="80"
              height="70"
              style="fill:white;stroke:black;"
            />
            <text
              class="tooltip"
              id="tooltip-name"
              transform="translate(40,20)"
              style="text-anchor:middle"
            />
            <text
              class="tooltip"
              id="tooltip-value"
              transform="translate(40,40)"
              style="text-anchor:middle"
            />
            <text
              class="tooltip"
              id="tooltip-secondary"
              transform="translate(40,60)"
              style="text-anchor:middle"
            />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script>
import { scaleLinear, scaleOrdinal } from "d3-scale";
import { schemeSet3 } from "d3-scale-chromatic";
import { json } from "d3-request";
import { hierarchy, treemap } from "d3-hierarchy";
import { select, getComputedTextLength, selectAll, mouse, event } from "d3";
// import {event as currentEvent} from 'd3-selection'

// To be explicit about which methods are from D3 let's wrap them around an object
// Is there a better way to do this?
const d3 = {
  scaleLinear: scaleLinear,
  scaleOrdinal: scaleOrdinal,
  schemeSet3: schemeSet3,
  json: json,
  hierarchy: hierarchy,
  treemap: treemap,
  select: select,
  selectAll: selectAll,
  get event() {
    return event;
  },
  mouse,
  mouse,
  getComputedTextLength: getComputedTextLength
};
const dataObj = { name: "Overall", children: [] };

export default {
  name: "Treemap",
  props: {
    config: { type: Object }
  },
  // the component's data
  data() {
    return {
      jsonData: null,
      rootNode: {},
      margin: {
        top: 20,
        right: 0,
        bottom: 0,
        left: 0
      },
      data,
      width: null,
      height: null,
      selected: null,
      loading: true
    };
  },
  // You can do whatever when the selected node changes
  watch: {
    selectedNode(newData, oldData) {
      setTimeout(() => {
        this.buildTooltip();
        this.showText();
      }, 500);
    }
  },
  // In the beginning...
  mounted() {
    const that = this;
    this.width = this.$refs.treemap.clientWidth;
    this.height = this.$refs.treemap.clientHeight;
    that.color =
      this.config.colors != undefined
        ? this.config.colors
        : d3.scaleOrdinal(d3.schemeSet3);
    that.jsonData = this.transformData(this.config.data, "value");
    that.jsonData2 = this.transformData(this.config.data, "secondary_value");
    that.initialize();
    that.accumulate(that.rootNode, that);
    that.accumulate_secondary(that.rootNode, that);
    that.treemap(that.rootNode);
    this.loading = false;
  },
  // The reactive computed variables that fire rerenders
  computed: {
    // The grandparent id
    parentId() {
      if (
        this.selectedNode.parent === undefined ||
        this.selectedNode.parent === null
      ) {
        return this.selectedNode.id;
      } else {
        return this.selectedNode.parent.id;
      }
    },
    // Returns the x position within the current domain
    // Maybe it can be replaced by a vuejs method
    x() {
      return d3
        .scaleLinear()
        .domain([0, this.width])
        .range([0, this.width]);
    },
    // Returns the y position within the current domain
    // Maybe it can be replaced by a vuejs method
    y() {
      return d3
        .scaleLinear()
        .domain([0, this.height - this.margin.top - this.margin.bottom])
        .range([0, this.height - this.margin.top - this.margin.bottom]);
    },
    // The D3 function that recursively subdivides an area into rectangles
    treemap() {
      return d3
        .treemap()
        .size([this.width, this.height])
        .round(false)
        .paddingInner(0);
    },
    // The current selected node
    selectedNode() {
      let node = null;
      if (this.selected) {
        const nd = this.getNodeById(this.rootNode, this.selected, this);
        if (nd._children) {
          node = nd;
        } else {
          node = nd.parent;
        }
      } else {
        node = this.rootNode;
      }

      // Recalculates the y and x domains
      this.x.domain([node.x0, node.x0 + (node.x1 - node.x0)]);
      this.y.domain([node.y0, node.y0 + (node.y1 - node.y0)]);

      return node;
    }
  },
  methods: {
    getId(child) {
      return child.replace(/\./g, "_").replace(/\s/g, "-");
    },
    buildTooltip() {
      const that = this;
      const values = d3.selectAll("g.children");
      values[0].forEach(function(t) {
        const rectObj = d3
          .select(t)
          .on("mousemove", function(d) {
            const tooltip_g = d3.select("#tooltip");
            const textObj = rectObj.select(".parent");
            const text = textObj.select("title")[0][0].innerHTML.split(" | ");

            const coordinates = d3.event;
            tooltip_g.style("visibility", "visible");

            const totalHeight = rectObj[0][0].getBBox().height;

            let yVal;

            if (coordinates.layerY >= totalHeight / 2 + 110 / 2) {
              yVal = 110;
            } else {
              yVal = 0;
            }

            tooltip_g.attr(
              "transform",
              "translate(" +
                (coordinates.layerX - 25) +
                "," +
                (coordinates.layerY - yVal) +
                ")"
            );

            const name = d3.select("text#tooltip-name");
            const width = Math.round(
              (name.node().getComputedTextLength() / 10) * 10
            );

            d3.select("rect.tooltip").attr("width", width + 60);

            name
              .attr("transform", "translate(" + (width + 60) / 2 + "," + "20)")
              .style("font-weight", "bold")
              .text(text[0]);

            d3.select("text#tooltip-value")
              .attr("transform", "translate(" + (width + 60) / 2 + "," + "40)")
              .text("Value: " + text[1]);

            d3.select("text#tooltip-secondary")
              .attr("transform", "translate(" + (width + 60) / 2 + "," + "60)")
              .text("YoY: " + (parseFloat(text[2]) * 100).toFixed(2) + "%");
          })
          .on("mouseout", function(d) {
            const tooltip_g = d3.select("#tooltip");
            tooltip_g.style("visibility", "hidden");
          });
      });
    },
    // Called once, to create the hierarchical data representation
    initialize() {
      const that = this;

      const combineRootNodes = function(rootNode, rootNode2) {
        var climbTree = function(n1, n2) {
          n1.secondary_value = n2.value;
          if ("children" in n1) {
            n2.children.sort(function(a, b) {
              return b.id.localeCompare(a.id);
            });
            n1.children.sort(function(a, b) {
              return b.id.localeCompare(a.id);
            });
            n1.children.forEach((node, ind) => {
              climbTree(node, n2.children[ind]);
            });
          }
        };
        climbTree(rootNode, rootNode2);

        return rootNode;
      };

      if (that.jsonData) {
        that.rootNode = d3
          .hierarchy(that.jsonData)
          .eachBefore(function(d) {
            d.id =
              (d.parent ? d.parent.id.replace(/\s/g, "-") + "_" : "") +
              d.data.name;
          })
          .sum(d => d.value)
          .sort(function(a, b) {
            return b.height - a.height || b.value - a.value;
          });
        that.rootNode.x = that.rootNode.y = 0;
        that.rootNode.x1 = that.width;
        that.rootNode.y1 = that.height;
        that.rootNode.depth = 0;

        that.rootNode2 = d3
          .hierarchy(that.jsonData2)
          .eachBefore(function(d) {
            d.id =
              (d.parent ? d.parent.id.replace(/\s/g, "-") + "_" : "") +
              d.data.name;
          })
          .sum(d => {
            return (d.value - d.secondary_value) / d.secondary_value;
          })
          .sort(function(a, b) {
            return b.height - a.height || b.value - a.value;
          });
        that.rootNode2.x = that.rootNode2.y = 0;
        that.rootNode2.x1 = that.width;
        that.rootNode2.y1 = that.height;
        that.rootNode2.depth = 0;

        that.rootNode = combineRootNodes(that.rootNode, that.rootNode2);
      }
    },
    formatId(text) {
      return text.replace(/_/g, " > ");
    },
    showText() {
      const values = d3.selectAll(".child_text");
      values[0].forEach(function(t) {
        const textObj = d3.select(t).style("opacity", function(o) {
          return this.getComputedTextLength() <
            d3
              .select("#" + t.id.replace("_name", ""))
              .node()
              .getBBox().width
            ? 1
            : 0;
        });
      });
    },
    transformData(data, key) {
      let transform = {};
      const levels = [];
      var getChildren = function(c_data, levels, level, arr, key) {
        if (level <= levels.length) {
          let keys = c_data.map(function(d) {
            return d[levels[level]];
          });
          keys = keys.filter(function(item, pos) {
            return keys.indexOf(item) == pos;
          });
          keys.forEach(k => {
            const filtered = c_data.filter(d => {
              return d[levels[level]] == k;
            });
            const obj = { name: k };
            if (level + 1 < levels.length) {
              obj["children"] = getChildren(
                filtered,
                levels,
                level + 1,
                [],
                key
              );
            } else {
              obj["value"] = filtered[0]["value"];
              obj["secondary_value"] = filtered[0]["secondary_value"];
            }
            arr.push(obj);
          });
          return arr;
        }
      };
      transform = getChildren(data, this.config.key_hierarchy, 0, [], key);
      return { name: "Overall", children: transform };
    },
    // Calculates the accumulated value (sum of children values) of a node - its weight,
    // represented afterwards in the area of its square
    accumulate(d, context) {
      d._children = d.children;
      if (d._children) {
        d.value = d._children.reduce(function(p, v) {
          return p + context.accumulate(v, context);
        }, 0);
        return d.value;
      } else {
        return d.value;
      }
    },
    accumulate_secondary(d, context) {
      d._children = d.children;
      if (d._children) {
        d.secondary_value = d._children.reduce(function(p, v) {
          return p + context.accumulate_secondary(v, context);
        }, 0);
        return d.secondary_value;
      } else {
        return d.secondary_value;
      }
    },
    // Helper method - gets a node by its id attribute
    getNodeById(node, id, context) {
      if (node.id.replace(/\s/g, "-") === id.replace(/\s/g, "-")) {
        return node;
      } else if (node._children) {
        for (let i = 0; i < node._children.length; i++) {
          const nd = context.getNodeById(node._children[i], id, context);
          if (nd) {
            return nd;
          }
        }
      }
    },
    // When a user clicks a square, changes the selected data attribute
    // which fires the computed selectedNode, which in turn finds the Node by the id of the square clicked
    // and the template reflects the changes
    selectNode(event) {
      // prevent accidental double click by limiting drill down to max one level down from previous selected
      const max_depth = this.selected ? this.selected.split("_").length : 0;
      if (event.target.id.split("_").length - 1 > max_depth) {
        event.target.id = event.target.id
          .split("_")
          .slice(0, -1)
          .join("_");
      }
      this.selected = event.target.id;
    }
  }
};

const data = {
  name: "flare",
  children: [
    {
      name: "analytics",
      children: [
        {
          name: "cluster",
          children: [
            { name: "AgglomerativeCluster", value: 3938 },
            { name: "CommunityStructure", value: 3812 },
            { name: "HierarchicalCluster", value: 6714 },
            { name: "MergeEdge", value: 743 }
          ]
        },
        {
          name: "graph",
          children: [
            { name: "BetweennessCentrality", value: 3534 },
            { name: "LinkDistance", value: 5731 },
            { name: "MaxFlowMinCut", value: 7840 },
            { name: "ShortestPaths", value: 5914 },
            { name: "SpanningTree", value: 3416 }
          ]
        },
        {
          name: "optimization",
          children: [{ name: "AspectRatioBanker", value: 7074 }]
        }
      ]
    },
    {
      name: "animate",
      children: [
        { name: "Easing", value: 17010 },
        { name: "FunctionSequence", value: 5842 },
        {
          name: "interpolate",
          children: [
            { name: "ArrayInterpolator", value: 1983 },
            { name: "ColorInterpolator", value: 2047 },
            { name: "DateInterpolator", value: 1375 },
            { name: "Interpolator", value: 8746 },
            { name: "MatrixInterpolator", value: 2202 },
            { name: "NumberInterpolator", value: 1382 },
            { name: "ObjectInterpolator", value: 1629 },
            { name: "PointInterpolator", value: 1675 },
            { name: "RectangleInterpolator", value: 2042 }
          ]
        },
        { name: "ISchedulable", value: 1041 },
        { name: "Parallel", value: 5176 },
        { name: "Pause", value: 449 },
        { name: "Scheduler", value: 5593 },
        { name: "Sequence", value: 5534 },
        { name: "Transition", value: 9201 },
        { name: "Transitioner", value: 19975 },
        { name: "TransitionEvent", value: 1116 },
        { name: "Tween", value: 6006 }
      ]
    },
    {
      name: "data",
      children: [
        {
          name: "converters",
          children: [
            { name: "Converters", value: 721 },
            { name: "DelimitedTextConverter", value: 4294 },
            { name: "GraphMLConverter", value: 9800 },
            { name: "IDataConverter", value: 1314 },
            { name: "JSONConverter", value: 2220 }
          ]
        },
        { name: "DataField", value: 1759 },
        { name: "DataSchema", value: 2165 },
        { name: "DataSet", value: 586 },
        { name: "DataSource", value: 3331 },
        { name: "DataTable", value: 772 },
        { name: "DataUtil", value: 3322 }
      ]
    },
    {
      name: "display",
      children: [
        { name: "DirtySprite", value: 8833 },
        { name: "LineSprite", value: 1732 },
        { name: "RectSprite", value: 3623 },
        { name: "TextSprite", value: 10066 }
      ]
    },
    {
      name: "flex",
      children: [{ name: "FlareVis", value: 4116 }]
    },
    {
      name: "physics",
      children: [
        { name: "DragForce", value: 1082 },
        { name: "GravityForce", value: 1336 },
        { name: "IForce", value: 319 },
        { name: "NBodyForce", value: 10498 },
        { name: "Particle", value: 2822 },
        { name: "Simulation", value: 9983 },
        { name: "Spring", value: 2213 },
        { name: "SpringForce", value: 1681 }
      ]
    },
    {
      name: "query",
      children: [
        { name: "AggregateExpression", value: 1616 },
        { name: "And", value: 1027 },
        { name: "Arithmetic", value: 3891 },
        { name: "Average", value: 891 },
        { name: "BinaryExpression", value: 2893 },
        { name: "Comparison", value: 5103 },
        { name: "CompositeExpression", value: 3677 },
        { name: "Count", value: 781 },
        { name: "DateUtil", value: 4141 },
        { name: "Distinct", value: 933 },
        { name: "Expression", value: 5130 },
        { name: "ExpressionIterator", value: 3617 },
        { name: "Fn", value: 3240 },
        { name: "If", value: 2732 },
        { name: "IsA", value: 2039 },
        { name: "Literal", value: 1214 },
        { name: "Match", value: 3748 },
        { name: "Maximum", value: 843 },
        {
          name: "methods",
          children: [
            { name: "add", value: 593 },
            { name: "and", value: 330 },
            { name: "average", value: 287 },
            { name: "count", value: 277 },
            { name: "distinct", value: 292 },
            { name: "div", value: 595 },
            { name: "eq", value: 594 },
            { name: "fn", value: 460 },
            { name: "gt", value: 603 },
            { name: "gte", value: 625 },
            { name: "iff", value: 748 },
            { name: "isa", value: 461 },
            { name: "lt", value: 597 },
            { name: "lte", value: 619 },
            { name: "max", value: 283 },
            { name: "min", value: 283 },
            { name: "mod", value: 591 },
            { name: "mul", value: 603 },
            { name: "neq", value: 599 },
            { name: "not", value: 386 },
            { name: "or", value: 323 },
            { name: "orderby", value: 307 },
            { name: "range", value: 772 },
            { name: "select", value: 296 },
            { name: "stddev", value: 363 },
            { name: "sub", value: 600 },
            { name: "sum", value: 280 },
            { name: "update", value: 307 },
            { name: "variance", value: 335 },
            { name: "where", value: 299 },
            { name: "xor", value: 354 },
            { name: "_", value: 264 }
          ]
        },
        { name: "Minimum", value: 843 },
        { name: "Not", value: 1554 },
        { name: "Or", value: 970 },
        { name: "Query", value: 13896 },
        { name: "Range", value: 1594 },
        { name: "StringUtil", value: 4130 },
        { name: "Sum", value: 791 },
        { name: "Variable", value: 1124 },
        { name: "Variance", value: 1876 },
        { name: "Xor", value: 1101 }
      ]
    },
    {
      name: "scale",
      children: [
        { name: "IScaleMap", value: 2105 },
        { name: "LinearScale", value: 1316 },
        { name: "LogScale", value: 3151 },
        { name: "OrdinalScale", value: 3770 },
        { name: "QuantileScale", value: 2435 },
        { name: "QuantitativeScale", value: 4839 },
        { name: "RootScale", value: 1756 },
        { name: "Scale", value: 4268 },
        { name: "ScaleType", value: 1821 },
        { name: "TimeScale", value: 5833 }
      ]
    },
    {
      name: "util",
      children: [
        { name: "Arrays", value: 8258 },
        { name: "Colors", value: 10001 },
        { name: "Dates", value: 8217 },
        { name: "Displays", value: 12555 },
        { name: "Filter", value: 2324 },
        { name: "Geometry", value: 10993 },
        {
          name: "heap",
          children: [
            { name: "FibonacciHeap", value: 9354 },
            { name: "HeapNode", value: 1233 }
          ]
        },
        { name: "IEvaluable", value: 335 },
        { name: "IPredicate", value: 383 },
        { name: "IValueProxy", value: 874 },
        {
          name: "math",
          children: [
            { name: "DenseMatrix", value: 3165 },
            { name: "IMatrix", value: 2815 },
            { name: "SparseMatrix", value: 3366 }
          ]
        },
        { name: "Maths", value: 17705 },
        { name: "Orientation", value: 1486 },
        {
          name: "palette",
          children: [
            { name: "ColorPalette", value: 6367 },
            { name: "Palette", value: 1229 },
            { name: "ShapePalette", value: 2059 },
            { name: "SizePalette", value: 2291 }
          ]
        },
        { name: "Property", value: 5559 },
        { name: "Shapes", value: 19118 },
        { name: "Sort", value: 6887 },
        { name: "Stats", value: 6557 },
        { name: "Strings", value: 22026 }
      ]
    },
    {
      name: "vis",
      children: [
        {
          name: "axis",
          children: [
            { name: "Axes", value: 1302 },
            { name: "Axis", value: 24593 },
            { name: "AxisGridLine", value: 652 },
            { name: "AxisLabel", value: 636 },
            { name: "CartesianAxes", value: 6703 }
          ]
        },
        {
          name: "controls",
          children: [
            { name: "AnchorControl", value: 2138 },
            { name: "ClickControl", value: 3824 },
            { name: "Control", value: 1353 },
            { name: "ControlList", value: 4665 },
            { name: "DragControl", value: 2649 },
            { name: "ExpandControl", value: 2832 },
            { name: "HoverControl", value: 4896 },
            { name: "IControl", value: 763 },
            { name: "PanZoomControl", value: 5222 },
            { name: "SelectionControl", value: 7862 },
            { name: "TooltipControl", value: 8435 }
          ]
        },
        {
          name: "data",
          children: [
            { name: "Data", value: 20544 },
            { name: "DataList", value: 19788 },
            { name: "DataSprite", value: 10349 },
            { name: "EdgeSprite", value: 3301 },
            { name: "NodeSprite", value: 19382 },
            {
              name: "render",
              children: [
                { name: "ArrowType", value: 698 },
                { name: "EdgeRenderer", value: 5569 },
                { name: "IRenderer", value: 353 },
                { name: "ShapeRenderer", value: 2247 }
              ]
            },
            { name: "ScaleBinding", value: 11275 },
            { name: "Tree", value: 7147 },
            { name: "TreeBuilder", value: 9930 }
          ]
        },
        {
          name: "events",
          children: [
            { name: "DataEvent", value: 2313 },
            { name: "SelectionEvent", value: 1880 },
            { name: "TooltipEvent", value: 1701 },
            { name: "VisualizationEvent", value: 1117 }
          ]
        },
        {
          name: "legend",
          children: [
            { name: "Legend", value: 20859 },
            { name: "LegendItem", value: 4614 },
            { name: "LegendRange", value: 10530 }
          ]
        },
        {
          name: "operator",
          children: [
            {
              name: "distortion",
              children: [
                { name: "BifocalDistortion", value: 4461 },
                { name: "Distortion", value: 6314 },
                { name: "FisheyeDistortion", value: 3444 }
              ]
            },
            {
              name: "encoder",
              children: [
                { name: "ColorEncoder", value: 3179 },
                { name: "Encoder", value: 4060 },
                { name: "PropertyEncoder", value: 4138 },
                { name: "ShapeEncoder", value: 1690 },
                { name: "SizeEncoder", value: 1830 }
              ]
            },
            {
              name: "filter",
              children: [
                { name: "FisheyeTreeFilter", value: 5219 },
                { name: "GraphDistanceFilter", value: 3165 },
                { name: "VisibilityFilter", value: 3509 }
              ]
            },
            { name: "IOperator", value: 1286 },
            {
              name: "label",
              children: [
                { name: "Labeler", value: 9956 },
                { name: "RadialLabeler", value: 3899 },
                { name: "StackedAreaLabeler", value: 3202 }
              ]
            },
            {
              name: "layout",
              children: [
                { name: "AxisLayout", value: 6725 },
                { name: "BundledEdgeRouter", value: 3727 },
                { name: "CircleLayout", value: 9317 },
                { name: "CirclePackingLayout", value: 12003 },
                { name: "DendrogramLayout", value: 4853 },
                { name: "ForceDirectedLayout", value: 8411 },
                { name: "IcicleTreeLayout", value: 4864 },
                { name: "IndentedTreeLayout", value: 3174 },
                { name: "Layout", value: 7881 },
                { name: "NodeLinkTreeLayout", value: 12870 },
                { name: "PieLayout", value: 2728 },
                { name: "RadialTreeLayout", value: 12348 },
                { name: "RandomLayout", value: 870 },
                { name: "StackedAreaLayout", value: 9121 },
                { name: "TreeMapLayout", value: 9191 }
              ]
            },
            { name: "Operator", value: 2490 },
            { name: "OperatorList", value: 5248 },
            { name: "OperatorSequence", value: 4190 },
            { name: "OperatorSwitch", value: 2581 },
            { name: "SortOperator", value: 2023 }
          ]
        },
        { name: "Visualization", value: 16540 }
      ]
    }
  ]
};
</script>

<style scoped>
text {
  pointer-events: none;
}

.grandparent text {
  font-weight: bold;
}

rect {
  fill: none;
  stroke: #fff;
}

rect.parent,
.grandparent rect {
  stroke-width: 2px;
}

.grandparent rect {
  /* fill: config.header['background']; */
}

.grandparent:hover rect {
  /* fill: #ee9700; */
}

.children rect.parent,
.grandparent rect {
  cursor: pointer;
}

.children rect.parent {
  /* fill: #bbb; */
  fill-opacity: 1;
}

.children rect.child {
  fill: transparent;
  fill-opacity: 1;
  stroke-opacity: 1 !important;
  stroke: white;
  stroke-width: 2px;
}

.children text {
  font-size: 1em;
  font-weight: 500;
}

.grandparent text {
  font-size: 0.9em;
}

.list-enter-active,
.list-leave-active {
  transition: all 1s;
}
.list-enter, .list-leave-to /* .list-leave-active for <2.1.8 */ {
  opacity: 0;
}
</style>
