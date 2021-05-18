<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane label="修改Header">
        <ModifyHeader/>
      </el-tab-pane>
      <el-tab-pane label="修改Footer">
        <ModifyFooter/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import ModifyFooter from "@/components/settings/ModifyFooter"
import ModifyHeader from "@/components/settings/ModifyHeader"

export default {
  components:{
    ModifyHeader:ModifyHeader,
    ModifyFooter:ModifyFooter,
  },
}
</script>