<template id="tips">
	<div class="tips">
		<p>当前位置：
			<slot name="nav"></slot>
		</p>
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

<style lang="less">
	.tips {
		background: #EEF1F7;
		height: 42px;
		line-height: 42px;
		border-radius: 4px;
		box-shadow: 0 0 10px #cccccc;
		p {
			font-size: 14px;
			padding-left: 14px;
			color: #666666;
		}
	}
</style>