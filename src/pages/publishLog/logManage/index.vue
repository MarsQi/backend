<template>
	<div id="qzf_logManage">
		<tips>
			<span slot='nav'>发布日志 > 日志管理</span>
		</tips>
		<!-- 查询 -->
		<div class="search">
			<span>操作类型 : </span>
			<el-input v-model="operateType" placeholder="请输入"></el-input>
			<span>操作业务 : </span>
			<el-input v-model="operateServ" placeholder="请输入"></el-input>
			<span>操作人 : </span>
			<el-input v-model="operatePer" placeholder="请输入"></el-input>
			<!-- 查询按钮 -->
			<button class="search-button" @click="onSubmit">查询</button>
		</div>
		<!-- table表格 -->
		<div class="tab" v-loading="loading" element-loading-text="拼命加载中">
			<div class='table'>
				<div class='thead'>
					<div class='tr'>
						<div class='sp'>序号</div>
						<div class='sp'>操作类型</div>
						<div class='sp'>操作业务</div>
						<div class='sp'>操作人</div>
						<div class='sp'>操作时间</div>
						<div class='sp'>操作</div>
					</div>
				</div>
				<div class='tbody'>
					<div class='tr' v-for="(item,index) in tableData">
						<div class='sp'>{{(curPage-1)*10 + index + 1}}</div>
						<div class='sp'>
							{{item.operationType}}
						</div>
						<div class='sp'>{{item.opertaionBusiness}}</div>
						<div class='sp'>{{item.operator}}</div>
						<div class='sp'>{{item.opertaionTime}}</div>
						<div class='sp'>
							<el-button type="text" class="edit-btn" size="small" @click='look(index)' style="margin:0">查看</el-button>
						</div>
					</div>
					<no-data v-if="flag"></no-data>
				</div>
			</div>
		</div>
		<!-- 分页 -->
		<div class="page">
			<rt-page ref="page" :cur="curPage" :total="total" @change="pageHandler"></rt-page>
		</div>
		<!-- 查看弹层 -->
		<div class="dia">
			<el-dialog title="查看" :visible.sync="dialogTableVisible">
				<div class="item">
					<div class="item-name">
						操作类型：
					</div>
					<div class="item-con">
						{{aaa.operationType}}
					</div>
				</div>
				<div class="item">
					<div class="item-name">
						操作业务：
					</div>
					<div class="item-con roles">
						{{aaa.opertaionBusiness}}
					</div>
				</div>
				<div class="item">
					<div class="item-name">
						操作时间：
					</div>
					<div class="item-con">
						{{aaa.opertaionTime}}
					</div>
				</div>
			</el-dialog>
		</div>
	</div>
</template>

<script>
	import noData from '@/components/noData.vue'
	import tips from '@/components/tips.vue'
	import rtPage from '@/components/pagination'
	import md5 from 'js-md5'
	import time from '@/filter/time'
	export default {
		name: 'logManage',
		data() {
			return {
				operateType: '',
				operateServ: '',
				operatePer: '',
				curPage: 1,
				total: 0,
				tableData: [],
				aaa: {},
				dialogTableVisible: false,
				status: 0,
				loading:false,
				flag:false
			}
		},
		mounted() {},
		methods: {
			//初始页面数据,分页
			pageHandler(curPage) {
				console.log(this.status);
				this.loading = true;
				this.curPage = curPage
				/*阔阔本地接口，服务器未更新*/
				this.axios.post("/log/getLogsByPagination", {
						"operationType": this.status == 0 ? '' : this.operateType,
						"opertaionBusiness": this.status == 0 ? '' : this.operateServ,
						"operator": this.status == 0 ? '' : this.operatePer,
						pageIndex: this.curPage,
						size: 10
					})
					.then((response) => {
						if(response.data.status == 'SUCCESS') {
							this.loading = false;
							console.log(response)
							this.tableData = response.data.data.list
							this.total = response.data.data.total
						}
					}).catch((error) => {
						console.log(error)
					})
			},
			/*查询*/
			onSubmit() {
				this.total=0;
				/*判断是否为查询过得状态*/
				this.status = 1
				/*阔阔本地接口，服务器未更新*/
				this.axios.post('/log/getLogsByPagination', {
						"pageIndex": this.curPage,
						"size": 10,
						"operationType": this.status == 0 ? '' : this.operateType,
						"opertaionBusiness": this.status == 0 ? '' : this.operateServ,
						"operator": this.status == 0 ? '' : this.operatePer
					})
					.then((response) => {
						if(response.data.status == 'SUCCESS') {
							if(response.data.data.list.length==0){
                                this.tableData=[]
								this.total=0
								this.flag =true
							}else{
								this.tableData = response.data.data.list
								this.total = response.data.data.total
								this.flag = false
							}
						}
					})
					.catch((error) => {
						console.log(error);
					});
			},
			/*查看*/
			look(index) {
				this.dialogTableVisible = true
				/*阔阔本地接口，服务器未更新*/
				this.axios.post('/log/getLogsByPagination', {
						"pageIndex": this.curPage,
						"size": 10,
						"operationType": this.status == 0 ? '' : this.operateType,
						"opertaionBusiness": this.status == 0 ? '' : this.operateServ,
						"operator": this.status == 0 ? '' : this.operatePer
					})
					.then((response) => {
						if(response.data.status == 'SUCCESS') {
							this.aaa = response.data.data.list[index]
						}
					})
					.catch((error) => {
						console.log(error);
					});
			}
		},
		/*检测输入框数据变化*/
		watch: {
			operateType : function(){
				this.status = 0
			},
			operateServ : function(){
				this.status = 0
			},
			operatePer : function(){
				this.status = 0
			}
		},
		components: {
			tips,
			rtPage,
			noData
		}
	}
</script>

<style lang="less">
	#qzf_logManage {
		width: 764/32rem;
		height: 100%;
		margin: 20px auto;
		box-sizing: border-box;
		margin-top: 18px;
		background-color: #f5f5fa;
		.title {
			padding-left: 20/32rem;
			width: 100%;
			height: 42px;
			line-height: 42px;
			background-color: #eef1f7;
			font-size: 14px;
		}
		.search {
			width: 766/32rem;
			margin-top: 20px;
			background: #ffffff;
			height: 90px;
			padding-left: 20/32rem;
			font-size: 12px;
			color: #333333;
			span {
				margin-left: 20/32rem;
				display: inline-block;
				line-height: 90px;
			}
			span:first-child {
				margin-left: 0;
			}
			.el-input {
				width: 120/32rem;
				margin-left: 14px;
				.el-input__inner {
					width: 100%;
					/*margin-left: 12/32rem;*/
					height: 28px;
					border: 1px solid #cccccc;
					padding-left: 12px;
				}
			}
			.search-button {
				margin-left: 48/32rem;
				width: 58/32rem;
				height: 38px;
				background: #0190d4;
				border-radius: 4px;
				border: none;
				color: #ffffff;
				cursor: pointer;
			}
		}
		.tab {
			height: 550px;
			background: #ffffff;
			margin-top: 30px;
			position: relative;
			.table {
				width: 100%;
				font-size: 12px;
				height: 550px;
				.tr {
					font-size: 0px;
				}
				.sp {
					display: inline-block;
					font-size: 12px;
					text-align: center;
					border-right: 1px solid #cfd0d0;
				}
				.sp:last-child {
					border-right: none;
				}
				.thead {
					height: 40px;
					background: #abc2d7;
					color: #ffffff;
					.sp {
						height: 40px;
						line-height: 40px;
					}
					.sp:nth-child(1) {
						width: 60/32rem;
						min-width: 62px;
					}
					.sp:nth-child(2) {
						width: 140/32rem;
						min-width: 140px;
					}
					.sp:nth-child(3) {
						width: 130/32rem;
						min-width: 130px;
					}
					.sp:nth-child(4) {
						width: 115/32rem;
						min-width: 115px;
					}
					.sp:nth-child(5) {
						width: 174/32rem;
						min-width: 174px;
					}
					.sp:nth-child(6) {
						width: 145/32rem;
						min-width: 145px;
					}
				}
				.tbody {
					.tr {
						height: 50px;
						overflow: hidden;
						&:hover {
							background: #EEF1F6;
						}
						.sp {
							height: 50px;
							line-height: 50px;
							/* 超出出现省略号 */
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							border-bottom: 1px solid #cccccc;
							color: #666666;
							.look-btn {
								color: #0190D4;
								margin-right: 20px;
							}
						}
						.sp:nth-child(1) {
							width: 60/32rem;
							min-width: 62px;
						}
						.sp:nth-child(2) {
							width: 140/32rem;
							min-width: 140px;
						}
						.sp:nth-child(3) {
							text-align: left;
							box-sizing: border-box;
							width: 130/32rem;
							min-width: 130px;
							padding-left: 20/32rem;
						}
						.sp:nth-child(4) {
							width: 115/32rem;
							min-width: 115px;
						}
						.sp:nth-child(5) {
							width: 174/32rem;
							min-width: 174px;
						}
						.sp:nth-child(6) {
							width: 145/32rem;
							min-width: 145px;
						}
					}
				}
			}
		}
		.page {
			background-color: #fff;
			text-align: center;
			padding-bottom: 20px;
			padding-top: 6px;
		}
		.dia {
			.el-dialog__wrapper {
				.el-dialog {
					width: 438/32rem;
					min-width: 438px;
					.el-dialog__body {
						padding: 0 52/32rem;
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
								// line-height: 30px;
								min-height: 50px;
							}
						}
					}
				}
			}
		}
	}
</style>