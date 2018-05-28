<template>
	<div class="jp-authoritySet">
		<tips><span slot="nav">权限管理 > 权限设置</span></tips>
		<!--权限设置二级路由-->
		<div class="menu">
			<ul>
				<router-link to="/navigator/authoritySet/menuList" tag="li">系统菜单列表</router-link>
				<router-link to="/navigator/authoritySet/resourceList" tag="li">菜单权限列表</router-link>
				<router-link to="/navigator/authoritySet/authorityResource" tag="li">权限资源列表</router-link>
			</ul>
		</div>
		<router-view></router-view>
	</div>
</template>

<script>
	import tips from '@/components/tips'
	export default {
		data() {
			return {
			}
		},
		components: {
			tips
		},
		methods: {
		}
	}
</script>

<style lang="less" scoped="scoped">
	.jp-authoritySet {
		width: 766/32rem;
		min-width: 766px;
		margin: 20px auto;
		.menu {
			width: 450/32rem;
			min-width: 450px;
			height: 43px;
			margin-top: 28px;
			ul {
				width: 450/32rem;
				min-width: 450px;
				height: 43px;
				box-shadow: 0 0 10px #9e9ea1;
				li {
					width: 150/32rem;
					min-width: 150px;
					height: 43px;
					line-height: 43px;
					float: left;
					background: #eef1f7;
					font-size: 14px;
					border-right: 1px solid #cccccc;
					border-bottom: 1px solid #cccccc;
					text-align: center;
					border-top: 2px solid transparent;
					color: #787878;
					cursor: pointer;
				}
				li:last-child {
					border-right: none;
				}
				.router-link-active {
					background: #fff;
					border-bottom: none;
					border-top-color: #f33535;
				}
			}
		}
	}
</style>