<template>
  <div class="Categories">
    <!--面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card class="box-card">
      <!--添加分类按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!--商品表格区域-->
      <tree-table class="tree-table" :data="cateList" :columns="columns"
                  border show-index index-text="#"
                  :show-row-hover="false"
                  :expand-type="false"
                  :selection-type="false">
        <!--是否有效列-->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success"
             style="color: lightgreen"
             v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!--排序列-->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success"
                  v-else-if="scope.row.cat_level === 1">二级
          </el-tag>
          <el-tag size="mini" type="warning"
                  v-else="scope.row.cat_level === 2">三级
          </el-tag>
        </template>
        <!--操作列-->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini" icon="el-icon-edit"
                     @click="editClick(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" icon="el-icon-delete"
                     @click="removeClick(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!--分页按钮区域-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[3, 5, 8, 10, 20]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>
    <!--添加分类对话框-->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible"
            width="50%" @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules"
               ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 用来指定数据源 绑定父级分类-->
          <!-- props 用来指定配置对象 -->
          <!--级联选择器-->
          <el-cascader
                  v-model="selectedKeys" :options="parentCateList"
                  :props="cascaderProps" @change="parentCateChanged"
                  expand-trigger="hover" clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addCateDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="addCate">确 定</el-button>
  </span>
    </el-dialog>
    <!--编辑修改对话框-->
    <el-dialog title="修改分类" :visible.sync="editDialogVisible"
            width="50%">
      <el-form :model="editCateForm" :rules="editCateFormRules"
               ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="editSubmit">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>

  import {getCateGory, additionCate, editCate, removeCate} from 'network/cateGories'
  export default {
    name: "Categories",
    data() {
      return {
        //查询的参数
        queryInfo: {
          type: 3,
          pagenum: 1,
          pagesize: 5
        },
        //存放商品数据
        cateList: [],
        //商品数据总条数
        total: 0,
        // 为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            //当前列定义模板
            type: 'template',
            //定义模板的名称
            template: 'isOk'
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'opt'
          }
        ],
        //添加分类对话框的显示与隐藏
        addCateDialogVisible: false,
        // 添加分类的表单数据对象
        addCateForm: {
          //分类名称
          cat_name: '',
          //分类父 ID
          cat_pid: 0,
          //分类层级
          cat_level: 0
        },
        // 父级分类的列表
        parentCateList: [],
        //验证规则
        addCateFormRules: {
          cat_name: [
            {required: true, message: '请输入分类名称', trigger: 'blur'}
          ]
        },
        // 指定级联选择器的配置对象
        cascaderProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true
        },
        // 选中的父级分类的Id数组
        selectedKeys: [],
        //修改对话框的显示与隐藏
        editDialogVisible:false,
        //修改表单的数据对象
        editCateForm: {
          id: '',
          cat_name: ''
        },
        // 修改表单项的验证规则
        editCateFormRules: {
          cat_name: [
            {required: true, message: '请输入新的分类名称', trigger: 'blur'}
          ]
        },
      }
    },
    created() {
      // 发送数据请求,接收商品数据
      this._getCateGory()
    },
    methods: {
      /*发送数据请求*/
      //  请求商品数据
      _getCateGory() {
        getCateGory(this.queryInfo).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error('获取商品数据失败')
          }
          this.cateList = res.data.result
          this.total = res.data.total
        })
  },

      /*事件监听*/
      // 监听pagesize改变:一页显示条数
      handleSizeChange(newPageSize) {
        this.queryInfo.pagesize = newPageSize
      //  重新发送商品数据请求
        this._getCateGory()
      },
      // 监听页码值的改变:翻页
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        //  重新发送商品数据请求
        this._getCateGory()
      },
      // 添加分类按钮点击,弹出添加对话框
      showAddCateDialog() {
        //获取商品分类数据列表,发送请求
        getCateGory({type: 2}).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('获取父级分类的列表失败')
          this.parentCateList = res.data
        })
        //打开对话框
        this.addCateDialogVisible = true
      },
      // 选择项发生变化触发这个函数
      parentCateChanged() {
        if (this.selectedKeys.length > 0) {
          //如果长度大于零,表示有添加父类的id,
          // 所以要修改addCateForm中的父类的id和自己当前分类的等级
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          //有父类则层级降一级,刚好和数组的长度一样
          this.addCateForm.cat_level = this.selectedKeys.length
        }else {
          // 表示没有添加父类,所以自己就是第一层级的类别,
          // 所以父类的id和自己的分类层级设置为零
          //父级分类id
          this.addCateForm.cat_pid = 0
          //// 为当前分类的等级
          this.addCateForm.cat_level = 0
        }
      },
      //确定按钮点击,发送数据请求,添加类别
      addCate() {
        //表单预验证
        this.$refs.addCateFormRef.validate(vali => {
          if (!vali) return
          //发送数据请求
          additionCate(this.addCateForm).then(res => {
            // console.log(res);
            if (res.meta.status !== 201) return this.$message.error('添加商品分类失败')
            //弹出成功消息框
            this.$message.success('添加商品分类成功')
            // 重新获取商品分类列表
            this._getCateGory()
            //关闭对话框
            this.addCateDialogVisible = false
          })
        })
      },
      // 对话框关闭,重置表单数据
      addCateDialogClosed() {
        // 重置表单
        this.$refs.addCateFormRef.resetFields()
        //重置选中的父级分类的Id数组
        this.selectedKeys = 0
        // // 重置添加的父类id和当前层级,否则再次打开则不会清空
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      },
      //编辑按钮点击
      editClick(info) {
        // console.log(info);
        this.editCateForm.id = info.cat_id
        this.editCateForm.cat_name = info.cat_name
        this.editDialogVisible = true
      },
      //修改对话框中的确定按钮点击
      editSubmit() {
        editCate(this.editCateForm).then(res => {
          // console.log(res);
          if (res.meta.status !==200) return this.$message.error('修改分类失败')
          //弹出成功消息框
          this.$message.success('修改分类成功')
          this._getCateGory()
          //关闭对话框
          this.editDialogVisible = false
        })
      },
      //删除按钮点击
      removeClick(id) {
        this.$confirm('此操作将永久删除该分类, 是否继续?', '删除分类',{
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // console.log(res);
          // console.log(res);
          // console.log(info);
          removeCate(id).then(res => {
            console.log(res);
            if (res.meta.status !== 200) return this.$message.error('删除分类失败')
            this._getCateGory()
            this.$message.success('删除分类成功')
          })
        }).catch(() => {
          // console.log(err);
          this.$message.info('取消删除分类')
        })
      }
    }
  }
</script>

<style scoped>
  .tree-table {
    margin-top: 15px;
  }
  .el-cascader {
    width: 100%;
  }
</style>