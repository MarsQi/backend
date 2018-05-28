<template>
  <div id="app">
    <!--<div class="zwj_shange-nav">
      <div class="app_nav">
        <div class="nav_left">
          <img :src="photo" alt="我是图像">
          <span>{{userName}}</span>
        </div>
      </div>
    </div>-->
    <!--菜单切换-->
		<div class="btn-left" :class="{btnleft:!isCollapse}">
			<el-radio-group v-model="isCollapse">
				<el-radio-button :label="false" v-if="isCollapse"><i class="iconfont icon-mulu2
 rg_head_mulu"></i></el-radio-button>
				<el-radio-button :label="true" v-if="!isCollapse"><i class="iconfont icon-mulu2
 rg_head_mulu"></i></el-radio-button>
			</el-radio-group>
		</div>
    <!--左侧导航-->
    <div class="sidebar_box" :class="{show:isCollapse}">
      <div class="zwj_shange-sidebar">
        <!--<div class="nav_right">
          <img src="./assets/img/logo.png" alt="">
          <span>循环场后台管理</span>
        </div>-->
        <div class="herdBox" :class="{herdBoxCollapse: isCollapse}">
          <!--用户信息-->
          <div class="ad_head">
            <div class="ad_head_img">
              <img :src="tuxiang" alt="">
              <img :src="statusImg" alt="" id="status">
            </div>
            <div class="ad_head_name" v-if="!isCollapse">
              {{username}}
            </div>
            <div class="ad_head_jtou" v-if="!isCollapse" @click="statusShow" :class="{rotate: statusFlag}">
              <i class="iconfont icon-xiala"></i>
            </div>
          </div>
          <!-- 搜索框 -->				
          <div class="ad_inp" :class="{show:isCollapse}">
            <i class="iconfont icon-sousuo"></i>
            <input type="text" placeholder="搜索" v-if="!isCollapse">
          </div>
          <!--<div class="serresult" v-if="showresult">
            <ul>
              <li class="lisearch" v-for='(item,index) in searchmenu' :key="index" @click="jumpitem(item,index)">{{item.name}}</li>
            </ul>
          </div>-->
        </div>		
				<!-- 状态选择 -->
				<div class="status-choose" v-show="statusFlag">
					<ul>
						<li v-for="item in statusImgList" :key="item.img" @click="statusImgSel(item.img,item.name)">
							<img :src="item.img" alt="">
							<span>{{item.name}}</span>
						</li>
					</ul>
					<div class="set">
						<img :src="setImg" alt="">
						<span>系统管理</span>
					</div>
					<div class="quit" @click="logOut">
						<img :src="quitImg" alt="">
						<span>退出</span>
					</div>
				</div>
        <el-menu :default-active="pathAct" router unique-opened class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" :collapse="isCollapse">
          <el-submenu index="1">
            <template slot="title">
              <i class="iconfont icon-xiangmuguanli"></i>
              <span slot="title">项目管理</span>
            </template>
            <el-menu-item index="/navigator">
              <span slot="title">项目列表</span>
            </el-menu-item>
            <el-menu-item index="/navigator/addProject">
              <span slot="title">新建项目</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <i class="iconfont icon-mobanguanli"></i>
              <span slot="title">模板管理</span>
            </template>
            <el-menu-item index="/navigator/templateList">
              <span slot="title">模板列表</span>
            </el-menu-item>
            <el-menu-item index="/navigator/addtemplate">
              <span slot="title">新建模板</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="3">
            <template slot="title">
              <i class="iconfont icon-mokuaiguanli1"></i>
              <span slot="title">模块管理</span>
            </template>
            <el-menu-item index="/navigator/moduleList">
              <span slot="title">模块列表</span>
            </el-menu-item>
            <el-menu-item index="/navigator/addModule">
              <span slot="title">新建模块</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="4">
            <template slot="title">
              <i class="iconfont icon-quanxianguanli2"></i>
              <span slot="title">权限管理</span>
            </template>
            <el-menu-item index="/navigator/usersList">
              <span slot="title">用户列表</span>
            </el-menu-item>
            <el-menu-item index="/navigator/authorityList">
              <span slot="title">角色列表</span>
            </el-menu-item>
            <el-menu-item index="/navigator/CreatingRoles">
              <span slot="title">新建角色</span>
            </el-menu-item>
            <el-menu-item index="/navigator/authoritySet">
              <span slot="title">权限设置</span>
            </el-menu-item>
          </el-submenu>
          <el-submenu index="5">
            <template slot="title">
              <i class="iconfont icon-rizhiguanli-copy"></i>
              <span slot="title">发布日志</span>
            </template>
            <el-menu-item index="/navigator/logManage">
              <span slot="title">日志管理</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
        <div class="footer-logo" v-if="!isCollapse">
          <img :src="logo" alt="logo">
        </div>
      </div>
    </div>
    <div class="zwj_shange-content" :class="{contentCollapse: isCollapse}">
      <div class="zwj_shange-content-title" :class="{contentTitle: isCollapse}"><span>象谱后台管理</span></div>
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
import onImg from "@/assets/img/zhuangtai/on.png";
import leaveImg from "@/assets/img/zhuangtai/leave.png";
import busyImg from "@/assets/img/zhuangtai/busy.png";
import hideingImg from "@/assets/img/zhuangtai/hideing.png";
import setImg from "@/assets/img/zhuangtai/set.png";
import quitImg from "@/assets/img/zhuangtai/quit.png";
import logo from "@/assets/img/menu-logo.png"
export default {
  name: "app",
  data() {
    return {
      true: true,
      userName: "用户名",
      photo: "",
      pathAct: '',
      statusFlag: false,//选择状态
      isCollapse: false,//左侧是否闭合
      username: "SunEee",//初始用户名
      statusImg: onImg,
      statusImgList: [
        {
          img: onImg,
          name: "在线"
        },
        {
          img: leaveImg,
          name: "离开"
        },
        {
          img: busyImg,
          name: "忙碌"
        },
        {
          img: hideingImg,
          name: "隐身"
        }
      ],
      setImg,
      quitImg,
      logo,
      tuxiang://图像
        "http://uc.weilian.cn/file-service/file-api.download?useOld=false&domain=user&type=photo&fileName=34475cd60000037f.jpg",
    };
  },

  created() {
    // 获取URL中的参数
    this.userName = this.getUrlParam("username");
    let photoIndex = window.location.search.indexOf("photo=");
    let usernameIndex = window.location.search.indexOf("&username=");
    let photo = window.location.search.substring(photoIndex + 6, usernameIndex);
    console.log(photo);
    if (this.userName == null) {
      this.userName = "用户名";
    } else {
      this.userName = this.getUrlParam("username");
    }
    if (photo == "") {
      this.photo =
        "http://uc.weilian.cn/file-service/file-api.download?useOld=false&domain=user&type=photo&fileName=34475cd60000037f.jpg";
    } else {
      this.photo = photo;
    }
  },
  watch:{
    $route(to, from) {
      console.log(this.$route.path,'77');
      if(this.$route.path == '/navigator/authoritySet/menuList' || this.$route.path == '/navigator/authoritySet/resourceList'|| this.$route.path == '/navigator/authoritySet/authorityResource'){
        this.pathAct = '/navigator/authoritySet'
      }else{
        this.pathAct = this.$route.path;
      }
    },
    isCollapse: function() {
      if (this.isCollapse == true) {
        this.statusFlag = false;
        this.showresult = false;
      }
    }
  },
  mounted() {
    if(this.$route.path == '/navigator/authoritySet/menuList' || this.$route.path == '/navigator/authoritySet/resourceList'|| this.$route.path == '/navigator/authoritySet/authorityResource'){
      this.pathAct = '/navigator/authoritySet'
    }else{
      this.pathAct = this.$route.path;
    }
  },
  methods: {
    //退出登录
    logOut(){
      this.axios.get("/logout")
        .then((res) => {
          console.log(res);
          if(res.data == "success"){
            this.$router.push({path: '/'});
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //状态切换
    statusShow() {
      this.statusFlag = !this.statusFlag;
    },
    statusImgSel(img, statusName) {
      this.statusImg = img;
      this.statusFlag = false;
      let data = {
        userStatus: statusName
      };
      // this.axios.post("/userMode/insertOrUpdate",data)
      //   .then(res => {
      //     if (res.data.status == "SUCCESS") {
      //       this.statusImg = img;
      //     }
      // });
    },
    // 获取URL中的参数
    getUrlParam(name) {
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) return decodeURIComponent(r[2]);
      return null;
    },
    //点击侧边栏事件
    handleOpen(key, keyPath) {
      console.log(key, keyPath);
      if(this.$route.path == '/navigator/authoritySet/menuList' || this.$route.path == '/navigator/authoritySet/resourceList'|| this.$route.path == '/navigator/authoritySet/authorityResource'){
        this.pathAct = '/navigator/authoritySet'
      }else{
        this.pathAct = this.$route.path;
      }
    },
    handleClose(key, keyPath) {
      console.log(key, keyPath);
    }
  },
};
</script>
<style lang="less" scoped>
html,
body {
  height: 100%;
  min-width: 1024px;
  .router-link-active {
    background-color: #575757;
  }
  #app {
    height: 100%;
    border-top: 1px solid white;
    .zwj_shange-nav {
      box-shadow: 0 0 10px #cccccc;
      position: fixed;
      z-index: 1000;
      padding: 0 10px;
      background: #ffffff;
      height: 50px;
      width: 100%;
      min-width: 1024px;
      .app_nav {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 15px;
        color: #575757;
        .nav_left {
          img {
            height: 40px;
            width: 40px;
            border-radius: 50%;
            vertical-align: middle;
            display: inline-block;
          }
          span {
            vertical-align: middle;
            display: inline-block;
            height: 100%;
            width: 55/32rem;
            text-align: center;
          }
        }
      }
    }
    //导航切换
    .btn-left {
      width: 64px;
      height: 61px;
      position: fixed;
      left: 64px;
      top: 0;
      z-index: 1200;
    
    }
    .btnleft {
      position: fixed;
      left: 220px;
    
    }
    .sidebar_box {
      background-color: #464646;
      width: 220px;
      height: 100%;
      float: left;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1001;
      overflow: hidden;
    
      .zwj_shange-sidebar {
        padding-top: 120px;
        color: #dbdbdb;
        height: 100%;
        width: 220px;
        overflow: hidden;
        width: 100%;
        z-index: 1999;
        .herdBox{
          position: fixed;
          top:0;
          background: #464646;
          z-index: 1002;
          width: 220px;
          height: 120px;
          .ad_head{
            width: 100%;
            height: 60px;
            background: #404040;
            .ad_head_img{
              position: absolute;
              width: 40px;
              height: 40px;
              left: 8px;
              margin-top: 10px;
              img{
                width: 40px;
                height: 40px;
                border-radius: 6px;
                display: block;
              }
              img:nth-child(2){
                position: absolute;
                display: block;
                width: 15px;
                height: 15px;
                bottom: -1px;
                right: -3px;
              }
            }
            .ad_head_name{
              color: #b5b5b5;
              font-size: 22px;
              position: absolute;
              left: 60px;
              top: 20px;
            }
            .ad_head_jtou{
              height:18px;
              line-height: 18px;
              position: absolute;
              left: 180px;
              top: 22px;
              cursor: pointer;
              i{
                display: block;
              }
            }
            .rotate {
              transform: rotate(180deg);
            
            }
          }
          .ad_inp{
            position: relative;
            padding-top: 14px;
            height: 60px;
            background: #464646;
            transition: all 0s;
            i{
              width: 18px;
              height: 18px;
              color: hsla(0,0%,100%,.3);
              position: absolute;
              top: 18px;
              left: 18px;
              font-size: 20px;
            }
            input{
              display: block;
              margin-left: 10px;
              float: left;
              width: 200px;
              height: 30px;
              background-color: #525252;
              font-size: 14px;
              color: #fff;
              border-radius: 10px;
              padding-left: 30px;
              border: 2px solid #8f8f8f;
            
            }
          }
        }
        .herdBoxCollapse{
          width: 64px;
        
        }
        .status-choose{
          position: fixed;
          left: 0;
          top: 120px;
          width: 219px;
          height: calc(~"100% - 60px");
          background-color: #464646;
          z-index: 1003;
          ul{
            li{
              height: 30px;
              line-height: 30px;
              font-size: 14px;
              color: #989898;
              cursor: pointer;
              text-align: left;
              margin-left: 20px;
              position: relative;
              img{
                width: 16px;
                height: 16px;
                position: absolute;
                top: 6px;
              }
              span{
                padding-left: 30px;
                line-height: 30px;
                font-size: 16px;
              }
            }
          }
          .set,.quit{
            font-size: 14px;
            color: #989898;
            cursor: pointer;
            margin-left: 20px;
            position: relative;
            text-align: left;
            img{
              width: 16px;
              height: 16px;
              position: absolute;
              top: 6px;
            }
            span{
              padding-left: 30px;
              line-height: 30px;
              font-size: 16px;
            }
          }
        }
        .footer-logo{
          width: 220px;
          height: 60px;
          text-align: center;
          background: #404040;
          position: fixed;
          bottom: 0;
          z-index: 1200;
          img{
            width: 151px;
            height: 25px;
            margin-top: 14.5px;
          }
        }
        .nav_right {
          // margin-bottom: 20px;
          img {
            width: 70px;
            height: 45px;
            vertical-align: middle;
          }
          span {
            vertical-align: middle;
            font-size: 18px;
            font-weight: 600;
            color: white;
          }
        }
      }
      a {
        display: block;
      }
    }
    .show{
      width: 64px;
    
    }
    .zwj_shange-content {
      padding-top: 60px;
      width: 100%-220px;
      background: #f5f5fa;
      min-width: 805px;
      margin-left: 220px;
      border: 1px solid white;
      height: 100%;
      overflow: auto;
      .zwj_shange-content-title{
        width: 100%;
        height: 60px;
        background: #fff;
        z-index: 999;
        position: fixed;
        top: 0;
        left: 220px;
        padding-left: 68px;
        span{
          line-height: 60px;
          color: #888;
          font-size: 22px;
        }
      }
      .contentTitle{
        left: 64px;
      
      }
    }
    .contentCollapse{
      margin-left: 64px;
    
    }
  }
}
</style>
