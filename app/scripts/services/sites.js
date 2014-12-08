/*global io*/
angular.module('Volusion.services')
		.factory('socket', ['socketFactory', function(socketFactory) {

			'use strict';

			// socket.io now auto-configures its connection when we ommit a connection url
			var ioSocket = io('http://localhost:3000', {
				// Send auth token on connection, you will need to DI the Auth service above
				// 'query': 'token=' + Auth.getToken()
				path: '/socket.io-client'
			});

			var socket = socketFactory({
				ioSocket: ioSocket
			});

			return {
				socket: socket,

				/**
				 * Register listeners to sync an array with updates on a model
				 *
				 * Takes the array we want to sync, the model name that socket updates are sent from,
				 * and an optional callback function after new items are updated.
				 *
				 * @param {String} modelName
				 * @param {Array} array
				 * @param {Function} cb
				 */
				syncUpdates: function (modelName, array, cb) {
					cb = cb || angular.noop;

					/**
					 * Syncs item creation/updates on 'model:save'
					 */
					socket.on(modelName + ':save', function (item) {

						var oldItem = _.find(array, {id: item.id});
						var index = array.indexOf(oldItem);
						var event = 'created';

						// replace oldItem if it exists
						// otherwise just add item to the collection
						if (oldItem) {
							array.splice(index, 1, _.merge(oldItem,item));
							event = 'updated';
						} else {
							array.push(item);
						}

						cb(event, item, array);
					});

					/**
					 * Syncs removed items on 'model:remove'
					 */
					socket.on(modelName + ':remove', function (item) {
						var event = 'deleted';
						_.remove(array, {id: item.id});
						cb(event, item, array);
					});
				},

				/**
				 * Removes listeners for a models updates on the socket
				 *
				 * @param modelName
				 */
				unsyncUpdates: function (modelName) {
					socket.removeAllListeners(modelName + ':save');
					socket.removeAllListeners(modelName + ':remove');
				}
			};
		}]);