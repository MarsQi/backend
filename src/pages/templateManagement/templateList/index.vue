<template>
  <div id="template_control">
    <tips>
      <span slot="nav">模板管理 > 模板列表</span>
    </tips>
    <div class="header">
      <label for="">模板编码：</label><input v-model="queryCode" class="bianma" type="text" placeholder="请输入">
      <label for="">模板名称：</label><input v-model="queryName" class="mingcheng" type="text" placeholder="请输入">
      <span class="wrapper">
        <el-button @click="chaxun" class="but_cha">查询</el-button>
        <router-link to="/navigator/addtemplate">
          <el-button class="but_new">新建</el-button>
        </router-link>
      </span>
    </div>
    <div class="table_box">
      <table class="table">
        <thead>
          <tr>
            <td>序号</td>
            <td>模板编码</td>
            <td>模板名称</td>
            <td>模板类型</td>
            <td>创建人</td>
            <td>创建时间</td>
            <td>操作</td>
          </tr>
        </thead>
        <tbody v-loading="loading" element-loading-text="拼命加载中">
          <no-data v-if="flag"></no-data>
          <tr v-for="(l,index) in list" :key="index">
            <td>{{(curPage-1)*10 + index + 1}}</td>
            <td>{{l.code}}</td>
            <td>{{l.name}}</td>
            <td>{{l.templateType}}</td>
            <td>{{l.operator}}</td>
            <td>{{l.createTime}}</td>
            <td>
              <el-button class="gl-btn edit-btn" type="text" @click="redact(index)">编辑</el-button>
              <el-button class="ck-btn del-btn" type="text" @click="delet(index)">刪除</el-button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pages">
        <fpages ref="page" :cur="curPage" :total="total" @change="pageHandler"></fpages>
      </div>
    </div>
    <!-- 弹窗 -->
    <el-dialog title="编辑" :visible.sync="dialogFormVisible" class="zwj_dialog">
      <el-form v-loading="loading3" element-loading-text="保存中..." :model="templates" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="模板编码" prop="coding">
          <el-input v-model="templates.coding" placeholder="请输入模板编码" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="templates.name" placeholder="请输入模板名称"></el-input>
        </el-form-item>
        <el-form-item label="模板类型" prop="region">
          <el-select v-model="templates.region" placeholder="请选择模板类型">
            <el-option v-for="(type,index) in templateType" :key="index" :label="type.name" :value="type.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板描述" prop="describe">
          <el-input type="textarea" v-model="templates.describe" placeholder="请输入模板描述"></el-input>
        </el-form-item>
        <el-form-item label="备注" prop="desc">
          <el-input type="textarea" v-model="templates.desc" placeholder="请输入备注"></el-input>
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
										<span>{{item.createTime}}</span>
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
    </el-dialog>
    <!--穿梭框-->
    <div v-if="transfer" class="tanWindow" @click.self="clearTan">
      <div class="transferBox">
        <div class="transferheader">
          <span>选择模块</span>
          <span><i @click="clearTan" class="el-icon-close"></i></span>
        </div>
        <div class="bodyer">
          <template>
            <el-transfer v-loading="loading2" v-model="value" :data="transferData" :titles="['未关联模块', '已关联模块']"></el-transfer>
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
import time from "@/filter/time";
import fpages from "@/components/pagination";
import noData from "@/components/noData";

export default {
  data() {
    var projectName = (rule, value, callback) => {
      var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
      if (value == "") {
        callback("不能为空");
      } else if (aa.test(value) == true) {
        callback("不能有非法字符");
      } else {
        if(value==this.editName){
          callback()
        }else{
           this.axios
          .get("/template/isExistTemplateName?templateName=" + this.templates.name)
          .then(res => {
            if (res.data.data.isExist == true) {
              callback("模板名称已存在");
            } 
          });
        }
      }
    };
    var projectCode = (rule, value, callback) => {
        var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
        if (value == "") {
          callback("不能为空");
        } else if (aa.test(value) == true) {
          callback("不能有非法字符");
        } else {
          callback();
        }
      };
    return {
      //编辑-模板名
      editName: '',
      //没有数据图
      flag: false,
      //loading
      loading: false,
      loading2: false,
      loading3: false,
      //关联模块数据
      dataSource: [],
      //穿梭框数据
      transferArr: [],
      //穿梭框状态
      transfer: false,
      //穿梭框默认值
      value: [],
      //穿梭框数据
      transferData: [],
      //分页
      total: 0,
      curPage: 1,
      //列表数据
      list: [],
      //弹窗状态
      dialogFormVisible: false,
      templateType: [],
      table: false,
      //查询
      queryCode: "",
      queryName: "",
      queryStatus: 0,
      //form表单
      templates: {
        coding: "",
        name: "",
        region: "",
        describe: "",
        desc: ""
      },
      //form验证
      rules: {
        coding: [
          { required: true, validator: projectCode, trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        name: [
          { required: true, validator: projectName, trigger: "blur" },
          { min: 3, max: 5, message: "长度在 3 到 5 个字符", trigger: "blur" }
        ],
        region: [{ required: true, message: "请选择模板类型", trigger: "change" }],
        describe: [{ message: "请输入模板描述", trigger: "blur" }],
        desc: [{ message: "请输入备注", trigger: "blur" }]
      }
    };
  },
  components: { tips, fpages, noData },
  created() {},
  mounted() {
    this.getTypeList();
    this.chaxun();
  },
  watch: {
    queryCode: function() {
      this.queryStatus = 0;
    },
    queryName: function() {
      this.queryStatus = 0;
    }
  },
  methods: {
    //删除
    delet(index) {
      let data = this.list[index].code;
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.axios
            .get("/template/deleteTemplate?code=" + data)
            .then(res => {
              if (res.status == 200) {
                this.chaxun();
                this.$message({
                  type: "success",
                  message: "删除成功!"
                });
              }
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },
    //封装查询
    axiosCha(data) {
      this.axios
        .get("/template/getALlTemplate", data)
        .then(data => {
          this.list = data.data.data.list;
          if (data.data.data.list == "") {
            this.flag = true;
            this.loading = false;
          } else {
            this.total = Number(data.data.data.total);
            this.loading = false;
            this.flag = false;
          }
        })
        .catch(err => {
          console.log(err);
          this.loading = false;
          this.flag = true;
        });
    },
    //查询
    chaxun() {
      this.total = 0;
      this.queryStatus = 1;
      this.loading = true;
      let data = {
        params: {
          name: this.queryStatus == 0 ? "" : $.trim(this.queryName),
          code: this.queryStatus == 0 ? "" : $.trim(this.queryCode),
          pageIndex: this.curPage,
          size: 10
        }
      };
      this.axiosCha(data);
    },
    // 分页
    pageHandler(curPage) {
      this.curPage = curPage;
      this.loading = true;
      let data = {
        params: {
          name: this.queryStatus == 0 ? "" : $.trim(this.queryName),
          code: this.queryStatus == 0 ? "" : $.trim(this.queryCode),
          pageIndex: this.curPage,
          size: 10
        }
      };
      this.axiosCha(data);
    },
    //编辑
    redact(index) {
      this.dialogFormVisible = true;
      let data = this.list[index].code;
      this.axios
        .get("/template/getTemplateModules?templateCode=" + data)
        .then(data => {
          this.templates.name = data.data.data.template.name; //模板名称
          this.editName = data.data.data.template.name;
          this.templates.coding = data.data.data.template.code; // 模板编码
          this.templates.describe = data.data.data.template.extend; //模板描述
          this.templates.desc = data.data.data.template.remark; //备注
          this.templates.region = data.data.data.template.templateType; //模板类型
          this.dataSource = data.data.data.modules;
          if (this.modules == "") {
            this.table = false;
          } else {
            this.table = true;
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 编辑中删除模板数据
    templateListDel(index) {
      this.$confirm("此操作将会删除该记录, 是否继续?", "提示", {
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
    //模板类型
    getTypeList() {
      this.axios.get("/template/getAllTemplateType").then(data => {
        this.templateType = data.data.data;
      });
    },
    //添加模块
    addModule() {
      this.loading2 = true;
      this.transfer = true;
      let data = this.templates.coding;
      this.axios
        .get("/template/getAllNotRelationModuleByCode?code=" + data)
        .then(data => {
          let res = data.data.data;
          this.transferArr = res;
          let newtransferData = [];
          for (let i = 0; i < res.length; i++) {
            newtransferData.push({
              key: res[i].id,
              label: res[i].name
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
          if (transferArrs[i].id == valueArr[j]) {
            arrs.push(transferArrs[i]);
          }
        }
      }
      this.dataSource = arrs;
    },
    //删除弹出框
    clearTan() {
      this.transfer = false;
    },
    //保存
    submitForm(formName) {
      let dataSourceArr = this.dataSource;
      let arrss = [];
      for (let i = 0; i < dataSourceArr.length; i++) {
        arrss.push(dataSourceArr[i].randum1);
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading3 = true;
          let data = {
            sysModuleList: {
              code: this.templates.coding,
              name: this.templates.name,
              remark: this.templates.desc,
              templateType: this.templates.region,
              extend: this.extend
            },
            moduleDetails: arrss
          };
          let dataeee = JSON.stringify(data);
          this.axios
            .post("/template/updateTemplate", {
              data: dataeee
            })
            .then(res => {
              if (res.status == 200) {
                this.loading3 = false;
                this.dialogFormVisible = false;
                this.chaxun();
                this.$message({
                  message: "恭喜你，保存成功",
                  type: "success"
                });
              }
            })
            .catch(err => {
              this.loading3 = false;
              this.$message.error("保存失败");
              console.log(err);
            });
        } else {
          return false;
        }
      });
    },
    //取消
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.dialogFormVisible = false;
    }
  }
};
</script>

<style lang="less" scoped>
#template_control {
  margin: 30px auto;
  width: 765/32rem;
  .zwj_dialog {
    .el-dialog--small {
      .el-dialog__body {
        .demo-ruleForm {
          overflow: hidden;
          .el-select {
            width: 550/32rem;
          }
          .button_box {
            .el-form-item__content {
              text-align: center;
            }
          }
          .el-form-item {
            margin-bottom: 40px;
            margin-right: 0;
            .el-form-item__label {
              padding-right: 0px;
              margin-right: 45/32rem;
            }
            .el-input {
              width: 550/32rem;
            }
            .el-textarea {
              width: 550/32rem;
            }
            .el-form-item__content {
              text-align: center;
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
            }
            .el-form-item__error {
              left: 45/32rem;
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
      }
    }
  }
  .header {
    width: 100%;
    height: 80px;
    background: white;
    margin-top: 20px;
    font-size: 12px;
    line-height: 80px;
    padding: 0 20/32rem;
    label {
      margin-right: 15/32rem;
      color: #7a7a7a;
    }
    ::-webkit-input-placeholder {
      color: #97a8be;
    }
    ::-moz-placeholder {
      color: #97a8be;
    }
    ::-ms-input-placeholder {
      color: #97a8be;
    }
    input {
      width: 140/32rem;
      height: 28px;
      border: 1px solid #bfcbd9;
      margin-right: 20/32rem;
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 4px;
    }
    .but_cha {
      width: 60/32rem;
      height: 35px;
      border: none;
      background: #0190d4;
      color: white;
      margin-left: 60/32rem;
    }
    .but_new {
      width: 60/32rem;
      height: 35px;
      border: none;
      background: #f33535;
      color: white;
      margin-left: 30/32rem;
    }
  }
  .table_box {
    width: 100%;
    height: 690px;
    background: white;
    margin-top: 30px;
    position: relative;
    table {
      width: 100%;
      font-size: 12px;
      thead {
        height: 40px;
        background: #abc2d7;
        color: #ffffff;
        line-height: 40px;
        td:nth-child(1) {
          width: 60/32rem;
        }
        td:nth-child(2) {
          width: 90/32rem;
        }
        td:nth-child(3) {
          width: 100/32rem;
        }
        td:nth-child(4) {
          width: 115/32rem;
        }
        td:nth-child(5) {
          width: 105/32rem;
        }
        td:nth-child(6) {
        }
        td:nth-child(7) {
          width: 145/32rem;
        }
      }
      td {
        text-align: center;
        border-right: 1px solid #cfd0d0;
      }
      td:last-child {
        border-right: none;
      }
      tbody {
        tr:hover {
          background: #eef1f6;
        }
        tr {
          height: 50px;
          line-height: 30px;
          td {
            font-size: 12px;
            height: 50px;
            line-height: 50px;
            border-bottom: 1px solid #cccccc;
            color: #a0a0a0;
            .gl-btn {
              color: block;
              font-size: 12px;
            }
            .ck-btn {
              color: white;
              font-size: 12px;
            }
          }
        }
      }
    }
    .pages {
      position: absolute;
      bottom: 30px;
      width: 100%;
      text-align: center !important;
      .el-row {
        .el-col-24 {
          text-align: center !important;
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
      .transferheader {
        height: 40px;
        width: 100%;
        background: #7793ad;
        line-height: 40px;
        margin: 0;
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
