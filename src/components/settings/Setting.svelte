<div class="setting">
	<div>
		<div class="title"><slot name="title" /></div>
		<div class="desc"><slot name="desc" /></div>
	</div>
	<slot name="value" />
</div>

<style>
	.setting {
		/* border-bottom: 1px solid var(--border-primary); */
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.title {
		font-size: var(--fs-medium);
		font-weight: 500;
	}
	.desc {
		font-size: var(--fs-tiny);
		color: var(--fg-secondary);
	}
	.setting :global([slot="value"]) {
		min-height: 56px;
		padding: 12px 0;
		display: flex;
		align-items: center;
	}
</style>
