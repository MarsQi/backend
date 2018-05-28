<template>
    <div class="jp-menuList">
        <!--条件搜索-->
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
                    <div class="item-con">所属项目：</div>
                    <div class="item-ipt">
                        <el-select v-model="projectID" filterable placeholder="请选择所属项目">
                            <el-option v-for="(val,index) in projectList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                        </el-select>
                    </div>
                </div>
                <div class="item">
                    <button class="search" @click="onSearch">查询</button>
                    <button class="add" @click="dialogAdd = true">新建</button>
                </div>
            </div>
        </div>
        <!--权限菜单列表数据-->
        <div class="data" v-loading="loading" element-loading-text="拼命加载中">
            <table>
                <thead>
                    <tr>
                        <td>序号</td>
                        <td>名称</td>
                        <td>所属项目</td>
                        <td>状态</td>
                        <td>操作</td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item,index) in list" :key="index">
                        <td>{{(curPage-1)*10 + index + 1}}</td>
                        <td v-html="item.name"></td>
                        <td v-html="item.sysItemList.name"></td>
                        <td>{{item.status == 1 ? '可用' : '不可用'}}</td>
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
        <!--新建弹框层-->
        <el-dialog class="xinjian" title="新建" :visible.sync="dialogAdd">
            <el-form v-loading="loadingNew" :model="newBuild" :rules="rulesAdd" ref="newBuild">
                <el-form-item label="所属项目" :label-width="formLabelWidth" prop="projectID">
                    <el-select v-model="newBuild.projectID" placeholder="请选择所属项目" @change="selNewProject">
                        <el-option v-for="(val,index) in projectList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="名称" :label-width="formLabelWidth" prop="moduleID">
					<el-select v-model="newBuild.moduleID" placeholder="请选择名称">
                        <el-option v-for="(val,index) in nameList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="父级菜单" :label-width="formLabelWidth" prop="parentMenuID">
                    <el-select v-model="newBuild.parentMenuID" placeholder="请选择菜单">
                        <el-option v-for="(val,index) in parentMenuLists" :key="val.id" :label="val.name" :value="val.id"></el-option>
                    </el-select>
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
        <el-dialog class="xinjian" title="编辑" :visible.sync="dialogEdit" :before-close="handleClose">
            <el-form v-loading="loadingEdit" :model="editDialog" :rules="rulesEdit" ref="editDialog">
                <el-form-item label="所属项目" :label-width="formLabelWidth" prop="projectID">
                    <el-select v-model="editDialog.projectID" filterable :placeholder="editDialog.projectName" @change="selEditProject">
                        <el-option v-for="(val,index) in projectList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="名称" :label-width="formLabelWidth" prop="moduleID">
                    <el-select v-model="editDialog.moduleID" :placeholder="editDialog.moduleName">
                        <el-option v-for="(val,index) in editNameList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="父级菜单" :label-width="formLabelWidth">
                    <el-select v-model="editDialog.parentMenuID" filterable :placeholder="editDialog.parentMenuName">
                        <el-option v-for="(val,index) in parentMenuList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" :label-width="formLabelWidth" prop="radio">
                    <el-radio-group v-model="editDialog.radio" @change="selRadio">
                        <el-radio :label="1">可用</el-radio>
                        <el-radio :label="0">不可用</el-radio>
                    </el-radio-group>
                    <p v-if="radioFlag" v-html="radioCon"></p>
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
            //新建名称排重验证
            var patternNameNew = (rule, value, callback) => {
                if(value == "") {
                    callback("菜单名称不能为空")
                } else {
                    let data = {
                        moduleId: this.newBuild.moduleID,
                        itemId: this.newBuild.projectID
                    }
                    this.axios.post("/menu/selectMenuByName", data)
                        .then((res) => {
                            if(res.data.data) {
                                callback()
                            } else {
                                callback("此项目下的菜单名称已存在")
                            }
                        }).catch((error) => {
                            console.log(error);
                        })
                }
            };
            //新建所属项目验证
            var patternProjectIDNew = (rule, value, callback) => {
                if(value == "") {
                    callback("请选择所属项目")
                } else {
                    callback()
                }
            };
            //编辑名称排重验证
            var patternNameEdit = (rule, value, callback) => {
                if(value == "") {
                    callback("菜单名称不能为空")
                } else {
                    if(this.editDialog.moduleID == this.editName && this.editDialog.projectID == this.editID) {
                        callback();
                    } else {
                        let data = {
                            moduleId: this.editDialog.moduleID,
                            itemId: this.editDialog.projectID
                        };
                        this.axios.post("/menu/selectMenuByName", data)
                            .then((res) => {
                                if(res.data.data) {
                                    callback()
                                } else {
                                    callback("此项目下的菜单名称已存在")
                                }
                            }).catch((error) => {
                                console.log(error);
                            })
                    }
                }
            };
            //编辑所属项目验证
            var patternProjectIDEdit = (rule, value, callback) => {
                if(value == "" || value == null) {
                    callback("请选择所属项目")
                } else {
                    callback()
                }
            };
            return {
                //级联菜单配置键名
                props: {
                    value: 'id',
                    label: 'name',
                    children: 'children'
                },
                //新建,编辑保存状态
                loadingNew: false,
                loadingEdit: false,
                //暂无数据提示
                flag: false,
                //加载状态
                loading: false,
                /*搜索名称，项目id及其搜索状态*/
                name: '',
                projectID: '',
                searchStatus: 0,
                /*编辑当前菜单名称id*/
                menuID: '',
                /*所属项目下的名称列表，所有项目列表，编辑父级菜单列表,新建父级菜单列表*/
                nameList: [],
                editNameList: [],
                projectList: [],
                parentMenuList: [],
                parentMenuLists: [],
                /*编辑，添加弹框显示隐藏*/
                dialogAdd: false,
                dialogEdit: false,
                /*初始化页面条数，页码，数据列表*/
                total: 0,
                curPage: 1,
                list: "",
                /*新建数据*/
                newBuild: {
                    name: '',
                    moduleName: '',
                    moduleID: '',
                    projectID: '',
                    parentMenuID: '',
                    radio: '1',
                    memo: ''
                },
                /*编辑数据*/
                editDialog: {
                    name: '',
                    moduleID: '',
                    moduleName: '',
                    projectName: '',
                    projectID: '',
                    parentMenuName: '',
                    parentMenuID: '',
                    radio: '',
                    memo: ''
                },
                formLabelWidth: '100px',
                //编辑保存用户当前信息，进行验证
                editName: '',
                editNameID: '',
                editID: '',
                newEditID: '',
                /*新建正则*/
                rulesAdd: {
                    projectID: [{
                        validator: patternProjectIDNew,
                        required: true,
                    }],
                    moduleID: [{
                        type: 'array',
                        validator: patternNameNew,
                        required: true,
                    }],
                    memo: [{
                        max: 30,
                        message: '长度在  30个字符以内',
                        trigger: 'blur'
                    }]
                },
                /*编辑正则*/
                rulesEdit: {
                    projectID: [{
                        validator: patternProjectIDEdit,
                    }],
                    moduleID: [{
                        type: 'array',
                        validator: patternNameEdit,
                        required: true
                    }],
                    memo: [{
                        max: 30,
                        message: '长度在  30个字符以内',
                        trigger: 'blur'
                    }]
                },
                radio: '',
                radioFlag: false,
                radioCon: ''
            }
        },
        components: {
            rtPage,
            noData
        },
        mounted() {
            this.getProject();
            this.getParentMenu();
        },
        methods: {
            //新建关闭
            handleClose(done) {
                done();
                this.editEmpty();
            },
            handleChange(value) {},
            //加载数据
            ajaxData(data) {
                this.axios.post("/menu/getMuneDetailsByLike", data)
                    .then((res) => {
                        this.loading = false
                        if(res.data.data == null) {
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
                    name: this.searchStatus == 0 ? '' : this.name, //搜索名称
                    itemId: this.searchStatus == 0 ? '' : this.projectID, //项目id
                    pageIndex: this.curPage, //当前页码
                    size: 10
                };
                this.ajaxData(data);
            },
            //搜索
            onSearch(ev) {
                //搜索字符验证，状态
                var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
                if(aa.test(this.name) == true) {
                    alert("不能有非法字符")
                } else {
                    this.loading = true;
                    //从零开始
                    this.total = 0;
                    this.searchStatus = 1;
                    let data = {
                        name: this.searchStatus == 0 ? '' : this.name, //名称
                        itemId: this.searchStatus == 0 ? '' : this.projectID, //项目id
                        pageIndex: this.searchStatus == 0 ? '' : this.curPage, //当前页码
                        size: 10
                    };
                    this.ajaxData(data)
                }
            },
            //所属项目
            getProject() {
                this.axios.post("/sysCMSController/selectAllSysItem",{enable:1})
                    .then((res) => {
                        this.projectList = res.data.data;
                    }).catch((error) => {
                        console.log(error);
                    })
            },
            //父级菜单
            getParentMenu() {
                this.axios.post("/menu/getMenuAll")
                    .then((res) => {
                        this.parentMenuLists = res.data.data;
                    }).catch((error) => {
                        console.log(error);
                    })
            },
            //新建：获取所属项目下的模块名称
            selNewProject(value) {
                if(value) {
                    //获取项目下的名称
                    let data = {
                        itemId: value
                    }
                    this.axios.post("/menu/selectModuleByItemId", data)
                        .then((res) => {
                            if(res.data.data.length == 0){
                                this.nameList = [];
                            }else{
                                this.nameList = res.data.data;
                            }
                        }).catch((error) => {
                            console.log(error);
                        })
                    this.newBuild.moduleID = '';
                }
            },
            //新建保存
            addSAVE(formName) {
                this.$refs[formName].validate((valid) => {
                    if(valid) {
                        this.loadingNew = true;
                        //传送参数
                        let data = {
                            moduleId: this.newBuild.moduleID, //新建名称
                            itemId: this.newBuild.projectID, //项目id
                            parentId: this.newBuild.parentMenuID, //父级菜单id
                            memo: this.newBuild.memo, //描述
                            status: this.newBuild.radio //状态
                        }
                        this.axios.post("/menu/saveMenu", data)
                            .then((res) => {
                                this.loadingNew = false;
                                if(res.data) {
                                    this.name = "";
                                    this.projectID = "";
                                    //从零开始
                                    this.total = 0;
                                    this.pageHandler(1);
                                    this.getParentMenu();
                                    this.dialogAdd = false;
                                    //清空
                                    this.$refs[formName].resetFields();
                                    this.parentMenuID = '';
                                    this.parentMenuName = '';
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
                this.$refs[formName].resetFields();
                this.nameList = []
            },
            //编辑：获取所属项目下的模块名称
            selEditProject(value) {
                this.editDialog.moduleName = "";
                this.editDialog.moduleID = '';
                if(value == null || value == ''){
                }else{
                    //获取项目下的名称
                    let data = {
                        itemId: value
                    };
                    this.axios.post("/menu/selectModuleByItemId", data)
                        .then((res) => {
                            this.loadingEdit = false;
                            this.radioFlag = false;
                    		this.radioCon = "";
                            if(res.data.data.length == 0){
                                this.editNameList = [];
                            }else{
                                this.editNameList = res.data.data;
                                let that = this;
                                this.editNameList.forEach(function(val,key){
                                    if(val.id == that.editName){
                                        that.editDialog.moduleID = val.id; //名称id
                                        that.editDialog.moduleName = val.name; //名称
                                    }
                                });
                            }
                            this.editDialog.radio = this.radio;
                        }).catch((error) => {
                            console.log(error);
                        })
                    //解决第一次点击编辑文本框改变，发送请求，名称不回显问题
                    if(value == this.newEditID) {
                        this.newEditID = '';
                    } 
                    else {
                        this.editDialog.moduleName = "";
                        this.editDialog.moduleID = '';
                    }
                }
            },
            selRadio(value){
	            if(this.editDialog.moduleID == ""){
                    this.radioFlag = true;
                    this.radioCon = "请先选择模块名称";
                    this.editDialog.radio = 1;
                }else{
                    this.radioFlag = false;
                    this.radioCon = "";
                    if(value == 0){
                        this.axios.post("/menu/updateEnableById", {id: this.editDialog.moduleID})
                            .then((res) => {
                                if(res.data == false){
                                    this.editDialog.radio = 1;
                                }else{
                                    this.editDialog.radio = 0;
                                }
                            }).catch((error) => {
                                console.log(error);
                            })
                    }
                }
            },
            //编辑
            edit(id) {
                this.dialogEdit = true;
                this.loadingEdit = true;
                //获取点击的菜单id
                this.menuID = id;
                let data = {
                    id
                };
                this.axios.post("/menu/selectMenuById", data)
                    .then((res) => {
                        //编辑各字段回显值
                        this.editEcho(res,id);
                    }).catch((error) => {
                        console.log(error);
                        this.loadingEdit = false
                    });
            },
            //编辑保存
            editSAVE(formName) {
                this.$refs[formName].validate((valid) => {
                    if(valid) {
                        this.loadingEdit = true;
                        let data = {
                            id: this.menuID, //编辑当前菜单id
                            moduleId: this.editDialog.moduleID, //名称
                            itemId: this.editDialog.projectID, //项目id
                            parentId: this.editDialog.parentMenuID, //父级菜单id
                            memo: this.editDialog.memo, //描述
                            status: this.editDialog.radio //状态
                        }
                        this.axios.post("/menu/updateMenuById", data)
                            .then((res) => {
                            	this.radioFlag = false;
                    			this.radioCon = "";
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
            //删除
            del(id) {
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let data = {
                        id: id //当前菜单id
                    };
                    this.axios.post("/menu/delMenuById", data)
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
            //清空编辑数据
            editEmpty(){
            	this.radioFlag = false;
                this.radioCon = "";
                this.editNameList = [];
                this.menuID = ''; //菜单id
                this.editDialog.projectName = ''; //项目名称
                this.editDialog.projectID = ''; //项目id
                this.editID = ''; //存储项目id，进行排重判断验证
                this.newEditID = ''; //存储项目id，进行所属项目判断验证
                this.editDialog.moduleName = ''; //名称
                this.editDialog.moduleID = ''; //名称id
                this.editName = ''; //存储名称id
                this.editDialog.parentMenuName = ''; //菜单父name
                this.editDialog.parentMenuID = ''; //菜单父id
                this.editDialog.radio = 1; //状态
                this.editDialog.memo = ''; //描述
            },
            //编辑角色回显内容
            editEcho(res,id){
                this.menuID = res.data.id; //菜单id
                this.editDialog.projectName = res.data.sysItemList.name; //项目名称
                this.editDialog.projectID = res.data.sysItemList.id; //项目id
                this.editID = res.data.sysItemList.id; //存储项目id，进行排重判断验证
                this.newEditID = res.data.sysItemList.id; //存储项目id，进行所属项目判断验证
                this.editName = res.data.moduleDetail.id; //存储名称id
                this.editNameID = res.data.moduleDetail.name;
                this.editDialog.moduleID = res.data.moduleDetail.id; //名称id
                this.editDialog.moduleName = res.data.moduleDetail.name; //名称
                this.editDialog.parentMenuName = res.data.parentMenu.name; //菜单父name
                this.editDialog.parentMenuID = res.data.parentMenu.id; //菜单父id
                this.radio = res.data.status; //状态  先保存状态，当获取到名称值后再添加状态
                this.editDialog.memo = res.data.memo; //描述
                let data = {
                    menuId: id
                };
                this.axios.post("/menu/getMenuAll", data)
                    .then((res) => {
                        this.parentMenuList = res.data.data;
                    }).catch((error) => {
                        console.log(error);
                    })
            }
        },
        watch: {
            name: function() {
                this.searchStatus = 0
            }
        }
    }
</script>
<style lang="less" scoped="scoped">
    .jp-menuList {
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
                    width: auto;
                    float: left;
                    .item-con {
                        margin: 0 14px;
                        text-align: center;
                        float: left;
                        font-size: 14px;
                        color: #333;
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
                position: relative;
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
                    position: relative;
                    height: 510px;
                    tr {
                        height: 50px;
                        line-height: 50px;
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
                color: #ff4949;
                position: absolute;
                top: 32px;
                height: 20px;
                line-height: 20px;
            }
        }
    }
</style>
