<template>
  <div>
    <el-tabs type="border-card">
      <el-tab-pane label="群组列表">
        <GroupList/>
      </el-tab-pane>
      <el-tab-pane label="群组详情">
        <GroupsList/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import GroupList from "@/components/admin/GroupList"
import GroupsList from "@/components/admin/GroupsList"

export default {
  components: {
    GroupList: GroupList,
    GroupsList: GroupsList,
  },
}
</script>