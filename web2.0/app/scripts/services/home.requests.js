'use strict';

/**
 * @ngdoc service
 * @name bkitApp.home.resolve
 * @description
 * # home.resolve
 * Service in the bkitApp.
 */
angular.module('bkitApp')
  .service('home.requests', ['$http', '$q', 'config', function ($http, $q, $config) {

    var self = this;

    this.buildUrl = url;
    function url(path, ids) {

      if (ids && Array.isArray(ids)) {
        ids.forEach(function (id) {
          path += '/' + id;
        });
      }
      return $config.server.url + path;
    }

    function mapPairToArray(obj, name, value) {
      return Object.keys(obj).map(function (k) {

        var ret = {};
        ret[name] = k;
        ret[value] = obj[k];

        return ret;
      });
    }
    function mapComputerProps(computers){
      return Object.keys(computers).map(function(k) {
        var comps = (computers[k] || '').split('.');
        var uuid = comps.pop();
        comps.shift();                    //discard name
        var domain = comps.join('.') 
        return {
          name: k,
          id:  computers[k],
          uuid: uuid,
          domain: domain
        };
      })
    }

    this.loadComputers = function () {
      return $http.get(url('/computers'))
        .then(function (res) {
          var computers = mapComputerProps(res.data);
          var promises = [];

          computers.forEach(function (pc, ind, arr) {
            var promise = self.loadDrives(pc.id).then(function (drives) {
              drives = mapPairToArray(drives, 'id', 'backups');
              arr[ind].drives = drives;
              return arr[ind];
            });

            promises.push(promise);
          });

          return $q.all(promises);

        }).catch(function (e) {
          console.error('exception', e);
        });
    };

    this.loadDrives = function (computer) {
      return $http.get(url('/backups', [computer]))
        .then(function (res) {
          return res.data;
        }, function (err) {
          console.error('http err', err);
        }).catch(function (e) {
          console.error('exception', e);
        });
    }


    this.getBackup = function (computer, drive, bak, path) {

      return $http.get(url('/folder', [computer, drive, bak, path]))
        .then(function (res) {
          (res.data.files || []).forEach(function(file){
            file.datetime = moment(1000*file.datetime)
          })  
          return res.data;
        }, function (err) {
          console.error('http err', err);
        }).catch(function (e) {
          console.error('exception', e);
        });
    }

    this.restore = function (path, computer, drive, bak) {
      return $http.get(url('/bkit', [computer, drive, bak, path]))
        .then(function (res) {
          return res;
        }, function (err) {
          console.error('http err', err);
        }).catch(function (e) {
          console.error('exception', e);
        });
    }

    this.view = function (path, computer, drive, bak) {
      return $http.get(url('/view', [computer, drive, bak, path]))
        .then(function (res) {
          return res;
        }, function (err) {
          console.error('http err', err);
        }).catch(function (e) {
          console.error('exception', e);
        });
    }

    this.download = function (path, computer, drive, bak) {
      return $http.get(url('/download', [computer, drive, bak, path]))
        .then(function (res) {
          return res;
        }, function (err) {
          console.error('http err', err);
        }).catch(function (e) {
          console.error('exception', e);
        });
    }

  }]);
