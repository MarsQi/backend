<template>
	<div class="creatingRoles">
		<tips><span slot="nav">权限管理 > 新建角色</span></tips>
		<div class="xj-content">
			<div class="xj-title"><i class="iconfont icon-quanxianguanli2"></i>新建角色</div>
			<el-form v-loading="loadingNew" :model="form" :rules="rulesAdd" ref="form">
				<!--角色名称-->
				<el-form-item label="角色名称" :label-width="formLabelWidth" prop="name">
					<el-input v-model.trim="form.name" auto-complete="off" placeholder="请输入角色名称"></el-input>
				</el-form-item>
				<!--描述-->
				<el-form-item label="描述" :label-width="formLabelWidth" prop="memo">
					<el-input type="textarea" :rows="4" placeholder="请输入描述" v-model.trim="form.memo"></el-input>
				</el-form-item>
				<!--选择所属项目-->
				<el-form-item label="所属项目" :label-width="formLabelWidth" prop="projectID">
					<el-select v-model="form.projectID" filterable :placeholder="form.projectName" @change="selProject">
						<el-option v-for="(val,index) in projectList" :key="val.id" :label="val.name" :value="val.id"></el-option>
					</el-select>
				</el-form-item>
				<!--选择模块权限-->
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
							<items :model='model' v-for='model in moduleList' :key="model.id"></items>
							<p class="noPermission" v-if="noPermission">此角色没有模块权限</p>
						</ul>
					</div>
					<p class="error" v-if="permissionFlag">请至少选择一个权限</p>
				</el-form-item>
				<!--提交保存或重置-->
				<el-form-item class="btn" style="display: block;height: 74px;">
					<el-button class="save" type="primary" @click="save('form')">保存</el-button>
					<el-button class="off" @click="off('form')">取消</el-button>
				</el-form-item>
			</el-form>
		</div>
	</div>
</template>
<script>
	import tips from '@/components/tips'
	import items from '@/components/treeMenu'
	export default {
		data() {
			//非法字符验证
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
				//无模块权限提醒
				noPermission: false,
				permissionFlag: false,
				//保存状态
				loadingNew: false,
				projectList: [],
				moduleList: [],
				modulePermissionList: '',
				//新建角色表单数据
				form: {
					name: '',
					xiangmu: '',
					memo: '',
					projectID: "",
					projectName: ''
				},
				formLabelWidth: '96px',
				//新建角色正则验证
				rulesAdd: {
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
				moduleListName: [],
				moduleListChecked: []
			}
		},
		components: {
			tips,
			items
		},
		mounted() {
			this.getProject();
			this.getModulePermission();
		},
		methods: {
			//所属项目
			getProject() {
				this.axios.post("/sysCMSController/selectAllSysItem")
					.then((res) => {
						this.projectList = res.data.data;
						this.form.projectID = this.projectList[0].id;
						this.form.projectName = this.projectList[0].name;
						this.selProject(this.projectList[0].id);
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
			//当所属项目值发生改变时
			selProject(value) {
				if(value == '' || value == null){
				}else{
					this.axios.post("/menu/selectByGardePermission", {
						id: value
					})
					.then((res) => {
						this.moduleList = res.data.data;
						if(this.moduleList == null){
							this.noPermission = true;
						}else{
							this.noPermission = false;
						}
					}).catch((error) => {
						console.log(error);
					})
				}
			},
			//保存
			save(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						let menuIDs = [];
						let pid = [];
						let menuId = [];
						for(var i = 0; i < $("input[type=checkbox]").length; i++) {
							if($("input[type=checkbox]").eq(i).is(':checked')) {
								pid.push($("input[type=checkbox]").eq(i).attr("value"))
								menuId.push($("input[type=checkbox]").eq(i).parent().parent().find(".menuIds").attr("data-id"),$("input[type=checkbox]").eq(i).parents('div').find('b').attr("data-id"))
							}
						};
						for(var i = 0; i < menuId.length; i++) {
							if(menuIDs.indexOf(menuId[i]) == -1) {
								menuIDs.push(menuId[i])
							}
						};
						if(menuIDs == "") {
							this.permissionFlag = true;
						} else {
							this.loadingNew = true;
							this.permissionFlag = false;
							let menuIds = menuIDs.join(",");
							let pids = pid.join(",");
							let data = {
								userId: 1,
								roleName: this.form.name, //新建角色名称
								memo: this.form.memo, //角色描述
								itemId: this.form.projectID, //项目id
								menuIds: menuIds, //菜单id
								pids: pids //权限包id
							};
							this.axios({
									method: "post",
									url: "/roleContoller/saveRole",
									data: data,
									traditional: true
								})
								.then((res) => {
									this.loadingNew = false;
									if(res.data.status == 'SUCCESS') {
										this.$message({
											type: 'success',
											message: "恭喜你，保存成功",
										});
									} else {
										this.$message.error("保存失败");
									}
								}).catch((error) => {
									console.log(error);
								})
						}
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			//取消
			off(formName) {
				this.$refs[formName].resetFields();
				for(var i = 0; i < $("input[type=checkbox]").length; i++) {
					$("input[type=checkbox]").eq(i).prop("checked", false)
				}
				this.permissionFlag = false;
			},
			//关闭
			close(selectName, index) {
				let length = this.$refs[selectName].length - 1;
				if(index == length && this.$refs[selectName][length].checked) {
					this.$refs[selectName].forEach(function(val, key) {
						val.checked = false;
					});
					this.$refs[selectName][index].checked = true
				} else if(index == length && !this.$refs[selectName][length].checked) {
				} else if(this.$refs[selectName][length].checked) {
					this.$refs[selectName][length].checked = !this.$refs[selectName][length].checked
				}
			}
		}
	}
</script>
<style lang="less" scoped="scoped">
	.creatingRoles {
		width: 766/32rem;
		min-width: 766px;
		margin: 20px auto;
		.xj-content {
			margin-top: 20px;
			background: #ffffff;
			.xj-title {
				font-size: 16px;
				height: 44px;
				line-height: 44px;
				background: #ABC2D7;
				color: #ffffff;
				padding-left: 20px;
				margin-bottom: 30px;
				box-shadow: 0 2px 10px #cccccc;
				i {
					margin-right: 8px;
					vertical-align: middle;
				}
			}
			.el-form {
				.el-form-item {
					margin-bottom: 30px;
					padding-left: 1.3125rem;
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
						color:#48576a;
					}
					.noPermission {
						border-bottom: 1px solid #d9d9d9;
						height: 50px;
						line-height: 50px;
						text-align: center;
						color:#48576a;
					}
					.error {
						color: red;
						position: absolute;
						bottom: 0;
					}
				}
				.el-form-item:last-child {
					margin-bottom: 0;
				}
			}
		}
	}
</style>