<template>
  <div class="chart-container">
    <BarChart
      v-if="type == 'bar'"
      class="chart-component"
      :datasets="datasets"
      :labels="labels"
      :layout="layout"
      :options="options"
    />
    <PieChart
      v-if="type == 'pie'"
      class="chart-component"
      :datasets="datasets"
      :labels="labels"
      :layout="layout"
      :options="options"
    />
    <LineChart
      v-if="type == 'line'"
      class="chart-component"
      :datasets="datasets"
      :labels="labels"
      :layout="layout"
      :options="options"
    />
    <StackedBarChart
      v-if="type == 'stacked'"
      class="chart-component"
      :datasets="datasets"
      :labels="labels"
      :layout="layout"
      :options="options"
    />
  </div>
</template>
<script>
import BarChart from "@/components/charts/BarChart.vue";
import PieChart from "@/components/charts/PieChart.vue";
import LineChart from "@/components/charts/LineChart.vue";
import StackedBarChart from "@/components/charts/StackedBarChart.vue";

export default {
  name: "ChartJS",
  components: {
    BarChart,
    LineChart,
    PieChart,
    StackedBarChart
  },
  props: {
    datasets: {
      type: Array,
      default: function() {
        return [];
      }
    },
    options: {
      type: Object,
      default: function() {
        return {};
      }
    },
    labels: {
      type: Array,
      default: function() {
        return [];
      }
    },
    layout: {
      type: Array,
      default: function() {
        return [];
      }
    },
    type: { type: String, required: true }
  }
};
</script>
<style lang="less" scoped>
.chart-container {
  position: relative;
}
.chart-component {
  position: absolute;
  width: 100%;
  height: 99% !important;
}
</style>
