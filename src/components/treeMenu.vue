<template>
	<li>
		<div @click='toggle'>
			<p>
				<span><b class="menuIds" :data-id="model.id">{{model.name}}</b></span>
				<span v-for="(valSel,valIndex) in model.permissionPackageList" :key="valSel.id"><input type="checkbox" :ref="model.name" :name="model.name" id="" :disabled="valSel.id == null ? true : false" :checked="valSel.checked == 1 ? true : false" :value="valSel.id == null ? '' : valSel.id" @click="close(model.name,valIndex)"/></span>
			</p>
		</div>
		<ul v-show="open" v-if='isFolder'>
			<items v-for='cel in model.subMenuList' :model='cel' :key="cel.id"></items>
		</ul>
	</li>
</template>
<script type="text/javascript">
	export default {
		name: 'items',
		props: ['model'],
		components: {},
		data() {
			return {
				num: 0,
				open: true,
				isFolder:this.model.subMenuList
			}
		},
		computed: {
			/*isFolder: function() {
				return this.model.subMenuList
			}*/
		},

		methods: {
			toggle: function() {
				/*if(this.isFolder) {
					this.open = !this.open
				}*/
			},
			//关闭
			close(selectName, index) {
				let length = this.$refs[selectName].length - 1;
				console.log(this.$refs[selectName][length].checked)
				if(index == length && this.$refs[selectName][length].checked) {
					this.$refs[selectName].forEach(function(val, key) {
						val.checked = false;
					})
					this.$refs[selectName][index].checked = true
				} else if(index == length && !this.$refs[selectName][length].checked) {

				} else if(this.$refs[selectName][length].checked) {
					this.$refs[selectName][length].checked = !this.$refs[selectName][length].checked
				}
			}
		},
		watch: {
			isFolder: function() {
				console.log(this.num)
					++this.num
			}
		}
	}
</script>

<style lang="less" scoped="scoped">
	li {
		width: 17.001rem;
		p {
			height: 50px;
			line-height: 50px;
			border-bottom: 1px solid #d9d9d9;
			display: flex;
			font-size: 14px;
			span {
				width: 25%;
				float: left;
				height: 50px;
				line-height: 50px;
				text-align: center;
				border-right: 1px solid #d9d9d9;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				b {
					font-weight: 400;
					margin-left: 30px;
				}
			}
			span:first-child {
				text-align: left;
				width: 30%;
			}
			span:last-child {
				border-right: none;
			}
		}
		ul li {
			div p span b {
				margin-left: 60px;
			}
			ul li {
				div p span b {
					margin-left: 90px;
				}
				ul li {
					div p span b {
						margin-left: 120px;
					}
					ul li {
						div p span b {
							margin-left: 150px;
						}
					}
				}
			}
		}
	}
</style>