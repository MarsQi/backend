<template>
	<div class="jp-authorityResource">
		<!--搜索条件-->
		<div class="menu-con">
			<p class="title">查询条件</p>
			<div class="menu-list">
				<div class="item">
					<div class="item-con">名称：</div>
					<div class="item-ipt">
						<el-input v-model.trim="name" placeholder="请输入内容" @keyup.enter.native="onSearch($event)"></el-input>
					</div>
				</div>
				<div class="item">
					<div class="item-con">所属权限：</div>
					<div class="item-ipt">
						<el-select v-model="permissionID" filterable placeholder="请选择所属权限">
							<el-option v-for="(val,index) in permissionList" :key="val.id" :label="val.name" :value="val.id"></el-option>
						</el-select>
					</div>
				</div>
				<div class="item">
					<button class="search" @click="onSearch">查询</button>
					<button class="add" @click="dialogAdd = true">新建</button>
				</div>
			</div>
		</div>
		<!--权限资源列表数据-->
		<div class="data" v-loading="loading" element-loading-text="拼命加载中">
			<table>
				<thead>
					<tr>
						<td>序号</td>
						<td>名称</td>
						<td>所属权限</td>
						<td>状态</td>
						<td>操作</td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item,index) in list" :key="index">
						<td>{{(curPage-1)*10 + index + 1}}</td>
						<td v-html="item.name"></td>
						<td v-html="item.permissionPackage.name"></td>
						<td>{{item.status == 1 ? '可用' : '不可用'}}</td>
						<td>
							<el-button class="edit-btn" type="text" @click="edit(item.id)">编辑</el-button>
							<el-button class="del-btn" type="text" @click="del(item.id,index)">删除</el-button>
						</td>
					</tr>
					<no-data v-if="flag"></no-data>
				</tbody>
			</table>
			<div id="page">
				<rt-page ref="page" :cur="curPage" :total="total" @change="pageHandler"></rt-page>
			</div>
		</div>
		<!--新建弹框层-->
		<el-dialog class="xinjian" title="新建" :visible.sync="dialogAdd">
			<el-form v-loading="loadingNew" :model="newBuild" :rules="rulesAdd" ref="newBuild">
				<el-form-item label="名称" :label-width="formLabelWidth" placeholder="请输入资源名称" prop="name">
					<el-input v-model.trim="newBuild.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="所属包" :label-width="formLabelWidth" prop="packageId">
					<el-select v-model="newBuild.packageId" placeholder="请选择所属包">
						<el-option v-for="(val,index) in permissionList" :key="val.id" :label="val.name" :value="val.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="资源URL" :label-width="formLabelWidth" prop="url">
					<el-input v-model.trim="newBuild.url" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="状态" :label-width="formLabelWidth">
					<el-radio class="radio" v-model="newBuild.radio" label="1">可用</el-radio>
					<el-radio class="radio" v-model="newBuild.radio" label="0">不可用</el-radio>
				</el-form-item>
				<el-form-item label="备注" :label-width="formLabelWidth" prop="memo">
					<el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入备注" v-model.trim="newBuild.memo">
					</el-input>
				</el-form-item>
				<el-form-item class="btn">
					<el-button class="save" type="primary" @click="addSAVE('newBuild')">保存</el-button>
					<el-button class="off" @click="addOFF('newBuild')">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		<!--编辑弹框层-->
		<el-dialog class="xinjian" title="编辑" :visible.sync="dialogEdit">
			<el-form v-loading="loadingEdit" :model="editDialog" :rules="rulesEdit" ref="editDialog">
				<el-form-item label="名称" :label-width="formLabelWidth" placeholder="请输入资源名称" prop="name">
					<el-input v-model.trim="editDialog.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="所属包" :label-width="formLabelWidth" prop="packageId">
					<el-select v-model="editDialog.packageId" :placeholder="editDialog.idName">
						<el-option v-for="(val,index) in permissionList" :key="val.id" :label="val.name" :value="val.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="资源URL" :label-width="formLabelWidth" prop="url">
					<el-input v-model.trim="editDialog.url" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="状态" :label-width="formLabelWidth">
					<el-radio class="editradio" v-model="editDialog.radio" label="1">可用</el-radio>
					<el-radio class="editradio" v-model="editDialog.radio" label="0">不可用</el-radio>
				</el-form-item>
				<el-form-item label="备注" :label-width="formLabelWidth" prop="memo">
					<el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入备注" v-model.trim="editDialog.memo">
					</el-input>
				</el-form-item>
				<el-form-item class="btn">
					<el-button class="save" type="primary" @click="editSAVE('editDialog')">保存</el-button>
					<el-button class="off" @click="editOFF('editDialog')">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
	</div>
</template>
<script>
	import rtPage from '@/components/pagination'
	import noData from '@/components/noData'
	import md5 from 'js-md5'
	export default {
		data() {
			//非法字符验证
			var patternNameNew = (rule, value, callback) => {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(value == "") {
					callback("权限资源不能为空")
				} else if(aa.test(value) == true) {
					callback("不能有非法字符")
				} else {
					this.axios.post("/permission/selectPermissionByNameNoPage", {
							name: value
						})
						.then((res) => {
							if(res.data.data) {
								callback()
							} else {
								callback("资源名称已存在")
							}
						}).catch((error) => {
							console.log(error);
						})
				}
			};
			var patternNameEdit = (rule, value, callback) => {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(value == "") {
					callback("权限资源不能为空")
				} else if(aa.test(value) == true) {
					callback("不能有非法字符")
				} else {
					if(value == this.editName) {
						callback()
					} else {
						this.axios.post("/permission/selectPermissionByNameNoPage", {
								name: value
							})
							.then((res) => {
								if(res.data.data) {
									callback()
								} else {
									callback("资源名称已存在")
								}
							}).catch((error) => {
								console.log(error);
							})
					}
				}
			};
			return {
				//新建,编辑保存状态
				loadingNew: false,
				loadingEdit: false,
				//暂无数据提示
				flag: false,
				//加载状态
				loading: false,
				/*搜索名称，权限id及其搜索状态*/
				name: '',
				permissionID: '',
				searchStatus: 0,
				/*所有权限列表*/
				permissionList: '',
				/*初始化页面条数，页码，数据列表*/
				total: 0,
				curPage: 1,
				list: "",
				/*编辑当前用户权限id*/
				userID: '',
				/*编辑，添加弹框显示隐藏*/
				dialogAdd: false,
				dialogEdit: false,
				/*新建数据*/
				newBuild: {
					name: '',
					packageId: null,
					radio: "1",
					memo: '',
					url: ''
				},
				/*编辑数据*/
				editDialog: {
					idName: "",
					name: '',
					packageId: null,
					radio: "1",
					memo: '',
					url: ''
				},
				formLabelWidth: '80px',
				editName: '',
				/*新建正则验证*/
				rulesAdd: {
					name: [{
						validator: patternNameNew,
						trigger: 'blur'
					}, {
						max: 8,
						message: '长度在  8个字符以内',
						trigger: 'blur'
					}],
					packageId: [{
						required: true,
						message: '请选择所属项目'
					}],
					url: [{
						required: true,
						message: '请输入资源',
						trigger: 'blur'
					}],
					memo: [{
						max: 30,
						message: '长度在  30个字符以内',
						trigger: 'blur'
					}]
				},
				/*编辑正则验证*/
				rulesEdit: {
					name: [{
						validator: patternNameEdit,
						trigger: 'blur'
					}, {
						max: 8,
						message: '长度在  8个字符以内',
						trigger: 'blur'
					}],
					packageId: [{
						required: true,
						message: '请选择所属项目'
					}],
					url: [{
						required: true,
						message: '请输入资源',
						trigger: 'blur'
					}],
					memo: [{
						max: 30,
						message: '长度在  30个字符以内',
						trigger: 'blur'
					}]
				}
			}
		},
		components: {
			rtPage,
			noData
		},
		mounted() {
			this.permissionPackage();
			this.restaurants = this.permissionPackage();
		},
		methods: {
			//加载数据
			ajaxData(data) {
				this.axios.post("/permission/selectPackagePermissionByConditon", data)
					.then((res) => {
						this.loading = false;
						if(res.data.list.length == 0) {
							this.flag = true;
							this.list = '';
							this.total = 0;
						} else {
							this.flag = false
							this.list = res.data.list;
							this.total = Number(res.data.total);
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
				this.curPage = curPage;
				let data = {
					name: this.searchStatus == 0 ? '' : this.name, //搜索用户名称
					packageId: this.searchStatus == 0 ? '' : this.permissionID, //搜索权限id
					pageIndex: this.curPage, //当前页码
					size: 10 //页面条数
				};
				this.ajaxData(data)
			},
			//搜索
			onSearch(ev) {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(aa.test(this.name) == true) {
					alert("不能有非法字符")
				} else {
					//加载状态
					this.loading = true;
					//从零开始
					this.total = 0;
					this.searchStatus = 1;
					let data = {
						name: this.searchStatus == 0 ? '' : this.name, //搜索名称
						packageId: this.searchStatus == 0 ? '' : this.permissionID, //搜索权限id
						pageIndex: this.searchStatus == 0 ? '' : this.curPage, //当前页码
						size: 10 //页面条数
					};
					this.ajaxData(data)
				}
			},
			//权限包
			permissionPackage() {
				this.axios.post("/permissionPackage/selectAllPackage", {
					status: 2 //状态：全部2
				}).then((res) => {
					this.permissionList = res.data.data;
				}).catch((error) => {
					console.log(error);
				})
			},
			//新建保存
			addSAVE(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.loadingNew = true;
						let data = {
							name: this.newBuild.name, //新建名称
							packageId: this.newBuild.packageId, //新建权限包id
							resource: this.newBuild.url, //新建资源
							memo: this.newBuild.memo, //新建描述
							status: this.newBuild.radio //新建状态
						};
						this.axios.post("/permission/savePermission", data)
							.then((res) => {
								this.loadingNew = false;
								if(res.data) {
									this.dialogAdd = false;
									this.name = "";
									this.permissionID = "";
									//从零开始
									this.total = 0;
									this.pageHandler(1);
									this.$refs[formName].resetFields();
									this.$message({
										message: "恭喜你，保存成功",
										type: "success"
									});
								} else {
									this.$message.error("保存失败");
								}
							}).catch((error) => {
								console.log(error);
								this.loadingNew = false;
							});
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			//新建关闭
			addOFF(formName) {
				this.dialogAdd = false;
				//清空文本框内容
				this.$refs[formName].resetFields();
			},
			//编辑
			edit(id) {
				this.userID = id;
				this.dialogEdit = true;
				let data = {
					id: id
				};
				this.axios.post("/permission/selectPermissionById", data)
					.then((res) => {
						this.userID = res.data.id; //用户id
						this.editDialog.name = res.data.name; //用户名称
						this.editName = res.data.name;
						this.editDialog.idName = res.data.permissionPackage.name; //权限包名称
						this.editDialog.packageId = res.data.permissionPackage.id; //权限包id
						this.editDialog.radio = "" + res.data.status + ""; //状态
						this.editDialog.url = res.data.resource; //资源
						this.editDialog.memo = res.data.memo; //描述
					}).catch((error) => {
						console.log(error);
					});
			},
			//编辑保存
			editSAVE(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						this.loadingEdit = true;
						let data = {
							id: this.userID, //当前点击id
							packageId: this.editDialog.packageId, //权限包id
							name: this.editDialog.name, //名称
							resource: this.editDialog.url, //资源
							memo: this.editDialog.memo, //描述
							status: this.editDialog.radio //状态
						};
						this.axios.post("/permission/updatePermissionById", data)
							.then((res) => {
								this.loadingEdit = false;
								if(res.data) {
									this.pageHandler(this.curPage)
									this.dialogEdit = false;
									this.$refs[formName].resetFields();
									this.$message({
										message: "恭喜你，保存成功",
										type: "success"
									});
								} else {
									this.$message.error("保存失败");
								}
							}).catch((error) => {
								console.log(error);
								this.loadingEdit = false;
							});
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			//编辑关闭
			editOFF(formName) {
				this.dialogEdit = false;
				this.$refs[formName].resetFields();
			},
			//删除用户
			del(id, index) {
				this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					let data = {
						id: id
					};
					this.axios.post("/permission/delPermissionById", data)
						.then((res) => {
							if(res.data) {
								this.pageHandler(this.curPage)
								this.$message({
									type: 'success',
									message: '删除成功!'
								});
							} else {
								this.$message.error("删除失败");
							}
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
		},
		watch: {
			name: function() {
				this.searchStatus = 0
			}
		}
	}
</script>
<style lang="less" scoped="scoped">
	.jp-authorityResource {
		.menu-con {
			background: #fff;
			padding: 0 20px;
			box-shadow: 0 0 10px #9E9EA1;
			.title {
				font-size: 14px;
				font-weight: 400;
				color: #787878;
				padding: 14px 0 14px 14px;
				border-bottom: 1px solid #cccccc;
			}
			.menu-list {
				height: 88px;
				padding: 30px 0;
				line-height: 28px;
				position: relative;
				.item {
					float: left;
					.item-con {
						margin: 0 14px;
						text-align: center;
						float: left;
						font-size: 14px;
						color: #333
					}
					.item-ipt {
						height: 28px;
						float: left;
						position: relative;
						.el-input {
							width: 140/32rem;
							min-width: 140px;
						}
					}
					button {
						width: 58/32rem;
						min-width: 60px;
						height: 38px;
						border-radius: 4px;
						border: none;
						color: #fff;
						margin-top: -2px;
						cursor: pointer;
					}
					.search {
						background: #0190D4;
						position: absolute;
						top: 28px;
						left: 75%;
					}
					.add {
						background: #f33535;
						position: absolute;
						top: 28px;
						left: 88%;
					}
				}
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
					}
					td:nth-child(2),
					td:nth-child(3),
					td:nth-child(4),
					td:nth-child(5) {
						width: 176/32rem;
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
		.xinjian {
			p {
				color: red;
				position: absolute;
				height: 20px;
				line-height: 20px;
			}
		}
	}
</style>