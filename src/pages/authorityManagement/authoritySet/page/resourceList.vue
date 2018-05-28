<template>
    <div class="jp-resourceList">
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
                    <div class="item-con">所属菜单：</div>
                    <div class="item-ipt">
                        <el-select v-model="resourceID" filterable placeholder="请选择所属菜单">
                            <el-option v-for="(val,index) in resourceList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                        </el-select>
                    </div>
                </div>
                <div class="item">
                    <button class="search" @click="onSearch">查询</button>
                    <button class="add" @click="dialogAdd = true">新建</button>
                </div>
            </div>
        </div>
        <!--菜单资源列表数据-->
        <div class="data" v-loading="loading" element-loading-text="拼命加载中">
            <table>
                <thead>
                    <tr>
                        <td>序号</td>
                        <td>名称</td>
                        <td>所属菜单</td>
                        <td>状态</td>
                        <td>操作</td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item,index) in list" :key="index">
                        <td>{{(curPage-1)*10 + index + 1}}</td>
                        <td v-html="item.name"></td>
                        <td v-html="item.menu.name"></td>
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
                <el-form-item label="名称" :label-width="formLabelWidth" placeholder="请输入权限名称" prop="name">
                    <el-input v-model.trim="newBuild.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="所属菜单" :label-width="formLabelWidth" prop="menuID">
                    <el-select v-model="newBuild.menuID" placeholder="请选择所属菜单">
                        <el-option v-for="(val,index) in resourceList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属功能" :label-width="formLabelWidth" prop="featureID">
                    <el-select v-model="newBuild.featureID" placeholder="请选择所属功能">
                        <el-option v-for="(val,index) in featureList" :key="val.id" :label="val.name" :value="val.id"></el-option>
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
        <el-dialog class="xinjian" title="编辑" :visible.sync="dialogEdit">
            <el-form v-loading="loadingEdit" :model="editDialog" :rules="rulesEdit" ref="editDialog">
                <el-form-item label="名称" :label-width="formLabelWidth" placeholder="请输入权限名称" prop="name">
                    <el-input v-model.trim="editDialog.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="所属菜单" :label-width="formLabelWidth" prop="menuID">
                    <el-select v-model="editDialog.menuID" :placeholder="editDialog.menuName">
                        <el-option v-for="(val,index) in resourceList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="所属功能" :label-width="formLabelWidth" prop="featureID">
                    <el-select v-model="editDialog.featureID" :placeholder="editDialog.featureName">
                        <el-option v-for="(val,index) in featureList" :key="val.id" :label="val.name" :value="val.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" :label-width="formLabelWidth">
                    <el-radio class="radio" v-model="editDialog.radio" label="1">可用</el-radio>
                    <el-radio class="radio" v-model="editDialog.radio" label="0">不可用</el-radio>
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
                    callback("权限名称不能为空")
                } else if(aa.test(value) == true) {
                    callback("不能有非法字符")
                } else {
                    this.axios.post("/permissionPackage/selectPackageByName", {
                            name: value
                        })
                        .then((res) => {
                            if(res.data.data) {
                                callback()
                            } else {
                                callback("权限名称已存在")
                            }
                        }).catch((error) => {
                            console.log(error);
                        })
                }
            };
            var moduleNew = (rule, value, callback) => {
                if (value == '' || value == null){
                    callback("请选择所属功能")
                } else {
                    let data = {
                        params: {
                            fieldSort: value,
                            menuId: this.newBuild.menuID
                        }
                    };
                    this.axios.get("/permissionPackage/isNewPackage", data)
                        .then((res) => {
                            if(res.data.info == 'success') {
                                callback();
                            } else {
                                callback("此模块已存在")
                            }
                        }).catch((error) => {
                            console.log(error);
                        })
                }
            };
            var menuNew = (rule, value, callback) => {
                if (value == '' || value == null){
                    callback("请选择所属菜单")
                } else{
					callback();
				}
            };
            var patternNameEdit = (rule, value, callback) => {
                var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
                if(value == "") {
                    callback("权限名称不能为空")
                } else if(aa.test(value) == true) {
                    callback("不能有非法字符")
                } else {
                    if(value == this.editName) {
                        callback()
                    } else {
                        this.axios.get("/permissionPackage/isNewPackage", data)
                            .then((res) => {
                                if(res.data.info == 'success') {
                                    callback()
                                } else {
                                    callback("此模块已存在")
                                }
                            }).catch((error) => {
                                console.log(error);
                            })
                    }
                }
            };
            var moduleEdit = (rule, value, callback) => {
                if (value == '' || value == null){
                    callback("请选择所属功能")
                } else {
                    if(value == this.featureID && this.editDialog.menuID == this.menuID){
                        callback();
                    } else{
                        if(this.editDialog.menuID == ''){
                            callback()
                        }else{
                            let data = {
                                params: {
                                    fieldSort: value,
                                    menuId: this.editDialog.menuID
                                }
                            };
                            this.axios.get("/permissionPackage/isNewPackage", data)
                                .then((res) => {
                                    if(res.data.info == 'success') {
                                        callback()
                                    } else {
                                        callback("此功能已存在")
                                    }
                                }).catch((error) => {
                                    console.log(error);
                                })
                        }
                        
                    }
                }
            };
            var menuEdit = (rule, value, callback) => {
                if (value == '' || value == null){
                    callback("请选择所属菜单")
                } else {
                    if(this.editDialog.featureID == this.featureID && value == this.menuID){
                        callback();
                    } else{
                        callback()
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
                /*搜索名称，菜单id及其搜索状态*/
                name: '',
                resourceID: '',
                searchStatus: 0,
                /*所有菜单列表*/
                resourceList: [],
                /*编辑当前项目名称id*/
                packageID: '',
                /*初始化页面条数，页码，数据列表*/
                total: 0,
                curPage: 1,
                list: "",
                /*编辑，添加弹框显示隐藏*/
                dialogAdd: false,
                dialogEdit: false,
                /*新建数据*/
                newBuild: {
                    name: '',
                    menuID: '',
                    featureID: '',
                    radio: "1",
                    memo: '',
                    quanxain: ''
                },
                /*编辑数据*/
                editDialog: {
                    name: '',
                    menuName: '',
                    menuID: '',
                    featureID: '',
                    featureName: '',
                    radio: "1",
                    memo: '',
                    quanxain: ''
                },
                menuID: '',
                featureID: '',
                formLabelWidth: '100px',
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
                    menuID: [{
                        validator: menuNew,
						trigger: 'change',
                    }],
                    featureID: [{
                        required: true,
                        validator: moduleNew,
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
                    menuID: [{
                        required: true,
                        validator: menuEdit,
                    }],
                    featureID: [{
                        required: true,
                        validator: moduleEdit,
                    }],
                    memo: [{
                        max: 30,
                        message: '长度在  30个字符以内',
                        trigger: 'blur'
                    }]
                },
                //所属功能列表
                featureList: []
            }
        },
        components: {
            rtPage,
            noData
        },
        mounted() {
            this.menu();
            this.getModulePermission()
        },
        methods: {
            //获取所属功能
            getModulePermission() {
                this.axios.post("/permission/getAllPermatch")
                    .then((res) => {
                        let feature = res.data.data;
                        feature.shift()
                        this.featureList = feature;
                    }).catch((error) => {
                        console.log(error);
                    })
            },
            //加载数据
            ajaxData(data) {
                this.axios.post("/permissionPackage/selectByCondition", data)
                    .then((res) => {
                        this.loading = false;
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
                //验证搜索状态
                this.curPage = curPage;
                let data = {
                    nameLike: this.searchStatus == 0 ? '' : this.name, //搜索名称
                    menuId: this.searchStatus == 0 ? '' : this.resourceID, //菜单id
                    status: 2,
                    pageIndex: this.curPage,
                    size: 10
                };
                this.ajaxData(data)
            },
            //搜索
            onSearch(ev) {
                //搜索非法字符验证，搜索状态
                var aa = /[@#\$%\^&\*<>!(),\.￥]+/g;
                if(aa.test(this.name) == true) {
                    alert("不能有非法字符")
                } else {
                    //从零开始
                    this.total = 0;
                    //加载状态
                    this.loading = true;
                    this.searchStatus = 1;
                    let data = {
                        nameLike: this.searchStatus == 0 ? '' : this.name, //搜索名称
                        menuId: this.searchStatus == 0 ? '' : this.resourceID, //菜单id
                        status: 2,
                        pageIndex: this.searchStatus == 0 ? '' : this.curPage, //当前页码
                        size: 10
                    };
                    this.ajaxData(data)
                }
            },
            //菜单
            menu() {
                this.axios.post("/menu/getMenuAll")
                    .then((res) => {
                        this.resourceList = res.data.data;
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
                            name: this.newBuild.name, //权限包名称
                            menuId: this.newBuild.menuID, //菜单id
                            sort: this.newBuild.featureID,  //功能id
                            memo: this.newBuild.memo, //权限包详情说明
                            status: this.newBuild.radio //状态
                        };
                        this.axios.post("/permissionPackage/savePackage", data)
                            .then((res) => {
                                this.loadingNew = false;
                                if(res.data) {
                                    this.name = "";
                                    this.resourceID = "";
                                    //从零开始
                                    this.total = 0;
                                    this.pageHandler(1);
                                    this.dialogAdd = false;
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
                        return false
                    }
                })
            },
            //新建关闭
            addOFF(formName) {
                this.dialogAdd = false;
                this.$refs[formName].resetFields();
            },
            //编辑
            edit(id) {
                this.dialogEdit = true;
                let data = {
                    id: id
                }
                this.packageID = id;
                this.axios.post("/permissionPackage/selectById", data)
                    .then((res) => {
                        //编辑回显
                        this.packageID = res.data.data.id; //权限包id
                        this.editDialog.name = res.data.data.name; //权限包名称
                        this.editName = res.data.data.name;
                        this.menuID = res.data.data.menu.id; //菜单列表id
                        let keys = this.indElem(this.resourceList,'id',this.menuID);
                        if(keys == true){
                            this.editDialog.menuName = res.data.data.menu.name; //菜单列表名称
                            this.editDialog.menuID = res.data.data.menu.id; //菜单列表id
                        }else{
                            this.editDialog.menuName = '此所属菜单已删除'; //菜单列表名称
                            this.editDialog.menuID = ''; //菜单列表id;
                        }
                        this.editDialog.featureName = res.data.data.pMatch.name; //功能列表名称
                        this.editDialog.featureID = res.data.data.pMatch.sortField; //功能列表id
                        this.featureID = res.data.data.pMatch.sortField; //存储功能列表id
                        this.editDialog.radio = "" + res.data.data.status + ""; //状态
                        this.editDialog.memo = res.data.data.memo; //描述
                    }).catch((error) => {
                        console.log(error);
                    });
            },
            //封装判断是否存在
            indElem(arrayToSearch,attr,val){
                for (var i=0;i<arrayToSearch.length;i++){
                    if(arrayToSearch[i][attr]==val){
                        return true;
                    }
                }
                return false;
            },
            //编辑保存
            editSAVE(formName) {
                this.$refs[formName].validate((valid) => {
                    if(valid) {
                        this.loadingEdit = true;
                        let data = {
                            id: this.packageID,
                            name: this.editDialog.name,
                            menuId: this.editDialog.menuID,
                            sort: this.editDialog.featureID,
                            memo: this.editDialog.memo,
                            status: this.editDialog.radio
                        };
                        this.axios.post("/permissionPackage/updatePackagById", data)
                            .then((res) => {
                                this.loadingEdit = false;
                                this.editDialog.featureName = '';
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
            //删除
            del(id) {
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let data = {
                        id: id
                    };
                    this.axios.post("/permissionPackage/delPackagById", data)
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
            }
        },
        computed: {
        　　newmenuID() {
        　　　　return this.newBuild.menuID
        　　},
            editmenuID() {
        　　　　return this.editDialog.menuID
        　　}
        },
        watch: {
            name: function() {
                this.searchStatus = 0
            },
            newmenuID(newValue, oldValue) {
        　　　　 console.log(newValue, oldValue)
                if(newValue != oldValue){
                    this.newBuild.featureID = ''
                }
        　　},
            editmenuID(newValue, oldValue) {
        　　　　 console.log(newValue, oldValue)
                if(oldValue){
                    if(newValue != oldValue){
                        this.editDialog.featureID = '';
                        this.editDialog.featureName = '';
                    }
                }
                
        　　},
        }
    }
</script>
<style lang="less" scoped="scoped">
    .jp-resourceList {
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