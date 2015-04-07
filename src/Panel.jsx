/** @jsx React.DOM */

/*global clearInterval: false, clearTimeout: false, document: false, event:
 * false, frames: false, history: false, Image: false, location: false, name:
 * false, navigator: false, Option: false, parent: false, screen: false,
 * setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false
 * Hyperstore:false , React: false, module: false, require: false, renderList: false,  _: false, Profile: false,
 * Router : false, xiupinHistory: false,
 * ResponsiveBootstrapToolkit: false*/

// Requires
var JsonEditor = require('./Json.jsx');

// Panel Definition
var Panel = {};

Panel.Wrapper = React.createClass({
    render: function() {
        this.setPage = this.props.setPage;
        return (
            <div className="panel-wrapper">
                <div id="dummy-top"></div>
                <Panel.TopBar setPage={this.setPage}/>

                <div id="panel-container" className={"container-fluid panel-main"}>
                    <div className={"row no-gutters panel-side-bar-container"}>


                        <Panel.SideBar setPage={this.setPage}/>


                {this.props.children}

                    </div>
                </div>

            </div>
        );
    }
});

Panel.Apps = React.createClass({
    handleClick: function(app) {
        var that = this;
        window.selectedApp=app;
        window.activeApp=app;

        Hyperstore.initialize(app, ['hyperyunCollections'],{server:window.targetServer});
        Hyperstore.apps[app].hyperyunCollections.find({},function(a,b){
            window.collectionList = _.uniq(_.pluck(a,'name'));
            Hyperstore.initialize(app, window.collectionList, {server:window.targetServer});
            that.props.parent.forceUpdate();
        });

    },
    render: function(){
        var that = this;
        var renderList = [];
        _.forEach(Hyperstore._retrieveLoginCredentials(), function (e,i,l){
            renderList.push(
                    <div className={"col-xs-2"}>
                    <a href="#" onClick={that.handleClick.bind(that,e.app)}>
                    <div className={"panel-app-box"}>
                    <div className={"panel-app-name"}>
                    <h4>
                    {e.app}
                    </h4>
                </div>
                    </div>
                    </a>
                    </div>
            );
        });

        return (
                <div className={"panel-app-list"}>
                {renderList}
                </div>
        );
    }
});

Panel.Main = React.createClass ({
    getInitialState:function () {
        return {page:{section:'dashboard'}};
    },
    setPage: function(targetPage) {
        console.log('setting page to',JSON.stringify(targetPage));
        this.setState({page:targetPage});
        Panel.setOmnibar(targetPage.section);
        console.log('state is now ',JSON.stringify(this.state));
    },
    componentDidUpdate: function(){
        $(".panel-sidebar-quickfix").width($(".panel-side-bar").width());
    },
    render:function () {
        var that = this;
        if(!window.selectedApp){
            return (
                    <div>
                    <div className={"container-fluid panel-main"}>

                    <div className={"row no-gutters"}>
                    <Panel.TopBar setPage={this.setPage}/>
                    </div>

                    </div>

                    <div className={"container-fluid panel-main"}>
                    <div className={"row no-gutters"}>
                    <div className={"col-xs-12 panel-main-container"}>
                    <div className={"row panel-apps-row"}>
                    <div className={"panel-apps"}>
                    <h1>Your apps:</h1>
                    <Panel.Apps parent={that}/>
                    </div>
                    </div>
                    </div>
                    </div>
                    </div>

                    </div>

            );
        }
        else if(this.state.page.section == 'dashboard'){
        return (

                <Panel.Wrapper setPage={this.setPage}>
                <div
                 className={"col-xs-10 panel-main-container panel-dashboard"}>
                <h1>{window.activeApp}{"'s"} Dashboard</h1>
                <div id="panel-concurrents" className="epoch-theme-dark">
                <h5>{"Concurrent Connections:"}</h5>
                <Panel.Concurrents />
                </div>
                <div id="panel-activityindex" className="epoch-theme-dark">
                <h5>{"User Activity Index:"}</h5>
                </div>
                <div className={"col-xs-12"}>
                <div>
                <Panel.Map/>
                </div>
                </div>
                </div>
                </Panel.Wrapper>
        );
        }
        else if (this.state.page.data) {
            return (
                    <Panel.Wrapper setPage={this.setPage}>

                    <div className={"col-xs-8 panel-main-container"}>

                    <JsonEditor.JsonView collection={this.state.page.data.collection}
                     limit={this.state.page.data.limit}/>
                    </div>
                    <div className={"col-xs-2 panel-right-bar"}>
                    <Panel.DataRightBar setPage={this.setPage} />
                    </div>

                    </Panel.Wrapper>
            );
        }
        else if(this.state.page.section == 'data' && !this.state.data) {
            return (
                    <Panel.Wrapper setPage={this.setPage}>
                    <div className={"col-xs-8 panel-main-container panel-data-null"}>

                    <img src={"./src/img/square-logo.png"}></img>
                    <h2>Please select a collection to view. </h2>


                    </div>
                    <div className={"col-xs-2 panel-right-bar"}>
                    <Panel.DataRightBar setPage={this.setPage} />
                    </div>
                    </Panel.Wrapper>



            );
        }
        else if(this.state.page.section == 'logs') {
            return (

                    <Panel.Wrapper setPage={this.setPage}>


                    <div className={"col-xs-8 panel-main-container"}>

                    <JsonEditor.JsonView collection={"hyperyunEmails"}
                     limit={100}/>

                    </div>


                    </Panel.Wrapper>



            );
        }
        else if(this.state.page.section == 'applications') {
            return (
                    <div className={"container-fluid panel-main"}>
                    <div className={"row"}>
                    <Panel.TopBar setPage={this.setPage}/>
                    </div>
                    <div className={"row panel-side-bar-container"}>
                    <Panel.SideBar setPage={this.setPage}/>
                    <div className={"col-xs-8 panel-main-container"}>
                    applications null


                    </div>

                    </div>
                    </div>

            );
        }
        else if(this.state.page.section == 'emails') {
            return (
                    <Panel.Wrapper setPage={this.setPage}>

                    <div className={"col-xs-8 panel-main-container"}>

                <JsonEditor.JsonView collection={"hyperyunEmails"}
                 limit={100}/>

                    </div>

                    </Panel.Wrapper>




            );
        }
        else if(this.state.page.section == 'settings') {



      //       return (
      //               <Panel.Wrapper setPage={this.setPage}>
      //               <div className={"col-xs-8 panel-main-container"}>

      //                <div className="container2">
      //   <div className="screen monitor">
      //     <div className="content">
      //       <div className="pg">
      //         <ul className="btns">
      //           <li /><li /><li />
      //         </ul>
      //         <ul className="txt">
      //           <li />
      //           <li />
      //           <li className="thin" />
      //           <li className="thin" />
      //           <li className="thin" />
      //         </ul>
      //       </div>
      //     </div>
      //     <div className="base">
      //       <div className="grey-shadow" />
      //       <div className="foot top" />
      //       <div className="foot bottom" />

      //     </div>
      //   </div>
      //   <div className="laptop">
      //     <div className="content">
      //               <div className={"animation-app-container"}>
      //               <textarea className={"comment-reply comment-reply-txt"}
      //                placeholder={"Type some stuff here"} name="textarea" rows="30" cols="50" onChange={this.handleChange}></textarea>
      //               </div>
      //     </div>
      //     <div className="btm" />

      //   </div>
      //   <div className="phone">
      //     <div className="screen">
      //       <div className="content">
      //         <ul className="txt">
      //           <li />
      //           <li />
      //           <li />
      //         </ul>
      //       </div>
      //     </div>

      //   </div>
      // </div>


      //               </div>




      //               </Panel.Wrapper>
      //       );
        }
        else if(this.state.page.section == 'security') {
            return (

                    <Panel.Wrapper setPage={this.setPage}>

                    <div className={"col-xs-8 panel-main-container"}>
                    settings null
                    </div>

                    </Panel.Wrapper>
            );
        }
    }
});

Panel.SideBar = React.createClass ({
    handleClick:function(page) {
        this.props.setPage({section:page});
    },
    render:function () {
        var that = this;
        return(
                <div className={"col-xs-2 panel-side-bar"}>

                <div className="panel-sidebar-quickfix">

                <div className={"panel-drop"}>
                {window.activeApp}
                <i className="fa fa-chevron-down fa-md" />
                </div>

                <a href="#" className={this.props.selected == "dashboard" ? "panel-nav-selected" : ""} id="panel-dashboard-link" onClick={this.handleClick.bind(that,'dashboard')}>
                <i className="fa fa-home fa-lg" />
                Dashboard
            </a>
                <h3>Hyperstore</h3>
                <div className={"panel-nav-group"}>
            <a href="#" onClick={this.handleClick.bind(that,'data')}>
                <i className="fa fa-cloud fa-md" />
                Data
            </a>
            <a href="#" onClick={this.handleClick.bind(that,'emails')}>
                <i className="fa fa-inbox fa-md" />
                Emails
            </a>
            <a href="#" onClick={this.handleClick.bind(that,'settings')}>
                <i className="fa fa-cog fa-md" />
                Settings
            </a>
            <a href="#" onClick={this.handleClick.bind(that,'security')}>
                <i className="fa fa-lock fa-md" />
                Security
            </a>
                </div>
                <h3>Logger</h3>
                <div className={"panel-nav-group"}>
            <a href="#" onClick={this.handleClick.bind(that,'logs')}>
                <i className="fa fa-list-alt fa-md" />
                Logs
            </a>
                </div>


                </div>
            </div>
        );
    }
});

Panel.TopBar = React.createClass ({
    handleClick:function(page) {
        this.props.setPage({section:page});
    },
    render:function () {
        var that = this;
        return(
                <nav id="panel-navbar" className="navbar-fixed-top" role="navigation">
                <div className={"container-fluid panel-main"}>
                <div className={"row no-gutters"}>
                <div className={"panel-top-bar-container"}>
                <div className={"col-xs-2 panel-top-logo"}>
                <a href="#" onClick={this.handleClick.bind(that,'dashboard')}>
                <img className={"panel-logo-xs visible-xs visible-sm"} src={"./src/img/logo-eng-white-xs.png"}></img>
                <img className={"panel-logo visible-md visible-lg"}
                 src={"./src/img/logo-eng-white.png"}></img>
                </a>
                </div>
                <div className={"panel-top-bar"}>
                <div className={"col-xs-8"}
                 style={{"padding-left":"15px","padding-right":"15px"}}
                 >

                <input type="" className="panel-search"
                 id="panel-omnibar" placeholder={"I'm the Commander Omnibar, "
                 + "how can I help?"} />

                </div>
                <div className={"col-xs-2 panel-user-status-container"}>
                <Panel.UserStatusBar />
                </div>
                </div>
                </div>
                </div>
                </div>
                </nav>
        );
    }
});

Panel.DataRightBar = React.createClass({
    handleClick:function(collection) {

        this.props.setPage({
            section:'data',
            data:{
                collection:collection,
                limit:100
            }
        });
        Panel.setOmnibar('Data/'+collection);
    },
    getInitialState:function () {
        return {loading:true};
    },
    componentDidMount:function () {

        Hyperstore.apps[window.activeApp].hyperyunCollections.find({},function(a,b){
            var collections = collectionList = _.uniq(_.pluck(a,'name'));
            this.setState({collections:collections,loading:false});
        }.bind(this));

    },
    render: function(){
        var that = this;
        if (this.state.loading) {
            return <span>Loading... </span>;
        }
        else if (!this.state.loading && this.state.collections) {
            var renderList = [];
            _.each(this.state.collections ,function(e,i,l) {
                renderList.push(<a collection={e} onClick={that.handleClick.bind(that,e)}
href="#" className={'panel-data-collection'}>{e}</a>);
            });

            return (
                    <div className={'panel-data-collections'}>
                    {renderList}
                    </div>
            );
        }

    }
});

Panel.UserStatusBar = React.createClass({
    getInitialState:function(){
        return {loggedIn:false,loading:true};
    },
    componentDidUpdate: function(prevProp,prevState){
        var self = this;

    },
    componentDidMount:function(){
        var self = this;
        Hyperstore.apps[window.selectedApp].getUser(function(user){
            console.log('GET USER FIRED!!!1');
            window.debuglol=arguments;
            if(user) {
                    self.setState({loggedIn:true,user:user,loading:false});
            } else {
                self.setState({loggedIn:false,loading:false});
            }
        });
    },
    onMouseOver:function() {
        this.setState({dropdown: true});
    },
    render:function() {
        if(!this.state.loggedIn && (!this.state.loading)){
            console.log(this.state);
            return (
                    <div onMouseOver={this.onMouseOver} className={"panel-user-status"}>

                    <div >
                    <a href={"#"}>
                    <span className={"hidden-xs hidden-s"}>EERROR#1337</span>
                    <i className="fa fa-chevron-down fa-lg" />
                    </a>
                    </div>

                    <div className={"panel-user-status"} style={{position:"relative",top:"50px"}} >
                    <a href={"#"}>
                    <span className={"hidden-xs hidden-s"}>{"Logout"}</span>
                    </a>
                    </div>

                    </div>
            );
        }
        else if(!this.state.loggedIn && this.state.loading) {
            return (
                    <div onMouseOver={this.onMouseOver} className={"panel-user-status"}>
                    <a href={"#"}>
                    <span className={"hidden-xs hidden-s"}>LOADING..</span>
                    <i className="fa fa-chevron-down fa-lg" />
                    </a>
                    </div>
            );
        }
        else{
            var avatar = "";
            if(this.state.user.profile){
                avatar = this.state.user.profile.avatar ?
                    this.state.user.profile.avatar :
                    "http://www.gravatar.com/avatar/"+this.state.user._id+"?d=identicon";
            }
            else {
                avatar = "http://www.gravatar.com/avatar/"+this.state.user._id+"?d=identicon";
            }

            if (this.state.dropdown) {
                return (

                        <div onMouseOver={this.onMouseOver} className={"panel-user-status"}>
                        <a href={"#"}>
                        <span className={"hidden-xs hidden-s"}>{this.state.user.emails[0]}</span>
                        <i className="fa fa-chevron-down fa-lg" />
                        </a>

                        <a href={"#"} style={{position:"relative",top:"50px"}} >
                        <span className={"hidden-xs hidden-s"}>{"Logout"}</span>
                        </a>

                        </div>
                );
            }
            else {
            return (
                    <div onMouseOver={this.onMouseOver} className={"panel-user-status"}>
                    <a href={"#"}>
                    <span className={"hidden-xs hidden-s"}>{this.state.user.emails[0]}</span>
                    <i className="fa fa-chevron-down fa-lg" />
                    </a>
                    </div>
            );
            }

        }
    }
});


Panel.Concurrents = React.createClass({
    componentDidMount:function(){
        var lineChartData = [
            {
                label: "Layer 1",
                values: [ {time: (new Date).getTime(), y: 1}]
            },
        ];
        var chart = $('#lineChart').epoch({
            type: 'time.line',
            data: lineChartData,
            fps: 24,
            queueSize: 1,
            axes: ['left']
        });

        Hyperstore.initialize(window.activeApp ,['hyperyunConnections'],{server:window.targetServer});
        Hyperstore.apps[window.activeApp].hyperyunConnections.find({},function(conns,err){
            $("#panel-conns-number").text(conns.length);
            console.error("HEHEHEHEHEHE FIRING");
            if(this.interval) {
                clearInterval(this.interval);
            }
            this.interval = setInterval(function() {
                chart.push([{"time":(new Date).getTime(),"y":conns.length}]);
            }, 1000);
        }.bind(this));

    },
    render:function() {
        return                 (
            <div>
                <span id="panel-conns-number"></span>
                <div id="lineChart" className="epoch"></div>
            </div>
          );
    }
});

Panel.Map = React.createClass({
    getInitialState:function(){
        return {};
    },
    componentDidUpdate: function(prevProp,prevState){

    },
    componentDidMount:function(){


        window.markers = new L.MarkerClusterGroup({
            spiderfyDistanceMultiplier: 100,
            maxClusterRadius: 20
        });
        window.map = L.map('map',{minZoom:2}).setView([0, 21.09375], 2);
        window.map.setMaxBounds(L.latLngBounds([85, -180],[-85, 180]));
        L.tileLayer('https://{s}.tiles.mapbox.com/v3/auganov.19ea765d/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(window.map);


        Hyperstore.apps[window.activeApp].hyperyunConnections.find({},function(conns,err){
            markers.removeLayers(markers.getLayers());
            async.map(_.pluck(conns,'ip'), getGeo, function(err, results){

                console.log(err,results);
                _.forEach(results,function(e,i,l){
                    var marker = L.circle([e.lat, e.lng],50,
                                         {
                                             fill:"#ffffff",
                                             fillColor:"#ffffff",
                                             color:"#ffffff",
                                             fillOpacity:1,
                                             opacity:1
                                         });
                    marker.bindPopup(
                        L.popup(
                            {offset:L.point(0,0),
                             autoPanPadding:L.point(0,0)
                            })
                            .setContent("<p>Connection info<br/>Ip: " +
                                        e.ip + "<br/>City: " + e.city_name
                                        + "</p>")
                    );
                    markers.addLayer(marker);
                    window.map.addLayer(markers);
                    // marker.addTo(window.map);
                    console.log("ADDING MARKET"+e.lat);
                });
            });
        });

    },
    render:function() {
        return   <div id="map" className="leaflet-container leaflet-touch leaflet-fade-anim" tabindex="0">
  </div>;
    }
});


Panel.setOmnibar= function (state){
    $('#panel-omnibar').val(state);
};


var IP2Decimal = function (ip) {
    var ipSyntax = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, ipArr, i = 4, decVal = 0;

    if (ipSyntax.test(ip)) {
        ipArr = ip.split(".");

        while (i--) {
            if (ipArr[i] > 255) {
                throw new Error("Invalid IP Address");
            } else {
                decVal += Math.pow(2, (8 * i)) * ipArr[3 - i];
            }
        }

        return decVal;
    } else {
        throw new Error("Invalid IP Address");
    }
};

var getGeo = function (ip,callback) {
    var num = IP2Decimal(ip);
    var zerobin = ["0","0","0","0","0","0","0","0"];
    var numbin = num.toString(2);
    Hyperstore.apps.geoip.blocks.findOne(     {"start":Number.parseInt(_.flatten([_.first(numbin,numbin.length-8), zerobin]).join(""),2)}
        ,function(resa,err){
            if(err) callback(err);
            Hyperstore.apps.geoip.locations.findOne({geo_ip:resa.geoid},function(resb,errb){
                callback(errb,_.extend(resa,{ip:ip},resb));
            });

    });
};

//Mutative stuff
Panel.init = function(){

    window.userContextActive=false;

    // var userStatusCssPath="#panel-navbar > div > div > div > div.panel-top-bar > div.col-xs-2.panel-user-status-container";

    //     var width = $(userStatusCssPath).width();
    //     var height = $(userStatusCssPath).height();
    //     var pos = $('#panel-navbar > div > div > div > div.panel-top-bar > div.col-xs-2.panel-user-status-container').position();
    //     var top = pos.top;
    //     var left = pos.left;

    //     var panelUserStatus = '<div class="panel-user-status user-status-context-menu" style="position:absolute;color:white;height:100px;width:320px;z-index:101000;left:1597px;top:55px">Settings; Logout</div>';

    //     $(userStatusCssPath).mouseover(function(){
    //         if (window.userContextActive==false){
    //             $('body').prepend();

    //             $('body').prepend('<div class="user-status-context-menu-overlay" style="position:absolute;height:155px;width:320px;z-index:1000000;opacity:100%;left:1597px;top:0px"></div>');

    //             $('.user-status-context-menu-overlay').mouseout(function(){
    //                 $('.user-status-context-menu').remove();
    //                 $('.user-status-context-menu-overlay').remove();
    //                 window.userContextActive=false;
    //             });
    //             window.userContextActive=true;
    //         }
    //     });




    $(".panel-sidebar-quickfix").width($(".panel-top-logo").width());
    window.onresize = function(){
        $(".panel-sidebar-quickfix").width($(".panel-top-logo").width());
    };

};

module.exports = Panel;
