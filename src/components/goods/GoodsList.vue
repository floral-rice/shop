<template>
  <div class="goods-list">
    <!--面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--搜索与添加按钮-->
      <el-row :gutter="20">
        <el-col :span="9">
          <el-input placeholder="请输入内容"
                    v-model="info.query"
                    clearable
                    @clear="queryClear">
          <el-button slot="append"
                     icon="el-icon-search"
                     @click="queryGoods"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
        <el-col></el-col>
      </el-row>
      <!--商品列表区域-->
      <el-table :data="goodsList" border stripe="">
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)"
                         prop="goods_price"
                         width="105px">
        </el-table-column>
        <el-table-column label="商品重量"
                         prop="goods_weight"
                         width="80px">
        </el-table-column>
        <el-table-column label="创建时间"
                         prop="add_time"
                         width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="primary"
                       icon="el-icon-edit" @click="editGood(scope.row.goods_id)">
            </el-button>
            <el-button size="mini"
                       type="danger"
                       icon="el-icon-delete"
                       @click="removeGood(scope.row.goods_id)">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="info.pagenum"
              :page-sizes="[3,5, 8, 10, 15, 20]"
              :page-size="info.pagesize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total">
      </el-pagination>
    </el-card>
    <!--编辑按钮对话框-->
    <el-dialog
            title="修改商品信息"
            :visible.sync="editDialogVisible"
            width="75%"
            @close="editDialogClose">
      <el-form :model="editForm"
               :rules="editFormRules"
               ref="editFormRef"
               label-width="100px">
        <el-form-item label="商品ID">
          <span class="edId">{{editForm.goods_id}}</span>
        </el-form-item>
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品数量" prop="goods_number">
          <el-input v-model="editForm.goods_number" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight" type="number"></el-input>
        </el-form-item>
        <el-form-item label="商品介绍">
          <quill-editor v-model="editForm.goods_introduce"></quill-editor>
        </el-form-item>
        <el-form-item label="添加图片">
          <el-upload
                  :action="uploadURL"
                  :headers="headersObj"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-success="handleSuccess"
                  list-type="picture">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消
        </el-button>
        <el-button type="primary"
                   @click="editClick">确 定
        </el-button>
      </span>
    </el-dialog>
    <!--图片预览对话框-->
    <el-dialog
            title="预览图片"
            :visible.sync="previewVisible"
            width="50%">
      <img :src="previewPath" class="previewImg" alt="">
    </el-dialog>
  </div>
</template>

<script>
  import {
    getGoodsList,
    removeGoods,
    queryGoodById,
    editCommit} from 'network/goods/goodsList'
  export default {
    name: "GoodsList",
    data() {
      // 验证数字不得小于0
      const checkNum = (rule, value, cb) => {
        if (value >= 0) {
          // 价格合法,返回价格
          return cb()
        }
        cb(new Error('请输入合理的数字'))
      }
      return {
        //获取商品数据的参数
        info: {
          //查询参数
          query: '',
          // 当前页码
          pagenum: 1,
          // 每页显示条数
          pagesize: 10
        },
        // 存放商品数据
        goodsList: [],
        // 存放数据总条数
        total: 0,
        // 修改按钮对话框的点击与隐藏
        editDialogVisible: false,
        // 修改数据存放
        editForm: {
          id: null,
          attrs: [],
          goods_name: '',
          goods_price: 0,
          goods_number: 0,
          goods_weight: 0,
          goods_introduce: '',
          pics: []
        },
        // 修改表单验证规则
        editFormRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'}
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'},
            {validator: checkNum, trigger: 'blur'}
          ],
          goods_number: [
            {required: true, message: '请输入商品数量', trigger: 'blur'},
            {validator: checkNum, trigger: 'blur'}
          ],
          goods_weight: [
            {required: true, message: '请输入商品重量', trigger: 'blur'},
            {validator: checkNum, trigger: 'blur'}
          ]
        },
        // 上传图片的URL地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        // 图片上传组件的headers请求头对象
        headersObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        // 预览图片对话框的显示与隐藏
        previewVisible: false,
        // 预览图片的路径
        previewPath: ''
      }
    },
    created() {
      this._getGoodsList()
    },
    methods: {
      /*网球请求*/
      _getGoodsList() {
        getGoodsList(this.info).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('获取商品列表数据失败')
          this.$message.success('获取商品数据列表成功')
          this.goodsList = res.data.goods
          this.total = res.data.total
        })
      },
      /*时间监听*/
      // 一页显示条数改变
      handleSizeChange(newPageSize) {
        this.info.pagesize = newPageSize
        this._getGoodsList()
      },
      // 翻页
      handleCurrentChange(newPage) {
        this.info.pagenum = newPage
        this._getGoodsList()
      },
      // 查询商品
      queryGoods() {
        this._getGoodsList()
      },
      // 查询框清空
      queryClear() {
        this._getGoodsList()
      },
      // 删除商品
      removeGood(id) {
        this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          removeGoods(id).then(res => {
            console.log(res);
            if (res.meta.status !== 200) return this.$message.error('删除商品失败')
            this.$message.success('删除商品成功')
            this._getGoodsList()
            })
        }).catch(() => {
          this.$message.info('已取消删除商品')
        })
      },
      //添加商品
      addGoods() {
        //跳到添加商品页面
        this.$router.push('/goods/add')
      },
      // 修改商品按钮点击
      editGood(id) {
        // console.log(id);
        queryGoodById(id).then(res => {
          // console.log(res);
          // console.log(res.data);
          if (res.meta.status !== 200) return this.$message.error('查询商品失败')
          res.data.attrs.forEach(item => {
            const newAttrs = {
              attr_id: item.attr_id,
              attr_value: item.attr_value
            }
            this.editForm.attrs.push(newAttrs)
          })
          this.editForm.goods_id = res.data.goods_id
          this.editForm.goods_name = res.data.goods_name
          this.editForm.goods_price = res.data.goods_price
          this.editForm.goods_number = res.data.goods_number
          this.editForm.goods_weight = res.data.goods_weight
          this.editForm.goods_introduce = res.data.goods_introduce
          this.editForm.pics = res.data.pics
          this.editDialogVisible = true
        })
      },
      // 编辑对话框关闭
      editDialogClose() {
        // 清空表单
        this.$refs.editFormRef.resetFields()
      },
      // 图片预览
      handlePreview(file) {
        // console.log(file);
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      // 移除图片
      handleRemove(file) {
        // console.log(file);
        // 1. 获取将要删除的图片的临时路径
        const removePath = file.response.data.tmp_path
        // 2. 从 pics 数组中，找到这个图片对应的索引值
        const index = this.editForm.pics.findIndex(item => {
          item.pic = removePath
        })
        // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
        this.editForm.pics.splice(index, 1)
      },
      //上传成功,保存临时路径
      handleSuccess(response) {
        console.log(response);
        const newPath = {pic: response.data.tmp_path}
        this.editForm.pics.push(newPath)
      },
      // 编辑提交
      editClick() {
        //1表单预校验
        this.$refs.editFormRef.validate(vali => {
          if (!vali) return this.$message.error('请填写必要的参数信息!')
          const info = {
            id: this.editForm.goods_id,
            goods_name: this.editForm.goods_name,
            goods_price: this.editForm.goods_price,
            goods_number: this.editForm.goods_number,
            goods_weight: this.editForm.goods_weight,
            goods_introduce: this.editForm.goods_introduce,
            pics: this.editForm.pics,
            attrs: this.editForm.attrs
          }
          // editCommit(info).then(res => {
          //   console.log(res);
          //   if (res.meta.status !== 201) return this.$message.error('修改商品信息失败!')
          //   this.$message.success('修改信息成功!')
          //   this.editDialogVisible = false
          //   this._getGoodsList()
          // })
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .edId {
    display: inline-block;
    width: 100px;
    height: 30px;
    line-height: 30px;
    background-color: #d3d3d3;
    text-align: center;
  }
  .previewImg {
    width: 100%;
  }
</style>