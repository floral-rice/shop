<template>
  <div class="roles">
    <!--面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--添加按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoles">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表-->
      <el-table :data="roleList">
        <!--展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
                    v-for="(item1, i1) in scope.row.children"
                    :key="item1.id">
              <!--一级权限展示区-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{item1.authName}}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!--二级、三级权限展示区-->
              <el-col :span="19">
                <el-row :class="[i2 ===0 ? '' : 'bdtop', 'vcenter']"
                        v-for="(item2, i2) in item1.children"
                        :key="item2.id">
                  <!--二级权限展示区-->
                  <el-col :span="6">
                    <el-tag type="success" closable
                            @close="removeRightById(scope.row, item2.id)">
                      {{item2.authName}}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!--三级权限展示区-->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="item3 in item2.children"
                            :key="item3.id" closable
                            @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!--索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <!--使用作用域插槽添加按钮-->
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit"
                       @click="editClick(scope.row.id)">
              编辑
            </el-button>
            <el-button size="mini" type="danger"
                       icon="el-icon-delete" @click="roleDelete(scope.row.id)">
              删除
            </el-button>
            <el-button size="mini" type="warning"
                       icon="el-icon-setting"
                       @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!--添加角色-->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible"
               width="50%" @close="closeAddDialog">
      <el-form :model="addInfo" label-width="80px"
               ref="addInfoRef" :rules="addInfoRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addClick">确 定</el-button>
        </span>
    </el-dialog>
    <!--修改角色-->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible"
               width="50%" @close="editInfoClose">
      <el-form :model="editInfo" ref="editInfoRef"
               :rules="editInfoRlues" label-width="80px">
        <el-form-item label="角色ID">
          <el-input v-model="editInfo.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">
            取 消
          </el-button>
          <el-button type="primary" @click="editChangeClick">
            确 定
          </el-button>
        </span>
    </el-dialog>
    <!--分配权限-->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible"
               width="50%" @close="setRightDialogClosed">
      <el-tree :data="rightsList" :props="treeProps" node-key="id"  ref="treeRef"
               default-expand-all  show-checkbox :default-checked-keys="defKeys">
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getRoles, addRoles, selectRoles,
    editRoles, deleteRole, removeRight, setRight} from 'network/power/roles'
  import {getrights} from 'network/power/rights'
  export default {
    name: "Roles",
    data() {
      return {
        //获取的角色数据
        roleList: [],
        //添加角色对话框的显示与隐藏
        addDialogVisible: false,
        //添加角色的信息
        addInfo: {
          roleName: '',
          roleDesc: ''
        },
        //添加角色的验证规则
        addInfoRules: {
          roleName: [
            {required: true, message: '请输入角色名', trigger: 'blur'}
          ],
          roleDesc: [
            {required: true, message: '请输入角色描述', trigger: 'blur'}
          ]
        },
        //修改角色信息数据
        editInfo: {},
        // 修改角色对话框的显示
        editDialogVisible: false,
        // 修改角色验证规则,可以和添加角色的验证规则共用，可优化
        editInfoRlues: {
          roleName: [
            {required: true, message: '请输入角色名', trigger: 'blur'}
          ],
          roleDesc: [
            {required: true, message: '请输入角色描述', trigger: 'blur'}
          ]
        },
        //分配权限对话框的显示与隐藏
        setRightDialogVisible: false,
        // 获取权限类别的参数
        type: 'tree',
       // 所有权限的数据
        rightsList: [],
        // 树形控件的属性绑定对象
        treeProps: {
          children: 'children',
          label: 'authName'
        },
        // 默认选中的节点Id值数组
        defKeys: [],
        // 当前即将分配权限的角色id
        roleId: ''
      }
    },
    created() {
      //发送数据请求，获取角色列表
      this._getRoles()
    },
    methods: {
      /*数据请求*/
      _getRoles() {
        getRoles().then(res => {
          // console.log(res);
          if (res.meta.status !== 200) {
            return this.$message.error('获取角色列表失败')
          }
          this.roleList = res.data
        })
      },
      /*事件监听*/
      // 添加角色按钮点击，弹出添加角色对话框
      addRoles() {
        this.addDialogVisible = true
      },
      //关闭对话框，对表单进行重置
      closeAddDialog() {
        this.$refs.addInfoRef.resetFields()
      },
      // 点击对话框确定按钮进行添加
      addClick() {
        addRoles(this.addInfo).then(res => {
          // console.log(res);
          if (res.meta.status !== 201) return this.$message.error('添加角色失败')
          // 刷新角色列表
          this._getRoles()
          // 弹出成功提示框
          this.$message.success('添加角色成功')
          // 关闭对话框
          this.addDialogVisible = false
        })
      },
      // 编辑按钮点击
      editClick(id) {
        // console.log(id);
        selectRoles(id).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('获取角色信息失败')
          this.editInfo = res.data
          this.editDialogVisible = true
        })
      },
      //关闭对话框，重置表单
      editInfoClose() {
        this.$refs.editInfoRef.resetFields()
      },
      // 修改角色的确定按钮点击
      editChangeClick() {
        editRoles(this.editInfo).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('角色修改信息失败')
          // 更新角色列表
          this._getRoles()
          // 关闭对话框
          this.editDialogVisible = false
          // 弹出成功消息提示
          this.$message.success('修改角色信息成功')
        })
      },
      // 删除一个角色
      roleDelete(id) {
        // console.log(id);
        this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res => {
          // console.log(res);
          // 确认取消，发起数据请求
          deleteRole(id).then(res => {
            // console.log(res);
            if (res.meta.status !==200) return this.$message.error("删除角色失败")
            // 刷新角色列表
            this._getRoles()
            // 弹出成功提示框
            this.$message.success('删除角色成功')
          })
        }).catch(err => err)

      },
      // 根据Id删除对应的权限
      removeRightById(role, rightId) {
        // console.log(roleId + '--'+ rightId);
        //定义请求数据的参数
        const roleId = role.id
        const rightInfo = {
          roleId,
          rightId
        }
        this.$confirm('此操作将永久删除权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res => {
          // 发起删除请求
          removeRight(rightInfo).then(res => {
            // console.log(res);
            //弹出消息提示框
            if (res.meta.status !== 200) {
              return this.$message.error('取消权限失败')
            }
            this.$message.success('取消权限成功')
            console.log(role);
            role.children = res.data
          })
        }).catch(err => {
          // console.log(err);
          if (err == 'cancel')  this.$message.info('取消了删除！')
        })
      },
      // 点击分配权限按钮，弹出对话框,并拿到对应的role数据信息
      showSetRightDialog(role) {
        //保存点击的角色的id,在分配权限按钮中发送数据请求时应用
        this.roleId = role.id
        // 获取权限列表,树形结构
        getrights(this.type).then(res => {
          if (res.meta.status !== 200)  return rhis.$message.error('获取权限数据失败！')
          // 把获取到的权限数据保存到 data 中
          this.rightsList = res.data
        })
        // 递归获取三级节点的Id
        this.getLeafKeys(role, this.defKeys)
        //打开对话框
        this.setRightDialogVisible = true
      },
      // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys 数组中
      getLeafKeys(node, arr) {
        // 如果当前 node 节点不包含 children 属性，则是三级节点
        if (!node.children) return arr.push(node.id)
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      // 分配权限对话框关闭
      setRightDialogClosed() {
        this.defKeys = []
      },
      // 分配权限
      allotRights() {
        //以数组的形式保存选中权限的id
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        // console.log(keys);
        // console.log(this.$refs.treeRef.getCheckedKeys());
        // console.log(...this.$refs.treeRef.getHalfCheckedKeys());
        //以小数点隔开,变为字符串
        const idStr = keys.join(',')
        // console.log(idStr);
        const info = {
          roleId: this.roleId,
          rids: idStr
        }
        setRight(info).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('分配权限失败')
          this.$message.success('分配权限成功')
          this._getRoles()
          this.setRightDialogVisible = false
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }
  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }
  .vcenter {
    display: flex;
    align-items: center;
  }
</style>