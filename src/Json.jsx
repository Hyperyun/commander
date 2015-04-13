/** @jsx React.DOM */

/*global clearInterval: false, clearTimeout: false, document: false, event:
 * false, frames: false, history: false, Image: false, location: false, name:
 * false, navigator: false, Option: false, parent: false, screen: false,
 * setInterval: false, setTimeout: false, window: false, XMLHttpRequest: false
 * Hyperstore:false , React: false, module: false, require: false, renderList: false,  _: false, Profile: false,
 * Router : false, Panel : false , xiupinHistory: false,
 * ResponsiveBootstrapToolkit: false*/
var React = require('react');
//     keymaster.js
//     (c) 2011-2013 Thomas Fuchs
//     keymaster.js may be freely distributed under the MIT license


(function(global){
    var k,
    _handlers = {},
    _mods = { 16: false, 18: false, 17: false, 91: false },
    _scope = 'all',
    // modifier keys
    _MODIFIERS = {
      '⇧': 16, shift: 16,
      '⌥': 18, alt: 18, option: 18,
      '⌃': 17, ctrl: 17, control: 17,
      '⌘': 91, command: 91
    },
    // special keys
    _MAP = {
      backspace: 8, tab: 9, clear: 12,
      enter: 13, 'return': 13,
      esc: 27, escape: 27, space: 32,
      left: 37, up: 38,
      right: 39, down: 40,
      del: 46, 'delete': 46,
      home: 36, end: 35,
      pageup: 33, pagedown: 34,
      ',': 188, '.': 190, '/': 191,
      '`': 192, '-': 189, '=': 187,
      ';': 186, '\'': 222,
      '[': 219, ']': 221, '\\': 220
    },
    code = function(x){
      return _MAP[x] || x.toUpperCase().charCodeAt(0);
    },
    _downKeys = [];

  for(k=1;k<20;k++) _MAP['f'+k] = 111+k;

  // IE doesn't support Array#indexOf, so have a simple replacement
  function index(array, item){
    var i = array.length;
    while(i--) if(array[i]===item) return i;
    return -1;
  }

  // for comparing mods before unassignment
  function compareArray(a1, a2) {
    if (a1.length != a2.length) return false;
    for (var i = 0; i < a1.length; i++) {
        if (a1[i] !== a2[i]) return false;
    }
    return true;
  }

      var modifierMap = {
      16:'shiftKey',
      18:'altKey',
      17:'ctrlKey',
      91:'metaKey'
  };
  function updateModifierKey(event) {
      for(k in _mods) _mods[k] = event[modifierMap[k]];
  };

  // handle keydown event
  function dispatch(event) {
    var key, handler, k, i, modifiersMatch, scope;
    key = event.keyCode;

    if (index(_downKeys, key) == -1) {
        _downKeys.push(key);
    }

    // if a modifier key, set the key.<modifierkeyname> property to true and return
    if(key == 93 || key == 224) key = 91; // right command on webkit, command on Gecko
    if(key in _mods) {
      _mods[key] = true;
      // 'assignKey' from inside this closure is exported to window.key
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = true;
      return;
    }
    updateModifierKey(event);

    // see if we need to ignore the keypress (filter() can can be overridden)
    // by default ignore key presses if a select, textarea, or input is focused
    if(!assignKey.filter.call(this, event)) return;

    // abort if no potentially matching shortcuts found
    if (!(key in _handlers)) return;

    scope = getScope();

    // for each potential shortcut
    for (i = 0; i < _handlers[key].length; i++) {
      handler = _handlers[key][i];

      // see if it's in the current scope
      if(handler.scope == scope || handler.scope == 'all'){
        // check if modifiers match if any
        modifiersMatch = handler.mods.length > 0;
        for(k in _mods)
          if((!_mods[k] && index(handler.mods, +k) > -1) ||
            (_mods[k] && index(handler.mods, +k) == -1)) modifiersMatch = false;
        // call the handler and stop the event if neccessary
        if((handler.mods.length == 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch){
          if(handler.method(event, handler)===false){
            if(event.preventDefault) event.preventDefault();
              else event.returnValue = false;
            if(event.stopPropagation) event.stopPropagation();
            if(event.cancelBubble) event.cancelBubble = true;
          }
        }
      }
    }
  };

  // unset modifier keys on keyup
  function clearModifier(event){
    var key = event.keyCode, k,
        i = index(_downKeys, key);

    // remove key from _downKeys
    if (i >= 0) {
        _downKeys.splice(i, 1);
    }

    if(key == 93 || key == 224) key = 91;
    if(key in _mods) {
      _mods[key] = false;
      for(k in _MODIFIERS) if(_MODIFIERS[k] == key) assignKey[k] = false;
    }
  };

  function resetModifiers() {
    for(k in _mods) _mods[k] = false;
    for(k in _MODIFIERS) assignKey[k] = false;
  };

  // parse and assign shortcut
  function assignKey(key, scope, method){
    var keys, mods;
    keys = getKeys(key);
    if (method === undefined) {
      method = scope;
      scope = 'all';
    }

    // for each shortcut
    for (var i = 0; i < keys.length; i++) {
      // set modifier keys if any
      mods = [];
      key = keys[i].split('+');
      if (key.length > 1){
        mods = getMods(key);
        key = [key[key.length-1]];
      }
      // convert to keycode and...
      key = key[0]
      key = code(key);
      // ...store handler
      if (!(key in _handlers)) _handlers[key] = [];
      _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods });
    }
  };

  // unbind all handlers for given key in current scope
  function unbindKey(key, scope) {
    var multipleKeys, keys,
      mods = [],
      i, j, obj;

    multipleKeys = getKeys(key);

    for (j = 0; j < multipleKeys.length; j++) {
      keys = multipleKeys[j].split('+');

      if (keys.length > 1) {
        mods = getMods(keys);
      }

      key = keys[keys.length - 1];
      key = code(key);

      if (scope === undefined) {
        scope = getScope();
      }
      if (!_handlers[key]) {
        return;
      }
      for (i = 0; i < _handlers[key].length; i++) {
        obj = _handlers[key][i];
        // only clear handlers if correct scope and mods match
        if (obj.scope === scope && compareArray(obj.mods, mods)) {
          _handlers[key][i] = {};
        }
      }
    }
  };

  // Returns true if the key with code 'keyCode' is currently down
  // Converts strings into key codes.
  function isPressed(keyCode) {
      if (typeof(keyCode)=='string') {
        keyCode = code(keyCode);
      }
      return index(_downKeys, keyCode) != -1;
  }

  function getPressedKeyCodes() {
      return _downKeys.slice(0);
  }

  function filter(event){
    var tagName = (event.target || event.srcElement).tagName;
    // ignore keypressed in any elements that support keyboard data input
    return !(tagName == 'INPUT' || tagName == 'SELECT' || tagName == 'TEXTAREA');
  }

  // initialize key.<modifier> to false
  for(k in _MODIFIERS) assignKey[k] = false;

  // set current scope (default 'all')
  function setScope(scope){ _scope = scope || 'all' };
  function getScope(){ return _scope || 'all' };

  // delete all handlers for a given scope
  function deleteScope(scope){
    var key, handlers, i;

    for (key in _handlers) {
      handlers = _handlers[key];
      for (i = 0; i < handlers.length; ) {
        if (handlers[i].scope === scope) handlers.splice(i, 1);
        else i++;
      }
    }
  };

  // abstract key logic for assign and unassign
  function getKeys(key) {
    var keys;
    key = key.replace(/\s/g, '');
    keys = key.split(',');
    if ((keys[keys.length - 1]) == '') {
      keys[keys.length - 2] += ',';
    }
    return keys;
  }

  // abstract mods logic for assign and unassign
  function getMods(key) {
    var mods = key.slice(0, key.length - 1);
    for (var mi = 0; mi < mods.length; mi++)
    mods[mi] = _MODIFIERS[mods[mi]];
    return mods;
  }

  // cross-browser events
  function addEvent(object, event, method) {
    if (object.addEventListener)
      object.addEventListener(event, method, false);
    else if(object.attachEvent)
      object.attachEvent('on'+event, function(){ method(window.event) });
  };

  // set the handlers globally on document
  addEvent(document, 'keydown', function(event) { dispatch(event) }); // Passing _scope to a callback to ensure it remains the same by execution. Fixes #48
  addEvent(document, 'keyup', clearModifier);

  // reset modifiers to false whenever the window is (re)focused.
  addEvent(window, 'focus', resetModifiers);

  // store previously defined key
  var previousKey = global.key;

  // restore previously defined key and return reference to our key object
  function noConflict() {
    var k = global.key;
    global.key = previousKey;
    return k;
  }

  // set window.key and window.key.set/get/deleteScope, and the default filter
  global.key = assignKey;
  global.key.setScope = setScope;
  global.key.getScope = getScope;
  global.key.deleteScope = deleteScope;
  global.key.filter = filter;
  global.key.isPressed = isPressed;
  global.key.getPressedKeyCodes = getPressedKeyCodes;
  global.key.noConflict = noConflict;
  global.key.unbind = unbindKey;

  if(typeof module !== 'undefined') module.exports = assignKey;

})(this);

var JsonEditor = {};

key('left',function(){
    JsonEditor.left();
});
key('right',function(){
    JsonEditor.right();
});
key('up',function(){
    JsonEditor.up();
});
key('down',function(){
    JsonEditor.down();
});

key('enter',function(e,h){
    JsonEditor.enter(e,h);
});

JsonEditor.left = function(){
    console.log('Pressed left');
};
JsonEditor.right = function(){
        console.log('Pressed right');
};
JsonEditor.up = function(){
        console.log('Pressed up');
};
JsonEditor.down = function(){
        console.log('Pressed down');
};

JsonEditor.enter = function(e){
    console.log(e,this);
    e.preventDefault();
        console.log('Pressed enter');
    if(JsonEditor.editorState.selectedThingReact.props.value) {
        try {
            var value = JSON.parse(JsonEditor.editorState.selectedThing.textContent);
        }
        catch (err) {
            alert(err);
            return 'error';
        }
        finally {
            if (value != JsonEditor.editorState.selectedThingReact.props.value)
            {
                var paths = JsonEditor.editorState.selectedThingReact.props.path.split('.');
                var collection = paths[0];
                var id = paths[1];
                var updateTarget = "";
                paths.splice(0,2);

                _.each(paths,function(e,i,l){
                    if (i!=paths.length-1){
                        updateTarget=updateTarget+e+".";
                    }
                    else
                    {
                        updateTarget=updateTarget+e;
                    }
                });
                var op = {};
                var keyval = {};
                keyval[updateTarget]=value;
                console.log(value);
                op["$set"] = keyval;
                Hyperstore.apps[window.activeApp][collection].update({"_id":id},op);
                JsonEditor.setEditability(JsonEditor.editorState.selectedThingReact,
                                         true);
            }
        }
    }
    else if(JsonEditor.editorState.selectedThingReact.props.key) {
        try {
            var key = JSON.parse('"'+JsonEditor.editorState.selectedThing.textContent+'"');
        }
        catch (err) {
            alert(err);
            return 'error';
        }
        finally {
            if (key != JsonEditor.editorState.selectedThingReact.props.key)
            {
                var paths = JsonEditor.editorState.selectedThingReact.props.path.split('.');
                var collection = paths[0];
                var id = paths[1];
                var updateTarget = "";
                paths.splice(0,2);

                _.each(paths,function(e,i,l){
                    if (i!=paths.length-1){
                        updateTarget=updateTarget+e+".";
                    }
                    else
                    {
                        updateTarget=updateTarget+e;
                    }
                });
                var op = {};
                var keyval = {};
                keyval[updateTarget]=key;
                console.log(key);
                op["$rename"] = keyval;
                Hyperstore.apps[window.activeApp][collection].update({"_id":id},op);
                JsonEditor.setEditability(JsonEditor.editorState.selectedThingReact,
                                         true);
            }
        }
    }
};

// JsonEditor.editorStates = [];

// JsonEditor.editorStates.push({
//     location: "f48109284021840921",
//     action: "looking"
// });


JsonEditor.editorState = {
    selectedThing: undefined,
    selectedThingReact: undefined
};


JsonEditor.newState = function (input){

};


JsonEditor.stringHighlight = function (json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

JsonEditor.testJson = {
    _id:"f48109284021840921",
    createdAt:"41421414k1",
    modifiedAt:"414214141llll",
    title:"A sample product lolllllllllll",
    boolean: true,
    number: 1234,
    desc:"A boring sample description",
    commentz:["haha","haha","haha",{hehe:"lol"},[1,2,['lllll','ziom',{wtf:'hehe'}],4,5,6],"haha"],
    lol:"hehehehe!",
    sampleObj:{lol:'hehe',array:[1,2,3],hehe:"lamersko"}
};

JsonEditor.JsonTest = React.createClass({
  render: function() {
    return (
            <div className='main'>
            <Masthead title="JSON EDITOR">
            Hope you love it.
            </Masthead>
            <div className={"container"}>
            <Json/>
            </div>
            </div>
    );
  }
});

JsonEditor.submitEdits = function(element) {

};

JsonEditor.setEditability = function (reactElement, disable) {
    var element = reactElement.getDOMNode();
    if(disable) {
        var el = JsonEditor.editorState.selectedThing;
        $(el).removeClass('jsoneditor-json-key-selected');
        $(el).attr('contenteditable','false');
        JsonEditor.editorState.selectedThing = undefined;
        JsonEditor.editorState.selectedThingReact = undefined;
        return;
    }

      console.log('A key got clicked',typeof $(element).attr('contenteditable'));
    if (JsonEditor.editorState.selectedThing == element) {
                console.log('already selected, returning null');
                return;
            }
            if (JsonEditor.editorState.selectedThing) {
                console.log('Removing old selection');
                var el = JsonEditor.editorState.selectedThing;
                $(el).removeClass('jsoneditor-json-key-selected');
                $(el).attr('contenteditable','false');
            }

            if ($(element).attr('contenteditable') == "false" ||
                $(element).attr('contenteditable') == null ||
                $(element).attr('contenteditable') == undefined) {

                console.log('Not editable, setting all the stuff!');
                JsonEditor.editorState.selectedThing = element;
                JsonEditor.editorState.selectedThingReact = reactElement;
                $(element).addClass('jsoneditor-json-key-selected');
                $(element).attr('contenteditable','true');
                $(element).attr('spellcheck','false');
                var range = document.createRange();
                var sel = window.getSelection();
                range.setStart(element.childNodes[0], 0);
                range.setEnd(element.childNodes[0], 0);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                element.focus();
            }
};
JsonEditor.JsonKey = React.createClass({
    handleClick: function(e){
        JsonEditor.setEditability(this);

    },
    render: function(){
        return <div onClick={this.handleClick} className={"jsoneditor-json jsoneditor-key"}>{this.props.key}</div>;
    }
});

JsonEditor.renderKeyValPair = function (json,type) {

};

var toType  = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}

JsonEditor.JsonValue = React.createClass({
    render:function(){
        switch (toType(this.props.value)) {
        case "object":
            return <JsonEditor.JsonObjectShort value={this.props.value} path={this.props.path}/>;
            break;
        case "number":
            return <JsonEditor.JsonNumber value={this.props.value} path={this.props.path}/>;
            break;
        case "string":
            return <JsonEditor.JsonString value={this.props.value} path={this.props.path}/>;
            break;
        case "array":
            return <JsonEditor.JsonArray value={this.props.value} path={this.props.path}/>;
            break;
        case "boolean":
            return <JsonEditor.JsonBoolean value={this.props.value} path={this.props.path}/>;
            break;
        case "null":
            return <JsonEditor.JsonNull json={this.props.value} path={this.props.path}/>;
            break;
        case "undefined":
            return <JsonEditor.JsonUndefined json={this.props.value} path={this.props.path}/>;
            break;
        case "function":
            return <JsonEditor.JsonFunction json={this.props.value} path={this.props.path}/>;
            break;
        case "date":
            return <JsonEditor.JsonFunction json={this.props.value.toString()} path={this.props.path}/>;
            break;
        }
    }
});

JsonEditor.JsonUndefined = React.createClass({
    render: function(){
        return <span>undef</span>;
    }
});

JsonEditor.JsonNull = React.createClass({
    render: function(){
        return <span>null</span>;
    }
});


      JsonEditor.JsonObjectShort = React.createClass({
          getInitialState:function() {
              return {fold:true};
          },
          handleClick:function(e) {
              this.setState({fold:false});
          },
          render: function(){
              var that = this;
              if(this.state.fold) {
                  return(
                          <span onClick={this.handleClick} className={"jsoneditor-json jsoneditor-arrayshort jsoneditor-value jsoneditor-array"}>Object[{_.size(this.props.value)}]
                          </span>
                  );
              }
              else if (!this.state.fold) {
                  return(
                          <JsonEditor.JsonObject onClick={this.handleClick}  value={this.props.value}
                           type={"full"}  path={that.props.path}/>
                  );
              }
              else {
                  return null;
              }
          }
      });

      JsonEditor.JsonArray = React.createClass({
          getInitialState:function() {
              return {fold:true};
          },
          handleClick:function() {
              this.setState({fold:false});
          },
          render: function(){
              var that = this;
              if(this.state.fold) {
                  return(
                          <span onClick={this.handleClick} className={"jsoneditor-json jsoneditor-arrayshort jsoneditor-value jsoneditor-array"}>
                          {_.isEmpty(this.props.value) ? "[Empty]" : "Array[" +
                           this.props.value.length + "]" }
                          </span>
                  );
              }
              else if (!this.state.fold) {
                  return(
                          <JsonEditor.JsonArrayObj path={that.props.path} onClick={this.handleClick} value={this.props.value} type={"full"} />
                  );
              }
              else {
                  return null;
              }
          }
      });

JsonEditor.JsonArrayObj = React.createClass({
    componentDidMount: function(){

    },
    render: function(){
        var that = this;
        window. renderList = [<JsonEditor.JsonDelimiter parent={that} string={"["} />];
        var length = _.size(this.props.value);
        _.each(this.props.value,function(e,i,l){
            if(i!=(length-1)) {
            renderList.push(
                    <br />,
                JsonEditor.JsonKeyValPair({key:i,value:e,path:that.props.path},"inline"),
                    <span className={""}>{","}</span>
            );
            }
            else {
                renderList.push(
                        <br />,
                    JsonEditor.JsonKeyValPair({key:i,value:e,path:that.props.path},"inline")
                );
            }

        });
        renderList.push(<JsonEditor.JsonDelimiter parent={that} string={"]"} />);
        return(
                <span className={"jsoneditor-jsonarray--inline"}>
                {renderList}
            </span>
        );
    }
});

// JsonEditor.JsonArrayInline = React.createClass({
//     render: function(){
//             return(
//                     <span>
//                     <JsonEditor.JsonKey key={this.props.json.key}/>
//                     <div className={"jsoneditor-json jsoneditor-colon"}>:</div>
//                     <div className={"jsoneditor-json jsoneditor-value jsoneditor-array"}>[{JSON.stringify( this.props.json.value)}]</div>
//                     <div className={"jsoneditor-json"}>,</div>
//                     </span>
//             );

//     }
// });

JsonEditor.JsonBoolean = React.createClass({
    render: function(){
        return <span className={"jsoneditor-boolean"}>{this.props.value.toString()}</span>;
    }
});

JsonEditor.JsonNumber = React.createClass({
    handleClick: function(e){
        JsonEditor.setEditability(this);
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        if(nextProps.value != this.props.value) {
            return true;
        } else {
            return false;
        }
    },
    componentDidUpdate: function (){
  //      $(this.getDOMNode()).velocity("fadeIn", { duration: 1500 });
    },
    render: function(){
        return <span onClick={this.handleClick} className={"jsoneditor-number"}>{this.props.value}</span>;
    }
});

JsonEditor.JsonString = React.createClass({
    handleClick: function(e){
        JsonEditor.setEditability(this);
    },
    shouldComponentUpdate: function(nextProps, nextState) {
        if(nextProps.value != this.props.value) {
            return true;
        } else {
            return false;
        }
    },
    componentDidUpdate: function (){
//        $(this.getDOMNode()).velocity("fadeIn", { duration: 1500 });
    },
    render: function(){
        return(
                <span onClick={this.handleClick} className={"jsoneditor-json jsoneditor-value jsoneditor-string"}>"{this.props.value}"</span>

        );

    }
});

JsonEditor.JsonKeyValPair = React.createClass({
    handleClick: function(e){

        Panel.setOmnibar("Data/"+this.props.path+"."+this.props.key);


    },
    render:function () {
        return     (
                <span className={"jsoneditor-keyvalpair"} onClick={this.handleClick}>
                <JsonEditor.JsonKey key={this.props.key} path={this.props.path+'.'+this.props.key} />
                <div className={"jsoneditor-json jsoneditor-colon"}>:</div>
                <JsonEditor.JsonValue value={this.props.value} path={this.props.path+'.'+this.props.key} />
                </span>
        );
    }
});

JsonEditor.JsonFunction = React.createClass({
    render: function(){
        return <span>fun</span>;
    }
});

JsonEditor.JsonDelimiter = React.createClass({
    handleClick: function(e) {

        JsonEditor.setEditability(this.props.parent);
        Panel.setOmnibar("Data/"+this.props.parent.props.path);
    },
    render: function(){
        return <span onClick={this.handleClick} className={"jsoneditor-json"}>{this.props.string}</span>;
    }
});

window.counter=0;

JsonEditor.JsonObject = React.createClass({
    handleClick: function(val){
        console.log("clicked", val, this.props.path);
        val.stopPropagation();

        $(this.getDOMNode()).removeClass('jsoneditor-jsonobject--inline');
        $(this.getDOMNode()).addClass('jsoneditor-jsonobject--expanded');

        if(this.props.path) {
            Panel.setOmnibar("Data/"+this.props.path);
        } else {
            Panel.setOmnibar("Data/"+this.props.collection+"."+this.props.id);
        }
    },
    deleteObj: function(e){
        e.stopPropagation();
        var that = this;
        var paths = that.props.path.split('.');
        var collection = paths[0];
        var id = paths[1];
        Hyperstore.apps[window.activeApp][collection].remove({"_id":id}, function(){
            Panel.setOmnibar("Data/"+that.props.collection);
            console.log('done');
        });
    },
    getInitialState: function () {
        if(this.props.value){
            return{loading:false,json:this.props.value};
        }
        return{loading:true};
    },
    componentDidMount: function(){
        var that = this;
        if(this.props.root) $(this.getDOMNode()).velocity("fadeIn", { duration:
                                                                      1500 });
        if(this.props.value){
            this.setState({loading:false,json:this.props.value});
            return;
        }

        if(this.props.root && this.props.id) {
            console.log("querying for ", window.activeApp, this.props.collection, this.props.id);
            that.props.find = Hyperstore.apps[window.activeApp][this.props.collection].findOne({"_id":this.props.id},function (doc,err) {
                console.log("LOL REACTIVE TOO MUCH ?", window.counter++);
                if (err) alert(err);

                else if (doc) {
                    this.setState({loading:false,json:doc});
                }
                else {
                    this.setState({null:true});
                }
            }.bind(this));
        }

    },
    componentWillReceiveProps: function(nextProps) {
        var that = this;
        if(this.props.value || nextProps.value) {
            this.setState({loading:false,json:nextProps.value});
            return;
        }
        if(nextProps.collection != this.props.collection || nextProps.id != this.props.id) {
            this.setState({loading:true});
            if (that.props.find) that.props.find.close();
            that.props.find = Hyperstore.apps[window.activeApp][nextProps.collection].findOne({"_id":nextProps.id},function (doc,err) {
                console.log("LOL REACTIVE TOO MUCH ?", window.counter++);
                if (err) alert(err);

                else if (doc) {
                    this.setState({loading:false,json:doc});
                }
                else {
                    this.setState({null:true});
                }
            }.bind(this));
        }
    },
    render: function(){
        var that = this;
        if(this.state.null) {return <span>"object deleted"</span>;}
        if (this.state.loading && this.props.root) {
            return <span>Loading Object {this.props.id}...</span>;
        }
        else if (this.props.root && this.state.json) {
            window. renderList = [<JsonEditor.JsonDelimiter parent={that} string={"{"} />];
            var length = _.size(this.state.json);
            that.props.path = that.props.collection+"."+that.props.id;
            _.each(this.state.json,function(e,i,l){
                if(i != "_doc") {
                    renderList.push(<br/>,JsonEditor.JsonKeyValPair({key:i,value:e,path:that.props.collection+"."+that.props.id},"inline"),<span
                                                                                               className={""}>{","}</span>);
                }
            });

            renderList.pop();
            renderList.push(<JsonEditor.JsonDelimiter parent={that} string={"}"} />);
            return(
                    <span onClick={that.handleClick} onMouseOver={that.handleMouseOver}
                     className={"jsoneditor-jsonobject--inline"
                                + " jsoneditor-jsonobject--root"}>
                <a className="jsoneditor-deleteobj" href="#"><i onClick={this.deleteObj} className="fa fa-trash fa-md jsoneditor-deleteobj" /></a>
                    {renderList}
                </span>
            );
        }
        window. renderList = [<JsonEditor.JsonDelimiter parent={that} string={"{"} />];
        var length = _.size(this.props.value);
        _.each(this.props.value,function(e,i,l){
            if(i != "_doc") {
            renderList.push(<br/>,JsonEditor.JsonKeyValPair({key:i,value:e,path:that.props.path},"inline"),<span
                                                                                       className={""}>{","}</span>);
                }
        });

        renderList.pop();
        renderList.push(<JsonEditor.JsonDelimiter parent={that} string={"}"} />);
        return(
                <span onClick={that.handleClick}
                 onMouseOver={that.handleMouseOver} className={"jsoneditor-jsonobject--inline"}>
                {renderList}
            </span>
        );
    }
});

JsonEditor.JsonView = React.createClass ({
    getInitialState: function () {
        var that = this;
        that.find = Hyperstore.apps[window.activeApp][this.props.collection].find({},{limit:this.props.limit,reactive:true,sort:{createdAt:-1}},function(objects,err){
            console.log('LOOOOL OMG');
            if (err) {
                alert(JSON.stringify(err));
            }
            that.setState({loading:false,objects:objects});
        });
        return {loading:true};

    },
    componentWillReceiveProps: function(nextProps) {
       var that = this;
        if(nextProps.collection != this.props.collection) {
            this.limit = nextProps.limit;
            this.setState({loading:true});
           if (that.find) that.find.close();
            that.find = Hyperstore.apps[window.activeApp][nextProps.collection].find({},{limit:nextProps.limit,reactive:true,sort:{createdAt:-1}},function(objects,err){

                if (err) {
                    alert(JSON.stringify(err));
                }
                that.setState({loading:false,objects:objects});
            });
        }
    },
    componentDidUpdate: function() {
        $(window).scroll(this.handleScroll);
    },
    infiniteLoadLock: false,
    handleScroll: function() {
        var that = this;

        if(this.loadMore && $(window).scrollTop() + $(window).height() + 30 >=
            $(document).height() && this.infiniteLoadLock == false &&
            this.state.loading == false) {
        this.infiniteLoadLock = true;
        if(this.limit) {
            this.limit = this.limit+50;
        }
        else {
            this.limit = this.props.limit + 50;
        }

        this.find.close();
        this.find = Hyperstore.apps[window.activeApp][this.props.collection].find({},{limit:this.limit,reactive:true,sort:{createdAt:-1}},function(objects,err){

            if (err) {
                alert(JSON.stringify(err));
            }
            that.setState({loading:false,objects:objects});
            that.infiniteLoadLock = false;
        });

     console.error('hehehe');
    }

    },
    render: function () {
        if(!this.limit) this.limit = this.props.limit;
        var that = this;
        console.log("Rendering JsonView",this.state.objects);
        if(this.state.loading) {
                return(
                        <div className={"jsoneditor-loadmore"}>
                        <a href="#">
                        Loading.....
                        </a>
                        </div>
                );
        }
        else if (this.state.objects) {
            var renderList=[];
            _.each(this.state.objects,function(e,i,l) {
                renderList.push(<JsonEditor.JsonObject
                                 collection={this.props.collection} value={e} id={e._id} root={true} />);
                renderList.push(<br/>);
            }.bind(this));
            if(this.state.objects.length == 0) {
                that.loadMore = false;
                return(
                        <div className={"jsoneditor-loadmore"}>
                        <a href="#">
                        <img src={window.publicPath + "/img/sadface.png"}></img>
                        This collection is empty.
                        </a>
                        </div>
                );
            }
            else if(this.limit > this.state.objects.length){
            that.loadMore = false;
            return(
                    <div>
                    {renderList}
                    <div className={"jsoneditor-loadmore"}>
                    <a href="#">
                    No more objects. You reached the end.
                </a>
                    </div>
                </div>
            );
        } else {
            that.loadMore = true;
            return (
                <div>
                {renderList}
                <div className={"jsoneditor-loadmore"}>
                <a href="#">
                Loading more objects...
            </a>
                </div>
                </div>
            );
        }
    }
        else {
            return<span>CRITICAL ERROR #4i32094u32</span>;
        }
    }
});



module.exports = JsonEditor;
