<template>
  <div id="zwj_addTemplate">
    <tips>
      <span slot="nav">模板管理 > 新建模板</span>
    </tips>
    <div class="content_box">
      <div class="header">
        <i class="iconfont icon-mobanguanli"></i>添加模板列表
      </div>
      <el-form v-loading="loading3" element-loading-text="保存中..." :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="模板编码" prop="coding">
          <el-input v-model="ruleForm.coding" placeholder="请输入模板编码"></el-input>
        </el-form-item>
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入模板名称"></el-input>
        </el-form-item>
        <el-form-item label="模板类型" prop="region">
          <el-select v-model="ruleForm.region" placeholder="请选择模板类型">
            <el-option v-for="(type,index) in templateType" :key="index" :label="type.name" :value="type.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板描述" prop="describe">
          <el-input type="textarea" v-model="ruleForm.describe" placeholder="请输入模板描述"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="desc">
          <el-input type="textarea" v-model="ruleForm.desc" placeholder="请输入备注"></el-input>
        </el-form-item>
        <el-form-item label="关联模块">
          <div class="zwj_guanli">
            <div class="zwj_guanli_right">
              <span @click="addModule">添加模块</span>
            </div>
						<ul class="thead">
							<li>序号</li>
							<li>模块名称</li>
              <li>模块编码</li>
							<li>创建人</li>
							<li>创建时间</li>
							<li>操作</li>
						</ul>
						<div class="tabelBox">
							<div class="table">
								<ul v-for="(item,index) in dataSource" :key='index'>
									<li v-html="index + 1"></li>
									<li v-html="item.name"></li>
									<li v-html="item.randum1"></li>
									<li v-html="item.operator"></li>
									<li>
										<span>{{item.createTime | time}}</span>
									</li>
									<li>
										<span class="ck-btn" @click="templateListDel(index)">删除</span>
									</li>
								</ul>
							</div>
						</div>
					</div>
        </el-form-item>
        <el-form-item class="button_box">
          <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
          <el-button @click="resetForm('ruleForm')">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--穿梭框-->
    <div v-if="transfer" class="tanWindow" @click.self="clearTan">
      <div class="transferBox">
        <div class="header">
          <span>选择模块</span>
          <span><i @click="clearTan" class="el-icon-close"></i></span>
        </div>
        <div class="bodyer">
          <template>
            <el-transfer v-loading="loading2" element-loading-text="玩命加载中..." v-model="value" :data="transferData" :titles="['未关联模块', '已关联模块']"></el-transfer>
          </template>
        </div>
        <div class="buttonbox">
          <button class="preserve" @click="preserve">保存</button>
          <button class="cancel" @click="clearTan">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tips from "@/components/tips";
import time from "@/filter/time.js";

export default {
  data() {
    var projectCode = (rule, value, callback) => {
      var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
      if (value == "") {
        callback("不能为空");
      } else if (aa.test(value) == true) {
        callback("不能有非法字符");
      } else {
        this.axios
          .get("/template/isExistTemplateCode?code=" + value)
          .then(res => {
            if (res.data.data.isExist == true) {
              callback("模板编码已存在");
            } else {
              callback();
            }
          });
      }
    };
    var projectName = (rule, value, callback) => {
      var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
      if (value == "") {
        callback("不能为空");
      } else if (aa.test(value) == true) {
        callback("不能有非法字符");
      } else{
        this.axios
          .get("/template/isExistTemplateName?templateName=" + value)
          .then(res => {
            if (res.data.data.isExist == true) {
              callback("模板名称已存在");
            } else {
              callback();
            }
          });
      }
    };
    return {
      //loading
      loading2: false,
      loading3: false,
      //关联数据
      dataSource: [],
      templateType: [],
      //穿梭框
      transferArr: [],
      transfer: false,
      value: [],
      transferData: [],
      ruleForm: {
        coding: "",
        name: "",
        region: "",
        describe: "",
        desc: ""
      },
      rules: {
        coding: [
          { required: true, validator: projectCode, trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        name: [
          { required: true, validator: projectName, trigger: "blur" },
          { max: 5, message: "长度在 5 个字符以内", trigger: "blur" }
        ],
        region: [{ required: true, message: "请选择模板类型", trigger: "change" }],
        describe: [{ message: "请输入模板描述", trigger: "blur" }],
        desc: [{ message: "请输入备注", trigger: "blur" }]
      }
    };
  },
  components: { tips },
  mounted() {
    this.axios
      .get("/template/getAllTemplateType")
      .then(res => {
        this.templateType = res.data.data;
      })
      .catch(err => {
        console.log(err);
      });
  },
  methods: {
    //添加模板
    addModule() {
      this.transfer = true;
      this.loading2 = true;
      this.axios
        .get("/template/getAllNotRelationModule")
        .then(data => {
          let res = data.data.data;
          this.transferArr = res;
          let newtransferData = [];
          for (let i = 0; i < res.length; i++) {
            newtransferData.push({
              key: res[i].currentModule.id,
              label: res[i].currentModule.name
            });
          }
          this.transferData = newtransferData;
          let dataSourceArr = this.dataSource;
          let valuess = [];
          for (let i = 0; i < dataSourceArr.length; i++) {
            valuess.push(dataSourceArr[i].id);
          }
          this.value = valuess;
          this.loading2 = false;
        })
        .catch(err => {
          console.log(err);
          this.loading2 = false;
        });
    },
    //穿梭框保存
    preserve() {
      this.transfer = false;
      let transferArrs = this.transferArr;
      let valueArr = this.value;
      let arrs = [];
      for (let i = 0; i < transferArrs.length; i++) {
        for (let j = 0; j < valueArr.length; j++) {
          if (transferArrs[i].currentModule.id == valueArr[j]) {
            arrs.push(transferArrs[i].currentModule);
          }
        }
      }
      this.dataSource = arrs;
    },
    //删除模板数据
    templateListDel(index) {
      this.$confirm("此操作将会删除该数据, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.dataSource.splice(index, 1);
          this.$message({
            type: "success",
            message: "删除成功!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
      
    },
    clearTan() {
      this.transfer = false;
    },
    //保存
    submitForm(formName) {
      let dataSourceArrs = this.dataSource;
      let arrss = [];
      for (let i = 0; i < dataSourceArrs.length; i++) {
        arrss.push(dataSourceArrs[i].randum1);
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading3 = true;
          let data = {
            sysModuleList: {
              code: this.ruleForm.coding,
              name: this.ruleForm.name,
              remark: this.ruleForm.desc,
              templateType: this.ruleForm.region,
              extend: this.ruleForm.describe
            },
            moduleDetails: arrss
          };
          let datas = JSON.stringify(data);
          this.axios
            .post("/template/saveTemplate", {
              data: datas
            })
            .then(res => {
              this.loading3 = false;
              this.$message({
                message: "恭喜你，保存成功",
                type: "success"
              });
              this.$router.push({ path: "/navigator/templateList" });
            })
            .catch(err => {
              this.loading3 = false;
              console.log(err);
              this.$message.error("保存失败");
            });
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style scoped lang="less">
#zwj_addTemplate {
  margin: 20px auto;
  width: 765/32rem;
  .content_box {
    width: 100%;
    margin-top: 30px;
    background: white;
    overflow: hidden;
    .header {
      width: 100%;
      height: 40px;
      background: #abc2d7;
      padding: 0 10/32rem;
      line-height: 40px;
      color: #ffffff;
      font-size: 16px;
      margin-bottom: 30px;
      i {
        margin-right: 10/32rem;
      }
    }
    .el-select {
      width: 550/32rem;
    }
    .button_box {
      text-align: center;
    }
    .el-form-item {
      margin-bottom: 30px;
      padding-left: 42/32rem;
      .el-form-item__label {
        margin-right: 45/32rem;
        padding-right: 30/32rem;
      }
      .el-input {
        width: 550/32rem;
      }
      .el-textarea {
        width: 550/32rem;
      }
      .el-form-item__content {
        .el-button--primary {
          width: 120/32rem;
          border: none;
          background: #0190d4;
          margin-right: 25/32rem;
        }
        .el-button--default {
          width: 120/32rem;
          background: #fb2f2f;
          color: white;
          border: none;
          margin-left: 25/32rem;
        }
        .el-form-item__error {
          left: 45/32rem;
        }
      }

      .zwj_guanli {
        width: 550/32rem;
        background: white;
        position: relative;
        display: inline-block;
        .zwj_guanli_right {
          span {
            color: white;
            background: #0190d4;
            display: inline-block;
            width: 70/32rem;
            height: 25px;
            border-radius: 5px;
            font-size: 12px;
            line-height: 25px;
            text-align: center;
            margin-bottom: 15px;
            cursor: pointer;
          }
          text-align: right;
          width: 550/32rem;
        }
        .thead {
          height: 42px;
          background: #dff0d8;
          color: #669265;
          line-height: 42px;
          border: 1px solid #cfd0d0;
          display: -webkit-flex;
          display: flex;
          li {
            height: 40px;
            line-height: 40px;
            text-align: center;
            font-size: 12px;
            border-left: 1px solid #cfd0d0;
          }
          li:nth-child(1) {
            flex: 0.5;
            border-left: none;
          }
          li:nth-child(2) {
            flex: 1.5;
            width: 94px;
          }
          li:nth-child(3) {
            flex: 1;
            width: 110px;
          }
          li:nth-child(4) {
            flex: 1;
            width: 120px;
          }
          li:nth-child(5) {
            flex: 1.5;
            width: 100px;
          }
          li:nth-child(6) {
            flex: 1;
            width: 146px;
          }
        }
        .tabelBox {
          width: 100%;
          max-height: 160px;
          position: relative;
          overflow-x: hidden;
          color: #48576a;
          .table {
            width: 550/32rem;
            font-size: 12px;
            ul:hover {
              background: #eef1f6;
            }
            ul {
              height: 40px;
              line-height: 40px;
              border-bottom: 1px solid #cfd0d0;
              display: -webkit-flex;
              display: flex;
              li {
                float: left;
                height: 40px;
                line-height: 40px;
                text-align: center;
                border-left: 1px solid #cfd0d0;
                .ck-btn {
                  color: #7f7f7f;
                  font-size: 12px;
                  cursor: pointer;
                }
              }
              li:nth-child(1) {
                flex: 0.5;
              }
              li:nth-child(2) {
                flex: 1.5;
              }
              li:nth-child(3) {
                flex: 1;
              }
              li:nth-child(4) {
                flex: 1;
              }
              li:nth-child(5) {
                flex: 1.5;
              }
              li:nth-child(6) {
                flex: 1;
                border-right: 1px solid #cfd0d0;
              }
            }
          }
        }
        .pages {
          position: absolute;
          bottom: 30px;
          width: 100%;
          text-align: center;
        }
      }
    }
  }
  .tanWindow {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    height: 100%;
    overflow-x: hidden;
    .transferBox {
      width: 650px;
      height: 490px;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -245px;
      margin-left: -338px;
      background: white;
      .bodyer {
        width: 458px;
        margin: 0 auto;
      }
      .header {
        height: 40px;
        width: 100%;
        background: #7793ad;
        line-height: 40px;
        span {
          font-size: 16px;
          margin-left: 15px;
          color: #e2e7ec;
          line-height: 40px;
          vertical-align: middle;
          i {
            float: right;
            margin-right: 15px;
            line-height: 40px;
            vertical-align: middle;
          }
          i:hover {
            color: #176ec2;
          }
        }
      }
      .el-transfer {
        margin-top: 45px;
      }
      .buttonbox {
        width: 100%;
        height: 30px;
        text-align: center;
        line-height: 30px;
        margin-top: 40px;
        button {
          border: none;
          width: 120px;
          height: 30px;
          color: white;
          font-size: 12px;
          border-radius: 5px;
          cursor: pointer;
        }
        .preserve {
          background: #0190d4;
          margin-right: 20px;
        }
        .cancel {
          background: #fb2f2f;
          margin-left: 20px;
        }
      }
    }
  }
}
</style>
