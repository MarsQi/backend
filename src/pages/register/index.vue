<template>
    <div class="container" @keyup.enter="login">
        <div class="login-background">
            <div class="img"></div>
        </div>
        <transition name="scale">
            <div class="login-content" v-show="show">
                <div class="top">
                    后台管理
                </div>
                <div class="con">
                    <!-- 用户名 -->
                    <div class="con-user">
                        <i class="iconfont icon-yonghu"></i>
                        <input type="text" placeholder="用户名" id="user" v-model.trim="userInput" @focus="userFocus">
                        <p v-show="userShow">{{userMsg}}</p>
                    </div>
                    <!-- 密码 -->
                    <div class="con-pass">
                        <i class="iconfont icon-suoding1"></i>
                        <input type="password" placeholder="密码" id="pass" v-model.trim="passInput" @focus="passFocus">
                        <p v-show="passShow">{{passMsg}}</p>
                    </div>
                    <!-- 按钮 -->
                    <div class="con-button">
                        <span>记住密码</span>
                        <el-switch v-model="value3" active-text="按月付费" inactive-text="按年付费">sss
                        </el-switch>
                        <!-- 登录按钮 -->
                        <button id="login" @click="login"><i class="iconfont icon-dayuhao"></i>登录系统</button>
                    </div>
                </div>
                <div class="footer">
                    ©<span>Suneee</span>
                </div>
            </div>
        </transition>
        
    </div>
</template>

<script>

export default {
    data() {
        return {
           show:false,//输入框动画
           value3: true,
           userMsg:'hhah',//用户提示信息
           passMsg:'aaaa',//密码提示信息
           userShow:false,
           passShow:false,
           userInput:'',
           passInput:''
        }
    },
    created(){
        let userName = localStorage.getItem('user')
        let passWord = localStorage.getItem('pass')
        if(userName !==null && passWord !==null){
            this.passInput = passWord;
            this.userInput = userName;
        }
    },
    mounted() {
        this.show = true;
    },
    watch:{
        
    },
    methods: {
      login(){
          if(this.userInput === ''){
              this.userShow = true;
              this.userMsg = '请输入用户名'
          }
          if(this.passInput === ''){
              this.passShow = true;
              this.passMsg = '请输入密码'
          }
          if(this.userInput !== '' && this.passInput !== ''){
              let datas = {
                  username:this.userInput,
                  password:this.passInput
              }
              this.axios.post('/loginPost',datas)
              .then(res=>{
                  console.log(res.data)
                  if(res.data.status == 'SUCCESS'){
                      if(this.value3){
                          localStorage.setItem('user',this.userInput)
                          localStorage.setItem('pass',this.passInput)
                      }else{
                        //   localStorage.clear()
                        localStorage.removeItem('user')
                        localStorage.removeItem('pass')
                      }
                      this.$router.push('/navigator')
                  }else{
                      this.passMsg = res.data.info
                      this.passShow = true
                  }
              })
              .catch(err=>{
                  console.log(err)
              })
          }
      },
      userFocus(){
          this.userShow = false;
          this.passShow = false;
      },
      passFocus(){
          this.userShow = false;
          this.passShow = false;
      }
    }
};
</script>
<style lang="less" scoped>
    html,body {
    width: 100%;
    height: 100%;
}
.container {
    width: 100%;
    height: 100%;
    background-color: #004b80;
    position: relative;
    .login-background {
        height: 400px;
        overflow: hidden;
        .img {
            height: 400px;
            background: url(../../assets/img/login_header.jpg) no-repeat center;
            animation: myfirst 30s infinite;
        }
    }
    .scale-enter-active, .scale-leave-active {
        transition: transform 1s;
    }
    .scale-enter, .scale-leave-to {
        transform: scale(0.1);
    }
    .login-content {
        width: 480px;
        height: 359px;
        position: absolute;
        left: 50%;
        margin-left: -240px;
        top: 186px;
        .top {
            width: 480px;
            height: 103px;
            line-height: 103px;
            background: rgba(0, 0, 0, 0.6);
            font-size: 26px;
            font-weight: 600;
            color: #fff;
            text-align: center;
        }
        .con {
            background-color: #fff;
            margin-bottom: 10px;
            .con-user {
                width: 100%;
                height: 79px;
                border-bottom: 1px dashed #eaedf1;
                // padding: 15px 5px;
                position: relative;
                i {
                    position: absolute;
                    top: 30px;
                    left: 40px;
                    font-size: 18px;
                    color: #666666;
                }
                #user {
                    width: 100%;
                    height: 100%;
                    border: none;
                    padding-left: 70px;
                }
                p{
                    padding-left: 70px;
                    color: red;
                    font-size: 12px;
                    position: absolute;
                    bottom: 0;
                }
            }
            .con-pass {
                width: 100%;
                height: 79px;
                border-bottom: 1px dashed #eaedf1;
                // padding: 15px 5px;
                position: relative;
                i {
                    position: absolute;
                    top: 30px;
                    left: 40px;
                    font-size: 18px;
                    color: #666666;
                }
                #pass {
                    width: 100%;
                    height: 100%;
                    border: none;
                    padding-left: 70px;
                }
                p{
                    padding-left: 70px;
                    color: red;
                    font-size: 12px;
                    position: absolute;
                    bottom: 0;
                }
            }
            .con-button {
                width: 100%;
                height: 65px;
                background-color: #f9fafc;
                text-align: left;
                
                padding-left: 35px;
                span{
                    font-size: 14px;
                    color: #666666;
                    vertical-align: middle;
                }
                button {
                    float: right;
                    margin-right: 25px;
                    margin-top: 17px;
                    background-color: #6ad2eb;
                    border: 1px solid #1bbae1;
                    border-radius: 3px;
                    padding: 5px 10px 5px 15px;
                    cursor: pointer;
                    font-size: 12px;
                    color: #fff;
                    position: relative;
                    i {
                        position: absolute;
                        font-size: 12px;
                        left: 2px;
                        top: 7px;
                    }
                }
            }
        }
        .footer {
            font-size: 14px;
            color: #999999;
            text-align: center;
            span {
                color: #1bbae1;
            }
        }
    }
}
@keyframes myfirst {
    0% {
        transform: scale(1.1);
    }
    50% {
        transform: scale(1);
    }
    100% {
        transform: scale(1.1);
    }
}
@-webkit-keyframes myfirst {
    0% {
        transform: scale(1.1);
    }
    50% {
        transform: scale(1);
    }
    100% {
        transform: scale(1.1);
    }
}
@-moz-keyframes myfirst {
    0% {
        transform: scale(1.1);
    }
    50% {
        transform: scale(1);
    }
    100% {
        transform: scale(1.1);
    }
}
@-ms-keyframes myfirst {
    0% {
        transform: scale(1.1);
    }
    50% {
        transform: scale(1);
    }
    100% {
        transform: scale(1.1);
    }
}

</style>

