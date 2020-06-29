<template>
  <div class="orders">
    <!--面包屑导航区域-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片区域-->
    <el-card>
      <!--搜索区域-->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容"
                    v-model="queryInfo.query"
                    clearable
                    @clear="clearQuery">
            <el-button slot="append"
                       icon="el-icon-search"
                       @click="queryOrder"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!--数据列表区域-->
      <el-table :data="OrdersList" border stripe="">
        <!--索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价值" prop="order_price" width="100px">
        </el-table-column>
        <el-table-column label="是否付款" prop="pay_status" width="100px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">
              已付款
            </el-tag>
            <el-tag type="danger"v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="100px">
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="160px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140px">
          <template slot-scope="scope">
            <el-button size="mini"
                       type="primary"
                       icon="el-icon-edit"
                       @click="editAddress">
            </el-button>
            <el-button size="mini"
                       type="success"
                       icon="el-icon-location"
                       @click="queryProgress">
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination @size-change="handleSizeChange"
                     @current-change="handleCurrentChange"
                     :current-page="queryInfo.pagenum"
                     :page-sizes="[5, 8, 10, 15, 20]"
                     :page-size="queryInfo.pagesize"
                     layout="total, sizes, prev, pager, next, jumper"
                     :total="total">
      </el-pagination>
    </el-card>
    <!--编辑按钮对话框-->
    <el-dialog title="修改地址"
               :visible.sync="addressVisible"
               width="50%"
               @close="clearDialogForm">
      <el-form  :model="addressForm"
                :rules="addressFormRules"
                ref="addressFormRef"
                label-width="100px">
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader :options="cityData"
                       v-model="addressForm.address1">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="addressVisible = false">取 消</el-button>
    <el-button type="primary" @click="addressVisible = false">确 定</el-button>
  </span>
    </el-dialog>
    <!--展示物流进度的对话框-->
    <el-dialog title="物流进度"
               :visible.sync="progressVisible"
               width="50%">
      <el-timeline>
        <el-timeline-item
                v-for="(activity, index) in progressInfo"
                :key="index"
                :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
  import {getOrdersList, slectLogistics} from 'network/orders/orders'
  import cityData from './citydata'
  export default {
    name: "Orders",
    data() {
      return {
        // 订单数据列表请求参数
        queryInfo: {
          //查询参数
          query: '',
          // 当前页码
          pagenum: 1,
          // 每页显示条数
          pagesize: 8,
          // 用户 ID
          user_id: '',
          // 支付状态
          pay_status: '',
          // 是否发货
          is_send: '',
          // ['个人','公司']
          order_fapiao_title: '',
          // 公司名称
          order_fapiao_company: '',
          // 发票内容
          order_fapiao_content: '',
          // 发货地址
          consignee_addr: '',
        },
        OrdersList: [],
        // 总记录条数
        total: 0,
        // 修改对话框的显示与隐藏
        addressVisible: false,
        // 修改对话框中的表单
        addressForm: {
          address1: [],
          address2: ''
        },
        // 修改对话框中的表单验证规则
        addressFormRules: {
          address1: [
            {required: true, message:  '请选择省市区县', trigger: 'blur' }
          ],
          address2: [
            {required: true, message:  '请填写详细地址', trigger: 'blur' }
          ]
        },
        // 省市县的数据
        cityData,
        // 快递进度对话框的显示与隐藏
        progressVisible: false,
        // 物流信息数据
        progressInfo: [],
        //供测试的物流单号(只有一个测试的id）
        // logisticsId: 804909574412544580
      }
    },
    created() {
      //发送数据请求,获取订单数据列表
      this._getOrdersList()
    },
    methods: {
      /*数据请求*/
      _getOrdersList() {
        getOrdersList(this.queryInfo).then(res => {
          // console.log(res);
          if (res.meta.status !== 200) return this.$message.error('获取订单数据列表失败')
          this.OrdersList = res.data.goods
          this.total = res.data.total
        })
      },
      /*时间监听*/
      // 监听一页显示多少条记录
      handleSizeChange(newPageSize) {
        this.queryInfo.pagesize = newPageSize
        this._getOrdersList()
      },
      //监听页码值的改变;翻页
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this._getOrdersList()
      },
      // 通过query查询订单
      queryOrder() {
        this._getOrdersList()
      },
      //查询框内容清空
      clearQuery() {
        this._getOrdersList()
      },
      // 编辑按钮
      editAddress() {
        this.addressVisible = true
      },
      // 编辑对话框关闭
      clearDialogForm() {
        this.$refs.addressFormRef.resetFields()
      },
      // 展示物流进度的对话框
      queryProgress() {
        slectLogistics().then(res => {
          console.log(res);
          if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
          this.progressInfo = res.data
          this.progressVisible = true
        })
      }
    }
  }
</script>

<style scoped>

</style>