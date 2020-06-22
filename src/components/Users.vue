<template>
  <div class="users">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <!--el-row代表行，el-col代表列-->
      <el-row :gutter="20">
        <el-col :span="9">
          <!--实现搜索功能，需要将el-input双向绑定到queryInfo.query中-->
          <!--clearable可以清空搜索框中的内容-->
          <!--监听清空事件clear-->
          <el-input placeholder="请输入内容" v-model="queryInfo.query"
                    clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!--用户列表区域-->
      <!--绘制表格使用el-table和el-table-column-->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名">
        </el-table-column>
        <el-table-column prop="email" label="邮箱">
        </el-table-column>
        <el-table-column prop="mobile" label="电话">
        </el-table-column>
        <el-table-column prop="role_name" label="角色">
        </el-table-column>
        <el-table-column label="状态" >
          <!--使用作用域插槽-->
          <template slot-scope="scope">
            <!--scope.row可以查找到当前行的所有信息-->
            <!--{{scope.row}}-->
            <el-switch v-model="scope.row.mg_state"
                       @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-button type="primary" icon="el-icon-edit" size="mini"
                       @click="showEditDialog(scope.row.id)">
            </el-button>
            <!--删除按钮-->
            <el-button type="danger" icon="el-icon-delete" size="mini"
                       @click="removeUserById(scope.row.id)">
            </el-button>
            <!--角色分配按钮-->
            <el-button type="warning" icon="el-icon-setting" size="mini">
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--分页区域-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="queryInfo.pagenum"
              :page-sizes="[1, 2, 5, 8]"
              :page-size="queryInfo.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>

    <!--添加用户的对话框-->
    <!--visible控制显示和隐藏-->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible"
            width="50%" @close="addDialogClosed">
      <!--内容主体区域-->
      <el-form :model="addForm" :rules="addFormRules"
               ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!--按钮区域-->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="addUser">
          确 定
        </el-button>
      </span>
    </el-dialog>

    <!--修改用户对话框-->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible"
               width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules"
               ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="editUserInfo(editForm)">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getUserList, putState, addUser,
    selectUser, putUser, deleteUser} from 'network/users'
  export default {
    name: "Users",
    data() {
      // 验证邮箱的规则
      var checkEmail = (rule, value, cb) => {
        // 验证邮箱的正则表达式
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          // 合法的邮箱
          return cb()
        }
        cb(new Error('请输入正确的邮箱'))
      }
      // 验证手机号的规则
      var checkMobile = (rule, value, cb) => {
        // 验证手机号的正则表达式
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return cb()
        }
        cb(new Error('请输入正确的手机号'))
      }
      return {
        queryInfo: {
          //查询参数
          query: '',
          //查询参数
          pagenum: 1,
          //每页显示条数
          pagesize: 2
        },
        //获取的user
        userlist: [],
        //user的总数
        total: 0,
        //添加用户对话框的显示和隐藏
        addDialogVisible: false,
        //添加用户的验证规则
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '用户名长度为3-10个字符之间', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 6, max: 15, message: '用户名的长度在6~15个字符之间', trigger: 'blur'}
          ],
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        //添加用户的数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        // 修改用户对话框的显示与隐藏
        editDialogVisible: false,
        // 查询到的用户信息对象
        editForm: {},
        // 修改用户的验证规则
        editFormRules: {
          email: [
            {required: true, message: '请输入邮箱', trigger: 'blur'},
            {validator: checkEmail, trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机号', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      //   // 获取用户列表
      this._getUserList(this.queryInfo)
    },
    methods: {
      //网络请求
      // 1.获取用户列表
      _getUserList(queryInfo) {
        getUserList(queryInfo).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
          this.userlist = res.data.users
          this.total =res.data.total
        })
      },

      /*// 事件监听方法*/
      // 监听 pagesize(每页显示条数) 改变的事件
      handleSizeChange(newPageSize) {
        // console.log(newPageSize);
        this.queryInfo.pagesize = newPageSize
        this._getUserList(this.queryInfo)
      },
      // 监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this._getUserList(this.queryInfo)
      },
      // 监听switch状态的改变
      userStateChanged(userInfo) {
        putState(userInfo.id, userInfo.mg_state).then(res => {
          // console.log(res)
          if (res.meta.status !==200) {
            userInfo.mg_state = !userInfo.mg_state
            return this.$message.error('更新用户状态失败')
          }
          return this.$message.success('更新用户状态成功')
        })
      },
      // 监听搜索按钮以及clear事件，重新获取用户列表数据
      getUserList() {
        this._getUserList(this.queryInfo)
      },
      // 监听添加用户对话框的关闭重置
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加用户
      addUser() {
      //  首先进行表单的预验证
        this.$refs.addFormRef.validate(valid => {
          if (!valid) return
        //  发起网络请求
          addUser(this.addForm).then(res => {
            // 
            if (res.meta.status !== 201) return this.$message.error('添加用户失败')
            this.$message.success('添加用户成功')
            this.addDialogVisible = false
            this._getUserList(this.queryInfo)
          })
        })
      },
      // 展示编辑用户的对话框,根据id查询
      showEditDialog(id) {
        // console.log(id);
        // 发送数据请求，获取用户已有信息
        selectUser(id).then(res => {
          // console.log(res);
          if (res.meta.status !== 200)  return this.$message.error('查询用户失败')
          this.editForm = res.data
          this.editDialogVisible = true
        })
      },
      // 修改对话框关闭，对表单进行重置
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 修改用户提交
      editUserInfo(editForm) {
        // console.log(editForm);
        putUser(editForm).then(res => {
          if (res.meta.status !== 200) return this.$message.error('修改用户失败')
        //  关闭对话框
          this.editDialogVisible = false
        //  更新数据列表
          this._getUserList(this.queryInfo)
        //  弹出成功信息
          this.$message.success("修改用户成功")
        })
      },
      // 删除用户,根据id删除
      removeUserById(id) {
        // console.log('111');
        this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res => {
          this.$message.success('删除用户成功')
        //  发送删除用户的网络请求
          deleteUser(id).then(res => {
            // console.log(res);
            if (res.meta.status !==200) return this.$message.error("删除用户失败")
            // 弹出消息框
            this.$message.success('成功删除该用户')
            // 刷新用户列表
            this._getUserList(this.queryInfo)
          })
        }).catch(err => err)
      }
     }
  }
</script>

<style scoped>

</style>