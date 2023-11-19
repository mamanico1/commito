class Commito {
	constructor(handler) {
		this.state = "pending"
		this.result = null
		this.resolveCallbacks = [];
		this.rejectCallbacks = []
		let self = this

		this.resolve = (value) => {
			this.setResult(value, "resolved");
		};
		this.reject = (reason) => {
			this.setResult(reason, "rejected");
		};

		try {
			handler(self.resolve, self.reject);
		} catch (e) {
			self.reject(e);
		}
	}

	setResult(value, state) {
		if (this.state === "pending") {
			if (typeof value?.then === "function") {
				value.then(this.resolve, this.reject);
				return;
			}
			this.state = state;
			this.result = value;
			this.executeResolvers();
		}
	}

	executeResolvers = () => {
		if (this.state !== 'pending') {
			if (this.state === 'resolved') {
				this.resolveCallbacks.forEach(fn => setTimeout(() => fn(this.result)))
			}
			if (this.state === 'rejected') {
				this.rejectCallbacks.forEach(fn => setTimeout(() => fn(this.result)))
			}

			this.resolveCallbacks = [];
			this.rejectCallbacks = [];
		}
	};

	then(onFulfilled, onRejected) {
		return new Commito((resolve, reject) => {
			this.resolveCallbacks.push(() => {
				if (!onFulfilled) {
					resolve(this.result)
				} else {
					try {
						resolve(onFulfilled(this.result));
					} catch (e) {
						reject(e);
					}
				}
			})
			this.rejectCallbacks.push(() => {
				if (!onRejected) {
					reject(this.result)
				} else {
					try {
						resolve(onRejected(this.result));
					} catch (e) {
						reject(e);
					}
				}
			})
			this.executeResolvers();
		});
	}

	catch(onRejected) {
		return this.then(undefined, onRejected);
	}

	finally(onFinally) {
		return this.then(
			(value) => {
				onFinally();
				return value;
			},
			(reason) => {
				onFinally();
				throw reason;
			}
		);
	}
}

module.exports = Commito;


