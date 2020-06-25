<template>
  <div class="rights">
    <!--面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片区域-->
    <el-card class="box-card">
      <!--权限列表-->
      <el-table :data="rightsList">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <!--使用作用域插槽更换显示效果-->
          <template  slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
  import {getrights} from 'network/rights'
  export default {
    name: "Rights",
    data() {
      return {
        type: 'list',
        // 权限列表
        rightsList: []
      }
    },
    created() {
      this._getrights()
    },
    methods: {
      _getrights() {
        getrights(this.type).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
          this.rightsList = res.data
        })
      }
    }
  }
</script>

<style scoped>

</style>