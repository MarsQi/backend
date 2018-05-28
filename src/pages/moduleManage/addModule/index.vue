<template>
	<div id="qzf_addModule">
		<tips>
			<span slot='nav'>模块管理 > 新建模块</span>
		</tips>
		<div class="editModal" v-loading="loading11" element-loading-text="保存中...">
			<div class="title">
				<i class="iconfont icon-mokuaiguanli1"></i>添加模块列表
			</div>
			<el-form :model="form" :rules="rulesAdd" ref="form">
				<el-form-item label="模块名称" :label-width="formLabelWidth" prop="name">
					<el-input v-model="form.name" auto-complete="off" placeholder="请输入模块名称" @change='nameChange'></el-input>
				</el-form-item>
				<el-form-item label="模块路径" :label-width="formLabelWidth" prop="path">
					<el-input v-model="form.path" auto-complete="off" placeholder="请输入模块路径" @change='pathChange'></el-input>
				</el-form-item>
				<!--维度名称-->
				<el-form-item label="维度名称" :label-width="formLabelWidth" prop="filedName">
					<el-input v-model="form.filedName" auto-complete="off" placeholder="请输入维度名称" @change='filedNameChange'></el-input>
				</el-form-item>
				<!--单位-->
				<el-form-item label="维度单位" :label-width="formLabelWidth" prop="unit">
					<el-input v-model="form.unit" auto-complete="off" placeholder="请输入单位" @change='unitChange'></el-input>
				</el-form-item>
				<!--新增模块组件-->
				<el-form-item label="模块组件" :label-width="formLabelWidth" prop="zujian">
					<el-select v-model="form.zujian" filterable placeholder="请选择模块组件" clearable @change='zujianChange'>
						<el-option v-for="(val,index) in totalZujian" :key="val.value" :label="val.name" :value="val.value"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="上级模块" :label-width="formLabelWidth" prop="xiangmu">
					<el-select v-model="form.xiangmu" filterable placeholder="请选择上级模块(不选为顶级模块)" clearable @change='xiangmuChange'>
						<el-option v-for="(val,index) in totalModule" :key="val.id" :label="val.name" :value="val.id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="模块链接" :label-width="formLabelWidth" prop="meta">
					<el-select v-model="form.meta" filterable placeholder="请选择模块链接" clearable @change='metaChange'>
						<el-option v-for="(val,index) in moduleUrl" :key="val.meta" :label="val.name" :value="val.meta"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="模块编码" :label-width="formLabelWidth" prop="randum1">
					<el-input v-model="form.randum1" auto-complete="off" placeholder="请输入模块编码" @change='randum1Change'></el-input>
				</el-form-item>
				
				<el-form-item label="上传图标" :label-width="formLabelWidth">
					
					<div class="icon" @click="showList" tabindex="1">
						<i :class="form.iconAdd"></i>
					</div>
					<div class="el-form-item__error" v-show='isShow'>请选择图标</div>

				</el-form-item>
				
				<el-form-item label="模块描述" :label-width="formLabelWidth" prop="description">
					<el-input type="textarea" :rows="4" placeholder="请输入详细的模块描述" v-model="form.description" @change='descriptionChange'>
					</el-input>
				</el-form-item>
				<el-form-item label="备注" :label-width="formLabelWidth" prop="remark">
					<el-input type="textarea" :rows="4" placeholder="请输入备注" v-model="form.remark" @change='remarkChange'>
					</el-input>
				</el-form-item>
				<el-form-item label="上传图片" :label-width="formLabelWidth">
					
					<el-upload
						class="avatar-uploader"
						ref='upload'
						action="http://suneee.dcp.weilian.cn/sunEee-user/template/saveModule"
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
				
				<el-form-item class="btn" style="display: block;height: 74px;">
					<el-button class="save" type="primary" @click="save('form')">保存</el-button>
					<el-button class="off" @click="off('form')">取消</el-button>
				</el-form-item>
			</el-form>
		</div>
		<!--图标弹框层-->
		<el-dialog class="iconList" title="选择图标" :visible.sync="flag">
			<ul>
				<li v-for="(val,index) in iconList" @click="iconActive(val.class)">
					<i :class="val.class"></i>
				</li>
			</ul>
			<div style="clear: both;"></div>
		</el-dialog>
	</div>
</template>

<script>
	import tips from '@/components/tips.vue'
	import data from '@/assets/iconJson/iconfont.json'
	export default {
		name: 'addModule',
		data() {
			var validatePass1 = (rule, value, callback) => {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(value == ""){
					callback("模块名称不能为空")
				}else if(aa.test(value) == true) {
					callback("不能有非法字符")
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
					this.axios.get('/template/isExistModulePath?modulePath=/'+value).then((res) => {
						if(res.data.data.isExist == true) {
							callback("模块路径已存在")
						}else{
							callback()
						}
					})
				}
			};
			var validatePass2 = (rule, value, callback) => {
				var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
				if(value == ""){
					callback("模块编码不能为空")
				}else if(aa.test(value) == true) {
					callback("不能有非法字符")
				} else {
					this.axios.get('/template/isExistModule?code='+value).then((res) => {
						// console.log(res.data.data.isExist);
						if(res.data.data.isExist == true) {
							callback("模块编码已存在")
						}else{
							callback()
						}
					})
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
				form: {
					name: '',
					path: '',
					meta:'',
					randum1: '',
					zujian:'',
					xiangmu: '',
					description: '',
					remark: '',
					pid: 0,
					iconAdd: 'el-icon-plus avatar-uploader-icon',
					filedName:'',
					unit:''
				},
				formLabelWidth: '96px',
				totalZujian:[],
				totalModule: [],
				moduleUrl:[],
				rulesAdd: {
					name: [{
						validator: validatePass1,
						trigger: 'blur'
					}, {
						max: 5,
						message: '长度在  5 个字符以内',
						trigger: 'blur'
					}],
					path:[
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
					filedName:[{
						validator: validatefiledName,
						trigger: 'blur'
					}],
					unit:[{
						validator: validateUnit,
						trigger: 'blur'
					}],
					zujian:[{
						required: true,
						message: '模块组件不能为空',
						trigger: 'blur'
					}],
					// meta:[{
					// 	required: true,
					// 	message: '模块链接不能为空',
					// 	trigger: 'blur'
					// }],
					randum1: [{
						validator: validatePass2,
						trigger: 'blur'
					}, {
						max: 5,
						message: '长度在  5 个字符以内',
						trigger: 'blur'
					}],
					// iconAdd: [{
					// 	validator: validatePass3,
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
				iconList: [],
				flag: false,
				loading11:false,
				isShow: false,
				disab:false,
				// isShangji:'请选择上级模块',
				// dialogImageUrl: '',
        		// dialogVisible: false,
				fileData:{},
				fileList:[],
				imageUrl: '',
				isUpload: 0,
				isUploadTishi:false
			}
		},
		computed: {
			aaa:function() {
				return this.form.xiangmu
			}
		},
		watch: {
			// aaa:function() {
			// 	if(this.aaa == '') {
			// 		this.rulesAdd.meta=[]
			// 		this.disab = true
			// 		this.isShangji= '请先选择上级模块'
					
			// 	}else {
			// 		this.rulesAdd.meta=[{
			// 			required: true,
			// 			message: '模块链接不能为空',
			// 			trigger: 'blur'
			// 		}]
			// 		this.disab = false
			// 		this.isShangji= '请选择模块链接'
			// 	}
			// }
		},
		mounted() {

			this.getIcon(),
			/*获取模块组件*/
			this.axios.get("/dictionary/getAllEnable",{
					params: {
						'code': '001'
					}
				})
			.then((response) => {
				this.totalZujian = response.data.data
			}).catch((error)=> {
				console.log(error);
			});
			/*获取上级模块*/
			this.axios.get("/template/getALlModuleNoPaginationAndEnable")
			.then((response) => {
				console.log(response.data.data)
				this.totalModule = response.data.data
			}).catch((error)=> {
				console.log(error);
			});
			/*获取模块链接*/
			this.axios.get("/template/getModuleDetailUrlList")
			.then((response) => {
				console.log(response.data.data)
				this.moduleUrl = response.data.data
			}).catch((error)=> {
				console.log(error);
			});
			// if(this.aaa == '') {
			// 	this.rulesAdd.meta=[]
			// 	this.disab = true
			// }
		},
		methods: {
			nameChange() {
				this.fileData.name = this.form.name
			},
			pathChange() {
				this.fileData.path = '/'+this.form.path
			},
			filedNameChange() {
				this.fileData.filedName = this.form.filedName
			},
			unitChange() {
				this.fileData.unit = this.form.unit
			},
			zujianChange() {
				this.fileData.component = this.form.zujian
			},
			xiangmuChange() {
				this.fileData.pid = this.form.xiangmu
			},
			metaChange() {
				this.fileData.meta = this.form.meta
			},
			randum1Change() {
				this.fileData.code = this.form.randum1
			},
			descriptionChange() {
				this.fileData.description = this.form.description
			},
			remarkChange() {
				this.fileData.remark = this.form.remark
			},
			//获取全部图标
			getIcon() {
				this.iconList = data.data;
				console.log(this.iconList)
			},
			handleRemove(file, fileList) {
				this.isUpload = 0
				this.isUploadTishi=true
				console.log(file, fileList);
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
				this.iconAdd = 'el-icon-plus avatar-uploader-icon';
				//调到列表页
				this.$router.push("/navigator/moduleList");
				this.$message({
					message: "恭喜你，保存成功",
					type: "success"
				});
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
				console.log(file,5678)
				this.isUpload = 1
				this.isUploadTishi=false
				this.$nextTick(function () {
					var aa = document.getElementsByClassName('el-upload--picture-card')[0]
					if(aa==undefined) {

					} else {
						console.log(aa,12345)
						aa.style.display="none"
					}
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
			//保存
			save(formName) {
				this.$refs[formName].validate((valid) => {
					if(valid) {
						if(this.form.iconAdd == 'el-icon-plus avatar-uploader-icon') {
							this.isShow=true;
							return false;
						}
						if(this.isUpload==0) {
							this.isUploadTishi=true
							return false;
						}
						/*this.$refs[formName].resetFields();*/
						this.loading11 = true
						this.$refs.upload.submit();
						
						// let data111 = {
						// 	name: this.form.name,
						// 	path: '/'+this.form.path,
						// 	meta: this.form.meta,
						// 	code: this.form.randum1,
						// 	pid: this.form.xiangmu,
						// 	component: this.form.zujian,
						// 	description: this.form.description,
						// 	remark: this.form.remark,
						// 	icon: this.form.iconAdd == 'el-icon-plus avatar-uploader-icon' ? '' : this.form.iconAdd,
						// 	unit:this.form.unit,
						// 	filedName:this.form.filedName,
						// }
						// console.log(data)
						// this.axios.post("/template/saveModule",data111)
						// 	.then((response) => {
						// 		console.log(response)
						// 		// this.$refs[formName].resetFields();
                        //         this.iconAdd = 'el-icon-plus avatar-uploader-icon';
                        //         //调到列表页
						// 		this.$router.push("/navigator/moduleList");
						// 		this.$message({
				        //           message: "恭喜你，保存成功",
				        //           type: "success"
				        //         });
						// 	}).catch((error)=> {
						// 		console.log(error);
						// 		this.loading11 = false;
						// 		this.$message.error("保存失败");
						// 	});

					} else {
						console.log('error submit!!');
						return false;
					}
				});
			},
			//取消
			off(formName) {
				this.$refs[formName].resetFields();
				this.form.iconAdd = 'el-icon-plus avatar-uploader-icon'
			},
			iconActive(icon) {
				this.form.iconAdd = icon;
				this.flag = !this.flag;
				this.fileData.icon = this.form.iconAdd == 'el-icon-plus avatar-uploader-icon' ? '' : this.form.iconAdd
			},
			showList() {
				this.flag = !this.flag
				this.isShow = false
			}
		},
		components: {
			tips
		}
	}
</script>

<style lang="less">
	#qzf_addModule {
		width: 764/32rem;
		min-width:764px;
		height: 100%;
		margin: 0 auto;
		box-sizing: border-box;
		margin-top: 18px;
		background-color: #f5f5fa;
		.editModal {
			margin-top: 22px;
			margin-bottom: 19px;
			background-color: #fff;
			.title {
				height: 40px;
				line-height: 40px;
				background-color: #abc2d7;
				margin-bottom: 30px;
				padding-left: 20px;
				color: #FBFCFD;
				font-size: 16px;
				i{
					margin-right: 8px;
					color: #fff;
				}
			}
			.el-form-item {
				margin-bottom: 30px;
				padding-left: 42/32rem;
				// padding-right: 73/32rem;
				position: relative;
				&:last-child {
					margin-bottom: 0px;
				}

				.icon {
					margin-left: 32/32rem;
					width: 80px;
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
			.el-form-item__label {
				text-align: right;
				margin-right: 30/32rem;
			}
			.el-form-item__content {
				// margin-left: 136px !important;
				.el-input {
					   width: 17.1875rem;
				}
				.el-select {
					width: 17.1875rem;
				}
				.el-textarea {
					width: 17.1875rem;
				}
				.el-form-item__error {
					margin-left: 30/32rem;
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
				border-color: #20a0ff;
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
			.btn {
				margin-bottom: 30px;
				height: 32px;
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
		.el-upload-list--picture-card .el-upload-list__item {
			width: 80px;
			height: 80px;
		}
	}
</style>