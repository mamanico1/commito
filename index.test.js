const Commito = require('./index.js');

describe('Commito Custom Promise Tests', () => {
	test('Basic Resolve', () => {
		return new Commito((resolve, reject) => {
			resolve('Resolved');
		}).then(data => {
			expect(data).toBe('Resolved');
		});
	});

	test('Basic Reject', () => {
		 return new Commito((resolve, reject) => {
			reject('Rejected');
		}).catch(error => {
			expect(error).toBe('Rejected');
		});
	});

	test('Resolve with Data', () => {
		return new Commito((resolve, reject) => {
			resolve('Data');
		}).then(data => {
			expect(data).toBe('Data');
		});
	});

	test('Chained Resolves', () => {
		return new Commito((resolve, reject) => {
			resolve('First');
		})
			.then(data => {
				return new Commito((resolve, reject) => {
					expect(data).toBe('First')
					resolve('Second');
				});
			})
			.then(data => {
				expect(data).toBe('Second');
			});
	});

	test('Reject after Resolve', () => {
		return new Commito((resolve, reject) => {
			resolve('Resolved');
			reject('Rejected');
		}).then(data => {
			expect(data).toBe('Resolved');
		});
	});

	test('Unhandled Rejection', () => {
		const unhandled = new Commito((resolve, reject) => {
			reject('Unhandled Rejection');
		});

		// Prevent unhandled promise rejection warnings in Jest
		unhandled.catch(() => {});

		// Expect no assertions here since it's an unhandled rejection
	});

	test('Resolve after Settled', () => {
		return new Commito((resolve, reject) => {
			resolve('Initial');
			resolve('Resolved');
		}).then(data => {
			expect(data).toBe('Initial');
		});
	});

	test('Reject after Settled', () => {
		return new Commito((resolve, reject) => {
			reject('Initial');
			reject('Rejected');
		}).catch(error => {
			expect(error).toBe('Initial');
		});
	});

	test('Chained Rejects', () => {
		return new Commito((resolve, reject) => {
			reject('First error');
		})
			.catch(error => {
				return new Commito((resolve, reject) => {
					expect(error).toBe('First error')
					reject('Second');
				});
			})
			.catch(error => {
				expect(error).toBe('Second');
			});
	});

	test('Error Handling', () => {
		return new Commito((resolve, reject) => {
			throw new Error('Thrown Error');
		}).catch(error => {
			expect(error.message).toBe('Thrown Error');
		});
	});

	test('Multiple then() Calls', () => {
		const promise = new Commito((resolve, reject) => {
			resolve('First');
		});

		promise.then(data => {
			expect(data).toBe('First');
		});

		promise.then(data => {
			expect(data).toBe('First');
			return 'Second'
		}).then(data => {
			expect(data).toBe('Second');
			return 3
		}).then(data => {
			expect(data).toBe(4);
		});
	});

	it("returns a promise-like object, that resolves it's chain after invoking resolve", () => {
		return new Commito((resolve) => {
			setTimeout(() => {
				resolve("testing");
			}, 2000);
		}).then((val) => {
			expect(val).toBe("testing");
		});
	});

});

describe('Commito Custom Promise Test', () => {
	test('Chained Resolves with Delay', () => {
		return new Commito((resolve, reject) => {
			setTimeout(() => {
				resolve('First');
			}, 1000);
		})
			.then(data => {
				return new Commito((resolve, reject) => {
					setTimeout(() => {
						resolve('Second');
					}, 500);
				});
			})
			.then(data => {
				expect(data).toBe('Second');
			});
	});

	test('Chained Rejects with Delay', () => {
		return new Commito((resolve, reject) => {
			setTimeout(() => {
				reject('First');
			}, 500);
		})
			.catch(error => {
				return new Commito((resolve, reject) => {
					setTimeout(() => {
						reject('Second');
					}, 1000);
				});
			})
			.catch(error => {
				expect(error).toBe('Second');
			});
	});

	test('Multiple Resolves with Race Condition', () => {
		let resolveCount = 0;

		const promise = new Commito((resolve, reject) => {
			setTimeout(() => {
				resolveCount++;
				resolve('First');
			}, 500);

			setTimeout(() => {
				resolveCount++;
				resolve('Second');
			}, 1000);
		});

		return promise.then(data => {
			expect(data).toBe('First');
			expect(resolveCount).toBe(1); // Ensure only one resolve occurs
		});
	});


	it("throw error from catch cb", () => {
		const err = new Error("last");
		return new Commito((_, reject) => {
			reject(new Error("Initial error"));
		}).catch(() => {
			throw err;
		}).catch((e) => {
			expect(e).toBe(err);
		});
	});

	it("throw error from then callback", () => {
		const err = new Error("Error");
		return new Commito((resolve) => {
			resolve();
		}).then(() => {
			throw err;
		}).catch((e) => {
			expect(e).toBe(err);
		});
	});

	it("resolve then after catch", () => {
		return new Commito(() => {
			throw new Error("Failure!");
		}).catch(() => {
			return "expected";
		}).then((value) => {
			expect(value).toBe("expected");
		});
	});

	it("then chaining", () => {
		return new Commito((resolve) => {
			resolve(0);
		}).then((value) => value + 1)
			.then((value) => value + 1)
			.then((value) => value + 1)
			.then((value) => {
				expect(value).toBe(3);
			});
	});

	it("short-circuits then chain on error", () => {
		const error = new Error("error");

		return new Commito(() => {
			throw error;
		}).then(() => {
			throw new Error("should not be called");
		}).catch((err) => {
			expect(err).toBe(error);
		});
	});

	it("pass value through then", () => {
		return new Commito((resolve) => {
			resolve("testing");
		}).then()
			.then((value) => {
				expect(value).toBe("testing");
			});
	});

	it("pass value through catch", () => {
		const error = new Error("error");

		new Commito((_, reject) => {
			reject(error);
		}).catch()
			.catch((err) => {
				expect(err).toBe(error);
			});
	});

	it("it is called when promise is rejected", (done) => {
		 new Commito((_, reject) => {
			reject("fail")
		}).finally(() => {
			done();
		});
	});

	it("it preserves a resolved promise state", (done) => {
		let count = 0;

		new Commito((resolve) => {
			resolve("success")
		}).finally(() => {
			count += 1;
		}).then((value) => {
			expect(value).toBe("success");
			expect(count).toBe(1);
			done();
		});
	});

	it("it preserves a rejected promise state", (done) => {
		let count = 0;

		new Commito((_, reject) => {
			reject("fail")
		}).finally(() => {
				count += 1;
		}).catch((reason) => {
			expect(reason).toBe("fail");
			expect(count).toBe(1);
			done();
		});
	});

});

describe("the promise", () => {

	it("resolves a Commito ", () => {
		return new Commito((resolve) =>
				resolve(new Commito((resolve) => resolve("testing")))
		).then((val) => {
			expect(val).toBe("testing");
		});
	});

	it("resolves a promise before calling catch", () => {
		return new Commito((resolve) =>
				resolve(new Commito((_, reject) => reject("fail")))
		).catch((reason) => {
			expect(reason).toBe("fail");
		});
	});

	it("catches errors from reject", (done) => {
		const error = new Error("failure");

		new Commito((_, reject) => {
			return reject(error);
		}).catch(err => {
			expect(err).toBe(error);
			done();
		});
	});

	it("catches errors from throw", (done) => {
		const error = new Error("fail");

		new Commito(() => {
			throw error;
		}).catch((err) => {
			expect(err).toBe(error);
			done();
		});
	});

});

describe('multiple promises', () => {
	test('Chained Promises Passing Value', () => {
		const promise1 = new Commito((resolve, reject) => {
			resolve('First');
		});
		const promise2 = new Commito((resolve, reject) => {
			promise1.then(data => {
				resolve(data + ' Second');
			});
		});
		return promise2.then(data => {
			expect(data).toBe('First Second');
		});
	});

	test('Chained Promises with Reject', () => {
		const promise1 = new Commito((resolve, reject) => {
			reject('Error');
		});
		const promise2 = new Commito((resolve, reject) => {
			promise1.catch(error => {
				resolve('Caught ' + error);
			});
		});
		return promise2.then(data => {
			expect(data).toBe('Caught Error');
		});
	});

	test('Chained Promises with Multiple Resolves', () => {
		let resolveCount = 0;
		const promise1 = new Commito((resolve, reject) => {
			resolveCount++;
			resolve('First');
		});
		const promise2 = new Commito((resolve, reject) => {
			promise1.then(data => {
				resolveCount++;
				resolve(data + ' Second');
			});
		});
		return promise2.then(data => {
			expect(data).toBe('First Second');
			expect(resolveCount).toBe(2);
		});
	});

	test('Promise Race Condition', () => {
		const promise1 = new Commito((resolve, reject) => {
			setTimeout(() => {
				resolve('First');
			}, 1000);
		});

		const promise2 = new Commito((resolve, reject) => {
			setTimeout(() => {
				resolve('Second');
			}, 500);
		});

		return Promise.race([promise1, promise2]).then(data => {
			expect(data).toBe('Second');
		});
	});
});
/// more complex

