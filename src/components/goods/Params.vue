<template>
  <div class="params">
    <!--面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card class="box-card">
      <!--警告提示-->
      <el-alert title="注意：只允许为第三级分类设置相关参数！"
              type="warning" :closable="false" show-icon>
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader :options="cateList" :props="cateProps"
                       v-model="selectedCateKeys" @change="handleChange">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab 页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button type="primary" size="small"
                     :disabled="isBtnDisabled"
                     @click="addDialogVisible=true">添加参数
          </el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe="">
            <!--展开列-->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag v-for="(item, index) in scope.row.attr_vals"
                        :key="index"
                        closable
                        @close="handleClose(index, scope.row)">
                  {{item}}
                </el-tag>
                <!--输入的文本框-->
                <el-input
                        class="input-new-tag"
                        v-if="scope.row.inputVisible"
                        v-model="scope.row.inputValue"
                        ref="saveTagInput"
                        size="small"
                        @keyup.enter.native="handleInputConfirm(scope.row)"
                        @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!--按钮-->
                <el-button v-else
                           class="button-new-tag"
                           size="small"
                           @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <!--索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="primary"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                <el-button size="small" type="danger"
                           icon="el-icon-delete"
                           @click="removeParma(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button type="primary" size="small"
                     :disabled="isBtnDisabled"
                     @click="addDialogVisible=true">添加属性
          </el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe="">
            <!--展开列-->
            <el-table-column type="expand"></el-table-column>
            <!--索引列-->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button size="small" type="primary"
                           icon="el-icon-edit"
                           @click="showEditDialog(scope.row.attr_id)">编辑
                </el-button>
                <el-button size="small" type="danger"
                           icon="el-icon-delete"
                           @click="removeParma(scope.row.attr_id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!--添加参数/属性的对话框-->
    <el-dialog :title="'添加' + titleText"  :visible.sync="addDialogVisible"
               @close="addDialogClose" width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef"
               label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!--编辑按钮的对话框-->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible"
            width="50%" @close="editDialogClose">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef"
               label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editBtnClick">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {getCateGory} from 'network/cateGories'
  import {getPamarm, additionParams, slectParam, editParam, removeParmas} from 'network/params'
  export default {
    name: "Params",
    data() {
      return {
        //商品分类列表
        cateList: [],
        // 级联选择框的配置对象
        cateProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true,
          expandTrigger: 'hover'
        },
        // 级联选择框双向绑定到的数组
        selectedCateKeys: [],
        // 被激活的页签的名称
        activeName: 'many',
        // 动态参数的数据
        manyTableData: [],
        // 静态属性的数据
        onlyTableData: [],
        //添加对话框的显示与隐藏
        addDialogVisible: false,
        // 添加参数的表单数据对象
        addForm: {
          attr_name: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          attr_name: [
            {required: true, message: '请输入参数名', trigger: 'blur'}
          ]
        },
        //编辑按钮的对话框的显示与隐藏
        editDialogVisible: false,
        // 修改的表单数据对象
        editForm: {},
        //修改的表单验证规则
        editFormRules: {
          attr_name: [
            {required: true, message: '请输入新的参数名称', trigger: 'blur'}
          ]
        },
        //
        // inputVisible: false,
        // inputValue: ''
      }
    },
    computed: {
      //添加按钮的禁用和启用
      isBtnDisabled() {
        if (this.selectedCateKeys.length !== 3) {
          return true
        }
        return false
      },
      // 当前选中的三级分类的Id
      cateId() {
        if (this.selectedCateKeys.length === 3)  {
          return this.selectedCateKeys[2]
        }
        return null
      },
      // 判断时添加参数还是添加属性
      titleText() {
        if (this.activeName === 'many') {
          return '动态参数'
        }
        return '静态属性'
      }
    },
    created() {
      // 获取商品分类数据列表,级联选择器需要
      this._getCateGory()
    },
    methods: {
      /*数据请求*/
      // 获取商品分类数据列表,级联选择器需要
      _getCateGory() {
        getCateGory().then(res => {
          // console.log(res);
          this.cateList = res.data
        })
      },

      /*事件监听*/
      // 级联选择框选中项变化，会触发这个函数
      handleChange() {
        this.getParamsData()
      },
      // 获取参数的列表数据
      getParamsData() {
        // 判断是否选中第三级,不是则清空
        if (this.selectedCateKeys.length !== 3) {
          this.selectedCateKeys = []
          this.manyTableData = []
          this.onlyTableData = []
          return
        }
        getPamarm({id: this.cateId, activeName: this.activeName}).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('获取参数列表失败')
          //在对参数进行赋值的时候，对参数里面的attr_vals由字符串的形式转为数组形式保存
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
            // 新增一个值，来控制文本框的显示与隐藏
            item.inputVisible = false
            // 新增一个值，来绑定文本框输入的值
            item.inputValue = ''
          })
          if (this.activeName === 'many') {
            this.manyTableData = res.data
          } else {
            this.onlyTableData = res.data
          }
        })
      },
      // tab 页签点击事件的处理函数
      handleClick() {
        this.getParamsData()
      },
      // 添加对话框的关闭
      addDialogClose() {
        this.$refs.addFormRef.resetFields()
      },
      //添加对话框确定按钮点击
      addParams() {
        additionParams(
            {
              id: this.cateId,
              attr_name: this.addForm.attr_name,
              attr_sel: this.activeName
            }).then(res => {
          // console.log(res);
          if (res.meta.status !== 201) return this.$message.error('添加参数失败')
          this.$message.success('添加参数成功')
          this.getParamsData()
          this.addDialogVisible = false
        })
      },
      //编辑按钮点击
      showEditDialog(attr_id) {
        // 根据 ID 查询参数
        slectParam({id: this.cateId, attrId: attr_id, attr_sel: this.activeName}).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return thsi.$message.error('查询参数失败')
          this.editForm = res.data
          this.editDialogVisible = true
        })
      },
      // 编辑对话框关闭
      editDialogClose() {
      //重置编辑对话框的内容
        this.$refs.editFormRef.resetFields()
      },
      // 编辑对话框确定按钮点击
      editBtnClick() {
        editParam({
          id: this.cateId,
          attrId: this.editForm.attr_id,
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName}).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('修改参数失败')
          this.$message.success('修改参数成功')
          this.getParamsData()
          this.editDialogVisible = false
        })
      },
      // 删除参数
      removeParma(attr_id) {
        // console.log(attr_id);
        this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          removeParmas({id: this.cateId, attrid: attr_id}).then(res => {
            console.log(res);
            if (res.meta.status !== 200) return this.$message.error('删除参数失败')
            this.$message.success('删除参数成功')
            this.getParamsData()
          })
        }).catch(() => {
          this.$message.error('已取消删除该参数')
        })
      },
      //  文本框失去焦点，或摁下了 Enter 都会触发
      handleInputConfirm(row) {
        //如果文本框内的值为空，则将inputValue设置为‘’(为防止空格占长度)，并关闭对话框
        if (row.inputValue.trim().length === 0) {
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        // 如果没有return,则表示有值，
        // 将值保存在attr_vals中（参数项），清空inputValue，关闭文本框
        // 数组用push
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // 发送数据请求提交，使用编辑提交
        this.saveAttrVals(row)
      },
      saveAttrVals(row) {
        editParam({
          id: this.cateId,
          attrId: row.attr_id,
          attr_name: row.attr_name,
          attr_sel: this. activeName,
          attr_vals: row.attr_vals.join(' ')}).then(res => {
          console.log(res);
          if (res.meta.status !== 200) return this.$message.error('参数项修改失败')
          this.$message.success('参数修改项成功')
        })
      },
      // 点击按钮，展示文本输入框
      showInput(row) {
        row.inputVisible = true
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus()
        })
      },
      // 删除一个参数项
      handleClose(index, row) {
        row.attr_vals.splice(index, 1)
      //发送数据请求
        this.saveAttrVals(row)
      }
    }
  }
</script>

<style lang="less" scoped>
  .cat_opt {
    margin: 15px 0
  }
  .el-tag {
    margin: 10px;
  }
  .input-new-tag {
    width: 120px;
  }
</style>