<template>
	<div class="jp-authorityList">
		<tips><span slot="nav">权限管理 > 权限列表</span></tips>
		<!--搜索-->
		<div class="search">
			<span>角色名称 : </span>
			<el-input v-model.trim="name" placeholder="请输入角色名称" @keyup.enter.native="onSearch($event)"></el-input>
			<!-- 查询按钮 -->
			<button class="search-button" @click="onSearch()">查询</button>
		</div>
		<!--权限列表详情数据-->
		<div class="data" v-loading="loading" element-loading-text="拼命加载中">
			<table>
				<thead>
					<tr>
						<td>序号</td>
						<td>角色名称</td>
						<td>创建时间</td>
						<td>修改时间</td>
						<td>操作</td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item,index) in list" :key="index">
						<td>{{(curPage-1)*10 + index + 1}}</td>
						<td v-text="item.name"></td>
						<td>{{item.createTime | time}}</td>
						<td>{{item.updateTime | time}}</td>
						<td>
							<el-button class="edit-btn" type="text" @click="edit(item.id)">编辑</el-button>
							<el-button class="del-btn" type="text" @click="del(item.id)">删除</el-button>
						</td>
					</tr>
					<no-data v-if="flag"></no-data>
				</tbody>
			</table>
			<div id="page">
				<rt-page ref="page" :cur="curPage" :total="total" @change="pageHandler"></rt-page>
			</div>
		</div>
		<!--编辑弹框层-->
		<el-dialog class="edit" title="编辑" :visible.sync="editDialog">
			<el-form v-loading="loadingEdit" :model="form" :rules="rulesEdit" ref="form">
				<el-form-item label="角色名称" :label-width="formLabelWidth" prop="name">
					<el-input v-model.trim="form.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="描述" :label-width="formLabelWidth" prop="memo">
					<el-input type="textarea" :rows="4" placeholder="请输入内容" v-model.trim="form.memo">
					</el-input>
				</el-form-item>
				<el-form-item label="所属项目" :label-width="formLabelWidth" prop="projectID">
					<el-select v-model="form.projectID" filterable :placeholder="form.projectName" @change="changeValue">
						<el-option v-for="(val,index) in userProjectList" :index="index" :key="val.id" :label="val.name" :value="val.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="模块权限" :label-width="formLabelWidth">
					<!--为true不能点，false能点-->
					<div id="mudle-table">
						<ul class="thead">
							<li>
								<p>
									<span v-for="(val,index) in modulePermissionList" :key="index"><a v-html="val.name"></a></span>
								</p>
							</li>
						</ul>
						<ul class="moduleCon">
							<items :model='model' v-for='model in userModuleList' :key="model.id"></items>
							<p class="noPermission" v-if="noPermission">此角色没有模块权限</p>
						</ul>
					</div>
					<p class="error" v-if="permissionFlag">请至少选择一个权限</p>
				</el-form-item>
				<el-form-item class="btn">
					<el-button class="save" type="primary" @click="editSAVE('form')">保存</el-button>
					<el-button class="off" @click="editOFF('form')">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>
<script>
	import rtPage from '@/components/pagination'
	import noData from '@/components/noData'
	import tips from '@/components/tips'
	import items from '@/components/treeMenu'
	import time from '@/filter/time.js'
	export default {
		data() {
			var validatePass = (rule, value, callback) => {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(value == "") {
					callback("角色名称不能为空")
				} else if(aa.test(value) == true) {
					callback("不能有非法字符")
				} else {
					callback()
				}
			};
			return {
				editProjectID: '',
				oldModuleList: [],
				projectID: '',
				projectList: [],
				moduleList: [],
				noPermission: false,
				permissionFlag: false,
				//编辑用户所属项目.模块权限列表
				userProjectList: [],
				userModuleList: [],
				modulePermissionList: '',
				//保存状态
				loadingEdit: false,
				//暂无数据提示
				flag: false,
				//加载状态
				loading: false,
				/*搜索角色名称。id及其状态*/
				name: "",
				searchStatus: 0,
				roleId: '',
				/*初始化页面条数，页码，数据列表*/
				total: 0,
				curPage: 1,
				list: [],
				/*编辑弹框*/
				editDialog: false,
				/*编辑数据*/
				form: {
					name: '',
					projectID: '',
					projectName: '',
					memo: ''
				},
				formLabelWidth: '96px',
				/*编辑正则验证*/
				rulesEdit: {
					name: [{
						validator: validatePass,
						trigger: 'blur'
					}, {
						max: 8,
						message: '长度在  8 个字符以内',
						trigger: 'blur'
					}],
					projectID: [{
						required: true,
						message: '请选择所属项目'
					}],
					memo: [{
						max: 30,
						message: '长度在  30个字符以内',
						trigger: 'blur'
					}]
				},
			}
		},
		components: {
			tips,
			rtPage,
			noData,
			items
		},
		mounted() {
			this.getProject();
			this.getModulePermission();
		},
		methods: {
			//加载数据
			ajaxData(data) {
				this.axios.post("/roleContoller/selectRoleByNameLike", data)
					.then((res) => {
						this.loading = false
						if(res.data.data.list.length == 0) {
							this.flag = true;
							this.list = '';
							this.total = 0;
						} else {
							this.flag = false
							this.list = res.data.data.list;
							this.total = Number(res.data.data.total);
						}
					}).catch((error) => {
						console.log(error);
						this.flag = true;
						this.loading = false;
					})
			},
			//初始页面数据
			pageHandler(curPage) {
				//加载状态
				this.loading = true
				/*判断是否为查询过得状态*/
				this.curPage = curPage;
				let data = {
					roleName: this.searchStatus == 0 ? '' : this.name,
					pageIndex: this.curPage,
					size: 10
				};
				this.ajaxData(data)
			},
			//搜索
			onSearch(ev) {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(aa.test(this.name) == true) {
					alert("不能有非法字符")
				} else {
					/*判断是否为查询过得状态*/
					this.searchStatus = 1;
					this.loading = true;
					//从零开始
					this.total = 0;
					let data = {
						roleName: this.searchStatus == 0 ? '' : this.name,
						pageIndex: this.searchStatus == 0 ? '' : 1,
						size: 10
					};
					this.ajaxData(data)
				}
			},
			//所属项目
			getProject() {
				this.axios.post("/sysCMSController/selectAllSysItem")
					.then((res) => {
						this.projectList = res.data.data;
					}).catch((error) => {
						console.log(error);
					})
			},
			//模块权限对应字段
			getModulePermission() {
				this.axios.post("/permission/getAllPermatch")
					.then((res) => {
						this.modulePermissionList = res.data.data;
					}).catch((error) => {
						console.log(error);
					})
			},
			//编辑
			edit(id) {
				this.form.name = '';
				this.form.memo = '';
				this.form.projectName = '';
				this.noPermission = false;
				this.userModuleList = [];
				this.userProjectList = [];
				this.form.projectID = '';
				this.editDialog = true;
				this.roleId = id;
				let data = {
					roleId: id
				};
				this.loadingEdit = true;
				this.axios.post("/roleContoller/getRoleRelationAll", data)
					.then((res) => {
						this.loadingEdit = false
						this.editDialog = true;
						this.form.name = res.data.data.role.name;
						this.form.memo = res.data.data.role.memo;
						if(res.data.data.role.itemId != null){
							this.editProjectID = res.data.data.role.itemId;
							this.userProjectList = res.data.data.itemList;
							let that = this;
							res.data.data.itemList.forEach(function(val,key){
								if(val.id == res.data.data.role.itemId){
									that.form.projectName = val.name;
									that.form.projectID = val.id;
									that.projectID = val.id;
									that.userModuleList = val.menuLists;
									if(val.menuLists.length == 0){
										that.noPermission = true;
									}else{
										that.noPermission = false;
									}
								}
							});
						}else{
							this.userProjectList = res.data.data.itemList;
							this.form.projectName = res.data.data.itemList[0].name;
							this.form.projectID = res.data.data.itemList[0].id;
							this.projectID = res.data.data.itemList[0].id;
							this.userProjectList.forEach(function(val,key){
								if(val.menuLists.length == 0){
									that.noPermission = true;
								}else{
									that.noPermission = false;
								}
							});
						}
					}).catch((error) => {
						console.log(error);
						this.loadingEdit = false
					})
			},
			changeValue(value) {
				var that = this;
				this.userProjectList.forEach(function(val, key) {
					if(val.id == value) {
						that.userModuleList = val.menuLists;
						if(val.menuLists.length == 0){
							that.noPermission = true;
						}else{
							that.noPermission = false;
						}
					}
				})
			},
			//编辑保存
			editSAVE(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						let menuIDs = [];
						let pid = [];
						let menuId = [];
						for(var i = 0; i < $("input[type=checkbox]").length; i++) {
							if($("input[type=checkbox]").eq(i).is(':checked')) {
								pid.push($("input[type=checkbox]").eq(i).attr("value"))
								menuId.push($("input[type=checkbox]").eq(i).parent().parent().find(".menuIds").attr("data-id"),$("input[type=checkbox]").eq(i).parents('div').find('b').attr("data-id"));
							}
						}
						for(var i = 0; i < menuId.length; i++) {
							if(menuIDs.indexOf(menuId[i]) == -1) {
								menuIDs.push(menuId[i])
							}
						}
						let menuIds = menuIDs.join(",");
						let pids = pid.join(",");
						if(menuIds == "") {
							this.permissionFlag = true;
						} else {
							this.permissionFlag = false;
							this.loadingEdit = true;
							let data = {
								userId: 1,
								roleId: this.roleId,
								roleName: this.form.name,
								itemId: this.form.projectID,
								memo: this.form.memo,
								menuIds: menuIds, //菜单id
								pids: pids //权限包id
							};
							this.axios.post("/roleContoller/editRole", data)
								.then((res) => {
									this.loadingEdit = false;
									this.editDialog = false;
									if(res.status != "ERROR") {
										this.pageHandler(this.curPage)
										this.dialogEdit = false;
										this.$refs[formName].resetFields();
										this.$message({
											type: 'success',
											message: "恭喜你，保存成功",
										});
									} else {
										this.$message.error("保存失败");
									}
								}).catch((error) => {
									console.log(error);
									this.loadingEdit = false;
								});
						}
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			//编辑关闭
			editOFF(formName) {
				this.editDialog = false;
				this.$refs[formName].resetFields();
				this.noPermission = false
			},
			//删除
			del(id) {
				this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let data = {
						id: id
					}
					this.axios.post("/roleContoller/deleteRole", data)
						.then((res) => {
							this.pageHandler(this.curPage)
							this.$message({
								type: 'success',
								message: res.data.info
							});
						}).catch((error) => {
							console.log(error);
						});
				}).catch(() => {
					this.$message({
						type: 'info',
						message: '已取消删除'
					});
				});
			},
			//编辑弹框的的关闭按钮
			close(selectName, index) {
				let length = this.$refs[selectName].length - 1;
				if(index == length && this.$refs[selectName][length].checked) {
					this.$refs[selectName].forEach(function(val, key) {
						val.checked = false;
					})
					this.$refs[selectName][index].checked = true
				} else if(index == length && !this.$refs[selectName][length].checked) {
					// alert("a")
				} else if(this.$refs[selectName][length].checked) {
					this.$refs[selectName][length].checked = !this.$refs[selectName][length].checked
				}
			},
		},
		watch: {
			name: function() {
				this.searchStatus = 0
			}
		}
	}
</script>
<style lang="less" scoped="scoped">
	.jp-authorityList {
		width: 766/32rem;
		min-width: 766px;
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
			}
			.el-input {
				width: 140/32rem;
				margin-left: 14px;
				.el-input__inner {
					height: 28px;
				}
			}
			.search-button {
				margin-left: 340/32rem;
				width: 58/32rem;
				height: 38px;
				background: #0190d4;
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
						width: 62/32rem;
						min-width: 62px;
					}
					td:nth-child(2),
					td:nth-child(3),
					td:nth-child(4),
					td:nth-child(5) {
						width: 166/32rem;
						min-width: 166px;
					}
				}
				tbody {
					tr {
						height: 50px;
						line-height: 30px;
						color: #666666;
						td {
							height: 50px;
							line-height: 50px;
							border-bottom: 1px solid #cccccc;
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
			}
			#page {
				width: 100%;
				position: absolute;
				bottom: 19px;
				text-align: center;
			}
		}
		.edit {
			.el-form-item {
				margin-bottom: 30px;
			}
			.el-form-item__content {
				position: relative;
				.el-select {
					width: 17rem;
				}
				.el-input {
					width: 17rem;
				}
				.el-textarea {
					width: 17rem;
				}
				#mudle-table {
					width: 17rem;
					border: 1px solid #d9d9d9;
					margin-bottom: 36px;
					overflow: hidden;
					border-bottom: none;
				}
				.thead {
					width: 17rem;
					li {
						width: 17.024rem;
						border-bottom: 1px solid #d9d9d9;
						p {
							width: 100%;
							display: flex;
							font-size: 16px;
							height: 50px;
							line-height: 50px;
							border-right: 1px solid #ccc;
							span {
								width: 25%;
								text-align: center;
								border-right: 1px solid #ccc;
								a {
									color: #0190D4;
								}
							}
							span:first-child {
								text-align: left;
								width: 30%;
								a {
									margin-left: 30px;
								}
							}
							span:last-child {
								border: none;
							}
						}
					}
				}
				.moduleCon {
					width: 17rem;
					max-height: 350px;
					overflow-x: hidden;
					position: relative;
				}
				.error {
					color: red;
					position: absolute;
					bottom: 0;
				}
				.noPermission {
					border-bottom: 1px solid #d9d9d9;
					height: 50px;
					line-height: 50px;
					text-align: center;
				}
			}
		}
	}
</style>