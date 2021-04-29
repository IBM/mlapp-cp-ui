<script>
import BaseChart from "@/mixins/Chart";
import { Bar } from "vue-chartjs";

export default {
  name: "BarChart",
  mixins: [BaseChart], // Inherit all options from BaseChart
  extends: Bar,
  data() {
    return {
      defaultOptions: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      }
    };
  }
};
</script>
