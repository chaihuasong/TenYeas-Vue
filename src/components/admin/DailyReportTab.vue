<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane label="打卡列表">
        <DailyReportList/>
      </el-tab-pane>
      <el-tab-pane label="原始数据">
        <OriginalDailyReportList/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import DailyReportList from "@/components/admin/DailyReportList";
import OriginalDailyReportList from "@/components/admin/OriginalDailyReportList";

export default {
  components:{
    DailyReportList:DailyReportList,
    OriginalDailyReportList:OriginalDailyReportList,
  },
}
</script>