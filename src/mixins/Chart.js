import * as deepmerge from "deepmerge";
import { mixins } from "vue-chartjs";

export default {
  mixins: [mixins.reactiveProp],
  data() {
    return {
      defaultBaseOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      defaultOptions: {},
      data: null
    };
  },
  props: {
    datasets: {
      type: Array,
      default: function() {
        return [];
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
    chartData: {
      type: Object,
      default: function() {
        return null;
      }
    },
    options: {
      type: Object,
      default: function() {
        return {
          position: "relative",
          height: "100%"
        };
      }
    }
  },
  computed: {
    mergedOptions() {
      const mergedOptions = deepmerge.all([
        this.options,
        this.defaultOptions,
        this.defaultBaseOptions
      ]);
      return mergedOptions;
    }
  },
  methods: {
    updateData() {
      const data = { labels: this.labels, datasets: [] };
      this.datasets.forEach((dat, ind) => {
        const obj = deepmerge({}, this.layout[ind] || {});
        obj["data"] = dat;
        data["datasets"].push(obj);
      });
      return data;
    }
  },
  mounted() {
    // this.chartData = this.updateData();
    this.renderChart(this.updateData(), this.mergedOptions);
  },
  watch: {
    datasets: {
      deep: true,
      handler: function() {
        // this._data._chart.destroy();
        this.renderChart(this.updateData(), this.mergedOptions);
      }
    },
    labels: {
      deep: true,
      handler: function() {
        this.renderChart(this.updateData(), this.mergedOptions);
      }
    },
    layout: {
      deep: true,
      handler: function() {
        this.renderChart(this.updateData(), this.mergedOptions);
      }
    }
  }
};
