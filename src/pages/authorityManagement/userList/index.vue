<template>
	<div class="jp-userList">
		<tips><span slot="nav">权限管理 > 用户列表</span></tips>
		<!--搜索-->
		<div class="search">
			<span>用户名称 : </span>
			<el-input v-model.trim="searchName" placeholder="请输入用户名称" @keyup.enter.native="onSearch($event)"></el-input>
			<!-- 查询按钮 -->
			<button class="search-button" @click="onSearch()">查询</button>
		</div>
		<!--用户列表数据-->
		<div class="data" v-loading="loading" element-loading-text="拼命加载中">
			<table>
				<thead>
					<tr>
						<td>序号</td>
						<td>用户名</td>
						<td>姓名</td>
						<td>手机号</td>
						<td>操作</td>
					</tr>
				</thead>
				<tbody>
					<tr v-for="(item,index) in list" :key="index">
						<td>{{(curPage-1)*10 + index + 1}}</td>
						<td>{{item.userName ? item.userName : ""}}</td>
						<td>{{item.name ? item.name: "无真实姓名"}}</td>
						<td>{{item.mobile ? item.mobile : "无手机号码"}}</td>
						<td>
							<el-button class="gl-btn edit-btn" type="text" @click="relevanceRole(item.userId)">关联角色</el-button>
							<el-button class="ck-btn del-btn" type="text" @click="lookOver(item.userId)">查看</el-button>
						</td>
					</tr>
					<no-data v-if="flag"></no-data>
				</tbody>
			</table>
			<div id="page">
				<rt-page ref="page" :cur="curPage" :total="total" @change="pageHandler"></rt-page>
			</div>
		</div>
		<!--关联角色弹框层-->
		<el-dialog class="relevance" title="关联角色" :visible.sync="relevance">
			<div class="loadingRole" v-loading="loading2">
				<div id="roles">
					<table>
						<thead>
							<tr>
								<td>选择</td>
								<td>角色名称</td>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(val,index) in roleList" :key="index">
								<td><input type="checkbox" name="" ref="roleType" :value="val.id" checked/></td>
								<td>{{val.name}}</td>
							</tr>
							<tr v-for="(val,index) in noroleList" :key="index">
								<td><input type="checkbox" name="" ref="roleType" :value="val.id" /></td>
								<td>{{val.name}}</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div class="btn">
					<el-button class="save" @click="relevanceSAVE()" type="primary">保存</el-button>
					<el-button class="off" @click="relevanceOFF">取消</el-button>
				</div>
			</div>
		</el-dialog>
		<!--查看层-->
		<el-dialog class="lookMesage" title="用户详情" :visible.sync="lookMesage">
			<div class="item">
				<div class="item-name">
					用户名：
				</div>
				<div class="item-con">
					{{username ? username : '无用户名'}}
				</div>
			</div>
			<div class="item">
				<div class="item-name">
					真实姓名：
				</div>
				<div class="item-con">
					{{name ? name : '无真实姓名'}}
				</div>
			</div>
			<div class="item">
				<div class="item-name">
					性别：
				</div>
				<div class="item-con">
					{{sex != null ? (sex ? "男" : "女") : ''}}
				</div>
			</div>
			<div class="item">
				<div class="item-name">
					手机号码：
				</div>
				<div class="item-con">
					{{tel ? tel : '无手机号码'}}
				</div>
			</div>
			<div class="item">
				<div class="item-name">
					邮箱：
				</div>
				<div class="item-con">
					{{email ? email : '无邮箱'}}
				</div>
			</div>
			<div class="item">
				<div class="item-name">
					创建时间：
				</div>
				<div class="item-con">
					{{cj_time | time}}
				</div>
			</div>
			<div class="item">
				<div class="item-name">
					修改时间：
				</div>
				<div class="item-con">
					{{xg_time | time}}
				</div>
			</div>
			<div class="item">
				<div class="item-name">
					关联角色：
				</div>
				<div class="item-con roles">
					<span v-for="(val,index) in role" :key="index">{{val.name +" |"}}</span>
				</div>
			</div>
		</el-dialog>
	</div>
</template>
<script>
	import rtPage from '@/components/pagination'
	import noData from '@/components/noData'
	import tips from '@/components/tips'
	import time from '@/filter/time.js'
	export default {
		data() {
			return {
				//关联角色保存状态
				loading2: false,
				//暂无数据提示
				flag: false,
				//加载状态
				loading: false,
				/*搜索名称，项目id*/
				searchName: "",
				/*搜索状态*/
				searchStatus: 0,
				/*初始化页面条数，页码，数据列表*/
				total: 0,
				curPage: 1,
				list: [],
				/*查看，关键角色弹框*/
				lookMesage: false,
				relevance: false,
				/*查看弹框信息*/
				name: "",
				username: "",
				tel: "",
				sex: "",
				cj_time: "",
				xg_time: "",
				email: "",
				role: "",
				/*已有角色，没有关联角色*/
				roleList: "",
				noroleList: [],
				/*编辑当前用户id*/
				userId: ''
			}
		},
		components: {
			tips,
			rtPage,
			noData
		},
		mounted() {
		},
		methods: {
			//加载数据
			ajaxData(data) {
				this.axios.post("/user/listByConditionUser", data)
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
						this.loading = false
					})
			},
			//初始页面数据
			pageHandler(curPage) {
				//加载状态
				this.loading = true;
				//搜索状态
				this.curPage = curPage;
				let data = {
					keywords: this.searchStatus == 0 ? '' : this.searchName, //搜索用户名称
					page: this.curPage //页码
				};
				this.ajaxData(data)
			},
			onSearch(ev) {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(aa.test(this.searchName) == true) {
					alert("不能有非法字符")
				} else {
					this.loading = true;
					//从零开始
					this.total = 0;
					//搜索验证，搜索状态
					this.searchStatus = 1;
					let data = {
						keywords: this.searchStatus == 0 ? '' : this.searchName, //搜索用户名称
						page: this.searchStatus == 0 ? '' : this.curPage //页码
					};
					this.ajaxData(data)
				}
			},
			//编辑关联角色
			relevanceRole(userId) {
				this.roleList = "";
				this.noroleList = "";
				this.userId = userId;
				let data = {
					id: userId //用户id
				};
				this.axios.post("/roleContoller/listByCondition", data)
					.then((res) => {
						this.relevance = true;
						if(res.data.data.belong.length != 0) {
							this.roleList = res.data.data.belong;
						}
						this.noroleList = res.data.data.nobelong;
					}).catch((error) => {
						console.log(error);
					})
			},
			//编辑角色保存
			relevanceSAVE() {
				//激活保存状态
				this.loading2 = true;
				let roleId = [];
				this.$refs.roleType.forEach(function(val, key) {
					if(val.checked == true) {
						roleId.push(val.value)
					}
				});
				let pid = roleId.join(",");
				let data = {
					id: this.userId, //用户id
					pids: pid //关联各角色id
				};
				this.axios({
						method: "post",
						url: "/roleContoller/edit",
						data: data,
						traditional: true
					})
					.then((res) => {
						this.loading2 = false;
						if(res.data.status == "SUCCESS") {
							this.relevance = false;
							this.$message({
								message: "恭喜你，保存成功",
								type: "success"
							});
						}else{
							this.$message.error("保存失败");
						}
					}).catch((error) => {
						console.log(error);
						this.loading2 = false
					})
			},
			//编辑角色取消
			relevanceOFF() {
				this.relevance = false;
			},
			//查看用户详情信息
			lookOver(id) {
				let data = {
					userId: id
				};
				this.axios.post("/user/findUserById", data)
					.then((res) => {
						this.lookMesage = true;
						this.username = res.data.data.yonghu.userName;
						this.name = res.data.data.yonghu.name;
						this.sex = res.data.data.yonghu.gender;
						this.tel = res.data.data.yonghu.mobile;
						this.cj_time = res.data.data.yonghu.registerTime;
						this.xg_time = res.data.data.yonghu.lastUpdateTime;
						this.email = res.data.data.yonghu.email;
						this.role = res.data.data.jiaose
					}).catch((error) => {
						console.log(error);
					})
			}
		},
		watch: {
			searchName: function() {
				this.searchStatus = 0
			}
		}
	}
</script>
<style lang="less" scoped="scoped">
	.jp-userList {
		width: 766/32rem;
		margin: 20px auto;
		min-width: 766px;
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
					width: 100%;
					margin-left: 12/32rem;
					height: 28px;
					border: 1px solid #cccccc;
					padding-left: 12px;
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
			width: 766/32rem;
			min-width: 766px;
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
						width: 60/32rem;
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
		.relevance {
			.loadingRole {
				padding: 30px 0;
			}
			#roles {
				max-height: 300px;
				overflow: auto;
			}
			table {
				width: 100%;
				margin: 0 auto;
			}
			thead {
				color: #0190D4;
			}
			td {
				width: 216/32rem;
				min-width: 216px;
				height: 40px;
				line-height: 40px;
				text-align: center;
				border: 1px solid #cccccc;
			}
		}
		.lookMesage {
			.item {
				height: 50px;
				color: #666666;
				font-size: 14px;
				.item-name {
					width: 70/32rem;
					min-width: 70px;
					height: 50px;
					line-height: 50px;
					text-align: right;
					float: left;
				}
				.item-con {
					width: 248/32rem;
					min-width: 248px;
					margin-left: 16/32rem;
					padding-left: 16/32rem;
					height: 50px;
					line-height: 50px;
					border-bottom: 1px solid #cccccc;
					float: left;
				}
				.roles {
					height: auto;
					line-height: 50px;
					min-height: 50px;
					border: none;
				}
			}
		}
	}
</style>