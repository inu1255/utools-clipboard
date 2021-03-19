var vue = new Vue({
	el: "#root",
	data: {
		list: [],
		api: {
			mode: "list",
			args: {},
		},
	},
	methods: {},
	mounted() {
		utools.onPluginEnter((params) => {
			console.log("enter", params);
			this.api = window.exports[params.code];
			if (this.api.args.enter) {
				this.api.args.enter(params, (x) => (this.list = x));
			}
			utools.subInputFocus();
		});
		document.onkeypress = (e) => {
			console.log(e.keyCode, e.key);
		};
	},
});
