<template>
  <div class="add-goods">
    <!--面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--提示区域-->
      <el-alert title="添加商品信息"
                type="info"
                center
                show-icon
                :closable="false"></el-alert>
      <!--步骤条-->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!--tabs标签区域-->
      <el-form :model="addForm"
               :rules="addFormRules"
               ref="addFormRef"
               label-width="100px"
               label-position="top">
      <el-tabs v-model="activeIndex"
               :tab-position="tabPosition"
               :before-leave="beforeLeave"
               @tab-click="tabClicked">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader v-model="addForm.goods_cat"
                         :options="cateList"
                         :props=" cateProps"
                         @change="handleChange">
            </el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form-item :label="item.attr_name"
                        v-for="item in manyTableData"
                        :key="item.attr_id">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox :label="item1"
                           v-for="(item1, index) in item.attr_vals"
                           :key="index" border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name"
                        v-for="item in onlyTableData"
                        :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <el-upload
                  :action="uploadURL"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  list-type="picture"
                  :headers="headersObj"
                  :on-success="handleSuccess">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <!--富文本编辑-->
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>
          <el-button class="addBtn" type="primary" @click="add">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
      </el-form>
    </el-card>
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
  import _ from 'lodash'
  import {getCateGory} from 'network/goods/cateGories'
  import {getPamarm} from 'network/goods/params'
  import {addGoods} from 'network/goods/goodsList'
  export default {
    name: "AddGoods",
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
        // 但前所在的步骤和tabs标签页所在的位置
        activeIndex: '0',
        //tabs标签页的位置left|right|top|bottom
        tabPosition: 'left',
        //存放添加商品的各个参数
        addForm: {
          goods_name: '',
          goods_price: 0,
          goods_weight: 0,
          goods_number: 0,
          goods_cat: [],
          pics: [],
          goods_introduce: '',
          attrs: []
        },
        // 添加商品的验证规则
        addFormRules: {
          goods_name: [
            {required: true, message: '请输入商品名称', trigger: 'blur'}
          ],
          goods_price: [
            {required: true, message: '请输入商品价格', trigger: 'blur'},
            {validator: checkNum, trigger: 'blur'}
          ],
          goods_weight: [
            {required: true, message: '请输入重量', trigger: 'blur'},
            {validator: checkNum, trigger: 'blur'}
          ],
          goods_number: [
            {required: true, message: '请输入数量', trigger: 'blur'},
            {validator: checkNum, trigger: 'blur'}
          ],
          goods_cat: [
            {required: true, message: '请选择分类', trigger: 'blur'}
          ]
        },
        // 商品分类数据列表
        cateList: [],
        cateProps: {
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true,
          expandTrigger: 'hover'
        },
        // 动态参数列表数据
        manyTableData: [],
        // 静态属性列表数据
        onlyTableData: [],
        // 上传图片的URL地址
        uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
        // 设置请求头添加token
        headersObj: {
          Authorization: window.sessionStorage.getItem('token')
        },
        // 预览图片的路径地址
        previewPath: '',
        //预览图片的对话框显示与隐藏
        previewVisible: false
      }
    },
    computed: {
      cateId() {
        if (this.addForm.goods_cat.length ===3) {
          return this.addForm.goods_cat[2]
        }
        return null
      }
    },
    created() {
      this._getCateGory()
    },
    methods: {
      /*网络请求*/
      // 获取商品分类数据列表
      _getCateGory() {
        getCateGory().then(res => {
          // console.log(res);
          if (res.meta.status !==200) return this.$message.error('获取商品分类数据列表失败')
          this.cateList = res.data
        })
      },
      /*事件监听*/
      //级联选择款状态发送变化
      handleChange() {
        if (this.addForm.goods_cat.length !== 3) {
          return this.addForm.goods_cat = []
        }
      },
      // 切换标签
      beforeLeave(activeName, oldActiveName) {
        // activeName: 表示将要跳转过去的那个标签
        // oldActiveName：表示当前所处的标签,即将离开的标签
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请先选择商品分类！')
          return false
        }
      },
      //标签页点击
      tabClicked() {
        // console.log(this.activeIndex);
        if (this.activeIndex === '1') {
          getPamarm({id: this.cateId, activeName: 'many'}).then(res => {
            // console.log(res);
            if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
            //将attr_vals转化为数组保存
            res.data.forEach(item => {
              item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
            })
            this.manyTableData = res.data
          })
        }else if (this.activeIndex === '2') {
          getPamarm({id: this.cateId, activeName: 'only'}).then(res => {
            if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
            this.onlyTableData = res.data
          })
        }
      },
      // 预览图片
      handlePreview(file) {
        // console.log(file);
        this.previewPath = file.response.data.url
        this.previewVisible = true
      },
      // 图片删除
      handleRemove(file) {
        console.log(file);
        // 1. 获取将要删除的图片的临时路径
        const filePath = file.response.data.tmp_path
        // 2. 从 pics 数组中，找到这个图片对应的索引值
        const index = this.addForm.pics.findIndex(item => {
          return item.pic === filePath
        })
        // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
        this.addForm.pics.splice(index, 1)
      },
      //图片文件上传成功,将路径之保存到addForm中
      handleSuccess(response) {
        // console.log(response);
        // 1. 拼接得到一个图片信息对象
        const tmpPath = {pic: response.data.tmp_path}
        // 2. 将图片信息对象，push 到pics数组中
        this.addForm.pics.push(tmpPath)
      },
      //添加商品
      add() {
        // 1.表单预验证
        this.$refs.addFormRef.validate(vali => {
          if (!vali) return this.$message.error('请填写表单的必填项！')
        //  2.处理goods_cat:以','分割的分类列表,即将数组转为字符
        //  利用loadsh做深拷贝
          const form = _.cloneDeep(this.addForm)
          form.goods_cat = form.goods_cat.join(',')
        //  3.处理动态参数
          this.manyTableData.forEach(item => {
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals.join(' ')
            }
            this.addForm.attrs.push(newInfo)
          })
        //  4.处理静态参数
          this.onlyTableData.forEach(item => {
            // console.log(item);
            const newInfo = {
              attr_id: item.attr_id,
              attr_value: item.attr_vals
            }
            this.addForm.attrs.push(newInfo)
          })
          // 将addForm.attrs赋值给form.attrs
          form.attrs = this.addForm.attrs
          // 发送添加商品的数据请求
          addGoods(form).then(res => {
            // console.log(res);
            if (res.meta.status !==201) return this.$message.error('添加商品失败')
            this.$message.success('添加商品成功')
            //跳转到商品列表页面
            this.$router.push('/goods')
          })
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 15px 0 0 !important;
  }
  .previewImg {
    width: 100%;
  }
  .addBtn{
    margin-top: 15px;
  }
</style>