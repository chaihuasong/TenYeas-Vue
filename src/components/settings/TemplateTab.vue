<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane label="模板集合">
        <DefaultTemplateList/>
      </el-tab-pane>
      <el-tab-pane label="默认模板1(初阶)">
        <DefaultTemplateList1/>
      </el-tab-pane>
      <el-tab-pane label="默认模板2">
        <DefaultTemplateList2/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import DefaultTemplateList from "@/components/settings/DefaultTemplateList"
import DefaultTemplateList1 from "@/components/settings/DefaultTemplateList1"
import DefaultTemplateList2 from "@/components/settings/DefaultTemplateList2"

export default {
  components:{
    DefaultTemplateList:DefaultTemplateList,
    DefaultTemplateList1:DefaultTemplateList1,
    DefaultTemplateList2:DefaultTemplateList2,
  },
}
</script>