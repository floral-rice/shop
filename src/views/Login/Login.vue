<template>
  <div class="login">
   <div class="login-box">
     <!--头像区域-->
     <div class="avatar_box">
       <img src="../../assets/logo.png"/>
     </div>
     <!--绘制表单-->
     <el-form :rules="loginFormRules" :model="loginform"
              label-width="0px" class="login_form"
              ref="loginFormRef">
       <!-- 用户名 -->
       <el-form-item prop="userName">
         <el-input v-model="loginform.userName"
                   prefix-icon="iconfont icon-user"
                   placeholder="请输入用户名">
         </el-input>
       </el-form-item>
       <!-- 密码 -->
       <el-form-item prop="userPassWord">
         <el-input v-model="loginform.userPassWord"
                   prefix-icon="iconfont icon-3702mima"
                   type="password"
                   placeholder="请输入密码">
         </el-input>
       </el-form-item>
       <!--两个按钮-->
       <el-form-item class="btn">
         <el-button type="primary" @click="login">登录</el-button>
         <el-button type="info" @click="resetLoginForm">重置</el-button>
       </el-form-item>
     </el-form>
   </div>
  </div>
</template>

<script>
  import {getLogin} from "network/login"
  export default {
    name: "Login",
    data() {
      return {
        loginform: {
          userName: '',
          userPassWord: ''
        },
        //表单验证规则对象
        loginFormRules: {
          //对用户名的验证
          userName: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message:'请输入 3 - 10 个字符', trigger: 'blur'}
          ],
          // 对用户密码的验证
          userPassWord: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min:6, max:15, message: '请输入 6-15 位的密码', trigger: 'blur'}
          ]
        },

      }
    },
    methods: {
      resetLoginForm() {
        //重置按钮点击，调用resetFields()方法对表单进行重置
        this.$refs.loginFormRef.resetFields()
      },
      login() {
        this.$refs.loginFormRef.validate(vaild => {
          if (!vaild) return
          getLogin(this.loginform).then(res => {
            // console.log(res);
            if (res.meta.status !==200)return this.$message.error('登录失败！')
            this.$message.success('登录成功')
            // 1. 将登录成功之后的 token，保存到客户端的 sessionStorage 中
            //   1.1 项目中出了登录之外的其他API接口，必须在登录之后才能访问
            //   1.2 token 只应在当前网站打开期间生效，
            // 所以将 token 保存在 sessionStorage 中
            window.sessionStorage.setItem('token', res.data.token)
            // console.log(window.sessionStorage.getItem('token'));
            //2. 通过编程式导航跳转到后台主页，路由地址是 /ManageHome
            this.$router.push('/managehome')
          })
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .login {
    height: 100%;
    background-color: #2b4b6b;
  }
  .login-box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .avatar_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #ddd;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: #eee;
      }
    }

    .login_form {
      width: 100%;
      position: absolute;
      bottom: 0;
      padding: 0 20px;
      box-sizing: border-box;
    }
    .btn {
      display: flex;
      justify-content: end;
    }
  }
</style>