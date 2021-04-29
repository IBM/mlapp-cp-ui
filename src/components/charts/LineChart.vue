<script>
import { Line } from "vue-chartjs";
import BaseChart from "@/mixins/Chart";

export default {
  name: "LineChart",
  mixins: [BaseChart], // Inherit all options from BaseChart
  extends: Line,
  data() {
    return {
      defaultOptions: {
        fill: false
      }
    };
  }
};
</script>
