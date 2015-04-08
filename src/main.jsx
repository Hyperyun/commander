/** @jsx React.DOM */

/*global clearInterval: false, clearTimeout: false, document: false, event:
 * false, frames: false, history: false, Image: false, location: false, name:
 * false, navigator: false, Option: false, parent: false, screen: false,
 * setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false
 * Hyperstore:false , React: false, module: false, require: false, renderList: false,  _: false, Profile: false,
 * Router : false, Panel: false xiupinHistory: false,
 * ResponsiveBootstrapToolkit: false*/

require("style!css!less!./css/main.less");
require("style!css!./css/bootstrap.css");
require("style!css!./css/epoch.min.css");
require("style!css!./css/MarkerCluster.Default.css");
require("style!css!./css/MarkerCluster.css");
var React = require('react');
var async = require('async');
var JsonEditor = require('./Json.jsx');
var Panel = require('./Panel.jsx');
require('./d3.js');
require('./epoch.min.js');
require('./leaflet.markercluster.js');
var docCookies = require('doc-cookies');

window.React = React;
window.JsonEditor = JsonEditor;
window.Panel = Panel;
window.async = async;

var _ = require('underscore');
window._ = _;
var URI = require('URIjs');
window.URI = require('URIjs');
var DEBUG = true;

window.disableHyperyunLogger = true;

function initialize (hostname, app) {

  window.activeApp = app;
  window.selectedApp = app;
  window.targetServer = hostname;

  Hyperstore.initialize('_hyperyun',['applications','users','collections'],{server:window.targetServer});
  Hyperstore.initialize(app);
  Hyperstore.apps[app].login('password',{token:
                                         docCookies.getItem('HyperyunAdminLoginToken'),
                                         asAdmin:true}, function(res,err)
                             {

                               // if (!Hyperstore.apps[app].user) {
                               if (Hyperstore.apps[app].user) {
                                 alert('Access Denied - please login first.');
                                 window.location = "http://hyperyun.com/zh/login";
                               }
                               else {

                                 Hyperstore.initialize(window.activeApp, ['hyperyunCollections','hyperyunEmails','hyperyunLogs'], {server:window.targetServer});
                                 Hyperstore.apps[window.activeApp].hyperyunCollections.find({},function(a,b){
                                   window.collectionList = _.uniq(_.pluck(a,'name'));
                                   Hyperstore.initialize(window.activeApp, window.collectionList, {server:window.targetServer});
                                 });

                                 Hyperstore.initialize('geoip',['blocks','locations'],{server:window.targetServer});
                                   console.log('rendering');
                                 React.render(<Panel.Main />,document.getElementById('app'));
                                 Panel.init();

                               }


                             });
}

var appname;
var currentURI = URI(window.location.href);

if (currentURI.domain() == "hyperyun.com") {
  if (currentURI.subdomain()) {
    appname = currentURI.subdomain();
    initialize("hyperyun.com",appname);
  }
  else {
    alert('Critical error - please relogin.');
    window.location = "http://hyperyun.com/zh/login";
  }
}
else if (currentURI.domain() == "localhost"){
  currentURI.search(function(data) {
    if (data.hostname && data.appname) {
      initialize(data.hostname, data.appname);
    } else {
      connectionDialog();
    }

  });
}

function connectionDialog(){
$("body").prepend(
  '<div class="container-fluid panel-dialog"><div class="row no-gutters"><div class="col-xs-8 col-xs-offset-2 panel-dialog-content"> </div></div></div>'
);

$(".panel-dialog-content").append('<h3>Hyperstore connection</h3><p>We were unable to determine what server and app you\'re connecting to.</p>');

$(".panel-dialog-content").append('<form id="hyperstore-connection"><div class="form-group"><label for="hostname">Hostname</label><input type="text" class="form-control" id="hyperstore-hostname" placeholder="eg. hyperyun.com"></div><div class="form-group"><label for="hostname">Appname</label><input type="text" class="form-control" id="hyperstore-appname" placeholder="eg. myapp"></div><button type="submit" class="btn btn-default">Connect</button></form>');

$("#hyperstore-connection").submit(function(event) {
  event.preventDefault();
  initialize($("#hyperstore-hostname").val(),$("#hyperstore-appname").val());
  $("body > div.container-fluid.panel-dialog").remove();
});

}
