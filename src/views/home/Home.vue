<template>
    <el-container class="home-container">
      <el-header>
        <div class="left">
          <img src="~assets/heima.png" alt="">
          <span>电商管理系统</span>
        </div>
        <div class="right">
          <el-button type="info" @click="logout">退出</el-button>
        </div>
      </el-header>
      <el-container>
        <!--左侧菜单栏-->
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <!--菜单栏折叠、展开效果-->
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!--定义一级菜单-->
          <!--index如果相同则点击时会一起展开，unique-opened一次只能一个列表展开
          collapse:是否开启折叠，collapse-transition是否开启折叠动画
          -->
          <el-menu background-color="#333744" text-color="#fff"
                   active-text-color="#409EFF"
                   unique-opened :collapse="isCollapse"
                   :collapse-transition="false" router
                   :default-active="activePath">
            <!--一级菜单的内容-->
            <el-submenu :index="item.id + ''" v-for="item in menulist"
                        :key="item.id">
              <template slot="title">
                <i :class="iconsObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <!--在以及菜单内定义二级菜单-->
                <el-menu-item :index="'/' + subItem.path"
                              v-for="subItem in item.children"
                              :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                  <template slot="title">
                    <i class="el-icon-menu"></i>
                    <!--使用事件监听路由跳转-->
                    <!--<span @click="goPath(subItem.path)">{{subItem.authName}}</span>-->
                    <!--使用element-ui的router定义的路由跳转-->
                    <span>{{subItem.authName}}</span>
                  </template>
                </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
  import {getMenuList} from 'network/home'
  export default {
    name: "Home",
    data() {
      return {
        menulist: [],
        iconsObj: {
          '125': 'iconfont icon-user',
          '103': 'iconfont icon-tijikongjian',
          '101': 'iconfont icon-shangpin',
          '102': 'iconfont icon-danju',
          '145': 'iconfont icon-baobiao'
        },
        isCollapse: false,
        activePath: ''
      }
    },
    created() {
      this.getToMenuList()
    },
    methods: {
      //1.事件监听相关
      logout() {
        window.sessionStorage.clear()
        this.$router.push('/login')
      },
      toggleCollapse() {
        this.isCollapse = !this.isCollapse
      },
      //该方法是通过@click的监听事件对路由进行跳转，
      // 但element-ui有一个router可以直接把index作为路由跳转，所以可以不用事件监听
      // goPath(path) {
      //   this.$router.push(path)
      // },
      //保持当前路由链接的激活状态
      saveNavState(activePath) {
        window.sessionStorage.setItem('activePath', activePath)
        this.activePath = activePath
      },

    // 2.网络请求相关
      getToMenuList() {
        getMenuList().then(res => {
          this.menulist = res.data
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
    .left {
      display: flex;
      align-items: center;
      span {
        margin-left: 15px;
      }
    }
  }
  .el-aside {
    background-color: #333744;
    .el-menu {
      border-right: none;
    }
  }
  .el-main {
    background-color: #eaedf1;
  }
  .iconfont {
    margin-right: 10px;
  }
  .toggle-button {
    background-color: #4a5064;
    font-size: 15px;
    line-height: 30px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer
  }
</style>