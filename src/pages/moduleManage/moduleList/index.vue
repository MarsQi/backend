<template>
	<div id="qzf_moduleList">
		<tips>
			<span slot='nav'>模块管理 > 模块列表</span>
		</tips>
		<div class="search">
			<span>模块编码 : </span>
			<el-input v-model="queryCode" placeholder="请输入"></el-input>
			<span>模块名称 : </span>
			<el-input v-model="queryName" placeholder="请输入"></el-input>
			<!-- 查询按钮 -->
			<button class="search-button" @click="onSearch">查询</button>
			<!-- 新建按钮 -->
			<router-link :to="{ path: '/navigator/addModule' }" tag="button" class='newly-button' type="danger">
				新建
			</router-link>
			<!--<button class="set-button" @click="onSet">设置</button>-->
		</div>
		<div class="tab" v-loading="loading" element-loading-text="拼命加载中">
			<tree-grid class='qzf_tree' :columns="columns" :tree-structure="true" :data-source="dataSource" @set='set' @editP='editP' @delP='delP'></tree-grid>
		</div>
		<!-- 分页 -->
		<div class="page">
			<rt-page ref="page" :cur="curPage" :total="total" @change="pageHandler" style="border:none;"></rt-page>
		</div>
		<!--编辑弹框层-->
		<el-dialog class="editModal" title="编辑" :visible.sync="editUSER">
			<el-form :model="form" :rules="rulesAdd" ref="form" v-loading="loading11" element-loading-text="保存中...">
				<el-form-item label="模块名称" :label-width="formLabelWidth" prop="name">
					<el-input v-model="form.name" auto-complete="off" placeholder="请输入名称"></el-input>
				</el-form-item>
				<el-form-item label="模块路径" :label-width="formLabelWidth" prop="extend">
					<el-input v-model="form.extend" auto-complete="off" placeholder="模块路径"></el-input>
				</el-form-item>
				<!--维度名称-->
				<el-form-item label="维度名称" :label-width="formLabelWidth" prop="filedName">
					<el-input v-model="form.filedName" auto-complete="off" placeholder="请输入维度名称"></el-input>
				</el-form-item>
				<!--单位-->
				<el-form-item label="维度单位" :label-width="formLabelWidth" prop="unit">
					<el-input v-model="form.unit" auto-complete="off" placeholder="请输入单位"></el-input>
				</el-form-item>
				<!--新增模块组件-->
				<el-form-item label="模块组件" :label-width="formLabelWidth" prop="zujian">
					<el-select v-model="form.zujian" filterable :placeholder="form.palhol0" clearable>
						<el-option v-for="(val,index) in totalZujian" :key="val.value" :label="val.name" :value="val.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="上级模块" :label-width="formLabelWidth" prop="xiangmu">
					<el-select v-model="form.xiangmu" filterable :placeholder="form.tishi" clearable>
						<el-option v-for="(val,index) in totalModule" :key="val.id" :label="val.name" :value="val.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="模块链接" :label-width="formLabelWidth" prop="link">
					<el-select v-model="form.link" filterable :placeholder="form.palhol" clearable>
						<el-option v-for="(val,index) in moduleUrl" :key="val.meta" :label="val.name" :value="val.meta"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="模块编码" :label-width="formLabelWidth" prop="randum1">
					<el-input v-model="form.randum1" auto-complete="off" placeholder="请输入" disabled></el-input>
				</el-form-item>
				
				<el-form-item label="上传图标" :label-width="formLabelWidth">
					<div class="icon" @click="showList">
						<i :class="form.iconAdd"></i>
					</div>
				</el-form-item>
				<el-form-item label="模块描述" :label-width="formLabelWidth" prop="description">
					<el-input type="textarea" :rows="4" placeholder="请输入详细的模块描述" v-model="form.description=='null'?'':form.description">
					</el-input>
				</el-form-item>
				<el-form-item label="备注" :label-width="formLabelWidth" prop="remark">
					<el-input type="textarea" :rows="4" placeholder="请输入备注" v-model="form.remark=='null'?'':form.remark">
					</el-input>
				</el-form-item>
				<el-form-item label="上传图片" :label-width="formLabelWidth">
					
					<el-upload
						class="avatar-uploader"
						ref='upload'
						action="http://suneee.dcp.weilian.cn/sunEee-user/template/updateModule"
						list-type="picture-card"
						:before-upload="beforeUpload"
						:auto-upload="false"
						:file-list="fileList"
						:on-change="onChange"
						:data="fileData"
						:on-success = "handlePictureSuccess"
						:on-error = "errFunction"
						:on-remove="handleRemove">
						<img v-if="imageUrl" :src="imageUrl" class="avatar">
						<i v-else class="el-icon-plus avatar-uploader-icon"></i>
					</el-upload>
					<div class="el-form-item__error" v-show='isUploadTishi'>请选择图片</div>

				</el-form-item>
				<el-form-item class="btn" style="display: block;">
					<el-button class="save" type="primary" @click="save('form')">保存</el-button>
					<el-button class="off" @click="off('form')">取消</el-button>
				</el-form-item>
			</el-form>
		</el-dialog>
		<!--图标弹框层-->
		<el-dialog class="iconList" title="选择图标" :visible.sync="flag">
			<ul>
				<li v-for="(val,index) in iconList" @click="iconActive(val.class)">
					<i :class="val.class"></i>
				</li>
			</ul>
			<div style="clear: both;"></div>
		</el-dialog>
		<!-- 设置弹层 -->
		<!-- <el-dialog class="setModal" title="设置" :visible.sync="setUSER">
			<tree-grida class='qzf_tree1' :columns="columns1" :tree-structure="true" :data-sourcea="dataSource1" @set='set'></tree-grida>
			<div class="butt">
				<el-button class="save" type="primary" @click='setSave()'>保存</el-button>
				<el-button class="off">取消</el-button>
			</div>
		</el-dialog> -->
	</div>
</template>
<script>
	import tips from '@/components/tips.vue'
	import TreeGrid from '@/components/treeTable/vue/TreeGrid.vue'
	// import TreeGrida from '@/components/treeTable1/vue/TreeGrida.vue'
	import rtPage from '@/components/pagination'
	import data from '@/assets/iconJson/iconfont.json'
	export default {
		name: 'moduleList',
		data() {
			var validatePass = (rule, value, callback) => {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(value == ""){
					callback("模块名称不能为空")
				}else if(aa.test(value) == true) {
					callback("不能有非法字符")
				} else {
					if(value == this.isName){
						callback()
					} else {
						this.axios.get('/template/isExistModuleName?moduleName='+value).then((res) => {
							// console.log(res.data.data.isExist);
							if(res.data.data.isExist == true) {
								callback("模块名称已存在")
							}else{
								callback()
							}
						})
					}
				}
			};
			var validatePassRoute = (rule, value, callback) => {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				var bb = /^[a-zA-Z]+$/;
				if(value == ""){
					callback("模块路径不能为空")
				}else if(aa.test(value) == true) {
					callback("不能有非法字符")
				}else if(bb.test(value) == false) {
					callback("只能输入英文")
				}
				 else {
					 if(value == this.isExtend){
						callback()
					} else {
						this.axios.get('/template/isExistModulePath?modulePath=/'+value).then((res) => {
							if(res.data.data.isExist == true) {
								callback("模块路径已存在")
							}else{
								callback()
							}
						})
					}
				}
			};
			var validatefiledName = (rule, value, callback) => {
				var aa = /^[0-9a-zA-Z]+$/;
				if(value == ""){
					callback("维度名称不能为空")
				}else if(aa.test(value) == false) {
					callback("只能输入英文或者汉字")
				} else {
					callback()
				}
			};
			var validateUnit = (rule, value, callback) => {
				var aa = /^\d+$/;
				if(aa.test(value) == true) {
					callback("不能输入数字")
				} else {
					callback()
				}
			};
			return {
				columns: [{
						text: '模块名称',
						dataIndex: 'name'
					},
					{
						text: '模块编码',
						dataIndex: 'randum1'
					},
					{
						text: '创建人',
						dataIndex: 'operator'
					},
					{
						text: '创建时间',
						dataIndex: 'createTime'
					}
				],
				dataSource: [],
				columns1: [{
						text: '模块名称',
						dataIndex: 'name'
					}
				],
				dataSource1: [],
				queryCode: '',
				queryName: '',
				editUSER: false,
				setUSER:false,
				form: {
					name: '',
					extend: '',
					link:'',
					flag:'',
					randum1: '',
					xiangmu: '',
					zujian:'',
					tishi:'请选择上级模块(不选为顶级模块)',
					palhol:'请选择模块链接',
					palhol0:'请选择模块组件',
					description: '',
					remark: '',
					pid: 0,
					iconAdd: '',
					currentZuJian:'',
					filedName:'',
					unit:''
				},
				isName: '',
				isExtend: '',
				formLabelWidth: '120px',
				rulesAdd: {
					name: [{
						validator: validatePass,
						trigger: 'blur'
					}, {
						max: 5,
						message: '长度在  5 个字符以内',
						trigger: 'blur'
					}],
					extend:[
						{
							validator: validatePassRoute,
							trigger: 'blur'
						}, {
							min:5,
							max: 10,
							message: '长度在5到10个字符',
							trigger: 'blur'
						}
					],
					zujian:[{
						required: true,
						message: '模块组件不能为空',
						trigger: 'blur'
					}],
					filedName:[{
						validator: validatefiledName,
						trigger: 'blur'
					}],
					unit:[{
						validator: validateUnit,
						trigger: 'blur'
					}],
					// link:[{
					// 	required: true,
					// 	message: '模块链接不能为空',
					// 	trigger: 'blur'
					// }],
					description: [{
						required: false,
						message: '请输入项目描述',
						trigger: 'blur'
					}, {
						max: 30,
						message: '长度在  30 个字符以内',
						trigger: 'blur'
					}],
					remark: [{
						required: false,
						message: '请输入备注',
						trigger: 'blur'
					}, {
						max: 10,
						message: '长度在  10 个字符以内',
						trigger: 'blur'
					}]
				},
				status: 0,
				curPage: 1,
				total: 0,
				editSource: {},
				totalModule: [],
				totalZujian:[],
				moduleUrl:[],
				flag: false,
				iconList: [],
				code: '',
				loading:false,
				loading11:false,
				disab:false,
				// dialogVisible: false,
				// dialogImageUrl: '',
				fileData:{},
				fileList:[],
				imageUrl: '',
				isUpload: 0,
				isUploadTishi:false
			}
		},
		computed: {
			bbb:function() {
				return this.form.xiangmu
			}
		},
		mounted() {
			this.getIcon();
			console.log(this.bbb,111)
			// if(this.bbb == '') {
			// 	this.rulesAdd.link=[]
			// 	this.disab = true
			// 	this.form.palhol= '请选择上级模块'
			// }
			// this.axios.get("/template/getALlmoduleAsTree", {
			// 	params: {
			// 		'pageIndex': 1,
			// 		'size': 10
			// 	}
			// })
			// .then((response) => {
			// 	this.dataSource1 = response.data.data.list
				
			// }).catch((error)=> {
			// 	console.log(error);
			// });
		},
		methods: {
			//获取全部图标
			getIcon() {
				this.iconList = data.data;
				console.log(this.iconList)
			},

			handleRemove(file, fileList) {
				this.isUpload = 0
				this.isUploadTishi=true
				console.log(file, fileList,99999999999);
				this.imageUrl='';
				this.$nextTick(function () {
					var aa = document.getElementsByClassName('el-upload--picture-card')[0]
					aa.style.display="block"
				})
			},
			// handlePictureCardPreview(file) {
			// 	this.dialogImageUrl = file.url;
			// 	this.dialogVisible = true;
			// },
			handlePictureSuccess(response, file, fileList) {
				console.log(response,9898989)
				this.loading11 = false;
				this.editUSER = false;
				this.$message({
					message: "恭喜你，保存成功",
					type: "success"
				});
				this.pageHandler(this.curPage)
				// this.imageUrl = URL.createObjectURL(file.raw);
				// this.$nextTick(function () {
				// 	var aa = document.getElementsByClassName('el-upload--picture-card')[0]
				// 	aa.style.display="block"
				// })
			},
			errFunction(err, file, fileList) {
				console.log(error);
				this.loading11 = false;
				this.$message.error("保存失败");
			},
			onChange(file, fileList) {
				this.isUpload = 1
				this.isUploadTishi=false
				console.log(file,fileList,9234)
				this.$nextTick(function () {
					var aa = document.getElementsByClassName('el-upload--picture-card')[0]
					aa.style.display="none"
				})
				var testmsg = file.name.substring(file.name.lastIndexOf('.') + 1)
				const isJPEG = testmsg === 'jpeg';
				const isJPG = testmsg === 'jpg';
				const isPNG = testmsg === 'png';
				const isGIF = testmsg === 'gif';
				const isLt10M = file.size / 1024 / 1024 < 10;
				if (!isJPG&&!isPNG&&!isGIF&&!isJPEG) {
					this.$message.error('上传头像图片只能是 JPG/JPEG/PNG/GIF 格式!请移除');
					this.loading11 = false
					return false
				}
				if (!isLt10M) {
					this.$message.error('上传头像图片大小不能超过 10MB!请移除');
					return false
				}
			},
			beforeUpload (file) {
				console.log(file,456789)
				const isJPEG = file.type === 'image/jpeg';
				const isJPG = file.type === 'image/jpg';
				const isPNG = file.type === 'image/png';
				const isGIF = file.type === 'image/gif';
				const isLt10M = file.size / 1024 / 1024 < 10;
				if (!isJPG&&!isPNG&&!isGIF&&!isJPEG) {
					this.$message.error('上传头像图片只能是 JPG/JPEG/PNG/GIF 格式!请移除');
					this.loading11 = false
				}
				if (!isLt10M) {
				this.$message.error('上传头像图片大小不能超过 10MB!请移除');
				}
				return isJPG || isPNG || isGIF || isJPEG && isLt10M;
			},
			// 设置按钮
			// onSet() {
			// 	this.setUSER = true
			// 	console.log(this.dataSource1)

			// },
			//设置首页
			set(data) {
				console.log(data)
				var id = data.id
				this.axios.get("/template/setDefault", {
					params: {
						'id': id
					}
				})
				.then((response) => {
					console.log(response)
					if(response.data.status=="SUCCESS") {
						this.$message({
							message: "恭喜你，设置成功",
							type: "success"
						});
						this.pageHandler(this.curPage)
					}
				}).catch((error) => {
					console.log(error);
				});
			},
			/*编辑接口*/
			editP(data) {
				this.isUpload=0
				this.isUploadTishi=false
				this.editUSER = data.a
				var code = data.b.randum1;
				// console.log(code)
				//this.code = code
				this.axios.get("/template/getModulesByCode", {
					params: {
						'code': code
					}
				})
				.then((response) => {
					console.log(response,999)
					this.editSource = response.data.data.list[0]
					console.log(this.editSource)
					this.form.name = this.editSource.name
					this.isName = this.editSource.name
					this.form.extend = this.editSource.extend.slice(1,this.editSource.extend.length)
					this.isExtend = this.editSource.extend.slice(1,this.editSource.extend.length)
					this.form.flag = this.editSource.url
					this.form.randum1 = this.editSource.randum1
					this.form.description = this.editSource.description
					this.form.remark = this.editSource.remark
					this.form.iconAdd = this.editSource.icon
					this.form.pid = this.editSource.pid
					this.form.currentZuJian = this.editSource.dataDictionary.value
					this.form.filedName = this.editSource.filedName
					this.form.unit = this.editSource.unit
					this.imageUrl= "http://suneee.dcp.weilian.cn/"+this.editSource.image.replace(/,/,"/")
					
					// this.fileList=[{name: 'food.jpeg', url: this.imageUrl}]
					/*获取模块组件*/
					this.axios.get("/dictionary/getAllEnable",{
						params: {
							'code': '001'
						}
					})
					// console.log(this.fileList,34567)
					.then((response) => {
						this.totalZujian = response.data.data
						let that = this
						this.totalZujian.forEach(function(val, key) {
							if(that.form.currentZuJian === val.value) {
								that.form.zujian = val.value
								that.form.palhol0 = val.name
							}
						})
					}).catch((error)=> {
						console.log(error);
					});
					/*获取上级模块*/
					this.axios.get("/template/getALlModuleNoPaginationAndEnable")
						.then((response) => {
							// console.log(response.data.data)
							this.totalModule = response.data.data
							let that = this
							let kong =[]
							this.totalModule.forEach(function(val, key) {
								if (val.name != that.isName){
									kong.push(val)
								}
								if(that.form.pid == val.id) {
									that.form.xiangmu = val.id
									that.form.tishi = val.name
								}
							})
							this.totalModule = kong
						}).catch((error)=> {
							console.log(error);
						});
					/*获取模块链接*/
					this.axios.get("/template/getModuleDetailUrlList")
					.then((response) => {
						console.log(response.data.data)
						this.moduleUrl = response.data.data
							let that = this
							response.data.data.forEach(function(val, key) {
								if(that.form.flag === val.meta) {
									that.form.link = val.meta
									that.form.palhol = val.name
								}
							})
					}).catch((error)=> {
						console.log(error);
					});
					
				}).catch((error) =>{
					console.log(error);
				});
			},
			/*删除*/
			delP(data) {
				// console.log(data)
				this.axios.get("/template/deleteModule", {
					params: {
						'code': data.randum1
					}
				})
				.then((response) => {
					// console.log(response)
					this.pageHandler(this.curPage)
				}).catch((error)=> {
					console.log(error);
				});
			},
			//初始页面数据,分页
			pageHandler(curPage) {
				this.loading=true
				this.curPage = curPage
				this.axios.get("/template/getALlmoduleAsTree", {
					params: {
						'code': this.status == 0 ? '' : this.queryCode,
						'pageIndex': this.curPage,
						'size': 10,
						'name': this.status == 0 ? '' : this.queryName
					}
				})
				.then((response) => {
					this.loading=false
					console.log(response)
					this.dataSource = response.data.data.list
					// this.dataSource1 = response.data.data.list
					this.total = response.data.data.total
					console.log(this.dataSource,123)
				}).catch((error)=> {
					console.log(error);
				});
			},
			/*查询按钮*/
			onSearch() {
				this.status = 1
				this.total=0
				this.axios.get("/template/getALlmoduleAsTree", {
						params: {
							'code': this.status == 0 ? '' : this.queryCode,
							'pageIndex': this.curPage,
							'size': 10,
							'name': this.status == 0 ? '' : this.queryName
						}
					})
					.then((response) => {
						if(response.data.status == 'SUCCESS') {
							this.dataSource = response.data.data.list
							this.total = response.data.data.total
						}
					}).catch((error)=> {
						console.log(error);
					});
			},
			//保存
			save(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						if(this.isUploadTishi==true) {
							return false;
						}
						this.loading11 = true
						let data = {
							name: this.form.name,
							path : '/'+this.form.extend,
							meta: this.form.link,
							code: this.form.randum1,
							component: this.form.zujian,
							pid: this.form.xiangmu,
							description: this.form.description,
							remark: this.form.remark,
							icon: this.form.iconAdd,
							filedName:this.form.filedName,
							unit:this.form.unit
						}
						console.log(data)
						this.fileData=data
						console.log(this.fileData,8989898)
						if(this.isUpload==1) {
							var that = this
							setTimeout(function(){
								that.$refs.upload.submit();
							},1000);
						}else {
							this.axios.post("/template/updateModule", data)
							.then((response) => {
								this.loading11 = false;
								this.editUSER = false;
								this.$message({
				                  message: "恭喜你，保存成功",
				                  type: "success"
				                });
								this.pageHandler(this.curPage)
							}).catch((error)=> {
								console.log(error);
								this.loading11 = false;
								this.$message.error("保存失败");
							});
						}
					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			//取消
			off(formName) {
				this.editUSER = false;
				this.$refs[formName].resetFields();
			},
			//选择icon图标
			iconActive(icon) {
				this.form.iconAdd = icon;
				this.flag = !this.flag;
				console.log(icon)
			},
			//图标弹框
			showList() {
				this.flag = !this.flag
			}
		},
		/*检测输入框数据变化*/
		watch: {
			queryCode : function(){
				this.status = 0
			},
			queryName : function(){
				this.status = 0
			},
			// imageUrl: function() {
			// 	if(this.imageUrl) {
			// 		this.$nextTick(function () {
			// 			var aa = document.getElementsByClassName('el-upload--picture-card')[0]
			// 			aa.style.display="none"
			// 		})
			// 	}
			// }
			// bbb:function() {
			// 	if(this.bbb == '') {
			// 		this.rulesAdd.link=[]
			// 		this.disab = true
			// 		this.form.palhol= '请先选择上级模块'
			// 	}else {
			// 		this.rulesAdd.link=[{
			// 			required: true,
			// 			message: '模块链接不能为空',
			// 			trigger: 'blur'
			// 		}]
			// 		this.disab = false
			// 		this.form.palhol= '请选择模块链接'
			// 	}
			// }
		},
		components: {
			tips,
			TreeGrid,
			// TreeGrida,
			rtPage
		}
	}
</script>

<style lang="less">
	#qzf_moduleList {
		width: 764/32rem;
		min-width:764px;
		height: 100%;
		min-height: 690px;
		margin: 20px auto;
		box-sizing: border-box;
		margin-top: 18px;
		background-color: #f5f5fa;
		.search {
			width: 766/32rem;
			margin-top: 20px;
			background: #ffffff;
			height: 90px;
			padding-left: 20/32rem;
			font-size: 12px;
			color: #333333;
			span {
				display:inline-block;
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
			.set-button {
				margin-left: 30/32rem;
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
			margin-top: 24px;
			// .loadClass {
			// 	background-color: red;
			// }
			.qzf_tree{
				overflow-x: hidden;
				color: #959595;
				font-size: 12px;
				min-height: 440px;
				border: none;
				&::before {
					content: "";
					height: 0px;
				}
				&::after {
					content: "";
					height: 0px;
				}
				.el-table__header-wrapper{
				    // position: fixed;
				    .el-table__header{
				        thead{
				            div{
						        background: #abc2d7;
						        color: #ffffff;
				                // background: #dff0d8;
				                // color: #669265;
				                padding: 0;
				                height: 42px;
				                font-weight: 400;
				                line-height: 42px;
				                text-align: center;
				            }
				            th{
				                border-right: 1px solid #cfd0d0;
				                font-size: 0px;
				                &:last-child {
				                	border-right: none;
				                }
				                div{
				                    font-size: 12px;
				                }
				                &:hover {
				                	background-color: red;
				                }
				            }
				            tr{

				            }
				        }
				        colgroup{
				            col:nth-child(1){
				            width: 40/32rem!important;
				            }
				            col:nth-child(2){
				                width: 140/32rem!important;
				            }
				            col:nth-child(3){
				                width: 100/32rem!important;
				            }
				            col:nth-child(4){
				                width: 105/32rem!important;
				            }
				            col:nth-child(5){
				                width: 155/32rem!important;
				            }
				            col:nth-child(6){
				                width: 195/32rem!important;
				            }
				        }
				    }
				}
				.el-table__body-wrapper{
				    // overflow-x: hidden;
				    // margin-top: 40px;
				    .el-table__body{
				        tbody{
				            tr{                 
				                td{
				                    .cell{
				                        padding: 0;
				                        line-height: 50px;
				                        height: 50px;
				                        text-align: center;
				                        .button {
				                            display: inline-block;
				                        }
				                        // button{
				                        //     color: #7f7f7f;
				                        //     font-size: 12px;
				                        //     background: none;
				                        //     border: none;
				                        // }
				                    }
				                    &:nth-child(2){
					                    width: 120/32rem!important;
					                    .cell{
					                        text-align: left;
					                        padding-left: 10px;
					                        .button {
					                        	display: inline-block;
					                        	width: 18px;
					                        	height: 14px;
					                        }
					                        b {
					                        	vertical-align:middle;
					                        }
					                    }
					                }
					                &:last-child {
					                	border-right: none;
					                    .cell{
					                        button:first-child{
												
					                        }
					                    }
					                }
				                }
				            }
				        }
				        colgroup{
				            col:nth-child(1){
				            width: 40/32rem!important;
				            }
				            col:nth-child(2){
				                width: 140/32rem!important;
				            }
				            col:nth-child(3){
				                width: 100/32rem!important;
				            }
				            col:nth-child(4){
				                width: 105/32rem!important;
				            }
				            col:nth-child(5){
				                width: 155/32rem!important;
				            }
				            col:nth-child(6){
				                width: 195/32rem!important;
				            }
				        }
				    }
				    .el-table__empty-block {
				    	height: 430px;
				    	background: url('./no-data.png') no-repeat center 70px;
				    	background-size: 150px;
				    	.el-table__empty-text {
				    		font-size: 16px;
				    		color: #666;
				    	}
				    }
				}
			}
		}
		.page {
			background-color: #fff;
			text-align: center;
			padding-bottom: 20px;
		}
		.editModal {
			.el-form {
				width: 100%;
				height: 100%;
			}
			.el-dialog--small {
				width: 750/32rem;
			}
			.el-form-item {
				margin-bottom: 30px;
			}
			.el-form-item__label {
				padding-right: 38/32rem;
			}
			.el-form-item__content {
				.el-select {
					width: 100%;
				}
				.icon {
					width: 80px;
					height: 80px;
					border: 1px dashed #bfcbd9;
					border-radius: 6px;
					cursor: pointer;
					i {
						width: 80px;
						height: 80px;
						display: block;
						font-size: 28px;
						line-height: 80px;
						text-align: center;
						color: #8c939d;
					}
				}
				.icon:hover {
					border-color: #8391a5;
				}
			}
			
		}
		.setModal {
			.el-dialog--small {
				width: 750/32rem;
				.el-dialog__body {
					width: 650/32rem;
				}
			}
			.qzf_tree1{
				color: #959595;
				font-size: 12px;
				height: 440px;
				overflow: auto;
				overflow-x: hidden;
				border: none;
				margin-left: 72px;
				&::before {
					content: "";
					height: 0px;
				}
				&::after {
					content: "";
					height: 0px;
				}
				.el-table__header-wrapper{
				    // position: fixed;
				    .el-table__header{
				        thead{
				            div{
						        background: rgb(223,240,216);
						        color: rgb(75,128,75);
				                // background: #dff0d8;
				                // color: #669265;
				                padding: 0;
				                height: 42px;
				                font-weight: 400;
				                line-height: 42px;
				                text-align: center;
				            }
				            th{
								border-right: 1px solid #cfd0d0;
								border-left: 1px solid #cfd0d0;
				                font-size: 0px;
				                &:last-child {
				                	border-right: none;
				                }
				                div{
				                    font-size: 12px;
				                }
				                &:hover {
				                	background-color: red;
				                }
				            }
				            tr{

				            }
				        }
				        colgroup{
				            col:nth-child(1){
				            width: 40/32rem!important;
				            }
				            col:nth-child(2){
				                width: 240/32rem!important;
				            }
				            col:nth-child(3){
				                width: 120/32rem!important;
				            }
				            col:nth-child(4){
				                width: 150/32rem!important;
				            }
				        }
				    }
				}
				.el-table__body-wrapper{
				    // overflow-x: hidden;
				    // margin-top: 40px;
				    .el-table__body{
				        tbody{
				            tr{
								    border-left: 1px solid #cfd0d0;             
				                td{
				                    .cell{
				                        padding: 0;
				                        line-height: 50px;
				                        height: 50px;
				                        text-align: center;
				                        .button {
				                            display: inline-block;
				                        }
				                        // button{
				                        //     color: #7f7f7f;
				                        //     font-size: 12px;
				                        //     background: none;
				                        //     border: none;
				                        // }
				                    }
				                    &:nth-child(2){
					                    width: 120/32rem!important;
					                    .cell{
					                        text-align: left;
					                        padding-left: 10px;
					                        .button {
					                        	display: inline-block;
					                        	width: 18px;
					                        	height: 14px;
					                        }
					                        b {
					                        	vertical-align:middle;
					                        }
					                    }
					                }
					                &:last-child {
					                	border-right: none;
					                    .cell{
					                        button:first-child{
												
					                        }
					                    }
					                }
				                }
				            }
				        }
				        colgroup{
				            col:nth-child(1){
				            width: 40/32rem!important;
				            }
				            col:nth-child(2){
				                width: 240/32rem!important;
				            }
				            col:nth-child(3){
				                width: 120/32rem!important;
				            }
				            col:nth-child(4){
				                width: 150/32rem!important;
				            }
				        }
				    }
				    .el-table__empty-block {
				    	height: 430px;
				    	background: url('./no-data.png') no-repeat center 70px;
				    	background-size: 150px;
				    	.el-table__empty-text {
				    		font-size: 16px;
				    		color: #666;
				    	}
				    }
				}
			}
			.butt {
				width: 100%;
				height: 36px;
				margin-left: 72px;
				margin-top: 20px;
				.el-button {
					width: 3.75rem;
					min-width: 120px;
					height: 32px;
					margin: 0 0.625rem;
					border: none;
					color: #ffffff;
					border-radius: 3px;
					&.save {
						background: #0190D4;
						margin-left: 215px;
					}
					&.off {
						background: #FB2F2F;
					}
				}
			}
		}
		.iconList {
			.el-dialog--small {
				width: 721px;
				background: #FFF;
				ul {
					border-top: 1px solid #D9D9D9;
					border-left: 1px solid #D9D9D9;
					li {
						display: inline-block;
						width: 34px;
						height: 34px;
						line-height: 34px;
						text-align: center;
						border-right: 1px solid #d9d9d9;
						color: #8c939d;
						border-bottom: 1px solid #d9d9d9;
						cursor: pointer;
					}
				}
			}
		}
		.avatar-uploader .el-upload {
			border: 1px dashed #d9d9d9;
			border-radius: 6px;
			cursor: pointer;
			position: relative;
			overflow: hidden;
		}
		.avatar-uploader .el-upload:hover {
			border-color: #409EFF;
		}
		.avatar-uploader-icon {
			font-size: 28px;
			color: #8c939d;
			width: 80px;
			height: 80px;
			line-height: 80px;
			text-align: center;
		}
		.avatar {
			width: 80px;
			height: 80px;
			display: block;
		}
		.el-upload--picture-card {
			width: 80px;
			height: 80px;
			line-height: 80px;
		}
		.el-form-item__content {
			line-height:38px;
		}
		.el-upload-list--picture-card .el-upload-list__item {
			width: 80px;
			height: 80px;
		}
	}
</style>