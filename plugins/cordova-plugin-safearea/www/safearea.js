cordova.define("cordova-plugin-safearea.safearea", function(require, exports, module) { /* globals cordova, module */

module.exports = {
  get: function (successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, 'SafeArea', 'get', []);
  }
};

});
