<template>
	<div id="qgc_addTemplate">
		<tips>
			<span slot="nav">项目管理 > 新建项目</span>
		</tips>
		<div class="content_box">
			<div class="header">
				<i class="iconfont icon-xiangmuguanli"></i>添加项目列表
			</div>
			<el-form v-loading="loadingNew" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
				<el-form-item label="项目编码" prop="coding">
					<el-input v-model="ruleForm.coding" placeholder="请输入编码"></el-input>
				</el-form-item>
				<el-form-item label="项目名称" prop="name">
					<el-input v-model="ruleForm.name" placeholder="请输入名称"></el-input>
				</el-form-item>
				<el-form-item label="是否可用" :label-width="formLabelWidth" prop="radio">
					<el-radio class="radio" v-model="ruleForm.radio" label="1">是</el-radio>
					<el-radio class="radio" v-model="ruleForm.radio" label="0">否</el-radio>
				</el-form-item>

				</el-form-item>
				<el-form-item label="项目描述" prop="describe">
					<el-input type="textarea" v-model="ruleForm.describe" placeholder="请输入详细的项目描述"></el-input>
				</el-form-item>
				<el-form-item label="备注" prop="desc">
					<el-input type="textarea" v-model="ruleForm.desc" placeholder="请输入备注"></el-input>
				</el-form-item>
				<el-form-item label="关联模板">
					<div class="zwj_guanli">
						<div class="zwj_guanli_right">
							<span @click="getTransferData()">添加模板</span>
						</div>
						<ul class="thead">
							<li>序号</li>
							<li>模板编码</li>
							<li>模板名称</li>
							<li>模板类型</li>
							<li>创建人</li>
							<li>创建时间</li>
							<li>操作</li>
						</ul>
						<div class="tabelBox">
							<div class="table">
								<ul v-for="(item,index) in templateList" :key='index'>
									<li v-html="index + 1"></li>
									<li v-html="item.code"></li>
									<li v-html="item.name"></li>
									<li v-html="item.templateType"></li>
									<li v-html="item.operator == null? '--':item.operator"></li>
									<li>
										<span>{{ item.createTime}}</span>
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
			<!-- 编辑弹框层 -->
			<div class="maskingLayer" v-if="transferdataBox" @click.self="transferdataBox = false">
				<div class="transferdataBox">
					<p class="p">
						<span>选择模板</span>
						<span @click="transferdataBox = false">X</span>
					</p>
					<div class="contentBox">
						<template>
							<el-transfer v-loading="loading2" element-loading-text="玩命加载中..." v-model="value" :data="transferdata" :titles="['未关联模板', '已关联模板']"></el-transfer>
						</template>
					</div>
					<p class="transferdata-btnBox" style="margin:0;margin-top:65px">
						<el-button type="primary" @click="transferdataBoxFalse()">保 存</el-button>
						<el-button type="danger" @click="transferdataBox = false">取 消</el-button>
					</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	import tips from '@/components/tips.vue'
	import rtPage from '@/components/pagination'
	import time from '@/filter/time'
	import md5 from 'js-md5'
	export default {
		data() {
			var projectCode = (rule, value, callback) => {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(value == "") {
					callback("项目编码不能为空")
				} else if(aa.test(value) == true) {
					callback("不能有非法字符")
				} else {
					//					callback()
					let data = {
						code: value
					}
					this.axios.post('/sysCMSController/selectSysItemByCode', data).then((res) => {
						console.log(res.data.data);
						if(res.data.data == false) {
							callback("项目编码已存在")
						} else {
							callback()
						}
					})
				}
			};
			var projectName = (rule, value, callback) => {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(value == "") {
					callback("项目名称不能为空")
				} else if(aa.test(value) == true) {
					callback("不能有非法字符")
				} else {
					let data = {
						name: value
					}
					this.axios.post('/sysCMSController/selectSysItemByName', data).then((res) => {
						console.log(res.data.data);
						if(res.data.data == false) {
							callback("项目名称已存在")
						} else {
							callback()
						}
					})
				}
			};
			return {
				//保存状态
				loadingNew: false,
				loading2: false,
				// 添加模板后展示的编辑列表
				templateList: [],
				// 穿梭框展示的数据
				transferdata: [],
				value: [],
				// 编辑弹框
				dialogFormVisible: false,
				// 关联模板弹框
				transferdataBox: false,
				//表单
				ruleForm: {
					coding: '', //项目编码
					name: '', //项目名称
					radio: '', //可用
					describe: '', //项目描述
					desc: '' //备注
				},
				formLabelWidth: '96px',
				relationId: '', // 新增项目关联的模板ID
				rules: {
					coding: [{
						validator: projectCode,
						trigger: 'blur'
					}, {
						max: 5,
						message: '长度在  5 个字符以内',
						trigger: 'blur'
					}],
					name: [{
						validator: projectName,
						trigger: 'blur'
					}, {
						max: 5,
						message: '长度在  5 个字符以内',
						trigger: 'blur'
					}],
					radio: [{
						required: true,
						message: '请选择是否可用',
						trigger: 'blur'
					}],
					describe: [{
						message: '请输入项目描述',
						trigger: 'blur'
					}, {
						max: 30,
						message: '长度在  30 个字符以内',
						trigger: 'blur'
					}],
					desc: [{
						message: '请输入备注',
						trigger: 'blur'
					}, {
						max: 10,
						message: '长度在  10个字符以内',
						trigger: 'blur'
					}]
				}
			};
		},
		methods: {
			// 根据项目ID查询所有的模板列表并且渲染在穿梭框内
			getTransferData() {
				this.transferdataBox = true;
				this.loading2 = true;
				var that = this;
				this.axios.get('/template/getALlTemplateNoPagination', {
						params: {
							itemId: 6,
							enable: 2
						}
					})
					.then(function(res) {
						that.loading2 = false;
						var data = res.data.data;
						that.array = data;
						// 穿梭框展示的数据
						var newTransferData = [];
						for(var i = 0; i < data.length; i++) {
							newTransferData.push({
								key: data[i].id,
								label: `${ data[i].name }`
							})
						}
						that.transferdata = newTransferData;
						var transferArray = [];
						var lists = that.templateList;
						for(var i = 0; i < lists.length; i++) {
							transferArray.push(lists[i].id);
						}
						that.value = transferArray;

					})
					.catch(function(error) {
						console.log(error);
						that.loading2 = false;
					});
			},
			// 穿梭框保存按钮
			transferdataBoxFalse() {
				this.transferdataBox = false;
				var getValue = this.value;
				var arrays = this.array;
				var arr = [];
				var arrId = [];
				for(var i = 0; i < arrays.length; i++) {
					for(var j = 0; j < getValue.length; j++) {
						if(arrays[i].id == getValue[j]) {
							arr.push(arrays[i]);
							arrId.push(arrays[i].id);
						}
					}
				};
				this.array = arr;
				this.templateList = arr;
				this.relationId = arrId.join(",");
			},
			// 编辑中删除模板数据
			templateListDel(index) {
				this.$confirm("此操作将会删除该记录, 是否继续?", "提示", {
			        confirmButtonText: "确定",
			        cancelButtonText: "取消",
			        type: "warning"
			      })
			        .then(() => {
			          this.templateList.splice(index, 1);
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
			//保存
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.loadingNew = true;
						var that = this;
						let data = {
							name: this.ruleForm.name, // 项目名称
							code: this.ruleForm.coding, // 项目编码
							description: this.ruleForm.describe, // 描述
							enable: this.ruleForm.radio, // 是否可用
							remark: this.ruleForm.desc, // 备注
							itemplateIds: this.relationId // 模板ID列表
						}
						this.axios.post('/sysCMSController/addSysItem', data)
							.then(function(res) {
								if(res.data.data == true) {
									that.ruleForm.name = "";
									that.ruleForm.coding = "";
									that.ruleForm.describe = "";
									that.ruleForm.radio = "";
									that.ruleForm.desc = "";
									that.relationId = "";
									that.templateList = [];
									//调到列表页
									that.$router.push("/navigator/projectList");
									that.loadingNew = false;
									that.$message({
										type: "success",
										message: "恭喜你，保存成功",
									});
								} else {
									that.$message.error("保存失败");
									that.loadingNew = false;
								}
							})
							.catch(function(error) {
								console.log(error);
							})
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			//取消
			resetForm(formName) {
				this.$refs[formName].resetFields();
				this.templateList = [];
			}
		},
		//插槽
		components: {
			tips
		},
	}
</script>

<style scoped lang="less">
	#qgc_addTemplate {
		margin: 30px auto;
		width: 765/32rem;
		.content_box {
			width: 100%;
			margin-top: 30px;
			background: white;
			padding-bottom: 40px;
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
				.el-form-item__content {
					text-align: center;
				}
			}
			.el-form-item {
				margin-bottom: 30px;
				padding-left: 42/32rem;
				padding-right: 73/32rem;
				.el-form-item__label {
					padding-right: 30/32rem;
					text-align: right;
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
							flex: 1;
							width: 94px;
						}
						li:nth-child(3) {
							flex: 1.5;
							width: 110px;
						}
						li:nth-child(4) {
							flex: 1;
							width: 120px;
						}
						li:nth-child(5) {
							flex: 1;
							width: 100px;
						}
						li:nth-child(6) {
							flex: 1.5;
							width: 146px;
						}
						li:nth-child(7) {
							flex: 1;
							width: 75px;
						}
					}
					.tabelBox {
						width: 100%;
						max-height: 160px;
						overflow-x: hidden;
						position: relative;
						.table {
							width: 550/32rem;
							font-size: 12px;
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
									color: #7f7f7f;
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
									flex: 1;
								}
								li:nth-child(3) {
									flex: 1.5;
								}
								li:nth-child(4) {
									flex: 1;
								}
								li:nth-child(5) {
									flex: 1;
								}
								li:nth-child(6) {
									flex: 1.5;
								}
								li:nth-child(7) {
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
			.el-form-item:last-child {
				margin-bottom: 0;
			}
			.maskingLayer {
				position: fixed;
				top: 0;
				right: 0;
				bottom: 0;
				left: 0;
				margin: 0;
				background: rgba(0, 0, 0, .5);
				z-index: 10000;
				.transferdataBox {
					width: 580/32rem;
					height: 500px;
					font-size: 14px;
					position: absolute;
					top: 50%;
					left: 50%;
					margin-left: -290/32rem;
					margin-top: -250px;
					z-index: 9999;
					background: white;
					.p {
						height: 40px;
						background: #7793ad;
						color: white;
						span:nth-child(1) {
							float: left;
							margin-left: 15px;
							margin-top: 10px;
						}
						span:nth-child(2) {
							float: right;
							margin-right: 15px;
							margin-top: 10px;
							font-size: 22px;
							cursor: pointer;
						}
					}
					.contentBox {
						padding-left: 155px;
						margin-top: 45px;
					}
					.transferdata-btnBox {
						text-align: center;
						margin-top: 65px;
					}
				}
			}
		}
	}
</style>