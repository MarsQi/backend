<template>
	<el-row>
		<el-col>
			<el-pagination
			  @size-change="sizeHandler"
			  @current-change="currentHandler"
			  :current-page="currentPage"
			  :page-size="pageSize"
			  layout="prev, pager, next"
			  :total="total">
			</el-pagination>
		</el-col>
	</el-row>
</template>

<script>
  export default{
    props: {
    	cur: {
      		type: Number,
      		default: 1
      },
    	total: {
      		type: Number,
      		default: 0
      }
    },
    data() {
    	return{
    		pageSize: 10,
    		currentPage: this.cur,
    		curPageInterpolation: this.startPage,
    	}
    },
    mounted(){
    	this.$emit('change',this.currentPage, this.pageSize);
    },
    methods: {
    	sizeHandler(val) {
    		this.pageSize = val;
    		this.$emit('change', 1, this.pageSize);
    	},
    	currentHandler(val) {
    		this.currentPage = val;
    		this.$emit('change', this.currentPage, this.pageSize);
    	}
    }
  }
</script>

<style scoped>
  .el-pagination{
    margin-top: 15px;
  }
</style>