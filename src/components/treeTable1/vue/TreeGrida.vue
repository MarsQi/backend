<template>
  <el-table
    :data="data"
    border
    style="width: 100%"
    :row-style="showTr">
    <el-table-column label="序号">
      <template slot-scope="scope">
        {{scope.$index+1}}
      </template>
    </el-table-column>
    <el-table-column v-for="(column, index) in columns" :key="column.dataIndex"
      :label="column.text">
      <template slot-scope="scope">
        <span v-if="spaceIconShow(index)" v-for="(space, levelIndex) in scope.row._level" class="ms-tree-space"></span>
        <div class="button is-outlined is-primary is-small" v-if="toggleIconShow(index,scope.row)" @click="toggle(scope.$index)">
          <i v-if="!scope.row._expanded" class="el-icon-caret-right" aria-hidden="true"></i>
          <i v-if="scope.row._expanded" class="el-icon-caret-bottom" aria-hidden="true"></i>
        </div>
        <span v-else-if="index===0" class="ms-tree-space"></span>
        <b v-if="index===0 " :class="scope.row.icon"></b>
        {{scope.row[column.dataIndex]}}
      </template>
    </el-table-column>
    <el-table-column label="排序" v-if="treeType === 'normal'" width="260">
      <template slot-scope="scope">
        <div>
          <i class="iconfont icon-shangsheng1" @click='up(scope.$index,scope.row)' aria-hidden="true"></i>
          <i class="iconfont icon-xiala" @click='down(scope.$index,scope.row)' aria-hidden="true"></i>
        </div>
      </template>
    </el-table-column>
    <el-table-column label="设为首选项" v-if="treeType === 'normal'" width="260">
      <template slot-scope="scope">
        <el-button :disabled ="!!scope.row.children
"
          size="small"
          type="blue"
          @click="set(scope.row)">
          {{scope.row.isDefault==1?'首页':'设为首页'}}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
  import Utils from '../utils/index.js'
//  import Vue from 'vue'
  export default {
    name: 'tree-grida',
    props: {
// 该属性是确认父组件传过来的数据是否已经是树形结构了，如果是，则不需要进行树形格式化
      treeStructure: {
        type: Boolean,
        default: function () {
          return false
        }
      },
// 这是相应的字段展示
      columns: {
        type: Array,
        default: function () {
          return []
        }
      },
// 这是数据源
      dataSourcea: {
        type: Array,
        default: function () {
          return []
        }
      },
// 这个作用是根据自己需求来的，比如在操作中涉及相关按钮编辑，删除等，需要向服务端发送请求，则可以把url传过来
      requestUrl: {
        type: String,
        default: function () {
          return ''
        }
      },
// 这个是是否展示操作列
      treeType: {
        type: String,
        default: function () {
          return 'normal'
        }
      },
// 是否默认展开所有树
      defaultExpandAll: {
        type: Boolean,
        default: function () {
          return false
        }
      }
    },
    data () {
      return {
        editUSER:false
      }
    },
    computed: {
    // 格式化数据源
      data: function () {
        let me = this
        if (me.treeStructure) {
          let data = Utils.MSDataTransfer.treeToArray(me.dataSourcea, null, null, me.defaultExpandAll)
          // console.log(data)
          return data
        }
        return me.dataSourcea
      }
    },
    mounted() {
      console.log(this.data)
    },
    methods: {
      swapItems(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
          return arr;
      },
    // 显示行
      showTr: function (row, index) {
        let show = (row._parent ? (row._parent._expanded && row._parent._show) : true)
        row._show = show
        return show ? '' : 'display:none;'
      },
    // 展开下级
      toggle: function (trIndex) {
        let me = this
        let record = me.data[trIndex]
        record._expanded = !record._expanded
      },
    // 显示层级关系的空格和图标
      spaceIconShow (index) {
        let me = this
        if (me.treeStructure && index === 0) {
          return true
        }
        return false
      },
    // 点击展开和关闭的时候，图标的切换
      toggleIconShow (index, record) {
        let me = this
        if (me.treeStructure && index === 0 && record.children && record.children.length > 0) {
          return true
        }
        return false
      },
      up(index,row) {
          console.log(index)
          console.log(this.data,33333)
          console.log(row,44444);
          console.log(row.pid)
          // this.dataSourcea.forEach(function(val,key) {
          //   console.log(val,key)
          // })
          // if(row.children) {

          // }
          // var kong = this.dataSourcea
          // var ii = 0
          // ii = this.data[index]
          // this.data[index] = this.data[index+1]
          if(index == 0) {
              return;
          }
          this.swapItems(this.data, index, index - 1);
      },
      down(index,row) {
          if(index == this.data.length -1) {
              return;
          }
          this.swapItems(this.data, index, index + 1);
      },
      set: function(index) {
       // console.log(index)
       this.editUSER = true;
       let data = {
            a:this.editUSER,
            b:index
        };
       this.$emit('set',index);
      },
      edit: function(index) {
       // console.log(index)
       this.editUSER = true;
       let data = {
            a:this.editUSER,
            b:index
        };
       this.$emit('editP',data);
      },
      handleDelete (index) {
        // console.log(index);
        /*请大哥别改这一块，这里的index并不是索引，是传过来的一条数据*/
        this.$confirm('此操作将永久删除该记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // this.dataSource.splice(index, 1)
          this.$emit('delP',index);
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    }
  }
</script>
<style scoped lang="less">
  .ms-tree-space{position: relative;
    top: 1px;
    display: inline-block;
    font-family: 'Glyphicons Halflings';
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    width: 18px;
    height: 14px;}
  .ms-tree-space::before{content: ""}
  table td{
    line-height: 26px;
  }
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

</style>
