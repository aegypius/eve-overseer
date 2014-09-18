angular
  .module('eve-overseer')
  .factory('Auth', ['$location', '$rootScope', 'Session', 'User', '$cookieStore',
    function ($location, $rootScope, Session, User, $cookieStore) {
        $rootScope._user = $cookieStore.get('user') || null;
        $cookieStore.remove('user');

        return {

          login: function (provider, user, callback) {
            var cb = callback || angular.noop;

            Session.save({
              provider:   provider,
              email:      user.email,
              password:   user.password,
              rememberMe: user.rememberMe,
            }, function (user) {
              $rootScope._user = user;
              return cb();
            }, function (err) {
              return cb(err.data);
            });
          },

          logout: function (callback) {
            var cb = callback || angular.noop;

            Session.delete(function (res) {
              $rootScope._user = null;
              return cb();
            }, function (err) {
              return cb(err.data);
            });
          },

          createUser: function (userinfo, callback) {
            var cb = callback || angular.noop;

            User.save(userinfo, function(user) {
                $rootScope._user = user;
              }, function (err) {
                return cb(err.data);
              }
            );
          },

          currentUser: function () {
            Session.get(function(user) {
              $rootScope._user = user;
            }, function (response) {
              console.log(response);
            }, function (error) {
              console.log(arguments);
            });
          },

          changePassword: function(email, oldPassword, newPassword, callback) {
            var cb = callback || angular.noop;

            User.update({
              email: email,
              oldPassword: oldPassword,
              newPassword: newPassword
            }, function (user) {
              console.log('password updated');
              return cb();
            }, function (err) {
              return cb(err.data);
            });

          },

          removeUser: function(email, password, callback) {
            var cb = callback || angular.noop;

            User.delete({
              email: email,
              password: password,
            }, function (user) {
              console.log(user + 'removed');
              return cb();
            }, function (err) {
              return cb(err.data);
            });

          }
        };
    }]
  );
