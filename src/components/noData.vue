<template>
	<div class="noneList">
		<div>
			<img src="../assets/img/no-data.png" />
			<p>暂无数据</p>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		methods: {

		}
	}
</script>

<style scoped="scoped" lang="less">
	.noneList {
		position: absolute;
		top: 40px;
		width: 100%;
		height: 510px;
		text-align: center;
		div {
			width: 150px;
			height: 162px;
			position: absolute;
			left: 0;
			top: 80px;
			right: 0;
			margin: auto;
			img {
				width: 150px;
			}
			p {
				font-size: 16px;
				line-height: 28px;
				color: #666;
			}
		}
	}
</style>