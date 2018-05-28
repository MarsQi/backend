<template>
	<div id="jc-projectList">
		<tips><span slot="nav">项目管理 > 项目列表</span></tips>
		<div class="search">
			<span>项目编码 : </span>
			<el-input v-model="queryCode" placeholder="请输入" @keyup.enter.native="onSearch($event)"></el-input>
			<span>项目名称 : </span>
			<el-input v-model="queryName" placeholder="请输入" @keyup.enter.native="onSearch($event)"></el-input>
			<!-- 查询按钮 -->
			<button class="search-button" @click="onSearch">查询</button>
			<!-- 新建按钮 -->
			<button class="newly-button" @click='routerLink1_2'>新建</button>
		</div>
		<!-- 主体数据 -->
		<div class="data">
			<table>
				<thead>
					<tr>
						<td>序号</td>
						<td>项目编码</td>
						<td>项目名称</td>
						<td>是否可用</td>
						<td>创建人</td>
						<td>创建时间</td>
						<td>操作</td>
					</tr>
				</thead>
				<tbody>
					<no-data v-if="flag"></no-data>
					<tr v-for="(item,index) in list" :key='index'>
						<td>{{ (curPage-1)*10 + index + 1 }}</td>
						<td v-html="item.code"></td>
						<td v-html="item.name.length > 8? item.name.slice(0,9) + '...' : item.name"></td>
						<td v-html="item.enable == 0? '不可用':'可用'"></td>
						<td v-html="item.operator == null? '--':item.operator"></td>
						<td>
							{{ item.createTime}}
						</td>
						<td>
							<el-button class="edit-btn" type="text" @click="edit(item.id)">编辑</el-button>
							<el-button class="del-btn" type="text" @click="del(item.id)">删除</el-button>
						</td>
					</tr>
				</tbody>
			</table>
			<!-- 分页按钮 -->
			<div class="page">
				<rt-page ref="page" :cur="curPage" :total="total" @change="pageHandler"></rt-page>
			</div>
		</div>
		<!-- 编辑弹框层 -->
		<el-dialog title="编辑" :visible.sync="dialogFormVisible">
			<el-form v-loading="loadingEdit" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm" :visible.sync="dialogFormVisible">
				<el-form-item label="项目编码" prop="coding">
					<el-input v-model="ruleForm.coding" placeholder="请输入编码" :disabled="true"></el-input>
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
		</el-dialog>
		<!-- 添加模板 -->
		<div class="maskingLayer" v-if="transferdataBox" @click.self="transferdataBox = false">
			<div class="transferdataBox">
				<p>
					<span>选择模板</span>
					<span @click="transferdataBox = false">X</span>
				</p>
				<div class="contentBox">
					<template>
						<el-transfer v-loading="loading2" element-loading-text="玩命加载中..." v-model="value" :data="transferdata" :titles="['未关联模板', '已关联模板']"></el-transfer>
					</template>
				</div>
				<p>
					<el-button type="primary" @click="transferdataBoxFalse()">保 存</el-button>
					<el-button type="danger" @click="transferdataBox = false">取 消</el-button>
				</p>
			</div>
		</div>

	</div>
</template>

<script>
	import tips from '@/components/tips.vue'
	import rtPage from '@/components/pagination'
	import time from '@/filter/time'
	import noData from "@/components/noData";

	export default {
		data() {
			var projectCode = (rule, value, callback) => {
				console.log(this.ruleForm.coding)
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(value == "") {
					callback("项目编码不能为空")
				} else if(aa.test(value) == true) {
					callback("不能有非法字符")
				} else if(value == this.ruleForm.coding) {
					callback()
				} else {
					let data = {
						code: value
					}
					this.axios.post('/sysCMSController/selectSysItemByCode', data).then((res) => {
						console.log(res.data.data);
						if(res.data.data == false) {
							callback("项目编码重复了")
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
					if(value == this.editName) {
						callback()
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
				}
			};
			return {
				//保存状态
				loadingEdit: false,
				loading2: false,
				flag: false,
				// 所有项目列表
				list: [],
				// 查询项目编码
				queryCode: '',
				// 查询项目名称
				queryName: '',
				// 查询状态
				searchStatus: '0',
				//表单
				ruleForm: {
					coding: '', //项目编码
					name: '', //项目名称
					radio: '1', //可用
					describe: '', //项目描述
					desc: '' //备注
				},
				editName: '',
				formLabelWidth: '100px',
				// 添加模板后展示的编辑列表
				templateList: [],
				// 穿梭框展示的数据
				transferdata: [],
				value: [],
				// 编辑弹框
				dialogFormVisible: false,
				// 关联模板弹框
				transferdataBox: false,
				// 项目ID
				menuID: '',
				// 编辑弹层下方关联模板所展示的数据
				array: [],
				// 分页按钮数据
				curPage: 1,
				total: 0,
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
						message: '长度在  10 个字符以内',
						trigger: 'blur'
					}]
				}
			}
		},
		components: {
			tips,
			rtPage,
			noData
		},
		mounted() {
			// this.RequestAJAX()
		},
		methods: {
			// 初始化页面和查询
			pageHandler(curPage) {
				this.curPage = curPage;
				let data = {
					code: this.searchStatus == 0 ? '' : this.queryCode, // 项目编码
					like: this.searchStatus == 0 ? '' : this.queryName, // 项目名模糊
					pageIndex: this.curPage, // 第几页 从0开始
					pageSize: 10 // 每页条数
				}
				this.axios.post('/sysCMSController/selectSysItemByCondition', data)
					.then((res) => {
						console.log(res)
						this.list = res.data.data.list;
						if(res.data.data.list.length == 0) {
							this.flag = true
						} else {
							this.flag = false;
							this.total = Number(res.data.data.total);
						}

					})
					.catch(function(error) {
						console.log(error);
						this.flag = true
					})
			},
			// 初始化页面和查询
			onSearch(ev) {
				this.total = 0;
				this.searchStatus = 1
				let data = {
					code: this.searchStatus == 0 ? '' : this.queryCode, // 项目编码
					like: this.searchStatus == 0 ? '' : this.queryName, // 项目名模糊
					pageIndex: this.searchStatus == 0 ? '' : this.curPage, // 第几页 从0开始
					pageSize: 10 // 每页条数
				}
				this.axios.post('/sysCMSController/selectSysItemByCondition', data)
					.then((res) => {
						console.log(res)
						this.list = res.data.data.list;
						if(res.data.data.list.length == 0) {
							this.flag = true
						} else {
							this.flag = false;
							this.total = Number(res.data.data.total);
						}
					})
					.catch(function(error) {
						console.log(error);
						this.flag = true
					})
			},
			// 根据ID 将项目删除
			del(id) {
				this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					this.menuID = id;
					let data = {
						id: this.menuID
					}
					this.axios.post('/sysCMSController/delSysItem', data)
						.then((res) => {
							if(res.data == true) {
								this.$message({
									type: 'success',
									message: '删除成功!'
								});
								this.pageHandler(1);
							}
						})
						.catch(function(error) {
							console.log(error);
						})

				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});

			},
			// 编辑项目信息
			edit(id) {
				this.dialogFormVisible = true;
				this.menuID = id;
				let data = {
					id: this.menuID
				}
				this.axios.post("/sysCMSController/selectSysItemById", data)
					.then((res) => {
						if(res.status == 200) {
							let info = res.data.data;
							this.menuID = info.id;
							this.ruleForm.coding = info.code;
							this.ruleForm.name = info.name;
							this.editName = info.name;
							this.ruleForm.radio = "" + info.enable + "";
							this.ruleForm.describe = info.description;
							this.ruleForm.desc = info.remark;
							let newList = [];
							console.log(info.sysModuleListVO)
							if(info.sysModuleListVO.length >= 0) {
								for(let i = 0; i < info.sysModuleListVO.length; i++) {
									if(info.sysModuleListVO[i].id != null) {
										newList.push(info.sysModuleListVO[i]);
									}
								}
								this.templateList = newList;
							}
						} else {

						}
					}).catch((error) => {
						console.log(error);
					});
			},
			//编辑保存
			submitForm(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.loadingEdit = true
						var updateArr = [];
						if(this.templateList != "") {
							for(var i = 0; i < this.templateList.length; i++) {
								updateArr.push(this.templateList[i].id);
							}
							var stringUpdataArr = updateArr.join(",");
						}
						console.log(stringUpdataArr)
						let data = {
							id: this.menuID, // 项目ID
							name: this.ruleForm.name, // 项目名称
							code: this.ruleForm.coding, // 项目编码
							description: this.ruleForm.describe, // 项目描述
							enable: this.ruleForm.radio, // 是否可用
							remark: this.ruleForm.desc, // 备注
							itemplateIds: stringUpdataArr, // 模板ID数组
						}
						this.axios.post('/sysCMSController/updateSysItem', data)
							.then((res) => {
								this.loadingEdit = false
								if(res.data.data == true) {
									this.dialogFormVisible = false;
									this.$message({
										type: "success",
										message: "恭喜你,保存成功!"
									});
									//更新更改信息
									let data = {
										code: this.queryCode, // 项目编码
										like: this.queryName, // 项目名模糊
										pageIndex: this.curPage, // 第几页 从0开始
										pageSize: 10 // 每页条数
									}
									this.axios.post('/sysCMSController/selectSysItemByCondition', data)
										.then((res) => {
											this.list = res.data.data.list;
											this.total = Number(res.data.data.total);
										})
										.catch(function(error) {
											console.log(error);
										})
								} else {
									that.$message.error("保存失败");
								}
							})
							.catch(function(error) {
								console.log(error);
								this.loadingEdit = false
							})
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			//编辑弹出框取消
			resetForm(formName) {
				this.$refs[formName].resetFields();
				this.dialogFormVisible = false;
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
			// 查询所有的模板列表并且渲染在穿梭框内
			getTransferData() {
				this.transferdataBox = true;
				this.loading2 = true
				var that = this;
				this.axios.get('/template/getALlTemplateNoPagination', {
						params: {
							itemId: this.id,
							enable: 2
						}
					})
					.then(function(res) {
						that.loading2 = false
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
						console.log(lists.length);
						if(lists.length == "0") {
							that.value = [];
						} else {
							for(var i = 0; i < lists.length; i++) {
								transferArray.push(lists[i].id);
							}
							that.value = transferArray;
						}
					})
					.catch(function(error) {
						console.log(error);
						that.loading2 = false
					});
			},
			// 穿梭框保存按钮
			transferdataBoxFalse() {
				this.transferdataBox = false;
				var getValue = this.value;
				var arrays = this.array;
				var arr = [];
				for(var i = 0; i < arrays.length; i++) {
					for(var j = 0; j < getValue.length; j++) {
						if(arrays[i].id == getValue[j]) {
							arr.push(arrays[i]);
						}
					}
				};
				this.array = arr;
				this.templateList = arr;
			},
			// 跳转页面新建
			routerLink1_2() {
				this.$router.push('/navigator/addProject')
			}
		},
		/*检测输入框数据变化*/
		watch: {
			queryCode: function() {
				this.status = 0
			},
			queryName: function() {
				this.status = 0
			}
		},
	}
</script>

<style lang="less" scoped>
	#jc-projectList {
		width: 766/32rem;
		margin: 20px auto;
		.search {
			width: 766/32rem;
			margin-top: 20px;
			background: #ffffff;
			height: 90px;
			padding-left: 20/32rem;
			font-size: 12px;
			color: #333333;
			span {
				display: inline-block;
				line-height: 90px;
				&:nth-child(3) {
					margin-left: 20/32rem;
				}
			}
			.el-input {
				width: 140/32rem;
				.el-input__inner {
					width: 100%;
					margin-left: 12/32rem;
					height: 28px;
					border: 1px solid #cccccc;
					padding-left: 12px;
				}
			}
			.search-button {
				margin-left: 80/32rem;
				width: 58/32rem;
				height: 38px;
				background: #0190d4;
				border-radius: 4px;
				border: none;
				color: #ffffff;
				cursor: pointer;
			}
			.newly-button {
				margin-left: 30/32rem;
				width: 58/32rem;
				height: 38px;
				background: #f33535;
				border-radius: 4px;
				border: none;
				color: #ffffff;
				cursor: pointer;
			}
		}
		.data {
			height: 642px;
			background: #ffffff;
			margin-top: 30px;
			position: relative;
			table {
				width: 100%;
				font-size: 12px;
				thead {
					background: #abc2d7;
					color: #ffffff;
					height: 40px;
					line-height: 40px;
					td:nth-child(1) {
						width: 61/32rem;
					}
					td:nth-child(2),
					td:nth-child(3),
					td:nth-child(4),
					td:nth-child(5) {
						width: 106/32rem;
					}
					td:nth-child(6) {
						width: 131/32rem;
					}
					td:nth-child(7) {
						width: 147/32rem;
					}
				}
				tbody {
					tr {
						height: 50px;
						line-height: 30px;
						td {
							height: 50px;
							line-height: 50px;
							border-bottom: 1px solid #cccccc;
							color: #666666;
						}
					}
					tr:hover {
						background: #EEF1F6;
					}
				}
				td {
					text-align: center;
					border-right: 1px solid #cfd0d0;
				}
				td:last-child {
					border-right: none;
				}
				.edit-btn:active {
					color: #20a0ff;
					border-color: #20a0ff;
				}
			}
			.page {
				width: 100%;
				position: absolute;
				bottom: 19px;
				background-color: #fff;
				text-align: center;
				margin-top: 14px;
			}
		}
		.el-dialog__wrapper {
			.el-dialog.el-dialog--small {
				.el-dialog__body {
					.demo-ruleForm {
						.el-form-item {
							margin-bottom: 40px;
							.el-form-item__label {
								padding-right: 0px;
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
									position: relative;
									overflow-x: hidden;
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
						.button_box {
							text-align: center;
							margin-left: none;
						}
					}
				}
			}
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
				position: fixed;
				top: 50%;
				left: 50%;
				margin-left: -290/32rem;
				margin-top: -250px;
				z-index: 9999;
				background: white;
				p:nth-child(1) {
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
				p:last-child {
					text-align: center;
					margin-top: 65px;
				}
			}
		}
	}
</style>